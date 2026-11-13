"use client";

import React, { useState } from "react";
import { CheckCircle2, Zap, ShieldCheck } from "lucide-react";
import { CREDIT_PACKS, SUBSCRIPTION_PLANS, MODELS_CATALOG } from "@/lib/catalog/models";
import { useWallet } from "@/context/WalletContext";

export default function PricingPage() {
  const { addCreditsPack, availableCredits } = useWallet();
  const [notice, setNotice] = useState<string | null>(null);

  const buy = (credits: number, name: string) => {
    addCreditsPack(credits, name);
    setNotice(`Added +${credits.toLocaleString()} credits (${name}) to your account balance.`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        One balance for every AI model
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-400">
        Buy credits once and spend them on any model. Every job shows its price before you generate.
      </p>
      <p className="mt-2 text-xs text-zinc-500">
        100 free credits on sign up · No card needed · Credits back on failed jobs · Balance: {availableCredits}
      </p>

      {notice && (
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {notice}
        </div>
      )}

      <h2 className="mt-12 text-2xl font-bold text-white">Credit packs</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {CREDIT_PACKS.map((p) => (
          <div
            key={p.id}
            className={`flex flex-col rounded-2xl border p-6 ${
              p.highlight ? "border-[#D4FF00]/60 bg-[#D4FF00]/5" : "border-white/10 bg-[#0C0E14]"
            }`}
          >
            <div className="text-sm font-semibold text-zinc-300">{p.name}</div>
            <div className="mt-2 text-4xl font-extrabold text-white">
              {p.priceUsd} <span className="text-sm font-normal text-zinc-500">{p.billingNote}</span>
            </div>
            <ul className="mt-5 flex-1 space-y-2 text-sm text-zinc-300">
              {p.estimates.map((e) => (
                <li key={e} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D4FF00]" />
                  {e}
                </li>
              ))}
            </ul>
            <button
              onClick={() => buy(p.credits, p.name)}
              className="mt-6 rounded-xl bg-[#D4FF00] py-3 text-sm font-bold text-black hover:bg-[#e1ff3d]"
            >
              Get {p.name}
            </button>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-2xl font-bold text-white">Subscriptions</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {SUBSCRIPTION_PLANS.map((p) => (
          <div
            key={p.id}
            className={`flex flex-col rounded-2xl border p-6 ${
              p.highlight ? "border-[#D4FF00]/60 bg-[#D4FF00]/5" : "border-white/10 bg-[#0C0E14]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-300">{p.name}</span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-zinc-200">{p.badge}</span>
            </div>
            <div className="mt-2 text-4xl font-extrabold text-white">
              {p.priceUsd} <span className="text-sm font-normal text-zinc-500">{p.period}</span>
            </div>
            <ul className="mt-5 flex-1 space-y-2 text-sm text-zinc-300">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D4FF00]" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => buy(p.creditsPerMonth, p.name)}
              className="mt-6 rounded-xl border border-white/20 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:grid-cols-3">
        {[
          ["01 See the price first", "Exact credit cost is shown before every generation."],
          ["02 Credits held, then charged", "Credits are held during generation and charged only on success."],
          ["03 Failed jobs cost nothing", "Held credits are refunded automatically if a job fails."],
        ].map(([t, d]) => (
          <div key={t} className="flex gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
            <div>
              <div className="text-sm font-semibold text-white">{t}</div>
              <p className="text-xs text-zinc-400">{d}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-2xl font-bold text-white">Model credit costs</h2>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase text-zinc-400">
            <tr>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Unit</th>
            </tr>
          </thead>
          <tbody>
            {MODELS_CATALOG.map((m) => (
              <tr key={m.id} className="border-t border-white/5 text-zinc-300">
                <td className="px-4 py-2.5 font-medium text-white">{m.name}</td>
                <td className="px-4 py-2.5 capitalize">{m.category}</td>
                <td className="px-4 py-2.5 text-[#D4FF00]">
                  <Zap className="mr-1 inline h-3 w-3" />
                  {m.baseCredits}
                </td>
                <td className="px-4 py-2.5 text-zinc-500">{m.unitLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
