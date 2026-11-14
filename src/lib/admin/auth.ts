import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "reelmux_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

export interface AdminSessionPayload {
  actorEmail: string;
  exp: number;
}

function getConfiguredAdminCredentials(): {
  configured: boolean;
  expectedUsername: string;
  expectedSecret: string;
  signingSecret: string;
} {
  const expectedSecret = (
    process.env.ADMIN_ACCESS_KEY ||
    process.env.ADMIN_PASSWORD ||
    ""
  ).trim();
  const expectedUsername = (
    process.env.ADMIN_USERNAME || "ops@reelmux.com"
  ).trim();
  const signingSecret = (
    process.env.ADMIN_SESSION_SECRET || expectedSecret
  ).trim();

  return {
    configured: Boolean(expectedSecret && signingSecret),
    expectedUsername,
    expectedSecret,
    signingSecret,
  };
}

export function isAdminConfigured(): boolean {
  return getConfiguredAdminCredentials().configured;
}

function safeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    // Burn comparable time even on length mismatch
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyAdminCredentials(
  username: string,
  secret: string
): { valid: boolean; actorEmail: string; configured: boolean } {
  const cfg = getConfiguredAdminCredentials();
  if (!cfg.configured) {
    return { valid: false, actorEmail: "", configured: false };
  }

  const cleanUser = username.trim().toLowerCase();
  const expectedUser = cfg.expectedUsername.toLowerCase();
  const userMatches = safeEqualStrings(cleanUser, expectedUser);
  const secretMatches = safeEqualStrings(secret.trim(), cfg.expectedSecret);

  return {
    valid: userMatches && secretMatches,
    actorEmail: cfg.expectedUsername,
    configured: true,
  };
}

function signPayload(encodedPayload: string, signingSecret: string): string {
  return crypto
    .createHmac("sha256", signingSecret)
    .update(encodedPayload)
    .digest("base64url");
}

export function createAdminSessionToken(actorEmail: string): string | null {
  const cfg = getConfiguredAdminCredentials();
  if (!cfg.configured) return null;

  const payload: AdminSessionPayload = {
    actorEmail,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const signature = signPayload(encoded, cfg.signingSecret);
  return `${encoded}.${signature}`;
}

export function verifyAdminSessionToken(
  token: string | undefined | null
): AdminSessionPayload | null {
  if (!token) return null;
  const cfg = getConfiguredAdminCredentials();
  if (!cfg.configured) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts;
  if (!encoded || !signature) return null;

  const expectedSig = signPayload(encoded, cfg.signingSecret);
  if (!safeEqualStrings(signature, expectedSig)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as AdminSessionPayload;
    if (!parsed.actorEmail || !parsed.exp) return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function requireAdminSession(): Promise<
  | { ok: true; session: AdminSessionPayload }
  | { ok: false; response: NextResponse }
> {
  if (!isAdminConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Admin Console authentication is not configured. Set ADMIN_ACCESS_KEY (or ADMIN_PASSWORD) in server environment variables.",
        },
        { status: 503 }
      ),
    };
  }

  const session = await getAdminSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Admin authentication required." },
        { status: 401 }
      ),
    };
  }

  return { ok: true, session };
}
