"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  X,
  Sparkles,
  Zap,
  Menu,
  ArrowRight,
  Film,
  Image as ImageIcon,
  Music,
  Cpu,
  Palette,
  User,
  LogOut,
  LogIn,
  Layers,
  CreditCard,
  ShieldAlert,
} from "lucide-react";
import { TOOLS_CATALOG, MODELS_CATALOG, BadgeType } from "@/lib/catalog/models";
import { useWallet } from "@/context/WalletContext";
import { BrandLogo } from "@/components/brand/BrandLogo";

type MegaMenuKey = "video" | "image" | "audio" | "models" | null;

function StatusBadge({ badge }: { badge?: BadgeType }) {
  if (!badge) return null;
  if (badge === "HOT") {
    return (
      <span className="ml-1.5 inline-flex items-center rounded-full bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
        HOT
      </span>
    );
  }
  return (
    <span className="ml-1.5 inline-flex items-center rounded-full bg-[#D4FF00]/20 border border-[#D4FF00]/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#D4FF00]">
      NEW
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const {
    availableCredits,
    reservedCredits,
    isSignedIn,
    userEmail,
    displayName,
    avatarUrl,
    authProvider,
    accentTheme,
    toggleAccentTheme,
    signOut,
  } = useWallet();

  const [bannerVisible, setBannerVisible] = useState(true);
  const [openMenu, setOpenMenu] = useState<MegaMenuKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setAccountOpen(false);
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  const videoTools = TOOLS_CATALOG.filter((t) => t.category === "video").slice(0, 4);
  const imageTools = TOOLS_CATALOG.filter((t) => t.category === "image").slice(0, 4);
  const audioTools = TOOLS_CATALOG.filter((t) => t.category === "audio").slice(0, 3);

  const videoModels = MODELS_CATALOG.filter((m) => m.category === "video" && m.popularInMenu);
  const imageModels = MODELS_CATALOG.filter((m) => m.category === "image" && m.popularInMenu);
  const audioModels = MODELS_CATALOG.filter((m) => m.category === "audio" && m.popularInMenu);

  const handleMouseEnter = (key: MegaMenuKey) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenMenu(key);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 140);
  };

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const signalBg =
    accentTheme === "lime"
      ? "bg-gradient-to-r from-[#D4FF00] via-[#8BFF65] to-cyan-300 text-zinc-950"
      : "bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 text-zinc-950";

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* 1. ReelMux Cyber-Prism Top Announcement Banner */}
      {bannerVisible && (
        <div
          className={`relative flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${signalBg}`}
        >
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="font-bold tracking-tight">
              🎬 NEW: AI 4-Shot Storyboard Director &amp; Dual-Model A/B Arena are live on ReelMux
            </span>
            <Link
              href="/storyboard"
              className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-0.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors"
            >
              Launch Storyboard
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <button
            onClick={() => setBannerVisible(false)}
            aria-label="Dismiss announcement"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-black/70 hover:bg-black/10 hover:text-black transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2. FrameMux 1:1 Sticky Glassmorphic Header */}
      <div
        className="relative border-b border-white/10 bg-[#07080C]/80 backdrop-blur-2xl"
        onMouseLeave={handleMouseLeave}
      >
        <nav
          aria-label="Global"
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          {/* A. Left Brand Logo (ReelMux Emblem + Wordmark) */}
          <div className="flex items-center gap-3">
            <BrandLogo href="/" showDomainBadge />
          </div>

          {/* B. Center Pill Menu (FrameMux 7-Item Navigation Bar) */}
          <div className="hidden xl:flex items-center gap-0.5 whitespace-nowrap rounded-xl bg-white/[0.03] p-1 border border-white/[0.06]">
            {/* 1. AI Video Mega-Menu Trigger */}
            <button
              type="button"
              aria-expanded={openMenu === "video"}
              aria-controls="menu-video"
              onMouseEnter={() => handleMouseEnter("video")}
              onClick={() => setOpenMenu(openMenu === "video" ? null : "video")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                openMenu === "video" || pathname.startsWith("/tools/text-to-video") || pathname.startsWith("/tools/image-to-video")
                  ? "bg-white/10 text-white"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              AI Video
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  openMenu === "video" ? "rotate-180 text-[#D4FF00]" : "text-zinc-400"
                }`}
              />
            </button>

            {/* 2. AI Image Mega-Menu Trigger */}
            <button
              type="button"
              aria-expanded={openMenu === "image"}
              aria-controls="menu-image"
              onMouseEnter={() => handleMouseEnter("image")}
              onClick={() => setOpenMenu(openMenu === "image" ? null : "image")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                openMenu === "image" || pathname.startsWith("/tools/text-to-image")
                  ? "bg-white/10 text-white"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              AI Image
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  openMenu === "image" ? "rotate-180 text-[#D4FF00]" : "text-zinc-400"
                }`}
              />
            </button>

            {/* 3. AI Audio Mega-Menu Trigger */}
            <button
              type="button"
              aria-expanded={openMenu === "audio"}
              aria-controls="menu-audio"
              onMouseEnter={() => handleMouseEnter("audio")}
              onClick={() => setOpenMenu(openMenu === "audio" ? null : "audio")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                openMenu === "audio" || pathname.startsWith("/tools/ai-music")
                  ? "bg-white/10 text-white"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              AI Audio
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  openMenu === "audio" ? "rotate-180 text-[#D4FF00]" : "text-zinc-400"
                }`}
              />
            </button>

            {/* 4. Storyboard Director Direct Link */}
            <Link
              href="/storyboard"
              onMouseEnter={() => setOpenMenu(null)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                pathname === "/storyboard"
                  ? "bg-cyan-400/15 text-cyan-200 border border-cyan-400/30"
                  : "text-zinc-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>Storyboard</span>
              <span className="rounded bg-cyan-400/20 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-cyan-300">
                PRO
              </span>
            </Link>

            {/* 5. AI Effects Direct Link */}
            <Link
              href="/ai-effects"
              onMouseEnter={() => setOpenMenu(null)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                pathname === "/ai-effects"
                  ? "bg-white/10 text-white"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              AI Effects
            </Link>

            {/* 5. Models Dropdown / Link */}
            <button
              type="button"
              aria-expanded={openMenu === "models"}
              onMouseEnter={() => handleMouseEnter("models")}
              onClick={() => setOpenMenu(openMenu === "models" ? null : "models")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                openMenu === "models" || pathname === "/models"
                  ? "bg-white/10 text-white"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              Models
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  openMenu === "models" ? "rotate-180 text-[#D4FF00]" : "text-zinc-400"
                }`}
              />
            </button>

            {/* 6. For Agents Direct Link */}
            <Link
              href="/for-agents"
              onMouseEnter={() => setOpenMenu(null)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                pathname === "/for-agents"
                  ? "bg-white/10 text-white"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              For Agents
            </Link>

            {/* 7. Pricing Direct Link */}
            <Link
              href="/pricing"
              onMouseEnter={() => setOpenMenu(null)}
              className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                pathname === "/pricing"
                  ? "bg-white/10 text-white"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              Pricing
              {pathname === "/pricing" && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#D4FF00]" />
              )}
            </Link>
          </div>

          {/* C. Right Side Action Buttons */}
          <div className="hidden xl:flex items-center gap-2 whitespace-nowrap">
            {/* Theme Accent Switcher */}
            <button
              type="button"
              onClick={toggleAccentTheme}
              title="Switch Brand Accent Theme (Signal Lime / Cinema Pulse)"
              className="hidden xl:flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:border-white/20 hover:text-white transition-colors"
            >
              <Palette className="h-3.5 w-3.5 text-[#D4FF00]" />
              <span className="capitalize">{accentTheme}</span>
            </button>

            {/* Unified Credit Balance Pill */}
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg border border-[#D4FF00]/30 bg-[#D4FF00]/10 px-3 py-1.5 text-xs font-semibold text-[#D4FF00] hover:bg-[#D4FF00]/15 transition-colors"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>{availableCredits.toLocaleString()} credits</span>
              {reservedCredits > 0 && (
                <span className="ml-1 rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] text-amber-300">
                  {reservedCredits} held
                </span>
              )}
            </Link>

            {isSignedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-2.5 py-1.5 text-xs font-semibold text-white hover:border-[#D4FF00]/60 transition-colors cursor-pointer"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName || userEmail || "Avatar"}
                      className="h-5 w-5 rounded-full object-cover border border-[#D4FF00]/50"
                    />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D4FF00] text-[10px] font-extrabold text-black">
                      {(displayName || userEmail || "R").slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="max-w-[110px] truncate">
                    {displayName || userEmail?.split("@")[0] || "Account"}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/15 bg-[#0D1018] p-2 shadow-2xl z-50">
                    <div className="px-3 py-2.5 border-b border-white/10">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-bold text-white">
                          {displayName || userEmail?.split("@")[0]}
                        </span>
                        <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-300">
                          {authProvider === "google" ? "Google" : "Email"}
                        </span>
                      </div>
                      <div className="truncate text-[11px] text-zinc-400 mt-0.5">{userEmail}</div>
                    </div>

                    <div className="py-1 space-y-0.5 text-xs">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-200 hover:bg-white/10 hover:text-white"
                      >
                        <User className="h-3.5 w-3.5 text-[#D4FF00]" />
                        Personal Profile &amp; Settings
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-200 hover:bg-white/10 hover:text-white"
                      >
                        <Layers className="h-3.5 w-3.5 text-cyan-300" />
                        Workspace &amp; Credit Ledger
                      </Link>
                      <Link
                        href="/pricing"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-200 hover:bg-white/10 hover:text-white"
                      >
                        <CreditCard className="h-3.5 w-3.5 text-emerald-300" />
                        Billing &amp; Top Up Credits
                      </Link>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-200 hover:bg-white/10 hover:text-white"
                      >
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-300" />
                        Admin Console
                      </Link>
                    </div>

                    <div className="pt-1 mt-1 border-t border-white/10">
                      <button
                        type="button"
                        onClick={async () => {
                          setAccountOpen(false);
                          await signOut();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/15 cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white hover:border-[#D4FF00]/60 hover:bg-white/10 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5 text-[#D4FF00]" />
                Sign in
              </Link>
            )}

            <Link
              href={isSignedIn ? "/tools/text-to-video" : "/auth"}
              className="rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-black shadow-sm hover:bg-zinc-200 active:scale-[0.98] transition-all"
            >
              {isSignedIn ? "Open Studio" : "Start free"}
            </Link>
          </div>

          {/* Mobile Hamburger Trigger */}
          <div className="flex items-center gap-2 xl:hidden">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 rounded-lg border border-[#D4FF00]/30 bg-[#D4FF00]/10 px-2.5 py-1 text-xs font-semibold text-[#D4FF00]"
            >
              <Zap className="h-3 w-3" />
              {availableCredits}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-zinc-300 hover:bg-white/10 hover:text-white"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {/* =====================================================================
            3. FrameMux 1:1 Mega-Menu Panels (AI Video / AI Image / AI Audio / Models)
           ===================================================================== */}
        {openMenu && (
          <div
            onMouseEnter={() => handleMouseEnter(openMenu)}
            onMouseLeave={handleMouseLeave}
            className="hidden xl:block absolute left-0 right-0 top-full border-b border-white/10 bg-[#0B0D13]/95 backdrop-blur-2xl shadow-2xl"
          >
            <div className="mx-auto max-w-7xl px-6 py-7">
              {/* MEGA-MENU 1: AI VIDEO */}
              {openMenu === "video" && (
                <div id="menu-video" className="grid grid-cols-12 gap-8">
                  {/* Left Column (col-span-8): Video Tools 2x2 Visual Cards */}
                  <div className="col-span-8">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Video tools
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      {videoTools.map((tool) => (
                        <Link
                          key={tool.slug}
                          href={`/tools/${tool.slug}`}
                          className="group relative flex overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:border-[#D4FF00]/50 hover:bg-white/[0.05] transition-all"
                        >
                          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                            {tool.previewVideo ? (
                              <video
                                src={tool.previewVideo}
                                poster={tool.previewImage}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <img
                                src={tool.previewImage}
                                alt={tool.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <span className="absolute bottom-1 left-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-[#D4FF00]">
                              From {tool.fromCredits}c
                            </span>
                          </div>
                          <div className="ml-3.5 flex flex-col justify-center">
                            <div className="flex items-center">
                              <span className="text-sm font-semibold text-white group-hover:text-[#D4FF00] transition-colors">
                                {tool.name}
                              </span>
                              <StatusBadge badge={tool.badge} />
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                              {tool.shortDesc}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Right Column (col-span-4): Popular Video Models */}
                  <div className="col-span-4 border-l border-white/10 pl-8">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Popular video models
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {videoModels.map((model) => (
                        <Link
                          key={model.id}
                          href={`/tools/text-to-video?model=${model.id}`}
                          className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <span className="truncate font-medium">{model.name}</span>
                          <StatusBadge badge={model.badge} />
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <Link
                        href="/models?category=video"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4FF00] hover:underline"
                      >
                        All 25 video models
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* MEGA-MENU 2: AI IMAGE */}
              {openMenu === "image" && (
                <div id="menu-image" className="grid grid-cols-12 gap-8">
                  <div className="col-span-8">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Image tools
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      {imageTools.map((tool) => (
                        <Link
                          key={tool.slug}
                          href={`/tools/${tool.slug}`}
                          className="group flex overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:border-[#D4FF00]/50 hover:bg-white/[0.05] transition-all"
                        >
                          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                            <img
                              src={tool.previewImage}
                              alt={tool.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <span className="absolute bottom-1 left-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-[#D4FF00]">
                              From {tool.fromCredits}c
                            </span>
                          </div>
                          <div className="ml-3.5 flex flex-col justify-center">
                            <div className="flex items-center">
                              <span className="text-sm font-semibold text-white group-hover:text-[#D4FF00] transition-colors">
                                {tool.name}
                              </span>
                              <StatusBadge badge={tool.badge} />
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                              {tool.shortDesc}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-4 border-l border-white/10 pl-8">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Popular image models
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {imageModels.map((model) => (
                        <Link
                          key={model.id}
                          href={`/tools/text-to-image?model=${model.id}`}
                          className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <div className="flex items-center">
                            <span className="font-medium">{model.name}</span>
                            <StatusBadge badge={model.badge} />
                          </div>
                          <span className="text-xs text-zinc-500">{model.baseCredits}c</span>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <Link
                        href="/models?category=image"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4FF00] hover:underline"
                      >
                        All 32 image models
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* MEGA-MENU 3: AI AUDIO */}
              {openMenu === "audio" && (
                <div id="menu-audio" className="grid grid-cols-12 gap-8">
                  <div className="col-span-8">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Audio tools
                    </div>
                    <div className="grid grid-cols-3 gap-3.5">
                      {audioTools.map((tool) => (
                        <Link
                          key={tool.slug}
                          href={`/tools/${tool.slug}`}
                          className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:border-[#D4FF00]/50 hover:bg-white/[0.05] transition-all"
                        >
                          <div className="relative h-24 w-full overflow-hidden rounded-lg bg-zinc-900">
                            <img
                              src={tool.previewImage}
                              alt={tool.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <span className="absolute bottom-1.5 left-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-[#D4FF00]">
                              From {tool.fromCredits}c
                            </span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center">
                              <span className="text-sm font-semibold text-white group-hover:text-[#D4FF00]">
                                {tool.name}
                              </span>
                              <StatusBadge badge={tool.badge} />
                            </div>
                            <p className="mt-1 text-xs text-zinc-400">{tool.shortDesc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-4 border-l border-white/10 pl-8">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Popular audio models
                    </div>
                    <div className="flex flex-col gap-2">
                      {audioModels.map((model) => (
                        <Link
                          key={model.id}
                          href={`/tools/ai-music?model=${model.id}`}
                          className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 text-sm text-zinc-200 hover:border-white/20 hover:bg-white/10 transition-colors"
                        >
                          <div>
                            <div className="flex items-center font-semibold text-white">
                              {model.name}
                              <StatusBadge badge={model.badge} />
                            </div>
                            <p className="mt-0.5 text-xs text-zinc-400">{model.tagline}</p>
                          </div>
                          <span className="text-xs font-medium text-[#D4FF00]">
                            {model.baseCredits}c
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MEGA-MENU 4: MODELS DIRECTORY QUICK VIEW */}
              {openMenu === "models" && (
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-9 grid grid-cols-3 gap-4">
                    <Link
                      href="/models?category=video"
                      className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-[#D4FF00]/50 hover:bg-white/[0.05] transition-all"
                    >
                      <Film className="h-5 w-5 text-[#D4FF00]" />
                      <div className="mt-2.5 text-sm font-semibold text-white">
                        25+ Video Models
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">
                        Kling 4.0, Seedance 2.5, Veo 3.1, MiniMax H3, Wan 3.0, Grok Imagine
                      </p>
                    </Link>
                    <Link
                      href="/models?category=image"
                      className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-[#D4FF00]/50 hover:bg-white/[0.05] transition-all"
                    >
                      <ImageIcon className="h-5 w-5 text-cyan-400" />
                      <div className="mt-2.5 text-sm font-semibold text-white">
                        32+ Image Models
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">
                        GPT Image 2.6, MiniMax H3 Image, Nano Banana Pro, Seedream 5.0, FLUX.2 Max
                      </p>
                    </Link>
                    <Link
                      href="/models?category=audio"
                      className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-[#D4FF00]/50 hover:bg-white/[0.05] transition-all"
                    >
                      <Music className="h-5 w-5 text-rose-400" />
                      <div className="mt-2.5 text-sm font-semibold text-white">
                        16+ Audio &amp; Speech Models
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">
                        Suno v4.5 full songs, ElevenLabs v3 voiceovers &amp; cinematic Foley SFX
                      </p>
                    </Link>
                  </div>
                  <div className="col-span-3 flex flex-col justify-between rounded-xl border border-[#D4FF00]/30 bg-[#D4FF00]/5 p-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D4FF00]">
                        <Cpu className="h-4 w-4" />
                        Unified Model Directory
                      </div>
                      <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                        Use one credit balance across all 73+ video, image and audio models with
                        upfront pricing and automatic failed-job refunds.
                      </p>
                    </div>
                    <Link
                      href="/models"
                      className="mt-4 inline-flex items-center justify-between rounded-lg bg-[#D4FF00] px-3 py-2 text-xs font-bold text-black hover:bg-[#dfef44] transition-colors"
                    >
                      Explore all 73 models
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="xl:hidden border-b border-white/10 bg-[#0B0D13] px-4 py-5 space-y-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                AI Video Tools
              </div>
              <div className="grid grid-cols-2 gap-2">
                {videoTools.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tools/${t.slug}`}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                AI Image &amp; Audio
              </div>
              <div className="grid grid-cols-2 gap-2">
                {imageTools.slice(0, 2).concat(audioTools.slice(0, 2)).map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tools/${t.slug}`}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2 border-t border-white/10 text-sm font-medium text-zinc-300">
              <Link href="/storyboard" className="text-cyan-300 font-bold hover:text-white">
                Storyboard Director
              </Link>
              <Link href="/ai-effects" className="hover:text-white">
                AI Effects
              </Link>
              <Link href="/models" className="hover:text-white">
                Models (73)
              </Link>
              <Link href="/for-agents" className="hover:text-white">
                For Agents
              </Link>
              <Link href="/pricing" className="hover:text-white">
                Pricing
              </Link>
            </div>
            {isSignedIn ? (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4FF00] text-xs font-extrabold text-black">
                    {(displayName || userEmail || "R").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold text-white">{displayName}</div>
                    <div className="truncate text-[11px] text-zinc-400">{userEmail}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/profile"
                    className="flex-1 rounded-lg border border-white/15 py-2 text-center text-xs font-semibold text-white"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex-1 rounded-lg border border-white/15 py-2 text-center text-xs font-semibold text-white"
                  >
                    Workspace
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileOpen(false);
                      await signOut();
                    }}
                    className="flex-1 rounded-lg border border-rose-500/35 bg-rose-500/10 py-2 text-center text-xs font-bold text-rose-300 cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/auth"
                  className="flex-1 rounded-lg border border-white/15 py-2 text-center text-sm font-semibold text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/tools/text-to-video"
                  className="flex-1 rounded-lg bg-[#D4FF00] py-2 text-center text-sm font-bold text-black"
                >
                  Start free
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
