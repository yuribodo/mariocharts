import type { MetadataRoute } from "next";
import { SITE_CONFIG, LAST_CONTENT_UPDATE } from "@/lib/constants";
import { REGISTRY_CHARTS } from "@/registry/generated/charts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/docs/installation`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs/components`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/examples`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Derived from registry/manifest.js so a new chart cannot ship without
  // appearing in the sitemap — the drift that left six charts unindexed.
  const componentRoutes: MetadataRoute.Sitemap = REGISTRY_CHARTS.map((chart) => ({
    url: `${baseUrl}${chart.docsPath}`,
    lastModified: LAST_CONTENT_UPDATE,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...componentRoutes];
}
