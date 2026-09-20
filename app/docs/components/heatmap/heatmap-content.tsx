"use client";
import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  HeatmapChart,
  type ColorScheme,
  type HeatmapVariant,
} from "@/src/components/charts/heatmap";
import { APIReference } from "../../../../components/ui/api-reference";
import { CodeBlock } from "../../../../components/ui/code-block";
import { CommandSnippet } from "../../../../components/ui/command-snippet";
type Observation = {
  day: string;
  hour: string;
  amount: number | string | null;
  weight: number;
};
const hours = ["6am", "9am", "12pm", "3pm", "6pm", "9pm"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const activity: Observation[] = days.flatMap((day, row) =>
  hours.map((hour, col) => ({
    day,
    hour,
    amount: Math.round((12 + row * 3) * [0.3, 0.8, 1.4, 1.7, 1.1, 0.5][col]!),
    weight: 1,
  })),
);
const stocks: Observation[] = [
  ["AAPL", 2.4, 30],
  ["MSFT", 1.2, 28],
  ["NVDA", -1.8, 24],
  ["GOOGL", 0.8, 18],
  ["AMZN", -0.9, 16],
  ["META", 3.1, 12],
  ["TSLA", -2.6, 8],
  ["BRK", 0, 7],
].map(([hour, amount, weight]) => ({
  day: "",
  hour: String(hour),
  amount: Number(amount),
  weight: Number(weight),
}));
const diversified: Observation[] = [
  ...stocks,
  ...[
    ["JPM", 1.4, 6],
    ["V", 0.3, 5.5],
    ["LLY", -0.2, 5],
    ["XOM", -1.1, 4.8],
    ["UNH", 0.6, 4.2],
    ["MA", 1.8, 4],
    ["COST", 0.4, 3.8],
    ["HD", -0.7, 3.5],
    ["PG", 0.1, 3.3],
    ["JNJ", -1.3, 3.1],
    ["ABBV", 2.1, 2.9],
    ["BAC", 0.9, 2.7],
    ["NFLX", -2.2, 2.5],
    ["KO", 0, 2.3],
    ["CRM", 1.5, 2.1],
    ["AMD", -3.1, 1.9],
  ].map(([hour, amount, weight]) => ({
    day: "",
    hour: String(hour),
    amount: Number(amount),
    weight: Number(weight),
  })),
];
const example = `import { HeatmapChart } from "@/components/charts/heatmap";

const data = [
  { day: "Mon", hour: "9am", visits: 0 },
  { day: "Mon", hour: "12pm", visits: 24 },
  { day: "Tue", hour: "9am", visits: null },
  { day: "Tue", hour: "12pm", visits: 36 },
];

export function Activity() {
  return <HeatmapChart data={data} x="hour" y="day" value="visits"
    showLegend height={360} ariaLabel="Visits by day and hour" />;
}`;
const props = [
  {
    name: "data",
    type: "readonly T[]",
    required: true,
    description:
      "Original observations. Grid/radial require unique x/y pairs. Null, undefined and blank values mean missing; numeric strings are supported. Invalid values produce an actionable error.",
  },
  {
    name: "x / y / value",
    type: "keyof T",
    required: true,
    description:
      "Column, row/ring, and measurement keys. Categories retain first appearance. Stock ignores y and keeps each original row, including repeated labels.",
  },
  {
    name: "variant",
    type: "'grid' | 'radial' | 'stock'",
    default: "'grid'",
    description:
      "Grid matrix, clockwise radial matrix, or stock treemap. Radial rows run from outer to inner rings.",
  },
  {
    name: "weight",
    type: "keyof T",
    description:
      "Stock area key: finite nonnegative values. Omit for equal allocation. Zero weights have no area and remain in the accessible source table. Gutters inset the allocated rectangles.",
  },
  {
    name: "colorScheme",
    type: "'blue' | 'green' | 'amber' | 'purple' | 'diverging'",
    default: "'blue'",
    description:
      "Sequential palettes or blue/neutral/red diverging scale. Stock uses red/slate/green with a dark neutral midpoint, independent of colorScheme.",
  },
  {
    name: "colorFrom / colorTo",
    type: "string",
    description:
      "Endpoint CSS colors, including rgb, oklch and inherited CSS variables. Diverging scales retain a neutral middle.",
  },
  {
    name: "domain",
    type: "readonly [number, number]",
    description:
      "Fixed finite increasing color bounds containing every measurement. Omit for observed extent, symmetric around midpoint for diverging/stock. A constant sequential dataset uses one middle color.",
  },
  {
    name: "midpoint",
    type: "number",
    default: "0",
    description:
      "Neutral value for diverging/stock. Fixed diverging bounds must extend below and above it. The legend uses this same piecewise scale.",
  },
  {
    name: "showLabels / showLegend",
    type: "boolean",
    default: "true / false",
    description:
      "Category labels and the actual color scale. Stock labels sit directly on cells with measured font sizing and automatic black/white contrast. Values shrink to fit before being hidden; full text remains in inspection and the source table.",
  },
  {
    name: "cellRadius",
    type: "number",
    default: "4",
    description:
      "Nonnegative grid/stock corner radius in pixels, bounded by cell size. Set 0 for flat corners. Radial cells keep circular edges.",
  },
  {
    name: "height / className",
    type: "number / string",
    default: "320",
    description:
      "Stable positive frame height includes the legend and notices. className styles the measured wrapper.",
  },
  {
    name: "loading / error",
    type: "boolean / string | null",
    default: "false / null",
    description:
      "Retain observations while loading to preserve geometry. Initial loading uses a variant-specific neutral placeholder. Empty and error states preserve frame size.",
  },
  {
    name: "animation",
    type: "boolean",
    default: "true",
    description:
      "Cells grow at fixed positions on entrance; their final colors stay constant. Focus finishes the entrance immediately. Reduced motion is respected.",
  },
  {
    name: "valueFormatter / weightFormatter",
    type: "(value: number) => string",
    description:
      "Format inspection, legend and accessible values. Stock defaults to signed percentages; use valueFormatter for other units. Weight defaults to formatValue.",
  },
  {
    name: "ariaLabel / description",
    type: "string",
    default: "'Heatmap chart'",
    description:
      "Accessible chart name and additional context. One tab stop with arrow navigation, Home/End, Escape and optional Enter/Space activation.",
  },
  {
    name: "onClick",
    type: "(item: T, colLabel: string, rowLabel: string) => void",
    description:
      "Mouse, touch or keyboard activation with the original row. Missing matrix combinations have no callback. Stock passes an empty rowLabel.",
  },
  {
    name: "tooltipRenderer",
    type: "TooltipRenderer<HeatmapChartTooltipData<T>>",
    description:
      "Receives data/index (null for absent combinations), value/normalizedValue (null for missing values), labels, formattedValue, color and stock weightValue.",
  },
];
export function HeatmapContent() {
  const [variant, setVariant] = useState<HeatmapVariant>("grid");
  const [scheme, setScheme] = useState<ColorScheme>("blue");
  const [dataset, setDataset] = useState("default");
  const [state, setState] = useState("ready");
  const [showLabels, setLabels] = useState(true),
    [showLegend, setLegend] = useState(true);
  const [animation, setAnimation] = useState(true),
    [replay, setReplay] = useState(0);
  const [radius, setRadius] = useState(4),
    [fixed, setFixed] = useState(false);
  const [colors, setColors] = useState("default"),
    [weighted, setWeighted] = useState(true);
  const [selection, setSelection] = useState<string | null>(null);
  const data = useMemo(() => {
    let rows =
      variant === "stock"
        ? dataset === "dense"
          ? diversified
          : stocks
        : activity;
    if (dataset === "missing")
      rows = rows
        .filter((_, i) => i !== 1)
        .map((row, i) => ({ ...row, amount: i === 2 ? null : row.amount }));
    if (dataset === "zero") rows = rows.map((row) => ({ ...row, amount: 0 }));
    if (dataset === "signed")
      rows = rows.map((row, i) => ({ ...row, amount: (i % 11) - 5 }));
    if (dataset === "single")
      rows = rows.filter((row) => row.hour === rows[0]!.hour);
    if (dataset === "long")
      rows = rows.map((row) => ({
        ...row,
        day: row.day + " · North America production",
        hour: row.hour + " · enterprise workload",
      }));
    if (dataset === "invalid")
      rows = rows.map((row, i) => ({
        ...row,
        amount: i === 0 ? "12px" : row.amount,
      }));
    if (dataset === "duplicate") rows = [...rows, rows[0]!];
    if (dataset === "zero-weight")
      rows = rows.map((row, i) => ({ ...row, weight: i < 3 ? 0 : row.weight }));
    if (dataset === "all-zero-weight")
      rows = rows.map((row) => ({ ...row, weight: 0 }));
    return state === "empty" || state === "initial-loading" ? [] : rows;
  }, [variant, dataset, state]);
  const selectClass = "h-9 w-full rounded border bg-background px-2 text-sm";
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Components
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Heatmap
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Find patterns across two dimensions with color. Explore a matrix, wrap
          it into rings, or size stock cells by a separate weight.
        </p>
        <CommandSnippet command="npx mario-charts@latest add heatmap" />
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
            Explore color, shape, missing observations, and area weights.
          </p>
        </div>
        <div className="grid overflow-hidden rounded-md border bg-card lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="space-y-5 border-b p-4 lg:border-b-0 lg:border-r">
            <h3 className="text-sm font-medium">Settings</h3>
            <label className="grid gap-2 text-sm">
              Variant
              <select
                className={selectClass}
                aria-label="Variant"
                value={variant}
                onChange={(e) => {
                  setVariant(e.target.value as HeatmapVariant);
                  setDataset("default");
                  setSelection(null);
                }}
              >
                <option value="grid">Grid</option>
                <option value="radial">Radial</option>
                <option value="stock">Stock</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Dataset
              <select
                className={selectClass}
                aria-label="Dataset"
                value={dataset}
                onChange={(e) => {
                  setDataset(e.target.value);
                  setSelection(null);
                }}
              >
                {[
                  [
                    "default",
                    variant === "stock"
                      ? "Illustrative portfolio"
                      : "Weekly activity",
                  ],
                  ["missing", "Missing observations"],
                  ["zero", "All zero"],
                  ["signed", "Signed values"],
                  ["single", "Single column"],
                  ["long", "Long labels"],
                  ["invalid", "Invalid value"],
                  ["duplicate", "Duplicate coordinates"],
                  ...(variant === "stock"
                    ? [
                        ["dense", "Diversified portfolio · 24 assets"],
                        ["zero-weight", "Some zero weights"],
                        ["all-zero-weight", "All zero weights"],
                      ]
                    : []),
                ].map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              State
              <select
                className={selectClass}
                aria-label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                {[
                  ["ready", "Ready"],
                  ["loading", "Refreshing"],
                  ["initial-loading", "Initial loading"],
                  ["empty", "Empty"],
                  ["error", "Error"],
                ].map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {variant !== "stock" && (
              <label className="grid gap-2 text-sm">
                Palette
                <select
                  className={selectClass}
                  aria-label="Palette"
                  value={scheme}
                  onChange={(e) => setScheme(e.target.value as ColorScheme)}
                >
                  {["blue", "green", "amber", "purple", "diverging"].map(
                    (key) => (
                      <option key={key}>{key}</option>
                    ),
                  )}
                </select>
              </label>
            )}
            <label className="grid gap-2 text-sm">
              Custom colors
              <select
                className={selectClass}
                aria-label="Custom colors"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
              >
                <option value="default">Palette defaults</option>
                <option value="css">CSS variables</option>
                <option value="rgb">RGB colors</option>
              </select>
            </label>
            {variant !== "radial" && (
              <label className="grid gap-2 text-sm">
                Corner radius · {radius}px
                <input
                  aria-label="Corner radius"
                  type="range"
                  min={0}
                  max={12}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
              </label>
            )}
            <div className="space-y-3">
              {[
                ["Labels", showLabels, setLabels],
                ["Legend", showLegend, setLegend],
                ["Animation", animation, setAnimation],
                ["Fixed color domain", fixed, setFixed],
                ...(variant === "stock"
                  ? [["Weighted areas", weighted, setWeighted] as const]
                  : []),
              ].map(([label, checked, setter]) => (
                <label
                  key={String(label)}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  {String(label)}
                  <input
                    type="checkbox"
                    checked={Boolean(checked)}
                    onChange={(e) =>
                      (setter as (v: boolean) => void)(e.target.checked)
                    }
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded border px-3 py-2 text-xs hover:bg-muted"
              onClick={() => setReplay((v) => v + 1)}
            >
              <RotateCcw size={14} />
              Replay animation
            </button>
          </div>
          <div
            className="min-w-0 p-4 sm:p-6"
            style={
              {
                "--heat-low": "#fef3c7",
                "--heat-high": "#9a3412",
              } as React.CSSProperties
            }
          >
            <div className="mb-6">
              <h3 className="font-medium">
                {variant === "stock"
                  ? "Portfolio movement"
                  : "Activity throughout the week"}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {variant === "stock"
                  ? "Illustrative data · color shows change, area shows weight"
                  : variant === "radial"
                    ? "Hours clockwise · days from outer to inner rings"
                    : "Days × hours · intensity shows activity"}
              </p>
            </div>
            <HeatmapChart
              key={replay}
              data={data}
              x="hour"
              y="day"
              value="amount"
              {...(variant === "stock" && weighted
                ? { weight: "weight" as const }
                : {})}
              variant={variant}
              colorScheme={scheme}
              {...(colors === "css"
                ? { colorFrom: "var(--heat-low)", colorTo: "var(--heat-high)" }
                : colors === "rgb"
                  ? { colorFrom: "rgb(224 231 255)", colorTo: "rgb(67 56 202)" }
                  : {})}
              {...(fixed
                ? {
                    domain: (variant === "stock" || scheme === "diverging"
                      ? [-100, 100]
                      : [-10, 100]) as readonly [number, number],
                  }
                : {})}
              cellRadius={radius}
              height={360}
              showLabels={showLabels}
              showLegend={showLegend}
              animation={animation}
              loading={state === "loading" || state === "initial-loading"}
              error={
                state === "error"
                  ? "Unable to load observations. Try again."
                  : null
              }
              ariaLabel="Current heatmap"
              onClick={(row, col, day) =>
                setSelection(
                  `${day ? `${day} / ` : ""}${col}: ${row.amount ?? "No data"}`,
                )
              }
            />
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              Hover, tap, or focus a cell to inspect. Use arrow keys to move,
              Home/End to jump, Enter to select, and Escape to dismiss.
            </p>
            <p
              role="status"
              className="mt-3 min-h-5 text-xs text-muted-foreground"
            >
              {selection
                ? `Selected ${selection}`
                : "Select an observation to see its original value."}
            </p>
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Usage</h2>
        <CodeBlock code={example} language="tsx" />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Reading the heatmap
        </h2>
        <div className="max-w-3xl space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            Zero is a measurement. Hatched cells mean no observation: either the
            pair is absent or its value is null, undefined, or blank. Duplicate
            grid/radial pairs require aggregation before rendering. The matrix
            is limited to 10,000 combinations, including missing ones.
          </p>
          <p>
            Sequential colors run from the observed minimum to maximum.
            Diverging colors use a neutral midpoint, zero by default, with a
            symmetric automatic range. Set domain when comparing multiple charts
            so the same value means the same color. The legend and inspection
            use that exact scale.
          </p>
          <p>
            Radial columns run clockwise from the top, with the first row on the
            outer ring. Outer cells occupy more area, so compare their colors.
            Stock allocates area from weight; omitting weight gives equal
            allocation. Zero weights have no area, and small cells may have no
            visible label. All observations remain in the accessible source
            table.
          </p>
          <p>
            Custom inspection receives the original data and index. Both are
            null for absent combinations; value and normalizedValue are null for
            any missing measurement. Handle these explicitly when migrating an
            existing tooltip. Stock defaults to percentage formatting; provide
            valueFormatter when displaying other units.
          </p>
        </div>
      </section>
      <APIReference
        props={props}
        description="Typed props for layout, colors, area weights and inspection."
      />
    </div>
  );
}
