"use client";

import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck, Lock } from "lucide-react";
import { TOOLS_CATALOG, MODELS_CATALOG, AI_EFFECTS_CATALOG } from "@/lib/catalog/models";
import { ReelMuxMark } from "@/components/brand/BrandLogo";

const COMPARE_SEO_LINKS = [
  { label: "Seedance 2.5 vs Kling 4.0", href: "/compare/seedance-2.5-vs-kling-4.0" },
  { label: "Veo 3.1 vs Seedance 2.5", href: "/compare/veo-3.1-vs-seedance-2.5" },
  { label: "MiniMax H3 vs Wan 3.0", href: "/compare/minimax-h3-vs-wan-3.0" },
  { label: "GPT Image 2.6 vs FLUX.2 Max", href: "/compare/gpt-image-2.6-vs-flux-2-max" },
  { label: "Kling 4.0 Specs & Pricing", href: "/models/kling-4.0" },
  { label: "Seedance 2.5 Specs & Pricing", href: "/models/seedance-2.5" },
  { label: "Veo 3.1 Specs & Pricing", href: "/models/veo-3.1" },
  { label: "Nano Banana Pro Specs", href: "/models/nano-banana-pro" },
];

export function Footer() {
  return (
    <>
      <footer className="relative border-t border-white/10 bg-[#050609] pt-16 pb-28 text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top Assurance Banner */}
          <div className="mb-12 grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#D4FF00]/15 p-2 text-[#D4FF00]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">01 · See the price first</div>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Every resolution, duration, and model displays its exact credit cost before you
                  click generate.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-cyan-500/15 p-2 text-cyan-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  02 · Credits held, then charged
                </div>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Credits are reserved while your job runs and only deducted once your finished
                  media is ready.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  03 · Failed jobs cost nothing
                </div>
                <p className="mt-0.5 text-xs text-zinc-400">
                  If a generation fails or times out, 100% of reserved credits are returned
                  automatically to your balance.
                </p>
              </div>
            </div>
          </div>

          {/* 5-Column SEO Architecture matching FrameMux */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            {/* Col 1: AI Models */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">AI Models</h3>
              <ul className="mt-4 space-y-2 text-xs">
                {MODELS_CATALOG.slice(0, 12).map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/models/${m.id}`}
                      className="hover:text-white transition-colors"
                    >
                      {m.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-1">
                  <Link href="/models" className="font-semibold text-[#D4FF00] hover:underline">
                    All 73 models →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 2: AI Tools */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">AI Tools</h3>
              <ul className="mt-4 space-y-2 text-xs">
                {TOOLS_CATALOG.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/tools/${t.slug}`} className="hover:text-white transition-colors">
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: AI Effects */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">AI Effects</h3>
              <ul className="mt-4 space-y-2 text-xs">
                {AI_EFFECTS_CATALOG.map((e) => (
                  <li key={e.slug}>
                    <Link
                      href={`/ai-effects?effect=${e.slug}`}
                      className="hover:text-white transition-colors"
                    >
                      {e.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-1">
                  <Link href="/ai-effects" className="font-semibold text-[#D4FF00] hover:underline">
                    All one-click effects →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Compare & Alternatives */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Compare &amp; Alternatives
              </h3>
              <ul className="mt-4 space-y-2 text-xs">
                {COMPARE_SEO_LINKS.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 5: Company & Legal */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Company
              </h3>
              <ul className="mt-4 space-y-2 text-xs">
                <li>
                  <Link href="/for-agents" className="hover:text-white transition-colors">
                    For Agents (MCP)
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    My Workspace
                  </Link>
                </li>
                <li>
                  <Link href="/auth" className="hover:text-white transition-colors">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/refund" className="hover:text-white transition-colors">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/content-policy" className="hover:text-white transition-colors">
                    Content Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs sm:flex-row">
            <div className="flex items-center gap-2.5">
              <ReelMuxMark size={22} />
              <span className="font-bold text-white">ReelMux</span>
              <span>·</span>
              <span>One credit balance for every flagship AI model.</span>
            </div>
            <div className="text-zinc-500">
              © {new Date().getFullYear()} ReelMux. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Sticky Bottom CTA Pill Bar (FrameMux Signature Conversion Bar) */}
      <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 px-3 w-full max-w-fit">
        <div className="flex items-center gap-3 rounded-full border border-white/15 bg-zinc-950/85 px-4 py-2 text-xs shadow-2xl backdrop-blur-xl">
          <span className="hidden sm:inline font-medium text-zinc-300">
            100 free credits · no card needed
          </span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <Link
            href="/pricing"
            className="font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/tools/text-to-video"
            className="inline-flex items-center gap-1 rounded-full bg-[#D4FF00] px-3.5 py-1.5 font-bold text-black hover:bg-[#e1ff3d] transition-transform active:scale-95"
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            Start for free
          </Link>
        </div>
      </div>
    </>
  );
}
