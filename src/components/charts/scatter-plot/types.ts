import type {
  ChartDataItem,
  ScatterPlotTooltipData,
  TooltipRenderer,
} from "../_shared";
export type { ChartDataItem };

export interface ScatterPlotProps<T extends ChartDataItem> {
  /** Observations with finite X/Y values. Missing or malformed values produce an error. */
  readonly data: readonly T[];
  readonly x: keyof T;
  readonly y: keyof T;
  /** Optional point name, also available during keyboard inspection. */
  readonly label?: keyof T;
  readonly colors?: readonly string[];
  readonly className?: string;
  /** Total frame height, including the optional legend and viewport notice. */
  readonly height?: number;
  /** Retain data for a skeleton with the exact same positions and sizes. */
  readonly loading?: boolean;
  readonly error?: string | null;
  /** Grow each point at its fixed coordinates. Respects reduced motion. */
  readonly animation?: boolean;
  /** Group observations by this data key. */
  readonly series?: keyof T;
  /** A constant radius in pixels, or a key containing finite, nonnegative bubble values. */
  readonly size?: keyof T | number;
  /** Minimum positive and maximum bubble radius in pixels. Zero values have no painted area. */
  readonly sizeRange?: readonly [number, number];
  /** Area scales radius by square root of value; radius preserves the previous linear radius mapping. */
  readonly sizeScale?: "area" | "radius";
  /** Per-series least-squares fit, limited to observed X values and clipped to the displayed domains. */
  readonly showTrendLine?: boolean;
  readonly trendLineColor?: string;
  readonly showLegend?: boolean;
  readonly showGrid?: boolean;
  readonly gridStyle?: "solid" | "dashed" | "dotted";
  /** Viewport bounds. Out-of-range observations remain in the source data and trend calculation. */
  readonly xDomain?: readonly [number, number];
  readonly yDomain?: readonly [number, number];
  readonly xLabel?: string;
  readonly yLabel?: string;
  readonly sizeLabel?: string;
  readonly xFormatter?: (value: number) => string;
  readonly yFormatter?: (value: number) => string;
  readonly sizeFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
  /** Original observation and row index, plus its series key ("default" when ungrouped). */
  readonly onPointClick?: (data: T, index: number, series?: string) => void;
  readonly tooltipRenderer?: TooltipRenderer<ScatterPlotTooltipData<T>>;
}
