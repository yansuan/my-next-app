import { NextRequest, NextResponse } from "next/server";
import {
  getWaffoConfig,
  setWaffoRuntimeConfig,
  autoProvisionWaffoStoreAndProducts,
  regenerateWaffoRsaKeypair,
  runWaffoSandboxTestSuite,
} from "@/lib/waffo/client";
import { getAdminStore } from "@/lib/admin/store";

export async function GET() {
  const cfg = getWaffoConfig();
  return NextResponse.json({
    configured: Boolean(cfg.merchantId && cfg.privateKey),
    merchantId: cfg.merchantId,
    hasPrivateKey: Boolean(cfg.privateKey),
    privateKeyMasked: cfg.privateKey
      ? `${cfg.privateKey.slice(0, 32)}...${cfg.privateKey.slice(-28)}`
      : "",
    publicKey: cfg.publicKey,
    storeId: cfg.storeId || "",
    storeSlug: cfg.storeSlug || "reelmux",
    environment: cfg.environment,
    externalBrowserDefault: cfg.externalBrowserDefault,
    productMap: cfg.productMap,
    lastTestResults: cfg.lastTestResults || [],
    webhookUrl: "https://reelmux.com/api/webhooks/waffo",
    portalUrl: "https://pancake.waffo.ai/",
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
      publicKey,
      storeId,
      storeSlug,
      environment,
      externalBrowserDefault,
      productMap,
    } = body;

    if (action === "regenerate_keys") {
      const keys = regenerateWaffoRsaKeypair();
      return NextResponse.json({
        ok: true,
        publicKey: keys.publicKey,
        config: getWaffoConfig(),
      });
    }

    if (
      merchantId !== undefined ||
      privateKey !== undefined ||
      publicKey !== undefined ||
      storeId !== undefined ||
      environment !== undefined ||
      externalBrowserDefault !== undefined ||
      productMap !== undefined
    ) {
      setWaffoRuntimeConfig({
        ...(merchantId !== undefined ? { merchantId: String(merchantId).trim() } : {}),
        ...(privateKey !== undefined && String(privateKey).trim()
          ? { privateKey: String(privateKey).trim() }
          : {}),
        ...(publicKey !== undefined && String(publicKey).trim()
          ? { publicKey: String(publicKey).trim() }
          : {}),
        ...(storeId !== undefined ? { storeId: String(storeId).trim() } : {}),
        ...(storeSlug !== undefined ? { storeSlug: String(storeSlug).trim() } : {}),
        ...(environment === "test" || environment === "prod" ? { environment } : {}),
        ...(typeof externalBrowserDefault === "boolean"
          ? { externalBrowserDefault }
          : {}),
        ...(productMap ? { productMap } : {}),
      });
    }

    if (action === "auto_provision") {
      const origin = req.headers.get("origin") || "https://reelmux.com";
      const provisioned = await autoProvisionWaffoStoreAndProducts(origin);

      const store = getAdminStore();
      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorEmail: "ops@reelmux.com",
        action: "waffo.auto_provisioned",
        targetType: "system",
        targetId: provisioned.storeId || "waffo",
        summary: `Auto-provisioned Waffo Pancake store (${provisioned.storeId}), 5 products, and webhook (${provisioned.webhookUrl}) [Mode: ${
          provisioned.testMode ? "TEST" : "PROD"
        }].`,
        ipAddress: "127.0.0.1",
        createdAt: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
      });

      return NextResponse.json({
        ok: true,
        provisioned,
        config: getWaffoConfig(),
      });
    }

    if (action === "run_test_suite") {
      const results = runWaffoSandboxTestSuite();
      return NextResponse.json({
        ok: true,
        testResults: results,
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
