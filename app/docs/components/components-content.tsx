import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type ChartKind =
  | "bar"
  | "stacked"
  | "radar"
  | "line"
  | "area"
  | "pie"
  | "treemap"
  | "scatter"
  | "heatmap"
  | "funnel"
  | "gauge";

interface ChartEntry {
  name: string;
  href: string;
  description: string;
  meta: string;
  kind: ChartKind;
}

interface ChartGroup {
  title: string;
  description: string;
  charts: readonly ChartEntry[];
}

const groups: readonly ChartGroup[] = [
  {
    title: "Compare values",
    description: "See differences across categories, groups, or dimensions.",
    charts: [
      { name: "Bar Chart", href: "/docs/components/bar-chart", description: "Compare discrete values with vertical or horizontal bars.", meta: "Categorical", kind: "bar" },
      { name: "Stacked Bar Chart", href: "/docs/components/stacked-bar-chart", description: "Compare totals while preserving category composition.", meta: "Composition", kind: "stacked" },
      { name: "Radar Chart", href: "/docs/components/radar-chart", description: "Compare several metrics across a shared radial scale.", meta: "Multi-metric", kind: "radar" },
    ],
  },
  {
    title: "Track change",
    description: "Follow a value across time or another continuous dimension.",
    charts: [
      { name: "Line Chart", href: "/docs/components/line-chart", description: "Reveal trends, variation, and turning points over time.", meta: "Time series", kind: "line" },
      { name: "Area Chart", href: "/docs/components/area-chart", description: "Emphasize magnitude and cumulative change over time.", meta: "Cumulative", kind: "area" },
    ],
  },
  {
    title: "Understand composition",
    description: "Explain how individual parts contribute to a whole.",
    charts: [
      { name: "Pie Chart", href: "/docs/components/pie-chart", description: "Show a small set of proportional categories.", meta: "Part to whole", kind: "pie" },
      { name: "Treemap", href: "/docs/components/treemap", description: "Compare hierarchical proportions within limited space.", meta: "Hierarchy", kind: "treemap" },
    ],
  },
  {
    title: "Find relationships",
    description: "Inspect correlation, distribution, and dense patterns.",
    charts: [
      { name: "Scatter Plot", href: "/docs/components/scatter-plot", description: "Explore correlation, clusters, and outliers.", meta: "Correlation", kind: "scatter" },
      { name: "Heatmap", href: "/docs/components/heatmap", description: "Scan intensity patterns across two dimensions.", meta: "Matrix", kind: "heatmap" },
    ],
  },
  {
    title: "Monitor progress",
    description: "Communicate movement through stages or toward a target.",
    charts: [
      { name: "Funnel Chart", href: "/docs/components/funnel-chart", description: "Show stage-by-stage conversion and drop-off.", meta: "Conversion", kind: "funnel" },
      { name: "Gauge Chart", href: "/docs/components/gauge-chart", description: "Measure a current value against a defined target.", meta: "Target", kind: "gauge" },
    ],
  },
];

const bars = [42, 68, 54, 86, 63, 76];

