"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Volume2,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import {
  MODELS_CATALOG,
  PROMPT_STARTERS,
  calculateJobCredits,
} from "@/lib/catalog/models";

export default function ModelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const model =
    MODELS_CATALOG.find((m) => m.id === id) ?? MODELS_CATALOG[0];

  const peerModels = MODELS_CATALOG.filter(
    (m) => m.category === model.category && m.id !== model.id
  ).slice(0, 4);

  const [resolution, setResolution] = useState(model.resolutions[0] || "1080p");
  const [aspectRatio, setAspectRatio] = useState(model.aspectRatios[0] || "16:9");
  const [durationSec, setDurationSec] = useState(5);
  const [withAudio, setWithAudio] = useState(Boolean(model.supportsNativeAudio));
  const [prompt, setPrompt] = useState(
    PROMPT_STARTERS[0]?.prompt ||
      "Cinematic wide angle tracking shot with dramatic volumetric lighting and realistic physics."
  );

  const quotedCredits = calculateJobCredits({
    modelId: model.id,
    resolution,
    durationSec,
    withAudio,
  });

  const targetToolSlug =
    model.supportedTools?.[0] ||
    (model.category === "image"
      ? "text-to-image"
      : model.category === "audio"
        ? "ai-music"
        : "text-to-video");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-14">
      {/* Breadcrumb & Hero Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/models" className="hover:text-white">
            Models
          </Link>
          <span>/</span>
          <span className="capitalize">{model.category}</span>
          <span>/</span>
          <span className="font-semibold text-[#D4FF00]">{model.name}</span>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {model.name}
              </h1>
              {model.badge && (
                <span className="rounded-full bg-[#D4FF00] px-2.5 py-0.5 text-xs font-extrabold text-black">
                  {model.badge}
                </span>
              )}
            </div>
            <p className="mt-2 text-base text-zinc-300">
              By <strong className="text-white">{model.provider}</strong> ·{" "}
              {model.tagline}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-[#0C0E14] px-4 py-2.5 text-right">
              <div className="text-[11px] uppercase text-zinc-400">
                Starting Price
              </div>
              <div className="text-lg font-extrabold text-[#D4FF00]">
                From {model.baseCredits} credits
              </div>
            </div>
            <Link
              href={`/tools/${targetToolSlug}?model=${model.id}&prompt=${encodeURIComponent(
                prompt
              )}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#D4FF00] px-5 py-3.5 text-sm font-extrabold text-black hover:bg-[#e2ff3e] transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Open in Studio
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Inline Quick Generator & Spec Breakdown */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left 7 Cols: Live Media Showcase + Inline Quick Configurator */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0C0E14] p-6 space-y-5">
          {(model.previewVideo || model.previewPoster) && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
              {model.previewVideo ? (
                <video
                  key={model.previewVideo}
                  src={model.previewVideo}
                  poster={model.previewPoster}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={model.previewPoster}
                  alt={model.name}
                  className="h-full w-full object-cover"
                />
              )}
              <span className="pointer-events-none absolute top-3 left-3 rounded-md bg-black/75 px-2.5 py-1 text-xs font-bold text-[#D4FF00] backdrop-blur-md">
                {model.name} Reference Output
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-sm font-bold text-white">
              Try {model.name} Inline Estimator &amp; Launcher
            </span>
            <span className="rounded-full bg-[#D4FF00]/15 px-3 py-1 text-xs font-bold text-[#D4FF00]">
              ⚡ {quotedCredits} credits
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Prompt
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-[#131722] p-3.5 text-sm text-white focus:border-[#D4FF00] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Resolution
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#131722] px-3 py-2 text-xs text-white"
              >
                {model.resolutions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#131722] px-3 py-2 text-xs text-white"
              >
                {model.aspectRatios.map((ar) => (
                  <option key={ar} value={ar}>
                    {ar}
                  </option>
                ))}
              </select>
            </div>
            {model.category === "video" && (
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Duration
                </label>
                <select
                  value={durationSec}
                  onChange={(e) => setDurationSec(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/15 bg-[#131722] px-3 py-2 text-xs text-white"
                >
                  {[4, 5, 8, 10, 15].map((s) => (
                    <option key={s} value={s}>
                      {s}s
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {model.supportsNativeAudio && (
            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs text-zinc-200 cursor-pointer">
              <span className="inline-flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-cyan-400" />
                Include synchronized native audio
              </span>
              <input
                type="checkbox"
                checked={withAudio}
                onChange={(e) => setWithAudio(e.target.checked)}
                className="h-4 w-4 accent-[#D4FF00]"
              />
            </label>
          )}

          <Link
            href={`/tools/${targetToolSlug}?model=${model.id}&prompt=${encodeURIComponent(
              prompt
            )}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4FF00] py-3.5 text-sm font-extrabold text-black hover:bg-[#e2ff3e] transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Generate with {model.name} ({quotedCredits} credits)
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Right 5 Cols: Full Technical Specifications Card */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0C0E14] p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Model Specifications</h2>
          <dl className="divide-y divide-white/10 text-xs sm:text-sm">
            <div className="flex justify-between py-2.5">
              <dt className="text-zinc-400">Maker / Provider</dt>
              <dd className="font-semibold text-white">{model.provider}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-zinc-400">Category</dt>
              <dd className="font-semibold capitalize text-white">
                {model.category}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-zinc-400">Speed Tier</dt>
              <dd className="font-semibold text-[#D4FF00]">
                {model.speedRating}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-zinc-400">Resolutions</dt>
              <dd className="font-semibold text-white">
                {model.resolutions.join(", ")}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-zinc-400">Aspect Ratios</dt>
              <dd className="font-semibold text-white">
                {model.aspectRatios.join(", ")}
              </dd>
            </div>
            {model.maxDurationSec && (
              <div className="flex justify-between py-2.5">
                <dt className="text-zinc-400">Max Clip Length</dt>
                <dd className="font-semibold text-white">
                  Up to {model.maxDurationSec}s
                </dd>
              </div>
            )}
            <div className="flex justify-between py-2.5">
              <dt className="text-zinc-400">Native Audio</dt>
              <dd className="font-semibold text-white">
                {model.supportsNativeAudio ? "Supported" : "Visual Only"}
              </dd>
            </div>
          </dl>

          <div className="pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Supported Capabilities
            </div>
            <div className="flex flex-wrap gap-1.5">
              {model.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-200"
                >
                  <CheckCircle2 className="h-3 w-3 text-[#D4FF00]" />
                  {cap}
                </span>
              ))}
            </div>
          </div>

          {model.supportedTools && model.supportedTools.length > 0 && (
            <div className="pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Compatible Studio Tools
              </div>
              <div className="flex flex-wrap gap-1.5">
                {model.supportedTools.map((tSlug) => (
                  <Link
                    key={tSlug}
                    href={`/tools/${tSlug}?model=${model.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#D4FF00]/30 bg-[#D4FF00]/10 px-2.5 py-1 text-xs font-semibold text-[#D4FF00] hover:bg-[#D4FF00] hover:text-black transition-colors"
                  >
                    {tSlug}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Head-to-Head Comparison Table with Competing Models */}
      <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white">
              Compare {model.name} with Alternatives
            </h2>
            <p className="text-xs text-zinc-400">
              All models below can be run from your same ReelMux credit balance.
            </p>
          </div>
          <Link
            href="/compare/seedance-2.5-vs-kling-4.0"
            className="text-xs font-semibold text-[#D4FF00] hover:underline"
          >
            Open side-by-side comparison guide →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-white/10 text-xs uppercase text-zinc-400">
              <tr>
                <th className="py-3 pr-4">Model</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Resolutions</th>
                <th className="py-3 px-4">Native Audio</th>
                <th className="py-3 px-4">Starting Cost</th>
                <th className="py-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[model, ...peerModels].map((m, idx) => (
                <tr key={m.id} className={idx === 0 ? "bg-[#D4FF00]/5" : ""}>
                  <td className="py-3 pr-4 font-bold text-white">
                    {m.name}{" "}
                    {idx === 0 && (
                      <span className="text-xs text-[#D4FF00]">(Current)</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-zinc-300">{m.provider}</td>
                  <td className="py-3 px-4 text-zinc-300">
                    {m.resolutions.join(", ")}
                  </td>
                  <td className="py-3 px-4 text-zinc-300">
                    {m.supportsNativeAudio ? "Yes" : "No"}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#D4FF00]">
                    From {m.baseCredits} credits
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <Link
                      href={`/models/${m.id}`}
                      className="text-xs font-semibold text-white hover:text-[#D4FF00]"
                    >
                      Inspect →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model FAQ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <HelpCircle className="h-4 w-4 text-[#D4FF00]" />
            How much does {model.name} cost on ReelMux?
          </div>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            {model.name} starts at {model.baseCredits} credits ({model.unitLabel}
            ). Exact credit costs adjust dynamically based on your chosen
            resolution and duration, and are always displayed before you click
            generate.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <HelpCircle className="h-4 w-4 text-[#D4FF00]" />
            What happens if a {model.name} generation fails?
          </div>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            Credits are held in escrow while your generation runs. If{" "}
            {model.name} times out or errors for any reason, 100% of your
            reserved credits are automatically returned to your balance.
          </p>
        </div>
      </div>
    </div>
  );
}
