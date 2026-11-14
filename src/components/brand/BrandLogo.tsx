import React from "react";
import Link from "next/link";

interface MarkProps {
  className?: string;
  size?: number;
}

/**
 * ReelMux signature vector emblem:
 * Rounded electric-lime squircle (#D4FF00) with interlocking cinema frames
 * and a subtle central play prism, inspired by the FrameMux / ReelMux studio mark.
 */
export function ReelMuxMark({ className = "", size = 32 }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="9" fill="#D4FF00" />
      {/* Outer interlocking frame */}
      <rect
        x="6.5"
        y="6.5"
        width="16.5"
        height="16.5"
        rx="4"
        stroke="#06070A"
        strokeWidth="2.6"
      />
      {/* Offset inner cinema frame */}
      <rect
        x="13"
        y="13"
        width="16.5"
        height="16.5"
        rx="4"
        fill="#D4FF00"
        stroke="#06070A"
        strokeWidth="2.6"
      />
      {/* Center motion node */}
      <path
        d="M19.2 18.1L24.2 21.25L19.2 24.4V18.1Z"
        fill="#06070A"
      />
    </svg>
  );
}

interface BrandLogoProps {
  href?: string;
  badge?: string;
  showDomainBadge?: boolean;
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({
  href = "/",
  badge,
  showDomainBadge = false,
  size = "md",
}: BrandLogoProps) {
  const markSize = size === "sm" ? 26 : size === "lg" ? 36 : 32;
  const textClass =
    size === "sm"
      ? "text-base font-extrabold tracking-tight text-white"
      : size === "lg"
      ? "text-xl font-extrabold tracking-tight text-white"
      : "text-lg font-extrabold tracking-tight text-white";

  return (
    <Link href={href} className="group inline-flex items-center gap-2.5 shrink-0">
      <div className="transition-transform duration-200 group-hover:scale-105 shadow-[0_0_24px_rgba(212,255,0,0.3)] rounded-[9px]">
        <ReelMuxMark size={markSize} />
      </div>
      <div className="flex items-center gap-2">
        <span className={textClass}>ReelMux</span>
        {badge && (
          <span className=" rounded-md border border-white/10 bg-white/[0.07] px-1.5 py-0.5 text-[11px] font-medium text-zinc-300">
            {badge}
          </span>
        )}
        {showDomainBadge && (
          <span className="hidden 2xl:inline-block rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            .com
          </span>
        )}
      </div>
    </Link>
  );
}
