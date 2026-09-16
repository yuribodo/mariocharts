# Line Chart

A line chart with multiple series, faithful gap handling, four curve interpolations, accessible inspection, gradient areas, and geometry-matched loading states

## Install

```bash
npx shadcn@latest add https://mariocharts.com/r/line-chart.json
```

This copies the component source into your project and resolves its internal
dependencies automatically. No Mario Charts package is added to your
dependency tree.

## Import

```tsx
import { LineChart } from "@/components/charts/line-chart";
```

## Props

```ts
interface LineChartProps<T extends ChartDataItem> {
  /** Rows in display order. Null/undefined values are gaps; malformed numbers display an error. */
  readonly data: readonly T[];
  /** Equally spaced category labels, including date strings; not a continuous time scale. */
  readonly x: keyof T;
  readonly y: keyof T | readonly (keyof T)[];
  readonly colors?: readonly string[];
  readonly className?: string;
  /** Total frame height, including the legend, in every state. */
  readonly height?: number;
  /** Retain data during refresh to preserve the exact line geometry in the skeleton. */
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly strokeWidth?: number;
  /** Monotone avoids spurious extrema; natural splines may overshoot between observations. */
  readonly curve?: "linear" | "monotone" | "natural" | "step";
  readonly showDots?: boolean;
  readonly showArea?: boolean;
  /** Original indices in y; empty series never shift this mapping. */
  readonly showAreaForSeries?: readonly number[];
  readonly showGrid?: boolean;
  readonly gridStyle?: "solid" | "dashed" | "dotted";
  readonly showLegend?: boolean;
  /** Opt in to bridging missing observations. Defaults to false. */
  readonly connectNulls?: boolean;
  readonly onPointClick?: (data: T, index: number, series?: string) => void;
  readonly tooltipRenderer?: TooltipRenderer<LineChartTooltipData<T>>;
  readonly valueFormatter?: (value: number) => string;
  readonly axisValueFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Docs (markdown): https://mariocharts.com/docs/components/line-chart.md
- Live examples (HTML): https://mariocharts.com/docs/components/line-chart
- Registry item (complete source): https://mariocharts.com/r/line-chart.json
- All charts: https://mariocharts.com/llms.txt
