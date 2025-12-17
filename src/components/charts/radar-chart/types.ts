// Base data item constraint
export type ChartDataItem = Record<string, unknown>;

/**
 * Axis configuration for each dimension of the radar chart
 */
export interface RadarAxis {
  /** Data key to extract value from series data */
  readonly key: string;
  /** Display label at axis endpoint */
  readonly label: string;
  /** Custom maximum value (auto-calculated if omitted) */
  readonly max?: number;
  /** Custom minimum value (defaults to 0) */
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
  readonly axes: readonly RadarAxis[];

  // Common chart props (following library pattern)
  /** Color palette for series */
  readonly colors?: readonly string[];
  /** Additional CSS classes */
  readonly className?: string;
  /** Chart height in pixels */
  readonly height?: number;
  /** Show loading state */
  readonly loading?: boolean;
  /** Error message to display */
  readonly error?: string | null;
  /** Enable animations */
  readonly animation?: boolean;

  // Radar-specific props
  /** Grid shape type */
  readonly gridType?: 'polygon' | 'circular';
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
  readonly onAxisClick?: (axis: RadarAxis, index: number) => void;
}

/**
 * Processed axis data with calculated positions
 */
export interface ProcessedAxis {
  readonly index: number;
  readonly key: string;
  readonly label: string;
  /** Angle in radians from top (0 = 12 o'clock) */
  readonly angle: number;
  readonly maxValue: number;
  readonly minValue: number;
  /** Screen X coordinate for label */
  readonly labelX: number;
  /** Screen Y coordinate for label */
  readonly labelY: number;
  /** Screen X coordinate for axis endpoint */
  readonly endpointX: number;
  /** Screen Y coordinate for axis endpoint */
  readonly endpointY: number;
}

/**
 * Processed data point with screen coordinates
 */
export interface ProcessedPoint {
  readonly axisIndex: number;
  readonly rawValue: number;
  /** Value normalized to 0-1 scale */
  readonly normalizedValue: number;
  /** Screen X coordinate */
  readonly x: number;
  /** Screen Y coordinate */
  readonly y: number;
}

/**
 * Processed series with calculated path and points
 */
export interface ProcessedSeries<T extends ChartDataItem> {
  readonly id: string;
  readonly name: string;
  readonly data: T;
  readonly color: string;
  readonly points: readonly ProcessedPoint[];
  /** SVG path d attribute for the polygon */
  readonly path: string;
}

/**
 * Hover state for interactions
 */
export interface HoveredState {
  readonly type: 'series' | 'axis' | 'point';
  readonly seriesId?: string;
  readonly axisIndex?: number;
  readonly pointIndex?: number;
}
