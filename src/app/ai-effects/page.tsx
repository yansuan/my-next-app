"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  Wand2,
  Zap,
  Upload,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { AI_EFFECTS_CATALOG, MODELS_CATALOG } from "@/lib/catalog/models";
import { useWallet } from "@/context/WalletContext";

const SAMPLE_PHOTOS = [
  {
    label: "Luxury Product Shot",
    url: "/examples/gpt-image-2-6-poster.webp",
  },
  {
    label: "Editorial Portrait",
    url: "/examples/flux-2-max-portrait.webp",
  },
  {
    label: "Studio Fashion",
    url: "/examples/seedream-5-pro-fashion.webp",
  },
];

function AiEffectsContent() {
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState(AI_EFFECTS_CATALOG[0].slug);
  const [uploadedPhoto, setUploadedPhoto] = useState<string>(SAMPLE_PHOTOS[0].url);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "failed">("idle");
  const [message, setMessage] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const { reserveCredits, settleCredits, refundCredits, availableCredits } = useWallet();

  useEffect(() => {
    const qEffect = searchParams.get("effect");
    if (qEffect && AI_EFFECTS_CATALOG.some((e) => e.slug === qEffect)) {
      setSelected(qEffect);
    }
  }, [searchParams]);

  const effect =
    AI_EFFECTS_CATALOG.find((e) => e.slug === selected) ?? AI_EFFECTS_CATALOG[0];
  const model = MODELS_CATALOG.find((m) => m.id === effect.modelId);

  const run = async () => {
    if (
      !reserveCredits(
        effect.credits,
        `Reserved ${effect.credits}c for effect ${effect.name}`
      )
    ) {
      setStatus("failed");
      setMessage(
        `Insufficient credits: need ${effect.credits}, available ${availableCredits}.`
      );
      return;
    }
    setStatus("running");
    setOutputUrl(null);
    setMessage("");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "ai-effects",
          modelId: effect.modelId,
          prompt: effect.builtInPrompt,
          inputType: "image",
          imageUrl: uploadedPhoto,
        }),
      });
      const created = await res.json();
      if (!res.ok) throw new Error(created.error || "Dispatch failed");

      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const p = await (
          await fetch(
            `/api/jobs/${encodeURIComponent(created.yirJobId)}?model=${effect.modelId}`
          )
        ).json();
        if (p.status === "succeeded") {
          settleCredits(
            effect.credits,
            `Settled ${effect.credits}c for effect ${effect.name}`
          );
          setOutputUrl(
            p.output?.media_url ||
              effect.previewVideo ||
              "/examples/seedance-2-5-train.mp4"
          );
          setStatus("done");
          setMessage("Effect video clip rendered and ready.");
          return;
        }
        if (p.status === "failed") throw new Error(p.error?.message || "Job failed");
      }
      throw new Error("Timed out");
    } catch (e) {
      refundCredits(
        effect.credits,
        `Refunded ${effect.credits}c: effect ${effect.name} failed`
      );
      setStatus("failed");
      setMessage(
        `${e instanceof Error ? e.message : "Failed"} — 100% credits refunded.`
      );
    }
  };

  const activeVideoSrc =
    outputUrl || effect.previewVideo || "/examples/seedance-2-5-train.mp4";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-14">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4FF00]/30 bg-[#D4FF00]/10 px-3 py-1 text-xs font-semibold text-[#D4FF00]">
          <Wand2 className="h-3.5 w-3.5" />
          One-Click Video Templates
        </div>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          AI Video Effects
        </h1>
        <p className="mt-2 text-base text-zinc-400">
          One photo in, a finished clip out. Camera motion and studio prompts are
          built in.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left 7 Cols: Effect Selector Grid with Live Video Previews */}
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7 content-start">
          {AI_EFFECTS_CATALOG.map((e) => (
            <button
              key={e.slug}
              type="button"
              onClick={() => {
                setSelected(e.slug);
                setOutputUrl(null);
                setStatus("idle");
                setMessage("");
              }}
              className={`group overflow-hidden rounded-2xl border bg-[#0C0E14] text-left transition cursor-pointer ${
                e.slug === selected
                  ? "border-[#D4FF00] ring-1 ring-[#D4FF00]"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              {e.previewVideo && (
                <div className="relative h-36 w-full overflow-hidden bg-black">
                  <video
                    src={e.previewVideo}
                    poster={e.previewPoster}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C0E14] via-transparent to-black/30" />
                  <span className="absolute top-2.5 left-2.5 rounded bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-zinc-200 backdrop-blur-md">
                    {e.category}
                  </span>
                  <span className="absolute top-2.5 right-2.5 rounded bg-[#D4FF00] px-2 py-0.5 text-[10px] font-extrabold text-black">
                    ⚡ {e.credits} credits
                  </span>
                </div>
              )}
              <div className="p-4">
                <div className="text-base font-bold text-white">{e.name}</div>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  {e.subtitle}
                </p>
                <div className="mt-3 space-y-1 rounded-xl bg-white/[0.03] border border-white/5 p-2.5 text-[11px]">
                  <div className="flex justify-between text-zinc-400">
                    <span>In:</span>
                    <span className="text-zinc-200">{e.beforeLabel}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Out:</span>
                    <span className="text-[#D4FF00] font-semibold">
                      {e.afterLabel}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Right 5 Cols: Photo Upload + Live Video Effect Preview + One-Click Generator */}
        <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-6 lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Selected Effect
              </div>
              <div className="mt-0.5 text-xl font-bold text-white">
                {effect.name}
              </div>
            </div>
            <span className="rounded-full bg-[#D4FF00]/15 px-3 py-1 text-xs font-bold text-[#D4FF00]">
              {effect.credits} credits
            </span>
          </div>

          {/* Live Video Preview of Selected Effect */}
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
            <video
              key={activeVideoSrc}
              src={activeVideoSrc}
              poster={effect.previewPoster}
              autoPlay
              loop
              muted
              playsInline
              controls
              className="h-full w-full object-cover"
            />
            <span className="pointer-events-none absolute top-2.5 left-2.5 rounded bg-black/75 px-2.5 py-1 text-[10px] font-bold text-[#D4FF00] backdrop-blur-md">
              {status === "done"
                ? "✓ Generated Output"
                : `Effect Preview · ${model?.name}`}
            </span>
          </div>

          {/* Step 1: Upload or Pick Sample Photo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
              1. Input Photo ({effect.beforeLabel})
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {SAMPLE_PHOTOS.map((sp) => (
                <button
                  key={sp.label}
                  type="button"
                  onClick={() => setUploadedPhoto(sp.url)}
                  className={`group relative overflow-hidden rounded-xl border aspect-square cursor-pointer ${
                    uploadedPhoto === sp.url
                      ? "border-[#D4FF00]"
                      : "border-white/10"
                  }`}
                >
                  <img
                    src={sp.url}
                    alt={sp.label}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-black/75 py-0.5 text-[10px] text-white">
                    {sp.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setUploadedPhoto(SAMPLE_PHOTOS[1].url)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.02] py-3 text-xs text-zinc-300 hover:border-[#D4FF00]/50 cursor-pointer"
            >
              <Upload className="h-4 w-4 text-[#D4FF00]" />
              Upload your own photo (JPG / PNG / WebP)
            </button>
          </div>

          {/* Step 2: Built-In Prompt Preview */}
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
              <span>Built-in Motion Prompt</span>
              <span>Engine: {model?.name}</span>
            </div>
            <p className="rounded-xl border border-white/10 bg-black/50 p-3 font-mono text-xs text-zinc-300 leading-relaxed">
              {effect.builtInPrompt}
            </p>
          </div>

          <button
            type="button"
            onClick={run}
            disabled={status === "running"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4FF00] py-3.5 text-sm font-extrabold text-black hover:bg-[#e2ff3e] disabled:opacity-50 cursor-pointer"
          >
            {status === "running" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {status === "running"
              ? "Generating Effect..."
              : `Generate ${effect.name} (${effect.credits} credits)`}
          </button>

          <div className="text-center text-[11px] text-zinc-400">
            <Zap className="mr-1 inline h-3 w-3 text-[#D4FF00]" />
            Available balance: {availableCredits.toLocaleString()} credits ·
            Auto-refund on failed jobs
          </div>

          {message && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-zinc-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#D4FF00]" />
              {message}
            </div>
          )}
        </div>
      </div>

      {/* How It Works 3-Step Section */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-[#0C0E14] p-6 sm:grid-cols-3">
        {[
          [
            "01 · Pick an effect",
            "Choose from 360° product turntable, cosmic zoom out, vintage photo restoration, or VFX character morphs.",
          ],
          [
            "02 · Drop in one photo",
            "Upload a single product photo or portrait. No prompt writing or camera keyframing required.",
          ],
          [
            "03 · Download commercial MP4",
            "Your finished clip renders in under a minute with full commercial usage rights.",
          ],
        ].map(([title, desc]) => (
          <div key={title} className="space-y-1.5">
            <div className="text-sm font-bold text-white">{title}</div>
            <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AiEffectsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-sm text-zinc-400">
          Loading AI Effects...
        </div>
      }
    >
      <AiEffectsContent />
    </Suspense>
  );
}
