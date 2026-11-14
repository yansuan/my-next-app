"use client";

import React from "react";
import Link from "next/link";
import { Terminal, Zap, ArrowRight, Sparkles, ShieldAlert } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

export default function DashboardPage() {
  const { availableCredits, reservedCredits, ledger, jobs, userEmail } = useWallet();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Workspace &amp; Credit Ledger</h1>
          <p className="mt-1 text-sm text-zinc-400">{userEmail ?? "Not signed in"}</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/signup-abuse"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-white/10"
          >
            <ShieldAlert className="h-4 w-4 text-[#D4FF00]" />
            Admin Console
          </Link>
          <Link
            href="/for-agents"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
          >
            <Terminal className="h-4 w-4 text-[#D4FF00]" />
            MCP &amp; Agent API Keys
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-[#D4FF00] px-4 py-2.5 text-xs font-extrabold text-black hover:bg-[#e2ff3e]"
          >
            <Zap className="h-4 w-4 fill-current" />
            Top Up Credits
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#D4FF00]/30 bg-[#D4FF00]/5 p-6">
          <div className="text-xs uppercase text-zinc-400">Available credits</div>
          <div className="mt-1 text-4xl font-extrabold text-[#D4FF00]">{availableCredits}</div>
          <div className="mt-2 text-xs text-zinc-400">Ready to spend on all 73+ AI models</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-6">
          <div className="text-xs uppercase text-zinc-400">Held in escrow</div>
          <div className="mt-1 text-4xl font-extrabold text-white">{reservedCredits}</div>
          <div className="mt-2 text-xs text-zinc-500">Auto-refunded if a job fails</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase text-zinc-400">MCP Endpoint</div>
            <div className="mt-1 font-mono text-sm font-bold text-white">
              https://reelmux.com/api/mcp
            </div>
          </div>
          <Link
            href="/for-agents"
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#D4FF00] hover:underline"
          >
            Manage Agent Keys &amp; Scopes
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Recent Generations</h2>
          <Link
            href="/tools/text-to-video"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#D4FF00] hover:underline"
          >
            <Sparkles className="h-3.5 w-3.5" />
            New Generation
          </Link>
        </div>
        {jobs.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-white/10 bg-[#0C0E14] p-6 text-sm text-zinc-400">
            No generations yet. Open any tool from the top menu to create your first video, image,
            or audio clip.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((j) => (
              <div key={j.id} className="rounded-2xl border border-white/10 bg-[#0C0E14] p-4">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">{j.modelName}</span>
                  <span className="capitalize text-[#D4FF00]">{j.status}</span>
                </div>
                {j.outputUrl && (
                  <img
                    src={j.outputUrl}
                    alt=""
                    className="mt-3 aspect-video w-full rounded-lg object-cover"
                  />
                )}
                <p className="mt-2 line-clamp-2 text-xs text-zinc-400">{j.prompt}</p>
                <div className="mt-2 text-[11px] text-zinc-500">
                  {j.settingsSummary} · {j.creditsCost} credits
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">Credit Ledger</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-[#0C0E14]">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3">Held</th>
                <th className="px-4 py-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((t) => (
                <tr key={t.id} className="border-t border-white/5 text-zinc-300">
                  <td className="px-4 py-2.5">{t.timestamp}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{t.type}</td>
                  <td className="px-4 py-2.5 font-semibold text-white">
                    {t.deltaAvailable > 0 ? `+${t.deltaAvailable}` : t.deltaAvailable}
                  </td>
                  <td className="px-4 py-2.5">{t.deltaReserved}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{t.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
