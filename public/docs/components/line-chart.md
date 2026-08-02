# Line Chart

A sophisticated line chart component with triangular markers, textured area fills, multiple series support, gap handling, curve interpolation, and advanced animations

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
  readonly data: readonly T[];
  readonly x: keyof T;
  readonly y: keyof T | readonly (keyof T)[];
  readonly colors?: readonly string[];
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly strokeWidth?: number;
  readonly curve?: 'linear' | 'monotone' | 'natural' | 'step';
  readonly showDots?: boolean;
  readonly showArea?: boolean;
  readonly showAreaForSeries?: readonly number[];
  readonly showGrid?: boolean;
  readonly gridStyle?: 'solid' | 'dashed' | 'dotted';
  readonly showLegend?: boolean;
  readonly connectNulls?: boolean;
  readonly onPointClick?: (data: T, index: number, series?: string) => void;
  readonly tooltipRenderer?: TooltipRenderer<LineChartTooltipData<T>>;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Full documentation with live examples: https://mariocharts.com/docs/components/line-chart
- Registry item (complete source): https://mariocharts.com/r/line-chart.json
- All charts: https://mariocharts.com/llms.txt
