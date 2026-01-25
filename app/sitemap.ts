import type { MetadataRoute } from "next";
import { SITE_CONFIG, LAST_CONTENT_UPDATE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;

  // Static pages with their priorities and change frequencies
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
  ];

  // Component documentation pages
  const componentPages = [
    "bar-chart",
    "line-chart",
    "pie-chart",
    "radar-chart",
    "scatter-plot",
    "stacked-bar-chart",
  ];

  const componentRoutes: MetadataRoute.Sitemap = componentPages.map(
    (component) => ({
      url: `${baseUrl}/docs/components/${component}`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })
  );

  return [...staticPages, ...componentRoutes];
}
