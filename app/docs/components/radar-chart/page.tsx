import type { Metadata } from "next";
import { RadarChartContent } from "./radar-chart-content";
import { BreadcrumbSchema } from "../../../../components/seo/json-ld";

export const metadata: Metadata = {
  title: "Radar Chart",
  description: "Versatile radar chart (spider/web chart) component for React. Perfect for player stats, skills assessment, product comparisons. Multi-series support with TypeScript.",
  keywords: ["radar chart", "spider chart", "web chart", "react radar chart", "multi-dimensional chart"],
  alternates: { canonical: "/docs/components/radar-chart" },
  openGraph: {
    title: "Radar Chart Component | Mario Charts",
    description: "Versatile radar chart component for React. Perfect for multi-dimensional data visualization.",
    url: "https://mariocharts.com/docs/components/radar-chart",
    type: "article",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://mariocharts.com" },
  { name: "Docs", url: "https://mariocharts.com/docs" },
  { name: "Components", url: "https://mariocharts.com/docs/components" },
  { name: "Radar Chart", url: "https://mariocharts.com/docs/components/radar-chart" },
];

export default function RadarChartPage() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <RadarChartContent />
    </>
  );
}
