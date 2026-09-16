"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  RadarChart,
  type RadarAxis,
  type RadarSeries,
} from "@/src/components/charts/radar-chart";
import { APIReference } from "../../../../components/ui/api-reference";
import { CodeBlock } from "../../../../components/ui/code-block";
import { CommandSnippet } from "../../../../components/ui/command-snippet";

type Scores = {
  frontend: number | string | null;
  backend: number | string | null;
  database: number | string | null;
  devops: number | string | null;
  design: number | string | null;
};
const axes: readonly RadarAxis<Scores>[] = [
  { key: "frontend", label: "Frontend", min: 0, max: 100 },
  { key: "backend", label: "Backend", min: 0, max: 100 },
  { key: "database", label: "Database", min: 0, max: 100 },
  { key: "devops", label: "DevOps", min: 0, max: 100 },
  { key: "design", label: "Design", min: 0, max: 100 },
];
const teams: readonly RadarSeries<Scores>[] = [
  {
    id: "atlas",
    name: "Team Atlas",
    data: { frontend: 85, backend: 70, database: 90, devops: 60, design: 75 },
  },
  {
    id: "nova",
    name: "Team Nova",
    data: { frontend: 65, backend: 90, database: 65, devops: 85, design: 50 },
  },
];
const datasets: Record<string, readonly RadarSeries<Scores>[]> = {
  teams,
  single: teams.slice(0, 1),
  zeros: [
    {
      ...teams[0]!,
      data: { frontend: 0, backend: 0, database: 0, devops: 0, design: 0 },
    },
  ],
  signed: [
    {
      ...teams[0]!,
      data: {
        frontend: -60,
        backend: 20,
        database: 80,
        devops: -30,
        design: 45,
      },
    },
  ],
  missing: [{ ...teams[0]!, data: { ...teams[0]!.data, backend: null } }],
  invalid: [{ ...teams[0]!, data: { ...teams[0]!.data, backend: "85oops" } }],
  outside: [{ ...teams[0]!, data: { ...teams[0]!.data, backend: 125 } }],
  duplicate: [teams[0]!, { ...teams[1]!, id: teams[0]!.id }],
  long: teams.map((item) => ({
    ...item,
    name: `${item.name} · cross-functional product team`,
  })),
};
const example = `import { RadarChart, type RadarAxis } from "@/components/charts/radar-chart";

type Scores = { frontend: number; backend: number; database: number; devops: number; design: number };
const axes = [
  { key: "frontend", label: "Frontend", min: 0, max: 100 },
  { key: "backend", label: "Backend", min: 0, max: 100 },
  { key: "database", label: "Database", min: 0, max: 100 },
  { key: "devops", label: "DevOps", min: 0, max: 100 },
  { key: "design", label: "Design", min: 0, max: 100 },
] satisfies readonly RadarAxis<Scores>[];

const series = [
  { id: "atlas", name: "Team Atlas", data: { frontend: 85, backend: 70, database: 90, devops: 60, design: 75 } },
  { id: "nova", name: "Team Nova", data: { frontend: 65, backend: 90, database: 65, devops: 85, design: 50 } },
];

export function TeamSkills() {
  return <RadarChart axes={axes} series={series} height={400} ariaLabel="Team skills comparison" />;
}`;
const props = [
  {
    name: "series",
    type: "readonly RadarSeries<T>[]",
    required: true,
    description:
      "Series with unique id, name, data, and optional color. Every axis needs a finite observation, including an explicit zero when measured.",
  },
  {
    name: "axes",
    type: "readonly RadarAxis<T>[]",
    required: true,
    description:
      "At least three unique keys from T, with label and optional min/max. Order determines the polygon; keep it consistent between comparisons.",
  },
  {
    name: "gridType",
    type: "'polygon' | 'circular'",
    default: "'polygon'",
    description:
      "Shape of the reference grid. The data remains a polygon connecting measured vertices.",
  },
  {
    name: "gridLevels",
    type: "number",
    default: "5",
    description:
      "Concentric grid levels, as an integer from 1 to 20. Each level is the same fraction of each axis range.",
  },
  {
    name: "height",
    type: "number",
    default: "400",
    description:
      "Total frame height including the legend, in loading, empty, error, and ready states.",
  },
  {
    name: "colors",
    type: "readonly string[]",
    default: "DEFAULT_COLORS",
    description:
      "Colors follow series order. A series color overrides the palette.",
  },
  {
    name: "showLegend",
    type: "boolean",
    default: "series.length > 1",
    description:
      "Wrapping, scrollable legend with keyboard inspection and optional series selection.",
  },
  {
    name: "showDots",
    type: "boolean",
    default: "true",
    description:
      "Show data markers. Hover, touch, and keyboard inspection remain available when hidden.",
  },
  {
    name: "showAxisLabels",
    type: "boolean",
    default: "true",
    description:
      "Wrap labels in bounded boxes; full names remain in accessible labels and the data table.",
  },
  {
    name: "showAxisLines",
    type: "boolean",
    default: "true",
    description: "Show spokes from the center to each axis endpoint.",
  },
  {
    name: "showGridLines",
    type: "boolean",
    default: "true",
    description: "Show the reference grid.",
  },
  {
    name: "labelOffset",
    type: "number",
    default: "30",
    description:
      "Label distance in pixels, reduced on narrow frames to keep labels inside the chart.",
  },
  {
    name: "fillOpacity",
    type: "number",
    default: "0.25",
    description: "Polygon fill opacity, from 0 to 1.",
  },
  {
    name: "strokeWidth",
    type: "number",
    default: "2",
    description: "Finite, nonnegative polygon stroke width in pixels.",
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description:
      "Retain series for a skeleton with identical geometry. Without data, show a neutral placeholder.",
  },
  {
    name: "error",
    type: "string | null",
    default: "null",
    description: "Show an actionable error inside the existing frame.",
  },
  {
    name: "animation",
    type: "boolean",
    default: "true",
    description:
      "Grow data from the fixed center, leaving the reference grid still. Respects reduced motion; keyboard focus completes entrance immediately.",
  },
  {
    name: "valueFormatter",
    type: "(value: number, axis: RadarAxis<T>) => string",
    default: "formatValue",
    description:
      "Format values and ranges in tooltips and accessible data. Use the axis key for units.",
  },
  {
    name: "onSeriesClick",
    type: "(series: RadarSeries<T>, index: number) => void",
    description:
      "Original series and index, from a polygon, point, legend click, or keyboard activation.",
  },
  {
    name: "onAxisClick",
    type: "(axis: RadarAxis<T>, index: number) => void",
    description:
      "Original axis and index. Axis labels and endpoints are keyboard accessible when this callback is provided.",
  },
  {
    name: "tooltipRenderer",
    type: "TooltipRenderer<RadarChartTooltipData<T>>",
    description:
      "Custom content with original data, series name and color. Point inspection adds axisLabel, parsed value, formattedValue, and type 'point'.",
  },
  { name: "ariaLabel", type: "string", description: "Accessible chart name." },
  {
    name: "description",
    type: "string",
    description:
      "Context prepended to keyboard instructions and the scale explanation.",
  },
  {
    name: "className",
    type: "string",
    description: "Additional classes for the persistent chart frame.",
  },
];

