// Shared types for ScatterPlot component

export type ChartDataItem = Record<string, unknown>;

export interface ScatterPlotProps<T extends ChartDataItem> {
  // Required
  readonly data: readonly T[];
  readonly x: keyof T;
  readonly y: keyof T;

  // Common chart props
  readonly colors?: readonly string[];
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;

  // Scatter-specific
  readonly series?: keyof T;
  readonly size?: keyof T | number;
  readonly sizeRange?: readonly [number, number];

  // P1 Features
  readonly showTrendLine?: boolean;
  readonly trendLineColor?: string;
  readonly showLegend?: boolean;
  readonly showGrid?: boolean;
  readonly gridStyle?: 'solid' | 'dashed' | 'dotted';
  readonly xDomain?: readonly [number, number];
  readonly yDomain?: readonly [number, number];

  // Event handlers
  readonly onPointClick?: (data: T, index: number, series?: string) => void;
}

export interface ProcessedPoint<T extends ChartDataItem> {
  data: T;
  index: number;
  xValue: number;
  yValue: number;
  sizeValue: number;
  seriesKey: string;
  label: string;
  screenX: number;
  screenY: number;
  radius: number;
  color: string;
  formattedX: string;
  formattedY: string;
  formattedSize: string | null;
}

export interface TrendLine {
  slope: number;
  intercept: number;
  r2: number;
  screenX1: number;
  screenY1: number;
  screenX2: number;
  screenY2: number;
}

export interface ProcessedSeries<T extends ChartDataItem> {
  key: string;
  color: string;
  points: ProcessedPoint<T>[];
  trendLine: TrendLine | null;
}

export interface HoveredPoint {
  index: number;
  series: string;
}
