"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
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

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [fingerprint, setFingerprint] = useState("");
  const { signInDemo } = useWallet();
  const router = useRouter();

  useEffect(() => {
    setFingerprint(computeBrowserFingerprint());
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim() || "admin@reelmux.com";
    signInDemo(cleanEmail);

    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: window.location.origin + "/dashboard",
          data: {
            device_fingerprint: fingerprint,
          },
        },
      });
      if (!error) {
        setMsg("Magic sign-in link sent! Redirecting to your workspace...");
        setTimeout(() => router.push("/dashboard"), 900);
        return;
      }
    }
    router.push("/dashboard");
  };

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

        <form onSubmit={submit} className="mt-7 space-y-4">
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4FF00] py-3 text-sm font-extrabold text-black hover:bg-[#e1ff3d] transition-colors cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            Continue with email
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {msg && (
          <p className="mt-4 rounded-xl border border-[#D4FF00]/30 bg-[#D4FF00]/10 px-3.5 py-2.5 text-xs text-[#D4FF00]">
            {msg}
          </p>
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
