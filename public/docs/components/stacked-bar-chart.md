# Stacked Bar Chart

A stacked bar chart with faithful signed stacks, growth from zero, segment inspection by keyboard and touch, and vertical or horizontal layouts

## Install

```bash
npx shadcn@latest add https://mariocharts.com/r/stacked-bar-chart.json
```

This copies the component source into your project and resolves its internal
dependencies automatically. No Mario Charts package is added to your
dependency tree.

## Import

```tsx
import { StackedBarChart } from "@/components/charts/stacked-bar-chart";
```

## Props

```ts
export interface StackedBarChartProps<T extends ChartDataItem> {
  /** Finite segment values; missing/malformed values show a row/key error. */
  readonly data: readonly T[];
  /** Category key. Rows retain input order, including duplicate labels. */
  readonly x: keyof T;
  /** Unique numeric keys in stack and legend order. */
  readonly y: readonly (keyof T)[];
  readonly colors?: readonly string[];
  readonly className?: string;
  /** Total frame height, including the optional legend. Defaults to 300. */
  readonly height?: number;
  /** Retain data during refresh to preserve exact segment geometry. */
  readonly loading?: boolean;
  readonly error?: string | null;
  /** Grow entire stacks from zero, preserving segment joins. Respects reduced motion. */
  readonly animation?: boolean;
  readonly variant?: "filled" | "outline";
  readonly orientation?: "vertical" | "horizontal";
  /** Radius in pixels at the outer ends of each signed stack. Internal joins stay flat. Defaults to 2. */
  readonly cornerRadius?: number;
  readonly showLegend?: boolean;
  readonly showGrid?: boolean;
  readonly gridStyle?: "solid" | "dashed" | "dotted";
  /** Format segment values and signed totals. */
  readonly valueFormatter?: (value: number) => string;
  /** Format numeric ticks; defaults to valueFormatter. */
  readonly axisValueFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
  /** Original row, selected stack key, and original row index. Enter/Space also activate. */
  readonly onSegmentClick?: (data: T, stackKey: string, index: number) => void;
  readonly tooltipRenderer?: TooltipRenderer<StackedBarChartTooltipData<T>>;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Docs (markdown): https://mariocharts.com/docs/components/stacked-bar-chart.md
- Live examples (HTML): https://mariocharts.com/docs/components/stacked-bar-chart
- Registry item (complete source): https://mariocharts.com/r/stacked-bar-chart.json
- All charts: https://mariocharts.com/llms.txt
