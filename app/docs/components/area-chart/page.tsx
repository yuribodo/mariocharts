import type { Metadata } from "next";
import { AreaChartContent } from "./area-chart-content";
import { BreadcrumbSchema } from "../../../../components/seo/json-ld";

export const metadata: Metadata = {
  title: "Area Chart",
  description: "Area chart component for React with gradient fills, stacked areas, multiple series, and smooth animations. TypeScript ready.",
  keywords: ["area chart", "react area chart", "stacked area chart", "data visualization", "gradient chart"],
  alternates: { canonical: "/docs/components/area-chart" },
  openGraph: {
    title: "Area Chart Component | Mario Charts",
    description: "Versatile area chart component for React with gradient fills and stacked areas.",
    url: "https://mariocharts.com/docs/components/area-chart",
    type: "article",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://mariocharts.com" },
  { name: "Docs", url: "https://mariocharts.com/docs" },
  { name: "Components", url: "https://mariocharts.com/docs/components" },
  { name: "Area Chart", url: "https://mariocharts.com/docs/components/area-chart" },
];

export default function AreaChartPage() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <AreaChartContent />
    </>
  );
}
