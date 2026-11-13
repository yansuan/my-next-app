"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Zap,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Loader2,
  SlidersHorizontal,
  Volume2,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Wand2,
} from "lucide-react";
import {
  TOOLS_CATALOG,
  MODELS_CATALOG,
  PROMPT_STARTERS,
  calculateJobCredits,
} from "@/lib/catalog/models";
import { useWallet } from "@/context/WalletContext";

export default function ToolWorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const searchParams = useSearchParams();

  const currentTool =
    TOOLS_CATALOG.find((t) => t.slug === slug) ?? TOOLS_CATALOG[0];

  const categoryTools = TOOLS_CATALOG.filter(
    (t) => t.category === currentTool.category
  );
  const categoryModels = MODELS_CATALOG.filter(
    (m) => m.category === currentTool.category
  );

  const initialModelId =
    searchParams.get("model") ||
    currentTool.defaultModelId ||
    categoryModels[0]?.id ||
    "seedance-2.5";

  const initialPrompt =
    searchParams.get("prompt") ||
    "A cinematic sweeping drone shot over bioluminescent ocean waves crashing against black volcanic basalt cliffs at twilight, 35mm anamorphic lens, volumetric mist.";

  const [selectedModelId, setSelectedModelId] = useState(initialModelId);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [resolution, setResolution] = useState("1080p");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [durationSec, setDurationSec] = useState(5);
  const [withAudio, setWithAudio] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [simulateFailMode, setSimulateFailMode] = useState(false);

  const [jobState, setJobState] = useState<{
    status: "idle" | "queued" | "processing" | "succeeded" | "failed";
    jobId?: string;
    creditsHeld?: number;
    outputUrl?: string;
    providerRouted?: string;
    errorMessage?: string;
  }>({ status: "idle" });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    availableCredits,
    reservedCredits,
    reserveCredits,
    settleCredits,
    refundCredits,
    upsertJob,
  } = useWallet();

  const selectedModel =
    MODELS_CATALOG.find((m) => m.id === selectedModelId) ??
    categoryModels[0] ??
    MODELS_CATALOG[0];

  useEffect(() => {
    const qModel = searchParams.get("model");
    if (qModel && MODELS_CATALOG.some((m) => m.id === qModel)) {
      setSelectedModelId(qModel);
    }
    const qPrompt = searchParams.get("prompt");
    if (qPrompt) {
      setPrompt(qPrompt);
    }
  }, [searchParams]);

  const liveCreditsCost = calculateJobCredits({
    modelId: selectedModel.id,
    resolution,
    durationSec,
    withAudio,
  });

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) return;
    setPrompt(
      `${prompt.trim()} — Shot on ARRI Alexa 65, 35mm Master Prime lens, dramatic volumetric rim lighting, ultra-detailed micro-textures, natural motion blur, studio color grading.`
    );
  };

  const handleMockUpload = async () => {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: `keyframe-${uploadedFiles.length + 1}.png`,
        contentType: "image/png",
      }),
    });
    const data = await res.json();
    setUploadedFiles((prev) => [...prev, data.publicUrl || "https://cdn.reelmux.com/sample-frame.png"]);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const ok = reserveCredits(
      liveCreditsCost,
      `Reserved ${liveCreditsCost}c for ${selectedModel.name} (${currentTool.name})`
    );

    if (!ok) {
      setJobState({
        status: "failed",
        errorMessage: `Insufficient credits: need ${liveCreditsCost} credits, available ${availableCredits}. Visit Pricing to top up.`,
      });
      return;
    }

    setJobState({
      status: "queued",
      creditsHeld: liveCreditsCost,
    });

    try {
      const createRes = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: currentTool.slug,
          modelId: selectedModel.id,
          prompt,
          resolution,
          aspectRatio,
          durationSec,
          withAudio,
          inputType:
            currentTool.inputType === "dual-frame"
              ? "frames"
              : currentTool.inputType === "multi-reference"
                ? "reference"
                : currentTool.inputType === "single-image"
                  ? "image"
                  : "text",
        }),
      });

      const created = await createRes.json();
      if (!createRes.ok) {
        refundCredits(
          liveCreditsCost,
          `Auto-refunded ${liveCreditsCost}c: API dispatch rejected`
        );
        setJobState({
          status: "failed",
          errorMessage: created.error || "Failed to dispatch job",
        });
        return;
      }

      const yirJobId = created.yirJobId;
      const settingsSummary = `${durationSec}s · ${resolution} · ${aspectRatio}`;

      upsertJob({
        id: yirJobId,
        yirJobId,
        toolSlug: currentTool.slug,
        modelId: selectedModel.id,
        modelName: selectedModel.name,
        prompt,
        settingsSummary,
        creditsCost: liveCreditsCost,
        status: "queued",
        createdAt: new Date().toLocaleTimeString(),
      });

      // Poll status until succeeded or failed
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts += 1;
        const pollRes = await fetch(
          `/api/jobs/${encodeURIComponent(yirJobId)}?model=${encodeURIComponent(
            selectedModel.id
          )}&simulateFail=${simulateFailMode ? "1" : "0"}`
        );
        const pollData = await pollRes.json();

        if (pollData.status === "processing") {
          setJobState((prev) => ({ ...prev, status: "processing", jobId: yirJobId }));
        } else if (pollData.status === "succeeded") {
          clearInterval(pollInterval);
          settleCredits(
            liveCreditsCost,
            `Settled ${liveCreditsCost}c for ${selectedModel.name} job ${yirJobId}`
          );
          setJobState({
            status: "succeeded",
            jobId: yirJobId,
            creditsHeld: liveCreditsCost,
            outputUrl: pollData.output?.media_url,
            providerRouted: pollData.output?.provider_routed,
          });
          upsertJob({
            id: yirJobId,
            yirJobId,
            toolSlug: currentTool.slug,
            modelId: selectedModel.id,
            modelName: selectedModel.name,
            prompt,
            settingsSummary,
            creditsCost: liveCreditsCost,
            status: "succeeded",
            outputUrl: pollData.output?.media_url,
            providerRouted: pollData.output?.provider_routed,
            createdAt: new Date().toLocaleTimeString(),
          });
        } else if (pollData.status === "failed" || attempts > 12) {
          clearInterval(pollInterval);
          const errMsg =
            pollData.error?.message ||
            "Generation failed upstream. 100% of held credits have been automatically refunded.";
          refundCredits(
            liveCreditsCost,
            `Auto-refunded ${liveCreditsCost}c on failed ${selectedModel.name} job`
          );
          setJobState({
            status: "failed",
            jobId: yirJobId,
            errorMessage: errMsg,
          });
          upsertJob({
            id: yirJobId,
            yirJobId,
            toolSlug: currentTool.slug,
            modelId: selectedModel.id,
            modelName: selectedModel.name,
            prompt,
            settingsSummary,
            creditsCost: liveCreditsCost,
            status: "failed",
            errorMessage: errMsg,
            createdAt: new Date().toLocaleTimeString(),
          });
        }
      }, 1100);
    } catch (e: unknown) {
      refundCredits(liveCreditsCost, `Auto-refunded ${liveCreditsCost}c due to network error`);
      setJobState({
        status: "failed",
        errorMessage: e instanceof Error ? e.message : "Network error",
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Sub-Tool Switcher Tabs (FrameMux Studio Style) */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-white">
              ReelMux
            </Link>
            <span>/</span>
            <span className="capitalize text-zinc-300">AI {currentTool.category}</span>
            <span>/</span>
            <span className="text-[#D4FF00] font-semibold">{currentTool.name}</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {currentTool.name}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">{currentTool.longDesc}</p>
        </div>

        {/* Sub-tool Switcher Pills */}
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-[#0D0F15] p-1.5">
          {categoryTools.map((t) => (
            <Link
              key={t.slug}
              href={`/tools/${t.slug}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                t.slug === currentTool.slug
                  ? "bg-[#D4FF00] text-black shadow-sm"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {t.name}
            </Link>
          ))}
        </div>
      </div>

      {/* =====================================================================
          2-COLUMN SPLIT STUDIO WORKSPACE (Left Controls / Right Output & Inspiration)
         ===================================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN (5 Cols): Generation Form Controls */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0C0E14] p-5 shadow-xl space-y-5">
          <div className="space-y-5">
            {/* 1. Model Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  AI Model
                </label>
                <span className="text-[11px] font-medium text-[#D4FF00]">
                  {selectedModel.speedRating}
                </span>
              </div>
              <select
                value={selectedModel.id}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#131722] px-3.5 py-2.5 text-sm font-semibold text-white focus:border-[#D4FF00] focus:outline-none"
              >
                {categoryModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider}) — From {m.baseCredits} credits
                  </option>
                ))}
              </select>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-zinc-400">{selectedModel.tagline}</span>
              </div>
            </div>

            {/* 2. Reference Image / Keyframe Upload Zone (Dynamic based on inputType) */}
            {currentTool.inputType !== "text" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    {currentTool.inputType === "dual-frame"
                      ? "First & Last Keyframes"
                      : currentTool.inputType === "multi-reference"
                        ? "Character / Scene References (Up to 4)"
                        : "Reference Image"}
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    {uploadedFiles.length} uploaded
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleMockUpload}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.02] py-5 text-xs text-zinc-400 hover:border-[#D4FF00]/50 hover:bg-white/[0.04] hover:text-white transition-all"
                >
                  <Upload className="h-5 w-5 text-[#D4FF00]" />
                  <span>Click or drag to upload reference image</span>
                </button>
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {uploadedFiles.map((url, idx) => (
                      <span
                        key={`${url}-${idx}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Frame #{idx + 1} staged
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Prompt Textarea + AI Prompt Enhancer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Prompt
                </label>
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-1 text-[11px] font-semibold text-[#D4FF00] hover:bg-white/10 transition-colors"
                >
                  <Wand2 className="h-3 w-3" />
                  Enhance Prompt
                </button>
              </div>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe camera movement, subject action, lighting, and atmosphere..."
                className="w-full rounded-xl border border-white/15 bg-[#131722] p-3.5 text-sm text-white placeholder-zinc-500 focus:border-[#D4FF00] focus:outline-none leading-relaxed"
              />
            </div>

            {/* 4. Settings Bar (Resolution · Aspect Ratio · Duration · Native Audio) */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-300">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-[#D4FF00]" />
                  Settings: {durationSec}s · {resolution} · {aspectRatio}
                </span>
                <span className="text-[11px] text-zinc-500">{selectedModel.provider}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] uppercase text-zinc-500 mb-1">
                    Resolution
                  </label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#131722] px-2.5 py-1.5 text-xs text-white"
                  >
                    {selectedModel.resolutions.map((res) => (
                      <option key={res} value={res}>
                        {res}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-zinc-500 mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#131722] px-2.5 py-1.5 text-xs text-white"
                  >
                    {selectedModel.aspectRatios.map((ar) => (
                      <option key={ar} value={ar}>
                        {ar}
                      </option>
                    ))}
                  </select>
                </div>

                {currentTool.category === "video" && (
                  <div>
                    <label className="block text-[10px] uppercase text-zinc-500 mb-1">
                      Duration
                    </label>
                    <select
                      value={durationSec}
                      onChange={(e) => setDurationSec(Number(e.target.value))}
                      className="w-full rounded-lg border border-white/10 bg-[#131722] px-2.5 py-1.5 text-xs text-white"
                    >
                      {[4, 5, 8, 10, 15].map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}s
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {selectedModel.supportsNativeAudio && (
                <label className="flex items-center justify-between pt-2 border-t border-white/10 cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300">
                    <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
                    Generate synchronized native audio / Foley
                  </span>
                  <input
                    type="checkbox"
                    checked={withAudio}
                    onChange={(e) => setWithAudio(e.target.checked)}
                    className="h-4 w-4 accent-[#D4FF00] rounded"
                  />
                </label>
              )}
            </div>

            {/* Sandbox Auto-Refund Verification Toggle */}
            <label className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-2.5 text-xs text-amber-200 cursor-pointer">
              <span className="inline-flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                Test Credit Protection (Simulate upstream failure &amp; instant refund)
              </span>
              <input
                type="checkbox"
                checked={simulateFailMode}
                onChange={(e) => setSimulateFailMode(e.target.checked)}
                className="h-4 w-4 accent-amber-400"
              />
            </label>
          </div>

          {/* 5. Dynamic Pricing Indicator & Primary Generate CTA */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">
                ⚡ {liveCreditsCost} credits ·{" "}
                <span className="text-zinc-400 font-normal">
                  {availableCredits} available ({reservedCredits} held)
                </span>
              </span>
              <Link href="/pricing" className="text-[#D4FF00] hover:underline font-medium">
                Top up →
              </Link>
            </div>

            <button
              type="button"
              disabled={jobState.status === "queued" || jobState.status === "processing"}
              onClick={handleGenerate}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4FF00] py-3.5 text-sm font-extrabold text-black shadow-lg shadow-[#D4FF00]/15 hover:bg-[#e1ff3d] disabled:opacity-50 transition-all cursor-pointer"
            >
              {jobState.status === "queued" || jobState.status === "processing" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {jobState.status === "queued"
                    ? `Holding ${liveCreditsCost}c · Preparing job...`
                    : `Rendering on ${selectedModel.name}...`}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate ({liveCreditsCost} credits)
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Credits come back automatically if a job fails.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN (7 Cols): Live Output Canvas & Featured Example Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Active Output / Featured Preview Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#D4FF00]" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  {jobState.status === "idle"
                    ? "Featured Studio Output Preview"
                    : `Job Status: ${jobState.status.toUpperCase()}`}
                </span>
              </div>
              <span className="rounded-full bg-[#D4FF00]/15 border border-[#D4FF00]/30 px-2.5 py-0.5 text-xs font-bold text-[#D4FF00]">
                {liveCreditsCost} credits
              </span>
            </div>

            {/* Canvas Viewport */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black flex items-center justify-center">
              {(jobState.status === "queued" || jobState.status === "processing") && (
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-[#D4FF00]" />
                  <div className="text-sm font-bold text-white">
                    {jobState.status === "queued"
                      ? "Step 1/2: Credits held in escrow · Initializing model..."
                      : `Step 2/2: Rendering ${resolution} output with ${selectedModel.name}...`}
                  </div>
                  <p className="max-w-md text-xs text-zinc-400">
                    Your {jobState.creditsHeld} credits are safely reserved and will only be
                    charged once your output is ready.
                  </p>
                </div>
              )}

              {jobState.status === "failed" && (
                <div className="flex flex-col items-center gap-3 p-6 text-center max-w-md">
                  <div className="rounded-full bg-rose-500/20 p-3 text-rose-400">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <div className="text-base font-bold text-white">
                    Job Failed — 100% Credits Automatically Refunded
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {jobState.errorMessage}
                  </p>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-semibold text-emerald-300">
                    ✓ Wallet Balance Restored ({availableCredits} credits available)
                  </span>
                </div>
              )}

              {(jobState.status === "idle" || jobState.status === "succeeded") && (
                <>
                  <img
                    src={
                      jobState.outputUrl ||
                      currentTool.previewImage
                    }
                    alt={currentTool.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/75 px-3.5 py-2.5 backdrop-blur-md text-xs">
                    <span className="text-zinc-200 font-medium">
                      {jobState.status === "succeeded"
                        ? `✓ Generated via ${jobState.providerRouted}`
                        : `Sample output · ${selectedModel.name} (${resolution})`}
                    </span>
                    <Link
                      href="/dashboard"
                      className="font-semibold text-[#D4FF00] hover:underline"
                    >
                      View in Ledger Vault →
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Prompt Remix Bar */}
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-zinc-300 line-clamp-2 font-mono">{prompt}</p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(prompt);
                    setCopiedId("main");
                    setTimeout(() => setCopiedId(null), 1500);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                >
                  {copiedId === "main" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#D4FF00]" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Curated Prompt Starters & Shot Guides */}
          <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Prompt Starters &amp; Shot Guides
                </h2>
                <p className="text-xs text-zinc-400">
                  Click &ldquo;Use this prompt&rdquo; to load tested camera parameters and model
                  presets.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {PROMPT_STARTERS.map((starter) => (
                <div
                  key={starter.id}
                  className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3.5 hover:border-white/25 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">{starter.title}</span>
                      <span className="rounded bg-[#D4FF00]/15 px-2 py-0.5 text-[10px] font-bold text-[#D4FF00]">
                        {starter.credits}c
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-zinc-500">{starter.settings}</div>
                    <p className="mt-2 text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                      {starter.prompt}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setPrompt(starter.prompt);
                        setSelectedModelId(starter.modelId);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#D4FF00] hover:underline cursor-pointer"
                    >
                      Use this prompt
                      <ArrowRight className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(starter.prompt);
                        setCopiedId(starter.id);
                        setTimeout(() => setCopiedId(null), 1500);
                      }}
                      className="text-[11px] text-zinc-400 hover:text-white"
                    >
                      {copiedId === starter.id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
