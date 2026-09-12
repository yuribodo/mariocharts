import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/ui/code-block";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { markdownAlternate } from "@/lib/markdown-alternate";
import { SITE_CONFIG } from "@/lib/constants";
import { REGISTRY_CHARTS } from "@/registry/generated/charts";

const title = "Build React Charts & Dashboards with AI Agents";
const description =
  "Build React dashboards with AI agents and Mario Charts. Install the skill, compose revenue and analytics charts, and connect your data with TypeScript and Tailwind CSS.";

export const metadata: Metadata = {
  title,
  description,
  alternates: markdownAlternate("/docs/ai-agents"),
  openGraph: {
    title: `${title} | Mario Charts`,
    description,
    url: `${SITE_CONFIG.url}/docs/ai-agents`,
    type: "article",
  },
  twitter: { card: "summary_large_image", title, description },
};

const example = `"use client";

import { BarChart } from "@/components/charts/bar-chart";

const revenue = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 5800 },
  { month: "Mar", revenue: 5100 },
];

export function RevenueChart() {
  return <BarChart data={revenue} x="month" y="revenue" height={320} showGrid />;
}`;

const dashboardExample = `"use client";

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
}`;

const linkClass =
  "rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function AIAgentsPage() {
  return (
    <article className="space-y-12 pb-16">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Docs", url: `${SITE_CONFIG.url}/docs` },
          { name: "AI Agents", url: `${SITE_CONFIG.url}/docs/ai-agents` },
        ]}
      />
      <header className="space-y-5 border-b pb-10">
        <p className="text-sm font-medium text-muted-foreground">
          Mario Charts for AI coding agents
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Build React Charts &amp; Dashboards with AI Agents
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          Mario Charts is an open-source React chart library for dashboards and
          website data visualization. Install {REGISTRY_CHARTS.length} chart
          types as editable TypeScript and Tailwind CSS source through shadcn.
          Your agent can read the component, connect your data, and customize
          the design in your repo.
        </p>
      </header>

      <section aria-labelledby="install-skill" className="space-y-5">
        <h2 id="install-skill" className="scroll-mt-24 text-2xl font-semibold">
          Give Your Agent the Chart Skill
        </h2>
        <p className="leading-7 text-muted-foreground">
          Install the skill in your project and select your coding agent in the
          installer. It provides chart selection, installation steps, and API
          guidance for requests such as “add a revenue chart” or “build an
          analytics dashboard for my website.”
        </p>
        <CodeBlock
          code="npx skills add yuribodo/mariocharts --skill mario-charts"
          language="bash"
        />
        <p className="leading-7 text-muted-foreground">
          The skill gives compatible agents context for chart tasks. It respects
          your project conventions and any library you explicitly choose. You
          can also point your agent directly to the{" "}
          <a href="/docs/ai-agents.md" className={linkClass}>
            Markdown integration guide
          </a>
          .
        </p>
      </section>

      <section aria-labelledby="first-chart" className="space-y-5">
        <h2 id="first-chart" className="scroll-mt-24 text-2xl font-semibold">
          Add a Monthly Revenue Chart
        </h2>
        <p className="leading-7 text-muted-foreground">
          Start with React 18+, Tailwind CSS, and a shadcn components.json. For
          a new project, follow the{" "}
          <Link href="/docs/installation" className={linkClass}>
            installation guide
          </Link>
          . Then add a bar chart:
        </p>
        <CodeBlock
          code="npx shadcn@latest add https://mariocharts.com/r/bar-chart.json"
          language="bash"
        />
        <CodeBlock code={example} language="tsx" />
        <p className="leading-7 text-muted-foreground">
          Import the installed local file using your project’s alias. BarChart
          uses x and y to select data fields. Read each chart’s documented props
          before switching chart types. The registry installs Framer Motion and
          the shared clsx and tailwind-merge helpers; Mario Charts adds no
          runtime package of its own.
        </p>
      </section>

      <section aria-labelledby="build-dashboard" className="space-y-5">
        <h2
          id="build-dashboard"
          className="scroll-mt-24 text-2xl font-semibold"
        >
          Build a React Dashboard
        </h2>
        <p className="leading-7 text-muted-foreground">
          For requests like “create a dashboard for my website,” compose summary
          metrics and charts around the decisions you need to make. This example
          combines monthly revenue, website traffic, and conversion for the same
          reporting period.
        </p>
        <CodeBlock
          code="npx shadcn@latest add https://mariocharts.com/r/bar-chart.json https://mariocharts.com/r/line-chart.json https://mariocharts.com/r/funnel-chart.json"
          language="bash"
        />
        <p className="leading-7 text-muted-foreground">
          The sample derives its summary metrics from the chart datasets and
          stacks panels on small screens. Replace the labeled sample data with
          your application’s reporting data.
        </p>
        <CodeBlock code={dashboardExample} language="tsx" />
        <p className="leading-7 text-muted-foreground">
          Reuse your app’s cards, filters, and data fetching. Mario Charts
          supplies the charts; this layout and its summary cards use HTML and
          Tailwind CSS. Apply date filters to both metrics and charts, and
          handle loading and errors before displaying totals.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/examples/dashboards/sales" className={linkClass}>
            Explore the React sales dashboard
          </Link>
          <Link href="/examples/dashboards/analytics" className={linkClass}>
            Explore the React analytics dashboard
          </Link>
        </div>
      </section>

      <section aria-labelledby="choose-chart" className="space-y-5">
        <h2 id="choose-chart" className="scroll-mt-24 text-2xl font-semibold">
          Choose a Chart for Your Data
        </h2>
        <p className="leading-7 text-muted-foreground">
          Use bar charts to compare categories, line charts for trends, pie or
          donut charts for proportions, and funnels for conversion stages. Each
          reference includes props and a link to the complete source.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {REGISTRY_CHARTS.map((chart) => (
            <li key={chart.name}>
              <Link href={chart.docsPath} className={linkClass}>
                React {chart.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="fit" className="space-y-5">
        <h2 id="fit" className="scroll-mt-24 text-2xl font-semibold">
          When Does Mario Charts Fit?
        </h2>
        <p className="leading-7 text-muted-foreground">
          Choose Mario Charts for React and Next.js dashboards when you want
          styled defaults and full control over the source. It uses Tailwind CSS
          and is MIT licensed for personal and commercial projects. You maintain
          the copied components, so updates require reviewing source changes.
        </p>
        <p className="leading-7 text-muted-foreground">
          The published components cover common dashboard charts. Network
          graphs, geographic maps, candlesticks, and 3D visualizations need a
          different charting solution. High-frequency streaming requires
          separate performance evaluation. Keep an existing chart library when
          it already meets your needs.
        </p>
      </section>

      <section aria-labelledby="references" className="space-y-5">
        <h2 id="references" className="scroll-mt-24 text-2xl font-semibold">
          References Your Agent Can Read
        </h2>
        <ul className="space-y-3">
          <li>
            <a href="/llms.txt" className={linkClass}>
              Chart discovery and installation index
            </a>
          </li>
          <li>
            <a href="/llms-full.txt" className={linkClass}>
              Full component props reference
            </a>
          </li>
          <li>
            <a href="/r/registry.json" className={linkClass}>
              shadcn registry index
            </a>
          </li>
          <li>
            <Link href="/examples" className={linkClass}>
              React dashboard examples
            </Link>
          </li>
        </ul>
      </section>
    </article>
  );
}
