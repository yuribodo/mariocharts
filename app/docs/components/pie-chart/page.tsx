import type { Metadata } from "next";
import { PieChartContent } from "./pie-chart-content";
import { BreadcrumbSchema } from "../../../../components/seo/json-ld";

export const metadata: Metadata = {
  title: "Pie Chart",
  description: "Beautiful pie and donut chart component for React. Supports pie, donut, and semi-circle variants with center content, smooth animations, and keyboard navigation.",
  keywords: ["pie chart", "donut chart", "react pie chart", "data visualization", "proportions chart"],
  alternates: { canonical: "/docs/components/pie-chart" },
  openGraph: {
    title: "Pie Chart Component | Mario Charts",
    description: "Beautiful pie and donut chart component for React with center content support.",
    url: "https://mario-charts.dev/docs/components/pie-chart",
    type: "article",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://mario-charts.dev" },
  { name: "Docs", url: "https://mario-charts.dev/docs" },
  { name: "Components", url: "https://mario-charts.dev/docs/components" },
  { name: "Pie Chart", url: "https://mario-charts.dev/docs/components/pie-chart" },
];

export default function PieChartPage() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <PieChartContent />
    </>
  );
}
