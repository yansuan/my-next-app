import { NextRequest, NextResponse } from "next/server";
import { getYirJobStatus, cancelYirJob } from "@/lib/yir/client";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get("model") || "seedance-2.5";
    const simulateFail = searchParams.get("simulateFail") === "1";

    const statusResp = await getYirJobStatus(id, modelId, simulateFail);
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
    const { id } = await context.params;
    const result = await cancelYirJob(id);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to cancel job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
