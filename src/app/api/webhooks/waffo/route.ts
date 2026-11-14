import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@waffo/pancake-ts";
import { getAdminStore } from "@/lib/admin/store";
import { getWaffoConfig } from "@/lib/waffo/client";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const cfg = getWaffoConfig();
  return NextResponse.json({
    ok: true,
    service: "ReelMux Waffo Pancake Webhook Receiver",
    webhookEndpoint: "https://reelmux.com/api/webhooks/waffo",
    environment: cfg.environment,
    merchantConfigured: Boolean(cfg.merchantId && cfg.privateKey),
    supportedEvents: [
      "order.completed",
      "subscription.activated",
      "subscription.renewed",
      "subscription.canceled",
      "refund.succeeded",
    ],
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get("x-waffo-signature") ||
      req.headers.get("X-Waffo-Signature");

    const cfg = getWaffoConfig();
    let event: {
      id?: string;
      type: string;
      data: Record<string, unknown>;
    };

    if (signature) {
      event = verifyWebhook(rawBody, signature, {
        environment: cfg.environment,
      }) as unknown as {
        id?: string;
        type: string;
        data: Record<string, unknown>;
      };
    } else {
      // Allow local/admin test webhook trigger when x-reelmux-admin-test is set
      if (req.headers.get("x-reelmux-admin-test") !== "1") {
        return NextResponse.json(
          { error: "Missing X-Waffo-Signature header" },
          { status: 401 }
        );
      }
      event = JSON.parse(rawBody);
    }

    const store = getAdminStore();
    const nowIso =
      new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
    const data = event.data || {};
    const orderId = String(
      data.orderId || data.orderMerchantExternalId || `WAF-${Date.now()}`
    );
    const buyerEmail = String(
      data.buyerEmail || data.buyerIdentity || "creator@reelmux.com"
    );
    const productName = String(data.productName || "Waffo Pancake Order");
    const creditsGranted = Number(
      (data.metadata as Record<string, unknown>)?.credits ||
        data.credits ||
        3200
    );
    const amountUsd = Number(data.amount || 29);

    if (
      event.type === "order.completed" ||
      event.type === "subscription.activated" ||
      event.type === "subscription.renewed"
    ) {
      store.orders.unshift({
        id: `ord-${Date.now()}`,
        orderNo: orderId,
        userEmail: buyerEmail,
        itemType: event.type.startsWith("subscription.")
          ? "subscription"
          : "credit_pack",
        itemName: `${productName} (+${creditsGranted.toLocaleString()} credits)`,
        amountUsd,
        creditsGranted,
        paymentMethod: "Waffo Pancake (pancake.waffo.ai)",
        status: "paid",
        ipAddress: "Waffo MoR Webhook",
        createdAt: nowIso,
      });

      const user = store.users.find(
        (u) => u.email.toLowerCase() === buyerEmail.toLowerCase()
      );
      if (user) {
        user.balanceAvailable += creditsGranted;
        user.paidTotalUsd = Number((user.paidTotalUsd + amountUsd).toFixed(2));
        if (event.type.startsWith("subscription.")) {
          user.planTier = "pro_monthly";
        }
      }

      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorEmail: "webhook@waffo.ai",
        action: `waffo.${event.type}`,
        targetType: "order",
        targetId: orderId,
        summary: `Waffo Pancake Webhook [${event.type}]: Credited +${creditsGranted.toLocaleString()}c to ${buyerEmail} ($${amountUsd.toFixed(
          2
        )} USD).`,
        ipAddress: "api.waffo.ai",
        createdAt: nowIso,
      });

      try {
        const supabase = createSupabaseServiceClient();
        if (supabase) {
          await supabase.from("billing_orders").insert({
            order_no: orderId,
            user_email: buyerEmail,
            item_type: event.type.startsWith("subscription.")
              ? "subscription"
              : "credit_pack",
            item_name: productName,
            amount_usd: amountUsd,
            credits_granted: creditsGranted,
            payment_method: "Waffo Pancake",
            status: "paid",
            ip_address: "api.waffo.ai",
          });
        }
      } catch {
        // Non-blocking
      }
    } else if (event.type === "refund.succeeded") {
      const targetOrder = store.orders.find((o) => o.orderNo === orderId);
      if (targetOrder) {
        targetOrder.status = "refunded";
      }
      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorEmail: "webhook@waffo.ai",
        action: "waffo.refund.succeeded",
        targetType: "order",
        targetId: orderId,
        summary: `Waffo Pancake Webhook [refund.succeeded]: Order ${orderId} marked refunded.`,
        ipAddress: "api.waffo.ai",
        createdAt: nowIso,
      });
    }

    return NextResponse.json({ received: true, type: event.type, orderId });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Webhook verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
