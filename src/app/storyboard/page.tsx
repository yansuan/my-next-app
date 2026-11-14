"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Film,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Music,
  Zap,
  CheckCircle2,
  Sliders,
  ArrowRight,
  Wand2,
  Camera,
  Volume2,
  VolumeX,
} from "lucide-react";
import { getModelsForTool } from "@/lib/catalog/models";
import { useWallet } from "@/context/WalletContext";

interface StoryboardShot {
  id: string;
  shotNumber: number;
  title: string;
  cameraMove: string;
  durationSec: number;
  modelId: string;
  prompt: string;
  videoUrl: string;
  posterUrl: string;
  status: "ready" | "rendering";
}

interface StoryPreset {
  id: string;
  name: string;
  logline: string;
  audioPrompt: string;
  shots: Omit<StoryboardShot, "status">[];
}

const STORY_PRESETS: StoryPreset[] = [
  {
    id: "cyber-noir",
    name: "Neo-Tokyo Night Pursuit",
    logline:
      "A high-contrast cyberpunk sprint across electric-blue skyscrapers, fractal light tunnels, and strobe-lit corridors.",
    audioPrompt: "128 BPM dark synthwave pulse with orchestral brass swells and sub-bass impact",
    shots: [
      {
        id: "shot-1",
        shotNumber: 1,
        title: "Establishing Neon Metropolis Grid",
        cameraMove: "Anamorphic Drone Orbit",
        durationSec: 5,
        modelId: "veo-3-1",
        prompt:
          "Ultra-wide anamorphic aerial establishing shot over illuminated night skyline skyscrapers and warm golden traffic veins.",
        videoUrl: "/examples/videos/hero-1.mp4",
        posterUrl: "/examples/videos/hero-1-poster.webp",
      },
      {
        id: "shot-2",
        shotNumber: 2,
        title: "Elevated Skyscraper Traffic Artery",
        cameraMove: "Low-Angle Tracking Dolly",
        durationSec: 5,
        modelId: "seedance-2-5",
        prompt:
          "High-altitude night tracking shot gliding over glowing expressway ribbons cutting between obsidian glass monoliths.",
        videoUrl: "/examples/seedance-2-night-market.mp4",
        posterUrl: "/examples/seedance-2-night-market.webp",
      },
      {
        id: "shot-3",
        shotNumber: 3,
        title: "Split Magenta-Cyan Strobe Subject",
        cameraMove: "85mm Macro Push-In",
        durationSec: 5,
        modelId: "kling-4-0",
        prompt:
          "Close-up kinetic portrait illuminated by electric magenta and turquoise neon strobes in dark studio atmosphere.",
        videoUrl: "/examples/kling-2-6-cat.mp4",
        posterUrl: "/examples/kling-2-6-cat.webp",
      },
      {
        id: "shot-4",
        shotNumber: 4,
        title: "Quantum Fractal Warp Portal",
        cameraMove: "180° Bullet-Time Whip Pan",
        durationSec: 5,
        modelId: "wan-3-0",
        prompt:
          "Hypnotic forward dive through an ultraviolet 3D geometric hyper-tunnel, crystalline reflections at 24fps.",
        videoUrl: "/examples/seedance-2-5-train.mp4",
        posterUrl: "/examples/seedance-2-5-train.webp",
      },
    ],
  },
  {
    id: "atelier-parfum",
    name: "Flagship Commercial Director's Cut",
    logline:
      "Precision horology, automotive silhouette velocity, and 1000fps culinary flame crafted for high-impact commercial spots.",
    audioPrompt: "Minimalist cello solo with crisp mechanical escapement clicks and cinematic bass drop",
    shots: [
      {
        id: "shot-1",
        shotNumber: 1,
        title: "Swiss Tourbillon Gears Macro",
        cameraMove: "1000fps Phantom Macro",
        durationSec: 5,
        modelId: "kling-4-0",
        prompt:
          "Probe-lens macro orbit inside an exposed mechanical watch caliber with gleaming brass escapement gears and dark slate plates.",
        videoUrl: "/examples/kling-3-coffee.mp4",
        posterUrl: "/examples/kling-3-coffee.webp",
      },
      {
        id: "shot-2",
        shotNumber: 2,
        title: "Crimson Flagship Supercar Run",
        cameraMove: "Slow Crane Descent",
        durationSec: 5,
        modelId: "veo-3-1",
        prompt:
          "Low-angle tracking shot of a gloss-crimson flagship sports coupe carving through a sweeping canyon highway.",
        videoUrl: "/examples/kling-4-chase.mp4",
        posterUrl: "/examples/kling-4-chase.webp",
      },
      {
        id: "shot-3",
        shotNumber: 3,
        title: "1000FPS Wok Flame Sear",
        cameraMove: "360° Turntable Orbit",
        durationSec: 5,
        modelId: "seedance-2-5",
        prompt:
          "1000fps Phantom macro shot of open amber flame searing gourmet ingredients above dark cast iron.",
        videoUrl: "/examples/seedance-2-chef.mp4",
        posterUrl: "/examples/seedance-2-chef.webp",
      },
      {
        id: "shot-4",
        shotNumber: 4,
        title: "Volumetric Smoke Stage Reveal",
        cameraMove: "Precision Lock-Off",
        durationSec: 5,
        modelId: "sora-2",
        prompt:
          "Solo performance silhouette emerging through illuminated volumetric tungsten fog on an obsidian stage.",
        videoUrl: "/examples/hailuo-2-3-ballet.mp4",
        posterUrl: "/examples/hailuo-2-3-ballet.webp",
      },
    ],
  },
  {
    id: "solaris-odyssey",
    name: "Planetary & Deep-Ocean Odyssey",
    logline:
      "From orbital planetary twilight and swirling accretion disks to volcanic calderas and turquoise ocean reefs.",
    audioPrompt: "Ethereal choir pads with deep atmospheric swells and IMAX horn motifs",
    shots: [
      {
        id: "shot-1",
        shotNumber: 1,
        title: "Orbital Planetary Horizon",
        cameraMove: "Orbital Telescope Pan",
        durationSec: 5,
        modelId: "veo-3-1",
        prompt:
          "Spinning blue planet Earth emerging from shadow into crisp orbital sunlight against pitch-black deep space.",
        videoUrl: "/examples/videos/hero-4.mp4",
        posterUrl: "/examples/videos/hero-4-poster.webp",
      },
      {
        id: "shot-2",
        shotNumber: 2,
        title: "Event Horizon Gold Accretion",
        cameraMove: "Vertical Plunge Cam",
        durationSec: 5,
        modelId: "wan-3-0",
        prompt:
          "Relativistic golden plasma vortex rotating around a dark gravitational singularity in deep vacuum.",
        videoUrl: "/examples/grok-video-astronaut.mp4",
        posterUrl: "/examples/grok-video-astronaut.webp",
      },
      {
        id: "shot-3",
        shotNumber: 3,
        title: "Cobalt Reef Barrel Swell",
        cameraMove: "Gliding Steadicam",
        durationSec: 5,
        modelId: "seedance-2-5",
        prompt:
          "Top-down aerial sweep over a deep indigo ocean swell breaking into blinding white seafoam.",
        videoUrl: "/examples/seedance-2-5-surf.mp4",
        posterUrl: "/examples/seedance-2-5-surf.webp",
      },
      {
        id: "shot-4",
        shotNumber: 4,
        title: "Sunlit Coral Kingdom Dive",
        cameraMove: "Vertigo Dolly Zoom",
        durationSec: 5,
        modelId: "kling-4-0",
        prompt:
          "Gliding underwater cinema camera drifting past vibrant living coral heads and tropical fish schools in turquoise water.",
        videoUrl: "/examples/videos/hero-5.mp4",
        posterUrl: "/examples/videos/hero-5-poster.webp",
      },
    ],
  },
];

