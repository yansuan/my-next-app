import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@waffo/pancake-ts";
import { getAdminStore } from "@/lib/admin/store";
import { getWaffoConfig } from "@/lib/waffo/client";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  resolveCatalogPlan,
  resolvePlanByAmountCents,
} from "@/lib/catalog/pricing";

const globalForWebhook = globalThis as unknown as {
  processedWaffoEventIds?: Set<string>;
};

function getProcessedEventSet(): Set<string> {
  if (!globalForWebhook.processedWaffoEventIds) {
    globalForWebhook.processedWaffoEventIds = new Set<string>();
  }
  return globalForWebhook.processedWaffoEventIds;
}

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

    if (!signature) {
      return NextResponse.json(
        { error: "Missing X-Waffo-Signature header" },
        { status: 401 }
      );
    }

    const cfg = getWaffoConfig();
    const event = verifyWebhook(rawBody, signature, {
      environment: cfg.environment,
    }) as unknown as {
      id?: string;
      type: string;
      data: Record<string, unknown>;
    };

    const eventId =
      event.id ||
      `sha256_${crypto.createHash("sha256").update(rawBody).digest("hex")}`;

    const processedSet = getProcessedEventSet();
    if (processedSet.has(eventId)) {
      return NextResponse.json({
        received: true,
        duplicate: true,
        eventId,
      });
    }

    const supabase = createSupabaseServiceClient();
    if (supabase) {
      const { data: existingEvent } = await supabase
        .from("waffo_webhook_events")
        .select("event_id")
        .eq("event_id", eventId)
        .maybeSingle();

      if (existingEvent) {
        processedSet.add(eventId);
        return NextResponse.json({
          received: true,
          duplicate: true,
          eventId,
        });
      }
    }

    const store = getAdminStore();
    const nowIso =
      new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
    const data = event.data || {};
    const orderNo = String(
      data.orderMerchantExternalId || data.orderId || `WAF-${Date.now()}`
    );

    const isSubscriptionEvent = event.type.startsWith("subscription.");

    // Resolve authoritative order/pricing metadata instead of trusting arbitrary webhook fields
    let existingDbOrder: {
      user_id: string | null;
      user_email: string;
      item_type: string;
      item_id: string;
      item_name: string;
      amount_cents: number;
      credits_granted: number;
      status: string;
    } | null = null;

    if (supabase) {
      const { data: dbOrd } = await supabase
        .from("billing_orders")
        .select(
          "user_id, user_email, item_type, item_id, item_name, amount_cents, credits_granted, status"
        )
        .eq("order_no", orderNo)
        .maybeSingle();
      existingDbOrder = dbOrd;
    }

    const storeOrder = store.orders.find((o) => o.orderNo === orderNo);
    const meta = (data.metadata as Record<string, unknown>) || {};
    const catalogSpec =
      resolveCatalogPlan(String(existingDbOrder?.item_id || meta.itemId || data.productId || "")) ||
      resolvePlanByAmountCents(
        Math.round(Number(data.amount || 0) * 100),
        isSubscriptionEvent
      );

    const buyerEmail = String(
      existingDbOrder?.user_email ||
        storeOrder?.userEmail ||
        data.buyerEmail ||
        (typeof data.buyerIdentity === "string" && data.buyerIdentity.includes("@")
          ? data.buyerIdentity
          : "unknown@reelmux.com")
    );

    const itemType =
      existingDbOrder?.item_type === "subscription" || isSubscriptionEvent
        ? "subscription"
        : "credit_pack";
    const itemId =
      existingDbOrder?.item_id || catalogSpec?.itemId || "unknown-item";
    const itemName =
      existingDbOrder?.item_name ||
      catalogSpec?.itemName ||
      String(data.productName || "Waffo Pancake Order");
    const amountCents =
      existingDbOrder?.amount_cents ??
      catalogSpec?.amountCents ??
      Math.max(0, Math.round(Number(data.amount || 0) * 100));
    const creditsGranted =
      existingDbOrder?.credits_granted ?? catalogSpec?.credits ?? 0;
    const amountUsd = Number((amountCents / 100).toFixed(2));

    if (supabase) {
      await supabase.from("waffo_webhook_events").insert({
        event_id: eventId,
        event_type: event.type,
        order_no: orderNo,
        payload: event as unknown as Record<string, unknown>,
      });
    }
    processedSet.add(eventId);

    if (
      event.type === "order.completed" ||
      event.type === "subscription.activated" ||
      event.type === "subscription.renewed"
    ) {
      if (creditsGranted <= 0) {
        return NextResponse.json(
          { error: `Unable to resolve credit grant for order ${orderNo}` },
          { status: 422 }
        );
      }

      if (supabase) {
        await supabase.rpc("grant_credits_from_order", {
          p_order_no: orderNo,
          p_user_id: existingDbOrder?.user_id || null,
          p_user_email: buyerEmail,
          p_item_type: itemType,
          p_item_id: itemId,
          p_item_name: itemName,
          p_amount_cents: amountCents,
          p_credits_granted: creditsGranted,
          p_payment_method: "Waffo Pancake (pancake.waffo.ai)",
          p_ip_address: "api.waffo.ai",
          p_next_plan_tier: catalogSpec?.planTier || null,
        });
      }

      if (storeOrder) {
        if (storeOrder.status !== "paid") {
          storeOrder.status = "paid";
          const user = store.users.find(
            (u) => u.email.toLowerCase() === buyerEmail.toLowerCase()
          );
          if (user) {
            user.balanceAvailable += creditsGranted;
            user.paidTotalUsd = Number((user.paidTotalUsd + amountUsd).toFixed(2));
            if (itemType === "subscription") {
              user.planTier = "pro_monthly";
            }
          }
        }
      } else {
        store.orders.unshift({
          id: `ord-${Date.now()}`,
          orderNo,
          userEmail: buyerEmail,
          itemType,
          itemName: `${itemName} (+${creditsGranted.toLocaleString()} credits)`,
          amountUsd,
          creditsGranted,
          paymentMethod: "Waffo Pancake (pancake.waffo.ai)",
          status: "paid",
          ipAddress: "Waffo MoR Webhook",
          createdAt: nowIso,
        });
      }

      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorEmail: "webhook@waffo.ai",
        action: `waffo.${event.type}`,
        targetType: "order",
        targetId: orderNo,
        summary: `Waffo Pancake Webhook [${event.type}]: Credited +${creditsGranted.toLocaleString()}c to ${buyerEmail} ($${amountUsd.toFixed(
          2
        )} USD).`,
        ipAddress: "api.waffo.ai",
        createdAt: nowIso,
      });
    } else if (event.type === "refund.succeeded") {
      if (supabase) {
        await supabase
          .from("billing_orders")
          .update({ status: "refunded" })
          .eq("order_no", orderNo);
      }

      if (storeOrder) {
        storeOrder.status = "refunded";
      }
      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorEmail: "webhook@waffo.ai",
        action: "waffo.refund.succeeded",
        targetType: "order",
        targetId: orderNo,
        summary: `Waffo Pancake Webhook [refund.succeeded]: Order ${orderNo} marked refunded.`,
        ipAddress: "api.waffo.ai",
        createdAt: nowIso,
      });
    }

    return NextResponse.json({
      received: true,
      eventId,
      type: event.type,
      orderNo,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Webhook verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
