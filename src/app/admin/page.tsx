"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Sparkles,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  RotateCw,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import type {
  AdminGenerationRecord,
  AdminOrderRecord,
  AbuseCluster,
} from "@/lib/admin/store";

interface OverviewMetrics {
  totalUsers: number;
  activeUsers7d: number;
  totalGenerations: number;
  succeededGenerations: number;
  refundedGenerations: number;
  totalUploads: number;
  totalRevenueUsd: number;
  paidOrdersCount: number;
  abuseClustersCount: number;
  abuseAccounts7d: number;
  abuseCreditsSaved: number;
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [recentGenerations, setRecentGenerations] = useState<AdminGenerationRecord[]>([]);
  const [recentOrders, setRecentOrders] = useState<AdminOrderRecord[]>([]);
  const [topAbuse, setTopAbuse] = useState<AbuseCluster[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      setMetrics(data.metrics);
      setRecentGenerations((data.generations || []).slice(0, 5));
      setRecentOrders((data.orders || []).slice(0, 4));
      setTopAbuse((data.abuseClusters || []).slice(0, 5));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Overview</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Real-time telemetry across generations, credit economy, orders, and signup anti-abuse.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-zinc-100 hover:bg-white/[0.08] cursor-pointer"
        >
          <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/[0.08] bg-[#0B0C10] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Accounts</span>
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {metrics?.totalUsers ?? "—"}
          </div>
          <div className="mt-1.5 text-[11px] text-zinc-500">
            {metrics?.activeUsers7d ?? 0} active creators in last 7d
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0B0C10] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Generations (All Models)</span>
            <Sparkles className="h-4 w-4 text-[#D4FF00]" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {metrics?.totalGenerations ?? "—"}
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-zinc-500">
            <span className="text-emerald-400">
              {metrics?.succeededGenerations ?? 0} succeeded
            </span>
            <span>·</span>
            <span>{metrics?.refundedGenerations ?? 0} auto-refunded</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0B0C10] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Gross Revenue (USD)</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-[#D4FF00]">
            ${metrics?.totalRevenueUsd?.toLocaleString() ?? "—"}
          </div>
          <div className="mt-1.5 text-[11px] text-zinc-500">
            Across {metrics?.paidOrdersCount ?? 0} settled orders
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-5">
          <div className="flex items-center justify-between text-xs text-amber-300">
            <span>Signup Abuse (7d)</span>
            <ShieldAlert className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {metrics?.abuseClustersCount ?? "—"} clusters
          </div>
          <div className="mt-1.5 text-[11px] text-amber-200/80">
            {metrics?.abuseCreditsSaved?.toLocaleString() ?? 0} free credits auto-withheld
          </div>
        </div>
      </div>

      {/* Two-Column Operational Panels */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Recent Generations */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0B0C10] p-5 lg:col-span-7">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Recent Generations</h2>
              <p className="text-[11px] text-zinc-400">
                Latest multimodal jobs across video, image, and audio models
              </p>
            </div>
            <Link
              href="/admin/generations"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#D4FF00] hover:underline"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-white/[0.06] text-xs">
            {recentGenerations.map((g) => (
              <div key={g.id} className="flex items-center justify-between py-3 gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{g.modelName}</span>
                    <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                      {g.toolSlug}
                    </span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-400 truncate">{g.userEmail}</span>
                  </div>
                  <p className="mt-1 truncate text-zinc-500">{g.prompt}</p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                      g.status === "succeeded"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : g.status === "processing"
                        ? "bg-cyan-500/15 text-cyan-300"
                        : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {g.status}
                  </span>
                  <div className="mt-1 font-mono text-[11px] text-zinc-400">
                    {g.creditsCost}c · {g.latencySec}s
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signup Abuse Watchlist & Recent Orders */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-xl border border-white/[0.08] bg-[#0B0C10] p-5">
            <div className="flex items-center justify-between pb-3">
              <div>
                <h2 className="text-sm font-bold text-white">Top Signup Abuse Signals</h2>
                <p className="text-[11px] text-zinc-400">
                  Shared IP &amp; device fingerprint clusters (7d)
                </p>
              </div>
              <Link
                href="/admin/signup-abuse"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#D4FF00] hover:underline"
              >
                Manage abuse
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-white/[0.06] text-xs">
              {topAbuse.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="rounded-full bg-[#D4FF00]/15 px-2 py-0.5 text-[10px] font-semibold text-[#D4FF00]">
                      {c.signal}
                    </span>
                    <Link
                      href={`/admin/users?q=${encodeURIComponent(c.key)}`}
                      className="font-mono text-xs text-[#D4FF00] hover:underline truncate"
                    >
                      {c.displayKey}
                    </Link>
                  </div>
                  <div className="shrink-0 font-mono text-[11px] text-zinc-300">
                    {c.accounts} accts · {c.granted} granted
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0B0C10] p-5">
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-sm font-bold text-white">Recent Orders</h2>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#D4FF00] hover:underline"
              >
                All orders
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-white/[0.06] text-xs">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="font-medium text-white">{o.userEmail}</div>
                    <div className="text-[11px] text-zinc-500">{o.itemName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-400">${o.amountUsd}</div>
                    <div className="text-[10px] text-zinc-500">
                      +{o.creditsGranted.toLocaleString()}c
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Assurance Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-[#0B0C10] px-5 py-3.5 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>
            Automatic signup anti-abuse active: max 1 free credit grant per IP / device fingerprint
            per 7-day rolling window.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/uploads" className="inline-flex items-center gap-1 hover:text-white">
            <ImageIcon className="h-3.5 w-3.5" />
            {metrics?.totalUploads ?? 0} uploads indexed
          </Link>
        </div>
      </div>
    </div>
  );
}
