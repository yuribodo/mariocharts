"use client";

import { BarChart } from "@/src/components/charts/bar-chart";

import { chartColors, monthlyRevenue, type Orientation, type Variant } from "./workbench-data";

interface WorkbenchPreviewProps {
  orientation: Orientation;
  variant: Variant;
  animation: boolean;
  /** Bump to replay the entrance animation. */
  chartKey: number;
}

export function WorkbenchPreview({
  orientation,
  variant,
  animation,
  chartKey,
}: WorkbenchPreviewProps) {
  return (
    <figure
      role="figure"
      aria-label="Monthly revenue bar chart"
      className="m-0 h-[320px] min-w-0 p-5 sm:h-[380px] sm:p-8"
    >
      <BarChart
        key={chartKey}
        data={monthlyRevenue}
        x="month"
        y="revenue"
        colors={chartColors}
        orientation={orientation}
        variant={variant}
        animation={animation}
        showGrid
      />
    </figure>
  );
}
