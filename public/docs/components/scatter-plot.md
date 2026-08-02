# Scatter Plot

A versatile scatter plot and bubble chart component with multi-series support, trend lines, dynamic bubble sizing, responsive design, and smooth animations

## Install

```bash
npx shadcn@latest add https://mariocharts.com/r/scatter-plot.json
```

This copies the component source into your project and resolves its internal
dependencies automatically. No Mario Charts package is added to your
dependency tree.

## Import

```tsx
import { ScatterPlot } from "@/components/charts/scatter-plot";
```

## Props

```ts
export interface ScatterPlotProps<T extends ChartDataItem> {
  // Required
  readonly data: readonly T[];
  readonly x: keyof T;
  readonly y: keyof T;

  // Common chart props
  readonly colors?: readonly string[];
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;

  // Scatter-specific
  readonly series?: keyof T;
  readonly size?: keyof T | number;
  readonly sizeRange?: readonly [number, number];

  // P1 Features
  readonly showTrendLine?: boolean;
  readonly trendLineColor?: string;
  readonly showLegend?: boolean;
  readonly showGrid?: boolean;
  readonly gridStyle?: 'solid' | 'dashed' | 'dotted';
  readonly xDomain?: readonly [number, number];
  readonly yDomain?: readonly [number, number];

  // Event handlers
  readonly onPointClick?: (data: T, index: number, series?: string) => void;

  // Custom tooltip
  readonly tooltipRenderer?: TooltipRenderer<ScatterPlotTooltipData<T>>;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Full documentation with live examples: https://mariocharts.com/docs/components/scatter-plot
- Registry item (complete source): https://mariocharts.com/r/scatter-plot.json
- All charts: https://mariocharts.com/llms.txt
