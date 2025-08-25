"use client";

import { memo } from "react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

import { cn } from "@/lib/utils";
import { type BarChartProps } from "@/types/chart-types";
import { getChartColors } from "@/utils/color-utils";

const BarChartComponent = <T extends Record<string, unknown>>({
  data,
  xAxis,
  yAxis,
  colors,
  className,
  loading,
  error,
  emptyState,
  animation = true,
  interactive = true,
  tooltip = { enabled: true },
  legend,
  margin = { top: 20, right: 30, left: 20, bottom: 5 },
  onBarClick,
  onBarHover,
}: BarChartProps<T>) => {
  if (loading) {
    return (
      <div className={cn("chart-container flex items-center justify-center h-64", className)}>
        <div className="animate-pulse">Loading chart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("chart-container flex items-center justify-center h-64", className)}>
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={cn("chart-container flex items-center justify-center h-64", className)}>
        {emptyState || <div className="text-muted-foreground">No data available</div>}
      </div>
    );
  }

  const chartColors = colors || getChartColors(data.length);

  return (
    <div className={cn("chart-container", className)}>
      <ResponsiveContainer width="100%" height={400}>
        <RechartsBarChart
          data={data as any[]}
          margin={margin}
          {...(onBarClick && { onClick: (data, index) => onBarClick(data.activePayload?.[0]?.payload, index) })}
          {...(onBarHover && { 
            onMouseEnter: (data, index) => onBarHover(data.activePayload?.[0]?.payload, index),
            onMouseLeave: () => onBarHover(null, -1)
          })}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="opacity-30" 
          />
          <XAxis
            dataKey={xAxis.dataKey as string}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "currentColor" }}
            {...(xAxis.hide && { hide: xAxis.hide })}
            {...(xAxis.label && { label: { value: xAxis.label, position: "insideBottom", offset: -5 } })}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "currentColor" }}
            {...(yAxis?.hide && { hide: yAxis.hide })}
            {...(yAxis?.domain && { domain: yAxis.domain })}
            {...(yAxis?.label && { label: { value: yAxis.label, angle: -90, position: "insideLeft" } })}
          />
          {tooltip.enabled && (
            <Tooltip
              {...(tooltip.custom && { content: tooltip.custom as any })}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
            />
          )}
          {legend?.enabled && (
            <Legend 
              verticalAlign={legend.position === "top" || legend.position === "bottom" ? legend.position : "bottom"}
              align={legend.align || "center"}
            />
          )}
          <Bar
            dataKey={yAxis?.dataKey as string || "value"}
            fill={chartColors[0]}
            radius={[4, 4, 0, 0]}
            animationDuration={animation ? 500 : 0}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const BarChart = memo(BarChartComponent);
BarChart.displayName = "BarChart";