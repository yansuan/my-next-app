import { CREDIT_PACKS, SUBSCRIPTION_PLANS } from "@/lib/catalog/models";

export interface CatalogCheckoutSpec {
  itemId: string;
  itemName: string;
  itemType: "credit_pack" | "subscription";
  amountUsd: number;
  amountCents: number;
  credits: number;
  waffoProductKey: string;
  planTier: "starter" | "creator" | "studio" | "pro_monthly" | "pro_yearly";
}

const ITEM_ALIASES: Record<string, string> = {
  starter: "starter-pack",
  "starter-pack": "starter-pack",
  creator: "creator-pack",
  "creator-pack": "creator-pack",
  studio: "studio-pack",
  "studio-pack": "studio-pack",
  "pro-monthly": "pro-monthly",
  "pro-yearly": "pro-yearly",
};

const WAFFO_KEY_MAP: Record<string, string> = {
  "starter-pack": "starter",
  "creator-pack": "creator",
  "studio-pack": "studio",
  "pro-monthly": "pro-monthly",
  "pro-yearly": "pro-yearly",
};

const PLAN_TIER_MAP: Record<string, CatalogCheckoutSpec["planTier"]> = {
  "starter-pack": "starter",
  "creator-pack": "creator",
  "studio-pack": "studio",
  "pro-monthly": "pro_monthly",
  "pro-yearly": "pro_yearly",
};

/**
 * Authoritative server-side lookup for purchasable packs and subscriptions.
 * Client-submitted prices and credit amounts must never be trusted.
 */
export function resolveCatalogPlan(rawItemId: string): CatalogCheckoutSpec | null {
  const canonicalId = ITEM_ALIASES[String(rawItemId || "").trim().toLowerCase()];
  if (!canonicalId) return null;

  const pack = CREDIT_PACKS.find((p) => p.id === canonicalId);
  if (pack) {
    return {
      itemId: pack.id,
      itemName: `${pack.name} Pack`,
      itemType: "credit_pack",
      amountUsd: pack.amountUsd,
      amountCents: Math.round(pack.amountUsd * 100),
      credits: pack.credits,
      waffoProductKey: WAFFO_KEY_MAP[pack.id],
      planTier: PLAN_TIER_MAP[pack.id],
    };
  }

  const sub = SUBSCRIPTION_PLANS.find((s) => s.id === canonicalId);
  if (sub) {
    return {
      itemId: sub.id,
      itemName: sub.name,
      itemType: "subscription",
      amountUsd: sub.amountUsd,
      amountCents: Math.round(sub.amountUsd * 100),
      credits: sub.creditsPerMonth,
      waffoProductKey: WAFFO_KEY_MAP[sub.id],
      planTier: PLAN_TIER_MAP[sub.id],
    };
  }

  return null;
}

export function resolvePlanByAmountCents(
  amountCents: number,
  isSubscription: boolean
): CatalogCheckoutSpec | null {
  if (isSubscription) {
    const sub = SUBSCRIPTION_PLANS.find(
      (s) => Math.round(s.amountUsd * 100) === amountCents
    );
    return sub ? resolveCatalogPlan(sub.id) : null;
  }
  const pack = CREDIT_PACKS.find(
    (p) => Math.round(p.amountUsd * 100) === amountCents
  );
  return pack ? resolveCatalogPlan(pack.id) : null;
}
