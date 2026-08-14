import type { MetadataRoute } from "next";

/**
 * Robots + AI crawlers. Sitemap at apex.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/api/", "/test"];
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      // Explicit allow for major AI crawlers (LLM SEO)
      { userAgent: "GPTBot", allow: "/", disallow },
      { userAgent: "ChatGPT-User", allow: "/", disallow },
      { userAgent: "ClaudeBot", allow: "/", disallow },
      { userAgent: "anthropic-ai", allow: "/", disallow },
      { userAgent: "PerplexityBot", allow: "/", disallow },
      { userAgent: "Google-Extended", allow: "/", disallow },
      { userAgent: "Googlebot", allow: "/", disallow },
      { userAgent: "Bingbot", allow: "/", disallow },
    ],
    sitemap: "https://tokenshit.com/sitemap.xml",
    host: "https://tokenshit.com",
  };
}
