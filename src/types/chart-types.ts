import { type ReactNode } from "react";

export interface BaseChartProps<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly data: readonly T[];
  readonly className?: string;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly emptyState?: ReactNode;
  readonly animation?: boolean;
  readonly theme?: "light" | "dark" | "auto";
  readonly colors?: readonly string[];
  readonly interactive?: boolean;
}

export interface ChartAxisConfig<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly dataKey: keyof T;
  readonly label?: string;
  readonly hide?: boolean;
  readonly domain?: [number, number];
}

export interface TooltipProps<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly data?: T;
  readonly position?: { readonly x: number; readonly y: number };
  readonly active?: boolean;
  readonly payload?: readonly any[];
  readonly label?: string;
}

export interface LegendConfig {
  readonly enabled?: boolean;
  readonly position?: "top" | "bottom" | "left" | "right";
  readonly align?: "left" | "center" | "right";
}

export interface ChartMargin {
  readonly top?: number;
  readonly right?: number;
  readonly bottom?: number;
  readonly left?: number;
}

export interface BarChartProps<T extends Record<string, unknown>> extends BaseChartProps<T> {
  readonly xAxis: ChartAxisConfig<T>;
  readonly yAxis?: Partial<ChartAxisConfig<T>> & { readonly label?: string };
  readonly tooltip?: {
    readonly enabled?: boolean;
    readonly custom?: React.ComponentType<TooltipProps<T>>;
  };
  readonly legend?: LegendConfig;
  readonly margin?: ChartMargin;
  readonly onBarClick?: (data: T, index: number) => void;
  readonly onBarHover?: (data: T | null, index: number) => void;
}

export interface LineChartProps<T extends Record<string, unknown>> extends BaseChartProps<T> {
  readonly xAxis: ChartAxisConfig<T>;
  readonly yAxis?: Partial<ChartAxisConfig<T>> & { readonly label?: string };
  readonly tooltip?: {
    readonly enabled?: boolean;
    readonly custom?: React.ComponentType<TooltipProps<T>>;
  };
  readonly legend?: LegendConfig;
  readonly margin?: ChartMargin;
  readonly strokeWidth?: number;
  readonly dots?: boolean;
  readonly curve?: "linear" | "monotone" | "step";
  readonly onPointClick?: (data: T, index: number) => void;
  readonly onPointHover?: (data: T | null, index: number) => void;
}

export interface PieChartProps<T extends Record<string, unknown>> extends BaseChartProps<T> {
  readonly dataKey: keyof T;
  readonly nameKey: keyof T;
  readonly tooltip?: {
    readonly enabled?: boolean;
    readonly custom?: React.ComponentType<TooltipProps<T>>;
  };
  readonly legend?: LegendConfig;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly startAngle?: number;
  readonly endAngle?: number;
  readonly onSegmentClick?: (data: T, index: number) => void;
  readonly onSegmentHover?: (data: T | null, index: number) => void;
}

export type ChartType = "bar" | "line" | "pie" | "area" | "scatter" | "funnel" | "gauge" | "heatmap";

export interface ChartConfig<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly type: ChartType;
  readonly data: readonly T[];
  readonly onRefresh?: () => Promise<readonly T[]>;
  readonly refreshInterval?: number;
}