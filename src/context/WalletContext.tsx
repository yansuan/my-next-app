"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type AccentTheme = "lime" | "pulse";

export interface LedgerEntry {
  id: string;
  timestamp: string;
  type:
    | "signup_bonus"
    | "job_reserve"
    | "job_settle"
    | "job_refund"
    | "topup"
    | "subscription";
  deltaAvailable: number;
  deltaReserved: number;
  balanceAfter: number;
  note: string;
}

export interface JobRecord {
  id: string;
  yirJobId: string;
  toolSlug: string;
  modelId: string;
  modelName: string;
  prompt: string;
  settingsSummary: string;
  creditsCost: number;
  status: "queued" | "processing" | "succeeded" | "failed" | "canceled";
  outputUrl?: string;
  providerRouted?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface UserOrderRecord {
  orderNo: string;
  itemId: string;
  itemName: string;
  itemType: "credit_pack" | "subscription";
  amountUsd: number;
  creditsGranted: number;
  paymentMethod: string;
  status: "pending" | "paid" | "refunded";
  createdAt: string;
}

export interface CheckoutPayload {
  itemId: string;
  itemName: string;
  itemType: "credit_pack" | "subscription";
  credits: number;
  amountUsd: number;
  paymentMethod: string;
  periodLabel?: string;
}

interface WalletContextValue {
  userId: string | null;
  userEmail: string | null;
  displayName: string;
  avatarUrl: string | null;
  authProvider: "google" | "email" | "workspace" | null;
  memberSince: string | null;
  isSignedIn: boolean;
  availableCredits: number;
  reservedCredits: number;
  accentTheme: AccentTheme;
  activePlanId: string | null;
  activePlanName: string;
  subscriptionStatus: "none" | "active" | "canceled";
  nextBillingDate: string | null;
  ledger: LedgerEntry[];
  jobs: JobRecord[];
  orders: UserOrderRecord[];
  toggleAccentTheme: () => void;
  signOutDemo: () => void;
  signInWithGoogle: (nextPath?: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: {
    displayName?: string;
    avatarUrl?: string | null;
  }) => Promise<{ ok: boolean; error?: string }>;
  reserveCredits: (cost: number, note: string) => boolean;
  settleCredits: (cost: number, note: string) => void;
  refundCredits: (cost: number, note: string) => void;
  addCreditsPack: (credits: number, packName: string) => void;
  completeCheckout: (
    payload: CheckoutPayload
  ) => Promise<{ orderNo: string; waffoCheckoutUrl?: string }>;
  cancelSubscription: () => void;
  upsertJob: (job: JobRecord) => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const STORAGE_KEY = "reelmux_wallet_state_v3";

const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: "tx-welcome-100",
    timestamp: "Welcome Grant",
    type: "signup_bonus",
    deltaAvailable: 100,
    deltaReserved: 0,
    balanceAfter: 100,
    note: "Welcome to ReelMux (reelmux.com): 100 free credits · No card needed",
  },
];

