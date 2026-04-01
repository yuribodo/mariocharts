import type { Metadata } from "next";
import { AnalyticsDashboardContent } from "./analytics-dashboard-content";

export const metadata: Metadata = {
  title: "Website Analytics Dashboard — Mario Charts",
  description:
    "Interactive website analytics dashboard built with Mario Charts components.",
};

export default function AnalyticsDashboardPage() {
  return <AnalyticsDashboardContent />;
}
