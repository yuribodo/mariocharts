"use client";

import { DollarSign, Percent, ReceiptText, ShoppingCart } from "lucide-react";

import { BarChart } from "@/src/components/charts/bar-chart";
import { GaugeChart } from "@/src/components/charts/gauge-chart";
import { LineChart } from "@/src/components/charts/line-chart";
import { RadarChart } from "@/src/components/charts/radar-chart";
import {
  DashboardPanel,
  DashboardSection,
  MetricCell,
} from "@/components/dashboard/dashboard-primitives";

import {
  categoryDistribution,
  kpiData,
  monthlyRevenue,
  productSales,
  revenueTarget,
  sellerPerformanceAxes,
  sellerPerformanceSeries,
} from "./data";

const chartColors = {
  blue: "var(--chart-blue)",
  green: "var(--chart-green)",
  amber: "var(--chart-amber)",
  coral: "var(--chart-coral)",
  violet: "var(--chart-violet)",
  cyan: "var(--chart-cyan)",
} as const;

const metricIcons = {
  currency: DollarSign,
  cart: ShoppingCart,
  ticket: ReceiptText,
  percent: Percent,
} as const;

const segmentColors = [
  chartColors.blue,
  chartColors.green,
  chartColors.amber,
  chartColors.coral,
  chartColors.violet,
] as const;

function formatCurrency(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

function SegmentBreakdown() {
  const total = categoryDistribution.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="flex h-[300px] flex-col">
      <div className="space-y-4">
        {categoryDistribution.map((item, index) => {
          const percentage = (item.revenue / total) * 100;
          const color = segmentColors[index] ?? chartColors.blue;

          return (
            <div key={item.category}>
              <div className="mb-1.5 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
                  <span className="truncate text-sm">{item.category}</span>
                </div>
                <div className="flex shrink-0 items-center gap-3 tabular-nums">
                  <span className="text-sm font-medium">{formatCurrency(item.revenue)}</span>
                  <span className="w-11 text-right text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-sm bg-muted">
                <div
                  className="h-full transition-[width] duration-300 motion-reduce:transition-none"
                  style={{ width: `${percentage}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-auto flex items-center justify-between border-t pt-4 text-sm">
        <span className="text-muted-foreground">Total revenue</span>
        <span className="font-semibold tabular-nums">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

export function SalesDashboardContent() {
  return (
    <main className="mx-auto w-full max-w-[1440px] select-text px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 font-mono text-xs uppercase text-muted-foreground">Dashboard example</p>
          <h1 className="text-3xl font-semibold">Sales &amp; Revenue</h1>
          <p className="mt-2 text-sm text-muted-foreground">Executive revenue, target, product, and seller performance.</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm font-medium">December 2025</p>
          <p className="mt-1 text-xs text-muted-foreground">Compared with November 2025</p>
        </div>
      </header>

      <div className="space-y-12 py-10">
        <DashboardSection title="Period summary" description="The four signals leadership needs before opening the detail views.">
          <div role="group" aria-label="Executive metrics" className="overflow-hidden rounded-md border bg-card">
            <div className="-mb-px -mr-px grid sm:grid-cols-2 lg:grid-cols-4">
              {kpiData.map((metric) => (
                <MetricCell
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  previousValue={metric.previousValue}
                  change={metric.change}
                  context={metric.context}
                  icon={metricIcons[metric.icon]}
                  className="border-b border-r"
                />
              ))}
            </div>
          </div>
        </DashboardSection>

        <DashboardSection title="Target tracking" description="Actual revenue against the monthly plan and annual commitment.">
          <div role="group" aria-label="Target tracking charts" className="overflow-hidden rounded-md border bg-card">
            <div className="-mb-px -mr-px grid lg:grid-cols-3">
              <DashboardPanel
                question="Are we consistently hitting the monthly target?"
                insight="Target reached in 8 of 12 months. March and June created the largest gaps."
                className="border-b border-r lg:col-span-2"
              >
                <LineChart
                  data={[...monthlyRevenue]}
                  x="month"
                  y={["revenue", "target"]}
                  colors={[chartColors.blue, "var(--muted-foreground)"]}
                  height={300}
                  showArea
                  showAreaForSeries={[0]}
                  showGrid
                  curve="monotone"
                />
              </DashboardPanel>
              <DashboardPanel
                question="Will we close the annual target?"
                insight="$1.28M of $1.65M. Another $370K is required before year end."
                className="border-b border-r"
              >
                <GaugeChart
                  value={revenueTarget.value}
                  min={revenueTarget.min}
                  max={revenueTarget.max}
                  zones={[...revenueTarget.zones]}
                  unit="%"
                  label="of annual target"
                  height={300}
                />
              </DashboardPanel>
            </div>
          </div>
        </DashboardSection>

        <DashboardSection title="Revenue sources" description="Product concentration and customer-segment dependency.">
          <div role="group" aria-label="Revenue source charts" className="overflow-hidden rounded-md border bg-card">
            <div className="-mb-px -mr-px grid lg:grid-cols-5">
              <DashboardPanel
                question="Which products generate the most revenue?"
                insight="The top three products represent 63% of product revenue."
                className="border-b border-r lg:col-span-3"
              >
                <BarChart
                  data={[...productSales]}
                  x="product"
                  y="revenue"
                  colors={[chartColors.blue]}
                  height={300}
                  showGrid
                  showValues
                />
              </DashboardPanel>
              <DashboardPanel
                question="How dependent are we on each segment?"
                insight="Enterprise and SMB contribute 70% of revenue, creating concentration risk."
                className="border-b border-r lg:col-span-2"
              >
                <SegmentBreakdown />
              </DashboardPanel>
            </div>
          </div>
        </DashboardSection>

        <DashboardSection title="Team performance" description="Strengths and tradeoffs across the five seller dimensions.">
          <div role="group" aria-label="Team performance chart" className="overflow-hidden rounded-md border bg-card">
            <DashboardPanel
              question="Where does each seller outperform the team?"
              insight="Ana leads revenue and satisfaction, Carlos has the fastest cycle, and Maria closes the most deals."
            >
              <RadarChart
                series={sellerPerformanceSeries}
                axes={sellerPerformanceAxes}
                colors={[chartColors.blue, chartColors.green, chartColors.violet]}
                height={380}
                fillOpacity={0.15}
              />
            </DashboardPanel>
          </div>
        </DashboardSection>
      </div>
    </main>
  );
}