const INITIAL_JOBS: JobRecord[] = [
  {
    id: "job_seedance25_welcome",
    yirJobId: "job_seedance25_welcome",
    toolSlug: "text-to-video",
    modelId: "seedance-2.5",
    modelName: "Seedance 2.5",
    prompt:
      "A high-speed bullet train banking through an alpine mountain pass at sunrise, snow kicking up from the tracks, shot from a low-angle chase helicopter, 1080p.",
    settingsSummary: "5s · 1080p · 16:9 · Native Audio",
    creditsCost: 90,
    status: "succeeded",
    outputUrl: "/examples/seedance-2-5-train.mp4",
    providerRouted: "ByteDance Seedance 2.5 Cluster",
    createdAt: "Today",
  },
];

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [authProvider, setAuthProvider] = useState<"google" | "email" | "workspace" | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [availableCredits, setAvailableCredits] = useState<number>(100);
  const [reservedCredits, setReservedCredits] = useState<number>(0);
  const [accentTheme, setAccentTheme] = useState<AccentTheme>("lime");
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [activePlanName, setActivePlanName] = useState<string>("Free Starter Tier");
  const [subscriptionStatus, setSubscriptionStatus] = useState<"none" | "active" | "canceled">(
    "none"
  );
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>(INITIAL_LEDGER);
  const [jobs, setJobs] = useState<JobRecord[]>(INITIAL_JOBS);
  const [orders, setOrders] = useState<UserOrderRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const availableCreditsRef = React.useRef<number>(availableCredits);

  useEffect(() => {
    availableCreditsRef.current = availableCredits;
  }, [availableCredits]);

  // Hydrate from localStorage on client mount (defaults to signed-out for new visitors)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.userId !== "undefined") setUserId(parsed.userId);
        if (typeof parsed.userEmail !== "undefined") setUserEmail(parsed.userEmail);
        if (typeof parsed.displayName === "string") setDisplayName(parsed.displayName);
        if (typeof parsed.avatarUrl !== "undefined") setAvatarUrl(parsed.avatarUrl);
        if (typeof parsed.authProvider !== "undefined") setAuthProvider(parsed.authProvider);
        if (typeof parsed.memberSince !== "undefined") setMemberSince(parsed.memberSince);
        if (typeof parsed.availableCredits === "number")
          setAvailableCredits(parsed.availableCredits);
        if (typeof parsed.reservedCredits === "number")
          setReservedCredits(parsed.reservedCredits);
        if (parsed.activePlanId) setActivePlanId(parsed.activePlanId);
        if (parsed.activePlanName) setActivePlanName(parsed.activePlanName);
        if (parsed.subscriptionStatus) setSubscriptionStatus(parsed.subscriptionStatus);
        if (parsed.nextBillingDate) setNextBillingDate(parsed.nextBillingDate);
        if (Array.isArray(parsed.ledger) && parsed.ledger.length > 0)
          setLedger(parsed.ledger);
        if (Array.isArray(parsed.jobs) && parsed.jobs.length > 0) setJobs(parsed.jobs);
        if (Array.isArray(parsed.orders)) setOrders(parsed.orders);
      }
    } catch {
      // Ignore storage errors
    } finally {
      setHydrated(true);
    }
  }, []);

  // Sync real Supabase Auth session (Google OAuth / Email Magic Link) + profile metadata
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const applySupabaseUser = async (
      user: {
        id: string;
        email?: string;
        created_at?: string;
        app_metadata?: Record<string, unknown>;
        user_metadata?: Record<string, unknown>;
      } | null
    ) => {
      if (!user) return;
      const meta = user.user_metadata || {};
      const appMeta = user.app_metadata || {};
      const provider = appMeta.provider === "google" ? "google" : "email";
      const fallbackName =
        (typeof meta.full_name === "string" && meta.full_name) ||
        (typeof meta.name === "string" && meta.name) ||
        (user.email ? user.email.split("@")[0] : "Creator");
      const fallbackAvatar =
        (typeof meta.avatar_url === "string" && meta.avatar_url) ||
        (typeof meta.picture === "string" && meta.picture) ||
        null;

      setUserId(user.id);
      setUserEmail(user.email ?? null);
      setAuthProvider(provider);
      setMemberSince(
        user.created_at
          ? new Date(user.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : null
      );
      setDisplayName((prev) => prev || fallbackName);
      setAvatarUrl((prev) => prev || fallbackAvatar);

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url, balance_available, balance_reserved, plan_tier")
          .eq("id", user.id)
          .single();
        if (profile) {
          if (profile.display_name) setDisplayName(profile.display_name);
          if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
          if (typeof profile.balance_available === "number")
            setAvailableCredits(profile.balance_available);
          if (typeof profile.balance_reserved === "number")
            setReservedCredits(profile.balance_reserved);
          if (profile.plan_tier && profile.plan_tier !== "free") {
            setActivePlanId(profile.plan_tier);
            setActivePlanName(profile.plan_tier.replace(/_/g, " "));
            if (profile.plan_tier.startsWith("pro_")) {
              setSubscriptionStatus("active");
            }
          }
        }

        const [{ data: dbLedger }, { data: dbJobs }, { data: dbOrders }] =
          await Promise.all([
            supabase
              .from("credit_ledger")
              .select("id, tx_type, delta_available, delta_reserved, balance_after, note, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(30),
            supabase
              .from("generation_jobs")
              .select("id, yir_job_id, tool_slug, model_id, prompt, credits_cost, status, source_output_url, error_message, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(30),
            supabase
              .from("billing_orders")
              .select("order_no, item_id, item_name, item_type, amount_cents, credits_granted, payment_method, status, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(30),
          ]);

        if (Array.isArray(dbLedger) && dbLedger.length > 0) {
          setLedger(
            dbLedger.map((row) => ({
              id: String(row.id),
              timestamp: new Date(row.created_at).toLocaleTimeString(),
              type:
                row.tx_type === "credit_pack_purchase"
                  ? "topup"
                  : row.tx_type === "subscription_grant"
                    ? "subscription"
                    : row.tx_type,
              deltaAvailable: Number(row.delta_available || 0),
              deltaReserved: Number(row.delta_reserved || 0),
              balanceAfter: Number(row.balance_after || 0),
              note: String(row.note || ""),
            }))
          );
        }

        if (Array.isArray(dbJobs) && dbJobs.length > 0) {
          setJobs(
            dbJobs.map((row) => ({
              id: String(row.id),
              yirJobId: String(row.yir_job_id || row.id),
              toolSlug: String(row.tool_slug),
              modelId: String(row.model_id),
              modelName: String(row.model_id),
              prompt: String(row.prompt),
              settingsSummary: "Synced from cloud ledger",
              creditsCost: Number(row.credits_cost || 0),
              status: row.status,
              outputUrl: row.source_output_url || undefined,
              errorMessage: row.error_message || undefined,
              createdAt: new Date(row.created_at).toLocaleString(),
            }))
          );
        }

        if (Array.isArray(dbOrders) && dbOrders.length > 0) {
          setOrders(
            dbOrders.map((row) => ({
              orderNo: String(row.order_no),
              itemId: String(row.item_id),
              itemName: String(row.item_name),
              itemType: row.item_type === "subscription" ? "subscription" : "credit_pack",
              amountUsd: Number((Number(row.amount_cents || 0) / 100).toFixed(2)),
              creditsGranted: Number(row.credits_granted || 0),
              paymentMethod: String(row.payment_method || "Waffo Pancake"),
              status:
                row.status === "paid"
                  ? "paid"
                  : row.status === "refunded"
                    ? "refunded"
                    : "pending",
              createdAt: new Date(row.created_at).toLocaleString(),
            }))
          );
        }
      } catch {
        // Ignore profile lookup errors
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        applySupabaseUser(data.user);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUserId(null);
        setUserEmail(null);
        setDisplayName("");
        setAvatarUrl(null);
        setAuthProvider(null);
        setMemberSince(null);
      } else if (session?.user) {
        applySupabaseUser(session.user);
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Persist to localStorage whenever state updates
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          userId,
          userEmail,
          displayName,
          avatarUrl,
          authProvider,
          memberSince,
          availableCredits,
          reservedCredits,
          activePlanId,
          activePlanName,
          subscriptionStatus,
          nextBillingDate,
          ledger,
          jobs,
          orders,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [
    hydrated,
    userId,
    userEmail,
    displayName,
    avatarUrl,
    authProvider,
    memberSince,
    availableCredits,
    reservedCredits,
    activePlanId,
    activePlanName,
    subscriptionStatus,
    nextBillingDate,
    ledger,
    jobs,
    orders,
  ]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", accentTheme);
  }, [accentTheme]);

  const toggleAccentTheme = () => {
    setAccentTheme((prev) => (prev === "lime" ? "pulse" : "lime"));
  };

  const signInWithGoogle = async (nextPath = "/dashboard") => {
    const supabase = createSupabaseBrowserClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabase || !supabaseUrl || !supabaseAnonKey) {
      return {
        ok: false,
        error: "Supabase client is not configured. Check NEXT_PUBLIC_SUPABASE_URL.",
      };
    }

    // Pre-check whether Google provider is enabled in Supabase so users never land on a raw JSON 400 page
    try {
      const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: { apikey: supabaseAnonKey },
      });
      if (settingsRes.ok) {
        const settingsJson = await settingsRes.json();
        if (settingsJson?.external && settingsJson.external.google === false) {
          return {
            ok: false,
            error: "Unsupported provider: Google OAuth provider is not enabled yet in Supabase Auth.",
          };
        }
      }
    } catch {
      // Proceed to OAuth attempt if settings check is temporarily unreachable
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  };

  const signOut = async () => {
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore network errors during local cleanup
      }
    }
    setUserId(null);
    setUserEmail(null);
    setDisplayName("");
    setAvatarUrl(null);
    setAuthProvider(null);
    setMemberSince(null);
  };

  const signOutDemo = () => {
    void signOut();
  };

  const updateProfile = async (updates: {
    displayName?: string;
    avatarUrl?: string | null;
  }): Promise<{ ok: boolean; error?: string }> => {
    const nextName =
      typeof updates.displayName === "string"
        ? updates.displayName.trim() || displayName || "Creator"
        : displayName;
    const nextAvatar =
      typeof updates.avatarUrl !== "undefined" ? updates.avatarUrl : avatarUrl;

    setDisplayName(nextName);
    setAvatarUrl(nextAvatar ?? null);

    const supabase = createSupabaseBrowserClient();
    if (supabase && userId) {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: nextName,
          avatar_url: nextAvatar ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (error) {
        return { ok: false, error: error.message };
      }
      await supabase.auth
        .updateUser({
          data: { full_name: nextName, avatar_url: nextAvatar ?? null },
        })
        .catch(() => {});
    }

    return { ok: true };
  };

  const reserveCredits = (cost: number, note: string): boolean => {
    if (availableCredits < cost) {
      return false;
    }
    const nextAvail = availableCredits - cost;
    setAvailableCredits(nextAvail);
    setReservedCredits((prev) => prev + cost);
    setLedger((prev) => [
      {
        id: `tx_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: "job_reserve",
        deltaAvailable: -cost,
        deltaReserved: cost,
        balanceAfter: nextAvail,
        note,
      },
      ...prev,
    ]);
    return true;
  };

  const settleCredits = (cost: number, note: string) => {
    setReservedCredits((prev) => Math.max(0, prev - cost));
    setLedger((prev) => [
      {
        id: `tx_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: "job_settle",
        deltaAvailable: 0,
        deltaReserved: -cost,
        balanceAfter: availableCreditsRef.current,
        note,
      },
      ...prev,
    ]);
  };

  const refundCredits = (cost: number, note: string) => {
    setReservedCredits((prev) => Math.max(0, prev - cost));
    setAvailableCredits((prev) => {
      const next = prev + cost;
      setLedger((old) => [
        {
          id: `tx_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: "job_refund",
          deltaAvailable: cost,
          deltaReserved: -cost,
          balanceAfter: next,
          note,
        },
        ...old,
      ]);
      return next;
    });
  };

  const addCreditsPack = (credits: number, packName: string) => {
    setAvailableCredits((prev) => {
      const next = prev + credits;
      setLedger((old) => [
        {
          id: `tx_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: "topup",
          deltaAvailable: credits,
          deltaReserved: 0,
          balanceAfter: next,
          note: `Purchased ${packName} (+${credits.toLocaleString()} credits)`,
        },
        ...old,
      ]);
      return next;
    });
  };

  const completeCheckout = async (
    payload: CheckoutPayload
  ): Promise<{ orderNo: string; waffoCheckoutUrl?: string }> => {
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: payload.itemId,
        paymentMethod: payload.paymentMethod,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "Failed to create Waffo checkout session.");
    }

    const orderNo = String(data?.order?.orderNo || "");
    const waffoCheckoutUrl =
      typeof data?.waffoCheckoutUrl === "string"
        ? data.waffoCheckoutUrl
        : undefined;

    const pendingOrder: UserOrderRecord = {
      orderNo,
      itemId: data?.order?.itemId || payload.itemId,
      itemName: data?.order?.itemName || payload.itemName,
      itemType: payload.itemType,
      amountUsd: Number(data?.order?.amountUsd ?? payload.amountUsd),
      creditsGranted: Number(data?.order?.creditsGranted ?? payload.credits),
      paymentMethod: payload.paymentMethod,
      status: "pending",
      createdAt: new Date().toLocaleString(),
    };

    setOrders((prev) => [pendingOrder, ...prev]);

    return { orderNo, waffoCheckoutUrl };
  };

  const cancelSubscription = () => {
    setSubscriptionStatus("canceled");
    setLedger((prev) => [
      {
        id: `tx_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: "subscription",
        deltaAvailable: 0,
        deltaReserved: 0,
        balanceAfter: availableCreditsRef.current,
        note: `Canceled recurring renewal for ${activePlanName}. Current credits remain active.`,
      },
      ...prev,
    ]);
  };

  const upsertJob = (job: JobRecord) => {
    setJobs((prev) => {
      const idx = prev.findIndex((j) => j.id === job.id);
      if (idx === -1) return [job, ...prev];
      const copy = [...prev];
      copy[idx] = job;
      return copy;
    });
  };

  return (
    <WalletContext.Provider
      value={{
        userId,
        userEmail,
        displayName,
        avatarUrl,
        authProvider,
        memberSince,
        isSignedIn: Boolean(userEmail),
        availableCredits,
        reservedCredits,
        accentTheme,
        activePlanId,
        activePlanName,
        subscriptionStatus,
        nextBillingDate,
        ledger,
        jobs,
        orders,
        toggleAccentTheme,
        signOutDemo,
        signInWithGoogle,
        signOut,
        updateProfile,
        reserveCredits,
        settleCredits,
        refundCredits,
        addCreditsPack,
        completeCheckout,
        cancelSubscription,
        upsertJob,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used inside WalletProvider");
  }
  return ctx;
}
