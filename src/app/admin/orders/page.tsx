"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  RotateCw,
  RotateCcw,
  ExternalLink,
  KeyRound,
  Webhook,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { AdminOrderRecord } from "@/lib/admin/store";

interface WaffoSetupState {
  configured: boolean;
  merchantId: string;
  hasPrivateKey: boolean;
  privateKeyMasked: string;
  environment: "test" | "prod";
  storeId: string;
  storeSlug: string;
  webhookUrl: string;
  portalUrl: string;
  productMap: Record<string, string>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Waffo Pancake Configuration State
  const [waffo, setWaffo] = useState<WaffoSetupState | null>(null);
  const [merchantId, setMerchantId] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [environment, setEnvironment] = useState<"test" | "prod">("prod");
  const [storeId, setStoreId] = useState("");
  const [storeSlug, setStoreSlug] = useState("reelmux");
  const [productMap, setProductMap] = useState<Record<string, string>>({
    starter: "",
    creator: "",
    studio: "",
    "pro-monthly": "",
    "pro-yearly": "",
  });
  const [savingWaffo, setSavingWaffo] = useState(false);
  const [provisioningWaffo, setProvisioningWaffo] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [showGatewayConfig, setShowGatewayConfig] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [adminRes, waffoRes] = await Promise.all([
        fetch("/api/admin"),
        fetch("/api/billing/waffo-setup"),
      ]);
      const data = await adminRes.json();
      setOrders(data.orders || []);

