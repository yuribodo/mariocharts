/**
 * Site configuration constants
 */
export const SITE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://mario-charts.dev",
  name: "Mario Charts",
  description:
    "Modern React component library focused on charts and dashboards with beautiful visuals out-of-the-box.",
  github: "https://github.com/yuribodo/mariocharts",
} as const;

/**
 * Last content update date for sitemap
 * Update this when making significant content changes
 */
export const LAST_CONTENT_UPDATE = new Date("2025-01-25");
