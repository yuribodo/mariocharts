import type { Metadata } from "next";
import { markdownAlternate } from "@/lib/markdown-alternate";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { SankeyChartContent } from "./sankey-chart-content";
export const metadata: Metadata = {
  title: "Sankey Chart",
  description:
    "A React Sankey chart for branching and converging journeys. Proportional flow ribbons, keyboard and touch inspection, and copy-paste source.",
  alternates: markdownAlternate("/docs/components/sankey-chart"),
  openGraph: {
    title: "Sankey Chart Component | Mario Charts",
    description:
      "Explore multiple paths to the same destination with an accessible React Sankey chart.",
    url: "https://mariocharts.com/docs/components/sankey-chart",
    type: "article",
  },
};
export default function SankeyChartPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://mariocharts.com" },
          { name: "Docs", url: "https://mariocharts.com/docs" },
          {
            name: "Components",
            url: "https://mariocharts.com/docs/components",
          },
          {
            name: "Sankey Chart",
            url: "https://mariocharts.com/docs/components/sankey-chart",
          },
        ]}
      />
      <SankeyChartContent />
    </>
  );
}