      if (waffoRes.ok) {
        const wData: WaffoSetupState = await waffoRes.json();
        setWaffo(wData);
        setMerchantId(wData.merchantId || "");
        setEnvironment(wData.environment || "prod");
        setStoreId(wData.storeId || "");
        setStoreSlug(wData.storeSlug || "reelmux");
        if (wData.productMap) {
          setProductMap((prev) => ({ ...prev, ...wData.productMap }));
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefundOrder = async (order: AdminOrderRecord) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "refund_order", orderId: order.id }),
    });
    if (res.ok) {
      setToast(`Refunded order ${order.orderNo} ($${order.amountUsd})`);
      setTimeout(() => setToast(null), 3500);
      loadData();
    }
  };

  const handleSaveWaffoConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWaffo(true);
    try {
      const res = await fetch("/api/billing/waffo-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_config",
          merchantId,
          privateKey: privateKey.trim() || undefined,
          environment,
          storeId,
          storeSlug,
          productMap,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setToast("Saved Waffo Pancake merchant gateway settings.");
        setPrivateKey("");
        loadData();
      } else {
        setToast(`Error: ${data.error || "Failed to save settings"}`);
      }
    } finally {
      setSavingWaffo(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleAutoProvisionWaffo = async () => {
    setProvisioningWaffo(true);
    try {
      const res = await fetch("/api/billing/waffo-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auto_provision",
          merchantId,
          privateKey: privateKey.trim() || undefined,
          environment,
          storeId,
          storeSlug,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setToast(
          `Auto-provisioned Waffo Store (${data.provisioned.storeId}), 5 Products & Webhook!`
        );
        setPrivateKey("");
        loadData();
      } else {
        setToast(`Auto-Provision Notice: ${data.error || "Check Merchant ID & Private Key"}`);
      }
    } finally {
      setProvisioningWaffo(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const copyWebhookUrl = () => {
    const url = waffo?.webhookUrl || "https://reelmux.com/api/webhooks/waffo";
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Orders &amp; Waffo Pancake Cashier
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Manage global payments via{" "}
            <a
              href="https://pancake.waffo.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline hover:text-cyan-300"
            >
              pancake.waffo.ai
            </a>
            , credit pack purchases, and recurring studio subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://pancake.waffo.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-400/20"
          >
            Open pancake.waffo.ai Console
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-zinc-100 hover:bg-white/[0.08] cursor-pointer"
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

      {/* =====================================================================
          WAFFO PANCAKE (https://pancake.waffo.ai/) GATEWAY SETUP CENTER
         ===================================================================== */}
      <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-[#0B0E17] via-[#0B0C10] to-[#0D131A] p-5 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Waffo Pancake Payment Gateway (pancake.waffo.ai)
                </h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    waffo?.configured
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {waffo?.configured ? "RSA-SHA256 Connected" : "Ready for Merchant Key"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Official{" "}
                <code className="text-cyan-300">@waffo/pancake-ts</code> SDK integration · External
                browser checkout mode enabled (<code className="text-zinc-300">target=&quot;_blank&quot;</code>)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowGatewayConfig((v) => !v)}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white cursor-pointer"
          >
            {showGatewayConfig ? (
              <>
                Hide Setup <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Configure Gateway <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>

        {showGatewayConfig && (
          <form onSubmit={handleSaveWaffoConfig} className="mt-5 space-y-4 border-t border-white/10 pt-4">
            {/* Webhook Endpoint Bar */}
            <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/40 p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5 text-xs">
                <Webhook className="h-4 w-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="font-semibold text-zinc-200">RSA-SHA256 Webhook Endpoint: </span>
                  <code className="font-mono text-cyan-300">
                    {waffo?.webhookUrl || "https://reelmux.com/api/webhooks/waffo"}
                  </code>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Events: <code>order.completed</code>, <code>subscription.activated</code>,{" "}
                    <code>subscription.renewed</code>, <code>subscription.canceled</code>,{" "}
                    <code>refund.succeeded</code>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={copyWebhookUrl}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 shrink-0 cursor-pointer"
              >
                {copiedWebhook ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Webhook URL
                  </>
                )}
              </button>
            </div>

            {/* Credentials Grid */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Merchant ID (WAFFO_MERCHANT_ID)
                </label>
                <input
                  type="text"
                  placeholder="MER_..."
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#12151E] px-3 py-2 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Environment (WAFFO_ENV)
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as "prod" | "test")}
                  className="w-full rounded-lg border border-white/15 bg-[#12151E] px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="prod">Production (api.waffo.ai)</option>
                  <option value="test">Sandbox (api-Interactive-test.waffo.ai)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Store ID (WAFFO_STORE_ID)
                </label>
                <input
                  type="text"
                  placeholder="STO_..."
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#12151E] px-3 py-2 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Store Slug (WAFFO_STORE_SLUG)
                </label>
                <input
                  type="text"
                  placeholder="reelmux"
                  value={storeSlug}
                  onChange={(e) => setStoreSlug(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#12151E] px-3 py-2 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Private Key + Product Map */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Merchant RSA Private Key PEM (WAFFO_PRIVATE_KEY){" "}
                  {waffo?.hasPrivateKey && (
                    <span className="text-emerald-400 font-normal">
                      (Saved: {waffo.privateKeyMasked})
                    </span>
                  )}
                </label>
                <textarea
                  rows={4}
                  placeholder="-----BEGIN PRIVATE KEY-----&#10;MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...&#10;-----END PRIVATE KEY-----"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#12151E] p-2.5 font-mono text-[11px] text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Waffo Product IDs (PROD_...) — Auto-filled when using 1-Click Auto-Provision
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["starter", "Starter Pack ($9.90)"],
                    ["creator", "Creator Pack ($29)"],
                    ["studio", "Studio Pack ($79)"],
                    ["pro-monthly", "Pro Monthly ($19.90)"],
                    ["pro-yearly", "Pro Yearly ($199)"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <span className="block text-[10px] text-zinc-400">{label}</span>
                      <input
                        type="text"
                        placeholder="PROD_..."
                        value={productMap[key] || ""}
                        onChange={(e) =>
                          setProductMap((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="mt-0.5 w-full rounded border border-white/15 bg-[#12151E] px-2.5 py-1.5 font-mono text-[11px] text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>
                  Once <code className="text-zinc-200">MER_...</code> and Private Key are entered,
                  click <strong>Auto-Provision</strong> to create the Store, 5 Products, and Webhook
                  automatically on Waffo.
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={provisioningWaffo}
                  onClick={handleAutoProvisionWaffo}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-cyan-400/15 px-3.5 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-400/25 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {provisioningWaffo
                    ? "Provisioning on Waffo..."
                    : "1-Click Auto-Provision Store, 5 Products & Webhook"}
                </button>
                <button
                  type="submit"
                  disabled={savingWaffo}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4FF00] px-4 py-2 text-xs font-extrabold text-black hover:bg-[#e2ff4d] disabled:opacity-50 cursor-pointer"
                >
                  {savingWaffo ? "Saving..." : "Save Waffo Config"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0B0C10]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.07] text-[11px] font-medium text-zinc-400">
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Credits</th>
              <th className="px-4 py-3">Payment Gateway</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-white/[0.025]">
                <td className="px-4 py-3.5 font-mono font-semibold text-white">
                  {o.orderNo}
                  <div className="text-[10px] font-normal text-zinc-500">{o.createdAt}</div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="text-zinc-200">{o.userEmail}</div>
                  <div className="font-mono text-[10px] text-zinc-500">{o.ipAddress}</div>
                </td>
                <td className="px-4 py-3.5 text-zinc-200">{o.itemName}</td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">
                  ${o.amountUsd.toFixed(2)}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-[#D4FF00]">
                  +{o.creditsGranted.toLocaleString()}c
                </td>
                <td className="px-4 py-3.5 text-zinc-300">{o.paymentMethod}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                      o.status === "paid"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  {o.status === "paid" && (
                    <button
                      type="button"
                      onClick={() => handleRefundOrder(o)}
                      className="inline-flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
