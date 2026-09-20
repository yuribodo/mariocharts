"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { LineChart } from "@/src/components/charts/line-chart";
import { APIReference } from "../../../../components/ui/api-reference";
import { CodeBlock } from "../../../../components/ui/code-block";
import { CommandSnippet } from "../../../../components/ui/command-snippet";

type Row = {
  month: string;
  revenue: number | string | null;
  costs: number | null;
};
const revenue: readonly Row[] = [
  { month: "Jan", revenue: 4500, costs: 3200 },
  { month: "Feb", revenue: 5200, costs: 3800 },
  { month: "Mar", revenue: 4800, costs: 3400 },
  { month: "Apr", revenue: 6100, costs: 4100 },
  { month: "May", revenue: 5900, costs: 3900 },
  { month: "Jun", revenue: 7200, costs: 4600 },
];
const datasets: Record<string, readonly Row[]> = {
  revenue,
  gaps: revenue.map((row, i) => ({
    ...row,
    revenue: i === 2 || i === 4 ? null : row.revenue,
  })),
  signed: revenue.map((row, i) => ({
    ...row,
    revenue: [4500, -2200, 0, 6100, -3800, 7200][i]!,
  })),
  constant: revenue.map((row) => ({ ...row, revenue: 4500, costs: 4500 })),
  single: revenue.slice(0, 1),
  missing: revenue.map((row) => ({ ...row, revenue: null, costs: null })),
  invalid: [{ month: "Jan", revenue: "12abc", costs: 3200 }],
  dense: Array.from({ length: 60 }, (_, i) => ({
    month: `Day ${i + 1}`,
    revenue: Math.round(4500 + Math.sin(i * 0.3) * 1200 + i * 30),
    costs: Math.round(3200 + Math.cos(i * 0.2) * 800),
  })),
};
const seriesKeys = ["revenue", "costs"] as const;
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const example = `import { LineChart } from "@/components/charts/line-chart";

const data = [
  { month: "Jan", revenue: 4500, costs: 3200 },
  { month: "Feb", revenue: 5200, costs: 3800 },
  { month: "Mar", revenue: null, costs: 3400 },
  { month: "Apr", revenue: 6100, costs: 4100 },
];

export function RevenueChart() {
  return (
    <LineChart
      data={data}
      x="month"
      y={["revenue", "costs"]}
      showGrid
      showLegend
      valueFormatter={(value) => "$" + value.toLocaleString("en-US")}
      ariaLabel="Revenue and costs by month"
    />
  );
}`;
const lineChartProps = [
  {
    name: "data",
    type: "readonly T[]",
    description: "Array of data objects to display in the chart",
    required: true,
  },
  {
    name: "x",
    type: "keyof T",
    description: "Key from data object to use for x-axis labels",
    required: true,
  },
  {
    name: "y",
    type: "keyof T | readonly (keyof T)[]",
    description:
      "Key(s) from data object to use for y-axis values. Single key for one line, array for multiple lines",
    required: true,
  },
  {
    name: "colors",
    type: "readonly string[]",
    default: "DEFAULT_COLORS",
    description:
      "Array of colors to use for lines (cycles through for multiple series)",
  },
  {
    name: "strokeWidth",
    type: "number",
    default: "2",
    description: "Width of the line stroke in pixels",
  },
  {
    name: "curve",
    type: "'linear' | 'monotone' | 'natural' | 'step'",
    default: "'monotone'",
    description: "Type of curve interpolation for the line",
  },
  {
    name: "showDots",
    type: "boolean",
    default: "true",
    description:
      "Show triangular markers. Isolated observations remain visible even when dots are hidden.",
  },
  {
    name: "showArea",
    type: "boolean",
    default: "false",
    description:
      "Fill each contiguous segment with a gradient, closing at zero or the nearest domain edge.",
  },
  {
    name: "connectNulls",
    type: "boolean",
    default: "false",
    description:
      "Opt in to connecting observations across missing values. Gaps remain visible by default.",
  },
  {
    name: "height",
    type: "number",
    default: "300",
    description: "Total frame height in pixels, including the legend, in every state",
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: "Show loading state with animated skeleton",
  },
  {
    name: "error",
    type: "string | null",
    default: "null",
    description: "Error message to display",
  },
  {
    name: "animation",
    type: "boolean",
    default: "true",
    description:
      "Reveal lines, areas, and markers together from left to right. Respects reduced motion.",
  },
  {
    name: "onPointClick",
    type: "(data: T, index: number, series?: string) => void",
    description: "Callback fired when a point is clicked",
  },
  {
    name: "showGrid",
    type: "boolean",
    default: "false",
    description: "Show horizontal grid lines. Y-axis tick labels remain visible independently.",
  },
  {
    name: "gridStyle",
    type: "'solid' | 'dashed' | 'dotted'",
    default: "'dashed'",
    description: "Style of the grid lines when showGrid is enabled",
  },
  {
    name: "showLegend",
    type: "boolean",
    default: "false",
    description: "Show legend below the chart for multi-series data",
  },
  {
    name: "className",
    type: "string",
    description: "Additional CSS classes to apply to the container",
  },
  {
    name: "valueFormatter",
    type: "(value: number) => string",
    description:
      "Format tooltip values and accessible labels; also ticks unless overridden.",
  },
  {
    name: "axisValueFormatter",
    type: "(value: number) => string",
    description: "Optional compact tick formatting.",
  },
  {
    name: "ariaLabel",
    type: "string",
    description: "Accessible name for the chart.",
  },
  {
    name: "description",
    type: "string",
    description: "Context, units, or caveats announced with the chart.",
  },
  {
    name: "showAreaForSeries",
    type: "readonly number[]",
    description:
      "Indices in the original y array that receive an area fill when showArea is enabled.",
  },
  {
    name: "tooltipRenderer",
    type: "TooltipRenderer<LineChartTooltipData<T>>",
    description:
      "Custom category tooltip with parsed and original values for each available series.",
  },
];

