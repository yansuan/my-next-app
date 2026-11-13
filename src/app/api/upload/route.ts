import { NextRequest, NextResponse } from "next/server";
import { createR2PresignedUploadUrl } from "@/lib/storage/r2";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename = "reference.png", contentType = "image/png", userId } = body;

    const presigned = await createR2PresignedUploadUrl({
      filename,
      contentType,
      userId,
    });

    return NextResponse.json(presigned);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "R2 presign error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
