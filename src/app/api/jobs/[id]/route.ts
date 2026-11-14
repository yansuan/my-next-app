import { NextRequest, NextResponse } from "next/server";
import { getYirJobStatus, cancelYirJob } from "@/lib/yir/client";
import {
  createSupabaseServiceClient,
  getAuthenticatedUser,
} from "@/lib/supabase/server";
import { getAdminStore } from "@/lib/admin/store";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function findOwnedJob(userId: string, jobIdentifier: string) {
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { supabase: null, jobRow: null };

  const filterCol = UUID_REGEX.test(jobIdentifier) ? "id" : "yir_job_id";
  const { data: jobRow } = await supabase
    .from("generation_jobs")
    .select("id, user_id, yir_job_id, model_id, status, credit_settled")
    .eq(filterCol, jobIdentifier)
    .eq("user_id", userId)
    .maybeSingle();

  return { supabase, jobRow };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const { supabase, jobRow } = await findOwnedJob(user.id, id);
    if (!supabase) {
      return NextResponse.json(
        { error: "Server billing service is not configured." },
        { status: 503 }
      );
    }
    if (!jobRow) {
      return NextResponse.json(
        { error: "Generation job not found for this account." },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get("model") || jobRow.model_id || "seedance-2.5";
    const upstreamId = jobRow.yir_job_id || id;

    const statusResp = await getYirJobStatus(upstreamId, modelId, false);

    if (
      !jobRow.credit_settled &&
      (statusResp.status === "succeeded" ||
        statusResp.status === "failed" ||
        statusResp.status === "canceled")
    ) {
      await supabase.rpc("finalize_job_credits", {
        p_job_id: jobRow.id,
        p_final_status: statusResp.status,
        p_source_url: statusResp.output?.media_url || null,
        p_r2_url: null,
        p_error: statusResp.error?.message || null,
      });

      const store = getAdminStore();
      const adminRec = store.generations.find(
        (g) => g.upstreamJobId === upstreamId || g.id === jobRow.id
      );
      if (adminRec) {
        adminRec.status =
          statusResp.status === "succeeded"
            ? "succeeded"
            : statusResp.status === "canceled"
              ? "refunded"
              : "failed";
        if (statusResp.output?.media_url) {
          adminRec.outputUrl = statusResp.output.media_url;
        }
      }
    }

    return NextResponse.json(statusResp);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to poll job status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const { supabase, jobRow } = await findOwnedJob(user.id, id);
    if (!supabase) {
      return NextResponse.json(
        { error: "Server billing service is not configured." },
        { status: 503 }
      );
    }
    if (!jobRow) {
      return NextResponse.json(
        { error: "Generation job not found for this account." },
        { status: 404 }
      );
    }

    const upstreamId = jobRow.yir_job_id || id;
    const result = await cancelYirJob(upstreamId);

    if (!jobRow.credit_settled) {
      await supabase.rpc("finalize_job_credits", {
        p_job_id: jobRow.id,
        p_final_status: "canceled",
        p_source_url: null,
        p_r2_url: null,
        p_error: "Canceled by user",
      });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to cancel job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
