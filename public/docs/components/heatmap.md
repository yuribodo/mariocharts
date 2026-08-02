# Heatmap Chart

A heatmap chart component with configurable color schemes, animated cells, interactive tooltips, row/column labels, and multiple layout variants

## Install

```bash
npx shadcn@latest add https://mariocharts.com/r/heatmap.json
```

This copies the component source into your project and resolves its internal
dependencies automatically. No Mario Charts package is added to your
dependency tree.

## Import

```tsx
import { HeatmapChart } from "@/components/charts/heatmap";
```

## Props

```ts
interface HeatmapChartProps<T extends ChartDataItem> {
  readonly data: readonly T[];
  readonly x: keyof T;
  readonly y: keyof T;
  readonly value: keyof T;
  readonly weight?: keyof T;       // for stock: area size (e.g. market cap)
  readonly variant?: HeatmapVariant;
  readonly colorScheme?: ColorScheme;
  readonly colorFrom?: string;
  readonly colorTo?: string;
  readonly showLabels?: boolean;
  readonly showLegend?: boolean;
  readonly cellRadius?: number;
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly onClick?: (item: T, colLabel: string, rowLabel: string) => void;
  readonly tooltipRenderer?: TooltipRenderer<HeatmapChartTooltipData<T>>;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Full documentation with live examples: https://mariocharts.com/docs/components/heatmap
- Registry item (complete source): https://mariocharts.com/r/heatmap.json
- All charts: https://mariocharts.com/llms.txt
