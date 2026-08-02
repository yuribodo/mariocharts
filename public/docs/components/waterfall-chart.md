# Waterfall Chart

A waterfall chart component visualizing cumulative increases, decreases, and running totals with animated floating bars and connectors

## Install

```bash
npx shadcn@latest add https://mariocharts.com/r/waterfall-chart.json
```

This copies the component source into your project and resolves its internal
dependencies automatically. No Mario Charts package is added to your
dependency tree.

## Import

```tsx
import { WaterfallChart } from "@/components/charts/waterfall-chart";
```

## Props

```ts
interface WaterfallChartProps<T extends ChartDataItem> {
  readonly data: readonly T[];
  /** Key holding each step's label. Defaults to `"label"`. */
  readonly x?: keyof T;
  /** Key holding each step's numeric value. Defaults to `"value"`. */
  readonly y?: keyof T;
  /** Key holding each step's type (`"increase" | "decrease" | "total"`). Defaults to `"type"`; inferred from sign when absent. */
  readonly type?: keyof T;
  readonly colors?: WaterfallColors;
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly orientation?: "vertical" | "horizontal";
  /** Draw the connector lines that link each step's running total to the next. Defaults to `true`. */
  readonly showConnectors?: boolean;
  /** Render the signed delta / total on each bar. Defaults to `false`. */
  readonly showValues?: boolean;
  readonly showGrid?: boolean;
  readonly gridStyle?: "solid" | "dashed" | "dotted";
  /** Show the increase/decrease/total legend. Defaults to `false`. */
  readonly showLegend?: boolean;
  readonly onBarClick?: (data: T, index: number) => void;
  readonly tooltipRenderer?: TooltipRenderer<WaterfallChartTooltipData<T>>;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Full documentation with live examples: https://mariocharts.com/docs/components/waterfall-chart
- Registry item (complete source): https://mariocharts.com/r/waterfall-chart.json
- All charts: https://mariocharts.com/llms.txt
