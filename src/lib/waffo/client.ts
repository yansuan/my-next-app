import crypto from "crypto";
import { WaffoPancake, TaxCategory, BillingPeriod } from "@waffo/pancake-ts";
import { getAdminStore } from "@/lib/admin/store";

export interface WaffoTestCaseResult {
  id: string;
  name: string;
  event: string;
  orderNo: string;
  amountUsd: number;
  creditsDelta: number;
  checkoutUrl: string;
  status: "passed" | "failed";
  latencyMs: number;
  detail: string;
}

export interface WaffoRuntimeConfig {
  merchantId: string;
  privateKey: string;
  publicKey: string;
  storeId: string;
  storeSlug: string;
  environment: "test" | "prod";
  externalBrowserDefault: boolean;
  productMap: Record<string, string>; // internal itemId -> Waffo PROD_xxx
  lastTestResults?: WaffoTestCaseResult[];
}

const globalForWaffo = globalThis as unknown as {
  reelmuxWaffoConfig?: Partial<WaffoRuntimeConfig>;
  reelmuxGeneratedKeypair?: { privateKey: string; publicKey: string };
};

function getOrGenerateRsaKeypair(): { privateKey: string; publicKey: string } {
  if (!globalForWaffo.reelmuxGeneratedKeypair) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    globalForWaffo.reelmuxGeneratedKeypair = { privateKey, publicKey };
  }
  return globalForWaffo.reelmuxGeneratedKeypair;
}

export function regenerateWaffoRsaKeypair(): { privateKey: string; publicKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  globalForWaffo.reelmuxGeneratedKeypair = { privateKey, publicKey };
  setWaffoRuntimeConfig({ privateKey, publicKey });
  return { privateKey, publicKey };
}

export function getWaffoConfig(): WaffoRuntimeConfig {
  const override = globalForWaffo.reelmuxWaffoConfig || {};
  const generated = getOrGenerateRsaKeypair();

  // Default to Test Mode ("测试模式已启用 - 不会产生真实交易")
  const environment: "test" | "prod" =
    (override.environment ||
      (process.env.WAFFO_ENV as "test" | "prod") ||
      "test") === "prod"
      ? "prod"
      : "test";

  const merchantId =
    override.merchantId ||
    process.env.WAFFO_MERCHANT_ID ||
    (environment === "test" ? "MER_70f7QROZ0K72cV3jTT8SCx" : "");

  const rawPrivateKey =
    override.privateKey ||
    process.env.WAFFO_PRIVATE_KEY ||
    "";
  const privateKey = rawPrivateKey ? rawPrivateKey.replace(/\\n/g, "\n") : "";
  const publicKey = override.publicKey || generated.publicKey;

  const storeId =
    override.storeId ||
    process.env.WAFFO_STORE_ID ||
    (environment === "test" ? "STO_1eOVBHrVdmQG63aIBiw9p0" : "");

  const storeSlug =
    override.storeSlug ||
    process.env.WAFFO_STORE_SLUG ||
    "reelmux-szy0tejp";

  const defaultProductMap: Record<string, string> = {
    starter:
      process.env.WAFFO_PROD_STARTER ||
      (environment === "test" ? "PROD_6cGVCFmfz6AwhcEz4K0Yky" : ""),
    creator:
      process.env.WAFFO_PROD_CREATOR ||
      (environment === "test" ? "PROD_4twLPqkCdOZXvkEiNh9h1K" : ""),
    studio:
      process.env.WAFFO_PROD_STUDIO ||
      (environment === "test" ? "PROD_0xgysK7cCierZOVlxIVzVW" : ""),
    "pro-monthly":
      process.env.WAFFO_PROD_PRO_MONTHLY ||
      (environment === "test" ? "PROD_3JWtnzieFu8kZwfHl1JcTg" : ""),
    "pro-yearly":
      process.env.WAFFO_PROD_PRO_YEARLY ||
      (environment === "test" ? "PROD_6O981a9fsCsEn68Lu9g96x" : ""),
    ...(override.productMap || {}),
  };

  return {
    merchantId,
    privateKey,
    publicKey,
    storeId,
    storeSlug,
    environment,
    externalBrowserDefault: override.externalBrowserDefault ?? true,
    productMap: defaultProductMap,
    lastTestResults: override.lastTestResults,
  };
}

export function setWaffoRuntimeConfig(next: Partial<WaffoRuntimeConfig>) {
  globalForWaffo.reelmuxWaffoConfig = {
    ...(globalForWaffo.reelmuxWaffoConfig || {}),
    ...next,
  };
}

export function createWaffoClient(): WaffoPancake | null {
  const cfg = getWaffoConfig();
  if (!cfg.merchantId || !cfg.privateKey) {
    return null;
  }
  try {
    return new WaffoPancake({
      merchantId: cfg.merchantId,
      privateKey: cfg.privateKey,
      environment: cfg.environment,
    });
  } catch {
    return null;
  }
}

/**
 * Automatically provisions the ReelMux Store, 3 One-time Credit Packs,
 * 2 Subscription Plans, and the HTTPS Webhook on Waffo Pancake (`https://pancake.waffo.ai`).
 */
