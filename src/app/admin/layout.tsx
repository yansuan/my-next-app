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
  ShieldCheck,
  Lock,
  LogOut,
  Loader2,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

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

  const currentLabel = BREADCRUMB_LABELS[pathname] || "Overview";
  const [authChecked, setAuthChecked] = React.useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = React.useState(false);
  const [adminConfigured, setAdminConfigured] = React.useState(true);
  const [loginUsername, setLoginUsername] = React.useState("ops@reelmux.com");
  const [loginSecret, setLoginSecret] = React.useState("");
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [loggingIn, setLoggingIn] = React.useState(false);

  const [customAdminName, setCustomAdminName] = React.useState<string>("ops@reelmux.com");
  const [editingAdminName, setEditingAdminName] = React.useState(false);
  const [draftAdminName, setDraftAdminName] = React.useState("ops@reelmux.com");

  const checkAdminSession = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      const data = await res.json();
      setAdminConfigured(Boolean(data.configured));
      setAdminAuthenticated(Boolean(data.authenticated));
      if (data.actorEmail) {
        setCustomAdminName(String(data.actorEmail));
        setDraftAdminName(String(data.actorEmail));
      }
    } catch {
      setAdminAuthenticated(false);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  React.useEffect(() => {
    checkAdminSession();
    try {
      const saved = window.localStorage.getItem("reelmux_admin_operator");
      if (saved && saved.trim()) {
        setCustomAdminName(saved.trim());
        setDraftAdminName(saved.trim());
      }
    } catch {
      // ignore storage errors
    }
  }, [checkAdminSession]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, secret: loginSecret }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Admin authentication failed.");
        return;
      }
      setLoginSecret("");
      setAdminAuthenticated(true);
      if (data.actorEmail) {
        setCustomAdminName(String(data.actorEmail));
      }
    } catch {
      setLoginError("Network error while verifying admin credentials.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    setAdminAuthenticated(false);
  };

  const saveAdminName = async () => {
    const clean = draftAdminName.trim() || "ops@reelmux.com";
    setCustomAdminName(clean);
    setEditingAdminName(false);
    try {
      window.localStorage.setItem("reelmux_admin_operator", clean);
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_admin_profile",
          newAdminName: clean,
          actorEmail: clean,
        }),
      });
    } catch {
      // ignore network error
    }
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090C] text-zinc-300">
        <Loader2 className="h-5 w-5 animate-spin text-[#D4FF00]" />
      </div>
    );
  }

  if (!adminAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090C] px-4 text-zinc-100">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0D1017] p-7 shadow-2xl">
          <div className="flex items-center justify-between">
            <BrandLogo href="/admin" badge="Admin" size="sm" />
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
              <Lock className="h-3 w-3" />
              Isolated Ops Gate
            </span>
          </div>
          <h1 className="mt-5 text-xl font-bold text-white">
            Admin Console Sign In
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Admin authentication is strictly isolated from public website Google accounts.
          </p>

          {!adminConfigured && (
            <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-200">
              Server env var <code className="font-mono">ADMIN_ACCESS_KEY</code> (or{" "}
              <code className="font-mono">ADMIN_PASSWORD</code>) is not configured yet.
            </div>
          )}

          {loginError && (
            <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Operator Handle / Email
              </label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#08090C] px-3.5 py-2.5 text-sm text-white focus:border-[#D4FF00] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Admin Access Key
              </label>
              <input
                type="password"
                required
                value={loginSecret}
                onChange={(e) => setLoginSecret(e.target.value)}
                placeholder="Enter ADMIN_ACCESS_KEY"
                className="w-full rounded-xl border border-white/15 bg-[#08090C] px-3.5 py-2.5 text-sm text-white focus:border-[#D4FF00] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loggingIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4FF00] py-2.5 text-sm font-bold text-black hover:bg-[#e2ff4d] disabled:opacity-50 cursor-pointer"
            >
              {loggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Unlock Admin Console"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

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

        {/* Bottom Isolated Admin Status */}
        <div className="border-t border-white/[0.06] px-5 py-3.5">
          <div className="inline-flex items-center gap-2 text-[11px] text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Isolated Admin Session</span>
          </div>
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
          <div className="flex items-center gap-2">
            {editingAdminName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={draftAdminName}
                  onChange={(e) => setDraftAdminName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveAdminName();
                    if (e.key === "Escape") setEditingAdminName(false);
                  }}
                  placeholder="ops@reelmux.com"
                  className="w-48 rounded-md border border-[#D4FF00]/50 bg-[#0B0C10] px-2.5 py-1 font-mono text-xs text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={saveAdminName}
                  className="rounded-md bg-[#D4FF00] px-2.5 py-1 text-[11px] font-bold text-black hover:bg-[#e2ff4d] cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingAdminName(false)}
                  className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDraftAdminName(customAdminName);
                  setEditingAdminName(true);
                }}
                title="Click to change admin username / email"
                className="group inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-mono text-xs text-zinc-200 hover:border-[#D4FF00]/40 hover:text-white cursor-pointer transition-colors"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{customAdminName}</span>
                <span className="text-[10px] text-zinc-500 group-hover:text-[#D4FF00]">
                  Edit
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={handleAdminLogout}
              title="Sign out of Admin Console"
              className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-400 hover:border-rose-400/40 hover:text-rose-200 cursor-pointer"
            >
              <LogOut className="h-3 w-3" />
              Sign out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto px-8 py-7">{children}</div>
      </div>
    </div>
  );
}
