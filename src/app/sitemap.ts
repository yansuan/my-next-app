import type { MetadataRoute } from "next";
import { TOOLS_CATALOG, MODELS_CATALOG } from "@/lib/catalog/models";

const COMPARE_SLUGS = [
  "seedance-2.5-vs-kling-4.0",
  "seedance-2-5-vs-kling-4",
  "veo-3.1-vs-seedance-2.5",
  "minimax-h3-vs-wan-3.0",
  "gpt-image-2.6-vs-flux-2-max",
  "nano-banana-pro-vs-seedream-5.0",
  "grok-imagine-vs-hailuo-2.3",
  "mixvio-ai-alternatives",
  "framemux-vs-reelmux",
];

const LEGAL_SLUGS = ["terms", "privacy", "refund", "content-policy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://reelmux.com";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/models`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ai-effects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/for-agents`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const toolRoutes: MetadataRoute.Sitemap = TOOLS_CATALOG.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const modelRoutes: MetadataRoute.Sitemap = MODELS_CATALOG.map((model) => ({
    url: `${baseUrl}/models/${model.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const compareRoutes: MetadataRoute.Sitemap = COMPARE_SLUGS.map((slug) => ({
    url: `${baseUrl}/compare/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const legalRoutes: MetadataRoute.Sitemap = LEGAL_SLUGS.map((slug) => ({
    url: `${baseUrl}/legal/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [
    ...staticRoutes,
    ...toolRoutes,
    ...modelRoutes,
    ...compareRoutes,
    ...legalRoutes,
  ];
}
