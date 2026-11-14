"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  Save,
  Sparkles,
  Zap,
  CreditCard,
  Palette,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";

const STUDIO_AVATAR_PRESETS = [
  { label: "Cobalt Portrait", url: "/examples/nano-banana-2-portrait.webp" },
  { label: "Crimson Couture", url: "/examples/seedream-5-pro-fashion.webp" },
  { label: "Neon Cyber", url: "/examples/gpt-image-2-6-poster.webp" },
  { label: "Gold Horology", url: "/examples/gpt-image-2-6-sunburst-watch.webp" },
];

export default function ProfilePage() {
  const {
    isSignedIn,
    userEmail,
    displayName,
    avatarUrl,
    authProvider,
    memberSince,
    availableCredits,
    reservedCredits,
    activePlanName,
    subscriptionStatus,
    nextBillingDate,
    accentTheme,
    toggleAccentTheme,
    cancelSubscription,
    updateProfile,
    signInWithGoogle,
    signOut,
  } = useWallet();

  const router = useRouter();
  const [nameInput, setNameInput] = useState(displayName || "");
  const [avatarInput, setAvatarInput] = useState(avatarUrl || "");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setNameInput(displayName || userEmail?.split("@")[0] || "");
    setAvatarInput(avatarUrl || "");
  }, [displayName, avatarUrl, userEmail]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg("");
    setErrorMsg("");
    const res = await updateProfile({
      displayName: nameInput.trim(),
      avatarUrl: avatarInput.trim() || null,
    });
    setSaving(false);
    if (res.ok) {
      setStatusMsg("Profile changes saved successfully.");
    } else {
      setErrorMsg(res.error || "Could not sync profile update to server; saved locally.");
    }
  };

  const handleConnectGoogle = async () => {
    setErrorMsg("");
    const res = await signInWithGoogle("/profile");
    if (!res.ok) {
      setErrorMsg(
        res.error || "Google OAuth provider is not enabled in Supabase Auth yet."
      );
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <div className="rounded-3xl border border-white/10 bg-[#0C0E14] p-8 text-center shadow-2xl space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D4FF00]/30 bg-[#D4FF00]/10">
            <User className="h-7 w-7 text-[#D4FF00]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Sign in to view your Profile</h1>
          <p className="text-sm text-zinc-400">
            Manage your display name, avatar, Google account connection, billing plan, and active
            sessions after signing in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <button
              type="button"
              onClick={handleConnectGoogle}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Continue with Google
            </button>
            <Link
              href="/auth?next=/profile"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4FF00] px-5 py-3 text-sm font-extrabold text-black hover:bg-[#e2ff3e] transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Sign in with Email
            </Link>
          </div>
          {errorMsg && (
            <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          {avatarInput ? (
            <img
              src={avatarInput}
              alt={nameInput || userEmail || "Avatar"}
              className="h-16 w-16 rounded-2xl object-cover border border-[#D4FF00]/40 bg-black"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4FF00] text-xl font-extrabold text-black">
              {(nameInput || userEmail || "R").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">
                {nameInput || userEmail?.split("@")[0] || "Creator"}
              </h1>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-bold uppercase text-emerald-300">
                {authProvider === "google" ? "Google OAuth" : "Email Session"}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">{userEmail}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
          >
            <Layers className="h-4 w-4 text-[#D4FF00]" />
            Workspace Ledger
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left 7 Cols: Edit Personal Profile */}
        <form
          onSubmit={handleSaveProfile}
          className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0C0E14] p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="h-4 w-4 text-[#D4FF00]" />
              Personal Profile
            </h2>
            {memberSince && (
              <span className="text-xs text-zinc-500">Member since {memberSince}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your creator or studio name"
              className="w-full rounded-xl border border-white/15 bg-[#121620] px-4 py-2.5 text-sm text-white focus:border-[#D4FF00] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Account Email
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-zinc-400">
              <Mail className="h-4 w-4 text-zinc-500" />
              <span>{userEmail}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Avatar Image URL (or pick a studio portrait below)
            </label>
            <input
              type="text"
              value={avatarInput}
              onChange={(e) => setAvatarInput(e.target.value)}
              placeholder="https://... or choose preset"
              className="w-full rounded-xl border border-white/15 bg-[#121620] px-4 py-2.5 text-xs text-white focus:border-[#D4FF00] focus:outline-none"
            />
            <div className="mt-3 grid grid-cols-4 gap-2.5">
              {STUDIO_AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => setAvatarInput(preset.url)}
                  className={`group overflow-hidden rounded-xl border p-1 text-left transition-all cursor-pointer ${
                    avatarInput === preset.url
                      ? "border-[#D4FF00] bg-[#D4FF00]/10"
                      : "border-white/10 bg-black/40 hover:border-white/25"
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="h-14 w-full rounded-lg object-cover"
                  />
                  <div className="mt-1 truncate px-1 text-[10px] font-medium text-zinc-300">
                    {preset.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#D4FF00] px-5 py-2.5 text-xs font-extrabold text-black hover:bg-[#e2ff3e] disabled:opacity-60 transition-colors cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>

        {/* Right 5 Cols: Google Account, Plan & Preferences */}
        <div className="lg:col-span-5 space-y-6">
          {/* Google OAuth & Security */}
          <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Connected Accounts &amp; Security
            </h2>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3.5">
              <div>
                <div className="text-xs font-bold text-white">Google OAuth</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {authProvider === "google"
                    ? "Connected & verified via Google"
                    : "Link Google for 1-click sign-in"}
                </div>
              </div>
              {authProvider === "google" ? (
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                  Connected
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-black hover:bg-zinc-200 cursor-pointer"
                >
                  Connect Google
                </button>
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3.5">
              <div>
                <div className="text-xs font-bold text-white">Studio Accent Theme</div>
                <div className="text-[11px] text-zinc-400 mt-0.5 capitalize">
                  Active: {accentTheme}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleAccentTheme}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white hover:border-[#D4FF00] cursor-pointer"
              >
                <Palette className="h-3.5 w-3.5 text-[#D4FF00]" />
                Switch
              </button>
            </div>
          </div>

          {/* Credits & Subscription Summary */}
          <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#D4FF00]" />
              Plan &amp; Credits
            </h2>
            <div className="flex items-center justify-between rounded-xl border border-[#D4FF00]/25 bg-[#D4FF00]/5 p-3.5">
              <div>
                <div className="text-[11px] uppercase text-zinc-400">Available Credits</div>
                <div className="text-2xl font-extrabold text-[#D4FF00]">
                  {availableCredits.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase text-zinc-400">Held in Escrow</div>
                <div className="text-lg font-bold text-white">{reservedCredits}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">{activePlanName}</div>
                <div className="text-zinc-400">
                  {subscriptionStatus === "active" && nextBillingDate
                    ? `Active · Renews ${nextBillingDate}`
                    : "Pay-as-you-go"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {subscriptionStatus === "active" && (
                  <button
                    type="button"
                    onClick={cancelSubscription}
                    className="text-rose-400 hover:underline cursor-pointer"
                  >
                    Cancel renewal
                  </button>
                )}
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 rounded-lg bg-[#D4FF00] px-3 py-1.5 font-bold text-black hover:bg-[#e2ff3e]"
                >
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  Top Up
                </Link>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <Link
                href="/admin/signup-abuse"
                className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-[#D4FF00]"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Admin Console
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 font-semibold text-[#D4FF00] hover:underline"
              >
                Full Ledger &amp; History
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
