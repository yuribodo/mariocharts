# Heatmap Chart

A grid, radial and stock heatmap with explicit missing values, faithful color scales, weighted areas, and keyboard and touch inspection

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
export interface HeatmapChartProps<T extends ChartDataItem> {
  /** Rows in input order. Null/undefined/empty values are missing, not zero. */
  readonly data: readonly T[];
  readonly x: keyof T;
  /** Row/ring key; ignored by stock. */
  readonly y: keyof T;
  readonly value: keyof T;
  /** Nonnegative stock area weights. Omit for equal allocation. Zero has no area. */
  readonly weight?: keyof T;
  readonly variant?: HeatmapVariant;
  readonly colorScheme?: ColorScheme;
  /** Valid CSS colors, including inherited variables. Stock defaults to red/green. */
  readonly colorFrom?: string;
  readonly colorTo?: string;
  /** Fixed color bounds containing all measured values. Auto scales use the observed extent. */
  readonly domain?: readonly [number, number];
  /** Neutral value for diverging and stock scales. Defaults to zero. */
  readonly midpoint?: number;
  readonly showLabels?: boolean;
  readonly showLegend?: boolean;
  /** Grid/stock corner radius in pixels; radial cells keep circular edges. */
  readonly cellRadius?: number;
  readonly className?: string;
  /** Stable frame height including legends and notices. Defaults to 320. */
  readonly height?: number;
  /** Retain rows during refresh to preserve cell geometry. */
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  /** Measured value formatter. Stock defaults to signed percentages. */
  readonly valueFormatter?: (value: number) => string;
  readonly weightFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
  /** Original row only; absent matrix combinations cannot invoke an action. */
  readonly onClick?: (item: T, colLabel: string, rowLabel: string) => void;
  readonly tooltipRenderer?: TooltipRenderer<HeatmapChartTooltipData<T>>;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Docs (markdown): https://mariocharts.com/docs/components/heatmap.md
- Live examples (HTML): https://mariocharts.com/docs/components/heatmap
- Registry item (complete source): https://mariocharts.com/r/heatmap.json
- All charts: https://mariocharts.com/llms.txt
