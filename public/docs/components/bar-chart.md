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
  readonly data: readonly T[];
  readonly x: keyof T;
  readonly y?: keyof T;
  readonly colors?: readonly string[];
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly variant?: 'filled' | 'outline';
  readonly orientation?: 'vertical' | 'horizontal';
  readonly showValues?: boolean;
  readonly showGrid?: boolean;
  readonly gridStyle?: 'solid' | 'dashed' | 'dotted';
  readonly onBarClick?: (data: T, index: number) => void;
  readonly tooltipRenderer?: TooltipRenderer<BarChartTooltipData<T>>;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Full documentation with live examples: https://mariocharts.com/docs/components/bar-chart
- Registry item (complete source): https://mariocharts.com/r/bar-chart.json
- All charts: https://mariocharts.com/llms.txt
