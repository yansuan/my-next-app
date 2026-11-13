import { NextRequest, NextResponse } from "next/server";
import { MODELS_CATALOG, calculateJobCredits } from "@/lib/catalog/models";
import { createYirJob, getYirJobStatus } from "@/lib/yir/client";

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
      "Poll the status and output media URLs of a generation job. Requires scope generation:read.",
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
    description: "List recent generation jobs for the authenticated account.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", default: 10 },
        cursor: { type: "string" },
      },
    },
  },
];

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
            content: [
              {
                type: "text",
                text: JSON.stringify(model, null, 2),
              },
            ],
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
                    policy: "Credits are held during generation and auto-refunded if the job fails.",
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
        const model =
          MODELS_CATALOG.find((m) => m.id === args.model_id) ?? MODELS_CATALOG[0];
        const estimatedCredits = calculateJobCredits({
          modelId: model.id,
          resolution: args.resolution || "1080p",
          durationSec: Number(args.duration) || 5,
          withAudio: Boolean(args.native_audio ?? true),
        });
        const job = await createYirJob({
          model: model.yirModelId,
          input: {
            type: args.image_url ? "image" : "text",
            prompt: String(args.prompt || "Cinematic scene"),
            image_url: args.image_url,
          },
          parameters: {
            resolution: args.resolution || "1080p",
            aspect_ratio: args.aspect_ratio || "16:9",
            duration: Number(args.duration) || 5,
            with_audio: Boolean(args.native_audio ?? true),
          },
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
                    generation_id: job.id,
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
        const status = await getYirJobStatus(
          String(args.generation_id || "yir_sim_0"),
          args.model_id
        );
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(status, null, 2),
              },
            ],
          },
        });
      }

      if (toolName === "list_generations") {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    generations: [],
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
