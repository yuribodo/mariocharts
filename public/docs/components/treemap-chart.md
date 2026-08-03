# Treemap Chart

A squarified treemap chart component for hierarchical data with nested rectangles, animated layout, interactive tooltips, and responsive design

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
  readonly data: readonly TreeMapNode[];
  readonly colors?: readonly string[];
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly onClick?: (node: TreeMapNode, path: readonly string[]) => void;
  readonly tooltipRenderer?: TooltipRenderer<TreemapChartTooltipData>;
}
```

## Dependencies

npm packages added: framer-motion

Peer dependencies: react, react-dom

## Links

- Full documentation with live examples: https://mariocharts.com/docs/components/treemap
- Registry item (complete source): https://mariocharts.com/r/treemap-chart.json
- All charts: https://mariocharts.com/llms.txt
