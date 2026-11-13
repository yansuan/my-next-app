"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type AccentTheme = "lime" | "pulse";

export interface LedgerEntry {
  id: string;
  timestamp: string;
  type: "signup_bonus" | "job_reserve" | "job_settle" | "job_refund" | "topup";
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

interface WalletContextValue {
  userEmail: string | null;
  isSignedIn: boolean;
  availableCredits: number;
  reservedCredits: number;
  accentTheme: AccentTheme;
  ledger: LedgerEntry[];
  jobs: JobRecord[];
  toggleAccentTheme: () => void;
  signInDemo: (email?: string) => void;
  signOutDemo: () => void;
  reserveCredits: (cost: number, note: string) => boolean;
  settleCredits: (cost: number, note: string) => void;
  refundCredits: (cost: number, note: string) => void;
  addCreditsPack: (credits: number, packName: string) => void;
  upsertJob: (job: JobRecord) => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: "tx-welcome-100",
    timestamp: "Just now",
    type: "signup_bonus",
    deltaAvailable: 100,
    deltaReserved: 0,
    balanceAfter: 100,
    note: "Welcome to ReelMux (reelmux.com): 100 free credits · No card needed",
  },
];

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>("creator@reelmux.com");
  const [availableCredits, setAvailableCredits] = useState<number>(100);
  const [reservedCredits, setReservedCredits] = useState<number>(0);
  const [accentTheme, setAccentTheme] = useState<AccentTheme>("lime");
  const [ledger, setLedger] = useState<LedgerEntry[]>(INITIAL_LEDGER);
  const [jobs, setJobs] = useState<JobRecord[]>([]);

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
          note: `Top-up ${packName} (+${credits.toLocaleString()} credits)`,
        },
        ...old,
      ]);
      return next;
    });
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
        ledger,
        jobs,
        toggleAccentTheme,
        signInDemo,
        signOutDemo,
        reserveCredits,
        settleCredits,
        refundCredits,
        addCreditsPack,
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
