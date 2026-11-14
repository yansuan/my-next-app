import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { MODELS_CATALOG, calculateJobCredits } from "@/lib/catalog/models";
import { createYirJob, getYirJobStatus } from "@/lib/yir/client";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const MCP_TOOLS_SCHEMA = [
  {
    name: "list_models",
    description:
      "List available video, image, and audio AI models on ReelMux with capabilities and starting credit costs. No API key required.",
    inputSchema: {
      type: "object",
      properties: {
        media_type: {
          type: "string",
          enum: ["video", "image", "audio"],
          description: "Filter by media category",
        },
        family: {
          type: "string",
          description: "Filter by model family or provider (e.g. kling, seedance, veo, flux)",
        },
        search: {
          type: "string",
          description: "Free-text search query",
        },
      },
    },
  },
  {
    name: "get_model",
    description:
      "Get full specifications, supported resolutions, aspect ratios, duration limits, and pricing formula for a specific model. No API key required.",
    inputSchema: {
      type: "object",
      required: ["model_id"],
      properties: {
        model_id: {
          type: "string",
          description: "Model identifier (e.g. kling-4.0, seedance-2.5, veo-3.1, gpt-image-2.6)",
        },
      },
    },
  },
  {
    name: "estimate_generation",
    description:
      "Calculate the exact credit cost for a generation before running it. No API key required.",
    inputSchema: {
      type: "object",
      required: ["model_id"],
      properties: {
        model_id: { type: "string" },
        duration_seconds: { type: "number", default: 5 },
        resolution: { type: "string", default: "1080p" },
        aspect_ratio: { type: "string", default: "16:9" },
        audio: { type: "boolean", default: true },
        image_count: { type: "number", default: 1 },
      },
    },
  },
  {
    name: "create_generation",
    description:
      "Start an asynchronous video, image, or audio generation job. Requires Authorization: Bearer rmx_... with scope generation:create.",
    inputSchema: {
      type: "object",
      required: ["model_id", "prompt"],
      properties: {
        model_id: { type: "string" },
        prompt: { type: "string" },
        mode: {
          type: "string",
          enum: [
            "text-to-video",
            "image-to-video",
            "frames-to-video",
            "reference-to-video",
            "text-to-image",
            "image-to-image",
            "ai-music",
            "text-to-speech",
          ],
          default: "text-to-video",
        },
        image_url: { type: "string" },
        duration: { type: "number", default: 5 },
        resolution: { type: "string", default: "1080p" },
        aspect_ratio: { type: "string", default: "16:9" },
        native_audio: { type: "boolean", default: true },
      },
    },
  },
  {
    name: "get_generation",
    description:
      "Poll the status and output media URLs of a generation job. Requires Authorization: Bearer rmx_... with scope generation:read.",
    inputSchema: {
      type: "object",
      required: ["generation_id"],
      properties: {
        generation_id: { type: "string" },
        model_id: { type: "string" },
      },
    },
  },
  {
    name: "list_generations",
    description:
      "List recent generation jobs for the authenticated account. Requires Authorization: Bearer rmx_... with scope generation:read.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", default: 10 },
      },
    },
  },
];

async function authenticateMcpBearer(req: NextRequest, requiredScope: string) {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return {
      ok: false as const,
      status: 401,
      error: "Missing Authorization: Bearer rmx_... header.",
    };
  }

  const rawToken = authHeader.slice(7).trim();
  if (!rawToken.startsWith("rmx_") || rawToken.length < 16) {
    return {
      ok: false as const,
      status: 401,
      error: "Invalid Bearer API key format.",
    };
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return {
      ok: false as const,
      status: 503,
      error: "Server authentication database is not configured.",
    };
  }

  const keyHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const { data: keyRow, error } = await supabase
    .from("api_keys")
    .select("id, user_id, scopes, revoked_at")
    .eq("key_hash", keyHash)
    .is("revoked_at", null)
    .maybeSingle();

  if (error || !keyRow) {
    return {
      ok: false as const,
      status: 401,
      error: "Invalid or revoked API key.",
    };
  }

  const scopes: string[] = Array.isArray(keyRow.scopes) ? keyRow.scopes : [];
  if (!scopes.includes(requiredScope) && !scopes.includes("*")) {
    return {
      ok: false as const,
      status: 403,
      error: `API key missing required scope: ${requiredScope}`,
    };
  }

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyRow.id);

  return {
    ok: true as const,
    supabase,
    userId: String(keyRow.user_id),
  };
}

