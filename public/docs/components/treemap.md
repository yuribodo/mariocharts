# Treemap Chart

A treemap with three proportional layouts, nested or flat views, group navigation, contrast-aware labels, growing tiles, and keyboard and touch inspection

## Install

```bash
npx shadcn@latest add https://mariocharts.com/r/treemap-chart.json
```

This copies the component source into your project and resolves its internal
dependencies automatically. No Mario Charts package is added to your
dependency tree.

## Import

```tsx
import { TreeMapChart } from "@/components/charts/treemap-chart";
```

## Props

```ts
export interface TreeMapChartProps {
  /** Hierarchical observations. Group totals derive from children, never add parent values. */
  readonly data: readonly TreeMapNode[];
  readonly colors?: readonly string[];
  readonly layout?: TreeMapLayout;
  /** Nested groups reserve headers; flat compares all leaf areas on one scale. */
  readonly variant?: TreeMapVariant;
  readonly sort?: "value" | "input";
  /** Levels shown at once, 1–6. Smaller groups collapse to an explorable tile. */
  readonly maxDepth?: number;
  readonly gap?: number;
  readonly borderRadius?: number;
  readonly showValues?: boolean;
  readonly showPercentages?: boolean;
  readonly drillDown?: boolean;
  readonly valueFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly onClick?: (node: TreeMapNode, path: readonly string[]) => void;
  readonly tooltipRenderer?: TooltipRenderer<
    TreemapChartTooltipData<TreeMapNode>
  >;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Docs (markdown): https://mariocharts.com/docs/components/treemap.md
- Live examples (HTML): https://mariocharts.com/docs/components/treemap
- Registry item (complete source): https://mariocharts.com/r/treemap-chart.json
- All charts: https://mariocharts.com/llms.txt
