"use client";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { StackedBarChart } from "@/src/components/charts/stacked-bar-chart";
import { APIReference } from "../../../../components/ui/api-reference";
import { CodeBlock } from "../../../../components/ui/code-block";
import { CommandSnippet } from "../../../../components/ui/command-snippet";

type Row = {
  quarter: string;
  desktop: number | string | null;
  mobile: number | string | null;
  tablet: number | string | null;
};
const traffic: readonly Row[] = [
  { quarter: "Q1", desktop: 120, mobile: 80, tablet: 30 },
  { quarter: "Q2", desktop: 150, mobile: 95, tablet: 40 },
  { quarter: "Q3", desktop: 130, mobile: 110, tablet: 35 },
  { quarter: "Q4", desktop: 170, mobile: 125, tablet: 45 },
];
const keys = ["desktop", "mobile", "tablet"] as const;
const datasets: Record<string, readonly Row[]> = {
  traffic,
  signed: [
    { quarter: "Q1", desktop: 120, mobile: -45, tablet: 30 },
    { quarter: "Q2", desktop: -60, mobile: 90, tablet: -25 },
    { quarter: "Q3", desktop: 50, mobile: -70, tablet: 40 },
    { quarter: "Q4", desktop: -25, mobile: 40, tablet: -60 },
  ],
  negative: traffic.map((row) => ({
    ...row,
    desktop: -Number(row.desktop),
    mobile: -Number(row.mobile),
    tablet: -Number(row.tablet),
  })),
  cancellation: [
    { quarter: "Balanced", desktop: 100, mobile: -100, tablet: 0 },
  ],
  zeros: traffic.map((row) => ({ ...row, desktop: 0, mobile: 0, tablet: 0 })),
  sparse: traffic.map((row, index) => ({
    ...row,
    desktop: index % 2 ? 0 : row.desktop,
    mobile: 0,
    tablet: index % 2 ? row.tablet : 0,
  })),
  single: traffic.slice(0, 1),
  long: traffic.map((row) => ({
    ...row,
    quarter: `${row.quarter} · enterprise accounts in North America`,
  })),
  dense: Array.from({ length: 24 }, (_, index) => ({
    quarter: `Week ${index + 1}`,
    desktop: 20 + ((index * 7) % 40),
    mobile: 15 + ((index * 3) % 30),
    tablet: 10,
  })),
  missing: [{ ...traffic[0]!, mobile: null }],
  invalid: [{ ...traffic[0]!, tablet: "12oops" }],
  overflow: [
    {
      quarter: "Overflow",
      desktop: Number.MAX_VALUE,
      mobile: Number.MAX_VALUE,
      tablet: 0,
    },
  ],
};
const example = `import { StackedBarChart } from "@/components/charts/stacked-bar-chart";

const data = [
  { quarter: "Q1", desktop: 120, mobile: 80, tablet: 30 },
  { quarter: "Q2", desktop: 150, mobile: 95, tablet: 40 },
  { quarter: "Q3", desktop: 130, mobile: 110, tablet: 35 },
  { quarter: "Q4", desktop: 170, mobile: 125, tablet: 45 },
];

export function Traffic() {
  return <StackedBarChart data={data} x="quarter"
    y={["desktop", "mobile", "tablet"]} showLegend showGrid height={400}
    ariaLabel="Traffic by device" valueFormatter={value => value + "k"} />;
}`;
const props = [
  {
    name: "data",
    type: "readonly T[]",
    required: true,
    description:
      "Rows in input order. Segment values must be finite numbers or unambiguous numeric strings. Missing values produce an error.",
  },
  {
    name: "x",
    type: "keyof T",
    required: true,
    description: "Category key. Duplicate labels remain distinct observations.",
  },
  {
    name: "y",
    type: "readonly (keyof T)[]",
    required: true,
    description:
      "One or more unique numeric keys in stack, legend, and keyboard order. Positive and negative values accumulate independently from zero.",
  },
  {
    name: "orientation",
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: "Orient the same signed stacks and zero baseline.",
  },
  {
    name: "variant",
    type: "'filled' | 'outline'",
    default: "'filled'",
    description:
      "Filled segments or colored outlines. Both variants support segment inspection and actions.",
  },
  {
    name: "cornerRadius",
    type: "number",
    default: "2",
    description:
      "Outer-end radius in pixels, capped by segment dimensions. Internal joins stay flat. Use 0 for square ends.",
  },
  {
    name: "showLegend",
    type: "boolean",
    default: "false",
    description: "Show series colors within the total frame height.",
  },
  {
    name: "showGrid",
    type: "boolean",
    default: "false",
    description: "Show grid lines on the shared numeric scale.",
  },
  {
    name: "gridStyle",
    type: "'solid' | 'dashed' | 'dotted'",
    default: "'dashed'",
    description: "Grid line style.",
  },
  {
    name: "height",
    type: "number",
    default: "300",
    description:
      "Positive total frame height, including the legend, in every state.",
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description:
      "Retain rows to preserve the exact segment geometry during refresh. Without data, show a neutral placeholder.",
  },
  {
    name: "error",
    type: "string | null",
    default: "null",
    description: "Actionable error inside the persistent chart frame.",
  },
  {
    name: "animation",
    type: "boolean",
    default: "true",
    description:
      "Grow stacks from zero while preserving segment joins. Grid and labels stay still. Keyboard focus completes entrance; reduced motion is respected.",
  },
  {
    name: "valueFormatter",
    type: "(value: number) => string",
    default: "formatValue",
    description:
      "Format segment inspection, accessible values, and signed totals. Include shared units when helpful.",
  },
  {
    name: "axisValueFormatter",
    type: "(value: number) => string",
    default: "valueFormatter",
    description: "Optional compact numeric tick format.",
  },
  {
    name: "onSegmentClick",
    type: "(data: T, stackKey: string, index: number) => void",
    description:
      "Receive the original row, selected key, and row index through pointer or Enter/Space activation.",
  },
  {
    name: "tooltipRenderer",
    type: "TooltipRenderer<StackedBarChartTooltipData<T>>",
    description:
      "Original data, label, index, all segments, activeKey/activeIndex, positiveTotal, negativeTotal, and total (signed net).",
  },
  {
    name: "ariaLabel / description",
    type: "string",
    default: "'Stacked bar chart' / undefined",
    description:
      "Accessible chart name and context. Keyboard instructions and a source-value table are included.",
  },
  {
    name: "colors",
    type: "readonly string[]",
    default: "DEFAULT_COLORS",
    description: "Colors follow y-key order, including zero-valued segments.",
  },
  {
    name: "className",
    type: "string",
    description: "Classes for the persistent outer frame.",
  },
];
const selectClass = "h-10 min-w-0 rounded border bg-background px-2";
export function StackedBarChartContent() {
  const [dataset, setDataset] = useState("traffic");
  const [state, setState] = useState("ready");
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">(
    "vertical",
  );
  const [variant, setVariant] = useState<"filled" | "outline">("filled");
  const [cornerRadius, setCornerRadius] = useState(2);
  const [legend, setLegend] = useState(true);
  const [grid, setGrid] = useState(true);
  const [animation, setAnimation] = useState(true);
  const [replay, setReplay] = useState(0);
  const [selection, setSelection] = useState("");
  const loading = state === "loading" || state === "initial-loading";
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Components
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Stacked Bar Chart
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Compare totals while keeping the composition of each category visible.
          Positive and negative contributions share a clear zero baseline.
        </p>
        <CommandSnippet command="npx mario-charts@latest add stacked-bar-chart" />
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
            Explore orientations, signed contributions, and segment inspection.
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
                className={selectClass}
                value={dataset}
                onChange={(e) => {
                  setDataset(e.target.value);
                  setSelection("");
                }}
              >
                {[
                  ["traffic", "Traffic by device"],
                  ["signed", "Signed contributions"],
                  ["negative", "All negative"],
                  ["cancellation", "Positive / negative cancellation"],
                  ["zeros", "All zero"],
                  ["sparse", "Zero segments"],
                  ["single", "Single category"],
                  ["long", "Long labels"],
                  ["dense", "24 categories"],
                  ["missing", "Missing value"],
                  ["invalid", "Malformed value"],
                  ["overflow", "Overflowing total"],
                ].map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              State
              <select
                aria-label="State"
                className={selectClass}
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                {[
                  ["ready", "Ready"],
                  ["loading", "Loading"],
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
            <label className="grid gap-2 text-sm">
              Orientation
              <select
                aria-label="Orientation"
                className={selectClass}
                value={orientation}
                onChange={(e) =>
                  setOrientation(e.target.value as typeof orientation)
                }
              >
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Variant
              <select
                aria-label="Variant"
                className={selectClass}
                value={variant}
                onChange={(e) => setVariant(e.target.value as typeof variant)}
              >
                <option value="filled">Filled</option>
                <option value="outline">Outline</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Corner radius · {cornerRadius}px
              <input
                aria-label="Corner radius"
                type="range"
                min={0}
                max={12}
                step={2}
                value={cornerRadius}
                onChange={(e) => setCornerRadius(Number(e.target.value))}
              />
            </label>
            <div className="grid grid-cols-2 gap-3 text-sm">
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
                disabled={!animation || loading}
                onClick={() => setReplay((value) => value + 1)}
                className="rounded border p-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8">
            <div className="mb-6">
              <h3 className="font-medium">
                {dataset === "traffic"
                  ? "Traffic by device"
                  : "Device contributions"}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Illustrative quarterly observations · thousands
              </p>
            </div>
            <StackedBarChart
              key={replay}
              data={
                state === "empty" || state === "initial-loading"
                  ? []
                  : datasets[dataset]!
              }
              x="quarter"
              y={keys}
              height={400}
              orientation={orientation}
              variant={variant}
              cornerRadius={cornerRadius}
              showLegend={legend}
              showGrid={grid}
              animation={animation}
              loading={loading}
              error={
                state === "error"
                  ? "Could not load device data. Try again when your connection is restored."
                  : null
              }
              valueFormatter={(value) => `${value}k`}
              ariaLabel="Device contributions"
              description="Illustrative quarterly values grouped by device."
              onSegmentClick={(row, key) =>
                setSelection(`Selected ${row.quarter} · ${key}`)
              }
            />
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              Hover or tap a segment to inspect.{" "}
              {orientation === "vertical"
                ? "Left/Right changes quarter; Up/Down changes device."
                : "Up/Down changes quarter; Right/Left changes device."}{" "}
              Enter selects.
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
        <h2 className="text-xl font-semibold tracking-tight">Usage</h2>
        <CodeBlock code={example} language="tsx" />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Reading the stacks
        </h2>
        <div className="max-w-3xl space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            All categories use one numeric scale. Positive values stack away
            from zero in one direction, negative values in the other. A net
            total of zero can still contain substantial positive and negative
            contributions; inspection shows both subtotals.
          </p>
          <p>
            Segments need comparable units. Stacked bars make totals and the
            first segment easiest to compare; use separate bars when comparing
            every series is the main question.
          </p>
          <p>
            Zero is a measured value with no painted length. It remains
            reachable by keyboard and in the accessible source table. Missing
            values produce an error so incomplete observations cannot look like
            measured zeros.
          </p>
          <p>
            Keep data while loading to preserve geometry. Long category labels
            are shortened visually and dense labels are thinned; full labels and
            every segment remain available through inspection and the source
            table.
          </p>
        </div>
      </section>
      <APIReference
        title="API Reference"
        description="Typed props for stacked values, appearance, and interaction."
        props={props}
      />
    </div>
  );
}
