import { NextRequest, NextResponse } from "next/server";
import { getAdminStore, AdminOrderRecord } from "@/lib/admin/store";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userEmail = "creator@reelmux.com",
      itemId = "creator",
      itemName = "Creator Pack",
      itemType = "credit_pack",
      amountUsd = 29,
      creditsGranted = 3200,
      paymentMethod = "Visa •••• 4242",
    } = body;

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "103.149.28.11";

    const nowIso = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const orderNo = `RMX-${datePart}-${randSuffix}`;

    const newOrder: AdminOrderRecord = {
      id: `ord-${Date.now()}`,
      orderNo,
      userEmail,
      itemType: itemType === "subscription" ? "subscription" : "credit_pack",
      itemName: `${itemName} (${Number(creditsGranted).toLocaleString()} credits)`,
      amountUsd: Number(amountUsd),
      creditsGranted: Number(creditsGranted),
      paymentMethod,
      status: "paid",
      ipAddress,
      createdAt: nowIso,
    };

    const store = getAdminStore();
    store.orders.unshift(newOrder);

    const existingUser = store.users.find(
      (u) => u.email.toLowerCase() === String(userEmail).toLowerCase()
    );
    if (existingUser) {
      existingUser.balanceAvailable += Number(creditsGranted);
      existingUser.paidTotalUsd = Number(
        (existingUser.paidTotalUsd + Number(amountUsd)).toFixed(2)
      );
      if (itemType === "subscription") {
        existingUser.planTier = "pro_monthly";
      } else if (itemId === "studio") {
        existingUser.planTier = "studio";
      } else if (itemId === "creator") {
        existingUser.planTier = "creator";
      } else if (itemId === "starter") {
        existingUser.planTier = "starter";
      }
    } else {
      store.users.unshift({
        id: `usr-${Date.now()}`,
        email: userEmail,
        displayName: userEmail.split("@")[0],
        planTier:
          itemType === "subscription"
            ? "pro_monthly"
            : itemId === "studio"
              ? "studio"
              : itemId === "creator"
                ? "creator"
                : "starter",
        balanceAvailable: 100 + Number(creditsGranted),
        balanceReserved: 0,
        freeCreditsGranted: true,
        paidTotalUsd: Number(amountUsd),
        generationsCount: 0,
        signupIp: ipAddress,
        deviceFingerprint: "9f81c20b4e77a12d8890c123f45a6789",
        status: "active",
        createdAt: nowIso,
      });
    }

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorEmail: userEmail,
      action: itemType === "subscription" ? "subscription.activated" : "order.completed",
      targetType: "order",
      targetId: orderNo,
      summary: `${
        itemType === "subscription" ? "Activated subscription" : "Purchased credit pack"
      } ${itemName} (+${Number(creditsGranted).toLocaleString()} credits, $${Number(
        amountUsd
      ).toFixed(2)} USD via ${paymentMethod}).`,
      ipAddress,
      createdAt: nowIso,
    });

    // Optional: also persist to Supabase billing_orders table if service key is configured
    try {
      const supabase = createSupabaseServiceClient();
      if (supabase) {
        await supabase.from("billing_orders").insert({
          order_no: orderNo,
          user_email: userEmail,
          item_type: newOrder.itemType,
          item_name: newOrder.itemName,
          amount_usd: newOrder.amountUsd,
          credits_granted: newOrder.creditsGranted,
          payment_method: newOrder.paymentMethod,
          status: "paid",
          ip_address: ipAddress,
        });
      }
    } catch {
      // Non-blocking fallback to in-memory store
    }

    return NextResponse.json({
      ok: true,
      order: newOrder,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
