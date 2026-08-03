"use client";

import { LineChart } from "@/src/components/charts/line-chart";
import { DEMO_SERIES } from "./types";

interface SettledLineChartProps {
  className?: string;
}

export function SettledLineChart({ className }: SettledLineChartProps) {
  return (
    <div className={className}>
      <LineChart
        data={DEMO_SERIES}
        x="month"
        y="value"
        height={280}
        showDots
        curve="monotone"
        showGrid
        animation={false}
      />
    </div>
  );
}
