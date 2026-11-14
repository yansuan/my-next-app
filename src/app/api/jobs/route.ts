import { NextRequest, NextResponse } from "next/server";
import { MODELS_CATALOG, calculateJobCredits } from "@/lib/catalog/models";
import { createYirJob } from "@/lib/yir/client";
import {
  createSupabaseServiceClient,
  getAuthenticatedUser,
} from "@/lib/supabase/server";
import { getAdminStore } from "@/lib/admin/store";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in with Google." },
        { status: 401 }
      );
    }

    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json(
        {
          error:
            "Server billing service is not configured (missing SUPABASE_SERVICE_ROLE_KEY).",
        },
        { status: 503 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.status === "banned") {
      return NextResponse.json(
        { error: "Account suspended. Please contact support." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      toolSlug = "text-to-video",
      modelId = "seedance-2.5",
      prompt = "",
      resolution = "1080p",
      aspectRatio = "16:9",
      durationSec = 5,
      withAudio = true,
      inputType = "text",
      imageUrl,
      firstFrameUrl,
      lastFrameUrl,
      referenceUrls,
    } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Please enter a generation prompt." },
        { status: 400 }
      );
    }

    const modelSpec =
      MODELS_CATALOG.find((m) => m.id === modelId || m.yirModelId === modelId) ??
      MODELS_CATALOG[0];

    const safeDuration = Math.max(1, Math.min(60, Number(durationSec) || 5));
    const creditsCost = calculateJobCredits({
      modelId: modelSpec.id,
      resolution,
      durationSec: safeDuration,
      withAudio: Boolean(withAudio),
    });

    // Reserve credits atomically in Postgres before calling upstream Yir.ai
    const { data: supabaseJobUuid, error: rpcErr } = await supabase.rpc(
      "reserve_credits_for_job",
      {
        p_user_id: user.id,
        p_tool_slug: String(toolSlug),
        p_category: modelSpec.category,
        p_model_id: modelSpec.id,
        p_prompt: prompt.trim(),
        p_parameters: {
          resolution,
          aspectRatio,
          durationSec: safeDuration,
          withAudio: Boolean(withAudio),
        },
        p_credits_cost: creditsCost,
      }
    );

    if (rpcErr || !supabaseJobUuid) {
      return NextResponse.json(
        { error: rpcErr?.message || "Failed to reserve credits in Supabase." },
        { status: 402 }
      );
    }

    let yirJob;
    try {
      yirJob = await createYirJob({
        model: modelSpec.yirModelId,
        input: {
          type: inputType,
          prompt: prompt.trim(),
          image_url: imageUrl,
          first_frame_url: firstFrameUrl,
          last_frame_url: lastFrameUrl,
          reference_urls: referenceUrls,
        },
        parameters: {
          resolution,
          aspect_ratio: aspectRatio,
          duration: safeDuration,
          with_audio: Boolean(withAudio),
          n: 1,
        },
      });
    } catch (dispatchErr: unknown) {
      const dispatchMsg =
        dispatchErr instanceof Error
          ? dispatchErr.message
          : "Upstream generation dispatch failed";
      await supabase.rpc("finalize_job_credits", {
        p_job_id: supabaseJobUuid,
        p_final_status: "failed",
        p_source_url: null,
        p_r2_url: null,
        p_error: dispatchMsg,
      });
      throw dispatchErr;
    }

    await supabase
      .from("generation_jobs")
      .update({
        yir_job_id: yirJob.id,
        status: yirJob.status === "processing" ? "processing" : "queued",
        updated_at: new Date().toISOString(),
      })
      .eq("id", supabaseJobUuid);

    const store = getAdminStore();
    store.generations.unshift({
      id: String(supabaseJobUuid),
      upstreamJobId: yirJob.id,
      userEmail: user.email,
      toolSlug: String(toolSlug),
      category: modelSpec.category,
      modelId: modelSpec.id,
      modelName: modelSpec.name,
      prompt: prompt.trim(),
      resolution: `${resolution} · ${aspectRatio}`,
      durationSec: modelSpec.category === "video" ? safeDuration : undefined,
      creditsCost,
      status: yirJob.status === "processing" ? "processing" : "queued",
      latencySec: 0,
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
    });

    return NextResponse.json({
      jobId: supabaseJobUuid,
      yirJobId: yirJob.id,
      model: modelSpec.yirModelId,
      modelName: modelSpec.name,
      creditsCost,
      status: yirJob.status,
      simulated: yirJob.simulated ?? false,
      createdAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected generation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
