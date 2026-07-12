import type { ReactNode } from "react";
import type { ChartDataItem } from "./types";

export type TooltipRenderer<D> = (data: D) => ReactNode;

export interface LineChartTooltipData<T extends ChartDataItem> {
  readonly label: string;
  readonly index: number;
  readonly series: readonly {
    readonly key: string;
    readonly value: number;
    readonly rawValue: unknown;
    readonly color: string;
  }[];
}

export interface BarChartTooltipData<T extends ChartDataItem> {
  readonly label: string;
  readonly value: number;
  readonly rawValue: unknown;
  readonly color: string;
  readonly index: number;
  readonly data: T;
}

export interface PieChartTooltipData<T extends ChartDataItem> {
  readonly label: string;
  readonly value: number;
  readonly rawValue: unknown;
  readonly percentage: number;
  readonly color: string;
  readonly index: number;
}

export interface StackedBarChartTooltipData<T extends ChartDataItem> {
  readonly label: string;
  readonly index: number;
  readonly segments: readonly {
    readonly key: string;
    readonly value: number;
    readonly color: string;
  }[];
  readonly total: number;
}

export interface FunnelChartTooltipData<T extends ChartDataItem> {
  readonly label: string;
  readonly value: number;
  readonly rawValue: unknown;
  readonly percentage: number;
  readonly conversionRate: number;
  readonly color: string;
}

export interface TreemapChartTooltipData {
  readonly name: string;
  readonly value: number;
  readonly formattedValue: string;
  readonly percentage: number;
  readonly path: readonly string[];
  readonly color: string;
}

export interface RadarChartTooltipData<T extends ChartDataItem> {
  readonly type: string;
  readonly seriesName: string;
  readonly axisLabel?: string;
  readonly value?: number;
  readonly formattedValue?: string;
  readonly color: string;
  readonly data: T;
}

export interface ScatterPlotTooltipData<T extends ChartDataItem> {
  readonly xValue: number;
  readonly yValue: number;
  readonly formattedX: string;
  readonly formattedY: string;
  readonly seriesKey?: string;
  readonly sizeValue?: number;
  readonly color: string;
}

export interface HeatmapChartTooltipData<T extends ChartDataItem> {
  readonly xLabel: string;
  readonly yLabel: string;
  readonly value: number;
  readonly formattedValue: string;
  readonly normalizedValue: number;
  readonly color: string;
}

export interface AreaChartTooltipData<T extends ChartDataItem> {
  readonly label: string;
  readonly index: number;
  readonly series: readonly {
    readonly key: string;
    readonly value: number;
    readonly rawValue: unknown;
    readonly color: string;
  }[];
}

export interface GaugeChartTooltipData {
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly percentage: number;
  readonly unit?: string;
  readonly label?: string;
  readonly zone?: {
    readonly from: number;
    readonly to: number;
    readonly color: string;
    readonly label?: string;
  };
}

export interface WaterfallChartTooltipData<T extends ChartDataItem> {
  readonly label: string;
  readonly type: "increase" | "decrease" | "total";
  /** Signed delta for increase/decrease bars; the absolute value for totals. */
  readonly value: number;
  /** Running total after this step. */
  readonly cumulative: number;
  readonly color: string;
  readonly index: number;
  readonly data: T;
}
