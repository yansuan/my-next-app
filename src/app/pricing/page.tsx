"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Zap,
  ShieldCheck,
  CreditCard,
  Lock,
  Sparkles,
  X,
  Loader2,
  Receipt,
  ArrowRight,
} from "lucide-react";
import {
  CREDIT_PACKS,
  SUBSCRIPTION_PLANS,
  MODELS_CATALOG,
} from "@/lib/catalog/models";
import { useWallet } from "@/context/WalletContext";

interface CheckoutItem {
  itemId: string;
  itemName: string;
  itemType: "credit_pack" | "subscription";
  credits: number;
  priceDisplay: string;
  amountUsd: number;
  periodLabel: string;
}

export default function PricingPage() {
  const {
    availableCredits,
    activePlanId,
    activePlanName,
    subscriptionStatus,
    nextBillingDate,
    completeCheckout,
    cancelSubscription,
    userEmail,
  } = useWallet();

  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("Visa •••• 4242");
  const [cardHolder, setCardHolder] = useState<string>("ReelMux Studio Creator");
  const [processing, setProcessing] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<{
    orderNo: string;
    itemName: string;
    credits: number;
    amountUsd: number;
    itemType: "credit_pack" | "subscription";
  } | null>(null);

  const openPackCheckout = (pack: (typeof CREDIT_PACKS)[number]) => {
    const numericPrice = Number(pack.priceUsd.replace(/[^0-9.]/g, "")) || 29;
    setCheckoutTarget({
      itemId: pack.id,
      itemName: `${pack.name} Pack`,
      itemType: "credit_pack",
      credits: pack.credits,
      priceDisplay: pack.priceUsd,
      amountUsd: numericPrice,
      periodLabel: pack.billingNote,
    });
  };

  const openSubCheckout = (plan: (typeof SUBSCRIPTION_PLANS)[number]) => {
    const numericPrice = Number(plan.priceUsd.replace(/[^0-9.]/g, "")) || 19.9;
    setCheckoutTarget({
      itemId: plan.id,
      itemName: plan.name,
      itemType: "subscription",
      credits: plan.creditsPerMonth,
      priceDisplay: plan.priceUsd,
      amountUsd: numericPrice,
      periodLabel: plan.period,
    });
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutTarget) return;
    setProcessing(true);
    try {
      const result = await completeCheckout({
        itemId: checkoutTarget.itemId,
        itemName: checkoutTarget.itemName,
        itemType: checkoutTarget.itemType,
        credits: checkoutTarget.credits,
        amountUsd: checkoutTarget.amountUsd,
        paymentMethod,
        periodLabel: checkoutTarget.periodLabel,
      });

      setReceipt({
        orderNo: result.orderNo,
        itemName: checkoutTarget.itemName,
        credits: checkoutTarget.credits,
        amountUsd: checkoutTarget.amountUsd,
        itemType: checkoutTarget.itemType,
      });
      setCheckoutTarget(null);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4FF00]/30 bg-[#D4FF00]/10 px-3.5 py-1 text-xs font-semibold text-[#D4FF00]">
            <Zap className="h-3.5 w-3.5 fill-current" />
            Unified Credit Wallet · 73+ AI Video, Image &amp; Audio Models
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            One balance for every AI model
          </h1>
          <p className="mt-3 max-w-2xl text-base text-zinc-400">
            Buy credits once or subscribe for monthly rollovers. Spend your balance across Kling
            4.0, Seedance 2.5, Veo 3.1, MiniMax H3, GPT Image 2.6, FLUX.2 Max, and Suno v6. Every
            job shows its exact price before you generate.
          </p>
        </div>

        {/* Live Wallet & Subscription Status Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-4 sm:p-5 min-w-[290px]">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Current Wallet Balance</span>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
              {subscriptionStatus === "active" ? activePlanName : "Pay-As-You-Go"}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-[#D4FF00]">
              {availableCredits.toLocaleString()}{" "}
              <span className="text-sm font-medium text-zinc-300">credits</span>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-white hover:text-[#D4FF00]"
            >
              Ledger →
            </Link>
          </div>
          {subscriptionStatus === "active" && nextBillingDate && (
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[11px] text-zinc-400">
              <span>Renews {nextBillingDate}</span>
              <button
                type="button"
                onClick={cancelSubscription}
                className="text-rose-400 hover:underline cursor-pointer"
              >
                Cancel renewal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmed Order Receipt Banner */}
      {receipt && (
        <div className="mt-8 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-sm text-emerald-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-300">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-white text-base">
                Payment Confirmed · Order #{receipt.orderNo}
              </div>
              <p className="mt-0.5 text-xs text-emerald-200">
                {receipt.itemType === "subscription"
                  ? `Your ${receipt.itemName} subscription is now active.`
                  : `Your ${receipt.itemName} has been credited.`}{" "}
                Added <strong>+{receipt.credits.toLocaleString()} credits</strong> ($
                {receipt.amountUsd.toFixed(2)} USD). New balance:{" "}
                <strong>{availableCredits.toLocaleString()} credits</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/tools/text-to-video"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#D4FF00] px-4 py-2 text-xs font-extrabold text-black hover:bg-[#e1ff3d]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Create Video
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-black/40 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10"
            >
              View Receipt
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Credit Packs Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Credit packs</h2>
            <p className="mt-1 text-sm text-zinc-400">
              One-time top-ups that never expire. Buy whenever you need extra studio capacity.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {CREDIT_PACKS.map((p) => (
            <div
              key={p.id}
              className={`flex flex-col rounded-2xl border p-6 transition-all ${
                p.highlight
                  ? "border-[#D4FF00]/60 bg-[#D4FF00]/[0.05] shadow-lg shadow-[#D4FF00]/5"
                  : "border-white/10 bg-[#0C0E14] hover:border-white/25"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-200">{p.name}</span>
                {p.highlight && (
                  <span className="rounded-full bg-[#D4FF00] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-black">
                    Most Popular
                  </span>
                )}
              </div>
              <div className="mt-3 text-4xl font-extrabold text-white">
                {p.priceUsd}{" "}
                <span className="text-xs font-normal text-zinc-400">{p.billingNote}</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-[#D4FF00]">
                <Zap className="h-4 w-4 fill-current" />
                {p.credits.toLocaleString()} credits included
              </div>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm text-zinc-300 border-t border-white/10 pt-4">
                {p.estimates.map((e) => (
                  <li key={e} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D4FF00]" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => openPackCheckout(p)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4FF00] py-3 text-sm font-extrabold text-black hover:bg-[#e1ff3d] transition-colors cursor-pointer"
              >
                <CreditCard className="h-4 w-4" />
                Buy {p.name} ({p.priceUsd})
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subscriptions Section */}
      <div className="mt-14">
        <div>
          <h2 className="text-2xl font-bold text-white">Pro Subscriptions</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Automated monthly credit drops, priority GPU queue, and full commercial studio license.
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {SUBSCRIPTION_PLANS.map((p) => {
            const isCurrentActive =
              subscriptionStatus === "active" && activePlanId === p.id;
            return (
              <div
                key={p.id}
                className={`flex flex-col rounded-2xl border p-6 transition-all ${
                  p.highlight
                    ? "border-[#D4FF00]/60 bg-[#D4FF00]/[0.05]"
                    : "border-white/10 bg-[#0C0E14] hover:border-white/25"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-white">{p.name}</span>
                  <div className="flex items-center gap-2">
                    {isCurrentActive && (
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                        Active Plan
                      </span>
                    )}
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#D4FF00]">
                      {p.badge}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-4xl font-extrabold text-white">
                  {p.priceUsd}{" "}
                  <span className="text-sm font-normal text-zinc-400">{p.period}</span>
                </div>
                <ul className="mt-5 flex-1 space-y-2.5 text-sm text-zinc-300 border-t border-white/10 pt-4">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D4FF00]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => openSubCheckout(p)}
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold transition-colors cursor-pointer ${
                    p.highlight
                      ? "bg-[#D4FF00] text-black hover:bg-[#e1ff3d]"
                      : "border border-white/20 bg-white/[0.04] text-white hover:bg-white/10"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  {isCurrentActive
                    ? `Add Another Cycle (+${p.creditsPerMonth.toLocaleString()}c)`
                    : `Subscribe to ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3-Pillar Escrow Guarantee */}
      <div className="mt-14 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:grid-cols-3">
        {[
          [
            "01 See the price first",
            "Exact credit cost is calculated and shown before every generation.",
          ],
          [
            "02 Credits held, then charged",
            "Credits are held in escrow during generation and charged only on success.",
          ],
          [
            "03 Failed jobs cost nothing",
            "Held credits are refunded automatically to your balance if a job fails.",
          ],
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

      {/* Model Credit Costs & Tool Compatibility Table */}
      <h2 className="mt-14 text-2xl font-bold text-white">
        Model credit costs &amp; supported tools
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        Transparent per-model rates and compatible studio workflows across Video, Image, and Audio.
      </p>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-[#0C0E14]">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase text-zinc-400">
            <tr>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Maker</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Compatible Studio Tools</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Unit</th>
            </tr>
          </thead>
          <tbody>
            {MODELS_CATALOG.map((m) => (
              <tr key={m.id} className="border-t border-white/5 text-zinc-300 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-bold text-white">
                  <Link href={`/models/${m.id}`} className="hover:text-[#D4FF00]">
                    {m.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-400">{m.provider}</td>
                <td className="px-4 py-3 capitalize text-xs">{m.category}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(m.supportedTools || []).map((tSlug) => (
                      <Link
                        key={tSlug}
                        href={`/tools/${tSlug}?model=${m.id}`}
                        className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-zinc-300 hover:bg-[#D4FF00] hover:text-black transition-colors"
                      >
                        {tSlug}
                      </Link>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 font-bold text-[#D4FF00]">
                  <Zap className="mr-1 inline h-3 w-3" />
                  {m.baseCredits}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">{m.unitLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =====================================================================
          SECURE CHECKOUT MODAL
         ===================================================================== */}
      {checkoutTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#0C0E14] p-6 sm:p-7 shadow-2xl">
            <button
              type="button"
              onClick={() => setCheckoutTarget(null)}
              aria-label="Close checkout"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4FF00]">
              <Lock className="h-3.5 w-3.5" />
              ReelMux Encrypted Checkout
            </div>
            <h3 className="mt-2 text-2xl font-extrabold text-white">
              {checkoutTarget.itemName}
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              Account: <span className="text-zinc-200">{userEmail || "creator@reelmux.com"}</span>
            </p>

            {/* Summary Box */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/50 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span>Credits included</span>
                <span className="font-bold text-[#D4FF00]">
                  +{checkoutTarget.credits.toLocaleString()} credits
                </span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Billing type</span>
                <span className="capitalize">
                  {checkoutTarget.itemType === "subscription"
                    ? `Recurring (${checkoutTarget.periodLabel})`
                    : "One-time top-up (never expires)"}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-extrabold text-white">
                <span>Total Due Today</span>
                <span>${checkoutTarget.amountUsd.toFixed(2)} USD</span>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Visa •••• 4242", label: "Card •••• 4242" },
                    { id: "Apple Pay", label: "Apple Pay" },
                    { id: "Alipay / WeChat", label: "Alipay" },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`rounded-xl border px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        paymentMethod === pm.id
                          ? "border-[#D4FF00] bg-[#D4FF00]/15 text-[#D4FF00]"
                          : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/25"
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Cardholder / Billing Name
                </label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#131722] px-3.5 py-2.5 text-sm text-white focus:border-[#D4FF00] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={processing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4FF00] py-3.5 text-sm font-extrabold text-black hover:bg-[#e1ff3d] disabled:opacity-50 transition-all cursor-pointer"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Pay ${checkoutTarget.amountUsd.toFixed(2)} &amp; Unlock{" "}
                    {checkoutTarget.credits.toLocaleString()} Credits
                  </>
                )}
              </button>
            </form>

            <p className="mt-3 text-center text-[11px] text-zinc-500">
              Instant credit delivery · Commercial usage rights included · Cancel subscription
              anytime in Workspace
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
