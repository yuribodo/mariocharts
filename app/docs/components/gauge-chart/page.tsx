import type { Metadata } from "next";
import { GaugeChartContent } from "./gauge-chart-content";
import { BreadcrumbSchema } from "../../../../components/seo/json-ld";

export const metadata: Metadata = {
  title: "Gauge Chart",
  description: "Production-ready gauge chart component for React. Displays a single value with configurable color zones on a 3/4 arc. Copy-paste ready.",
  keywords: ["gauge chart", "react gauge", "speedometer chart", "data visualization", "typescript chart"],
  alternates: { canonical: "/docs/components/gauge-chart" },
  openGraph: {
    title: "Gauge Chart Component | Mario Charts",
    description: "Production-ready gauge chart component for React with configurable zones.",
    url: "https://mariocharts.com/docs/components/gauge-chart",
    type: "article",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://mariocharts.com" },
  { name: "Docs", url: "https://mariocharts.com/docs" },
  { name: "Components", url: "https://mariocharts.com/docs/components" },
  { name: "Gauge Chart", url: "https://mariocharts.com/docs/components/gauge-chart" },
];

export default function GaugeChartPage() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <GaugeChartContent />
    </>
  );
}
