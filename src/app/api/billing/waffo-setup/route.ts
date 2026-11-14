import { NextRequest, NextResponse } from "next/server";
import {
  getWaffoConfig,
  setWaffoRuntimeConfig,
  autoProvisionWaffoStoreAndProducts,
} from "@/lib/waffo/client";
import { getAdminStore } from "@/lib/admin/store";

export async function GET() {
  const cfg = getWaffoConfig();
  return NextResponse.json({
    merchantId: cfg.merchantId,
    hasPrivateKey: Boolean(cfg.privateKey),
    storeId: cfg.storeId || "",
    storeSlug: cfg.storeSlug || "reelmux",
    environment: cfg.environment,
    productMap: cfg.productMap,
    webhookUrl: "https://reelmux.com/api/webhooks/waffo",
    dashboardUrl: "https://pancake.waffo.ai/",
    docsUrl: "https://docs.waffo.ai/",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = "save_config",
      merchantId,
      privateKey,
      storeId,
      storeSlug,
      environment,
      productMap,
    } = body;

    if (merchantId !== undefined || privateKey !== undefined || storeId !== undefined) {
      setWaffoRuntimeConfig({
        ...(merchantId !== undefined ? { merchantId: String(merchantId).trim() } : {}),
        ...(privateKey !== undefined && String(privateKey).trim()
          ? { privateKey: String(privateKey).trim() }
          : {}),
        ...(storeId !== undefined ? { storeId: String(storeId).trim() } : {}),
        ...(storeSlug !== undefined ? { storeSlug: String(storeSlug).trim() } : {}),
        ...(environment === "test" || environment === "prod" ? { environment } : {}),
        ...(productMap ? { productMap } : {}),
      });
    }

    if (action === "auto_provision") {
      const origin =
        req.headers.get("origin") || "https://reelmux.com";
      const provisioned = await autoProvisionWaffoStoreAndProducts(origin);

      const store = getAdminStore();
      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorEmail: "admin@reelmux.com",
        action: "waffo.auto_provisioned",
        targetType: "system",
        targetId: provisioned.storeId || "waffo",
        summary: `Auto-provisioned Waffo Pancake store (${provisioned.storeId}), 5 products, and webhook (${provisioned.webhookUrl}).`,
        ipAddress: "127.0.0.1",
        createdAt: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
      });

      return NextResponse.json({
        ok: true,
        provisioned,
        config: getWaffoConfig(),
      });
    }

    return NextResponse.json({
      ok: true,
      config: getWaffoConfig(),
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to configure Waffo Pancake";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
