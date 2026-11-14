import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSession,
  isAdminConfigured,
  verifyAdminCredentials,
} from "@/lib/admin/auth";

export async function GET() {
  const configured = isAdminConfigured();
  const session = await getAdminSession();
  return NextResponse.json({
    configured,
    authenticated: Boolean(session),
    actorEmail: session?.actorEmail || null,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = String(body?.username || "ops@reelmux.com");
    const secret = String(body?.secret || body?.password || "");

    const check = verifyAdminCredentials(username, secret);
    if (!check.configured) {
      return NextResponse.json(
        {
          error:
            "Admin credentials are not configured on the server (set ADMIN_ACCESS_KEY or ADMIN_PASSWORD).",
        },
        { status: 503 }
      );
    }

    if (!check.valid) {
      return NextResponse.json(
        { error: "Invalid admin username or access key." },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken(check.actorEmail);
    if (!token) {
      return NextResponse.json(
        { error: "Failed to mint admin session token." },
        { status: 500 }
      );
    }

    const res = NextResponse.json({
      ok: true,
      authenticated: true,
      actorEmail: check.actorEmail,
    });

    res.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return res;
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true, authenticated: false });
  res.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
