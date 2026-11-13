import React, { use } from "react";
import Link from "next/link";

const LEGAL_DOCS: Record<string, { title: string; updated: string; sections: { h: string; p: string }[] }> = {
  terms: {
    title: "Terms of Service",
    updated: "November 2026",
    sections: [
      {
        h: "1. Unified Workspace & Credit System",
        p: "ReelMux (reelmux.com) provides a unified creative workspace for generating video, image, and audio assets across supported third-party AI models. Credits purchased in one-time packs do not expire as long as your account remains in good standing.",
      },
      {
        h: "2. Commercial Usage Rights",
        p: "Outputs generated using paid credit packs or active subscriptions include full commercial usage rights, subject to compliance with our Content Policy and applicable law.",
      },
      {
        h: "3. Automatic Failed-Job Refunds",
        p: "Credits are reserved when a generation job is submitted. If a job fails or times out upstream, 100% of the reserved credits are automatically restored to your available balance.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "November 2026",
    sections: [
      {
        h: "1. Private Workspace Assets",
        p: "Your uploaded reference frames, prompts, and generated media remain private to your workspace by default. We do not sell your personal data or use your private uploads to train foundation models.",
      },
      {
        h: "2. Authentication & Billing Data",
        p: "We collect only the email address and authentication metadata required to maintain your credit ledger and generation history.",
      },
    ],
  },
  refund: {
    title: "Refund & Credit Protection Policy",
    updated: "November 2026",
    sections: [
      {
        h: "1. Failed Generations Cost Nothing",
        p: "Every generation job on ReelMux is protected by atomic credit escrow. If any model fails to return a valid output, your held credits are refunded immediately and automatically.",
      },
      {
        h: "2. Unused Credit Pack Refunds",
        p: "If you purchased a credit pack by mistake and have not spent any credits from that pack, contact support@reelmux.com within 14 days for a full refund.",
      },
    ],
  },
  "content-policy": {
    title: "Content & Safety Policy",
    updated: "November 2026",
    sections: [
      {
        h: "1. Prohibited Content",
        p: "Users may not generate non-consensual likenesses, unlawful content, deceptive deepfakes intended to harm individuals, or material that violates copyright or safety regulations.",
      },
      {
        h: "2. Automated Safety Filters",
        p: "Prompts and reference uploads are screened by automated safety checks. Blocked requests automatically release any held credits back to your balance.",
      },
    ],
  },
};

export default function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const doc = LEGAL_DOCS[slug] ?? LEGAL_DOCS.terms;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap gap-2 text-xs mb-6">
        {Object.keys(LEGAL_DOCS).map((k) => (
          <Link
            key={k}
            href={`/legal/${k}`}
            className={`rounded-lg px-3 py-1.5 font-semibold ${
              k === slug
                ? "bg-[#D4FF00] text-black"
                : "border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white"
            }`}
          >
            {LEGAL_DOCS[k].title}
          </Link>
        ))}
      </div>

      <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{doc.title}</h1>
      <p className="mt-1 text-xs text-zinc-500">Last updated: {doc.updated}</p>

      <div className="mt-8 space-y-6">
        {doc.sections.map((s) => (
          <div
            key={s.h}
            className="rounded-2xl border border-white/10 bg-[#0C0E14] p-6 space-y-2"
          >
            <h2 className="text-lg font-bold text-white">{s.h}</h2>
            <p className="text-sm text-zinc-300 leading-relaxed">{s.p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
