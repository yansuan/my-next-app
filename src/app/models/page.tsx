"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Cpu,
  ArrowRight,
  Volume2,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { MODELS_CATALOG, MediaCategory } from "@/lib/catalog/models";

const FAMILY_CHIPS = [
  "All",
  "Kling",
  "Seedance",
  "Veo",
  "MiniMax",
  "Hailuo",
  "Wan",
  "Grok",
  "FLUX",
  "GPT Image",
  "Nano Banana",
  "Suno",
  "ElevenLabs",
];

function ModelsDirectoryContent() {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<"all" | MediaCategory>("all");
  const [family, setFamily] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const qCat = searchParams.get("category");
    if (qCat === "video" || qCat === "image" || qCat === "audio") {
      setCategory(qCat);
    }
    const qSearch = searchParams.get("q");
    if (qSearch) {
      setSearch(qSearch);
    }
  }, [searchParams]);

  const filtered = MODELS_CATALOG.filter((m) => {
    const matchCategory = category === "all" || m.category === category;
    const matchFamily =
      family === "All" ||
      m.name.toLowerCase().includes(family.toLowerCase()) ||
      m.provider.toLowerCase().includes(family.toLowerCase());
    const matchQuery =
      !search.trim() ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.provider.toLowerCase().includes(search.toLowerCase()) ||
      m.tagline.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchFamily && matchQuery;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4FF00]/30 bg-[#D4FF00]/10 px-3 py-1 text-xs font-semibold text-[#D4FF00]">
          <Cpu className="h-3.5 w-3.5" />
          Unified Multimodal Model Catalog
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          All 73+ AI Video, Image &amp; Audio Models
        </h1>
        <p className="mt-3 text-base text-zinc-400 leading-relaxed">
          Every model below shares your single ReelMux credit balance. See which
          studio tools each model supports, inspect exact credit costs upfront,
          and get automatic instant refunds if any generation fails.
        </p>
      </div>

      {/* Category & Search Bar */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-[#0C0E14] p-1.5">
          {(["all", "video", "image", "audio"] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold capitalize transition-colors cursor-pointer ${
                category === cat
                  ? "bg-[#D4FF00] text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {cat === "all" ? "All Models" : `AI ${cat}`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Kling, Seedance, Veo, FLUX..."
            className="w-full rounded-xl border border-white/15 bg-[#0C0E14] pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#D4FF00] focus:outline-none"
          />
        </div>
      </div>

      {/* Provider / Family Filter Chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {FAMILY_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setFamily(chip)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
              family === chip
                ? "bg-white text-black font-bold"
                : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/25 hover:text-white"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Models Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((model) => {
          const targetTool =
            model.supportedTools?.[0] ||
            (model.category === "image"
              ? "text-to-image"
              : model.category === "audio"
                ? "ai-music"
                : "text-to-video");

          return (
            <div
              key={model.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0C0E14] hover:border-[#D4FF00]/50 transition-all"
            >
              <div>
                {/* Media Preview Banner */}
                {(model.previewVideo || model.previewPoster) && (
                  <div className="relative h-44 w-full overflow-hidden bg-black">
                    {model.previewVideo ? (
                      <video
                        src={model.previewVideo}
                        poster={model.previewPoster}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100"
                      />
                    ) : (
                      <img
                        src={model.previewPoster}
                        alt={model.name}
                        className="h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C0E14] via-transparent to-black/30" />
                    <span className="absolute top-3 left-3 rounded-md bg-black/75 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-200 backdrop-blur-md">
                      {model.category} · {model.provider}
                    </span>
                    {model.badge && (
                      <span
                        className={`absolute top-3 right-3 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          model.badge === "HOT"
                            ? "bg-rose-500 text-white"
                            : "bg-[#D4FF00] text-black"
                        }`}
                      >
                        {model.badge}
                      </span>
                    )}
                  </div>
                )}

                <div className="p-5">
                  {!model.previewVideo && !model.previewPoster && (
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="rounded-md bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                        {model.category} · {model.provider}
                      </span>
                      {model.badge && (
                        <span className="rounded-full bg-[#D4FF00]/20 text-[#D4FF00] border border-[#D4FF00]/40 px-2 py-0.5 text-[10px] font-extrabold">
                          {model.badge}
                        </span>
                      )}
                    </div>
                  )}

                  <Link href={`/models/${model.id}`} className="block">
                    <h2 className="text-xl font-bold text-white group-hover:text-[#D4FF00] transition-colors">
                      {model.name}
                    </h2>
                  </Link>
                  <p className="mt-1.5 text-xs text-zinc-300 leading-relaxed">
                    {model.tagline}
                  </p>

                  {/* Capabilities */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {model.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-300"
                      >
                        {cap}
                      </span>
                    ))}
                    {model.supportsNativeAudio && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-300">
                        <Volume2 className="h-3 w-3" />
                        Native Audio
                      </span>
                    )}
                  </div>

                  {/* Supported Tools */}
                  {model.supportedTools && model.supportedTools.length > 0 && (
                    <div className="mt-3.5 border-t border-white/5 pt-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                        Supported Tools:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {model.supportedTools.map((tSlug) => (
                          <Link
                            key={tSlug}
                            href={`/tools/${tSlug}?model=${model.id}`}
                            className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-zinc-200 hover:bg-[#D4FF00] hover:text-black transition-colors"
                          >
                            {tSlug}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 flex items-center justify-between border-t border-white/10">
                <div>
                  <div className="text-sm font-extrabold text-[#D4FF00]">
                    From {model.baseCredits} credits
                  </div>
                  <div className="text-[11px] text-zinc-500">{model.unitLabel}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/models/${model.id}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10"
                  >
                    <SlidersHorizontal className="h-3 w-3" />
                    Specs
                  </Link>
                  <Link
                    href={`/tools/${targetTool}?model=${model.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-black hover:bg-[#D4FF00] transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Run
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ModelsDirectoryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-sm text-zinc-400">
          Loading AI Model Catalog...
        </div>
      }
    >
      <ModelsDirectoryContent />
    </Suspense>
  );
}
