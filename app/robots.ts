import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

// Preserve the site's existing crawler policy. Search/retrieval agents and
// training crawlers govern different uses; listing either is not a ranking signal.
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
        disallow: ["/api/", "/private/", "/md/"],
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
        disallow: ["/api/", "/private/", "/md/"],
      })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