export async function GET() {
  return NextResponse.json({
    protocol: "mcp",
    server: "reelmux-mcp-server",
    version: "1.0.0",
    endpoint: "https://reelmux.com/api/mcp",
    skill_url: "https://reelmux.com/agents.md",
    tools: MCP_TOOLS_SCHEMA,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id = 1, method, params = {} } = body;

    if (method === "initialize") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "reelmux-mcp",
            version: "1.0.0",
          },
          capabilities: {
            tools: {},
          },
        },
      });
    }

    if (method === "tools/list") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          tools: MCP_TOOLS_SCHEMA,
        },
      });
    }

    if (method === "tools/call") {
      const toolName = params.name;
      const args = params.arguments || {};

      if (toolName === "list_models") {
        let list = MODELS_CATALOG;
        if (args.media_type) {
          list = list.filter((m) => m.category === args.media_type);
        }
        if (args.family) {
          const fam = String(args.family).toLowerCase();
          list = list.filter(
            (m) =>
              m.id.toLowerCase().includes(fam) ||
              m.name.toLowerCase().includes(fam) ||
              m.provider.toLowerCase().includes(fam)
          );
        }
        if (args.search) {
          const q = String(args.search).toLowerCase();
          list = list.filter(
            (m) =>
              m.name.toLowerCase().includes(q) ||
              m.tagline.toLowerCase().includes(q) ||
              m.provider.toLowerCase().includes(q)
          );
        }
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  list.map((m) => ({
                    model_id: m.id,
                    name: m.name,
                    maker: m.provider,
                    media_type: m.category,
                    starting_credits: m.baseCredits,
                    unit: m.unitLabel,
                    resolutions: m.resolutions,
                    aspect_ratios: m.aspectRatios,
                    max_duration_seconds: m.maxDurationSec ?? null,
                    supports_native_audio: m.supportsNativeAudio ?? false,
                  })),
                  null,
                  2
                ),
              },
            ],
          },
        });
      }

      if (toolName === "get_model") {
        const model = MODELS_CATALOG.find((m) => m.id === args.model_id);
        if (!model) {
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            error: { code: -32602, message: `Model not found: ${args.model_id}` },
          });
        }
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(model, null, 2) }],
          },
        });
      }

      if (toolName === "estimate_generation") {
        const model =
          MODELS_CATALOG.find((m) => m.id === args.model_id) ?? MODELS_CATALOG[0];
        const estimatedCredits = calculateJobCredits({
          modelId: model.id,
          resolution: args.resolution || "1080p",
          durationSec: Number(args.duration_seconds) || 5,
          withAudio: Boolean(args.audio ?? true),
          count: Number(args.image_count) || 1,
        });
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    model_id: model.id,
                    model_name: model.name,
                    estimated_credits: estimatedCredits,
                    parameters: {
                      duration_seconds: Number(args.duration_seconds) || 5,
                      resolution: args.resolution || "1080p",
                      aspect_ratio: args.aspect_ratio || "16:9",
                      audio: Boolean(args.audio ?? true),
                    },
                    policy:
                      "Credits are held during generation and auto-refunded if the job fails.",
                  },
                  null,
                  2
                ),
              },
            ],
          },
        });
      }

      if (toolName === "create_generation") {
        const auth = await authenticateMcpBearer(req, "generation:create");
        if (!auth.ok) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              error: { code: -32001, message: auth.error },
            },
            { status: auth.status }
          );
        }

        const promptText = String(args.prompt || "").trim();
        if (!promptText) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              error: { code: -32602, message: "prompt is required" },
            },
            { status: 400 }
          );
        }

        const model =
          MODELS_CATALOG.find((m) => m.id === args.model_id) ?? MODELS_CATALOG[0];
        const safeDuration = Math.max(1, Math.min(60, Number(args.duration) || 5));
        const estimatedCredits = calculateJobCredits({
          modelId: model.id,
          resolution: args.resolution || "1080p",
          durationSec: safeDuration,
          withAudio: Boolean(args.native_audio ?? true),
        });

        const { data: supabaseJobUuid, error: rpcErr } = await auth.supabase.rpc(
          "reserve_credits_for_job",
          {
            p_user_id: auth.userId,
            p_tool_slug: String(args.mode || "text-to-video"),
            p_category: model.category,
            p_model_id: model.id,
            p_prompt: promptText,
            p_parameters: {
              resolution: args.resolution || "1080p",
              aspectRatio: args.aspect_ratio || "16:9",
              durationSec: safeDuration,
              withAudio: Boolean(args.native_audio ?? true),
            },
            p_credits_cost: estimatedCredits,
          }
        );

        if (rpcErr || !supabaseJobUuid) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              error: {
                code: -32002,
                message: rpcErr?.message || "Insufficient credits.",
              },
            },
            { status: 402 }
          );
        }

        let job;
        try {
          job = await createYirJob({
            model: model.yirModelId,
            input: {
              type: args.image_url ? "image" : "text",
              prompt: promptText,
              image_url: args.image_url,
            },
            parameters: {
              resolution: args.resolution || "1080p",
              aspect_ratio: args.aspect_ratio || "16:9",
              duration: safeDuration,
              with_audio: Boolean(args.native_audio ?? true),
            },
          });
        } catch (dispatchErr: unknown) {
          await auth.supabase.rpc("finalize_job_credits", {
            p_job_id: supabaseJobUuid,
            p_final_status: "failed",
            p_source_url: null,
            p_r2_url: null,
            p_error:
              dispatchErr instanceof Error
                ? dispatchErr.message
                : "MCP job dispatch failed",
          });
          throw dispatchErr;
        }

        await auth.supabase
          .from("generation_jobs")
          .update({
            yir_job_id: job.id,
            status: job.status === "processing" ? "processing" : "queued",
            updated_at: new Date().toISOString(),
          })
          .eq("id", supabaseJobUuid);

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    generation_id: job.id,
                    job_uuid: supabaseJobUuid,
                    model_id: model.id,
                    status: job.status,
                    estimated_credits: estimatedCredits,
                  },
                  null,
                  2
                ),
              },
            ],
          },
        });
      }

      if (toolName === "get_generation") {
        const auth = await authenticateMcpBearer(req, "generation:read");
        if (!auth.ok) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              error: { code: -32001, message: auth.error },
            },
            { status: auth.status }
          );
        }

        const genId = String(args.generation_id || "");
        const { data: jobRow } = await auth.supabase
          .from("generation_jobs")
          .select("id, yir_job_id, model_id, credit_settled")
          .eq("user_id", auth.userId)
          .or(`yir_job_id.eq.${genId},id.eq.${genId}`)
          .maybeSingle();

        if (!jobRow) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              error: { code: -32004, message: "Generation job not found." },
            },
            { status: 404 }
          );
        }

        const status = await getYirJobStatus(
          jobRow.yir_job_id || genId,
          args.model_id || jobRow.model_id
        );

        if (
          !jobRow.credit_settled &&
          (status.status === "succeeded" ||
            status.status === "failed" ||
            status.status === "canceled")
        ) {
          await auth.supabase.rpc("finalize_job_credits", {
            p_job_id: jobRow.id,
            p_final_status: status.status,
            p_source_url: status.output?.media_url || null,
            p_r2_url: null,
            p_error: status.error?.message || null,
          });
        }

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
          },
        });
      }

      if (toolName === "list_generations") {
        const auth = await authenticateMcpBearer(req, "generation:read");
        if (!auth.ok) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              error: { code: -32001, message: auth.error },
            },
            { status: auth.status }
          );
        }

        const limit = Math.max(1, Math.min(50, Number(args.limit) || 10));
        const { data: rows } = await auth.supabase
          .from("generation_jobs")
          .select(
            "id, yir_job_id, tool_slug, category, model_id, prompt, credits_cost, status, source_output_url, created_at"
          )
          .eq("user_id", auth.userId)
          .order("created_at", { ascending: false })
          .limit(limit);

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    generations: rows || [],
                    next_cursor: null,
                  },
                  null,
                  2
                ),
              },
            ],
          },
        });
      }

      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Unknown MCP tool: ${toolName}` },
      });
    }

    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Unsupported JSON-RPC method: ${method}` },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: err instanceof Error ? err.message : "Invalid JSON-RPC payload",
        },
      },
      { status: 400 }
    );
  }
}
