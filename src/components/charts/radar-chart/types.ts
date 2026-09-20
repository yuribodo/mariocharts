// Base data item constraint
import type { ChartDataItem } from "../_shared";
import type {
  TooltipRenderer,
  RadarChartTooltipData,
} from "../_shared/tooltip-types";
export type { ChartDataItem };

/**
 * Axis configuration for each dimension of the radar chart
 */
export interface RadarAxis<T extends ChartDataItem = ChartDataItem> {
  /** Data key to extract value from series data */
  readonly key: Extract<keyof T, string>;
  /** Display label at axis endpoint */
  readonly label: string;
  /** Custom maximum value (auto-calculated if omitted) */
  readonly max?: number;
  /** Custom minimum value (defaults to the smaller of zero and the observed minimum) */
  readonly min?: number;
}

/**
 * Single data series for the radar chart
 */
export interface RadarSeries<T extends ChartDataItem> {
  /** Unique identifier for the series */
  readonly id: string;
  /** Display name for legend/tooltip */
  readonly name: string;
  /** Data object containing values for each axis key */
  readonly data: T;
  /** Optional color override for this series */
  readonly color?: string;
}

/**
 * Props for the RadarChart component
 */
export interface RadarChartProps<T extends ChartDataItem> {
  // Required props
  /** Array of data series to display */
  readonly series: readonly RadarSeries<T>[];
  /** Configuration for each axis/dimension */
  readonly axes: readonly RadarAxis<T>[];

  // Common chart props (following library pattern)
  /** Color palette for series */
  readonly colors?: readonly string[];
  /** Additional CSS classes */
  readonly className?: string;
  /** Total frame height in pixels, including the optional legend, in every state. */
  readonly height?: number;
  /** Retain series during refresh to preserve the exact polygon geometry. */
  readonly loading?: boolean;
  /** Error message to display */
  readonly error?: string | null;
  /** Grow polygons from the center. Respects reduced motion and completes on keyboard focus. */
  readonly animation?: boolean;

  // Radar-specific props
  /** Grid shape type */
  readonly gridType?: "polygon" | "circular";
  /** Number of concentric grid levels/rings */
  readonly gridLevels?: number;
  /** Show axis labels at endpoints */
  readonly showAxisLabels?: boolean;
  /** Show lines from center to edges */
  readonly showAxisLines?: boolean;
  /** Show concentric grid lines */
  readonly showGridLines?: boolean;
  /** Show dots at data vertices */
  readonly showDots?: boolean;
  /** Polygon fill opacity (0-1) */
  readonly fillOpacity?: number;
  /** Polygon stroke width */
  readonly strokeWidth?: number;
  /** Distance of labels from edge */
  readonly labelOffset?: number;

  // Event handlers
  /** Callback when a series is clicked */
  readonly onSeriesClick?: (series: RadarSeries<T>, index: number) => void;
  /** Callback when an axis is clicked */
  readonly onAxisClick?: (axis: RadarAxis<T>, index: number) => void;

  /** Show a wrapping legend. Defaults to true when there is more than one series. */
  readonly showLegend?: boolean;
  /** Format values in inspection, accessible data, and axis ranges. */
  readonly valueFormatter?: (value: number, axis: RadarAxis<T>) => string;
  readonly ariaLabel?: string;
  readonly description?: string;

  readonly tooltipRenderer?: TooltipRenderer<RadarChartTooltipData<T>>;
}
