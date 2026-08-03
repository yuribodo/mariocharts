import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { CHARTS } = require("./registry/manifest.js") as {
  CHARTS: Array<{ docsSlug: string }>;
};

const MARKDOWN_ACCEPT = {
  type: "header" as const,
  key: "accept",
  value: "(.*)text/markdown(.*)",
};

/** HTML paths that have a curated or generated markdown twin in public/. */
function markdownHtmlPaths(): string[] {
  return [
    "",
    "docs",
    "docs/installation",
    "docs/components",
    ...CHARTS.map((chart) => `docs/components/${chart.docsSlug}`),
    "examples",
    "examples/dashboards/sales",
    "examples/dashboards/analytics",
  ];
}

// Internal handler lives at app/md/ — not app/__md/, because App Router treats
// underscore-prefixed folders as private and excludes them from routing.
function markdownAcceptRewrites() {
  return markdownHtmlPaths().map((htmlPath) => {
    if (htmlPath === "") {
      return {
        source: "/",
        has: [MARKDOWN_ACCEPT],
        destination: "/md",
      };
    }
    return {
      source: `/${htmlPath}`,
      has: [MARKDOWN_ACCEPT],
      destination: `/md/${htmlPath}`,
    };
  });
}

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: "/:path*.md",
        headers: [
          { key: "Content-Type", value: "text/markdown; charset=utf-8" },
          { key: "Vary", value: "Accept" },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: markdownAcceptRewrites(),
    };
  },
};

export default nextConfig;
