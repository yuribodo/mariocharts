"use client";

import { useState } from "react";
import {
  ChartBar,
  ChartColumn,
  Check,
  Database,
  LoaderCircle,
  RotateCcw,
  Square,
  SquareDashed,
  TriangleAlert,
} from "lucide-react";
import { BarChart } from "@/src/components/charts/bar-chart";
import { APIReference } from "../../../../components/ui/api-reference";
import { CodeBlock } from "../../../../components/ui/code-block";
import { CommandSnippet } from "../../../../components/ui/command-snippet";
import { SegmentedControl } from "../../../../components/ui/segmented-control";

const monthlyRevenue = [
  { month: "Jan", revenue: 4500 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 5900 },
  { month: "Jun", revenue: 7200 },
] as const;

const datasets = {
  revenue: monthlyRevenue,
  signed: [
    { month: "Jan", revenue: 4500 },
    { month: "Feb", revenue: -2200 },
    { month: "Mar", revenue: 0 },
    { month: "Apr", revenue: 6100 },
    { month: "May", revenue: -3800 },
    { month: "Jun", revenue: 7200 },
  ],
  zero: monthlyRevenue.map((row) => ({ ...row, revenue: 0 })),
  invalid: [
    { month: "Jan", revenue: 4500 },
    { month: "Feb", revenue: null },
  ],
} satisfies Record<
  string,
  readonly { month: string; revenue: number | null }[]
>;

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

const chartColors = [
  "var(--chart-blue)",
  "var(--chart-green)",
  "var(--chart-amber)",
  "var(--chart-coral)",
  "var(--chart-violet)",
  "var(--chart-cyan)",
];

const exampleCode = `import { BarChart } from "@/components/charts/bar-chart";

const data = [
  { month: "Jan", revenue: 4500 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 6100 },
];

export function RevenueChart() {
  return (
    <BarChart
      data={data}
      x="month"
      y="revenue"
      showGrid
    />
  );
}`;

const barChartProps = [
  {
    name: "data",
    type: "readonly T[]",
    description: "Data objects rendered by the chart.",
    required: true,
  },
  {
    name: "x",
    type: "keyof T",
    description: "Property used for category labels.",
    required: true,
  },
  {
    name: "y",
    type: "keyof T",
    default: '"value"',
    description: "Property used for numeric values.",
  },
  {
    name: "colors",
    type: "readonly string[]",
    default: "chart palette",
    description: "Colors applied to bars in order.",
  },
  {
    name: "variant",
    type: '"filled" | "outline"',
    default: '"filled"',
    description: "Visual treatment for each bar.",
  },
  {
    name: "orientation",
    type: '"vertical" | "horizontal"',
    default: '"vertical"',
    description: "Direction in which bars grow.",
  },
  {
    name: "height",
    type: "number",
    default: "300",
    description: "Chart height in pixels.",
  },
  {
    name: "showGrid",
    type: "boolean",
    default: "false",
    description: "Displays grid lines and value ticks.",
  },
  {
    name: "animation",
    type: "boolean",
    default: "true",
    description: "Enables the entrance animation.",
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: "Displays the loading state.",
  },
  {
    name: "error",
    type: "string | null",
    default: "null",
    description: "Displays an actionable error state.",
  },
  {
    name: "showValues",
    type: "boolean",
    default: "false",
    description: "Shows formatted values on the plot.",
  },
  {
    name: "gridStyle",
    type: '"solid" | "dashed" | "dotted"',
    default: '"dashed"',
    description: "Grid line treatment.",
  },
  {
    name: "className",
    type: "string",
    description:
      "Classes on the persistent chart frame, including loading/error/empty states.",
  },
  {
    name: "valueFormatter",
    type: "(value: number) => string",
    description:
      "Formats inspection, value labels, accessible values, and ticks by default.",
  },
  {
    name: "axisValueFormatter",
    type: "(value: number) => string",
    description: "Optional compact formatter for axis ticks.",
  },
  { name: "ariaLabel", type: "string", description: "Accessible chart name." },
  {
    name: "description",
    type: "string",
    description: "Additional chart context, units, or interpretation.",
  },
  {
    name: "tooltipRenderer",
    type: "(data: BarChartTooltipData<T>) => ReactNode",
    description:
      "Presentational custom tooltip. Receives numeric value, raw value, original row, label, color, and index.",
  },
  {
    name: "onBarClick",
    type: "(data: T, index: number) => void",
    description: "Runs when a bar is selected.",
  },
];

type Orientation = "vertical" | "horizontal";
type Variant = "filled" | "outline";

