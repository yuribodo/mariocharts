import type { Metadata } from "next";
import { markdownAlternate } from "@/lib/markdown-alternate";
import { AnalyticsDashboardContent } from "./analytics-dashboard-content";

export const metadata: Metadata = {
  title: "React Website Analytics Dashboard Example",
  description:
    "Explore a React website analytics dashboard built with Mario Charts. Use editable TypeScript and Tailwind CSS charts as a starting point for your analytics page.",
  alternates: markdownAlternate("/examples/dashboards/analytics"),
};

export default function AnalyticsDashboardPage() {
  return <AnalyticsDashboardContent />;
}
