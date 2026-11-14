import { WaffoPancake, TaxCategory, BillingPeriod } from "@waffo/pancake-ts";

export interface WaffoRuntimeConfig {
  merchantId: string;
  privateKey: string;
  storeId?: string;
  storeSlug?: string;
  environment: "test" | "prod";
  productMap: Record<string, string>; // internal itemId -> Waffo PROD_xxx
}

const globalForWaffo = globalThis as unknown as {
  reelmuxWaffoConfig?: Partial<WaffoRuntimeConfig>;
};

export function getWaffoConfig(): WaffoRuntimeConfig {
  const override = globalForWaffo.reelmuxWaffoConfig || {};
  const merchantId =
    override.merchantId || process.env.WAFFO_MERCHANT_ID || "";
  const rawPrivateKey =
    override.privateKey || process.env.WAFFO_PRIVATE_KEY || "";
  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");
  const storeId = override.storeId || process.env.WAFFO_STORE_ID || "";
  const storeSlug =
    override.storeSlug || process.env.WAFFO_STORE_SLUG || "reelmux";
  const environment =
    (override.environment ||
      (process.env.WAFFO_ENV as "test" | "prod") ||
      "prod") === "test"
      ? "test"
      : "prod";

  const defaultProductMap: Record<string, string> = {
    starter: process.env.WAFFO_PROD_STARTER || "",
    creator: process.env.WAFFO_PROD_CREATOR || "",
    studio: process.env.WAFFO_PROD_STUDIO || "",
    "pro-monthly": process.env.WAFFO_PROD_PRO_MONTHLY || "",
    "pro-yearly": process.env.WAFFO_PROD_PRO_YEARLY || "",
    ...(override.productMap || {}),
  };

  return {
    merchantId,
    privateKey,
    storeId,
    storeSlug,
    environment,
    productMap: defaultProductMap,
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
  const client = createWaffoClient();
  if (!client) {
    throw new Error(
      "Missing WAFFO_MERCHANT_ID (MER_...) or WAFFO_PRIVATE_KEY (PEM). Configure them first."
    );
  }

  const cfg = getWaffoConfig();
  let storeId = cfg.storeId;
  let storeSlug = cfg.storeSlug || "reelmux";

  if (!storeId) {
    const { store } = await client.stores.create({
      name: "ReelMux AI Studio",
    });
    storeId = store.id;
    storeSlug = store.slug || "reelmux";
  }

  const createdProducts: Record<string, string> = { ...cfg.productMap };

  // 1. One-time credit packs
  const onetimeSpecs = [
    {
      key: "starter",
      name: "ReelMux Starter Pack (1,000 Credits)",
      amount: "9.90",
      credits: 1000,
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
    if (!createdProducts[spec.key]) {
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

  // 2. Subscription products
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
    if (!createdProducts[spec.key]) {
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

  // 3. Register Webhook endpoint
  let webhookId: string | null = null;
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
  };
}