function ChartThumbnail({ kind }: { kind: ChartKind }) {
  if (kind === "bar") {
    return <div className="flex h-full items-end gap-2 px-8 pb-7 pt-10">{bars.map((height, index) => <span key={height} className="flex-1 rounded-t-[2px]" style={{ height: `${height}%`, background: `var(--chart-${["blue", "green", "amber", "coral", "violet", "cyan"][index]})` }} />)}</div>;
  }

  if (kind === "stacked") {
    return <div className="flex h-full flex-col justify-center gap-3 px-7">{[78, 92, 64, 84].map((width) => <div key={width} className="flex h-5 overflow-hidden rounded-[2px]" style={{ width: `${width}%` }}><span className="w-[42%] bg-[var(--chart-blue)]" /><span className="w-[34%] bg-[var(--chart-green)]" /><span className="flex-1 bg-[var(--chart-amber)]" /></div>)}</div>;
  }

  if (kind === "pie") {
    return <div className="grid h-full place-items-center"><div className="size-28 rounded-full" style={{ background: "conic-gradient(var(--chart-blue) 0 34%, var(--chart-green) 34% 58%, var(--chart-amber) 58% 79%, var(--chart-coral) 79%)" }} /></div>;
  }

  if (kind === "treemap") {
    return <div className="grid h-full grid-cols-[1.3fr_1fr_.7fr] grid-rows-2 gap-1 p-7"><span className="row-span-2 bg-[var(--chart-blue)]" /><span className="bg-[var(--chart-green)]" /><span className="bg-[var(--chart-amber)]" /><span className="col-span-2 bg-[var(--chart-coral)]" /></div>;
  }

  if (kind === "heatmap") {
    return <div className="grid h-full grid-cols-6 gap-1.5 p-7">{Array.from({ length: 24 }, (_, index) => <span key={index} className="rounded-[2px] bg-[var(--chart-blue)]" style={{ opacity: 0.18 + ((index * 7) % 10) / 12 }} />)}</div>;
  }

  if (kind === "scatter") {
    return <div className="relative h-full">{[[18,70],[28,58],[37,62],[46,42],[54,49],[62,31],[73,36],[81,20],[67,56],[42,72]].map(([left, top], index) => <span key={`${left}-${top}`} className="absolute size-2.5 rounded-full bg-[var(--chart-violet)]" style={{ left: `${left}%`, top: `${top}%`, opacity: 0.55 + index / 25 }} />)}</div>;
  }

  if (kind === "funnel") {
    return <div className="flex h-full flex-col items-center justify-center gap-2">{[86,68,50,34].map((width, index) => <span key={width} className="h-6 rounded-[2px]" style={{ width: `${width}%`, background: `var(--chart-${["blue","green","amber","coral"][index]})` }} />)}</div>;
  }

  if (kind === "gauge") {
    return <div className="grid h-full place-items-center"><div className="relative h-16 w-32 overflow-hidden"><div className="absolute inset-0 rounded-t-full border-[16px] border-b-0 border-muted" /><div className="absolute inset-0 rounded-t-full border-[16px] border-b-0 border-[var(--chart-green)] [clip-path:polygon(0_0,72%_0,50%_100%,0_100%)]" /></div></div>;
  }

  if (kind === "radar") {
    return <div className="grid h-full place-items-center"><div className="size-28 bg-[color-mix(in_srgb,var(--chart-violet)_28%,transparent)] outline outline-1 outline-[var(--chart-violet)] [clip-path:polygon(50%_0,93%_25%,82%_78%,50%_100%,10%_72%,7%_25%)]" /></div>;
  }

  const isArea = kind === "area";
  return (
    <svg aria-hidden="true" viewBox="0 0 320 160" className="h-full w-full p-5">
      {isArea && <path d="M15 132 L56 98 L94 112 L132 64 L171 82 L215 36 L258 61 L305 22 L305 145 L15 145 Z" fill="color-mix(in srgb, var(--chart-blue) 22%, transparent)" />}
      <path d="M15 132 L56 98 L94 112 L132 64 L171 82 L215 36 L258 61 L305 22" fill="none" stroke="var(--chart-blue)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ComponentsContent() {
  return (
    <article className="pb-20">
      <header className="border-b pb-10">
        <p className="mb-3 text-sm font-medium text-muted-foreground">Component registry</p>
        <h1 className="text-4xl font-semibold tracking-normal">Charts</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Choose a chart by the analytical question you need to answer. Every component includes source, live examples, API details, and accessible states.</p>
      </header>

      <div className="divide-y">
        {groups.map((group) => (
          <section key={group.title} aria-labelledby={group.title.toLowerCase().replaceAll(" ", "-")} className="py-10">
            <div className="mb-6 grid gap-2 sm:grid-cols-[190px_1fr] sm:gap-8">
              <h2 id={group.title.toLowerCase().replaceAll(" ", "-")} className="text-lg font-semibold">{group.title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{group.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.charts.map((chart) => (
                <Link key={chart.name} href={chart.href} aria-label={chart.name} className="group overflow-hidden rounded-md border bg-card transition-colors duration-150 hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="aspect-[16/9] border-b bg-muted/35 transition-colors duration-150 group-hover:bg-muted/55"><ChartThumbnail kind={chart.kind} /></div>
                  <div className="flex min-h-28 items-start justify-between gap-4 p-4">
                    <div><div className="flex items-center gap-2"><h3 className="font-semibold">{chart.name}</h3><span className="font-mono text-[10px] uppercase text-muted-foreground">{chart.meta}</span></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{chart.description}</p></div>
                    <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
