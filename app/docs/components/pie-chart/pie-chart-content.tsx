"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { PieChart } from "@/src/components/charts/pie-chart";
import { APIReference } from "../../../../components/ui/api-reference";
import { CodeBlock } from "../../../../components/ui/code-block";
import { CommandSnippet } from "../../../../components/ui/command-snippet";

type Row = { plan: string; revenue: number | string | null };
const plans: readonly Row[] = [
  { plan: "Starter", revenue: 1800 },
  { plan: "Pro", revenue: 4200 },
  { plan: "Team", revenue: 3200 },
  { plan: "Enterprise", revenue: 2800 },
];
const datasets: Record<string, readonly Row[]> = {
  plans,
  zeros: [{ plan: "Free", revenue: 0 }, ...plans],
  single: [{ plan: "Pro", revenue: 12000 }],
  tiny: [
    { plan: "Pro", revenue: 11980 },
    { plan: "Starter", revenue: 15 },
    { plan: "Team", revenue: 5 },
  ],
  long: plans.map((row) => ({
    ...row,
    plan: `${row.plan} · annual subscription revenue`,
  })),
  allZero: plans.map((row) => ({ ...row, revenue: 0 })),
  negative: [
    { plan: "Refunds", revenue: -120 },
    { plan: "Pro", revenue: 800 },
  ],
  missing: [
    { plan: "Pro", revenue: null },
    { plan: "Team", revenue: 800 },
  ],
  invalid: [{ plan: "Pro", revenue: "12abc" }],
};
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const compact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const example = `import { PieChart } from "@/components/charts/pie-chart";

const data = [
  { plan: "Starter", revenue: 1800 },
  { plan: "Pro", revenue: 4200 },
  { plan: "Team", revenue: 3200 },
  { plan: "Enterprise", revenue: 2800 },
];

export function RevenueByPlan() {
  return (
    <PieChart
      data={data}
      label="plan"
      value="revenue"
      variant="donut"
      cornerRadius={8}
      showLegend
      valueFormatter={(value) => "$" + value.toLocaleString("en-US")}
      ariaLabel="Revenue share by plan"
    />
  );
}`;
const props = [
  {
    name: "data",
    type: "readonly T[]",
    required: true,
    description:
      "Observations with finite, nonnegative values. Zero rows have no slice.",
  },
  {
    name: "value",
    type: "keyof T",
    required: true,
    description:
      "Numeric value key. Missing and malformed values produce an error.",
  },
  {
    name: "label",
    type: "keyof T",
    required: true,
    description:
      "Category label key; labels remain available through inspection.",
  },
  {
    name: "variant",
    type: "'pie' | 'donut' | 'semi'",
    default: "'donut'",
    description:
      "Full pie, donut, or upper semicircle, all within the requested frame height.",
  },
  {
    name: "innerRadius",
    type: "number",
    default: "0.6",
    description:
      "Fraction of outer radius, from 0 inclusive to 1 exclusive. Ignored for pie.",
  },
  {
    name: "cornerRadius",
    type: "number",
    default: "0",
    description:
      "Slice corner radius in pixels. Use 0 for flat edges or 8 for rounded corners. Automatically limited for small slices and thin rings; full circles have no corners.",
  },
  {
    name: "centerContent",
    type: "ReactNode | ((data: { total: number; items: readonly T[] }) => ReactNode)",
    description:
      "Content inside the donut or semicircle hole. Keep it compact; it is constrained to the hole.",
  },
  {
    name: "height",
    type: "number",
    default: "300",
    description:
      "Total height including the optional legend, in every variant and state.",
  },
  {
    name: "colors",
    type: "readonly string[]",
    default: "DEFAULT_COLORS",
    description:
      "Colors follow original row indices, including when zero rows are skipped.",
  },
  {
    name: "showLegend",
    type: "boolean",
    default: "false",
    description:
      "Show category values, including zeros, in a scrollable legend within the frame.",
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description:
      "Retain data for a skeleton matching the exact slice geometry. Without data, use neutral placeholder slices.",
  },
  {
    name: "error",
    type: "string | null",
    default: "null",
    description: "Show an error while retaining the chart frame.",
  },
  {
    name: "animation",
    type: "boolean",
    default: "true",
    description:
      "Reveal slices around the circle with a smooth sweep. The center stays fixed; keyboard focus completes the reveal immediately. Respects reduced motion.",
  },
  {
    name: "onSliceClick",
    type: "(data: T, index: number) => void",
    description:
      "Select a slice with pointer or Enter/Space. Receives the original row and index.",
  },
  {
    name: "tooltipRenderer",
    type: "TooltipRenderer<PieChartTooltipData<T>>",
    description:
      "Custom tooltip with label, parsed value, original rawValue, percentage, color, and original index.",
  },
  {
    name: "valueFormatter",
    type: "(value: number) => string",
    description:
      "Format values in tooltips, the legend, and accessible slice labels.",
  },
  {
    name: "percentageFormatter",
    type: "(percentage: number) => string",
    description:
      "Format a percentage from 0 to 100. Defaults to one decimal at most; tiny shares use <0.1% and nearly complete shares use >99.9%.",
  },
  { name: "ariaLabel", type: "string", description: "Accessible chart name." },
  {
    name: "description",
    type: "string",
    description:
      "Additional context, units, or caveats announced with the chart.",
  },
  {
    name: "className",
    type: "string",
    description: "Classes applied to the outer frame in every state.",
  },
];

