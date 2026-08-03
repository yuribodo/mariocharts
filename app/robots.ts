import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

// Crawlers that feed AI answer engines and coding assistants. The wildcard rule
// below already permits them, but naming them explicitly is a positive signal
// and stops a future `disallow` on `*` from silently cutting off AI retrieval.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "meta-externalagent",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/private/", "/md/"],
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: [
          "/",
          "/llms.txt",
          "/llms-full.txt",
          "/r/",
          "/index.md",
          "/*.md",
          "/docs.md",
          "/docs/",
          "/examples.md",
          "/examples/",
        ],
        disallow: ["/api/", "/_next/", "/private/", "/md/"],
      })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
