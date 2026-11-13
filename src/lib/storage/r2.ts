import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "reelmux-media";
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://cdn.reelmux.com";

export function isR2Configured(): boolean {
  return Boolean(
    R2_ACCOUNT_ID &&
      R2_ACCESS_KEY_ID &&
      R2_SECRET_ACCESS_KEY &&
      R2_ACCOUNT_ID !== "your-cloudflare-account-id"
  );
}

function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID || "",
      secretAccessKey: R2_SECRET_ACCESS_KEY || "",
    },
  });
}

/**
 * Create a presigned PUT URL so browsers can upload reference images/frames directly to Cloudflare R2
 */
export async function createR2PresignedUploadUrl(params: {
  filename: string;
  contentType: string;
  userId?: string;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string; simulated: boolean }> {
  const safeName = params.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `uploads/${params.userId || "anon"}/${Date.now()}-${safeName}`;

  if (!isR2Configured()) {
    return {
      uploadUrl: `/api/upload/mock?key=${encodeURIComponent(key)}`,
      publicUrl: `${R2_PUBLIC_URL}/${key}`,
      key,
      simulated: true,
    };
  }

  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: params.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });
  return {
    uploadUrl,
    publicUrl: `${R2_PUBLIC_URL}/${key}`,
    key,
    simulated: false,
  };
}
