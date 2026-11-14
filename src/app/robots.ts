import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/tools/", "/models", "/pricing", "/ai-effects", "/for-agents", "/compare/", "/blog", "/agents.md"],
        disallow: ["/admin", "/admin/", "/api/admin"],
      },
    ],
    sitemap: "https://reelmux.com/sitemap.xml",
    host: "https://reelmux.com",
  };
}
