"use client";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { ScatterPlot } from "@/src/components/charts/scatter-plot";
import { APIReference } from "../../../../components/ui/api-reference";
import { CodeBlock } from "../../../../components/ui/code-block";
import { CommandSnippet } from "../../../../components/ui/command-snippet";

type Row = {
  campaign: string;
  channel: string;
  spend: number | string | null;
  revenue: number | string | null;
  leads: number | null;
};
const campaigns: readonly Row[] = [
  { campaign: "Launch", channel: "Search", spend: 2, revenue: 8, leads: 100 },
  {
    campaign: "Always on",
    channel: "Search",
    spend: 5,
    revenue: 16,
    leads: 250,
  },
  { campaign: "Spring", channel: "Search", spend: 8, revenue: 25, leads: 400 },
  { campaign: "Discovery", channel: "Social", spend: 3, revenue: 7, leads: 75 },
  {
    campaign: "Community",
    channel: "Social",
    spend: 7,
    revenue: 14,
    leads: 150,
  },
  {
    campaign: "Retargeting",
    channel: "Social",
    spend: 10,
    revenue: 22,
    leads: 300,
  },
];
const datasets: Record<string, readonly Row[]> = {
  campaigns,
  single: campaigns.slice(0, 1),
  overlapping: campaigns.map((row, index) => ({
    ...row,
    spend: index < 3 ? 5 : 8,
    revenue: index < 3 ? 12 : 22,
  })),
  vertical: campaigns.map((row) => ({ ...row, spend: 5 })),
  horizontal: campaigns.map((row) => ({ ...row, revenue: 15 })),
  signed: campaigns.map((row, index) => ({
    ...row,
    spend: Number(row.spend) - 5,
    revenue: Number(row.revenue) - 15,
    channel: index < 3 ? "Search" : "Social",
  })),
  zeroSize: campaigns.map((row, index) => ({
    ...row,
    leads: index === 1 ? 0 : row.leads,
  })),
  equalSize: campaigns.map((row) => ({ ...row, leads: 100 })),
  missing: [{ ...campaigns[0]!, spend: null }],
  invalid: [{ ...campaigns[0]!, revenue: "12oops" }],
  negativeSize: [{ ...campaigns[0]!, leads: -10 }],
  long: campaigns.map((row) => ({
    ...row,
    campaign: `${row.campaign} · international acquisition campaign`,
    channel: `${row.channel} · global marketing team`,
  })),
};
const viewports = {
  auto: {},
  focused: { xDomain: [2, 8] as const, yDomain: [5, 20] as const },
  outside: { xDomain: [40, 50] as const, yDomain: [40, 50] as const },
};
const example = `import { ScatterPlot } from "@/components/charts/scatter-plot";

const data = [
  { campaign: "Launch", channel: "Search", spend: 2, revenue: 8, leads: 100 },
  { campaign: "Spring", channel: "Search", spend: 8, revenue: 25, leads: 400 },
  { campaign: "Discovery", channel: "Social", spend: 3, revenue: 7, leads: 75 },
  { campaign: "Retargeting", channel: "Social", spend: 10, revenue: 22, leads: 300 },
];

export function Campaigns() {
  return <ScatterPlot data={data} x="spend" y="revenue" label="campaign"
    series="channel" size="leads" sizeScale="area" sizeRange={[4, 24]}
    xLabel="Spend ($k)" yLabel="Revenue ($k)" sizeLabel="Leads"
    showLegend showGrid height={400} ariaLabel="Campaign performance" />;
}`;
const props = [
  {
    name: "data",
    type: "readonly T[]",
    required: true,
    description:
      "Observations with finite coordinates. Missing and malformed numbers produce an actionable row/key error.",
  },
  {
    name: "x / y",
    type: "keyof T",
    required: true,
    description:
      "Numeric coordinate keys, inferred from the observation shape.",
  },
  {
    name: "label",
    type: "keyof T",
    description:
      "Point name for tooltips, focus, and the accessible table. Defaults to Point N.",
  },
  {
    name: "series",
    type: "keyof T",
    description:
      "Group/color key. Original group order stays stable when the viewport excludes some observations.",
  },
  {
    name: "size",
    type: "keyof T | number",
    default: "6",
    description:
      "A fixed radius in pixels or a bubble-value key. Keyed values must be finite and nonnegative; zero retains inspection without painted area.",
  },
  {
    name: "sizeScale",
    type: "'area' | 'radius'",
    default: "'area'",
    description:
      "Area uses the square root of value/max, with a minimum positive radius for visibility. Radius preserves the previous linear mapping between observed minimum and maximum.",
  },
  {
    name: "sizeRange",
    type: "readonly [number, number]",
    default: "[4, 40]",
    description:
      "Minimum positive and maximum bubble radii in pixels. Only applies when size is a data key.",
  },
  {
    name: "xDomain / yDomain",
    type: "readonly [number, number]",
    description:
      "Finite increasing viewport bounds. Outside points are clipped, removed from keyboard navigation, and counted visibly; the source data is retained.",
  },
  {
    name: "showTrendLine",
    type: "boolean",
    default: "false",
    description:
      "Per-series linear fit using all observations, clipped to the viewport and limited to observed X. Omitted for insufficient X variation or unrepresentable coefficients.",
  },
  {
    name: "trendLineColor",
    type: "string",
    description: "Override trend stroke color; otherwise use the series color.",
  },
  {
    name: "showGrid",
    type: "boolean",
    default: "false",
    description:
      "Show reference lines only at ticks within the displayed domains.",
  },
  {
    name: "gridStyle",
    type: "'solid' | 'dashed' | 'dotted'",
    default: "'dashed'",
    description: "Reference-grid line style.",
  },
  {
    name: "showLegend",
    type: "boolean",
    default: "false",
    description: "Wrapping legend within the total chart height.",
  },
  {
    name: "height",
    type: "number",
    default: "300",
    description:
      "Total frame height in every state, including legend and any viewport notice.",
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description:
      "Retain observations for a skeleton with identical positions and radii. Without data, show a neutral placeholder.",
  },
  {
    name: "error",
    type: "string | null",
    default: "null",
    description: "Error inside the persistent chart frame.",
  },
  {
    name: "animation",
    type: "boolean",
    default: "true",
    description:
      "Grow radii at fixed coordinates. Grid and trends stay still; keyboard focus completes entrance. Respects reduced motion.",
  },
  {
    name: "xLabel / yLabel / sizeLabel",
    type: "string",
    default: "'X' / 'Y' / 'Size'",
    description: "Axis and inspection labels, including units when relevant.",
  },
  {
    name: "xFormatter / yFormatter / sizeFormatter",
    type: "(value: number) => string",
    default: "formatValue",
    description:
      "Format ticks, inspection, accessible names, and source observations.",
  },
  {
    name: "onPointClick",
    type: "(data: T, index: number, series?: string) => void",
    description:
      "Original row/index and series key, from pointer or Enter/Space. Without it, points advertise inspection rather than a button action.",
  },
  {
    name: "tooltipRenderer",
    type: "TooltipRenderer<ScatterPlotTooltipData<T>>",
    description:
      "Custom tooltip with original data, index, label, numeric/formatted coordinates, bubble value, series key, and color.",
  },
  {
    name: "ariaLabel / description",
    type: "string",
    description:
      "Accessible chart name and context for interpreting the observations.",
  },
  {
    name: "colors",
    type: "readonly string[]",
    default: "DEFAULT_COLORS",
    description: "Series colors in first-appearance order.",
  },
  {
    name: "className",
    type: "string",
    description: "Classes for the persistent outer frame.",
  },
];

