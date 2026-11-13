"use client";

import React, { use } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, HelpCircle } from "lucide-react";
import { MODELS_CATALOG, PROMPT_STARTERS } from "@/lib/catalog/models";

const COMPARISON_PRESETS: Record<
  string,
  {
    modelAId: string;
    modelBId: string;
    pickAHeadline: string;
    pickADesc: string;
    pickBHeadline: string;
    pickBDesc: string;
  }
> = {
  "seedance-2.5-vs-kling-4.0": {
    modelAId: "seedance-2.5",
    modelBId: "kling-4.0",
    pickAHeadline: "for multi-shot scenes & reference lock",
    pickADesc:
      "Builds multi-shot sequences in one generation and takes up to 15 character, outfit, and scene references so your subject stays consistent across cuts. Native audio is built in.",
    pickBHeadline: "for keyframe control & up to 30s length",
    pickBDesc:
      "Set the exact first frame, last frame, and camera trajectory between them. Kling 4.0 renders up to 30-second cinema clips with synchronized dialogue and environmental audio.",
  },
  "veo-3.1-vs-seedance-2.5": {
    modelAId: "veo-3.1",
    modelBId: "seedance-2.5",
    pickAHeadline: "for spoken dialogue & 4K photorealism",
    pickADesc:
      "Google DeepMind Veo 3.1 excels at realistic lip-synced dialogue, realistic water/cloth physics, and native 4K mastering.",
    pickBHeadline: "for faster turnaround & lower credit cost",
    pickBDesc:
      "Seedance 2.5 costs nearly 40% fewer credits per 5-second clip while supporting up to 15 visual references and dynamic camera choreography.",
  },
  "minimax-h3-vs-wan-3.0": {
    modelAId: "minimax-h3",
    modelBId: "wan-3.0",
    pickAHeadline: "for high-value 2K clips from 33 credits",
    pickADesc:
      "MiniMax H3 delivers 2K video with synchronized sound starting at just 33 credits, making it ideal for high-volume creative testing.",
    pickBHeadline: "for bilingual text & reference-to-video",
    pickBDesc:
      "Alibaba Wan 3.0 offers multi-reference consistency and sharp on-screen typography in both English and Chinese.",
  },
  "gpt-image-2.6-vs-flux-2-max": {
    modelAId: "gpt-image-2.6",
    modelBId: "flux-2-max",
    pickAHeadline: "for poster typography & conversational edits",
    pickADesc:
      "OpenAI GPT Image 2.6 renders complex multi-line headlines, infographics, and transparent PNG stickers at 3 credits per image.",
    pickBHeadline: "for raw camera optics & editorial realism",
    pickBDesc:
      "FLUX.2 Max produces natural skin micro-textures, authentic 35mm film grain, and complex architectural lighting.",
  },
};

