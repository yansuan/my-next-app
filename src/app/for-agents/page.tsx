"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Terminal,
  Cpu,
  Key,
  Copy,
  Check,
  Play,
  Sparkles,
  ShieldCheck,
  FileCode2,
  ArrowRight,
  Layers,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { MODELS_CATALOG } from "@/lib/catalog/models";

type InstallTab = "claude" | "codex" | "cursor" | "json";

const INSTALL_SNIPPETS: Record<InstallTab, { label: string; title: string; code: string }> = {
  claude: {
    label: "Claude Code",
    title: "Add ReelMux MCP server in Claude Code CLI",
    code: `claude mcp add reelmux https://reelmux.com/api/mcp`,
  },
  codex: {
    label: "Codex CLI",
    title: "Add ReelMux MCP server in OpenAI Codex CLI",
    code: `codex mcp add reelmux https://reelmux.com/api/mcp`,
  },
  cursor: {
    label: "Cursor",
    title: "Cursor Settings → MCP → Add new global MCP server",
    code: `Name: ReelMux
Type: sse / streamable-http
URL:  https://reelmux.com/api/mcp`,
  },
  json: {
    label: "mcpServers JSON",
    title: "Universal MCP configuration (claude_desktop_config.json / .cursor/mcp.json)",
    code: `{
  "mcpServers": {
    "reelmux": {
      "url": "https://reelmux.com/api/mcp",
      "headers": {
        "Authorization": "Bearer rmx_live_your_api_key"
      }
    }
  }
}`,
  },
};

const MCP_TOOLS_DOCS = [
  {
    name: "list_models",
    auth: "No API Key Required",
    scope: "public",
    desc: "Query all 73+ video, image, and audio models by media_type ('video' | 'image' | 'audio'), model family ('kling', 'seedance', 'veo', 'flux'), or free-text search.",
    params: "media_type?: 'video' | 'image' | 'audio', family?: string, search?: string",
    returns: "Array of models with maker, resolutions, aspect ratios, duration limits, audio support, and starting credits.",
  },
  {
    name: "get_model",
    auth: "No API Key Required",
    scope: "public",
    desc: "Inspect full specification, supported parameter ranges, and exact pricing formula for a single model.",
    params: "model_id: string (required, e.g. 'kling-4.0', 'seedance-2.5')",
    returns: "Complete model contract and capability metadata.",
  },
  {
    name: "estimate_generation",
    auth: "No API Key Required",
    scope: "public",
    desc: "Compute the exact credit cost for a job before spending any credits.",
    params: "model_id: string, duration_seconds?: number, resolution?: string, aspect_ratio?: string, audio?: boolean",
    returns: "{ model_id, estimated_credits, parameters, policy }",
  },
  {
    name: "create_generation",
    auth: "Bearer rmx_live_...",
    scope: "generation:create",
    desc: "Submit a text-to-video, image-to-video, frames-to-video, reference-to-video, image, or audio generation job.",
    params: "model_id: string, prompt: string, mode?: string, image_url?: string, duration?: number, resolution?: string, aspect_ratio?: string, native_audio?: boolean",
    returns: "{ generation_id, status: 'queued' | 'processing', estimated_credits }",
  },
  {
    name: "get_generation",
    auth: "Bearer rmx_live_...",
    scope: "generation:read",
    desc: "Poll job progress and retrieve finished video, image, or audio asset URLs.",
    params: "generation_id: string (required)",
    returns: "{ id, status, output: { media_url, duration_sec }, error }",
  },
  {
    name: "list_generations",
    auth: "Bearer rmx_live_...",
    scope: "generation:read",
    desc: "Fetch paginated history of previous generations for the workspace.",
    params: "limit?: number, cursor?: string",
    returns: "{ generations: [...], next_cursor }",
  },
];

interface ApiKeyItem {
  id: string;
  name: string;
  maskedKey: string;
  fullKey: string;
  scopes: string[];
  createdAt: string;
}

