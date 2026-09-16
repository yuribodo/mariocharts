# Sankey Chart

A Sankey chart for branching and converging flows with proportional ribbons, reachable-path highlighting, keyboard and touch inspection, and a left-to-right reveal

## Install

```bash
npx shadcn@latest add https://mariocharts.com/r/sankey-chart.json
```

This copies the component source into your project and resolves its internal
dependencies automatically. No Mario Charts package is added to your
dependency tree.

## Import

```tsx
import { SankeyChart } from "@/components/charts/sankey-chart";
```

## Props

```ts
export interface SankeyChartProps<
  N extends SankeyNode = SankeyNode,
  L extends SankeyLink = SankeyLink,
> {
  /** Unique IDs, display labels and optional CSS colors. Input order orders peers. */
  readonly nodes: readonly N[];
  /** Finite nonnegative volumes. Cycles and references to absent IDs are errors. */
  readonly links: readonly L[];
  readonly colors?: readonly string[];
  /** Align terminal nodes to the last column, or keep their earliest depth. */
  readonly align?: "justify" | "start";
  readonly linkColor?: "gradient" | "source" | "target";
  /** Horizontal curve tension from 0 (straight) to 1. */
  readonly curvature?: number;
  readonly nodeWidth?: number;
  readonly nodeGap?: number;
  readonly showValues?: boolean;
  readonly className?: string;
  /** A stable frame; crowded graphs scroll inside it. */
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly valueFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
  readonly onNodeClick?: (node: N, index: number) => void;
  readonly onLinkClick?: (link: L, index: number) => void;
  readonly tooltipRenderer?: (inspection: SankeyInspection<N, L>) => ReactNode;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Docs (markdown): https://mariocharts.com/docs/components/sankey-chart.md
- Live examples (HTML): https://mariocharts.com/docs/components/sankey-chart
- Registry item (complete source): https://mariocharts.com/r/sankey-chart.json
- All charts: https://mariocharts.com/llms.txt
