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
  ExternalLink,
  Globe,
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
  const [paymentMethod, setPaymentMethod] = useState<string>(
    "Waffo Pancake Cashier (Card / Apple Pay)"
  );
  const [cardHolder, setCardHolder] = useState<string>("ReelMux Studio Creator");
  const [openExternalBrowser, setOpenExternalBrowser] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    orderNo: string;
    itemName: string;
    credits: number;
    amountUsd: number;
    itemType: "credit_pack" | "subscription";
    waffoCheckoutUrl?: string;
  } | null>(null);

  const openPackCheckout = (pack: (typeof CREDIT_PACKS)[number]) => {
    setCheckoutError(null);
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
    setCheckoutError(null);
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
    setCheckoutError(null);
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

      const checkoutUrl =
        result.waffoCheckoutUrl ||
        `https://pancake.waffo.ai/checkout/${encodeURIComponent(checkoutTarget.itemId)}?order=${encodeURIComponent(result.orderNo)}`;

      // Open Waffo Pancake Hosted Cashier in External Browser Tab
      if (openExternalBrowser && typeof window !== "undefined") {
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      }

      setReceipt({
        orderNo: result.orderNo,
        itemName: checkoutTarget.itemName,
        credits: checkoutTarget.credits,
        amountUsd: checkoutTarget.amountUsd,
        itemType: checkoutTarget.itemType,
        waffoCheckoutUrl: checkoutUrl,
      });
      setCheckoutTarget(null);
    } catch (err: unknown) {
      setCheckoutError(
        err instanceof Error
          ? err.message
          : "Unable to create checkout session."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
            <Globe className="h-3.5 w-3.5" />
            Global Cashier Powered by Waffo Pancake · 73+ AI Video, Image &amp; Audio Models
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            One Studio Wallet for Every Flagship Model
          </h1>
          <p className="mt-3 max-w-2xl text-base text-zinc-400">
            Top up non-expiring credits or activate a monthly Pro Studio pass via{" "}
            <a
              href="https://pancake.waffo.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 underline decoration-cyan-400/40 hover:text-cyan-200"
            >
              Waffo Pancake Global Checkout ↗
            </a>
            . Spend your balance across Kling 4.0, Seedance 2.5, Veo 3.1, Multi-Shot Storyboard, and
            Suno v6.
          </p>
        </div>

        {/* Live Wallet & Subscription Status Card */}
        <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#0C0F17] to-[#0A0C12] p-4 sm:p-5 min-w-[310px] shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Current Studio Balance</span>
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
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] text-zinc-400">
            <a
              href="https://pancake.waffo.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-cyan-300 hover:text-cyan-200"
            >
              Waffo Billing Portal
              <ExternalLink className="h-3 w-3" />
            </a>
            {subscriptionStatus === "active" && nextBillingDate ? (
              <button
                type="button"
                onClick={cancelSubscription}
                className="text-rose-400 hover:underline cursor-pointer"
              >
                Cancel renewal ({nextBillingDate})
              </button>
            ) : (
              <span className="text-zinc-500">Escrow Protected</span>
            )}
          </div>
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
                Waffo Checkout Session Created · #{receipt.orderNo}
              </div>
              <p className="mt-0.5 text-xs text-emerald-200">
                Complete payment for <strong>{receipt.itemName}</strong> ($
                {receipt.amountUsd.toFixed(2)} USD) in the Waffo Pancake Cashier.
                <strong> +{receipt.credits.toLocaleString()} credits</strong> will be
                credited automatically once webhook confirmation arrives. Current balance:{" "}
                <strong>{availableCredits.toLocaleString()} credits</strong>.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {receipt.waffoCheckoutUrl && (
              <a
                href={receipt.waffoCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-400/15 px-3.5 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-400/25"
              >
                Open Waffo Cashier
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <Link
              href="/storyboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#D4FF00] px-4 py-2 text-xs font-extrabold text-black hover:bg-[#e1ff3d]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Open Storyboard Studio
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
            <h2 className="text-2xl font-bold text-white">One-Time Credit Packs</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Non-expiring studio credits processed via Waffo Pancake external checkout.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {CREDIT_PACKS.map((p) => (
            <div
              key={p.id}
              className={`flex flex-col rounded-2xl border p-6 transition-all ${
                p.highlight
                  ? "border-cyan-400/60 bg-gradient-to-b from-cyan-500/[0.08] to-[#D4FF00]/[0.04] shadow-lg shadow-cyan-500/10"
                  : "border-white/10 bg-[#0C0E14] hover:border-white/25"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-200">{p.name}</span>
                {p.highlight && (
                  <span className="rounded-full bg-gradient-to-r from-cyan-400 to-[#D4FF00] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-black">
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
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => openPackCheckout(p)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4FF00] to-[#6EE7B7] py-3 text-sm font-extrabold text-black hover:brightness-105 transition-all cursor-pointer"
              >
                <CreditCard className="h-4 w-4" />
                Checkout {p.name} ({p.priceUsd})
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subscriptions Section */}
      <div className="mt-14">
        <div>
          <h2 className="text-2xl font-bold text-white">Pro Studio Subscriptions</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Automated monthly credit drops, Multi-Shot Storyboard priority queue, and commercial
            licensing via Waffo Pancake recurring billing.
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
                    ? "border-cyan-400/60 bg-gradient-to-b from-cyan-500/[0.08] to-[#D4FF00]/[0.04]"
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
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
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
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold transition-all cursor-pointer ${
                    p.highlight
                      ? "bg-gradient-to-r from-[#D4FF00] to-[#6EE7B7] text-black hover:brightness-105"
                      : "border border-white/20 bg-white/[0.04] text-white hover:bg-white/10"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  {isCurrentActive
                    ? `Add Another Cycle (+${p.creditsPerMonth.toLocaleString()}c)`
                    : `Subscribe via Waffo Pancake`}
                  <ExternalLink className="h-3.5 w-3.5" />
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
            "01 Exact Upfront Quote",
            "Exact credit cost is calculated and shown before every video, image, or storyboard run.",
          ],
          [
            "02 Escrow-Backed Execution",
            "Credits are held in escrow during generation and settled only when your media renders.",
          ],
          [
            "03 Waffo Buyer Protection",
            "Hosted checkout on pancake.waffo.ai with global local payment methods and instant receipts.",
          ],
        ].map(([t, d]) => (
          <div key={t} className="flex gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-cyan-400" />
            <div>
              <div className="text-sm font-semibold text-white">{t}</div>
              <p className="text-xs text-zinc-400">{d}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Model Credit Costs & Tool Compatibility Table */}
      <h2 className="mt-14 text-2xl font-bold text-white">
        Model credit costs &amp; supported studio tools
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        Transparent per-model rates across Video, Image, Audio, and Multi-Shot Storyboard.
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
          WAFFO PANCAKE EXTERNAL BROWSER CHECKOUT MODAL
         ===================================================================== */}
      {checkoutTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-cyan-400/30 bg-[#0B0E17] p-6 sm:p-7 shadow-2xl">
            <button
              type="button"
              onClick={() => setCheckoutTarget(null)}
              aria-label="Close checkout"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
              <Lock className="h-3.5 w-3.5" />
              Waffo Pancake Hosted Checkout (pancake.waffo.ai)
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
              <div className="flex justify-between text-zinc-300">
                <span>Payment Gateway</span>
                <span className="text-cyan-300 font-semibold">Waffo Pancake Global MoR</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-extrabold text-white">
                <span>Total Due Today</span>
                <span>${checkoutTarget.amountUsd.toFixed(2)} USD</span>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className="mt-5 space-y-4">
              {checkoutError && (
                <div className="rounded-xl border border-rose-400/35 bg-rose-500/10 p-3 text-xs text-rose-200">
                  <p>{checkoutError}</p>
                  {checkoutError.toLowerCase().includes("sign in") && (
                    <Link
                      href="/auth?next=/pricing"
                      className="mt-1.5 inline-block font-bold text-[#D4FF00] underline"
                    >
                      Sign in with Google →
                    </Link>
                  )}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Preferred Payment Channel on Waffo Pancake
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: "Waffo Pancake Cashier (Card / Apple Pay)",
                      label: "Card / Apple Pay",
                    },
                    {
                      id: "Waffo Pancake (Alipay / WeChat)",
                      label: "Alipay / WeChat",
                    },
                    {
                      id: "Waffo Global Wallet (PIX / Local)",
                      label: "Global Wallets",
                    },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`rounded-xl border px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        paymentMethod === pm.id
                          ? "border-cyan-400 bg-cyan-400/15 text-cyan-200"
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
                  Billing Name / Studio Receipt Title
                </label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#131722] px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* External Browser Launch Toggle */}
              <label className="flex items-start gap-2.5 rounded-xl border border-cyan-400/25 bg-cyan-400/[0.06] p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={openExternalBrowser}
                  onChange={(e) => setOpenExternalBrowser(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-cyan-400"
                />
                <div className="text-xs">
                  <div className="font-bold text-white flex items-center gap-1">
                    Launch Waffo Pancake Cashier in External Browser
                    <ExternalLink className="h-3 w-3 text-cyan-300" />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Opens <code className="text-cyan-300">https://pancake.waffo.ai/checkout/...</code>{" "}
                    in a new browser window while syncing your studio credits via webhook.
                  </p>
                </div>
              </label>

              <button
                type="submit"
                disabled={processing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4FF00] to-[#6EE7B7] py-3.5 text-sm font-extrabold text-black hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Waffo Checkout Session...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Proceed to Waffo Pancake (${checkoutTarget.amountUsd.toFixed(2)})
                    <ExternalLink className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-3 text-center text-[11px] text-zinc-500">
              RSA-SHA256 verified webhook (<code className="text-zinc-400">/api/webhooks/waffo</code>)
              · Instant credit delivery
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
