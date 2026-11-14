"use client";

import React, { useEffect, useState, useCallback } from "react";
import { RotateCw } from "lucide-react";
import type { AdminAuditLogRecord } from "@/lib/admin/store";

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AdminAuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      setLogs(data.auditLogs || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Audit log</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Immutable security trail of admin interventions, credit adjustments, refunds, and
            automated signup anti-abuse blocks.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-zinc-100 hover:bg-white/[0.08] cursor-pointer"
        >
          <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0B0C10]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.07] text-[11px] font-medium text-zinc-400">
              <th className="px-4 py-3 w-44">Timestamp</th>
              <th className="px-4 py-3 w-48">Actor</th>
              <th className="px-4 py-3 w-56">Action</th>
              <th className="px-4 py-3 w-52">Target</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.025]">
                <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-400">
                  {log.createdAt}
                </td>
                <td className="px-4 py-3.5 font-mono text-zinc-200">{log.actorEmail}</td>
                <td className="px-4 py-3.5">
                  <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono text-[11px] text-[#D4FF00]">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-300">
                  {log.targetId}
                </td>
                <td className="px-4 py-3.5 text-zinc-300">{log.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
