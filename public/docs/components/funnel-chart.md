# Funnel Chart

A funnel chart component with vertical trapezoid and horizontal diminishing bar variants, animated segments, conversion rates, and interactive tooltips

## Install

```bash
npx shadcn@latest add https://mariocharts.com/r/funnel-chart.json
```

This copies the component source into your project and resolves its internal
dependencies automatically. No Mario Charts package is added to your
dependency tree.

## Import

```tsx
import { FunnelChart } from "@/components/charts/funnel-chart";
```

## Props

```ts
interface FunnelChartProps<T extends ChartDataItem> {
  readonly data: readonly T[];
  readonly label: keyof T;
  readonly value: keyof T;
  readonly colors?: readonly string[];
  readonly variant?: "tapered" | "straight" | "horizontal";
  readonly showValues?: boolean;
  readonly showPercentages?: boolean;
  readonly showConversionRates?: boolean;
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly onClick?: (item: T, index: number) => void;
  readonly tooltipRenderer?: TooltipRenderer<FunnelChartTooltipData<T>>;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Docs (markdown): https://mariocharts.com/docs/components/funnel-chart.md
- Live examples (HTML): https://mariocharts.com/docs/components/funnel-chart
- Registry item (complete source): https://mariocharts.com/r/funnel-chart.json
- All charts: https://mariocharts.com/llms.txt
