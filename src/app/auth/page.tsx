"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LogOut,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useWallet } from "@/context/WalletContext";
import { BrandLogo } from "@/components/brand/BrandLogo";

function computeBrowserFingerprint(): string {
  if (typeof window === "undefined") return "0000000000000000";
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");
  let h1 = 0xdeadbeef ^ raw.length;
  let h2 = 0x41c6ce57 ^ raw.length;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (
    (h1 >>> 0).toString(16).padStart(8, "0") +
    (h2 >>> 0).toString(16).padStart(8, "0") +
    ((h1 ^ h2) >>> 0).toString(16).padStart(8, "0") +
    ((h1 + h2) >>> 0).toString(16).padStart(8, "0")
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
  );
}

function AuthPageInner() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [fingerprint, setFingerprint] = useState("");
  const {
    isSignedIn,
    userEmail,
    displayName,
    avatarUrl,
    authProvider,
    signInDemo,
    signInWithGoogle,
    signOut,
  } = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";

  useEffect(() => {
    setFingerprint(computeBrowserFingerprint());
    const urlErr = searchParams.get("error");
    if (urlErr) setErrorMsg(urlErr);
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setMsg("");
    setLoadingGoogle(true);
    const res = await signInWithGoogle(nextPath);
    if (!res.ok) {
      setLoadingGoogle(false);
      const raw = res.error || "Google sign-in is unavailable.";
      if (/not enabled|unsupported provider/i.test(raw)) {
        setErrorMsg(
          `Google OAuth provider is not enabled yet in Supabase Auth (${raw}). Configure Google Client ID/Secret in Supabase → Authentication → Providers → Google with callback URL ${window.location.origin}/auth/callback, or sign in with Email below.`
        );
      } else {
        setErrorMsg(raw);
      }
    }
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setMsg("");
    const cleanEmail = email.trim();
    if (!cleanEmail) return;
    setLoadingEmail(true);

    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            nextPath
          )}`,
          data: {
            device_fingerprint: fingerprint,
          },
        },
      });
      if (!error) {
        signInDemo(cleanEmail, { provider: "email" });
        setLoadingEmail(false);
        setMsg(
          `Magic sign-in link sent to ${cleanEmail}! Check your inbox or click Workspace below to continue.`
        );
        setTimeout(() => router.push(nextPath), 1200);
        return;
      }
      // If email rate limit or unconfirmed SMTP occurs, fall back gracefully to local session
      signInDemo(cleanEmail, { provider: "email" });
      setLoadingEmail(false);
      setMsg(
        `Signed in workspace session as ${cleanEmail}. (Auth notice: ${error.message})`
      );
      setTimeout(() => router.push(nextPath), 900);
      return;
    }

    signInDemo(cleanEmail, { provider: "email" });
    setLoadingEmail(false);
    router.push(nextPath);
  };

  if (isSignedIn) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-3xl border border-white/10 bg-[#0B0D13] p-8 shadow-2xl space-y-6">
          <div className="flex justify-center">
            <BrandLogo href="/" size="lg" />
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#121621] p-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName || userEmail || "User"}
                className="h-12 w-12 rounded-full object-cover border border-[#D4FF00]/50"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4FF00] text-base font-extrabold text-black">
                {(displayName || userEmail || "R").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-bold text-white">
                  {displayName || userEmail?.split("@")[0]}
                </span>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
                  {authProvider === "google" ? "Google" : "Email"}
                </span>
              </div>
              <div className="truncate text-xs text-zinc-400">{userEmail}</div>
            </div>
          </div>

          <div className="space-y-2.5">
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4FF00] py-3 text-sm font-extrabold text-black hover:bg-[#e1ff3d] transition-colors"
            >
              Open Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/profile"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <User className="h-4 w-4 text-[#D4FF00]" />
              Personal Profile &amp; Account Settings
            </Link>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                setMsg("Signed out cleanly.");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-white/10 bg-[#0B0D13] p-8 shadow-2xl">
        <div className="flex justify-center">
          <BrandLogo href="/" size="lg" />
        </div>

        <h1 className="mt-6 text-center text-2xl font-extrabold text-white">
          Sign in to ReelMux
        </h1>
        <p className="mt-2 text-center text-xs text-zinc-400">
          New accounts receive <span className="font-semibold text-[#D4FF00]">100 free credits</span>
          {" "}automatically (1 grant per IP / device).
        </p>

        {/* 1-Click Google OAuth */}
        <div className="mt-7">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white py-3 text-sm font-bold text-black hover:bg-zinc-200 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {loadingGoogle ? (
              <Loader2 className="h-4 w-4 animate-spin text-black" />
            ) : (
              <GoogleIcon />
            )}
            {loadingGoogle ? "Connecting to Google..." : "Continue with Google"}
          </button>
        </div>

        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-zinc-500">
          <div className="h-px flex-1 bg-white/10" />
          <span>or continue with email</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={submitEmail} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Work or personal email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
              className="w-full rounded-xl border border-white/15 bg-[#12151E] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#D4FF00] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loadingEmail}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4FF00] py-3 text-sm font-extrabold text-black hover:bg-[#e1ff3d] disabled:opacity-60 transition-colors cursor-pointer"
          >
            {loadingEmail ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loadingEmail ? "Signing in..." : "Continue with email"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/35 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200 leading-relaxed">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {msg && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#D4FF00]/30 bg-[#D4FF00]/10 px-3.5 py-2.5 text-xs text-[#D4FF00] leading-relaxed">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{msg}</span>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Device anti-abuse protected
          </span>
          <Link href="/admin" className="text-zinc-400 hover:text-[#D4FF00]">
            Admin Console →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-zinc-400">
          Loading sign-in options...
        </div>
      }
    >
      <AuthPageInner />
    </Suspense>
  );
}
