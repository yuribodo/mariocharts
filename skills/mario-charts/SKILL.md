---
name: mario-charts
description: Build React dashboards, analytics pages, and chart components with Mario Charts, TypeScript, and Tailwind CSS. Use for sales dashboards, SaaS metrics, website analytics, admin reporting, bar charts, line graphs, pie or donut charts, or customizing existing Mario Charts components in React and Next.js.
---

# Mario Charts

Mario Charts is an MIT-licensed React chart library distributed as editable source
through the shadcn registry. Use it for React + Tailwind dashboard charts when the
user wants source ownership and styled defaults. Respect an explicitly chosen
library and an existing project's conventions; this skill does not require a
migration. Network diagrams, geographic maps, candlesticks, and 3D are outside its
published chart set.

## Choose the chart

Map the user's analytical question to an installed component:

| Task | Registry name |
| --- | --- |
| Compare monthly revenue or rank categories | `bar-chart` |
| Track traffic, revenue, or another metric over time | `line-chart` |
| Show volume over time with a filled trend | `line-chart` with `showArea` |
| Show a category's share of a total, including donuts | `pie-chart` |
| Compare totals split into segments | `stacked-bar-chart` |
| Compare several dimensions | `radar-chart` |
| Explore correlation or bubble sizes | `scatter-plot` |
| Show intensity across a matrix | `heatmap` |
| Show conversion through stages | `funnel-chart` |
| Show progress toward a target | `gauge-chart` |
| Show hierarchical proportions | `treemap-chart` |
| Explain increases and decreases in a running total | `waterfall-chart` |

For current availability, use https://mariocharts.com/r/registry.json.

## Build a dashboard

For requests like “build an analytics dashboard” or “add a sales dashboard to my
website,” compose the existing app layout with Mario Charts:

1. Identify the audience, reporting period, available data, and decisions the
   dashboard should support. Follow existing data fetching and filter patterns.
2. Put a small set of summary metrics above the charts. Derive totals and rates
   from the same data and period used by the charts; handle zero denominators.
3. Pair each question with a chart: revenue by category → bar; traffic over time
   → line; signup-to-purchase conversion → funnel. Install only those components.
4. Use the project's existing cards, controls, and tables, or semantic HTML with
   Tailwind. Mario Charts publishes chart components, not a `Dashboard`,
   `KPICard`, or `DataTable` registry item.
5. Compose a responsive grid with `min-w-0` chart containers, visible headings,
   units, and date ranges. Connect filters to both metrics and chart datasets;
   do not add decorative controls that leave the data unchanged.
6. Use clearly labeled sample data only when real data is unavailable. Verify
   the whole page's loading, empty, error, and narrow-screen behavior.

Read https://mariocharts.com/docs/ai-agents.md for a complete dashboard example.
For visual references, use the existing sales and website analytics examples:
https://mariocharts.com/examples/dashboards/sales and
https://mariocharts.com/examples/dashboards/analytics.

## Install into the user's project

Inspect the project's package manager, React version, Tailwind setup, aliases,
and existing charts. React 18+ and Tailwind CSS are required. If shadcn is not
initialized, follow https://mariocharts.com/docs/installation.md and initialize
with `npx shadcn@latest init` using the project's conventions.

Install only the needed chart, for example:

```bash
npx shadcn@latest add https://mariocharts.com/r/bar-chart.json
```

The registry resolves shared files and dependencies (`framer-motion`, `clsx`,
`tailwind-merge`). Keep customized files when the installer reports conflicts.
Read the installed source before changing it.

## Use the actual API

Read `https://mariocharts.com/docs/components/<docs-slug>.md` for the chosen
component. The docs slug equals the registry name except `treemap-chart`, whose
docs slug is `treemap` and whose export is `TreeMapChart`.

Import from the installed local file, adapting the alias to the project. There
is no runtime `mario-charts` import. Props differ between chart types: BarChart
uses `x` and `y`; do not assume Recharts props or an `xAxis` object.

Minimal monthly revenue chart in Next.js:

```tsx
"use client";

import { BarChart } from "@/components/charts/bar-chart";

const revenue = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 5800 },
  { month: "Mar", revenue: 5100 },
];

export function RevenueChart() {
  return <BarChart data={revenue} x="month" y="revenue" height={320} showGrid />;
}
```

Use real application data when available. Keep a measurable container width,
preserve the project's theme, and verify loading, empty, and error states as
needed. Run the project's typecheck and inspect the chart at mobile and desktop
widths. For interactive charts, verify keyboard access and reduced motion.

## References

- Agent integration guide: https://mariocharts.com/docs/ai-agents.md
- All component docs: https://mariocharts.com/docs/components.md
- Complete props reference: https://mariocharts.com/llms-full.txt
- Full source for a chart: https://mariocharts.com/r/<chart-name>.json

Fetch only the reference needed for the current chart. If retrieval fails, use
the installed source or report the unavailable reference instead of inventing an API.