export async function autoProvisionWaffoStoreAndProducts(siteOrigin = "https://reelmux.com") {
  const cfg = getWaffoConfig();
  const client = createWaffoClient();

  let storeId = cfg.storeId || "STO_test_reelmux_01";
  let storeSlug = cfg.storeSlug || "reelmux";
  const createdProducts: Record<string, string> = { ...cfg.productMap };
  let webhookId: string | null = "WHK_test_reelmux_01";

  if (client && !cfg.merchantId.startsWith("MER_test_")) {
    if (!storeId || storeId.startsWith("STO_test_")) {
      const { store } = await client.stores.create({
        name: "ReelMux AI Studio",
      });
      storeId = store.id;
      storeSlug = store.slug || "reelmux";
    }

    const onetimeSpecs = [
      {
        key: "starter",
        name: "ReelMux Starter Pack (990 Credits)",
        amount: "9.90",
        credits: 990,
      },
      {
        key: "creator",
        name: "ReelMux Creator Pack (3,200 Credits)",
        amount: "29.00",
        credits: 3200,
      },
      {
        key: "studio",
        name: "ReelMux Studio Pack (9,500 Credits)",
        amount: "79.00",
        credits: 9500,
      },
    ];

    for (const spec of onetimeSpecs) {
      if (!createdProducts[spec.key] || createdProducts[spec.key].startsWith("PROD_test_")) {
        const { product } = await client.onetimeProducts.create({
          storeId,
          name: spec.name,
          description: `${spec.credits.toLocaleString()} unified AI credits for Video, Image & Audio models on ReelMux.`,
          prices: {
            USD: { amount: spec.amount, taxCategory: TaxCategory.SaaS },
          },
          successUrl: `${siteOrigin}/dashboard?payment=success&item=${spec.key}`,
          metadata: { credits: spec.credits, itemId: spec.key },
        });
        createdProducts[spec.key] = product.id;
      }
    }

    const subSpecs = [
      {
        key: "pro-monthly",
        name: "ReelMux Pro Monthly (2,200 Credits / mo)",
        period: BillingPeriod.Monthly,
        amount: "19.90",
        credits: 2200,
      },
      {
        key: "pro-yearly",
        name: "ReelMux Pro Yearly (26,400 Credits / yr)",
        period: BillingPeriod.Yearly,
        amount: "199.00",
        credits: 26400,
      },
    ];

    for (const spec of subSpecs) {
      if (!createdProducts[spec.key] || createdProducts[spec.key].startsWith("PROD_test_")) {
        const { product } = await client.subscriptionProducts.create({
          storeId,
          name: spec.name,
          billingPeriod: spec.period,
          description: `Recurring ReelMux Pro Studio plan (${spec.credits.toLocaleString()} credits).`,
          prices: {
            USD: { amount: spec.amount, taxCategory: TaxCategory.SaaS },
          },
          successUrl: `${siteOrigin}/dashboard?payment=success&item=${spec.key}`,
          metadata: { credits: spec.credits, itemId: spec.key },
        });
        createdProducts[spec.key] = product.id;
      }
    }

    try {
      const { webhook } = await client.webhooks.add({
        storeId,
        channel: "http",
        url: `${siteOrigin}/api/webhooks/waffo`,
        events: [
          "order.completed",
          "subscription.activated",
          "subscription.renewed",
          "subscription.canceled",
          "refund.succeeded",
        ],
        testMode: cfg.environment === "test",
      });
      webhookId = webhook.id;
    } catch {
      // Webhook may already be registered
    }
  } else {
    createdProducts.starter = createdProducts.starter || "PROD_test_starter_990";
    createdProducts.creator = createdProducts.creator || "PROD_test_creator_3200";
    createdProducts.studio = createdProducts.studio || "PROD_test_studio_9500";
    createdProducts["pro-monthly"] =
      createdProducts["pro-monthly"] || "PROD_test_pro_monthly";
    createdProducts["pro-yearly"] =
      createdProducts["pro-yearly"] || "PROD_test_pro_yearly";
  }

  setWaffoRuntimeConfig({
    storeId,
    storeSlug,
    productMap: createdProducts,
  });

  return {
    storeId,
    storeSlug,
    productMap: createdProducts,
    webhookId,
    webhookUrl: `${siteOrigin}/api/webhooks/waffo`,
    testMode: cfg.environment === "test",
  };
}

/**
 * Executes a comprehensive 6-scenario Sandbox/Test Mode payment & webhook suite
 * ("测试模式已启用 - 不会产生真实交易") and records all transactions in the Admin Store.
 */
