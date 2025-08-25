"use client";

import { memo } from "react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
// Types inline for simplicity
interface ChartAxisConfig<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly dataKey: keyof T;
  readonly label?: string;
  readonly hide?: boolean;
  readonly domain?: [number, number];
}

interface BarChartProps<T extends Record<string, unknown>> {
  readonly data: readonly T[];
  readonly xAxis: ChartAxisConfig<T>;
  readonly yAxis?: Partial<ChartAxisConfig<T>> & { readonly label?: string };
  readonly colors?: readonly string[];
  readonly className?: string;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly emptyState?: React.ReactNode;
  readonly animation?: boolean;
  readonly interactive?: boolean;
  readonly tooltip?: {
    readonly enabled?: boolean;
    readonly custom?: React.ComponentType<any>;
  };
  readonly margin?: {
    readonly top?: number;
    readonly right?: number;
    readonly bottom?: number;
    readonly left?: number;
  };
  readonly onBarClick?: (data: T, index: number) => void;
  readonly onBarHover?: (data: T | null, index: number) => void;
}
// Simple color palette
const defaultColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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

  const chartColors = colors || defaultColors;

  return (
    <div className={cn("chart-container", className)}>
      <ResponsiveContainer width="100%" height={400}>
        <RechartsBarChart
          data={data as any[]}
          margin={margin}
          onClick={(data) => onBarClick && onBarClick(data?.activePayload?.[0]?.payload, 0)}
          onMouseMove={(data) => onBarHover && onBarHover(data?.activePayload?.[0]?.payload, 0)}
          onMouseLeave={() => onBarHover && onBarHover(null, -1)}
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
            hide={xAxis.hide}
            {...( xAxis.label && { label: { value: xAxis.label, position: "insideBottom", offset: -5 } })}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "currentColor" }}
            hide={yAxis?.hide}
            {...( yAxis?.domain && { domain: yAxis.domain })}
            {...( yAxis?.label && { label: { value: yAxis.label, angle: -90, position: "insideLeft" } })}
          />
          {tooltip.enabled && (
            <Tooltip
              content={tooltip.custom as any}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
            />
          )}
          <Bar
            dataKey={(yAxis?.dataKey || "value") as string}
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