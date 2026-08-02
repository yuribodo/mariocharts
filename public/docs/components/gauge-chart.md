# Gauge Chart

A 3/4 arc gauge chart component with configurable color zones, animated needle, center value display, and responsive design

## Install

```bash
npx shadcn@latest add https://mariocharts.com/r/gauge-chart.json
```

This copies the component source into your project and resolves its internal
dependencies automatically. No Mario Charts package is added to your
dependency tree.

## Import

```tsx
import { GaugeChart } from "@/components/charts/gauge-chart";
```

## Props

```ts
interface GaugeChartProps {
  /** The current value to display on the gauge. */
  readonly value: number;
  /** Minimum value of the gauge range. @default 0 */
  readonly min?: number;
  /** Maximum value of the gauge range. @default 100 */
  readonly max?: number;
  /** Array of zone objects defining color regions. */
  readonly zones: readonly GaugeZone[];
  /** Unit label shown next to the center value (e.g. `"%"`, `"GB"`). */
  readonly unit?: string;
  /** Descriptive label shown below the center value. */
  readonly label?: string;
  /** Thickness of the gauge arc stroke in pixels. @default 20 */
  readonly strokeWidth?: number;
  /** Height of the chart container in pixels. @default 300 */
  readonly height?: number;
  /** Show loading skeleton state. @default false */
  readonly loading?: boolean;
  /** Error message to display in place of the chart. @default null */
  readonly error?: string | null;
  /** Enable entrance animation for the progress arc. @default true */
  readonly animation?: boolean;
  /** Additional CSS classes to apply to the container. */
  readonly className?: string;
  readonly tooltipRenderer?: TooltipRenderer<GaugeChartTooltipData>;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Full documentation with live examples: https://mariocharts.com/docs/components/gauge-chart
- Registry item (complete source): https://mariocharts.com/r/gauge-chart.json
- All charts: https://mariocharts.com/llms.txt