const CAMERA_MOVES = [
  "Anamorphic Drone Orbit",
  "Low-Angle Tracking Dolly",
  "85mm Macro Push-In",
  "180° Bullet-Time Whip Pan",
  "1000fps Phantom Macro",
  "Vertigo Dolly Zoom",
  "Gliding Steadicam",
];

export default function StoryboardDirectorPage() {
  const videoModels = getModelsForTool("text-to-video", "video");
  const { availableCredits, reserveCredits, settleCredits, upsertJob } = useWallet();

  const [selectedPresetId, setSelectedPresetId] = useState<string>(STORY_PRESETS[0].id);
  const [logline, setLogline] = useState<string>(STORY_PRESETS[0].logline);
  const [audioPrompt, setAudioPrompt] = useState<string>(STORY_PRESETS[0].audioPrompt);
  const [shots, setShots] = useState<StoryboardShot[]>(
    STORY_PRESETS[0].shots.map((s) => ({ ...s, status: "ready" }))
  );

  const [activeShotIndex, setActiveShotIndex] = useState<number>(0);
  const [isSequencePlaying, setIsSequencePlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [renderingAll, setRenderingAll] = useState<boolean>(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const masterVideoRef = useRef<HTMLVideoElement | null>(null);

  const activeShot = shots[activeShotIndex] || shots[0];

  // Calculate total sequence credit quote
  const totalCredits = shots.reduce((acc, s) => {
    const m = videoModels.find((vm) => vm.id === s.modelId);
    return acc + (m?.baseCredits || 18);
  }, 10); // +10c for Suno v6 Master Stem

  useEffect(() => {
    const vid = masterVideoRef.current;
    if (!vid) return;
    vid.load();
    if (isSequencePlaying) {
      vid.play().catch(() => {});
    }
  }, [activeShotIndex, activeShot?.videoUrl, isSequencePlaying]);

  const handleSelectPreset = (preset: StoryPreset) => {
    setSelectedPresetId(preset.id);
    setLogline(preset.logline);
    setAudioPrompt(preset.audioPrompt);
    setShots(preset.shots.map((s) => ({ ...s, status: "ready" })));
    setActiveShotIndex(0);
    setIsSequencePlaying(true);
  };

  const handleAutoSplitLogline = () => {
    if (!logline.trim()) return;
    const rotatedVideos = [
      ["/examples/videos/ex-8.mp4", "/examples/videos/ex-8-poster.webp"],
      ["/examples/videos/ex-9.mp4", "/examples/videos/ex-9-poster.webp"],
      ["/examples/videos/ex-10.mp4", "/examples/videos/ex-10-poster.webp"],
      ["/examples/videos/ex-11.mp4", "/examples/videos/ex-11-poster.webp"],
    ];
    setShots((prev) =>
      prev.map((shot, idx) => ({
        ...shot,
        prompt: `[Shot 0${idx + 1} · ${shot.cameraMove}] ${logline.trim()} — cinematic 24fps master take, physically accurate lighting.`,
        videoUrl: rotatedVideos[idx][0],
        posterUrl: rotatedVideos[idx][1],
      }))
    );
    setActiveShotIndex(0);
    setBannerNotice("Decomposed story logline into 4 synchronized camera shots.");
    setTimeout(() => setBannerNotice(null), 3500);
  };

  const updateShot = (shotId: string, patch: Partial<StoryboardShot>) => {
    setShots((prev) => prev.map((s) => (s.id === shotId ? { ...s, ...patch } : s)));
  };

  const handleRenderSingleShot = (shot: StoryboardShot, idx: number) => {
    const modelObj = videoModels.find((m) => m.id === shot.modelId) || videoModels[0];
    const cost = modelObj?.baseCredits || 18;
    if (availableCredits < cost) {
      setBannerNotice(`Insufficient credits (${cost}c needed). Top up via Waffo Pancake.`);
      return;
    }

    updateShot(shot.id, { status: "rendering" });
    reserveCredits(cost, `Hold ${cost}c for Storyboard Shot #0${shot.shotNumber}`);
    setTimeout(() => {
      const jobId = `sb_${Date.now()}_${shot.shotNumber}`;
      settleCredits(cost, `Storyboard Shot #0${shot.shotNumber} (${modelObj?.name || shot.modelId})`);
      upsertJob({
        id: jobId,
        yirJobId: jobId,
        toolSlug: "storyboard",
        modelId: shot.modelId,
        modelName: modelObj?.name || shot.modelId,
        prompt: shot.prompt,
        settingsSummary: `${shot.durationSec}s · ${shot.cameraMove}`,
        creditsCost: cost,
        status: "succeeded",
        createdAt: "Just now",
        outputUrl: shot.videoUrl,
      });
      updateShot(shot.id, { status: "ready" });
      setActiveShotIndex(idx);
      setBannerNotice(
        `Rendered Shot #0${shot.shotNumber} with ${modelObj?.name} (-${cost} credits).`
      );
      setTimeout(() => setBannerNotice(null), 4000);
    }, 900);
  };

  const handleRenderMasterSequence = () => {
    if (availableCredits < totalCredits) {
      setBannerNotice(
        `Insufficient balance (${totalCredits}c required). Please top up via Waffo Pancake.`
      );
      return;
    }
    setRenderingAll(true);
    reserveCredits(totalCredits, `Hold ${totalCredits}c for 4-Shot Master Storyboard`);
    setShots((prev) => prev.map((s) => ({ ...s, status: "rendering" })));

    setTimeout(() => {
      const jobId = `sb_master_${Date.now()}`;
      settleCredits(
        totalCredits,
        `4-Shot Multi-Model Master Sequence (${shots.length} reels + audio)`
      );
      upsertJob({
        id: jobId,
        yirJobId: jobId,
        toolSlug: "storyboard",
        modelId: shots.map((s) => s.modelId).join("+"),
        modelName: "Multi-Model Multiplexer (4 Shots)",
        prompt: logline,
        settingsSummary: "20s · 4 Shots · 1080p · Suno v6 Stem",
        creditsCost: totalCredits,
        status: "succeeded",
        createdAt: "Just now",
        outputUrl: shots[0].videoUrl,
      });
      setShots((prev) => prev.map((s) => ({ ...s, status: "ready" })));
      setRenderingAll(false);
      setActiveShotIndex(0);
      setIsSequencePlaying(true);
      setBannerNotice(
        `Master 4-Shot Sequence rendered & stitched! (-${totalCredits} credits held & settled)`
      );
      setTimeout(() => setBannerNotice(null), 4500);
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
            <Layers className="h-3.5 w-3.5" />
            ReelMux Exclusive · Multi-Model Timeline Sequencer
          </div>
          <h1 className="mt-2.5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            AI Storyboard Director &amp; 4-Reel Multiplexer
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-zinc-400">
            Route different shots of the same film to the best specialized model —{" "}
            <span className="text-white font-medium">Veo 3.1</span> for wide establishing shots,{" "}
            <span className="text-white font-medium">Seedance 2.5</span> for kinetic action,{" "}
            <span className="text-white font-medium">Kling 4.0</span> for facial close-ups, and{" "}
            <span className="text-white font-medium">Suno v6</span> for synchronized audio stems.
          </p>
        </div>

        {/* Preset Story Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {STORY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                selectedPresetId === preset.id
                  ? "border-cyan-400 bg-cyan-400/15 text-cyan-200 shadow-sm shadow-cyan-500/20"
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/25 hover:text-white"
              }`}
            >
              <Film className="mr-1.5 inline h-3.5 w-3.5" />
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {bannerNotice && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 text-xs font-semibold text-cyan-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#D4FF00]" />
            <span>{bannerNotice}</span>
          </div>
          <Link href="/dashboard" className="text-[#D4FF00] underline hover:no-underline">
            View in Studio History →
          </Link>
        </div>
      )}

      {/* Main Director Grid: Left Logline & Master Monitor | Right 4-Shot Rack */}
      <div className="mt-7 grid gap-6 lg:grid-cols-12">
        {/* Left Column (5 cols): Master Sequence Monitor + Story Logline */}
        <div className="lg:col-span-5 space-y-5">
          {/* Master Sequence Cinema Monitor */}
          <div className="overflow-hidden rounded-2xl border border-cyan-400/30 bg-[#0A0D14] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono font-bold uppercase tracking-wider text-white">
                  MASTER PROGRAM MONITOR
                </span>
              </div>
              <span className="rounded bg-cyan-400/15 px-2 py-0.5 font-mono text-[11px] font-bold text-cyan-300">
                SHOT 0{activeShot.shotNumber} / 04 · {activeShot.modelId.toUpperCase()}
              </span>
            </div>

            <div className="relative aspect-video bg-black">
              <video
                ref={masterVideoRef}
                key={activeShot.videoUrl}
                src={activeShot.videoUrl}
                poster={activeShot.posterUrl}
                muted={isMuted}
                playsInline
                autoPlay
                onEnded={() => {
                  // Advance automatically to next shot in sequence!
                  setActiveShotIndex((prev) => (prev + 1) % shots.length);
                }}
                className="h-full w-full object-cover"
              />

              {/* HUD Overlay */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
                  <span>CAM: {activeShot.cameraMove}</span>
                  <span>TC 00:00:0{activeShot.shotNumber * 5}:00</span>
                </div>
                <div className="mt-1 text-sm font-bold text-white line-clamp-1">
                  {activeShot.title}
                </div>
              </div>

              {/* Floating Playback Controls */}
              <div className="absolute right-3 top-3 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsMuted((m) => !m)}
                  className="rounded-lg border border-white/20 bg-black/70 p-2 text-white hover:bg-black cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const v = masterVideoRef.current;
                    if (!v) return;
                    if (v.paused) {
                      v.play().catch(() => {});
                      setIsSequencePlaying(true);
                    } else {
                      v.pause();
                      setIsSequencePlaying(false);
                    }
                  }}
                  className="rounded-lg border border-white/20 bg-black/70 p-2 text-white hover:bg-black cursor-pointer"
                  title="Play/Pause Sequence"
                >
                  {isSequencePlaying ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* 4-Shot Scrub Bar */}
            <div className="grid grid-cols-4 gap-1 bg-black/80 p-2 border-t border-white/10">
              {shots.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveShotIndex(idx)}
                  className={`rounded-lg p-2 text-left transition-all cursor-pointer ${
                    idx === activeShotIndex
                      ? "bg-cyan-400/20 border border-cyan-400/60"
                      : "bg-white/[0.03] border border-transparent hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-[#D4FF00]">0{s.shotNumber}</span>
                    <span className="text-zinc-400">{s.durationSec}s</span>
                  </div>
                  <div className="mt-0.5 truncate text-[11px] font-semibold text-white">
                    {s.modelId}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Story Logline & Audio Score Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Master Story Logline
                </label>
                <button
                  type="button"
                  onClick={handleAutoSplitLogline}
                  className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-cyan-200 cursor-pointer"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  Auto-Split into 4 Shots
                </button>
              </div>
              <textarea
                rows={3}
                value={logline}
                onChange={(e) => setLogline(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-[#121621] p-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300">
                <Music className="h-3.5 w-3.5 text-[#D4FF00]" />
                Synchronized Audio Score (Suno v6 Cinema Stem · +10c)
              </label>
              <input
                type="text"
                value={audioPrompt}
                onChange={(e) => setAudioPrompt(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#121621] px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              type="button"
              disabled={renderingAll}
              onClick={handleRenderMasterSequence}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4FF00] via-[#6EE7B7] to-cyan-400 py-3.5 text-xs font-extrabold uppercase tracking-wider text-black hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              {renderingAll
                ? "Multiplexing 4 Shots Across Models..."
                : `Render Full 4-Shot Master Reel (${totalCredits} Credits)`}
            </button>
          </div>
        </div>

        {/* Right Column (7 cols): 4-Shot Multiplexer Timeline Cards */}
        <div className="lg:col-span-7 space-y-4">
          {shots.map((shot, idx) => {
            const selectedModel =
              videoModels.find((m) => m.id === shot.modelId) || videoModels[0];
            const isCurrent = idx === activeShotIndex;

            return (
              <div
                key={shot.id}
                className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                  isCurrent
                    ? "border-cyan-400/60 bg-gradient-to-r from-cyan-500/[0.07] to-[#0C0E14]"
                    : "border-white/10 bg-[#0C0E14] hover:border-white/20"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  {/* Shot Video Thumbnail */}
                  <div
                    onClick={() => setActiveShotIndex(idx)}
                    className="relative w-full sm:w-44 aspect-video shrink-0 overflow-hidden rounded-xl border border-white/15 bg-black cursor-pointer group"
                  >
                    <video
                      src={shot.videoUrl}
                      poster={shot.posterUrl}
                      muted
                      loop
                      playsInline
                      autoPlay
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-2 top-2 rounded bg-black/80 px-2 py-0.5 font-mono text-[10px] font-bold text-[#D4FF00]">
                      SHOT 0{shot.shotNumber}
                    </div>
                    <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[10px] text-white">
                      {shot.durationSec}.0s
                    </div>
                  </div>

                  {/* Shot Controls */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <input
                        type="text"
                        value={shot.title}
                        onChange={(e) => updateShot(shot.id, { title: e.target.value })}
                        className="bg-transparent text-sm font-bold text-white focus:outline-none border-b border-transparent focus:border-cyan-400"
                      />

                      <div className="flex items-center gap-2">
                        {/* Camera Rig Picker */}
                        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#141824] px-2 py-1">
                          <Camera className="h-3 w-3 text-cyan-400" />
                          <select
                            value={shot.cameraMove}
                            onChange={(e) =>
                              updateShot(shot.id, { cameraMove: e.target.value })
                            }
                            className="bg-transparent text-[11px] text-zinc-200 focus:outline-none"
                          >
                            {CAMERA_MOVES.map((cm) => (
                              <option key={cm} value={cm} className="bg-[#0C0E14]">
                                {cm}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Model Selector for this Shot */}
                        <div className="flex items-center gap-1 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1">
                          <Sliders className="h-3 w-3 text-cyan-300" />
                          <select
                            value={shot.modelId}
                            onChange={(e) =>
                              updateShot(shot.id, { modelId: e.target.value })
                            }
                            className="bg-transparent text-[11px] font-bold text-cyan-200 focus:outline-none"
                          >
                            {videoModels.map((vm) => (
                              <option key={vm.id} value={vm.id} className="bg-[#0C0E14]">
                                {vm.name} ({vm.baseCredits}c)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={shot.prompt}
                      onChange={(e) => updateShot(shot.id, { prompt: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-[#121621] p-2.5 text-xs text-zinc-200 focus:border-cyan-400 focus:outline-none"
                    />

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[11px] text-zinc-400">
                        Assigned Engine:{" "}
                        <strong className="text-white">{selectedModel?.name}</strong> ·{" "}
                        <span className="text-[#D4FF00] font-semibold">
                          {selectedModel?.baseCredits || 18} credits
                        </span>
                      </span>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/tools/text-to-video?model=${shot.modelId}&prompt=${encodeURIComponent(
                            shot.prompt
                          )}`}
                          className="rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:bg-white/10"
                        >
                          Open in Studio <ArrowRight className="inline h-3 w-3" />
                        </Link>
                        <button
                          type="button"
                          disabled={shot.status === "rendering"}
                          onClick={() => handleRenderSingleShot(shot, idx)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#D4FF00] px-3 py-1 text-[11px] font-extrabold text-black hover:bg-[#e3ff42] disabled:opacity-50 cursor-pointer"
                        >
                          <Zap className="h-3 w-3 fill-current" />
                          {shot.status === "rendering"
                            ? "Rendering..."
                            : `Re-Render Shot (${selectedModel?.baseCredits || 18}c)`}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
