# Funnel Chart

A five-variant funnel with faithful stage values, conversion and drop-off metrics, growing geometry, and keyboard and touch inspection

## Install

```bash
npx shadcn@latest add https://mariocharts.com/r/funnel-chart.json
```

This copies the component source into your project and resolves its internal
dependencies automatically. No Mario Charts package is added to your
dependency tree.

## Import

```tsx
import { FunnelChart } from "@/components/charts/funnel-chart";
```

## Props

```ts
export interface FunnelChartProps<T extends ChartDataItem> {
  /** Sequential stages in input order; values must be finite and nonnegative. */
  readonly data: readonly T[];
  readonly label: keyof T;
  readonly value: keyof T;
  /** Valid CSS colors; an empty palette uses the defaults. */
  readonly colors?: readonly string[];
  /** Tapered/smooth show transitions; straight/horizontal/columns compare measured extents. */
  readonly variant?: FunnelVariant;
  readonly showValues?: boolean;
  /** Percent of the first stage, not a sum of repeated stage counts. */
  readonly showPercentages?: boolean;
  readonly showConversionRates?: boolean;
  /** Signed change from the preceding stage: loss or increase. */
  readonly showDropOff?: boolean;
  readonly showConnectors?: boolean;
  /** Requested stage gap; rate annotations reserve at least 26px in row layouts. */
  readonly gap?: number;
  /** Corner radius for straight, horizontal and columns. */
  readonly borderRadius?: number;
  readonly className?: string;
  /** Stable frame height. Crowded stages scroll rather than overlap. */
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly valueFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
  readonly onClick?: (item: T, index: number) => void;
  readonly tooltipRenderer?: TooltipRenderer<FunnelChartTooltipData<T>>;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Docs (markdown): https://mariocharts.com/docs/components/funnel-chart.md
- Live examples (HTML): https://mariocharts.com/docs/components/funnel-chart
- Registry item (complete source): https://mariocharts.com/r/funnel-chart.json
- All charts: https://mariocharts.com/llms.txt
