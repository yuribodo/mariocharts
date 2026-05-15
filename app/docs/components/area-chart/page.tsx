import type { Metadata } from "next";
import { AreaChartContent } from "./area-chart-content";

export const metadata: Metadata = {
  title: "Area Chart",
  description: "Area chart component for React with gradient fills, stacked areas, and smooth animations.",
};

export default function AreaChartPage() {
  return <AreaChartContent />;
}
