"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { RotateCw, Ban, ShieldOff } from "lucide-react";
import type { AbuseCluster } from "@/lib/admin/store";

export default function AdminSignupAbusePage() {
  const [clusters, setClusters] = useState<AbuseCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      setClusters(data.abuseClusters || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAction = async (
    clusterId: string,
    action: "block_abuse_signal" | "revoke_cluster_credits",
    label: string
  ) => {
    setBusyId(`${clusterId}:${action}`);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, clusterId }),
      });
      if (res.ok) {
        setToast(label);
        setTimeout(() => setToast(null), 3000);
        await loadData();
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header matching FrameMux Admin / Signup abuse screenshot */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Signup abuse</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Accounts created in the last 7 days that share a signup IP or device fingerprint (2+).
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-zinc-100 hover:bg-white/[0.08] transition-colors cursor-pointer disabled:opacity-60"
        >
          <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {toast && (
        <div className="rounded-lg border border-[#D4FF00]/30 bg-[#D4FF00]/10 px-4 py-2.5 text-xs font-medium text-[#D4FF00]">
          {toast}
        </div>
      )}

      {/* Main Abuse Table (1:1 FrameMux Admin layout) */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0B0C10]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.07] text-[11px] font-medium text-zinc-400">
              <th className="px-4 py-3 w-28">Signal</th>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3 text-right w-24">Accounts</th>
              <th className="px-4 py-3 text-right w-24">Granted</th>
              <th className="px-4 py-3 text-right w-20">Paid</th>
              <th className="px-4 py-3">Sample emails</th>
              <th className="px-4 py-3 text-right w-44">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {clusters.map((row) => {
              const sampleString = row.sampleEmails.join(", ");
              const isIp = row.signal === "ip";

              return (
                <tr
                  key={row.id}
                  className={`transition-colors hover:bg-white/[0.025] ${
                    row.blocked ? "opacity-60 bg-rose-950/10" : ""
                  }`}
                >
                  {/* Signal Badge */}
                  <td className="px-4 py-3.5">
                    {isIp ? (
                      <span className="inline-flex items-center rounded-full bg-[#D4FF00]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#D4FF00]">
                        ip
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-white/[0.07] px-2.5 py-0.5 text-[11px] font-medium text-zinc-300">
                        fingerprint
                      </span>
                    )}
                  </td>

                  {/* Key (Links directly to /admin/users?q=<key> just like FrameMux) */}
                  <td className="px-4 py-3.5 font-mono text-xs">
                    <Link
                      href={`/admin/users?q=${encodeURIComponent(row.key)}`}
                      className={
                        isIp
                          ? "font-medium text-[#D4FF00] hover:underline"
                          : "text-zinc-400 hover:text-zinc-200 hover:underline"
                      }
                      title={`Filter users matching ${row.key}`}
                    >
                      {row.displayKey}
                    </Link>
                    {row.blocked && (
                      <span className="ml-2 rounded bg-rose-500/20 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-rose-300">
                        Blocked
                      </span>
                    )}
                  </td>

                  {/* Accounts count */}
                  <td className="px-4 py-3.5 text-right font-mono font-semibold text-zinc-100">
                    {row.accounts}
                  </td>

                  {/* Granted count */}
                  <td className="px-4 py-3.5 text-right font-mono font-semibold text-zinc-200">
                    {row.granted}
                  </td>

                  {/* Paid count */}
                  <td className="px-4 py-3.5 text-right font-mono text-zinc-400">
                    {row.paid}
                  </td>

                  {/* Sample emails */}
                  <td className="px-4 py-3.5 text-zinc-400 max-w-md truncate">
                    <span>{sampleString}</span>
                    {row.extraCount > 0 && (
                      <span className="ml-1 text-zinc-500">+{row.extraCount}</span>
                    )}
                  </td>

                  {/* Quick Mitigation Controls */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {row.granted > 0 && (
                        <button
                          type="button"
                          disabled={busyId === `${row.id}:revoke_cluster_credits`}
                          onClick={() =>
                            handleAction(
                              row.id,
                              "revoke_cluster_credits",
                              `Revoked free trial credits for ${row.signal} ${row.displayKey}`
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                          title="Revoke free trial credits from unpaid accounts in this cluster"
                        >
                          <ShieldOff className="h-3 w-3" />
                          Revoke
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busyId === `${row.id}:block_abuse_signal`}
                        onClick={() =>
                          handleAction(
                            row.id,
                            "block_abuse_signal",
                            `${row.blocked ? "Unblocked" : "Blocked"} ${row.signal} ${row.displayKey}`
                          )
                        }
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium cursor-pointer ${
                          row.blocked
                            ? "border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                        }`}
                      >
                        <Ban className="h-3 w-3" />
                        {row.blocked ? "Unblock" : "Block"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
