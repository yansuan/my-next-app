import { NextRequest, NextResponse } from "next/server";
import { getAdminStore, AdminOrderRecord } from "@/lib/admin/store";
import {
  createSupabaseServiceClient,
  getAuthenticatedUser,
} from "@/lib/supabase/server";
import { createWaffoClient, getWaffoConfig } from "@/lib/waffo/client";
import { resolveCatalogPlan } from "@/lib/catalog/pricing";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in with Google." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const rawItemId = String(body?.itemId || "creator-pack");
    const plan = resolveCatalogPlan(rawItemId);
    if (!plan) {
      return NextResponse.json(
        { error: `Unknown billing plan or credit pack: ${rawItemId}` },
        { status: 400 }
      );
    }

    const paymentMethod = String(
      body?.paymentMethod || "Waffo Pancake (pancake.waffo.ai)"
    ).slice(0, 120);

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const nowIso =
      new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const orderNo = `RMX-${datePart}-${randSuffix}`;

    const waffoCfg = getWaffoConfig();
    const waffoClient = createWaffoClient();
    const mappedProductId = waffoCfg.productMap[plan.waffoProductKey] || "";

    let waffoCheckoutUrl = `https://pancake.waffo.ai/checkout/${encodeURIComponent(
      waffoCfg.storeSlug || "reelmux"
    )}/${encodeURIComponent(mappedProductId || plan.waffoProductKey)}?currency=USD&email=${encodeURIComponent(
      user.email
    )}&success_url=${encodeURIComponent(
      `https://reelmux.com/dashboard?payment=success&order=${orderNo}`
    )}`;
    let waffoSessionLive = false;

    if (waffoClient && mappedProductId.startsWith("PROD_")) {
      try {
        const session = await waffoClient.checkout.authenticated.create({
          productId: mappedProductId,
          currency: "USD",
          buyerIdentity: user.id,
          buyerEmail: user.email,
          orderMerchantExternalId: orderNo,
        });
        if (session?.checkoutUrl) {
          waffoCheckoutUrl = session.checkoutUrl;
          waffoSessionLive = true;
        }
      } catch {
        // Fallback to direct Waffo Pancake storefront link
      }
    }

    const pendingOrder: AdminOrderRecord = {
      id: `ord-${Date.now()}`,
      orderNo,
      userEmail: user.email,
      itemType: plan.itemType,
      itemName: `${plan.itemName} (${plan.credits.toLocaleString()} credits)`,
      amountUsd: plan.amountUsd,
      creditsGranted: plan.credits,
      paymentMethod,
      status: "pending",
      ipAddress,
      createdAt: nowIso,
    };

    const store = getAdminStore();
    store.orders.unshift(pendingOrder);
    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorEmail: user.email,
      action: "checkout.session.created",
      targetType: "order",
      targetId: orderNo,
      summary: `Created pending Waffo checkout for ${plan.itemName} ($${plan.amountUsd.toFixed(
        2
      )} USD · ${plan.credits.toLocaleString()} credits pending webhook confirmation).`,
      ipAddress,
      createdAt: nowIso,
    });

    const supabase = createSupabaseServiceClient();
    if (supabase) {
      await supabase.from("billing_orders").insert({
        order_no: orderNo,
        user_id: user.id,
        user_email: user.email,
        item_type: plan.itemType,
        item_id: plan.itemId,
        item_name: pendingOrder.itemName,
        amount_cents: plan.amountCents,
        credits_granted: plan.credits,
        payment_method: paymentMethod,
        status: "pending",
        ip_address: ipAddress,
      });
    }

    return NextResponse.json({
      ok: true,
      order: pendingOrder,
      waffoCheckoutUrl,
      waffoSessionLive,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
