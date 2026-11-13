"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useWallet } from "@/context/WalletContext";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const { signInDemo } = useWallet();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      signInDemo(email || undefined);
      router.push("/dashboard");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/dashboard" },
    });
    setMsg(error ? error.message : "Check your email for the sign-in link.");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="text-3xl font-extrabold text-white">Sign in to ReelMux</h1>
      <p className="mt-2 text-sm text-zinc-400">New accounts get 100 free credits. No card needed.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-white/15 bg-[#131722] px-4 py-3 text-sm text-white focus:border-[#D4FF00] focus:outline-none"
        />
        <button className="w-full rounded-xl bg-[#D4FF00] py-3 text-sm font-bold text-black">
          Continue with email
        </button>
      </form>
      {msg && <p className="mt-4 text-sm text-zinc-300">{msg}</p>}
    </div>
  );
}
