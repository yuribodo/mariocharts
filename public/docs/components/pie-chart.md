# Pie Chart

A customizable pie and donut chart component with animated segments, interactive hover effects, center labels, and responsive design

## Install

```bash
npx shadcn@latest add https://mariocharts.com/r/pie-chart.json
```

This copies the component source into your project and resolves its internal
dependencies automatically. No Mario Charts package is added to your
dependency tree.

## Import

```tsx
import { PieChart } from "@/components/charts/pie-chart";
```

## Props

```ts
interface PieChartProps<T extends ChartDataItem> {
  /** Finite, nonnegative observations. Zero shares have no slice. */
  readonly data: readonly T[];
  readonly value: keyof T;
  readonly label: keyof T;
  readonly colors?: readonly string[];
  readonly className?: string;
  /** Total frame height, including an optional legend, in every variant and state. */
  readonly height?: number;
  /** Retain data during refresh to preserve the exact slice geometry. */
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly variant?: "pie" | "donut" | "semi";
  /** Fraction of the outer radius, from 0 inclusive to 1 exclusive. Ignored for pie. */
  readonly innerRadius?: number;
  /** Slice corner radius in pixels. Zero gives flat edges; constrained to fit each slice. */
  readonly cornerRadius?: number;
  readonly centerContent?:
    | ReactNode
    | ((data: { total: number; items: readonly T[] }) => ReactNode);
  readonly showLegend?: boolean;
  readonly onSliceClick?: (data: T, index: number) => void;
  /** rawValue contains the source value field; value is its parsed numeric value. */
  readonly tooltipRenderer?: TooltipRenderer<PieChartTooltipData<T>>;
  readonly valueFormatter?: (value: number) => string;
  /** Receives a percentage from 0 to 100. */
  readonly percentageFormatter?: (percentage: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Docs (markdown): https://mariocharts.com/docs/components/pie-chart.md
- Live examples (HTML): https://mariocharts.com/docs/components/pie-chart
- Registry item (complete source): https://mariocharts.com/r/pie-chart.json
- All charts: https://mariocharts.com/llms.txt
