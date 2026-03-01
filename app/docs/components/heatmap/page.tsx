import type { Metadata } from "next";
import { HeatmapContent } from "./heatmap-content";
import { BreadcrumbSchema } from "../../../../components/seo/json-ld";

export const metadata: Metadata = {
  title: "Heatmap Chart",
  description: "Production-ready heatmap chart component for React. Visualize NxM grids with color-coded intensity values. Supports multiple color schemes, tooltips, and animations. Copy-paste ready.",
  keywords: ["heatmap chart", "react heatmap", "heat map", "data visualization", "color matrix", "typescript chart"],
  alternates: { canonical: "/docs/components/heatmap" },
  openGraph: {
    title: "Heatmap Chart Component | Mario Charts",
    description: "Production-ready heatmap chart for React with configurable color schemes and animations.",
    url: "https://mariocharts.com/docs/components/heatmap",
    type: "article",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://mariocharts.com" },
  { name: "Docs", url: "https://mariocharts.com/docs" },
  { name: "Components", url: "https://mariocharts.com/docs/components" },
  { name: "Heatmap Chart", url: "https://mariocharts.com/docs/components/heatmap" },
];

export default function HeatmapPage() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <HeatmapContent />
    </>
  );
}
