import { MODELS_CATALOG } from "@/lib/catalog/models";

export interface YirJobRequest {
  model: string; // e.g. "bytedance/seedance-2.5"
  input: {
    type: "text" | "image" | "frames" | "reference";
    prompt: string;
    image_url?: string;
    first_frame_url?: string;
    last_frame_url?: string;
    reference_urls?: string[];
  };
  parameters?: {
    resolution?: string;
    aspect_ratio?: string;
    duration?: number;
    with_audio?: boolean;
    n?: number;
  };
}

export interface YirJobResponse {
  id: string;
  object: "job";
  status: "queued" | "processing" | "succeeded" | "failed" | "canceled";
  model: string;
  created_at: number;
  output?: {
    media_url: string;
    thumbnail_url?: string;
    duration_sec?: number;
    provider_routed?: string;
  } | null;
  error?: {
    code: string;
    message: string;
  } | null;
  urls: {
    get: string;
    cancel: string;
  };
  simulated?: boolean;
}

const YIR_BASE_URL = process.env.YIR_API_BASE_URL || "https://gateway.yir.ai/v1";

function isYirConfigured(): boolean {
  const key = process.env.YIR_API_KEY;
  return Boolean(key && key !== "yir_live_your_api_key_here" && key.trim().length > 8);
}

function createSimulatedJobResponse(model: string): YirJobResponse {
  const simId = `yir_sim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  return {
    id: simId,
    object: "job",
    status: "queued",
    model,
    created_at: Math.floor(Date.now() / 1000),
    output: null,
    error: null,
    urls: {
      get: `/v1/jobs/${simId}`,
      cancel: `/v1/jobs/${simId}/cancel`,
    },
    simulated: true,
  };
}

/**
 * Submit an asynchronous generation job to Yir.ai Standard Async AIGC API:
 * - Video: POST /v1/videos/generations
 * - Image: POST /v1/images/generations
 * - Audio: POST /v1/audio/generations
 */
export async function createYirJob(payload: YirJobRequest): Promise<YirJobResponse> {
  if (isYirConfigured()) {
    const spec = MODELS_CATALOG.find(
      (m) => m.yirModelId === payload.model || m.id === payload.model
    );
    const category = spec?.category || "video";

    const endpointPath =
      category === "image"
        ? "/images/generations"
        : category === "audio"
          ? "/audio/generations"
          : "/videos/generations";

    let normalizedRes = payload.parameters?.resolution;
    if (payload.model === "minimax/minimax-h3" && normalizedRes === "720p") {
      normalizedRes = "768P";
    }

    const requestBody: Record<string, unknown> = {
      model: spec?.yirModelId || payload.model,
      input: {
        type: payload.input.type === "frames" ? "image" : payload.input.type,
        prompt: payload.input.prompt,
        ...(payload.input.image_url ? { image_url: payload.input.image_url } : {}),
        ...(payload.input.first_frame_url
          ? { first_frame_url: payload.input.first_frame_url }
          : {}),
        ...(payload.input.last_frame_url
          ? { last_frame_url: payload.input.last_frame_url }
          : {}),
        ...(payload.input.reference_urls?.length
          ? { reference_urls: payload.input.reference_urls }
          : {}),
      },
      parameters:
        category === "image"
          ? {
              resolution: normalizedRes || "1K",
              aspect_ratio: payload.parameters?.aspect_ratio || "1:1",
              n: payload.parameters?.n ?? 1,
            }
          : category === "audio"
            ? {
                n: payload.parameters?.n ?? 1,
              }
            : {
                duration: payload.parameters?.duration || 6,
                resolution: normalizedRes || "768P",
                aspect_ratio: payload.parameters?.aspect_ratio || "16:9",
                ...(spec?.supportsNativeAudio
                  ? { generate_audio: payload.parameters?.with_audio ?? true }
                  : {}),
                n: payload.parameters?.n ?? 1,
              },
    };

    try {
      const res = await fetch(`${YIR_BASE_URL}${endpointPath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.YIR_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        const raw = await res.json();
        const jobId = raw.id || raw.job_id;
        if (jobId) {
          return {
            id: jobId,
            object: "job",
            status: normalizeYirStatus(raw.status),
            model: raw.model || payload.model,
            created_at:
              typeof raw.created_at === "number"
                ? raw.created_at
                : Math.floor(Date.now() / 1000),
            output: extractYirOutput(raw, spec?.provider),
            error: raw.error || null,
            urls: {
              get: `/v1/jobs/${jobId}`,
              cancel: `/v1/jobs/${jobId}/cancel`,
            },
            simulated: false,
          };
        }
      }
    } catch {
      // Fall back to deterministic studio preview if upstream network fails
    }
  }

  return createSimulatedJobResponse(payload.model);
}

function normalizeYirStatus(
  status?: string
): "queued" | "processing" | "succeeded" | "failed" | "canceled" {
  switch ((status || "").toLowerCase()) {
    case "succeeded":
    case "completed":
    case "done":
      return "succeeded";
    case "processing":
    case "running":
    case "in_progress":
    case "starting":
      return "processing";
    case "failed":
    case "error":
      return "failed";
    case "canceled":
    case "cancelled":
      return "canceled";
    default:
      return "queued";
  }
}

