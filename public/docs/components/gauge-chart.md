# Gauge Chart

A 270-degree arc gauge with truthful range limits, nonoverlapping color zones, animated value updates, and keyboard and touch inspection

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
export interface GaugeChartProps {
  /** Actual finite measurement. Outside-range values remain visible; the arc keeps the boundary zone color and is clamped. */
  readonly value: number;
  /** Finite increasing bounds. @default 0 */
  readonly min?: number;
  /** @default 100 */
  readonly max?: number;
  /** Nonoverlapping zones inside the range; input order and colors need not be unique. */
  readonly zones: readonly GaugeZone[];
  readonly unit?: string;
  readonly label?: string;
  /** Requested stroke thickness, capped to fit small frames. @default 20 */
  readonly strokeWidth?: number;
  /** Progress/track end caps. Zone boundaries remain flat. @default "round" */
  readonly strokeLinecap?: "round" | "butt";
  /** Stable total height in every state. @default 300 */
  readonly height?: number;
  /** Retain value and zones during refresh for matching geometry. */
  readonly loading?: boolean;
  readonly error?: string | null;
  /** Sweep from minimum on entrance and retarget from the current arc on updates. */
  readonly animation?: boolean;
  readonly className?: string;
  /** Format actual measurement and inspection values; unit is appended separately. */
  readonly valueFormatter?: (value: number) => string;
  /** Compact endpoint labels. Defaults to valueFormatter. */
  readonly axisValueFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
  readonly tooltipRenderer?: TooltipRenderer<GaugeChartTooltipData>;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Docs (markdown): https://mariocharts.com/docs/components/gauge-chart.md
- Live examples (HTML): https://mariocharts.com/docs/components/gauge-chart
- Registry item (complete source): https://mariocharts.com/r/gauge-chart.json
- All charts: https://mariocharts.com/llms.txt
