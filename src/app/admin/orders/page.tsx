"use client";

import React, { useEffect, useState, useCallback } from "react";
import { RotateCw, RotateCcw } from "lucide-react";
import type { AdminOrderRecord } from "@/lib/admin/store";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      setOrders(data.orders || []);
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
      setTimeout(() => setToast(null), 3000);
      loadData();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Orders</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Credit pack purchases and recurring studio subscriptions across all accounts.
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
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Credits</th>
              <th className="px-4 py-3">Payment Method</th>
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
                  ${o.amountUsd}.00
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-[#D4FF00]">
                  +{o.creditsGranted.toLocaleString()}c
                </td>
                <td className="px-4 py-3.5 text-zinc-400">{o.paymentMethod}</td>
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
