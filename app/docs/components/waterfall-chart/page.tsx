import type { Metadata } from "next";
import { WaterfallChartContent } from "./waterfall-chart-content";
import { BreadcrumbSchema } from "../../../../components/seo/json-ld";

export const metadata: Metadata = {
  title: "Waterfall Chart",
  description:
    "Waterfall chart component for React showing how an initial value is affected by sequential positive and negative changes. Running totals, connector lines, and color-coded steps. TypeScript ready.",
  keywords: [
    "waterfall chart",
    "react waterfall chart",
    "bridge chart",
    "financial chart",
    "cash flow chart",
    "data visualization",
  ],
  alternates: { canonical: "/docs/components/waterfall-chart" },
  openGraph: {
    title: "Waterfall Chart Component | Mario Charts",
    description:
      "Financial waterfall chart for React with running totals, connector lines, and color-coded increases, decreases, and totals.",
    url: "https://mariocharts.com/docs/components/waterfall-chart",
    type: "article",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://mariocharts.com" },
  { name: "Docs", url: "https://mariocharts.com/docs" },
  { name: "Components", url: "https://mariocharts.com/docs/components" },
  { name: "Waterfall Chart", url: "https://mariocharts.com/docs/components/waterfall-chart" },
];

export default function WaterfallChartPage() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <WaterfallChartContent />
    </>
  );
}