export function PieChartContent() {
  const [dataset, setDataset] = useState("plans");
  const [state, setState] = useState("ready");
  const [variant, setVariant] = useState<"pie" | "donut" | "semi">("donut");
  const [radius, setRadius] = useState(0.6);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [showLegend, setShowLegend] = useState(true);
  const [showCenter, setShowCenter] = useState(true);
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
          Pie Chart
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Show how a small set of categories contributes to a whole. Switch
          between pie, donut, and semicircle views with the same data and
          inspection controls.
        </p>
        <CommandSnippet command="npx mario-charts@latest add pie-chart" />
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
            Compare proportions, variants, loading, and edge cases.
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
                <option value="plans">Revenue by plan</option>
                <option value="zeros">Includes zero revenue</option>
                <option value="single">One category · 100%</option>
                <option value="tiny">Small shares</option>
                <option value="long">Long category names</option>
                <option value="allZero">All values zero</option>
                <option value="negative">Negative value</option>
                <option value="missing">Missing value</option>
                <option value="invalid">Invalid number</option>
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
              Variant
              <select
                aria-label="Variant"
                value={variant}
                onChange={(e) => setVariant(e.target.value as typeof variant)}
                className="h-10 min-w-0 rounded border bg-background px-2"
              >
                <option value="pie">Pie</option>
                <option value="donut">Donut</option>
                <option value="semi">Semicircle</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Slice corners
              <select
                aria-label="Slice corners"
                value={cornerRadius}
                onChange={(e) => setCornerRadius(Number(e.target.value))}
                className="h-10 min-w-0 rounded border bg-background px-2"
              >
                <option value={0}>Flat</option>
                <option value={8}>Rounded</option>
                <option value={1000}>Fully rounded</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Inner radius · {Math.round(radius * 100)}%
              <input
                aria-label="Inner radius"
                type="range"
                min="0"
                max="0.9"
                step="0.05"
                value={radius}
                disabled={variant === "pie"}
                onChange={(e) => setRadius(Number(e.target.value))}
              />
            </label>
            <div className="grid gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                />
                Show legend
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showCenter}
                  disabled={variant === "pie"}
                  onChange={(e) => setShowCenter(e.target.checked)}
                />
                Show center total
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
              <h3 className="font-medium">Revenue by plan</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Illustrative monthly revenue · USD
              </p>
            </div>
            <PieChart
              key={replay}
              data={
                state === "empty" || state === "initial-loading"
                  ? []
                  : datasets[dataset]!
              }
              label="plan"
              value="revenue"
              variant={variant}
              innerRadius={radius}
              cornerRadius={cornerRadius}
              showLegend={showLegend}
              animation={animation}
              loading={loading}
              height={340}
              error={
                state === "error"
                  ? "Could not load revenue. Try again when your connection is restored."
                  : null
              }
              valueFormatter={currency.format}
              ariaLabel="Revenue share by plan"
              description="Each slice shows its share of the measured revenue total."
              centerContent={
                showCenter && radius >= 0.35
                  ? ({ total }) => (
                      <div className="min-w-0 space-y-1">
                        <p className="text-[10px] text-muted-foreground">
                          Total
                        </p>
                        <p
                          className="font-semibold tabular-nums"
                          style={{ fontSize: Math.min(22, radius * 32) }}
                        >
                          {compact.format(total)}
                        </p>
                      </div>
                    )
                  : null
              }
              onSliceClick={(row) =>
                setSelection(
                  `${row.plan} · ${typeof row.revenue === "number" ? currency.format(row.revenue) : row.revenue}`,
                )
              }
            />
            <p
              role="status"
              className="mt-5 text-xs leading-5 text-muted-foreground"
            >
              {loading
                ? "Loading chart…"
                : selection
                  ? `Selected ${selection}`
                  : "Hover or tap to inspect. Use arrow keys to move between slices and Enter to select."}
            </p>
          </div>
        </div>
        <CodeBlock code={example} language="tsx" />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Data and state contracts</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-medium">A known whole</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Use finite, nonnegative quantities in the same unit. Missing or
              malformed values make the total unknown and show an error.
              Normalize them explicitly before rendering.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Zero has no slice</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Zero rows remain in the optional legend. They add no angle and do
              not change the colors or callback indices of later rows. An
              all-zero total displays an empty state.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">A stable frame</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Pie, donut, and semicircle use the requested height in every
              state. Retain data during refresh to keep the exact slice
              geometry. Without data, loading uses neutral placeholders.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Small shares stay accessible</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Use arrow keys to inspect small slices that are difficult to
              target. For many categories or precise comparisons, a bar chart
              may communicate the differences more clearly.
            </p>
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          Upgrading? The tooltip’s rawValue now contains the original numeric
          field instead of the category label. Use label for the category. Full
          circles start at the top; semicircles start at the left.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">API Reference</h2>
        <APIReference props={props} />
      </section>
    </div>
  );
}
