"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { AreaChart } from "@/src/components/charts/area-chart";
import { BarChart } from "@/src/components/charts/bar-chart";
import { LineChart } from "@/src/components/charts/line-chart";
import { PieChart } from "@/src/components/charts/pie-chart";
import { RadarChart } from "@/src/components/charts/radar-chart";
import { TreeMapChart } from "@/src/components/charts/treemap-chart";

import { CHART_INDEX } from "./chart-index-data";

interface ChartIndexSectionProps {
  className?: string;
}

/**
 * Charts mark every bar, point and tile with tabIndex={0} so they can be keyed.
 * In a preview those marks are decoration inside a link: leaving them in the
 * tab order puts focusable elements inside an aria-hidden subtree — which ARIA
 * forbids — and buries the six real destinations under about thirty stops.
 *
 * `inert` takes the whole subtree out of focus and out of the accessibility
 * tree. It is set from an effect rather than written as JSX: React 18's client
 * renderer emits an `inert` attribute but its server renderer drops it, and
 * hydration does not reconcile attribute mismatches — so writing it inline
 * passes a client-render test while never reaching the real page.
 */
function ChartPreview({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.setAttribute("inert", "");
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="h-40 w-full overflow-hidden"
    >
      {children}
    </div>
  );
}

/** Every preview is the same height so hovering a cell never shifts the grid. */
const PREVIEW_HEIGHT = 160;

const PREVIEW_COLORS = [
  "var(--chart-blue)",
  "var(--chart-green)",
  "var(--chart-amber)",
  "var(--chart-coral)",
  "var(--chart-violet)",
] as const;

const monthlyRevenue = [
  { month: "Jan", revenue: 4500 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 5900 },
  { month: "Jun", revenue: 7200 },
] as const;

const weeklyTraffic = [
  { day: "Mon", visitors: 3200 },
  { day: "Tue", visitors: 4100 },
  { day: "Wed", visitors: 3800 },
  { day: "Thu", visitors: 5200 },
  { day: "Fri", visitors: 4900 },
  { day: "Sat", visitors: 2600 },
] as const;

const marketShare = [
  { company: "Apple", share: 28.5 },
  { company: "Samsung", share: 23.1 },
  { company: "Xiaomi", share: 12.8 },
  { company: "Oppo", share: 9.2 },
  { company: "Others", share: 26.4 },
] as const;

/**
 * One series, deliberately: RadarChart reserves 50px for a legend as soon as
 * there is more than one, which at preview height leaves a radius of a few
 * pixels and draws nothing.
 */
const skillSeries = [
  {
    id: "fullstack",
    name: "Full Stack",
    data: { frontend: 85, backend: 88, database: 80, devops: 70, design: 55 },
  },
];

const skillAxes = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "database", label: "Database" },
  { key: "devops", label: "DevOps" },
  { key: "design", label: "Design" },
];

/**
 * Flat, with values close enough together that squarify produces actual
 * rectangles. Nested data with steep value gaps degenerates into full-width
 * rows in a landscape box, which reads as a stacked bar and misrepresents the
 * component.
 */
const revenueTree = [
  { name: "Cloud", value: 42000 },
  { name: "Devices", value: 31000 },
  { name: "Software", value: 24000 },
  { name: "Services", value: 18000 },
  { name: "Support", value: 11000 },
] as const;

/**
 * Previews are keyed by the index entry they illustrate. Animation is off on
 * every one: six charts animating at once is decoration, and the grid has to
 * look the same with reduced motion as without it.
 */
const PREVIEWS: Record<string, ReactNode> = {
  "Bar Chart": (
    <BarChart
      data={monthlyRevenue}
      x="month"
      y="revenue"
      colors={PREVIEW_COLORS}
      height={PREVIEW_HEIGHT}
      animation={false}
    />
  ),
  "Line Chart": (
    <LineChart
      data={monthlyRevenue}
      x="month"
      y="revenue"
      colors={PREVIEW_COLORS}
      height={PREVIEW_HEIGHT}
      animation={false}
    />
  ),
  "Area Chart": (
    <AreaChart
      data={weeklyTraffic}
      x="day"
      y="visitors"
      colors={PREVIEW_COLORS}
      height={PREVIEW_HEIGHT}
      animation={false}
    />
  ),
  "Pie Chart": (
    <PieChart
      data={marketShare}
      value="share"
      label="company"
      variant="donut"
      colors={PREVIEW_COLORS}
      height={PREVIEW_HEIGHT}
      animation={false}
    />
  ),
  "Radar Chart": (
    <RadarChart
      series={skillSeries}
      axes={skillAxes}
      colors={PREVIEW_COLORS}
      labelOffset={16}
      height={PREVIEW_HEIGHT}
      animation={false}
    />
  ),
  /*
    No colors override here: TreeMapChart derives its per-tile shade by
    appending a hex alpha suffix to the colour string, so a var(--chart-*)
    value concatenates into invalid CSS and every tile renders black. Its own
    default palette is hex and works.
  */
  Treemap: (
    <TreeMapChart data={revenueTree} height={PREVIEW_HEIGHT} animation={false} />
  ),
};

/**
 * Chart Index Section
 *
 * A preview-first index of the components the library ships. Each cell renders
 * the real component, not an illustration of one, and links to its docs page.
 */
export function ChartIndexSection({ className }: ChartIndexSectionProps) {
  return (
    <section
      aria-labelledby="chart-index-title"
      className={cn("border-t py-16 lg:py-24", className)}
    >
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Components
        </p>
        <h2
          id="chart-index-title"
          className="mt-2 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl"
        >
          These are the components you install.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          These previews render the same code the CLI writes into your project.
          Open one to read its props and copy it.
        </p>

        <div className="mt-10 grid overflow-hidden rounded-md border-l border-t sm:grid-cols-2 lg:grid-cols-3">
          {CHART_INDEX.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="group flex flex-col border-b border-r p-5 transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:scale-[0.99] motion-reduce:transition-none [@media(hover:hover)]:hover:bg-accent"
            >
              <ChartPreview>{PREVIEWS[entry.name]}</ChartPreview>
              <span className="mt-4 text-sm font-medium text-foreground">
                {entry.name}
              </span>
              <span className="mt-1 text-sm leading-6 text-muted-foreground">
                {entry.summary}
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/docs/components"
          className="group mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-foreground transition-[opacity] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none [@media(hover:hover)]:hover:opacity-80"
        >
          Browse all components
          <ArrowRight
            className="size-4 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}
