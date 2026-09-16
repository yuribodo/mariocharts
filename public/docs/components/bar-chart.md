# Bar Chart

A customizable bar chart component with animations, hover effects, responsive design, and support for both vertical and horizontal orientations with filled or outline variants

## Install

```bash
npx shadcn@latest add https://mariocharts.com/r/bar-chart.json
```

This copies the component source into your project and resolves its internal
dependencies automatically. No Mario Charts package is added to your
dependency tree.

## Import

```tsx
import { BarChart } from "@/components/charts/bar-chart";
```

## Props

```ts
interface BarChartProps<T extends ChartDataItem> {
  /** Rows with finite numeric values. Missing/invalid values display an error, not zero. */
  readonly data: readonly T[];
  /** Category key; categories retain input order. */
  readonly x: keyof T;
  /** Numeric key. Defaults to "value". Unambiguous numeric strings are supported. */
  readonly y?: keyof T;
  readonly colors?: readonly string[];
  readonly className?: string;
  /** Stable frame height in every state. Defaults to 300. */
  readonly height?: number;
  /** Shows a skeleton in the chart's geometry; retain data during refresh to preserve bar positions. */
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly variant?: "filled" | "outline";
  readonly orientation?: "vertical" | "horizontal";
  readonly showValues?: boolean;
  readonly showGrid?: boolean;
  readonly gridStyle?: "solid" | "dashed" | "dotted";
  readonly onBarClick?: (data: T, index: number) => void;
  readonly tooltipRenderer?: TooltipRenderer<BarChartTooltipData<T>>;
  /** Formats tooltips, value labels and accessible values; also ticks unless overridden. */
  readonly valueFormatter?: (value: number) => string;
  /** Optional compact tick formatter, independent of detailed inspection values. */
  readonly axisValueFormatter?: (value: number) => string;
  /** Accessible chart name. */
  readonly ariaLabel?: string;
  /** Optional context, units, or explanation announced with the chart. */
  readonly description?: string;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Docs (markdown): https://mariocharts.com/docs/components/bar-chart.md
- Live examples (HTML): https://mariocharts.com/docs/components/bar-chart
- Registry item (complete source): https://mariocharts.com/r/bar-chart.json
- All charts: https://mariocharts.com/llms.txt
