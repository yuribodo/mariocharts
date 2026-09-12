import type { Metadata } from "next";
import { markdownAlternate } from "@/lib/markdown-alternate";
import { SalesDashboardContent } from "./sales-dashboard-content";

export const metadata: Metadata = {
  title: "React Sales & Revenue Dashboard Example",
  description:
    "Explore a React sales dashboard built with Mario Charts. Use editable TypeScript and Tailwind CSS charts as a starting point for revenue reporting.",
  alternates: markdownAlternate("/examples/dashboards/sales"),
};

export default function SalesDashboardPage() {
  return <SalesDashboardContent />;
}
