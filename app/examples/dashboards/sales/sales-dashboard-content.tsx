"use client";

import { cn } from "@/lib/utils";
import { LineChart } from "@/src/components/charts/line-chart";
import { BarChart } from "@/src/components/charts/bar-chart";
import { RadarChart } from "@/src/components/charts/radar-chart";
import { GaugeChart } from "@/src/components/charts/gauge-chart";

import {
  kpiData,
  monthlyRevenue,
  productSales,
  categoryDistribution,
  revenueTarget,
  sellerPerformanceAxes,
  sellerPerformanceSeries,
} from "./data";

// ── Tiny SVG icons for KPIs ──────────────────────────────────────────
const kpiIcons: Record<string, React.ReactNode> = {
  currency: (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  cart: (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  ticket: (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M12 4v16" /><path d="M2 12h20" />
    </svg>
  ),
  percent: (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
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
  const isPositive = change >= 0;
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
          {isPositive ? "\u2191" : "\u2193"} {Math.abs(change)}%
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

// ── Segment Breakdown (Pie + Legend side by side) ────────────────────
const SEGMENT_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
];

function formatCurrency(value: number) {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}K`;
  return `R$ ${value}`;
}

function SegmentBreakdown() {
  const total = categoryDistribution.reduce(
    (sum, item) => sum + item.receita,
    0
  );

  return (
    <div className="flex h-full flex-col">
      {/* Legend rows — each segment as a horizontal bar-like row */}
      <div className="flex flex-col gap-2">
        {categoryDistribution.map((item, i) => {
          const pct = (item.receita / total) * 100;
          return (
            <div key={item.category}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: SEGMENT_COLORS[i] }}
                  />
                  <span className="text-sm">{item.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium tabular-nums">
                    {formatCurrency(item.receita)}
                  </span>
                  <span className="w-11 text-right text-xs text-muted-foreground tabular-nums">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: SEGMENT_COLORS[i],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* Total */}
      <div className="mt-auto flex items-center justify-between border-t pt-3">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="text-sm font-semibold">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────
export function SalesDashboardContent() {
  return (
    <div className="container mx-auto max-w-7xl select-text px-4 py-8">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Sales &amp; Revenue
        </h1>
        <p className="text-sm text-muted-foreground">
          Dezembro 2025 &middot; comparado com novembro 2025
        </p>
      </div>

      {/* ── SECTION 1: Resumo executivo ────────────────────────────── */}
      <SectionHeader
        title="Resumo do Periodo"
        description="Indicadores-chave comparados ao mes anterior"
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

      {/* ── SECTION 2: Estamos batendo a meta? ─────────────────────── */}
      <SectionHeader
        title="Acompanhamento de Meta"
        description="Receita realizada vs planejada ao longo do ano"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          question="Receita vs Meta mensal"
          insight="Batemos a meta em 8 de 12 meses. Mar e Jun ficaram abaixo."
          className="lg:col-span-2"
        >
          <LineChart
            data={[...monthlyRevenue]}
            x="month"
            y={["receita", "meta"]}
            colors={["#3b82f6", "#94a3b8"]}
            height={280}
            showArea
            showAreaForSeries={[0]}
            showGrid
            curve="monotone"
          />
        </ChartCard>
        <ChartCard
          question="Meta anual atingida"
          insight="R$ 1.28M de R$ 1.65M — faltam R$ 370K para fechar o ano"
        >
          <GaugeChart
            value={revenueTarget.value}
            min={revenueTarget.min}
            max={revenueTarget.max}
            zones={[...revenueTarget.zones]}
            unit="%"
            label="da meta anual"
            height={280}
          />
        </ChartCard>
      </div>

      {/* ── SECTION 3: De onde vem a receita? ──────────────────────── */}
      <SectionHeader
        title="Origem da Receita"
        description="Quais produtos e segmentos geram mais receita"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <ChartCard
          question="Quais produtos geram mais receita?"
          insight="Top 3 produtos representam 63% da receita total"
          className="lg:col-span-3"
        >
          <BarChart
            data={[...productSales]}
            x="product"
            y="receita"
            colors={["#3b82f6"]}
            height={300}
            showGrid
            showValues
          />
        </ChartCard>
        <ChartCard
          question="Qual a dependencia por segmento?"
          insight="Enterprise + PME = 70% da receita — risco de concentracao"
          className="lg:col-span-2"
        >
          <SegmentBreakdown />
        </ChartCard>
      </div>

      {/* ── SECTION 4: Quem vende e como? ──────────────────────────── */}
      <SectionHeader
        title="Performance do Time"
        description="Perfil de cada vendedor por 5 dimensoes"
      />

      <ChartCard
        question="Quais sao os pontos fortes e fracos de cada vendedor?"
        insight="Ana lidera em receita e satisfacao. Carlos tem o melhor ciclo de venda. Maria fecha mais negocios."
      >
        <RadarChart
          series={sellerPerformanceSeries}
          axes={sellerPerformanceAxes}
          height={360}
          fillOpacity={0.15}
        />
      </ChartCard>
    </div>
  );
}
