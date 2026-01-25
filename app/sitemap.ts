import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mario-charts.dev";

  // Static pages with their priorities and change frequencies
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/docs/installation`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs/components`,
      lastModified: new Date(),
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
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })
  );

  return [...staticPages, ...componentRoutes];
}