function extractYirOutput(
  raw: Record<string, any>,
  fallbackProvider?: string
): YirJobResponse["output"] {
  if (raw.output?.media_url) {
    return raw.output;
  }
  const firstFile = raw.result?.files?.[0] || raw.files?.[0] || raw.data?.[0];
  if (firstFile?.url) {
    return {
      media_url: firstFile.url,
      thumbnail_url: firstFile.thumbnail_url || firstFile.url,
      duration_sec: firstFile.duration || undefined,
      provider_routed: raw.channel?.provider_label || fallbackProvider || "ReelMux Cloud",
    };
  }
  return null;
}

/**
 * Retrieve job status from Yir.ai (GET /v1/jobs/{job_id})
 */
export async function getYirJobStatus(
  jobId: string,
  modelId?: string,
  simulateFailure?: boolean
): Promise<YirJobResponse> {
  const spec =
    MODELS_CATALOG.find((m) => m.id === modelId || m.yirModelId === modelId) ??
    MODELS_CATALOG[0];

  if (isYirConfigured() && !jobId.startsWith("yir_sim_")) {
    const res = await fetch(`${YIR_BASE_URL}/jobs/${encodeURIComponent(jobId)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.YIR_API_KEY}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Generation Status Error (${res.status}): ${errText}`);
    }

    const raw = await res.json();
    return {
      id: raw.id || jobId,
      object: "job",
      status: normalizeYirStatus(raw.status),
      model: raw.model || spec.yirModelId,
      created_at:
        typeof raw.created_at === "number"
          ? raw.created_at
          : Math.floor(Date.now() / 1000),
      output: extractYirOutput(raw, spec.provider),
      error: raw.error
        ? {
            code: raw.error.code || "GENERATION_FAILED",
            message:
              raw.error.message ||
              "Upstream generation node failed. ReelMux Credit Protection has automatically refunded 100% of your reserved credits.",
          }
        : null,
      urls: {
        get: `/v1/jobs/${jobId}`,
        cancel: `/v1/jobs/${jobId}/cancel`,
      },
      simulated: false,
    };
  }

  // Simulated lifecycle progression based on timestamp embedded in yir_sim_<timestamp>_<rand>
  const parts = jobId.split("_");
  const createdMs = Number(parts[2]) || Date.now();
  const elapsedSec = (Date.now() - createdMs) / 1000;

  if (simulateFailure && elapsedSec >= 2.5) {
    return {
      id: jobId,
      object: "job",
      status: "failed",
      model: spec.yirModelId,
      created_at: Math.floor(createdMs / 1000),
      output: null,
      error: {
        code: "UPSTREAM_PROVIDER_TIMEOUT",
        message:
          "Upstream model node timed out. ReelMux Credit Protection has automatically refunded 100% of your reserved credits.",
      },
      urls: {
        get: `/v1/jobs/${jobId}`,
        cancel: `/v1/jobs/${jobId}/cancel`,
      },
      simulated: true,
    };
  }

  if (elapsedSec < 1.8) {
    return {
      id: jobId,
      object: "job",
      status: "queued",
      model: spec.yirModelId,
      created_at: Math.floor(createdMs / 1000),
      output: null,
      error: null,
      urls: {
        get: `/v1/jobs/${jobId}`,
        cancel: `/v1/jobs/${jobId}/cancel`,
      },
      simulated: true,
    };
  }

  if (elapsedSec < 4.2) {
    return {
      id: jobId,
      object: "job",
      status: "processing",
      model: spec.yirModelId,
      created_at: Math.floor(createdMs / 1000),
      output: null,
      error: null,
      urls: {
        get: `/v1/jobs/${jobId}`,
        cancel: `/v1/jobs/${jobId}/cancel`,
      },
      simulated: true,
    };
  }

  const sampleMediaUrl =
    spec.category === "image"
      ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85"
      : "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=85";

  return {
    id: jobId,
    object: "job",
    status: "succeeded",
    model: spec.yirModelId,
    created_at: Math.floor(createdMs / 1000),
    output: {
      media_url: sampleMediaUrl,
      thumbnail_url: sampleMediaUrl,
      duration_sec: spec.category === "video" ? 5 : undefined,
      provider_routed: spec.provider,
    },
    error: null,
    urls: {
      get: `/v1/jobs/${jobId}`,
      cancel: `/v1/jobs/${jobId}/cancel`,
    },
    simulated: true,
  };
}

/**
 * Cancel an active job (POST /v1/jobs/{job_id}/cancel)
 */
export async function cancelYirJob(jobId: Promise<string> | string): Promise<{ canceled: boolean }> {
  const resolvedId = await jobId;
  if (isYirConfigured() && !resolvedId.startsWith("yir_sim_")) {
    const res = await fetch(`${YIR_BASE_URL}/jobs/${encodeURIComponent(resolvedId)}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.YIR_API_KEY}`,
      },
    });
    return { canceled: res.ok };
  }
  return { canceled: true };
}
