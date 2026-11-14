"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Sparkles,
  Image as ImageIcon,
  Users,
  ShieldAlert,
  CreditCard,
  ClipboardList,
  ArrowLeft,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useWallet } from "@/context/WalletContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  section: string;
  items: NavItem[];
}

const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    section: "Dashboard",
    items: [{ label: "Overview", href: "/admin", icon: LayoutGrid }],
  },
  {
    section: "Content",
    items: [
      { label: "Generations", href: "/admin/generations", icon: Sparkles },
      { label: "Uploads", href: "/admin/uploads", icon: ImageIcon },
    ],
  },
  {
    section: "Accounts",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Signup abuse", href: "/admin/signup-abuse", icon: ShieldAlert },
      { label: "Orders", href: "/admin/orders", icon: CreditCard },
    ],
  },
  {
    section: "System",
    items: [{ label: "Audit log", href: "/admin/audit-log", icon: ClipboardList }],
  },
];

const BREADCRUMB_LABELS: Record<string, string> = {
  "/admin": "Overview",
  "/admin/generations": "Generations",
  "/admin/uploads": "Uploads",
  "/admin/users": "Users",
  "/admin/signup-abuse": "Signup abuse",
  "/admin/orders": "Orders",
  "/admin/audit-log": "Audit log",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userEmail } = useWallet();

  const currentLabel = BREADCRUMB_LABELS[pathname] || "Overview";
  const adminEmail =
    userEmail && userEmail !== "creator@reelmux.com"
      ? userEmail
      : "firefish.a6@gmail.com";

  return (
    <div className="flex min-h-screen bg-[#08090C] text-zinc-100">
      {/* Left Admin Sidebar (1:1 FrameMux / ReelMux Admin Structure) */}
      <aside className="flex w-[228px] shrink-0 flex-col justify-between border-r border-white/[0.07] bg-[#08090C] select-none">
        <div>
          {/* Top Brand + Admin Badge */}
          <div className="flex h-14 items-center px-5">
            <BrandLogo href="/admin" badge="Admin" size="sm" />
          </div>

          {/* Grouped Navigation */}
          <nav className="mt-2 space-y-5 px-3">
            {ADMIN_NAV_GROUPS.map((group) => (
              <div key={group.section}>
                <div className="px-2.5 pb-1.5 text-[11px] font-medium text-zinc-500">
                  {group.section}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] transition-colors ${
                          isActive
                            ? "bg-white/[0.07] font-medium text-white"
                            : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon
                            className={`h-4 w-4 ${
                              isActive ? "text-zinc-100" : "text-zinc-400"
                            }`}
                          />
                          {item.label}
                        </span>
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#D4FF00]" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Back to Site Link */}
        <div className="border-t border-white/[0.06] px-5 py-3.5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to site
          </Link>
        </div>
      </aside>

      {/* Right Main Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Breadcrumb & Admin Email Bar */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.07] px-8 text-xs">
          <div className="flex items-center gap-1.5">
            <Link href="/admin" className="text-zinc-500 hover:text-zinc-300">
              Admin
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="font-medium text-zinc-200">{currentLabel}</span>
          </div>
          <div className="font-mono text-xs text-zinc-400">{adminEmail}</div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto px-8 py-7">{children}</div>
      </div>
    </div>
  );
}
