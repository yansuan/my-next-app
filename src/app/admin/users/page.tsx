"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, RotateCw, PlusCircle, MinusCircle, Ban, CheckCircle, X } from "lucide-react";
import type { AdminUserRecord } from "@/lib/admin/store";

function UsersTableContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const loadUsers = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setUsers(data.users || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(query);
  }, [query, loadUsers]);

  const adjustCredits = async (userId: string, delta: number, email: string) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "adjust_user_credits",
        userId,
        delta,
        note: "Manual admin adjustment",
      }),
    });
    if (res.ok) {
      setToast(`Updated credits (${delta > 0 ? `+${delta}` : delta}) for ${email}`);
      setTimeout(() => setToast(null), 3000);
      loadUsers(query);
    }
  };

  const toggleBan = async (user: AdminUserRecord) => {
    const nextStatus = user.status === "banned" ? "active" : "banned";
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "set_user_status",
        userId: user.id,
        status: nextStatus,
      }),
    });
    if (res.ok) {
      setToast(`Set ${user.email} status to ${nextStatus}`);
      setTimeout(() => setToast(null), 3000);
      loadUsers(query);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Users</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Search accounts by email, signup IP address, or device fingerprint hash.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter email, IP, fingerprint..."
              className="w-72 rounded-lg border border-white/15 bg-[#0B0C10] py-1.5 pl-8 pr-8 text-xs text-white placeholder:text-zinc-500 focus:border-[#D4FF00] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  router.replace("/admin/users");
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => loadUsers(query)}
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
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3 text-right">Credits</th>
              <th className="px-4 py-3 text-right">Granted</th>
              <th className="px-4 py-3 text-right">Paid</th>
              <th className="px-4 py-3">Signup IP &amp; Fingerprint</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.025]">
                <td className="px-4 py-3.5">
                  <div className="font-medium text-white">{u.email}</div>
                  <div className="text-[11px] text-zinc-500">
                    {u.displayName} · {u.generationsCount} jobs · {u.createdAt}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] uppercase text-zinc-300">
                    {u.planTier}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-[#D4FF00]">
                  {u.balanceAvailable.toLocaleString()}
                  {u.balanceReserved > 0 && (
                    <span className="block text-[10px] font-normal text-amber-300">
                      {u.balanceReserved} held
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-zinc-300">
                  {u.freeCreditsGranted ? "100c" : "0c"}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-zinc-300">
                  ${u.paidTotalUsd}
                </td>
                <td className="px-4 py-3.5 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() => setQuery(u.signupIp)}
                    className="block text-[#D4FF00] hover:underline cursor-pointer"
                  >
                    {u.signupIp}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuery(u.deviceFingerprint.slice(0, 16))}
                    className="block text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    {u.deviceFingerprint.slice(0, 16)}...
                  </button>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                      u.status === "active"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : u.status === "flagged"
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => adjustCredits(u.id, 100, u.email)}
                      className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/10 cursor-pointer"
                      title="Grant +100 credits"
                    >
                      <PlusCircle className="h-3 w-3 text-[#D4FF00]" />
                      +100
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustCredits(u.id, -100, u.email)}
                      className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-300 hover:bg-white/10 cursor-pointer"
                      title="Deduct 100 credits"
                    >
                      <MinusCircle className="h-3 w-3 text-zinc-400" />
                      -100
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBan(u)}
                      className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] cursor-pointer ${
                        u.status === "banned"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                      }`}
                    >
                      {u.status === "banned" ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Unban
                        </>
                      ) : (
                        <>
                          <Ban className="h-3 w-3" />
                          Ban
                        </>
                      )}
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

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="text-xs text-zinc-400">Loading users...</div>}>
      <UsersTableContent />
    </Suspense>
  );
}
