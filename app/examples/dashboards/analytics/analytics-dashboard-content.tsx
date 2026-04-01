"use client";

import { cn } from "@/lib/utils";
import { LineChart } from "@/src/components/charts/line-chart";
import { PieChart } from "@/src/components/charts/pie-chart";
import { HeatmapChart } from "@/src/components/charts/heatmap";
import { StackedBarChart } from "@/src/components/charts/stacked-bar-chart";
import { FunnelChart } from "@/src/components/charts/funnel-chart";

import {
  kpiData,
  dailyTraffic,
  trafficSources,
  trafficHeatmap,
  contentByDevice,
  conversionFunnel,
} from "./data";

// ── Tiny SVG icons for KPIs ──────────────────────────────────────────
const kpiIcons: Record<string, React.ReactNode> = {
  eye: (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  users: (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  bounce: (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="7 17 17 7" />
      <polyline points="17 17 17 7 7 7" />
    </svg>
  ),
  clock: (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

// ── KPI Card ─────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  previousValue,
  change,
  context,
  icon,
}: {
  label: string;
  value: string;
  previousValue: string;
  change: number;
  context: string;
  icon: string;
}) {
  // For bounce rate, negative change is good
  const isBounceRate = icon === "bounce";
  const isPositive = isBounceRate ? change <= 0 : change >= 0;
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-muted/60 p-1.5 text-muted-foreground">
          {kpiIcons[icon]}
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold",
            isPositive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          )}
        >
          {change >= 0 ? "\u2191" : "\u2193"} {Math.abs(change)}%
        </span>
        <span className="text-xs text-muted-foreground">vs {previousValue}</span>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground/70">{context}</p>
    </div>
  );
}

// ── Chart Card with question-driven header ───────────────────────────
function ChartCard({
  question,
  insight,
  children,
  className,
}: {
  question: string;
  insight?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-card shadow-sm", className)}>
      <div className="border-b px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">{question}</h3>
        {insight && (
          <p className="mt-0.5 text-xs text-muted-foreground">{insight}</p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Section Header ───────────────────────────────────────────────────
function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 mt-10 first:mt-0">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// ── Format helpers ───────────────────────────────────────────────────
function formatNumber(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return `${value}`;
}

// ── Dashboard ────────────────────────────────────────────────────────
export function AnalyticsDashboardContent() {
  const totalVisitors = trafficSources.reduce(
    (sum, item) => sum + item.visitors,
    0
  );

  return (
    <div className="container mx-auto max-w-7xl select-text px-4 py-8">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Website Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          March 2026 &middot; compared to February 2026
        </p>
      </div>

      {/* ── SECTION 1: Overview ───────────────────────────────────── */}
      <SectionHeader
        title="Overview"
        description="Key metrics compared to last month"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            previousValue={kpi.previousValue}
            change={kpi.change}
            context={kpi.context}
            icon={kpi.icon}
          />
        ))}
      </div>

      {/* ── SECTION 2: Traffic Trends ─────────────────────────────── */}
      <SectionHeader
        title="Traffic Trends"
        description="Daily visitor patterns and acquisition channels"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <ChartCard
          question="How is daily traffic trending?"
          insight="Mid-week peaks with consistent weekend dips. Late March shows strong growth."
          className="lg:col-span-3"
        >
          <LineChart
            data={[...dailyTraffic]}
            x="day"
            y={["visitors", "pageViews"]}
            colors={["#3b82f6", "#94a3b8"]}
            height={280}
            showArea
            showAreaForSeries={[0]}
            showGrid
            curve="monotone"
          />
        </ChartCard>
        <ChartCard
          question="Where are visitors coming from?"
          insight="Organic search drives 42% of traffic — SEO investment is paying off"
          className="lg:col-span-2"
        >
          <PieChart
            data={[...trafficSources]}
            label="source"
            value="visitors"
            variant="donut"
            colors={["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"]}
            height={280}
            centerContent={
              <div className="text-center">
                <p className="text-2xl font-bold">{formatNumber(totalVisitors)}</p>
                <p className="text-xs text-muted-foreground">total visitors</p>
              </div>
            }
          />
        </ChartCard>
      </div>

      {/* ── SECTION 3: Engagement Patterns ────────────────────────── */}
      <SectionHeader
        title="Engagement Patterns"
        description="When users visit and what content they consume"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <ChartCard
          question="When are users most active?"
          insight="Peak traffic: Tue-Thu, 10am-2pm. Weekends see 60% less traffic."
          className="lg:col-span-3"
        >
          <HeatmapChart
            data={[...trafficHeatmap]}
            x="hour"
            y="day"
            value="visitors"
            variant="grid"
            colorScheme="blue"
            height={300}
          />
        </ChartCard>
        <ChartCard
          question="What content do users engage with, by device?"
          insight="Docs dominate on desktop. Product pages see more mobile traffic."
          className="lg:col-span-2"
        >
          <StackedBarChart
            data={[...contentByDevice]}
            x="category"
            y={["desktop", "mobile", "tablet"]}
            colors={["#3b82f6", "#10b981", "#f59e0b"]}
            height={300}
            showLegend
          />
        </ChartCard>
      </div>

      {/* ── SECTION 4: Conversion Funnel ──────────────────────────── */}
      <SectionHeader
        title="Conversion Funnel"
        description="User journey from first visit to paid subscription"
      />

      <ChartCard
        question="Where do we lose users in the conversion journey?"
        insight="Biggest drop-off: Visitor to Sign Up (86%). Onboarding to Active retains 59%."
      >
        <FunnelChart
          data={[...conversionFunnel]}
          label="stage"
          value="count"
          showConversionRates
          height={340}
          colors={["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#c084fc"]}
        />
      </ChartCard>
    </div>
  );
}
