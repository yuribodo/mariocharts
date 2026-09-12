# Build React Charts & Dashboards with AI Agents

Mario Charts is an MIT-licensed React chart library for dashboards and website
data visualization. Install editable TypeScript and Tailwind CSS source through
shadcn, connect your data, and customize the component in your own repo.

## Give your agent the chart skill

```bash
npx skills add yuribodo/mariocharts --skill mario-charts
```

Run this in your project and select your coding agent in the installer. The skill
provides chart selection, installation steps, and API guidance for requests such
as “add a revenue chart to my website.” It respects your project conventions and
any library you explicitly choose. You can also give an agent this page's URL.

## Add a monthly revenue chart

Prerequisites: React 18+, Tailwind CSS, and a shadcn `components.json`.
If needed, follow https://mariocharts.com/docs/installation.md and run
`npx shadcn@latest init` using your project's conventions.

```bash
npx shadcn@latest add https://mariocharts.com/r/bar-chart.json
```

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

Adapt the import alias to the project. There is no runtime `mario-charts` import.
BarChart uses `x` and `y`; read the chosen chart's props before switching types.
The registry installs `framer-motion` plus `clsx` and `tailwind-merge` for shared
helpers. Preserve customized files if the installer reports a conflict.

## Build a React dashboard

For requests such as “create a dashboard for my website,” compose summary metrics,
a responsive layout, and charts around the decisions the user needs to make.
A sales dashboard can show revenue by month, traffic over time, and conversion
through stages. Keep all metrics and charts on the same reporting period.

After completing the prerequisites above, install the three charts:

```bash
npx shadcn@latest add https://mariocharts.com/r/bar-chart.json https://mariocharts.com/r/line-chart.json https://mariocharts.com/r/funnel-chart.json
```

This example uses labeled sample data. It derives the summary metrics from the
chart datasets and stacks the panels on small screens:

```tsx
"use client";

import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { FunnelChart } from "@/components/charts/funnel-chart";

// Sample data: replace with your application's reporting data.
const monthly = [
  { month: "Jan", revenue: 4200, visits: 12000 },
  { month: "Feb", revenue: 5800, visits: 16000 },
  { month: "Mar", revenue: 5100, visits: 14000 },
];
const visits = monthly.reduce((sum, row) => sum + row.visits, 0);
const revenue = monthly.reduce((sum, row) => sum + row.revenue, 0);
const funnel = [
  { stage: "Visits", count: visits },
  { stage: "Signups", count: 4200 },
  { stage: "Purchases", count: 1260 },
];
const purchases = funnel.find((row) => row.stage === "Purchases")?.count ?? 0;
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const metrics = [
  { label: "Revenue", value: currency.format(revenue) },
  { label: "Visits", value: new Intl.NumberFormat("en-US").format(visits) },
  {
    label: "Visit-to-purchase conversion",
    value: new Intl.NumberFormat("en-US", {
      style: "percent",
      maximumFractionDigits: 1,
    }).format(visits > 0 ? purchases / visits : 0),
  },
];

export function WebsiteDashboard() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Website dashboard</h1>
        <p className="text-sm text-muted-foreground">January–March 2026 · Sample data · USD</p>
      </header>
      <dl className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border bg-card p-4">
            <dt className="text-sm text-muted-foreground">{metric.label}</dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums">{metric.value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-label="Monthly revenue" className="min-w-0 rounded-xl border bg-card p-4">
          <h2 className="mb-4 font-semibold">Monthly revenue (USD)</h2>
          <BarChart data={monthly} x="month" y="revenue" height={280} showGrid />
        </section>
        <section aria-label="Website traffic" className="min-w-0 rounded-xl border bg-card p-4">
          <h2 className="mb-4 font-semibold">Website visits</h2>
          <LineChart data={monthly} x="month" y="visits" height={280} showGrid />
        </section>
        <section aria-label="Conversion funnel" className="min-w-0 rounded-xl border bg-card p-4 lg:col-span-2">
          <h2 className="mb-4 font-semibold">Visit-to-purchase funnel</h2>
          <FunnelChart data={funnel} label="stage" value="count" height={320} showConversionRates />
        </section>
      </div>
    </div>
  );
}
```

Reuse your app's cards, filters, and data fetching. Mario Charts supplies the
charts; the summary cards and layout above use plain HTML and Tailwind CSS.
There is no separate Dashboard, KPICard, or DataTable item to install.
If you add a date filter, apply it to the summary metrics and every chart.
Preserve units, define conversion denominators, and handle loading and errors
before displaying totals.

- React sales dashboard: https://mariocharts.com/examples/dashboards/sales
- React website analytics dashboard: https://mariocharts.com/examples/dashboards/analytics

## Choose a chart for your data

Use bar charts for category comparisons, line charts for trends, pie or donut
charts for proportions, and funnels for conversion stages. Other available types
include area, stacked bar, radar, scatter, heatmap, gauge, treemap, and waterfall.

- Component selection and links: https://mariocharts.com/docs/components.md
- Full props reference: https://mariocharts.com/llms-full.txt
- Registry index: https://mariocharts.com/r/registry.json
- Complete bar chart source: https://mariocharts.com/r/bar-chart.json

The `treemap-chart` registry item uses the docs slug `treemap` and exports
`TreeMapChart`. Other docs slugs match registry names.

## When does Mario Charts fit?

Use Mario Charts for React and Next.js dashboards when you want styled defaults
and ownership of the source. It requires Tailwind CSS. The MIT license allows
personal and commercial use. Updates require reviewing changes to copied source.

Network graphs, geographic maps, candlesticks, and 3D are outside the published
chart set. Evaluate performance separately for high-frequency streaming. Keep
an existing library when it already meets the user's needs.

## Verify the result

Connect the real application data when available, run the project's typecheck,
and inspect the chart at desktop and mobile widths. Verify relevant loading,
empty, error, keyboard, and reduced-motion behavior. Read the installed source
when a reference is unavailable instead of inventing props.

- Discovery index: https://mariocharts.com/llms.txt
- Dashboard examples: https://mariocharts.com/examples
- HTML guide: https://mariocharts.com/docs/ai-agents
