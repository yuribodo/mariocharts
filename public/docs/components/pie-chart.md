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
  readonly data: readonly T[];
  readonly value: keyof T;
  readonly label: keyof T;
  readonly colors?: readonly string[];
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly variant?: 'pie' | 'donut' | 'semi';
  readonly innerRadius?: number;
  readonly centerContent?: React.ReactNode | ((data: { total: number; items: readonly T[] }) => React.ReactNode);
  readonly onSliceClick?: (data: T, index: number) => void;
  readonly tooltipRenderer?: TooltipRenderer<PieChartTooltipData<T>>;
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
