"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Video,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  Play,
  ShieldCheck,
  Clock,
  Volume2,
  Layers,
  Cpu,
  Wand2,
} from "lucide-react";
import {
  TOOLS_CATALOG,
  MODELS_CATALOG,
  AI_EFFECTS_CATALOG,
  HERO_LIVE_SAMPLES,
  BRAND_MARQUEE_LIST,
} from "@/lib/catalog/models";

export default function HomePage() {
  const [activeSampleIndex, setActiveSampleIndex] = useState(0);
  const [toolFilter, setToolFilter] = useState<"all" | "video" | "image" | "audio">("all");

  const activeSample = HERO_LIVE_SAMPLES[activeSampleIndex];
  const filteredTools =
    toolFilter === "all"
      ? TOOLS_CATALOG
      : TOOLS_CATALOG.filter((t) => t.category === toolFilter);

  const featuredModels = MODELS_CATALOG.slice(0, 8);

  return (
    <div className="relative overflow-hidden">
      {/* =====================================================================
          1. REDESIGNED HERO SECTION: Interactive Multi-Model Live Stage
         ===================================================================== */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20">
        {/* Ambient Cinema Glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[980px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#D4FF00]/15 via-cyan-500/10 to-violet-600/15 blur-[130px]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Quick Release Pills (Matching FrameMux Hero Pills + Upgraded Badges) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-7">
            <Link
              href="/tools/text-to-image?model=minimax-h3-image"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1 text-xs font-medium text-zinc-200 hover:border-[#D4FF00]/50 hover:bg-white/[0.08] transition-all"
            >
              <span className="rounded-full bg-[#D4FF00] px-1.5 py-0.5 text-[10px] font-extrabold text-black">
                NEW
              </span>
              <span>MiniMax H3 Image · 4 credits</span>
              <ArrowRight className="h-3 w-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/tools/text-to-video?model=seedance-2.5"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1 text-xs font-medium text-zinc-200 hover:border-rose-500/50 hover:bg-white/[0.08] transition-all"
            >
              <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                HOT
              </span>
              <span>Seedance 2.5 Multi-Shot + Audio</span>
              <ArrowRight className="h-3 w-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Main Headline */}
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.06]">
              Create videos, images and audio with{" "}
              <span className="bg-gradient-to-r from-[#D4FF00] via-lime-300 to-cyan-300 bg-clip-text text-transparent">
                every flagship AI model
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-zinc-300 leading-relaxed">
              One credit balance for creators and marketers to use every major model — including
              Kling 4.0, Seedance 2.5, Veo 3.1, Wan 3.0, GPT Image 2.6, FLUX.2 and Suno. Free to
              try: new accounts get 100 credits with no card.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/tools/text-to-video"
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#D4FF00] px-6 py-3.5 text-sm sm:text-base font-bold text-black shadow-lg shadow-[#D4FF00]/20 hover:bg-[#e2ff3e] active:scale-[0.98] transition-all"
              >
                <Video className="h-5 w-5" />
                Create a video
              </Link>
              <Link
                href="/tools/text-to-image"
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.06] px-6 py-3.5 text-sm sm:text-base font-semibold text-white backdrop-blur-xl hover:bg-white/[0.12] active:scale-[0.98] transition-all"
              >
                <ImageIcon className="h-5 w-5 text-cyan-300" />
                Create an image
              </Link>
              <Link
                href="/ai-effects"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm sm:text-base font-medium text-zinc-300 hover:border-white/25 hover:text-white transition-all"
              >
                <Wand2 className="h-4 w-4 text-[#D4FF00]" />
                AI Video Effects
              </Link>
            </div>

            {/* Assurance Micro-Copy */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#D4FF00]" />
                100 free credits on sign up
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#D4FF00]" />
                No card needed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#D4FF00]" />
                Credits back automatically on failed jobs
              </span>
            </div>
          </div>

          {/* Interactive Live Model Switcher Stage (Differentiated Upgrade over Static Video) */}
          <div className="mt-12 rounded-2xl border border-white/15 bg-[#0C0E14]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#D4FF00]" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Interactive Model Benchmark Stage · Click to Compare
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {HERO_LIVE_SAMPLES.map((sample, idx) => (
                  <button
                    key={sample.modelId}
                    type="button"
                    onClick={() => setActiveSampleIndex(idx)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      idx === activeSampleIndex
                        ? "bg-[#D4FF00] text-black shadow-sm"
                        : "border border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{sample.modelName}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] ${
                        idx === activeSampleIndex
                          ? "bg-black/20 text-black font-bold"
                          : "bg-white/10 text-zinc-300"
                      }`}
                    >
                      {sample.credits}c
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12 items-center">
              {/* Left 7 Cols: Visual Preview Frame */}
              <div className="lg:col-span-7 relative overflow-hidden rounded-xl border border-white/10 bg-black aspect-video group">
                <img
                  src={activeSample.posterUrl}
                  alt={activeSample.modelName}
                  className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 px-3 py-1 text-xs font-semibold text-white">
                    <Play className="h-3 w-3 fill-[#D4FF00] text-[#D4FF00]" />
                    {activeSample.modelName}
                  </span>
                  <span className="rounded-full bg-black/75 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[11px] text-zinc-300">
                    {activeSample.resolution}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="rounded-full bg-[#D4FF00] px-3 py-1 text-xs font-extrabold text-black">
                    ⚡ {activeSample.credits} credits
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/75 p-3 backdrop-blur-md">
                  <div className="flex items-center gap-4 text-xs text-zinc-300">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#D4FF00]" />
                      {activeSample.metrics.speed}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
                      {activeSample.metrics.audio}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-emerald-400" />
                      Consistency: {activeSample.metrics.consistency}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-400">
                    Commercial use included
                  </span>
                </div>
              </div>

              {/* Right 5 Cols: Prompt Breakdown & Instant Remix */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Exact Prompt Used
                    </span>
                    <span className="text-xs font-medium text-[#D4FF00]">
                      Cost quoted upfront
                    </span>
                  </div>
                  <p className="mt-3 rounded-xl border border-white/10 bg-black/50 p-4 text-sm leading-relaxed text-zinc-200 font-mono">
                    &ldquo;{activeSample.prompt}&rdquo;
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-white/10 pt-3">
                    <span>Estimated Cost with 100 Free Signup Credits:</span>
                    <span className="font-bold text-white">
                      {activeSample.credits <= 100
                        ? `Can run ${Math.floor(100 / activeSample.credits)}× for free`
                        : "Top up from $9.90"}
                    </span>
                  </div>

                  <Link
                    href={`/tools/${
                      activeSample.modelId.includes("image") ? "text-to-image" : "text-to-video"
                    }?model=${activeSample.modelId}&prompt=${encodeURIComponent(
                      activeSample.prompt
                    )}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4FF00] py-3 text-sm font-bold text-black hover:bg-[#e1ff3d] transition-colors"
                  >
                    <Sparkles className="h-4 w-4" />
                    Run this prompt with {activeSample.modelName}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. INFINITE MODEL PROVIDERS MARQUEE TICKER
         ===================================================================== */}
      <section className="border-y border-white/10 bg-[#090B10] py-4 overflow-hidden">
        <div className="animate-marquee flex items-center gap-8">
          {BRAND_MARQUEE_LIST.concat(BRAND_MARQUEE_LIST).map((brand, idx) => (
            <div
              key={`${brand}-${idx}`}
              className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-zinc-400 whitespace-nowrap"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4FF00]/70" />
              <span>{brand}</span>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          3. BENTO GRID MULTIMODAL TOOLS SHOWCASE (#tools)
         ===================================================================== */}
      <section id="tools" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4FF00]/30 bg-[#D4FF00]/10 px-3 py-1 text-xs font-semibold text-[#D4FF00]">
                <Layers className="h-3.5 w-3.5" />
                Unified Multimodal Studio
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Every creative workflow in one workspace
              </h2>
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-zinc-400">
                Switch seamlessly between text-to-video, keyframe interpolation, multi-character
                reference lock, 2K poster design, and full-song composition.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-1 self-start">
              {(["all", "video", "image", "audio"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setToolFilter(cat)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    toolFilter === cat
                      ? "bg-[#D4FF00] text-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {cat === "all" ? "All Tools (13)" : `AI ${cat}`}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool, index) => {
              const isFeatured = index === 0 && toolFilter === "all";
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0D1017] p-5 hover:border-[#D4FF00]/50 transition-all duration-300 ${
                    isFeatured ? "sm:col-span-2 lg:col-span-2" : ""
                  }`}
                >
                  <div className="relative h-48 w-full overflow-hidden rounded-xl bg-zinc-900">
                    <img
                      src={tool.previewImage}
                      alt={tool.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${tool.previewGradient} opacity-60`}
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="rounded-md bg-black/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-200 backdrop-blur-md">
                        {tool.category}
                      </span>
                      {tool.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                            tool.badge === "HOT"
                              ? "bg-rose-500 text-white"
                              : "bg-[#D4FF00] text-black"
                          }`}
                        >
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3 rounded-lg bg-black/80 px-2.5 py-1 text-xs font-bold text-[#D4FF00] backdrop-blur-md border border-white/10">
                      From {tool.fromCredits} credits
                    </div>
                  </div>

                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#D4FF00] transition-colors">
                        {tool.name}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                        {tool.longDesc}
                      </p>
                    </div>
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-zinc-300 group-hover:border-[#D4FF00] group-hover:bg-[#D4FF00] group-hover:text-black transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. ONE-CLICK AI VIDEO EFFECTS SECTION (#effects)
         ===================================================================== */}
      <section id="effects" className="border-t border-white/10 bg-[#090B10] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                <Wand2 className="h-3.5 w-3.5" />
                Zero Prompt Engineering Required
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                AI Video Effects
              </h2>
              <p className="mt-2 text-sm sm:text-base text-zinc-400">
                One photo in, a finished clip out. The camera choreography and prompt are built in.
              </p>
            </div>
            <Link
              href="/ai-effects"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D4FF00] hover:underline"
            >
              Browse all effects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AI_EFFECTS_CATALOG.map((effect) => (
              <Link
                key={effect.slug}
                href={`/ai-effects?effect=${effect.slug}`}
                className={`group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br ${effect.gradient} p-6 hover:border-[#D4FF00]/50 transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md border border-white/15 bg-black/40 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300">
                      {effect.category}
                    </span>
                    <span className="rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-[#D4FF00] border border-white/10">
                      ⚡ {effect.credits} credits
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-white group-hover:text-[#D4FF00] transition-colors">
                    {effect.name}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {effect.subtitle}
                  </p>

                  {/* Before -> After Pill Flow */}
                  <div className="mt-5 space-y-2 rounded-xl border border-white/10 bg-black/45 p-3 text-xs">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Input:</span>
                      <span className="font-medium text-zinc-200">{effect.beforeLabel}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Output:</span>
                      <span className="font-semibold text-[#D4FF00]">{effect.afterLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between pt-3 border-t border-white/10 text-xs font-semibold text-white">
                  <span>Try with 1 photo</span>
                  <ArrowRight className="h-4 w-4 text-[#D4FF00] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. LIVE YIR.AI MODEL PRICING SECTION (#models-pricing)
         ===================================================================== */}
      <section className="py-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4FF00]/30 bg-[#D4FF00]/10 px-3 py-1 text-xs font-semibold text-[#D4FF00]">
                <Cpu className="h-3.5 w-3.5" />
                Transparent Credit Pricing
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                73+ flagship models, one wallet
              </h2>
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-zinc-400">
                No more paying $20–$50/month to 10 separate AI platforms. Spend your credits on any
                model with upfront pricing and automatic failover.
              </p>
            </div>
            <Link
              href="/models"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              View full 73-model price matrix
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredModels.map((model) => (
              <Link
                key={model.id}
                href={`/tools/${
                  model.category === "image" ? "text-to-image" : "text-to-video"
                }?model=${model.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0D1017] p-5 hover:border-[#D4FF00]/50 hover:bg-[#121620] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      {model.category}
                    </span>
                    {model.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          model.badge === "HOT"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                            : "bg-[#D4FF00]/20 text-[#D4FF00] border border-[#D4FF00]/40"
                        }`}
                      >
                        {model.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-white group-hover:text-[#D4FF00] transition-colors">
                    {model.name}
                  </h3>
                  <p className="text-xs text-zinc-500">{model.provider}</p>
                  <p className="mt-2 text-xs text-zinc-300 leading-relaxed">{model.tagline}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {model.capabilities.slice(0, 3).map((cap) => (
                      <span
                        key={cap}
                        className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-400 border border-white/5"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3.5">
                  <div>
                    <span className="text-xs text-zinc-400">From </span>
                    <span className="text-sm font-extrabold text-[#D4FF00]">
                      {model.baseCredits} credits
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-white group-hover:translate-x-0.5 transition-transform">
                    Launch →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
