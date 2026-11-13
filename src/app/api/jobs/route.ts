import { NextRequest, NextResponse } from "next/server";
import { MODELS_CATALOG, calculateJobCredits } from "@/lib/catalog/models";
import { createYirJob } from "@/lib/yir/client";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
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
      userId,
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

    const creditsCost = calculateJobCredits({
      modelId: modelSpec.id,
      resolution,
      durationSec,
      withAudio,
    });

    // Optional: If Supabase service client + userId are configured, reserve credits atomically in Postgres
    let supabaseJobUuid: string | null = null;
    const supabase = createSupabaseServiceClient();
    if (supabase && userId) {
      const { data: rpcJobId, error: rpcErr } = await supabase.rpc(
        "reserve_credits_for_job",
        {
          p_user_id: userId,
          p_tool_slug: toolSlug,
          p_category: modelSpec.category,
          p_model_id: modelSpec.id,
          p_prompt: prompt.trim(),
          p_parameters: { resolution, aspectRatio, durationSec, withAudio },
          p_credits_cost: creditsCost,
        }
      );

      if (rpcErr) {
        return NextResponse.json(
          { error: rpcErr.message || "Failed to reserve credits in Supabase" },
          { status: 402 }
        );
      }
      supabaseJobUuid = rpcJobId;
    }

    // Dispatch job to Yir.ai Router (/v1/jobs)
    const yirJob = await createYirJob({
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
        duration: durationSec,
        with_audio: withAudio,
        n: 1,
      },
    });

    return NextResponse.json({
      jobId: supabaseJobUuid || yirJob.id,
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
