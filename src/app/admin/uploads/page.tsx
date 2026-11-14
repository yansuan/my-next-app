"use client";

import React, { useEffect, useState, useCallback } from "react";
import { RotateCw, CheckCircle, AlertTriangle, ShieldOff } from "lucide-react";
import type { AdminUploadRecord } from "@/lib/admin/store";

export default function AdminUploadsPage() {
  const [uploads, setUploads] = useState<AdminUploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      setUploads(data.uploads || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setModeration = async (
    upload: AdminUploadRecord,
    moderationStatus: "approved" | "flagged" | "quarantined"
  ) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "moderate_upload",
        uploadId: upload.id,
        moderationStatus,
      }),
    });
    if (res.ok) {
      setToast(`Marked ${upload.fileName} as ${moderationStatus}`);
      setTimeout(() => setToast(null), 3000);
      loadData();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Uploads</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Reference images, keyframes, and source media uploaded by users for image-to-video and
            reference-to-video workflows.
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

      {toast && (
        <div className="rounded-lg border border-[#D4FF00]/30 bg-[#D4FF00]/10 px-4 py-2.5 text-xs font-medium text-[#D4FF00]">
          {toast}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0B0C10]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.07] text-[11px] font-medium text-zinc-400">
              <th className="px-4 py-3">Preview</th>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Tool</th>
              <th className="px-4 py-3 text-right">Size</th>
              <th className="px-4 py-3">Moderation</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {uploads.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.025]">
                <td className="px-4 py-3">
                  <img
                    src={u.storageUrl}
                    alt={u.fileName}
                    className="h-11 w-16 rounded-lg object-cover border border-white/10"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-mono font-medium text-white">{u.fileName}</div>
                  <div className="text-[11px] text-zinc-500">
                    {u.mimeType} · {u.createdAt}
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-300">{u.userEmail}</td>
                <td className="px-4 py-3 font-mono text-zinc-400">{u.toolSlug}</td>
                <td className="px-4 py-3 text-right font-mono text-zinc-300">
                  {(u.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                      u.moderationStatus === "approved"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : u.moderationStatus === "flagged"
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {u.moderationStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setModeration(u, "approved")}
                      className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/10 cursor-pointer"
                    >
                      <CheckCircle className="h-3 w-3 text-emerald-400" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setModeration(u, "flagged")}
                      className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Flag
                    </button>
                    <button
                      type="button"
                      onClick={() => setModeration(u, "quarantined")}
                      className="inline-flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                    >
                      <ShieldOff className="h-3 w-3" />
                      Quarantine
                    </button>
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
