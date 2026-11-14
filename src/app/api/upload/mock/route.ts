import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { isR2Configured } from "@/lib/storage/r2";

async function handleMockUpload() {
  if (isR2Configured()) {
    return NextResponse.json(
      { error: "Mock upload endpoint is disabled when R2 is configured." },
      { status: 403 }
    );
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true, simulated: true });
}

export async function PUT() {
  return handleMockUpload();
}

export async function POST() {
  return handleMockUpload();
}
