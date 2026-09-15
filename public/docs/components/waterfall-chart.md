# Waterfall Chart

A waterfall chart with absolute balances, computed sums and period subtotals, vertical and horizontal layouts, filled or outline bars, growth animations, and keyboard and touch inspection

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
  /** Step label key. Defaults to "label". */
  readonly x?: WaterfallDataKey<T>;
  /** Finite numeric value key. Omit values for sum/subtotal steps. Defaults to "value". */
  readonly y?: WaterfallDataKey<T>;
  /** Step type key: increase, decrease, total, sum or subtotal. Missing types infer direction from sign. */
  readonly type?: WaterfallDataKey<T>;
  readonly colors?: WaterfallColors;
  readonly className?: string;
  /** Fixed outer height, at least 180px. Defaults to 300. Dense charts scroll inside this frame. */
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly orientation?: "vertical" | "horizontal";
  /** Filled or outlined marks. Defaults to filled. */
  readonly variant?: WaterfallVariant;
  /** Corner radius in pixels, from 0 to 24. Defaults to 3. */
  readonly borderRadius?: number;
  /** Fraction of the category slot occupied by a bar, from 0.2 to 0.9. Defaults to 0.65. */
  readonly barWidth?: number;
  /** Running balance before the first step. Defaults to 0. */
  readonly initialValue?: number;
  /** Connect consecutive balances. Absolute resets intentionally break the connector. Defaults to true. */
  readonly showConnectors?: boolean;
  readonly connectorStyle?: "solid" | "dashed" | "dotted";
  /** Show signed changes and absolute sums. Defaults to false. */
  readonly showValues?: boolean;
  readonly showGrid?: boolean;
  readonly gridStyle?: "solid" | "dashed" | "dotted";
  readonly showLegend?: boolean;
  /** Formats values consistently in axes, labels, tooltips and the data table. */
  readonly valueFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
  readonly onBarClick?: (data: T, index: number) => void;
  readonly tooltipRenderer?: TooltipRenderer<WaterfallChartTooltipData<T>>;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Docs (markdown): https://mariocharts.com/docs/components/waterfall-chart.md
- Live examples (HTML): https://mariocharts.com/docs/components/waterfall-chart
- Registry item (complete source): https://mariocharts.com/r/waterfall-chart.json
- All charts: https://mariocharts.com/llms.txt
