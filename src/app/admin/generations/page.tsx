"use client";

import React, { useEffect, useState, useCallback } from "react";
import { RotateCw, RotateCcw, ExternalLink } from "lucide-react";
import type { AdminGenerationRecord } from "@/lib/admin/store";

export default function AdminGenerationsPage() {
  const [generations, setGenerations] = useState<AdminGenerationRecord[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      setGenerations(data.generations || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefund = async (gen: AdminGenerationRecord) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "refund_generation", generationId: gen.id }),
    });
    if (res.ok) {
      setToast(`Refunded ${gen.creditsCost} credits to ${gen.userEmail} for job ${gen.id}`);
      setTimeout(() => setToast(null), 3000);
      loadData();
    }
  };

  const visible =
    filter === "all" ? generations : generations.filter((g) => g.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Generations</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Inspect video, image, and audio jobs, upstream task IDs, credit escrow, and manual
            refunds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["all", "succeeded", "processing", "refunded"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize cursor-pointer ${
                filter === s
                  ? "bg-[#D4FF00] text-black font-bold"
                  : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-white/[0.08] cursor-pointer"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {toast && (
        <div className="rounded-lg border border-[#D4FF00]/30 bg-[#D4FF00]/10 px-4 py-2.5 text-xs font-medium text-[#D4FF00]">
          {toast}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0B0C10]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.07] text-[11px] font-medium text-zinc-400">
              <th className="px-4 py-3">Job / Upstream ID</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Model &amp; Tool</th>
              <th className="px-4 py-3">Prompt &amp; Specs</th>
              <th className="px-4 py-3 text-right">Credits</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {visible.map((g) => (
              <tr key={g.id} className="hover:bg-white/[0.025]">
                <td className="px-4 py-3.5 font-mono">
                  <div className="font-semibold text-white">{g.id}</div>
                  <div className="text-[11px] text-zinc-500">{g.upstreamJobId}</div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="text-zinc-200">{g.userEmail}</div>
                  <div className="text-[11px] text-zinc-500">{g.createdAt}</div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-[#D4FF00]">{g.modelName}</div>
                  <div className="text-[11px] text-zinc-500">
                    {g.toolSlug} · {g.resolution}
                  </div>
                </td>
                <td className="px-4 py-3.5 max-w-md">
                  <p className="line-clamp-2 text-zinc-300">{g.prompt}</p>
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-semibold text-white">
                  {g.creditsCost}c
                  <span className="block text-[10px] font-normal text-zinc-500">
                    {g.latencySec}s
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                      g.status === "succeeded"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : g.status === "processing"
                        ? "bg-cyan-500/15 text-cyan-300"
                        : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {g.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    {g.outputUrl && (
                      <a
                        href={g.outputUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/10"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Output
                      </a>
                    )}
                    {g.status !== "refunded" && (
                      <button
                        type="button"
                        onClick={() => handleRefund(g)}
                        className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Refund
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
