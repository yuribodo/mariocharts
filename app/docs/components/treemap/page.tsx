import type { Metadata } from "next";
import { TreeMapContent } from "./treemap-content";
import { BreadcrumbSchema } from "../../../../components/seo/json-ld";

export const metadata: Metadata = {
  title: "TreeMap Chart",
  description: "Production-ready treemap chart component for React. Visualize hierarchical data as proportional rectangles with smooth animations and TypeScript support. Copy-paste ready.",
  keywords: ["treemap", "treemap chart", "react treemap", "hierarchical data", "data visualization", "typescript chart"],
  alternates: { canonical: "/docs/components/treemap" },
  openGraph: {
    title: "TreeMap Chart Component | Mario Charts",
    description: "Production-ready treemap chart component for React with TypeScript support.",
    url: "https://mariocharts.com/docs/components/treemap",
    type: "article",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://mariocharts.com" },
  { name: "Docs", url: "https://mariocharts.com/docs" },
  { name: "Components", url: "https://mariocharts.com/docs/components" },
  { name: "TreeMap", url: "https://mariocharts.com/docs/components/treemap" },
];

export default function TreeMapPage() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <TreeMapContent />
    </>
  );
}