const productionStates = [
  {
    title: "Loading",
    description: "Keeps the chart frame stable while data is being resolved.",
    prop: "loading={true}",
    icon: LoaderCircle,
    color: "var(--chart-blue)",
  },
  {
    title: "Error",
    description:
      "Replaces the plot with an actionable message without shifting the layout.",
    prop: 'error="Could not load data"',
    icon: TriangleAlert,
    color: "var(--chart-coral)",
  },
  {
    title: "Empty",
    description:
      "Explains that no values are available instead of rendering an empty plot.",
    prop: "data={[]}",
    icon: Database,
    color: "var(--chart-violet)",
  },
] as const;

const orientationOptions = [
  { value: "vertical", label: "Vertical", icon: ChartColumn },
  { value: "horizontal", label: "Horizontal", icon: ChartBar },
] as const;

const appearanceOptions = [
  { value: "filled", label: "Filled", icon: Square },
  { value: "outline", label: "Outline", icon: SquareDashed },
] as const;

export function BarChartContent() {
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [variant, setVariant] = useState<Variant>("filled");
  const [animation, setAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);
  const [dataset, setDataset] = useState<keyof typeof datasets>("revenue");
  const [chartState, setChartState] = useState("ready");
  const [selection, setSelection] = useState<string | null>(null);

  return (
    <article className="space-y-16 pb-20">
      <header className="border-b pb-10 pt-3">
        <p className="mb-3 font-mono text-xs uppercase text-muted-foreground">
          Charts / Categorical
        </p>
        <h1 className="text-4xl font-semibold tracking-normal">Bar Chart</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          Compare values across categories with accessible interactions,
          responsive layouts, and useful production states built in.
        </p>
        <ul
          className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
          aria-label="Component qualities"
        >
          {[
            "Type-safe",
            "Keyboard accessible",
            "Responsive",
            "Copy-paste ready",
          ].map((quality) => (
            <li key={quality} className="flex items-center gap-2">
              <Check
                className="size-3.5 text-[var(--chart-green)]"
                aria-hidden="true"
              />
              {quality}
            </li>
          ))}
        </ul>
        <div className="mt-8 max-w-xl">
          <CommandSnippet
            command="npx mario-charts@latest add bar-chart"
            label="Install Bar Chart"
          />
        </div>
      </header>

      <section aria-labelledby="playground-title" className="space-y-5">
        <div>
          <h2 id="playground-title" className="text-2xl font-semibold">
            Playground
          </h2>
          <p className="mt-2 text-muted-foreground">
            Start with the default, then adjust only what your data needs.
          </p>
        </div>

        <div className="grid overflow-hidden rounded-md border bg-card md:grid-cols-[240px_minmax(0,1fr)]">
          <aside
            className="border-b bg-muted/20 p-4 md:border-b-0 md:border-r"
            aria-label="Chart settings"
          >
            <div className="mb-5">
              <h3 className="text-sm font-semibold">Settings</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Explore the same chart with different data and states.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-1">
              <label className="grid gap-2 text-sm">
                Data
                <select
                  aria-label="Data"
                  value={dataset}
                  onChange={(event) => {
                    setDataset(event.target.value as keyof typeof datasets);
                    setSelection(null);
                  }}
                  className="h-10 min-w-0 rounded border bg-background px-2"
                >
                  <option value="revenue">Monthly revenue</option>
                  <option value="signed">Gains, losses & zero</option>
                  <option value="zero">All zero values</option>
                  <option value="invalid">Missing value</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                State
                <select
                  aria-label="State"
                  value={chartState}
                  onChange={(event) => {
                    setChartState(event.target.value);
                    setSelection(null);
                  }}
                  className="h-10 min-w-0 rounded border bg-background px-2"
                >
                  <option value="ready">Ready</option>
                  <option value="loading">Loading</option>
                  <option value="initial-loading">Initial loading</option>
                  <option value="error">Error</option>
                  <option value="empty">Empty</option>
                </select>
              </label>
              <SegmentedControl
                label="Orientation"
                description="Direction of comparison."
                value={orientation}
                options={orientationOptions}
                onChange={setOrientation}
              />

              <SegmentedControl
                label="Appearance"
                description="Visual weight of the bars."
                value={variant}
                options={appearanceOptions}
                onChange={setVariant}
              />
            </div>

            <div className="mt-5 flex items-center justify-between border-t pt-4">
              <label className="flex min-h-10 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={animation}
                  onChange={(event) => setAnimation(event.target.checked)}
                  className="size-4 accent-foreground"
                />
                Animate
              </label>
              <button
                type="button"
                onClick={() => setChartKey((key) => key + 1)}
                disabled={!animation}
                className="inline-flex size-10 items-center justify-center rounded border bg-background text-muted-foreground transition-colors hover:text-foreground active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Replay animation"
                title="Replay animation"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
              </button>
            </div>
          </aside>

          <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8">
            <div className="mb-6">
              <h3 className="font-medium">
                {dataset === "signed" ? "Net change" : "Monthly revenue"}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                January–June · USD
              </p>
            </div>
            <BarChart
              key={chartKey}
              data={
                chartState === "empty" || chartState === "initial-loading"
                  ? []
                  : datasets[dataset]
              }
              x="month"
              y="revenue"
              colors={chartColors}
              orientation={orientation}
              variant={variant}
              animation={animation}
              showGrid
              loading={
                chartState === "loading" || chartState === "initial-loading"
              }
              error={
                chartState === "error"
                  ? "Could not load revenue. Try again when your connection is restored."
                  : null
              }
              valueFormatter={currency.format}
              axisValueFormatter={compactCurrency.format}
              ariaLabel={
                dataset === "signed" ? "Net change by month" : "Monthly revenue"
              }
              description="January through June, in US dollars."
              onBarClick={(row) => {
                if (row.revenue !== null)
                  setSelection(`${row.month}: ${currency.format(row.revenue)}`);
              }}
            />
            <p
              className="mt-5 text-xs leading-5 text-muted-foreground"
              role="status"
            >
              {chartState === "loading" || chartState === "initial-loading"
                ? "Loading chart…"
                : selection
                  ? `Selected ${selection}`
                  : "Hover or tap to inspect. Use Tab, then arrow keys to move between bars."}
            </p>
          </div>
        </div>

        <CodeBlock code={exampleCode} language="tsx" />
      </section>

      <section aria-labelledby="states-title" className="space-y-5">
        <div>
          <h2 id="states-title" className="text-2xl font-semibold">
            Resilient by default
          </h2>
          <p className="mt-2 text-muted-foreground">
            Built-in states preserve context when the data is not ready to
            render.
          </p>
        </div>
        <ul className="divide-y overflow-hidden rounded-md border bg-card">
          {productionStates.map((state) => {
            const Icon = state.icon;
            return (
              <li
                key={state.title}
                className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6"
              >
                <div className="flex min-w-0 gap-3">
                  <span
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded border bg-background"
                    style={{ color: state.color }}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-medium">{state.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {state.description}
                    </p>
                  </div>
                </div>
                <code className="w-fit rounded border bg-muted/35 px-2.5 py-1.5 font-mono text-xs text-muted-foreground">
                  {state.prop}
                </code>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="data-contract-title" className="space-y-5">
        <div>
          <h2 id="data-contract-title" className="text-2xl font-semibold">
            Real data, predictable behavior
          </h2>
          <p className="mt-2 text-muted-foreground">
            Positive and negative values share a zero baseline. Zero remains
            inspectable; missing values never become zero.
          </p>
        </div>
        <div className="space-y-3 text-sm leading-7 text-muted-foreground">
          <p>
            Pass finite numbers whenever possible. Numeric strings such as{" "}
            <code>&quot;1,250.50&quot;</code>, <code>&quot;$1,250&quot;</code>,
            and <code>&quot;15%&quot;</code> are accepted (15% means 15
            percentage points). Empty, missing, infinite, or ambiguous values
            display an error identifying the row and key. Normalize localized
            numbers before plotting.
          </p>
          <p>
            <code>valueFormatter</code> controls tooltip, value-label, and
            accessible text. Use <code>axisValueFormatter</code> for compact
            ticks. Custom tooltip payloads retain numeric values and the
            original row.
          </p>
          <p>
            Switch the state above from Loading, Error, or Empty back to Ready:
            the chart keeps its frame and recovers without a remount. Arrow keys
            inspect every bar in either visual variant; Enter or Space activates
            a selectable bar, and Escape closes its tooltip.
          </p>
        </div>
        <CodeBlock
          language="tsx"
          code={`const currency = new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", maximumFractionDigits: 0,
});

<BarChart
  data={[{ month: "Jan", net: 4500 }, { month: "Feb", net: -2200 }]}
  x="month"
  y="net"
  valueFormatter={currency.format}
  ariaLabel="Net change by month"
  description="Amounts in US dollars."
  showGrid
/>`}
        />
      </section>

      <section aria-labelledby="decisions-title" className="space-y-5">
        <div>
          <h2 id="decisions-title" className="text-2xl font-semibold">
            Choose the right orientation
          </h2>
          <p className="mt-2 text-muted-foreground">
            The shape of the labels should decide the layout.
          </p>
        </div>
        <div className="grid divide-y rounded-md border md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="p-5">
            <h3 className="font-medium">Vertical</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Best for short category labels and chronological comparison.
            </p>
          </div>
          <div className="p-5">
            <h3 className="font-medium">Horizontal</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Best for long labels, rankings, and dense category lists.
            </p>
          </div>
        </div>
      </section>

      <APIReference
        title="API Reference"
        description="The core surface stays small; advanced behavior remains explicit."
        props={barChartProps}
      />
    </article>
  );
}
