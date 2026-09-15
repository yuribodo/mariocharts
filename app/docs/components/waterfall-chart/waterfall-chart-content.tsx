"use client";
import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  WaterfallChart,
  type WaterfallVariant,
} from "@/src/components/charts/waterfall-chart";
import { APIReference } from "@/components/ui/api-reference";
import { CodeBlock } from "@/components/ui/code-block";
import { CommandSnippet } from "@/components/ui/command-snippet";

const cash = [
  { label: "Opening", value: 100000, type: "total" },
  { label: "Sales", value: 45000 },
  { label: "Services", value: 22000 },
  { label: "Refunds", value: -12000 },
  { label: "Operations", value: -28000 },
  { label: "Taxes", value: -9000 },
  { label: "Closing", type: "sum" },
];
function fixture(name: string): readonly Record<string, unknown>[] {
  if (name === "profit")
    return [
      { label: "Revenue", value: 180000, type: "total" },
      { label: "Cost of sales", value: -62000 },
      { label: "Gross profit", type: "sum" },
      { label: "Payroll", value: -42000 },
      { label: "Marketing", value: -18000 },
      { label: "Operating profit", type: "sum" },
      { label: "Taxes", value: -12000 },
      { label: "Net profit", type: "sum" },
    ];
  if (name === "revenue")
    return [
      { label: "Starting MRR", value: 82000, type: "total" },
      { label: "New customers", value: 24000 },
      { label: "Expansion", value: 12000 },
      { label: "Reactivation", value: 4000 },
      { label: "Contraction", value: -6000 },
      { label: "Churn", value: -14000 },
      { label: "Ending MRR", type: "sum" },
    ];
  if (name === "periods")
    return [
      { label: "Opening", value: 50000, type: "total" },
      { label: "Jan", value: 20000 },
      { label: "Feb", value: -8000 },
      { label: "Mar", value: 15000 },
      { label: "Q1 change", type: "subtotal" },
      { label: "Apr", value: 10000 },
      { label: "May", value: -18000 },
      { label: "Q2 change", type: "subtotal" },
      { label: "Closing", type: "sum" },
    ];
  if (name === "negative")
    return [
      { label: "Opening", value: 40000, type: "total" },
      { label: "Costs", value: -70000 },
      { label: "Recovery", value: 15000 },
      { label: "Closing", type: "sum" },
    ];
  if (name === "reset")
    return [
      { label: "Opening", value: 100000, type: "total" },
      { label: "Growth", value: 20000 },
      { label: "Rebased", value: 90000, type: "total" },
      { label: "Costs", value: -15000 },
      { label: "Closing", type: "sum" },
    ];
  if (name === "zero")
    return [
      { label: "No sales", value: 0 },
      { label: "No costs", value: 0 },
      { label: "Balance", type: "sum" },
    ];
  if (name === "tiny")
    return [
      { label: "Opening", value: 1000000, type: "total" },
      { label: "Small gain", value: 1 },
      { label: "No change", value: 0 },
      { label: "Small loss", value: -1 },
      { label: "Closing", type: "sum" },
    ];
  if (name === "many")
    return [
      { label: "Opening", value: 100000, type: "total" },
      ...Array.from({ length: 60 }, (_, i) => ({
        label: `Week ${i + 1}`,
        value: i % 3 === 0 ? -2000 : 3000,
      })),
      { label: "Closing", type: "sum" },
    ];
  if (name === "long")
    return cash.map((item) => ({
      ...item,
      label: `${item.label} from international business operations`,
    }));
  if (name === "missing") return [{ label: "Unknown revenue", value: null }];
  if (name === "single")
    return [{ label: "Balance", value: -42000, type: "total" }];
  return cash;
}
const example = `import { WaterfallChart } from "@/components/charts/waterfall-chart";

const steps = [
  { label: "Opening", value: 100000, type: "total" },
  { label: "Sales", value: 45000 },
  { label: "Costs", value: -28000 },
  { label: "Closing", type: "sum" },
] as const;

export function CashFlow() {
  return <WaterfallChart data={steps} height={360}
    showValues showLegend showGrid
    valueFormatter={value => new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD", notation: "compact",
    }).format(value)} />;
}`;
const props = [
  {
    name: "data",
    type: "readonly T[]",
    required: true,
    description:
      "Ordered steps with a label, finite numeric value and optional type. Order determines the running balance; rows are never sorted or silently removed.",
  },
  {
    name: "x / y / type",
    type: "keyof T",
    default: "'label' / 'value' / 'type'",
    description:
      "Keys for labels, values and step types. Missing type infers increase or decrease from the sign.",
  },
  {
    name: "initialValue",
    type: "number",
    default: "0",
    description:
      "Balance before the first step. Use an opening total row when the initial balance should also have a visible bar.",
  },
  {
    name: "orientation",
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description:
      "Horizontal gives long labels more space. Dense sequences scroll inside the fixed frame; keyboard navigation keeps the active step visible.",
  },
  {
    name: "variant",
    type: "'filled' | 'outline'",
    default: "'filled'",
    description:
      "Filled bars emphasize contributions; outlines provide a lighter presentation without changing the calculations.",
  },
  {
    name: "borderRadius / barWidth",
    type: "number",
    default: "3 / 0.65",
    description:
      "Corner radius 0–24px and category-slot width 0.2–0.9. Radius is capped to fit the actual bar.",
  },
  {
    name: "colors",
    type: "WaterfallColors",
    description:
      "CSS colors for increase, decrease, total, subtotal and neutral. Sums use the total color. Colors describe direction, not whether a business outcome is good or bad.",
  },
  {
    name: "showConnectors / connectorStyle",
    type: "boolean / 'solid' | 'dashed' | 'dotted'",
    default: "true / 'dashed'",
    description:
      "Connect the previous balance to the next step. An absolute reset to a different balance breaks the connector and is explained in inspection.",
  },
  {
    name: "showValues / showLegend / showGrid",
    type: "boolean",
    default: "false",
    description:
      "Signed value labels, a legend of present roles, and subtle value grid lines. Labels that cannot fit remain available in inspection and View data.",
  },
  {
    name: "gridStyle",
    type: "'solid' | 'dashed' | 'dotted'",
    default: "'dashed'",
    description: "Style of grid lines. The zero baseline is always visible.",
  },
  {
    name: "valueFormatter",
    type: "(value: number) => string",
    description:
      "Shared formatter for axes, labels, tooltips and data table. Changes get a + prefix; totals show the formatted absolute balance.",
  },
  {
    name: "height",
    type: "number",
    default: "300",
    description:
      "Fixed outer height of at least 180px, including legend and footer.",
  },
  {
    name: "animation",
    type: "boolean",
    default: "true",
    description:
      "Bars grow from their true starting balance, including negative totals. Respects reduced motion; inspection immediately completes the reveal.",
  },
  {
    name: "loading / error",
    type: "boolean / string | null",
    description:
      "Loading preserves data geometry or shows a waterfall skeleton. All states retain the same root and dimensions.",
  },
  {
    name: "onBarClick",
    type: "(data: T, index: number) => void",
    description:
      "Original observation and input index, from pointer, touch, keyboard or View data.",
  },
  {
    name: "tooltipRenderer",
    type: "(data: WaterfallChartTooltipData<T>) => ReactNode",
    description:
      "Original data, index, label, type, signed/computed value, previous balance, geometry start/end, cumulative balance, formatted values and color.",
  },
  {
    name: "ariaLabel / description / className",
    type: "string",
    description: "Accessible chart name, data context and root styling.",
  },
];
export function WaterfallChartContent() {
  const [dataset, setDataset] = useState("cash"),
    [state, setState] = useState("ready"),
    [palette, setPalette] = useState("default");
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">(
    "vertical",
  );
  const [variant, setVariant] = useState<WaterfallVariant>("filled"),
    [connector, setConnector] = useState<"solid" | "dashed" | "dotted">(
      "dashed",
    );
  const [radius, setRadius] = useState(3),
    [barWidth, setBarWidth] = useState(0.65),
    [values, setValues] = useState(true),
    [legend, setLegend] = useState(true),
    [grid, setGrid] = useState(true),
    [connectors, setConnectors] = useState(true),
    [animation, setAnimation] = useState(true),
    [replay, setReplay] = useState(0),
    [selected, setSelected] = useState("");
  const data = useMemo(() => fixture(dataset), [dataset]);
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    [],
  );
  const colors =
    palette === "accessible"
      ? {
          increase: "#3b82f6",
          decrease: "#f97316",
          total: "#64748b",
          subtotal: "#a855f7",
        }
      : palette === "mono"
        ? {
            increase: "var(--primary)",
            decrease: "var(--primary)",
            total: "var(--primary)",
            subtotal: "var(--primary)",
          }
        : palette === "css"
          ? {
              increase: "mediumseagreen",
              decrease: "coral",
              total: "var(--primary)",
              subtotal: "rebeccapurple",
            }
          : undefined;
  const selectClass =
    "h-10 w-full rounded-md border bg-background px-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-xs";
  return (
    <div className="min-w-0 space-y-10">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Components
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Waterfall Chart
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          From opening balance to final result. Show what increased, what
          decreased, and where the changes leave you.
        </p>
        <CommandSnippet command="npx mario-charts@latest add waterfall-chart" />
      </header>
      <section aria-labelledby="waterfall-playground" className="space-y-5">
        <div>
          <h2 id="waterfall-playground" className="text-xl font-semibold">
            Playground
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore balances, period subtotals and the steps between them.
          </p>
        </div>
        <div className="overflow-hidden rounded-md border bg-card">
          <div className="grid grid-cols-2 gap-4 border-b p-4 md:grid-cols-4">
            <label className="grid gap-2 text-xs">
              Dataset
              <select
                aria-label="Dataset"
                className={selectClass}
                value={dataset}
                onChange={(event) => {
                  setDataset(event.target.value);
                  setSelected("");
                }}
              >
                {[
                  ["cash", "Cash flow"],
                  ["profit", "Profit and loss"],
                  ["revenue", "MRR bridge"],
                  ["periods", "Period subtotals"],
                  ["negative", "Crossing zero"],
                  ["reset", "Absolute reset"],
                  ["zero", "All zero"],
                  ["tiny", "Tiny changes"],
                  ["many", "62 steps"],
                  ["long", "Long labels"],
                  ["missing", "Missing value"],
                  ["single", "Single negative total"],
                ].map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-xs">
              Orientation
              <select
                aria-label="Orientation"
                className={selectClass}
                value={orientation}
                onChange={(event) =>
                  setOrientation(event.target.value as typeof orientation)
                }
              >
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs">
              Variant
              <select
                aria-label="Variant"
                className={selectClass}
                value={variant}
                onChange={(event) =>
                  setVariant(event.target.value as WaterfallVariant)
                }
              >
                <option value="filled">Filled</option>
                <option value="outline">Outline</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs">
              Palette
              <select
                aria-label="Palette"
                className={selectClass}
                value={palette}
                onChange={(event) => setPalette(event.target.value)}
              >
                <option value="default">Classic</option>
                <option value="accessible">Blue and orange</option>
                <option value="mono">Monochrome</option>
                <option value="css">CSS colors</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs">
              Connectors
              <select
                aria-label="Connectors"
                className={selectClass}
                value={connector}
                onChange={(event) =>
                  setConnector(event.target.value as typeof connector)
                }
              >
                <option value="dashed">Dashed</option>
                <option value="solid">Solid</option>
                <option value="dotted">Dotted</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs">
              State
              <select
                aria-label="State"
                className={selectClass}
                value={state}
                onChange={(event) => setState(event.target.value)}
              >
                {[
                  ["ready", "Ready"],
                  ["loading", "Refreshing"],
                  ["initial-loading", "Initial loading"],
                  ["empty", "Empty"],
                  ["error", "Error"],
                ].map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-xs">
              Corners · {radius}px
              <input
                className="w-full accent-primary"
                type="range"
                min={0}
                max={16}
                value={radius}
                onChange={(event) => setRadius(Number(event.target.value))}
              />
            </label>
            <label className="grid gap-2 text-xs">
              Bar width · {Math.round(barWidth * 100)}%
              <input
                className="w-full accent-primary"
                type="range"
                min={0.2}
                max={0.9}
                step={0.05}
                value={barWidth}
                onChange={(event) => setBarWidth(Number(event.target.value))}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b px-4 py-2">
            {[
              ["Values", values, setValues],
              ["Legend", legend, setLegend],
              ["Grid", grid, setGrid],
              ["Show connectors", connectors, setConnectors],
              ["Animation", animation, setAnimation],
            ].map(([label, checked, setter]) => (
              <label
                key={String(label)}
                className="flex min-h-9 cursor-pointer items-center gap-2 text-xs"
              >
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={checked as boolean}
                  onChange={(event) =>
                    (setter as (value: boolean) => void)(event.target.checked)
                  }
                />
                {label as string}
              </label>
            ))}
            <button
              type="button"
              className="ml-auto flex min-h-9 items-center gap-2 rounded px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setReplay(replay + 1)}
            >
              <RotateCcw size={13} />
              Replay
            </button>
          </div>
          <div className="p-3 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {dataset === "profit"
                    ? "Profit and loss"
                    : dataset === "revenue"
                      ? "Monthly recurring revenue"
                      : dataset === "periods"
                        ? "Quarterly movements"
                        : "Cash movement"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Illustrative data · USD
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {orientation === "vertical" ? "Left to right" : "Top to bottom"}
              </p>
            </div>
            <WaterfallChart
              key={replay}
              data={
                state === "empty" || state === "initial-loading" ? [] : data
              }
              height={400}
              orientation={orientation}
              variant={variant}
              borderRadius={radius}
              barWidth={barWidth}
              {...(colors ? { colors } : {})}
              connectorStyle={connector}
              showConnectors={connectors}
              showValues={values}
              showGrid={grid}
              showLegend={legend}
              animation={animation}
              valueFormatter={(value) => formatter.format(value)}
              loading={state === "loading" || state === "initial-loading"}
              error={
                state === "error"
                  ? "Unable to load this period. Try refreshing your data."
                  : null
              }
              ariaLabel="Cash movement waterfall"
              onBarClick={(row, index) =>
                setSelected(`${index + 1}. ${String(row.label)}`)
              }
            />
          </div>
        </div>
        <p role="status" className="min-h-5 text-xs text-muted-foreground">
          {selected
            ? `Selected ${selected}`
            : "Hover or tap a step to inspect it. Use arrow keys to move, Enter to select, and View data for exact values."}
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Quick start</h2>
        <CodeBlock code={example} language="tsx" />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Choose the right step</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3">Type</th>
                <th className="p-3">Meaning</th>
                <th className="p-3">Example</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "increase / decrease",
                  "Adds or subtracts the magnitude. Omit type to use the value’s sign.",
                  '{ label: "Sales", value: 45000 }',
                ],
                [
                  "total",
                  "An absolute balance drawn from zero. Resets the running balance and period checkpoint.",
                  '{ label: "Opening", value: 100000, type: "total" }',
                ],
                [
                  "sum",
                  "Current running balance drawn from zero. Starts a new period checkpoint without changing the balance.",
                  '{ label: "Closing", type: "sum" }',
                ],
                [
                  "subtotal",
                  "Change since the last total, sum or subtotal. Floats from that checkpoint to the current balance.",
                  '{ label: "Q1 change", type: "subtotal" }',
                ],
              ].map(([type, meaning, code]) => (
                <tr key={type} className="border-b align-top">
                  <td className="p-3 font-medium">{type}</td>
                  <td className="p-3 text-muted-foreground">{meaning}</td>
                  <td className="p-3">
                    <code className="text-xs">{code}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          For gross profit or an ending balance, use sum. For the movement
          within a period, use subtotal. Computed rows omit value; giving one is
          an actionable error. Explicit totals keep the original API’s reset
          behavior.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Reading the chart</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Floating bars start at the previous balance. The zero line stays
          visible even when the balance becomes negative. Zero changes use a
          thin marker; tiny changes retain their true size and remain accessible
          through larger invisible targets and View data. Long sequences scroll
          within the chart. No rows are hidden or reordered.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Green and red indicate increases and decreases. For costs or other
          metrics where lower is better, choose colors that suit your context.
          Signed labels, step types and inspection carry the meaning alongside
          color.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Compatibility</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Existing numeric increase, decrease and total rows keep their
          behavior. Numeric strings, missing values and unknown types now show
          an error instead of silently changing the balance. Custom tooltips can
          also receive sum and subtotal types and now include the previous
          balance, geometric start/end and formatted values.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">API reference</h2>
        <APIReference props={props} />
      </section>
      <p className="text-xs text-muted-foreground">
        References:{" "}
        <a
          className="underline underline-offset-4"
          href="https://www.highcharts.com/docs/chart-and-series-types/waterfall-series"
          target="_blank"
          rel="noreferrer"
        >
          Highcharts’ computed sums
        </a>{" "}
        and{" "}
        <a
          className="underline underline-offset-4"
          href="https://plotly.com/javascript/waterfall-charts/"
          target="_blank"
          rel="noreferrer"
        >
          Plotly’s financial and horizontal examples
        </a>
        .
      </p>
    </div>
  );
}