export function ScatterPlotContent() {
  const [dataset, setDataset] = useState("campaigns");
  const [state, setState] = useState("ready");
  const [mode, setMode] = useState("scatter");
  const [sizeScale, setSizeScale] = useState<"area" | "radius">("area");
  const [viewport, setViewport] = useState<keyof typeof viewports>("auto");
  const [maxRadius, setMaxRadius] = useState(24);
  const [trend, setTrend] = useState(false);
  const [grid, setGrid] = useState(true);
  const [legend, setLegend] = useState(true);
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
          Scatter Plot
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Explore the relationship between two measurements. Group observations
          by color or use bubble area to show a third value.
        </p>
        <CommandSnippet command="npx mario-charts@latest add scatter-plot" />
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
            Compare points, bubbles, viewports, and trends.
          </p>
        </div>
        <div className="grid overflow-hidden rounded-md border bg-card lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="space-y-5 border-b p-4 lg:border-b-0 lg:border-r">
            <div>
              <h3 className="text-sm font-medium">Settings</h3>
              <p className="mt-1 text-xs text-muted-foreground">
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
                <option value="campaigns">Campaign performance</option>
                <option value="single">Single point</option>
                <option value="overlapping">Overlapping points</option>
                <option value="vertical">Same X</option>
                <option value="horizontal">Same Y</option>
                <option value="signed">Signed values</option>
                <option value="zeroSize">Zero bubble value</option>
                <option value="equalSize">Equal bubble values</option>
                <option value="long">Long labels</option>
                <option value="missing">Missing coordinate</option>
                <option value="invalid">Malformed coordinate</option>
                <option value="negativeSize">Negative bubble value</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              State
              <select
                aria-label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
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
              Mode
              <select
                aria-label="Mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="h-10 min-w-0 rounded border bg-background px-2"
              >
                <option value="scatter">Scatter</option>
                <option value="bubble">Bubble</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Bubble scale
              <select
                aria-label="Bubble scale"
                value={sizeScale}
                disabled={mode !== "bubble"}
                onChange={(e) =>
                  setSizeScale(e.target.value as typeof sizeScale)
                }
                className="h-10 min-w-0 rounded border bg-background px-2 disabled:opacity-50"
              >
                <option value="area">Area</option>
                <option value="radius">Radius</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Viewport
              <select
                aria-label="Viewport"
                value={viewport}
                onChange={(e) => setViewport(e.target.value as typeof viewport)}
                className="h-10 min-w-0 rounded border bg-background px-2"
              >
                <option value="auto">Automatic</option>
                <option value="focused">Focused range</option>
                <option value="outside">Range without points</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Maximum radius · {maxRadius}px
              <input
                aria-label="Maximum radius"
                type="range"
                min={12}
                max={40}
                step={2}
                value={maxRadius}
                disabled={mode !== "bubble"}
                onChange={(e) => setMaxRadius(Number(e.target.value))}
              />
            </label>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={trend}
                  onChange={(e) => setTrend(e.target.checked)}
                />
                Trend lines
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={grid}
                  onChange={(e) => setGrid(e.target.checked)}
                />
                Grid
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={legend}
                  onChange={(e) => setLegend(e.target.checked)}
                />
                Legend
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
                onClick={() => setReplay((v) => v + 1)}
                disabled={!animation || loading}
                className="rounded border p-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8">
            <div className="mb-6">
              <h3 className="font-medium">Campaign performance</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Illustrative spend and revenue · USD thousands
                {mode === "bubble" ? " · bubble value: leads" : ""}
              </p>
            </div>
            <ScatterPlot
              key={replay}
              data={
                state === "empty" || state === "initial-loading"
                  ? []
                  : datasets[dataset]!
              }
              x="spend"
              y="revenue"
              label="campaign"
              series="channel"
              size={mode === "bubble" ? "leads" : 6}
              sizeScale={sizeScale}
              sizeRange={[4, maxRadius]}
              {...viewports[viewport]}
              xLabel="Spend ($k)"
              yLabel="Revenue ($k)"
              sizeLabel="Leads"
              height={400}
              showLegend={legend}
              showGrid={grid}
              showTrendLine={trend}
              animation={animation}
              loading={loading}
              error={
                state === "error"
                  ? "Could not load campaign data. Try again when your connection is restored."
                  : null
              }
              ariaLabel="Campaign performance"
              description="Illustrative campaign observations grouped by channel."
              onPointClick={(row) => setSelection(`Selected ${row.campaign}`)}
            />
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              Hover or tap to inspect. Left/Right follows X order; Up/Down
              switches channel. Enter selects.
            </p>
            <p
              role="status"
              className="mt-2 min-h-5 text-xs text-muted-foreground"
            >
              {selection}
            </p>
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Usage</h2>
        <CodeBlock code={example} language="tsx" />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Reading the chart</h2>
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            Coordinates represent observations and stay fixed during entrance
            and inspection. Bubbles grow at their own coordinates. Area scaling
            makes four times the value produce twice the radius, except where
            the minimum positive radius improves visibility. A zero size has no
            painted area and remains available through keyboard inspection.
          </p>
          <p>
            Explicit domains define the visible window. Outside observations
            retain their original row indices and still contribute to per-series
            trend lines. The chart reports how many points are outside the
            window; clipped points never become invisible keyboard stops.
          </p>
          <p>
            Trend lines describe a linear relationship and do not imply
            causation. Fits stop at the observed X extent. A single point or a
            series with identical X coordinates has no fitted line. Normalize
            missing values before rendering instead of silently discarding
            observations.
          </p>
        </div>
      </section>
      <APIReference props={props} />
    </div>
  );
}
