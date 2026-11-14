"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Terminal,
  Zap,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  User,
  LogOut,
  LogIn,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";

export default function DashboardPage() {
  const router = useRouter();
  const {
    availableCredits,
    reservedCredits,
    activePlanName,
    subscriptionStatus,
    nextBillingDate,
    cancelSubscription,
    ledger,
    jobs,
    orders,
    userEmail,
    displayName,
    avatarUrl,
    authProvider,
    isSignedIn,
    signOut,
  } = useWallet();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          {isSignedIn ? (
            avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName || userEmail || "Avatar"}
                className="h-12 w-12 rounded-2xl object-cover border border-[#D4FF00]/40 bg-black"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4FF00] text-sm font-extrabold text-black">
                {(displayName || userEmail || "R").slice(0, 2).toUpperCase()}
              </div>
            )
          ) : null}
          <div>
            <h1 className="text-3xl font-extrabold text-white">Workspace &amp; Credit Ledger</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <span>{isSignedIn ? `${displayName || userEmail?.split("@")[0]} · ${userEmail}` : "Guest Preview (Not signed in)"}</span>
              {isSignedIn && (
                <span className="rounded-full bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
                  {authProvider === "google" ? "Google" : "Email"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {isSignedIn ? (
            <>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
              >
                <User className="h-4 w-4 text-[#D4FF00]" />
                Profile Settings
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  router.push("/auth");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth?next=/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-[#D4FF00]/40 bg-[#D4FF00]/10 px-4 py-2.5 text-xs font-bold text-[#D4FF00] hover:bg-[#D4FF00]/20"
            >
              <LogIn className="h-4 w-4" />
              Sign in (Google / Email)
            </Link>
          )}
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

      {/* Top 4 Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#D4FF00]/30 bg-[#D4FF00]/5 p-6">
          <div className="text-xs uppercase text-zinc-400">Available credits</div>
          <div className="mt-1 text-4xl font-extrabold text-[#D4FF00]">
            {availableCredits.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-zinc-400">Ready to spend on all 73+ AI models</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-6">
          <div className="text-xs uppercase text-zinc-400">Held in escrow</div>
          <div className="mt-1 text-4xl font-extrabold text-white">{reservedCredits}</div>
          <div className="mt-2 text-xs text-zinc-500">Auto-refunded if a job fails</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs uppercase text-zinc-400">
              <span>Subscription Plan</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                  subscriptionStatus === "active"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-white/10 text-zinc-300"
                }`}
              >
                {subscriptionStatus === "active" ? "Active" : "Pay-as-you-go"}
              </span>
            </div>
            <div className="mt-1.5 text-lg font-extrabold text-white">{activePlanName}</div>
            {subscriptionStatus === "active" && nextBillingDate && (
              <div className="mt-1 text-xs text-zinc-400">Renews on {nextBillingDate}</div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#D4FF00] hover:underline"
            >
              {subscriptionStatus === "active" ? "Manage Plan" : "Upgrade to Pro"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {subscriptionStatus === "active" && (
              <button
                type="button"
                onClick={cancelSubscription}
                className="text-[11px] text-rose-400 hover:underline cursor-pointer"
              >
                Cancel renewal
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase text-zinc-400">MCP Endpoint</div>
            <div className="mt-1 font-mono text-xs sm:text-sm font-bold text-white break-all">
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

      {/* Recent Generations */}
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
            {jobs.map((j) => {
              const isVideo =
                j.outputUrl?.endsWith(".mp4") ||
                j.toolSlug.includes("video") ||
                j.toolSlug === "motion-control";
              return (
                <div key={j.id} className="rounded-2xl border border-white/10 bg-[#0C0E14] p-4">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">{j.modelName}</span>
                    <span className="capitalize text-[#D4FF00] font-semibold">{j.status}</span>
                  </div>
                  {j.outputUrl &&
                    (isVideo ? (
                      <video
                        src={j.outputUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                        className="mt-3 aspect-video w-full rounded-lg object-cover bg-black"
                      />
                    ) : (
                      <img
                        src={j.outputUrl}
                        alt={j.modelName}
                        className="mt-3 aspect-video w-full rounded-lg object-cover bg-black"
                      />
                    ))}
                  <p className="mt-2.5 line-clamp-2 text-xs text-zinc-300">{j.prompt}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>{j.settingsSummary}</span>
                    <span className="font-bold text-[#D4FF00]">{j.creditsCost} credits</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Billing Orders & Subscriptions History */}
      {orders.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Billing Orders &amp; Subscriptions</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-zinc-400 hover:text-[#D4FF00]"
            >
              Inspect in Admin Orders →
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-[#0C0E14]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Plan / Pack</th>
                  <th className="px-4 py-3">Credits Added</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.orderNo} className="border-t border-white/5 text-zinc-300">
                    <td className="px-4 py-2.5 font-mono text-xs text-white">{ord.orderNo}</td>
                    <td className="px-4 py-2.5 font-semibold text-white">{ord.itemName}</td>
                    <td className="px-4 py-2.5 font-bold text-[#D4FF00]">
                      +{ord.creditsGranted.toLocaleString()}c
                    </td>
                    <td className="px-4 py-2.5">${ord.amountUsd.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-xs text-zinc-400">
                      <CreditCard className="mr-1.5 inline h-3.5 w-3.5 text-zinc-400" />
                      {ord.paymentMethod}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Credit Ledger */}
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
                  <td className="px-4 py-2.5 text-xs text-zinc-400">{t.timestamp}</td>
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