export default function CompareModelsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const preset =
    COMPARISON_PRESETS[slug] ?? COMPARISON_PRESETS["seedance-2.5-vs-kling-4.0"];

  const modelA =
    MODELS_CATALOG.find((m) => m.id === preset.modelAId) ?? MODELS_CATALOG[1];
  const modelB =
    MODELS_CATALOG.find((m) => m.id === preset.modelBId) ?? MODELS_CATALOG[0];

  const targetTool = modelA.category === "image" ? "text-to-image" : "text-to-video";

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 space-y-14">
      {/* Breadcrumb & FrameMux-Style Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/models" className="hover:text-white">
            Models
          </Link>
          <span>/</span>
          <span>Compare</span>
          <span>/</span>
          <span className="text-zinc-200 font-medium">
            {modelA.name} vs {modelB.name}
          </span>
        </div>

        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-[1.05]">
          {modelA.name}
          <br />
          <span className="text-zinc-400">vs {modelB.name}</span>
        </h1>

        <p className="mt-5 max-w-2xl text-base text-zinc-300 leading-relaxed">
          Compare {modelA.name} from {modelA.provider} and {modelB.name} from {modelB.provider}{" "}
          using the inputs, output settings, and live credit prices on ReelMux. Choose by the
          requirements of your shot and check the exact credit cost before generating.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Link
            href={`/tools/${targetTool}?model=${modelA.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#D4FF00] px-5 py-3 text-sm font-extrabold text-black hover:bg-[#e2ff3e] transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Compare in the generator
          </Link>
          <span className="text-xs text-zinc-400">
            100 free credits · one balance for every model
          </span>
        </div>
      </div>

      {/* Which One to Pick (2-Column Decision Cards) */}
      <div>
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Which one to pick</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0C0E14] p-6">
            <div>
              <h3 className="text-xl font-bold text-white">
                Pick {modelA.name}
                <br />
                <span className="text-zinc-300">{preset.pickAHeadline}</span>
              </h3>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{preset.pickADesc}</p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
              <span>
                From <strong className="text-[#D4FF00]">{modelA.baseCredits}</strong> credits
              </span>
              <Link
                href={`/tools/${targetTool}?model=${modelA.id}`}
                className="inline-flex items-center gap-1 font-bold text-white hover:text-[#D4FF00]"
              >
                Try {modelA.name} →
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0C0E14] p-6">
            <div>
              <h3 className="text-xl font-bold text-white">
                Pick {modelB.name}
                <br />
                <span className="text-zinc-300">{preset.pickBHeadline}</span>
              </h3>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{preset.pickBDesc}</p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
              <span>
                From <strong className="text-[#D4FF00]">{modelB.baseCredits}</strong> credits
              </span>
              <Link
                href={`/tools/${targetTool}?model=${modelB.id}`}
                className="inline-flex items-center gap-1 font-bold text-white hover:text-[#D4FF00]"
              >
                Try {modelB.name} →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Spec & Pricing Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Side-by-side Specifications</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase text-zinc-400">
              <tr>
                <th className="py-3 pr-4">Feature</th>
                <th className="py-3 px-4 text-white">{modelA.name}</th>
                <th className="py-3 pl-4 text-white">{modelB.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              <tr>
                <td className="py-3 pr-4 text-zinc-400">Creator</td>
                <td className="py-3 px-4 font-semibold">{modelA.provider}</td>
                <td className="py-3 pl-4 font-semibold">{modelB.provider}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-zinc-400">Starting Price</td>
                <td className="py-3 px-4 font-bold text-[#D4FF00]">
                  {modelA.baseCredits} credits ({modelA.unitLabel})
                </td>
                <td className="py-3 pl-4 font-bold text-[#D4FF00]">
                  {modelB.baseCredits} credits ({modelB.unitLabel})
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-zinc-400">Resolutions</td>
                <td className="py-3 px-4">{modelA.resolutions.join(", ")}</td>
                <td className="py-3 pl-4">{modelB.resolutions.join(", ")}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-zinc-400">Aspect Ratios</td>
                <td className="py-3 px-4">{modelA.aspectRatios.join(", ")}</td>
                <td className="py-3 pl-4">{modelB.aspectRatios.join(", ")}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-zinc-400">Native Audio</td>
                <td className="py-3 px-4">{modelA.supportsNativeAudio ? "Yes" : "No"}</td>
                <td className="py-3 pl-4">{modelB.supportsNativeAudio ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-zinc-400">Speed Tier</td>
                <td className="py-3 px-4">{modelA.speedRating}</td>
                <td className="py-3 pl-4">{modelB.speedRating}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Prompts on Both Models */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          Test the same prompt on both models
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PROMPT_STARTERS.slice(0, 2).map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-white/10 bg-[#0C0E14] p-5 flex flex-col justify-between"
            >
              <div>
                <div className="text-sm font-bold text-white">{s.title}</div>
                <p className="mt-2 font-mono text-xs text-zinc-300 leading-relaxed">{s.prompt}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-white/10">
                <Link
                  href={`/tools/${targetTool}?model=${modelA.id}&prompt=${encodeURIComponent(
                    s.prompt
                  )}`}
                  className="rounded-lg bg-[#D4FF00] px-3 py-1.5 text-xs font-bold text-black"
                >
                  Run on {modelA.name}
                </Link>
                <Link
                  href={`/tools/${targetTool}?model=${modelB.id}&prompt=${encodeURIComponent(
                    s.prompt
                  )}`}
                  className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Run on {modelB.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
