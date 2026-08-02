# Area Chart

A layered area chart component with multiple curve interpolations, gradient fills, multi-series support, and responsive design

## Install

```bash
npx shadcn@latest add https://mariocharts.com/r/area-chart.json
```

This copies the component source into your project and resolves its internal
dependencies automatically. No Mario Charts package is added to your
dependency tree.

## Import

```tsx
import { AreaChart } from "@/components/charts/area-chart";
```

## Props

```ts
interface AreaChartProps<T extends ChartDataItem> {
  readonly data: readonly T[];
  readonly x: keyof T;
  readonly y: keyof T | readonly (keyof T)[];
  readonly colors?: readonly string[];
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly areaOpacity?: number;
  readonly gradient?: boolean;
  readonly stacked?: boolean;
  readonly strokeWidth?: number;
  readonly curve?: 'linear' | 'monotone' | 'natural' | 'step';
  readonly showDots?: boolean;
  readonly showGrid?: boolean;
  readonly gridStyle?: 'solid' | 'dashed' | 'dotted';
  readonly showLegend?: boolean;
  readonly connectNulls?: boolean;
  readonly onPointClick?: (data: T, index: number, series?: string) => void;
  readonly tooltipRenderer?: (data: AreaChartTooltipData<T>) => React.ReactNode;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Full documentation with live examples: https://mariocharts.com/docs/components/area-chart
- Registry item (complete source): https://mariocharts.com/r/area-chart.json
- All charts: https://mariocharts.com/llms.txt