export function LineChartContent() {
  const [dataset, setDataset] = useState("revenue");
  const [state, setState] = useState("ready");
  const [curve, setCurve] = useState<
    "linear" | "monotone" | "natural" | "step"
  >("monotone");
  const [multi, setMulti] = useState(false);
  const [showDots, setShowDots] = useState(true);
  const [showArea, setShowArea] = useState(false);
  const [connectNulls, setConnectNulls] = useState(false);
  const [animation, setAnimation] = useState(true);
  const [replay, setReplay] = useState(0);
  const [selection, setSelection] = useState<string | null>(null);
  const loading = state === "loading" || state === "initial-loading";
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Components
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Line Chart
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Compare observations in order, inspect every series together, and keep
          missing values visible. Triangular markers and gradient areas come
          ready to use.
        </p>
        <CommandSnippet command="npx mario-charts@latest add line-chart" />
      </header>
      <section aria-labelledby="playground-title" className="space-y-5">
        <div>
          <h2
            id="playground-title"
            className="text-xl font-semibold tracking-tight"
          >
            Playground
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Compare curves, missing observations, loading, and multiple series.
          </p>
        </div>
        <div className="grid overflow-hidden rounded-md border bg-card lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="space-y-5 border-b p-4 lg:border-b-0 lg:border-r">
            <div>
              <h3 className="text-sm font-semibold">Settings</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                The same chart through every state.
              </p>
            </div>
            <label className="grid gap-2 text-sm">
              Data
              <select
                aria-label="Data"
                value={dataset}
                onChange={(e) => {
                  setDataset(e.target.value);
                  setSelection(null);
                }}
                className="h-10 min-w-0 rounded border bg-background px-2"
              >
                <option value="revenue">Monthly revenue</option>
                <option value="gaps">Missing observations</option>
                <option value="signed">Gains, losses & zero</option>
                <option value="constant">Constant values</option>
                <option value="single">Single observation</option>
                <option value="missing">All values missing</option>
                <option value="invalid">Invalid number</option>
                <option value="dense">60 observations</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              State
              <select
                aria-label="State"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setSelection(null);
                }}
                className="h-10 min-w-0 rounded border bg-background px-2"
              >
                <option value="ready">Ready</option>
                <option value="loading">Loading</option>
                <option value="initial-loading">Initial loading</option>
                <option value="empty">Empty</option>
                <option value="error">Error</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Curve
              <select
                aria-label="Curve"
                value={curve}
                onChange={(e) => setCurve(e.target.value as typeof curve)}
                className="h-10 min-w-0 rounded border bg-background px-2"
              >
                <option value="monotone">Monotone</option>
                <option value="linear">Linear</option>
                <option value="natural">Natural</option>
                <option value="step">Step</option>
              </select>
            </label>
            <div className="grid gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={multi}
                  onChange={(e) => setMulti(e.target.checked)}
                />
                Multiple series
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showDots}
                  onChange={(e) => setShowDots(e.target.checked)}
                />
                Show triangles
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showArea}
                  onChange={(e) => setShowArea(e.target.checked)}
                />
                Show area
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={connectNulls}
                  onChange={(e) => setConnectNulls(e.target.checked)}
                />
                Connect missing values
              </label>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={animation}
                  onChange={(e) => setAnimation(e.target.checked)}
                />
                Animate
              </label>
              <button
                type="button"
                aria-label="Replay animation"
                onClick={() => setReplay((value) => value + 1)}
                disabled={!animation || loading}
                className="rounded border p-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8">
            <div className="mb-6">
              <h3 className="font-medium">
                {multi ? "Revenue & costs" : "Monthly revenue"}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {dataset === "dense" ? "60 observations" : "January–June"} · USD
              </p>
            </div>
            <LineChart
              key={replay}
              data={
                state === "empty" || state === "initial-loading"
                  ? []
                  : datasets[dataset]!
              }
              x="month"
              y={multi ? seriesKeys : "revenue"}
              curve={curve}
              showDots={showDots}
              showArea={showArea}
              showGrid
              showLegend={multi}
              connectNulls={connectNulls}
              animation={animation}
              loading={loading}
              error={
                state === "error"
                  ? "Could not load revenue. Try again when your connection is restored."
                  : null
              }
              valueFormatter={currency.format}
              axisValueFormatter={compactCurrency.format}
              ariaLabel="Monthly observations in USD"
              description="Categories are equally spaced in input order. Missing values are not zero."
              onPointClick={(row, _, series) => {
                const value = series === "costs" ? row.costs : row.revenue;
                setSelection(
                  `${row.month} · ${series}: ${typeof value === "number" ? currency.format(value) : value}`,
                );
              }}
            />
            <p
              role="status"
              className="mt-5 text-xs leading-5 text-muted-foreground"
            >
              {loading
                ? "Loading chart…"
                : selection
                  ? `Selected ${selection}`
                  : "Hover or tap to inspect. Use ← → for observations, ↑ ↓ for series, and Enter to select."}
            </p>
          </div>
        </div>
        <CodeBlock code={example} language="tsx" />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Choose what the line means</h2>
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="p-3 font-medium">Curve</th>
                <th className="p-3 font-medium">Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-3">Monotone</td>
                <td className="p-3 text-muted-foreground">
                  Smooth interpolation that avoids creating peaks or troughs
                  between observations.
                </td>
              </tr>
              <tr>
                <td className="p-3">Linear</td>
                <td className="p-3 text-muted-foreground">
                  Straight segments between measured values.
                </td>
              </tr>
              <tr>
                <td className="p-3">Step</td>
                <td className="p-3 text-muted-foreground">
                  Horizontal plateaus with a change halfway between categories.
                </td>
              </tr>
              <tr>
                <td className="p-3">Natural</td>
                <td className="p-3 text-muted-foreground">
                  A natural cubic spline. It can overshoot between observations;
                  choose monotone when that would be misleading.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Data and state contracts</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-medium">Missing is not zero</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Use null or undefined for an unmeasured value. Lines and areas
              break at those observations by default. Set connectNulls to true
              only when joining them is intentional. Malformed numbers show an
              actionable error.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Upgrading an existing chart? connectNulls previously defaulted to
              true; pass it explicitly to keep bridging gaps. Invalid numeric
              strings must be normalized before rendering.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">A stable frame</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Loading, error, empty, and ready keep the requested height. Retain
              data while refreshing for an identical skeleton. Before data
              arrives, the skeleton uses neutral placeholders.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">One comparable unit</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              All series share one Y-axis. Compare values in the same unit. X
              labels are equally spaced categories, even when they contain
              dates; irregular time intervals need a continuous time scale.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Inspect without visible dots</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              The entire category band supports hover, touch, and keyboard
              inspection. All available series appear together. An isolated
              observation remains visible, including when showDots is false.
            </p>
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">API Reference</h2>
        <APIReference props={lineChartProps} />
      </section>
    </div>
  );
}
