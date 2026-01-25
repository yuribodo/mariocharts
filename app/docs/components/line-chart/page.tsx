import type { Metadata } from "next";
import { LineChartContent } from "./line-chart-content";
import { BreadcrumbSchema } from "../../../../components/seo/json-ld";

export const metadata: Metadata = {
  title: "Line Chart",
  description: "Sophisticated line chart component for React. Supports multiple series, curve interpolation, area fill, gap handling, and smooth animations. TypeScript ready.",
  keywords: ["line chart", "react line chart", "time series chart", "data visualization", "trend chart"],
  alternates: { canonical: "/docs/components/line-chart" },
  openGraph: {
    title: "Line Chart Component | Mario Charts",
    description: "Sophisticated line chart component for React with multiple series support.",
    url: "https://mario-charts.dev/docs/components/line-chart",
    type: "article",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://mario-charts.dev" },
  { name: "Docs", url: "https://mario-charts.dev/docs" },
  { name: "Components", url: "https://mario-charts.dev/docs/components" },
  { name: "Line Chart", url: "https://mario-charts.dev/docs/components/line-chart" },
];

export default function LineChartPage() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <LineChartContent />
    </>
  );
}