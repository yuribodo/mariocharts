import type { Metadata } from "next";
import { ScatterPlotContent } from "./scatter-plot-content";
import { BreadcrumbSchema } from "../../../../components/seo/json-ld";

export const metadata: Metadata = {
  title: "Scatter Plot",
  description: "Versatile scatter plot and bubble chart component for React. Supports multi-series, trend lines, dynamic bubble sizing, and correlation visualization. TypeScript ready.",
  keywords: ["scatter plot", "bubble chart", "react scatter chart", "correlation chart", "data visualization"],
  alternates: { canonical: "/docs/components/scatter-plot" },
  openGraph: {
    title: "Scatter Plot Component | Mario Charts",
    description: "Versatile scatter plot and bubble chart component for React with trend line support.",
    url: "https://mariocharts.com/docs/components/scatter-plot",
    type: "article",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://mariocharts.com" },
  { name: "Docs", url: "https://mariocharts.com/docs" },
  { name: "Components", url: "https://mariocharts.com/docs/components" },
  { name: "Scatter Plot", url: "https://mariocharts.com/docs/components/scatter-plot" },
];

export default function ScatterPlotPage() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <ScatterPlotContent />
    </>
  );
}
