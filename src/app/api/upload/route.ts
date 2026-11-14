import { NextRequest, NextResponse } from "next/server";
import { createR2PresignedUploadUrl } from "@/lib/storage/r2";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
]);

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to upload media." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const filename = String(body?.filename || "reference.png");
    const contentType = String(body?.contentType || "image/png")
      .toLowerCase()
      .trim();
    const fileSize =
      body?.fileSize !== undefined ? Number(body.fileSize) : undefined;

    if (!ALLOWED_MIME_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: `Unsupported upload content type: ${contentType}` },
        { status: 400 }
      );
    }

    if (
      fileSize !== undefined &&
      (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_UPLOAD_BYTES)
    ) {
      return NextResponse.json(
        { error: "File size must be between 1 byte and 50 MB." },
        { status: 400 }
      );
    }

    const presigned = await createR2PresignedUploadUrl({
      filename,
      contentType,
      userId: user.id,
    });

    return NextResponse.json(presigned);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "R2 presign error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
