import type { Metadata } from "next";
import { ComponentsContent } from "./components-content";
import { BreadcrumbSchema } from "../../../components/seo/json-ld";

export const metadata: Metadata = {
  title: "Components",
  description:
    "Explore the Mario Charts component library. Beautiful, accessible React chart components including bar charts, line charts, pie charts, radar charts, scatter plots, and stacked bar charts.",
  keywords: [
    "react chart components",
    "bar chart component",
    "line chart component",
    "pie chart component",
    "radar chart component",
    "scatter plot component",
    "stacked bar chart",
    "dashboard components",
  ],
  alternates: {
    canonical: "/docs/components",
  },
  openGraph: {
    title: "Chart Components | Mario Charts",
    description:
      "Explore the Mario Charts component library. Beautiful, accessible React chart components.",
    url: "https://mario-charts.dev/docs/components",
    type: "article",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://mario-charts.dev" },
  { name: "Docs", url: "https://mario-charts.dev/docs" },
  { name: "Components", url: "https://mario-charts.dev/docs/components" },
];

export default function ComponentsPage() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <ComponentsContent />
    </>
  );
}
