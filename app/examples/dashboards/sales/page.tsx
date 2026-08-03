import type { Metadata } from "next";
import { markdownAlternate } from "@/lib/markdown-alternate";
import { SalesDashboardContent } from "./sales-dashboard-content";

export const metadata: Metadata = {
  title: "Sales & Revenue Dashboard — Mario Charts",
  description:
    "Interactive sales and revenue analytics dashboard built with Mario Charts components.",
  alternates: markdownAlternate("/examples/dashboards/sales"),
};

export default function SalesDashboardPage() {
  return <SalesDashboardContent />;
}