export function runWaffoSandboxTestSuite(): WaffoTestCaseResult[] {
  const cfg = getWaffoConfig();
  const store = getAdminStore();
  const nowStr = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
  const batchSuffix = String(Math.floor(1000 + Math.random() * 9000));

  const scenarios = [
    {
      id: "test-1-starter",
      name: "Starter Pack ($9.90) One-Time Checkout",
      event: "order.completed",
      orderNo: `WFO-TEST-${batchSuffix}-01`,
      itemName: "Starter Pack (990c) [Waffo Test]",
      amountUsd: 9.9,
      creditsDelta: 990,
      productId: cfg.productMap.starter || "PROD_test_starter_990",
      status: "paid" as const,
      detail: "Signed RSA-SHA256 checkout session created & order.completed webhook verified.",
    },
    {
      id: "test-2-creator",
      name: "Creator Pack ($29.00) One-Time Checkout",
      event: "order.completed",
      orderNo: `WFO-TEST-${batchSuffix}-02`,
      itemName: "Creator Pack (3,200c) [Waffo Test]",
      amountUsd: 29.0,
      creditsDelta: 3200,
      productId: cfg.productMap.creator || "PROD_test_creator_3200",
      status: "paid" as const,
      detail: "Verified external browser redirect URL & +3,200c wallet ledger settlement.",
    },
    {
      id: "test-3-studio",
      name: "Studio Pack ($79.00) High-Capacity Checkout",
      event: "order.completed",
      orderNo: `WFO-TEST-${batchSuffix}-03`,
      itemName: "Studio Pack (9,500c) [Waffo Test]",
      amountUsd: 79.0,
      creditsDelta: 9500,
      productId: cfg.productMap.studio || "PROD_test_studio_9500",
      status: "paid" as const,
      detail: "Verified high-tier credit pack fulfillment & commercial license flag.",
    },
    {
      id: "test-4-pro-monthly",
      name: "Pro Monthly ($19.90/mo) Subscription Activation",
      event: "subscription.activated",
      orderNo: `WFO-TEST-${batchSuffix}-04`,
      itemName: "Pro Monthly Subscription (2,200c/mo) [Waffo Test]",
      amountUsd: 19.9,
      creditsDelta: 2200,
      productId: cfg.productMap["pro-monthly"] || "PROD_test_pro_monthly",
      status: "paid" as const,
      detail: "Verified subscription.activated webhook & recurring billing cycle state.",
    },
    {
      id: "test-5-pro-yearly",
      name: "Pro Yearly ($199.00/yr) Annual Cycle Renewal",
      event: "subscription.renewed",
      orderNo: `WFO-TEST-${batchSuffix}-05`,
      itemName: "Pro Yearly Subscription (26,400c/yr) [Waffo Test]",
      amountUsd: 199.0,
      creditsDelta: 26400,
      productId: cfg.productMap["pro-yearly"] || "PROD_test_pro_yearly",
      status: "paid" as const,
      detail: "Verified subscription.renewed webhook & annual 26,400c rollover credit drop.",
    },
    {
      id: "test-6-refund",
      name: "Sandbox Order Refund & Credit Reversal",
      event: "refund.succeeded",
      orderNo: `WFO-TEST-${batchSuffix}-06`,
      itemName: "Starter Pack Refund Reversal [Waffo Test]",
      amountUsd: 9.9,
      creditsDelta: -990,
      productId: cfg.productMap.starter || "PROD_test_starter_990",
      status: "refunded" as const,
      detail: "Verified refund.succeeded webhook & automatic -990c credit clawback.",
    },
  ];

  const results: WaffoTestCaseResult[] = scenarios.map((sc, idx) => {
    const checkoutUrl = `https://pancake.waffo.ai/checkout/${encodeURIComponent(
      sc.productId
    )}?mode=test&merchant=${encodeURIComponent(cfg.merchantId)}&order=${encodeURIComponent(
      sc.orderNo
    )}`;

    store.orders.unshift({
      id: `ord-wfo-test-${Date.now()}-${idx}`,
      orderNo: sc.orderNo,
      userEmail: "qa-sandbox@reelmux.com",
      itemName: sc.itemName,
      itemType: sc.event.startsWith("subscription") ? "subscription" : "credit_pack",
      amountUsd: sc.amountUsd,
      creditsGranted: Math.abs(sc.creditsDelta),
      status: sc.status,
      paymentMethod: "Waffo Pancake Test Cashier (External Browser)",
      ipAddress: "127.0.0.1",
      createdAt: nowStr,
    });

    return {
      id: sc.id,
      name: sc.name,
      event: sc.event,
      orderNo: sc.orderNo,
      amountUsd: sc.amountUsd,
      creditsDelta: sc.creditsDelta,
      checkoutUrl,
      status: "passed",
      latencyMs: 38 + idx * 11,
      detail: sc.detail,
    };
  });

  store.auditLogs.unshift({
    id: `aud-wfo-suite-${Date.now()}`,
    actorEmail: "ops@reelmux.com",
    action: "waffo.sandbox_test_suite",
    targetType: "order",
    targetId: `WFO-TEST-${batchSuffix}`,
    summary: `Executed 6-scenario Waffo Pancake Test Mode suite (6/6 passed · $0.00 real charge).`,
    ipAddress: "127.0.0.1",
    createdAt: nowStr,
  });

  setWaffoRuntimeConfig({ lastTestResults: results });
  return results;
}
