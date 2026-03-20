---
description: TreeMap chart component displaying hierarchical data as proportional rectangles
created: 2026-03-09
status: active
---

# spec: treemap-chart

## Purpose

Visualize hierarchical data as nested, area-proportional rectangles.
Each rectangle's area represents its value relative to siblings.
Use cases: disk usage, portfolio allocation, category breakdowns, budget distribution.

## Data Model

- The component accepts a flat-or-nested data structure via a `data` prop
- Each node has a `name` (label), `value` (numeric, determines area), and optional `children` (recursive)
- Leaf nodes (no children) are rendered as rectangles
- Parent nodes group their children visually
- Arbitrary nesting depth is supported

```typescript
interface TreeMapNode {
  readonly name: string;
  readonly value?: number;        // required for leaf nodes; parent value = sum of children
  readonly children?: readonly TreeMapNode[];
}
```

## Behaviour

- The component computes a squarified treemap layout (aspect ratios close to 1) from the data hierarchy
- Each leaf rectangle's area is proportional to its value relative to the total
- Rectangles are colored by top-level category using `colors` prop or `DEFAULT_COLORS` cycling
- Children inherit their parent's color with reduced opacity for depth differentiation
- Hovering a rectangle shows a tooltip with: name, value, and percentage of total
- Clicking a rectangle fires `onClick` with the node and its path (ancestry)
- The component renders three states before the chart: loading (skeleton), error (message), empty (no data)
- The component is responsive via ResizeObserver — recalculates layout on container resize
- Entry animation uses Framer Motion: rectangles scale from 0 + fade in with staggered delays
- Animation respects `prefers-reduced-motion` via `useReducedMotion()`
- Labels are rendered inside rectangles only when the rectangle is large enough (min width/height threshold)
- The component is memoized and exports its props type

## Props Interface

```typescript
interface TreeMapChartProps {
  readonly data: readonly TreeMapNode[];
  readonly colors?: readonly string[];
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly onClick?: (node: TreeMapNode, path: readonly string[]) => void;
}
```

## Layout Algorithm

- Use squarified treemap algorithm (Bruls, Huizing, van Wijk)
- Input: list of values + bounding rectangle
- Output: list of positioned rectangles with x, y, width, height
- Algorithm is implemented as a pure function (no side effects, testable)
- Rectangles have a small gap (1-2px) between them for visual separation

## Visual Design

- Rectangles use the project's `DEFAULT_COLORS` palette for top-level categories
- Nested children use the parent's color at reduced opacity (e.g., 80%, 60%)
- Rectangles have subtle rounded corners (2-4px radius)
- Hover state: brightness increase via CSS filter, not Framer Motion (performance)
- Tooltip matches existing chart tooltip pattern (motion.div with opacity+scale transition)
- Labels: name (truncated with ellipsis if too wide), value below in smaller font

## Docs Page

- Route: `/docs/components/treemap`
- Page structure follows existing pattern: metadata + BreadcrumbSchema + content component
- Content includes: hero, interactive example with sample data, installation guide, API reference
- Sample data: category breakdown (e.g., tech company revenue by segment)
- Interactive controls: animation toggle, replay button

## Mapping

- `src/components/charts/treemap-chart/index.tsx` — main component (TreeMapChartComponent, states, tooltip, exports)
- `src/components/charts/treemap-chart/layout.ts` — squarified layout algorithm (nodeValue, computeTreeMapLayout)
- `src/components/index.ts` — barrel export (TreeMapChart, TreeMapChartProps, TreeMapNode)
- `app/docs/components/treemap/page.tsx` — docs page metadata + BreadcrumbSchema
- `app/docs/components/treemap/treemap-content.tsx` — docs content (3 examples, states demo, API reference)
- `components/site/docs-sidebar-nav.tsx` — sidebar navigation entry
- `components/site/mobile-docs-drawer.tsx` — mobile navigation entry
