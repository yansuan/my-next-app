"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  status: "paid" | "refunded";
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
  userEmail: string | null;
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
  signInDemo: (email?: string) => void;
  signOutDemo: () => void;
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

const STORAGE_KEY = "reelmux_wallet_state_v2";

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
  const [userEmail, setUserEmail] = useState<string | null>("creator@reelmux.com");
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

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.userEmail !== "undefined") setUserEmail(parsed.userEmail);
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

  // Persist to localStorage whenever state updates
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          userEmail,
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
    userEmail,
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

  const signInDemo = (email = "creator@reelmux.com") => {
    setUserEmail(email);
  };

  const signOutDemo = () => {
    setUserEmail(null);
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
        balanceAfter: availableCredits,
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
    const email = userEmail || "creator@reelmux.com";
    let orderNo = `RMX-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
    let waffoCheckoutUrl: string | undefined;

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: email,
          itemId: payload.itemId,
          itemName: payload.itemName,
          itemType: payload.itemType,
          amountUsd: payload.amountUsd,
          creditsGranted: payload.credits,
          paymentMethod: payload.paymentMethod,
        }),
      });
      const data = await res.json();
      if (data?.order?.orderNo) {
        orderNo = data.order.orderNo;
      }
      if (data?.waffoCheckoutUrl) {
        waffoCheckoutUrl = data.waffoCheckoutUrl;
      }
    } catch {
      // Fallback to client orderNo if offline
    }

    const nextBalance = availableCredits + payload.credits;
    setAvailableCredits(nextBalance);

    if (payload.itemType === "subscription") {
      setActivePlanId(payload.itemId);
      setActivePlanName(payload.itemName);
      setSubscriptionStatus("active");
      const nextDate = new Date();
      if (payload.itemId.includes("yearly")) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      setNextBillingDate(
        nextDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    }

    const newOrder: UserOrderRecord = {
      orderNo,
      itemId: payload.itemId,
      itemName: payload.itemName,
      itemType: payload.itemType,
      amountUsd: payload.amountUsd,
      creditsGranted: payload.credits,
      paymentMethod: payload.paymentMethod,
      status: "paid",
      createdAt: new Date().toLocaleString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    setLedger((prev) => [
      {
        id: `tx_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: payload.itemType === "subscription" ? "subscription" : "topup",
        deltaAvailable: payload.credits,
        deltaReserved: 0,
        balanceAfter: nextBalance,
        note: `${
          payload.itemType === "subscription" ? "Subscribed to" : "Purchased"
        } ${payload.itemName} (+${payload.credits.toLocaleString()} credits · Order ${orderNo})`,
      },
      ...prev,
    ]);

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
        balanceAfter: availableCredits,
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
        userEmail,
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
        signInDemo,
        signOutDemo,
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
