# Radar Chart

A multi-axis radar chart with explicit axis ranges, polygons that grow from the center, keyboard and touch inspection, and responsive labels

## Install

```bash
npx shadcn@latest add https://mariocharts.com/r/radar-chart.json
```

This copies the component source into your project and resolves its internal
dependencies automatically. No Mario Charts package is added to your
dependency tree.

## Import

```tsx
import { RadarChart } from "@/components/charts/radar-chart";
```

## Props

```ts
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
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Docs (markdown): https://mariocharts.com/docs/components/radar-chart.md
- Live examples (HTML): https://mariocharts.com/docs/components/radar-chart
- Registry item (complete source): https://mariocharts.com/r/radar-chart.json
- All charts: https://mariocharts.com/llms.txt