export function RadarChartContent() {
  const [dataset, setDataset] = useState("teams");
  const [state, setState] = useState("ready");
  const [gridType, setGridType] = useState<"polygon" | "circular">("polygon");
  const [autoScale, setAutoScale] = useState(false);
  const [levels, setLevels] = useState(5);
  const [fill, setFill] = useState(0.25);
  const [dots, setDots] = useState(true);
  const [labels, setLabels] = useState(true);
  const [legend, setLegend] = useState(true);
  const [animation, setAnimation] = useState(true);
  const [replay, setReplay] = useState(0);
  const [selection, setSelection] = useState<string | null>(null);
  const loading = state === "loading" || state === "initial-loading";
  // Keep input identity stable through inspection and optional control changes.
  const activeAxes = useMemoAxes(dataset, autoScale);
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Components
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Radar Chart
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Compare the profile of a few series across several dimensions. Inspect
          each value and its range, with a polygon or circular reference grid.
        </p>
        <CommandSnippet command="npx mario-charts@latest add radar-chart" />
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
            Compare grid styles, scales, loading, and interaction.
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
                <option value="teams">Team skills</option>
                <option value="single">Single team</option>
                <option value="zeros">All zeros</option>
                <option value="signed">Signed values</option>
                <option value="long">Long labels</option>
                <option value="missing">Missing observation</option>
                <option value="invalid">Malformed number</option>
                <option value="outside">Outside fixed range</option>
                <option value="duplicate">Duplicate identity</option>
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
              Grid
              <select
                aria-label="Grid"
                value={gridType}
                onChange={(e) => setGridType(e.target.value as typeof gridType)}
                className="h-10 min-w-0 rounded border bg-background px-2"
              >
                <option value="polygon">Polygon</option>
                <option value="circular">Circular</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Scale
              <select
                aria-label="Scale"
                value={autoScale ? "auto" : "fixed"}
                onChange={(e) => setAutoScale(e.target.value === "auto")}
                className="h-10 min-w-0 rounded border bg-background px-2"
              >
                <option value="fixed">
                  {dataset === "signed"
                    ? "Fixed −100 to 100"
                    : "Fixed 0 to 100"}
                </option>
                <option value="auto">Auto per axis</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Grid levels · {levels}
              <input
                aria-label="Grid levels"
                type="range"
                min={1}
                max={8}
                step={1}
                value={levels}
                onChange={(e) => setLevels(Number(e.target.value))}
              />
            </label>
            <label className="grid gap-2 text-sm">
              Fill opacity · {Math.round(fill * 100)}%
              <input
                aria-label="Fill opacity"
                type="range"
                min={0}
                max={0.6}
                step={0.05}
                value={fill}
                onChange={(e) => setFill(Number(e.target.value))}
              />
            </label>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={dots}
                  onChange={(e) => setDots(e.target.checked)}
                />
                Show dots
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={labels}
                  onChange={(e) => setLabels(e.target.checked)}
                />
                Axis labels
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
              <h3 className="font-medium">Team skills</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Illustrative assessment ·{" "}
                {autoScale
                  ? "independent axis ranges"
                  : dataset === "signed"
                    ? "−100 to 100 on each axis"
                    : "0 to 100 on each axis"}
              </p>
            </div>
            <RadarChart
              key={replay}
              series={
                state === "empty" || state === "initial-loading"
                  ? []
                  : datasets[dataset]!
              }
              axes={activeAxes}
              gridType={gridType}
              gridLevels={levels}
              fillOpacity={fill}
              showDots={dots}
              showAxisLabels={labels}
              showLegend={legend}
              animation={animation}
              loading={loading}
              height={400}
              error={
                state === "error"
                  ? "Could not load the assessment. Try again when your connection is restored."
                  : null
              }
              ariaLabel="Team skills comparison"
              description="Illustrative scores for two product teams."
              onSeriesClick={(item) => setSelection(`Selected ${item.name}`)}
              onAxisClick={(axis) =>
                setSelection(`Selected ${axis.label} axis`)
              }
            />
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              Hover or tap a point. Left/Right changes axis; Up/Down changes
              team. Enter selects.
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
            Use the same explicit range when dimensions share a scale, such as
            these 0–100 scores. With automatic ranges, the same distance from
            the center can represent different values on different axes. Hover
            or focus a point to see its range.
          </p>
          <p>
            Negative values are supported when the axis range includes them. The
            center represents that axis’s minimum, which may be below zero.
            All-zero observations stay at the center of a 0–100 scale and remain
            keyboard accessible.
          </p>
          <p>
            Keep the number and order of dimensions consistent. Polygon area
            depends on the chosen ranges and axis order; use the individual
            observations for exact comparisons. Missing observations and values
            outside explicit bounds produce an error instead of a misleading
            shape.
          </p>
        </div>
      </section>
      <APIReference props={props} />
    </div>
  );
}

function useMemoAxes(dataset: string, autoScale: boolean) {
  return useMemo(
    () =>
      axes.map((axis) => ({
        key: axis.key,
        label:
          dataset === "long"
            ? `${axis.label} engineering and product delivery`
            : axis.label,
        ...(autoScale
          ? {}
          : { min: dataset === "signed" ? -100 : 0, max: 100 }),
      })),
    [dataset, autoScale],
  );
}
