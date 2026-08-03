# Stacked Bar Chart

A stacked bar chart component with multiple segment support, animated stacking, interactive tooltips, and both vertical and horizontal orientations

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
interface StackedBarChartProps<T extends ChartDataItem> {
  readonly data: readonly T[];
  readonly x: keyof T;
  readonly y: readonly (keyof T)[];
  readonly colors?: readonly string[];
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly variant?: 'filled' | 'outline';
  readonly orientation?: 'vertical' | 'horizontal';
  readonly showLegend?: boolean;
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
