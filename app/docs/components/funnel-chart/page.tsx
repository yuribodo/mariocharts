import type { Metadata } from "next";
import { FunnelChartContent } from "./funnel-chart-content";
import { BreadcrumbSchema } from "../../../../components/seo/json-ld";

export const metadata: Metadata = {
  title: "Funnel Chart",
  description: "Production-ready funnel chart component for React. Visualize conversion pipelines with tapered or straight variants. Shows percentages, values, and conversion rates. Copy-paste ready.",
  keywords: ["funnel chart", "react funnel", "conversion funnel", "sales pipeline", "data visualization", "typescript chart"],
  alternates: { canonical: "/docs/components/funnel-chart" },
  openGraph: {
    title: "Funnel Chart Component | Mario Charts",
    description: "Production-ready funnel chart for React with tapered/straight variants and conversion rates.",
    url: "https://mariocharts.com/docs/components/funnel-chart",
    type: "article",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://mariocharts.com" },
  { name: "Docs", url: "https://mariocharts.com/docs" },
  { name: "Components", url: "https://mariocharts.com/docs/components" },
  { name: "Funnel Chart", url: "https://mariocharts.com/docs/components/funnel-chart" },
];

export default function FunnelChartPage() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <FunnelChartContent />
    </>
  );
}
