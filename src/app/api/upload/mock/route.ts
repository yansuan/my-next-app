import { NextResponse } from "next/server";

// Local stand-in for an R2 presigned PUT URL when R2 is not configured.
export async function PUT() {
  return NextResponse.json({ ok: true, simulated: true });
}

export async function POST() {
  return NextResponse.json({ ok: true, simulated: true });
}
