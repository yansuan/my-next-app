"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Video,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play,
  Pause,
  Clock,
  Volume2,
  Layers,
  Cpu,
  Wand2,
  Shuffle,
} from "lucide-react";
import {
  TOOLS_CATALOG,
  MODELS_CATALOG,
  AI_EFFECTS_CATALOG,
  HERO_LIVE_SAMPLES,
  HERO_BG_VIDEOS,
  VIDEO_EXAMPLES_GALLERY,
  BRAND_MARQUEE_LIST,
} from "@/lib/catalog/models";

export default function HomePage() {
  const [heroBgIndex, setHeroBgIndex] = useState(0);
  const [heroBgPaused, setHeroBgPaused] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  const [activeSampleIndex, setActiveSampleIndex] = useState(0);
  const [toolFilter, setToolFilter] = useState<"all" | "video" | "image" | "audio">("all");

  // Randomize the hero background video on every page open (matching FrameMux behavior)
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * HERO_BG_VIDEOS.length);
    setHeroBgIndex(randomIdx);
  }, []);

  const currentHeroBg = HERO_BG_VIDEOS[heroBgIndex] ?? HERO_BG_VIDEOS[0];

  const toggleHeroPlay = () => {
    const el = heroVideoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
      setHeroBgPaused(false);
    } else {
      el.pause();
      setHeroBgPaused(true);
    }
  };

  const cycleHeroBg = () => {
    setHeroBgIndex((prev) => (prev + 1) % HERO_BG_VIDEOS.length);
    setHeroBgPaused(false);
  };

  const activeSample = HERO_LIVE_SAMPLES[activeSampleIndex];
  const filteredTools =
    toolFilter === "all"
      ? TOOLS_CATALOG
      : TOOLS_CATALOG.filter((t) => t.category === toolFilter);

  const featuredModels = MODELS_CATALOG.slice(0, 12);
  const madeOnReelMuxClips = VIDEO_EXAMPLES_GALLERY.slice(0, 6);

  return (
    <div className="relative overflow-hidden">
      {/* =====================================================================
          1. FULL-BLEED CINEMA VIDEO HERO (Randomizes on Open + Play/Pause Control)
         ===================================================================== */}
      <section className="relative min-h-[86vh] flex flex-col justify-center overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24">
        {/* Background HTML5 Looping Cinema Video */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20">
          <video
            ref={heroVideoRef}
            key={currentHeroBg.videoUrl}
            src={currentHeroBg.videoUrl}
            poster={currentHeroBg.posterUrl}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover scale-[1.02] transition-opacity duration-700"
          />
        </div>

        {/* Multi-Layer Cinema Readability Scrim */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#06070A]/75 via-[#06070A]/55 to-[#06070A]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_20%,#06070A_95%)] opacity-80"
        />

        {/* Floating Bottom-Right Hero Video Controls (1:1 FrameMux Pause/Play + Reel Switcher) */}
        <div className="absolute right-6 bottom-6 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={cycleHeroBg}
            title="Switch background cinema reel"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/65 px-3 py-2 text-[11px] font-medium text-zinc-200 backdrop-blur-xl hover:border-[#D4FF00]/50 hover:text-white transition-all cursor-pointer"
          >
            <Shuffle className="h-3 w-3 text-[#D4FF00]" />
            <span>
              Reel: <strong className="text-white">{currentHeroBg.modelName}</strong>
            </span>
          </button>

          <button
            type="button"
            onClick={toggleHeroPlay}
            aria-label={heroBgPaused ? "Play background video" : "Pause background video"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/65 text-white backdrop-blur-xl hover:border-[#D4FF00] hover:text-[#D4FF00] transition-all cursor-pointer"
          >
            {heroBgPaused ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4 fill-current" />}
          </button>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          {/* Quick Release Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-7">
            <Link
              href="/tools/text-to-image?model=minimax-h3-image"
              className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 backdrop-blur-xl px-3.5 py-1 text-xs font-medium text-zinc-100 hover:border-[#D4FF00]/60 hover:bg-black/70 transition-all"
            >
              <span className="rounded-full bg-[#D4FF00] px-1.5 py-0.5 text-[10px] font-extrabold text-black">
                NEW
              </span>
              <span>MiniMax H3 Image · 4 credits</span>
              <ArrowRight className="h-3 w-3 text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/tools/text-to-video?model=seedance-2.5"
              className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 backdrop-blur-xl px-3.5 py-1 text-xs font-medium text-zinc-100 hover:border-rose-500/60 hover:bg-black/70 transition-all"
            >
              <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                HOT
              </span>
              <span>Seedance 2.5 Multi-Shot + Audio</span>
              <ArrowRight className="h-3 w-3 text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Main Headline */}
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.05] drop-shadow-sm">
              Create videos, images and audio{" "}
              <span className="bg-gradient-to-r from-[#D4FF00] via-lime-300 to-cyan-300 bg-clip-text text-transparent">
                with the latest AI models
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-zinc-200 leading-relaxed">
              One credit balance for creators and marketers to use every major model — including
              Kling 4.0, Seedance 2.5, Veo 3.1, Wan 3.0, GPT Image 2.6, FLUX.2 and Suno. Free to
              try: new accounts get 100 credits with no card.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/tools/text-to-video"
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#D4FF00] px-7 py-3.5 text-sm sm:text-base font-bold text-black shadow-lg shadow-[#D4FF00]/25 hover:bg-[#e2ff3e] active:scale-[0.98] transition-all"
              >
                <Video className="h-5 w-5" />
                Create a video
              </Link>
              <Link
                href="/tools/text-to-image"
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/20 bg-black/55 px-7 py-3.5 text-sm sm:text-base font-semibold text-white backdrop-blur-xl hover:bg-black/80 active:scale-[0.98] transition-all"
              >
                <ImageIcon className="h-5 w-5 text-[#D4FF00]" />
                Create an image
              </Link>
              <Link
                href="/ai-effects"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/40 px-5 py-3.5 text-sm sm:text-base font-medium text-zinc-200 backdrop-blur-xl hover:border-white/30 hover:text-white transition-all"
              >
                <Wand2 className="h-4 w-4 text-[#D4FF00]" />
                AI Video Effects
              </Link>
            </div>

            {/* Assurance Micro-Copy */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-zinc-300">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#D4FF00]" />
                100 free credits
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#D4FF00]" />
                No card needed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#D4FF00]" />
                Credits back on failed jobs
              </span>
            </div>
          </div>

          {/* Interactive Live Video & Model Switcher Stage */}
          <div className="mt-12 rounded-2xl border border-white/15 bg-[#0A0C12]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#D4FF00]" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Live Output Stage · Click Any Model to Compare Real Video
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {HERO_LIVE_SAMPLES.map((sample, idx) => (
                  <button
                    key={sample.modelId}
                    type="button"
                    onClick={() => setActiveSampleIndex(idx)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      idx === activeSampleIndex
                        ? "bg-[#D4FF00] text-black shadow-sm"
                        : "border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10 hover:text-white"
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
              {/* Left 7 Cols: Live Playing Video or High-Res Image */}
              <div className="lg:col-span-7 relative overflow-hidden rounded-xl border border-white/10 bg-black aspect-video group">
                {activeSample.videoUrl ? (
                  <video
                    key={activeSample.videoUrl}
                    src={activeSample.videoUrl}
                    poster={activeSample.posterUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={activeSample.posterUrl}
                    alt={activeSample.modelName}
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

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
                    <span>With 100 Free Signup Credits:</span>
                    <span className="font-bold text-white">
                      {activeSample.credits <= 100
                        ? `Run ${Math.floor(100 / activeSample.credits)}× immediately for free`
                        : "Starter pack from $9.90"}
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
          3. MADE ON REELMUX — 6 LIVE AUTO-PLAYING VIDEO SHOWCASE CARDS
         ===================================================================== */}
      <section className="py-20 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4FF00]/30 bg-[#D4FF00]/10 px-3 py-1 text-xs font-semibold text-[#D4FF00]">
                <Play className="h-3 w-3 fill-current" />
                Made on ReelMux
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Real outputs across flagship video models
              </h2>
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-zinc-400">
                Every clip below is rendered directly from a single prompt. Click any shot to open
                the exact model and prompt in the video studio.
              </p>
            </div>
            <Link
              href="/tools/text-to-video"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D4FF00] hover:underline"
            >
              Open Video Studio (22+ examples)
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {madeOnReelMuxClips.map((clip) => (
              <Link
                key={clip.id}
                href={`/tools/text-to-video?model=${clip.modelId}&prompt=${encodeURIComponent(
                  clip.prompt
                )}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0C0E14] hover:border-[#D4FF00]/60 transition-all"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <video
                    src={clip.videoUrl}
                    poster={clip.posterUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="rounded-lg bg-black/75 backdrop-blur-md border border-white/15 px-2.5 py-1 text-xs font-bold text-white">
                      {clip.modelName}
                    </span>
                    <span className="rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                      {clip.resolution} · {clip.durationSec}s
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 rounded-full bg-[#D4FF00] px-2.5 py-0.5 text-[11px] font-extrabold text-black">
                    {clip.credits}c
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-[#D4FF00] transition-colors">
                      {clip.title}
                    </div>
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {clip.prompt}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-zinc-300">
                    <span>Remix in Text to Video</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#D4FF00] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. BENTO GRID MULTIMODAL TOOLS SHOWCASE (#tools)
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
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
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
              const compatibleModels = MODELS_CATALOG.filter(
                (m) =>
                  m.category === tool.category &&
                  (!m.supportedTools || m.supportedTools.includes(tool.slug))
              );

              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0D1017] p-5 hover:border-[#D4FF00]/50 transition-all duration-300 ${
                    isFeatured ? "sm:col-span-2 lg:col-span-2" : ""
                  }`}
                >
                  <div className="relative h-52 w-full overflow-hidden rounded-xl bg-zinc-900">
                    {tool.previewVideo ? (
                      <video
                        src={tool.previewVideo}
                        poster={tool.previewImage}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <img
                        src={tool.previewImage}
                        alt={tool.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${tool.previewGradient} opacity-55`}
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

                  <div className="mt-4 flex flex-col justify-between flex-1">
                    <div className="flex items-start justify-between gap-4">
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

                    {/* Compatible Models Pill Strip */}
                    <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mr-1">
                        Models:
                      </span>
                      {compatibleModels.slice(0, 4).map((m) => (
                        <span
                          key={m.id}
                          className="rounded bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-zinc-300"
                        >
                          {m.name}
                        </span>
                      ))}
                      {compatibleModels.length > 4 && (
                        <span className="text-[10px] text-zinc-500">
                          +{compatibleModels.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. ONE-CLICK AI VIDEO EFFECTS SECTION (#effects) WITH VIDEO PREVIEWS
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
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${effect.gradient} p-5 hover:border-[#D4FF00]/50 transition-all`}
              >
                <div>
                  <div className="relative mb-4 h-40 w-full overflow-hidden rounded-xl bg-black">
                    <video
                      src={effect.previewVideo}
                      poster={effect.previewPoster}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5 rounded-md border border-white/15 bg-black/70 px-2.5 py-0.5 text-[11px] font-medium text-zinc-200 backdrop-blur-md">
                      {effect.category}
                    </div>
                    <div className="absolute top-2.5 right-2.5 rounded-full bg-[#D4FF00] px-2.5 py-0.5 text-xs font-extrabold text-black">
                      ⚡ {effect.credits}c
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-[#D4FF00] transition-colors">
                    {effect.name}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {effect.subtitle}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-xs font-semibold text-white">
                  <span>Try with 1 photo</span>
                  <ArrowRight className="h-4 w-4 text-[#D4FF00] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. TRANSPARENT MODEL PRICING & CAPABILITY MATRIX (#models-pricing)
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
                video, image, or audio model with upfront pricing and automatic refund protection.
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
                  model.category === "image"
                    ? "text-to-image"
                    : model.category === "audio"
                    ? "ai-music"
                    : "text-to-video"
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
