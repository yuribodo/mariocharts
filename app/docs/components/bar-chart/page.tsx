import type { Metadata } from "next";
import { BarChartContent } from "./bar-chart-content";
import { BreadcrumbSchema } from "../../../../components/seo/json-ld";

export const metadata: Metadata = {
  title: "Bar Chart",
  description: "Production-ready bar chart component for React. Supports vertical and horizontal orientation, filled and outline variants, smooth animations, and TypeScript. Copy-paste ready.",
  keywords: ["bar chart", "react bar chart", "chart component", "data visualization", "typescript chart"],
  alternates: { canonical: "/docs/components/bar-chart" },
  openGraph: {
    title: "Bar Chart Component | Mario Charts",
    description: "Production-ready bar chart component for React with TypeScript support.",
    url: "https://mariocharts.com/docs/components/bar-chart",
    type: "article",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://mariocharts.com" },
  { name: "Docs", url: "https://mariocharts.com/docs" },
  { name: "Components", url: "https://mariocharts.com/docs/components" },
  { name: "Bar Chart", url: "https://mariocharts.com/docs/components/bar-chart" },
];

export default function BarChartPage() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <BarChartContent />
    </>
  );
}
