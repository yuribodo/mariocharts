import type { Metadata } from "next";
import { markdownAlternate } from "@/lib/markdown-alternate";
import { StackedBarChartContent } from "./stacked-bar-chart-content";
import { BreadcrumbSchema } from "../../../../components/seo/json-ld";

export const metadata: Metadata = {
  title: "Stacked Bar Chart",
  description: "Multi-category stacked bar chart component for React. Visualize composition across groups with filled and outline variants, horizontal and vertical orientation. TypeScript ready.",
  keywords: ["stacked bar chart", "react stacked chart", "composition chart", "multi-category chart", "data visualization"],
  alternates: markdownAlternate("/docs/components/stacked-bar-chart"),
  openGraph: {
    title: "Stacked Bar Chart Component | Mario Charts",
    description: "Multi-category stacked bar chart component for React with composition analysis.",
    url: "https://mariocharts.com/docs/components/stacked-bar-chart",
    type: "article",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://mariocharts.com" },
  { name: "Docs", url: "https://mariocharts.com/docs" },
  { name: "Components", url: "https://mariocharts.com/docs/components" },
  { name: "Stacked Bar Chart", url: "https://mariocharts.com/docs/components/stacked-bar-chart" },
];

export default function StackedBarChartPage() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <StackedBarChartContent />
    </>
  );
}