export default function ForAgentsPage() {
  const [activeTab, setActiveTab] = useState<InstallTab>("claude");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Interactive API Key Manager state
  const [keyName, setKeyName] = useState("claude-code-agent");
  const [scopeCreate, setScopeCreate] = useState(true);
  const [scopeRead, setScopeRead] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: "key-default-1",
      name: "default-mcp-agent",
      maskedKey: "rmx_live_9f8a••••••••••••4c21",
      fullKey: "rmx_live_9f8a7b6c5d4e3f2a1b0c9d8e4c21",
      scopes: ["generation:create", "generation:read"],
      createdAt: "Active",
    },
  ]);

  // Interactive MCP Playground state
  const [playgroundTool, setPlaygroundTool] = useState<"estimate_generation" | "list_models" | "get_model">("estimate_generation");
  const [pgModelId, setPgModelId] = useState("seedance-2.5");
  const [pgResolution, setPgResolution] = useState("1080p");
  const [pgDuration, setPgDuration] = useState(5);
  const [pgAudio, setPgAudio] = useState(true);
  const [pgMediaType, setPgMediaType] = useState("video");
  const [pgOutput, setPgOutput] = useState<string>("");
  const [pgLoading, setPgLoading] = useState(false);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const rand = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 10);
    const full = `rmx_live_${rand}`;
    const masked = `rmx_live_${rand.slice(0, 4)}••••••••••••${rand.slice(-4)}`;
    const scopes: string[] = [];
    if (scopeCreate) scopes.push("generation:create");
    if (scopeRead) scopes.push("generation:read");

    setApiKeys((prev) => [
      {
        id: `key-${Date.now()}`,
        name: keyName.trim() || "agent-key",
        maskedKey: masked,
        fullKey: full,
        scopes,
        createdAt: "Just now",
      },
      ...prev,
    ]);
    setKeyName("");
  };

  const runMcpPlayground = async () => {
    setPgLoading(true);
    try {
      const args =
        playgroundTool === "estimate_generation"
          ? {
              model_id: pgModelId,
              duration_seconds: pgDuration,
              resolution: pgResolution,
              aspect_ratio: "16:9",
              audio: pgAudio,
            }
          : playgroundTool === "get_model"
            ? { model_id: pgModelId }
            : { media_type: pgMediaType };

      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: {
            name: playgroundTool,
            arguments: args,
          },
        }),
      });
      const data = await res.json();
      const text = data?.result?.content?.[0]?.text || JSON.stringify(data, null, 2);
      setPgOutput(text);
    } catch (e: unknown) {
      setPgOutput(e instanceof Error ? e.message : "Failed to call /api/mcp");
    } finally {
      setPgLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 space-y-16">
      {/* =====================================================================
          1. HERO SECTION: MCP SERVER & AGENT SKILL
         ===================================================================== */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4FF00]/30 bg-[#D4FF00]/10 px-3.5 py-1 text-xs font-semibold text-[#D4FF00]">
            <Terminal className="h-3.5 w-3.5" />
            MCP Server &amp; REST API for Autonomous Agents
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-[1.1]">
            Give your coding agent 73+ video, image &amp; audio models
          </h1>
          <p className="mt-4 text-base text-zinc-300 leading-relaxed">
            Connect <strong className="text-white">Claude Code</strong>,{" "}
            <strong className="text-white">Codex</strong>,{" "}
            <strong className="text-white">Cursor</strong>, or custom workflows to ReelMux via the
            Model Context Protocol (<code className="text-[#D4FF00]">/api/mcp</code>) or REST API.
            Agents can browse models and estimate exact credit costs with zero authentication, then
            generate assets using a scoped API key.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="/agents.md"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#D4FF00] px-5 py-3 text-sm font-bold text-black hover:bg-[#e2ff3e] transition-colors"
            >
              <FileCode2 className="h-4 w-4" />
              Read /agents.md Spec
            </a>
            <a
              href="/api/mcp"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <Cpu className="h-4 w-4 text-cyan-400" />
              Inspect Live /api/mcp Schema
            </a>
          </div>
        </div>

        {/* Right 5 Cols: 4-Step Recommended Agent Workflow Card */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0C0E14] p-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#D4FF00]">
            Recommended Agent Workflow
          </div>
          {[
            {
              step: "01",
              title: "Discover models (No key needed)",
              desc: "Call list_models or get_model to inspect capabilities, resolutions, and audio support.",
            },
            {
              step: "02",
              title: "Estimate exact cost upfront",
              desc: "Call estimate_generation to quote the exact credit price before running any job.",
            },
            {
              step: "03",
              title: "Create generation with scoped key",
              desc: "Call create_generation using a Bearer rmx_live_... token with generation:create scope.",
            },
            {
              step: "04",
              title: "Poll & auto-refund protection",
              desc: "Poll get_generation until succeeded. Failed jobs automatically refund 100% of held credits.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-3.5 rounded-xl border border-white/5 bg-white/[0.02] p-3.5"
            >
              <span className="rounded-lg bg-[#D4FF00]/15 px-2 py-1 font-mono text-xs font-bold text-[#D4FF00]">
                {item.step}
              </span>
              <div>
                <div className="text-sm font-bold text-white">{item.title}</div>
                <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================================
          2. ONE-COMMAND MCP INSTALLATION TABS (Claude Code / Codex / Cursor / JSON)
         ===================================================================== */}
      <div className="rounded-2xl border border-white/10 bg-[#0C0E14] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
          <div>
            <h2 className="text-2xl font-extrabold text-white">1. Connect MCP Server</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Add <code className="text-zinc-200">https://reelmux.com/api/mcp</code> to your agent
              in one command.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-black/40 p-1">
            {(Object.keys(INSTALL_SNIPPETS) as InstallTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  activeTab === tab
                    ? "bg-[#D4FF00] text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {INSTALL_SNIPPETS[tab].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>{INSTALL_SNIPPETS[activeTab].title}</span>
            <button
              type="button"
              onClick={() => copyText(INSTALL_SNIPPETS[activeTab].code, `tab-${activeTab}`)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white hover:bg-white/10"
            >
              {copiedKey === `tab-${activeTab}` ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#D4FF00]" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy snippet
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/75 p-4 font-mono text-xs sm:text-sm text-[#D4FF00] leading-relaxed">
            {INSTALL_SNIPPETS[activeTab].code}
          </pre>
        </div>
      </div>

      {/* =====================================================================
          3. SCOPED API KEY GENERATOR & MANAGER
         ===================================================================== */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0C0E14] p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4FF00]">
            <Key className="h-4 w-4" />
            Scoped API Keys
          </div>
          <h2 className="mt-2 text-xl font-bold text-white">2. Create an Agent API Key</h2>
          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
            Read-only discovery (<code className="text-zinc-300">list_models</code>,{" "}
            <code className="text-zinc-300">get_model</code>,{" "}
            <code className="text-zinc-300">estimate_generation</code>) works without an API key.
            Create a scoped key to allow agents to run jobs from your credit balance.
          </p>

          <form onSubmit={handleCreateApiKey} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Key Label
              </label>
              <input
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g. claude-code-laptop"
                className="w-full rounded-xl border border-white/15 bg-[#131722] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#D4FF00] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Permissions (Scopes)
              </label>
              <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-xs cursor-pointer">
                <div>
                  <div className="font-mono font-bold text-white">generation:create</div>
                  <div className="text-[11px] text-zinc-400">
                    Allow starting video, image &amp; audio jobs
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={scopeCreate}
                  onChange={(e) => setScopeCreate(e.target.checked)}
                  className="h-4 w-4 accent-[#D4FF00]"
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-xs cursor-pointer">
                <div>
                  <div className="font-mono font-bold text-white">generation:read</div>
                  <div className="text-[11px] text-zinc-400">
                    Allow polling job status and downloading outputs
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={scopeRead}
                  onChange={(e) => setScopeRead(e.target.checked)}
                  className="h-4 w-4 accent-[#D4FF00]"
                />
              </label>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4FF00] py-3 text-sm font-bold text-black hover:bg-[#e2ff3e] transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Generate API Key
            </button>
          </form>
        </div>

        {/* Active API Keys List */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0C0E14] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Your Active Agent Keys</h3>
              <span className="text-xs text-zinc-400">
                Header: <code className="text-zinc-200">Authorization: Bearer rmx_live_...</code>
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {apiKeys.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.name}</span>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        {item.createdAt}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-zinc-400">{item.maskedKey}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.scopes.map((sc) => (
                        <span
                          key={sc}
                          className="rounded bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-[#D4FF00]"
                        >
                          {sc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyText(item.fullKey, item.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                    >
                      {copiedKey === item.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#D4FF00]" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy Key
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setApiKeys((prev) => prev.filter((k) => k.id !== item.id))}
                      aria-label="Revoke key"
                      className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-zinc-400 flex items-center justify-between">
            <span>All agent keys share your unified workspace credit balance and ledger.</span>
            <Link href="/dashboard" className="font-semibold text-[#D4FF00] hover:underline">
              View Ledger →
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================================
          4. COMPLETE 6 MCP TOOLS REFERENCE + INTERACTIVE LIVE PLAYGROUND
         ===================================================================== */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left 7 Cols: 6 MCP Tools Reference Cards */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-2xl font-extrabold text-white">3. MCP Tools &amp; Endpoints</h2>
          <p className="text-sm text-zinc-400">
            All 6 tools are exposed over JSON-RPC 2.0 at{" "}
            <code className="text-zinc-200">POST /api/mcp</code>.
          </p>

          <div className="space-y-3">
            {MCP_TOOLS_DOCS.map((tool) => (
              <div
                key={tool.name}
                className="rounded-2xl border border-white/10 bg-[#0C0E14] p-5 hover:border-white/20 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-base font-bold text-[#D4FF00]">
                    {tool.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                      scope: {tool.scope}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        tool.scope === "public"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-cyan-500/20 text-cyan-300"
                      }`}
                    >
                      {tool.auth}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {tool.desc}
                </p>
                <div className="mt-3 space-y-1 rounded-xl bg-black/50 p-3 font-mono text-[11px] text-zinc-400">
                  <div>
                    <span className="text-zinc-500">Params: </span>
                    <span className="text-zinc-200">{tool.params}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Returns: </span>
                    <span className="text-zinc-300">{tool.returns}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Interactive MCP Tool Tester */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-[#D4FF00]/30 bg-[#0C0E14] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D4FF00]">
                <Sparkles className="h-4 w-4" />
                Live MCP Playground
              </span>
              <span className="font-mono text-[11px] text-zinc-400">POST /api/mcp</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Select MCP Tool
              </label>
              <select
                value={playgroundTool}
                onChange={(e) =>
                  setPlaygroundTool(
                    e.target.value as "estimate_generation" | "list_models" | "get_model"
                  )
                }
                className="w-full rounded-xl border border-white/15 bg-[#131722] px-3 py-2 text-xs font-mono text-white"
              >
                <option value="estimate_generation">estimate_generation (No key needed)</option>
                <option value="get_model">get_model (No key needed)</option>
                <option value="list_models">list_models (No key needed)</option>
              </select>
            </div>

            {playgroundTool !== "list_models" ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">model_id</label>
                  <select
                    value={pgModelId}
                    onChange={(e) => setPgModelId(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#131722] px-3 py-2 text-xs text-white"
                  >
                    {MODELS_CATALOG.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id} ({m.name})
                      </option>
                    ))}
                  </select>
                </div>

                {playgroundTool === "estimate_generation" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">resolution</label>
                      <select
                        value={pgResolution}
                        onChange={(e) => setPgResolution(e.target.value)}
                        className="w-full rounded-lg border border-white/15 bg-[#131722] px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="720p">720p</option>
                        <option value="1080p">1080p</option>
                        <option value="2K">2K</option>
                        <option value="4K">4K</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        duration_seconds
                      </label>
                      <select
                        value={pgDuration}
                        onChange={(e) => setPgDuration(Number(e.target.value))}
                        className="w-full rounded-lg border border-white/15 bg-[#131722] px-2.5 py-1.5 text-xs text-white"
                      >
                        {[4, 5, 8, 10, 15].map((s) => (
                          <option key={s} value={s}>
                            {s}s
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs text-zinc-400 mb-1">media_type</label>
                <select
                  value={pgMediaType}
                  onChange={(e) => setPgMediaType(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#131722] px-3 py-2 text-xs text-white"
                >
                  <option value="video">video</option>
                  <option value="image">image</option>
                  <option value="audio">audio</option>
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={runMcpPlayground}
              disabled={pgLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4FF00] py-2.5 text-xs font-extrabold text-black hover:bg-[#e2ff3e] transition-colors cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              {pgLoading ? "Calling /api/mcp..." : `Execute ${playgroundTool}()`}
            </button>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                JSON-RPC Response
              </div>
              <pre className="max-h-72 overflow-auto rounded-xl border border-white/10 bg-black/80 p-3.5 font-mono text-[11px] text-emerald-300 leading-relaxed">
                {pgOutput || '// Click "Execute" above to test the live MCP server endpoint'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
