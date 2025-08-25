"use client";

import { memo } from "react";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Dot
} from "recharts";

import { cn } from "@/lib/utils";
import { type LineChartProps } from "@/types/chart-types";
import { getChartColors } from "@/utils/color-utils";

const LineChartComponent = <T extends Record<string, unknown>>({
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
  strokeWidth = 2,
  connectNulls = true,
  dot = true,
  onLineClick,
  onLineHover,
}: LineChartProps<T>) => {
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

  const chartColors = colors || getChartColors(1);
  
  // Handle multiple lines if yAxis is an array
  const lines = Array.isArray(yAxis?.dataKey) ? yAxis.dataKey : [yAxis?.dataKey || "value"];

  return (
    <div className={cn("chart-container", className)}>
      <ResponsiveContainer width="100%" height={400}>
        <RechartsLineChart
          data={data as any[]}
          margin={margin}
          {...(onLineClick && { onClick: (data, index) => onLineClick(data.activePayload?.[0]?.payload, index) })}
          {...(onLineHover && { 
            onMouseEnter: (data, index) => onLineHover(data.activePayload?.[0]?.payload, index),
            onMouseLeave: () => onLineHover(null, -1)
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
              cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "5 5" }}
            />
          )}
          {legend?.enabled && (
            <Legend 
              verticalAlign={legend.position === "top" || legend.position === "bottom" ? legend.position : "bottom"}
              align={legend.align || "center"}
            />
          )}
          {lines.map((lineKey, index) => (
            <Line
              key={lineKey as string}
              type="monotone"
              dataKey={lineKey as string}
              stroke={chartColors[index % chartColors.length]}
              strokeWidth={strokeWidth}
              connectNulls={connectNulls}
              dot={dot ? { fill: chartColors[index % chartColors.length], strokeWidth: 2, r: 4 } : false}
              activeDot={{ 
                r: 6, 
                fill: chartColors[index % chartColors.length],
                stroke: "hsl(var(--background))",
                strokeWidth: 2 
              }}
              animationDuration={animation ? 500 : 0}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LineChart = memo(LineChartComponent);
LineChart.displayName = "LineChart";