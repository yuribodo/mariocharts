"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  FunnelChart,
  type FunnelVariant,
} from "@/src/components/charts/funnel-chart";
import { APIReference } from "../../../../components/ui/api-reference";
import { CodeBlock } from "../../../../components/ui/code-block";
import { CommandSnippet } from "../../../../components/ui/command-snippet";
type Stage = { stage: string; count: number | string | null };
const ecommerce: Stage[] = [
  { stage: "Visitors", count: 50000 },
  { stage: "Product views", count: 28000 },
  { stage: "Added to cart", count: 12000 },
  { stage: "Checkout", count: 5500 },
  { stage: "Purchase", count: 2800 },
];
const onboarding: Stage[] = [
  { stage: "Signed up", count: 10000 },
  { stage: "Email verified", count: 7200 },
  { stage: "Profile completed", count: 5100 },
  { stage: "First action", count: 3400 },
  { stage: "Retained · 30 days", count: 1800 },
  { stage: "Advocate", count: 620 },
];
const variants: readonly {
  value: FunnelVariant;
  name: string;
  description: string;
}[] = [
  {
    value: "tapered",
    name: "Tapered",
    description:
      "Each stage narrows toward the next. Read the entry width and exact values.",
  },
  {
    value: "straight",
    name: "Straight",
    description: "Centered rectangles make stage widths directly comparable.",
  },
  {
    value: "smooth",
    name: "Smooth",
    description: "Curved transitions connect the same measured stage widths.",
  },
  {
    value: "horizontal",
    name: "Horizontal",
    description:
      "A common left baseline makes small values and differences easier to compare.",
  },
  {
    value: "columns",
    name: "Columns",
    description:
      "Stages read left to right; column height represents the measured count.",
  },
];
const example = `import { FunnelChart } from "@/components/charts/funnel-chart";

const stages = [
  { stage: "Visitors", count: 50000 },
  { stage: "Product views", count: 28000 },
  { stage: "Added to cart", count: 12000 },
  { stage: "Checkout", count: 5500 },
  { stage: "Purchase", count: 2800 },
];

export function Conversion() {
  return <FunnelChart data={stages} label="stage" value="count"
    variant="tapered" showConversionRates height={400}
    ariaLabel="Purchase conversion" />;
}`;
const props = [
  {
    name: "data",
    type: "readonly T[]",
    required: true,
    description:
      "Stages in process order. Never sorted or aggregated. Values must be finite and nonnegative; numeric strings work. Missing, malformed or negative values produce an actionable error.",
  },
  {
    name: "label / value",
    type: "keyof T",
    required: true,
    description:
      "Stage name and measured value keys. Repeated labels retain separate original rows and indices.",
  },
  {
    name: "variant",
    type: "'tapered' | 'straight' | 'smooth' | 'horizontal' | 'columns'",
    default: "'tapered'",
    description:
      "Tapered/smooth transition from each stage's width to the next. Straight/horizontal encode value by width; columns by height. All use the largest stage as the visual maximum.",
  },
  {
    name: "colors",
    type: "readonly string[]",
    description:
      "CSS colors in stage order. Defaults to blue/purple; an empty array uses that palette. Named colors and inherited variables work.",
  },
  {
    name: "showValues / showPercentages",
    type: "boolean",
    default: "true / true",
    description:
      "Display counts and percentages of the first stage. Stages are repeated observations of a process, so their sum is not the denominator.",
  },
  {
    name: "showConversionRates",
    type: "boolean",
    default: "false",
    description:
      "Show the current / previous stage ratio before the current stage. An increase can exceed 100%. Zero denominators produce an undefined rate, displayed as a dash.",
  },
  {
    name: "showDropOff",
    type: "boolean",
    default: "false",
    description:
      "Show signed change from the preceding stage: counts lost, counts gained or no change. Exact values and rates are always available in inspection.",
  },
  {
    name: "showConnectors",
    type: "boolean",
    default: "true",
    description:
      "Subtle links between centered slices or columns. Horizontal bars retain a common baseline and have no connectors.",
  },
  {
    name: "gap",
    type: "number",
    default: "12",
    description:
      "Requested nonnegative gap. Row layouts reserve at least 26px for rate/change annotations. Columns reserve spacing for readable stage labels.",
  },
  {
    name: "borderRadius",
    type: "number",
    default: "4",
    description:
      "Nonnegative corner radius for straight, horizontal and columns, bounded by the measured shape. Use zero for flat corners.",
  },
  {
    name: "height / className",
    type: "number / string",
    default: "400",
    description:
      "Positive stable frame height and outer styles. Crowded rows scroll vertically; columns scroll horizontally to retain readable labels.",
  },
  {
    name: "loading / error",
    type: "boolean / string | null",
    default: "false / null",
    description:
      "Retain data during loading for identical geometry. Missing initial data uses a matching neutral placeholder. Loading, empty and error states keep the same frame.",
  },
  {
    name: "animation",
    type: "boolean",
    default: "true",
    description:
      "Staggered growth from the center, left baseline or bottom baseline. No entrance fade. Focus completes growth; reduced motion is respected.",
  },
  {
    name: "valueFormatter",
    type: "(value: number) => string",
    description:
      "Format stage values and change magnitudes. Percentages are formatted independently.",
  },
  {
    name: "ariaLabel / description",
    type: "string",
    default: "'Funnel chart'",
    description:
      "Accessible name and context. One roving tab stop, arrow navigation, Home/End, Escape, and Enter/Space activation. The source table includes zero stages.",
  },
  {
    name: "onClick",
    type: "(item: T, index: number) => void",
    description:
      "Original row and original index on mouse, touch or keyboard activation, including zero-valued stages.",
  },
  {
    name: "tooltipRenderer",
    type: "TooltipRenderer<FunnelChartTooltipData<T>>",
    description:
      "Original data/index/rawValue plus parsed value, formattedValue, percentage, conversionRate, previousValue, signed change and color. Rates may be null when undefined or numerically unrepresentable.",
  },
];
export function FunnelChartContent() {
  const [variant, setVariant] = useState<FunnelVariant>("tapered"),
    [dataset, setDataset] = useState("ecommerce"),
    [state, setState] = useState("ready"),
    [palette, setPalette] = useState("default");
  const [showValues, setValues] = useState(true),
    [showPercentages, setPercentages] = useState(true),
    [showConversionRates, setRates] = useState(true),
    [showDropOff, setDropOff] = useState(false),
    [showConnectors, setConnectors] = useState(true),
    [animation, setAnimation] = useState(true);
  const [gap, setGap] = useState(12),
    [radius, setRadius] = useState(4),
    [replay, setReplay] = useState(0),
    [selected, setSelected] = useState<string | null>(null);
  const data = useMemo(() => {
    let rows = dataset === "onboarding" ? onboarding : ecommerce;
    if (dataset === "zero")
      rows = rows.map((row, i) => ({ ...row, count: i >= 3 ? 0 : row.count }));
    if (dataset === "all-zero")
      rows = rows.map((row) => ({ ...row, count: 0 }));
    if (dataset === "zero-first")
      rows = rows.map((row, i) => ({ ...row, count: i === 0 ? 0 : row.count }));
    if (dataset === "increase")
      rows = [
        { stage: "Initial cohort", count: 100 },
        { stage: "Additional entrants", count: 160 },
        { stage: "Qualified", count: 120 },
        { stage: "Activated", count: 60 },
      ];
    if (dataset === "equal")
      rows = rows.map((row) => ({ ...row, count: 1000 }));
    if (dataset === "tiny")
      rows = rows.map((row, i) => ({
        ...row,
        count: [10000, 1000, 100, 10, 1][i]!,
      }));
    if (dataset === "single") rows = [rows[0]!];
    if (dataset === "long")
      rows = rows.map((row) => ({
        ...row,
        stage: `${row.stage} · North America enterprise acquisition`,
      }));
    if (dataset === "many")
      rows = Array.from({ length: 14 }, (_, i) => ({
        stage: `Step ${i + 1}`,
        count: 10000 - i * 600,
      }));
    if (dataset === "invalid") rows = [{ stage: "Visitors", count: "12px" }];
    if (dataset === "negative") rows = [{ stage: "Visitors", count: -10 }];
    if (dataset === "missing") rows = [{ stage: "Visitors", count: null }];
    return state === "empty" || state === "initial-loading" ? [] : rows;
  }, [dataset, state]);
  const colors =
    palette === "mono"
      ? ["#3b82f6"]
      : palette === "multi"
        ? ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
        : palette === "css"
          ? ["var(--primary)"]
          : undefined;
  const selectClass = "h-9 w-full rounded border bg-background px-2 text-sm";
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Components
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Funnel Chart
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Follow a journey from first contact to conversion. Compare the size of
          each stage, find drop-offs, and keep the exact numbers in view.
        </p>
        <CommandSnippet command="npx mario-charts@latest add funnel-chart" />
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
            Five ways to read the same journey.
          </p>
        </div>
        <div className="grid overflow-hidden rounded-md border bg-card lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="space-y-5 border-b p-4 lg:border-b-0 lg:border-r">
            <h3 className="text-sm font-medium">Settings</h3>
            <label className="grid gap-2 text-sm">
              Variant
              <select
                aria-label="Variant"
                className={selectClass}
                value={variant}
                onChange={(e) => setVariant(e.target.value as FunnelVariant)}
              >
                {variants.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Dataset
              <select
                aria-label="Dataset"
                className={selectClass}
                value={dataset}
                onChange={(e) => {
                  setDataset(e.target.value);
                  setSelected(null);
                }}
              >
                {[
                  ["ecommerce", "Purchase journey"],
                  ["onboarding", "SaaS onboarding"],
                  ["increase", "Increasing stage"],
                  ["zero", "Zero final stages"],
                  ["zero-first", "Zero first stage"],
                  ["all-zero", "All zero"],
                  ["equal", "Equal counts"],
                  ["tiny", "Very small conversion"],
                  ["single", "Single stage"],
                  ["long", "Long labels"],
                  ["many", "14 stages"],
                  ["invalid", "Invalid count"],
                  ["negative", "Negative count"],
                  ["missing", "Missing count"],
                ].map(([key, title]) => (
                  <option key={key} value={key}>
                    {title}
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
                  ["loading", "Refreshing"],
                  ["initial-loading", "Initial loading"],
                  ["empty", "Empty"],
                  ["error", "Error"],
                ].map(([key, title]) => (
                  <option key={key} value={key}>
                    {title}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Palette
              <select
                aria-label="Palette"
                className={selectClass}
                value={palette}
                onChange={(e) => setPalette(e.target.value)}
              >
                <option value="default">Blue to purple</option>
                <option value="mono">Single color</option>
                <option value="multi">Multicolor</option>
                <option value="css">Theme color</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Gap · {gap}px
              <input
                aria-label="Gap"
                type="range"
                min={0}
                max={32}
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
              />
            </label>
            {["straight", "horizontal", "columns"].includes(variant) && (
              <label className="grid gap-2 text-sm">
                Corner radius · {radius}px
                <input
                  aria-label="Corner radius"
                  type="range"
                  min={0}
                  max={16}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
              </label>
            )}
            <div className="space-y-3">
              {(
                [
                  ["Values", showValues, setValues],
                  ["Percent of first", showPercentages, setPercentages],
                  ["Step conversion", showConversionRates, setRates],
                  ["Drop-off / gain", showDropOff, setDropOff],
                  ["Connectors", showConnectors, setConnectors],
                  ["Animation", animation, setAnimation],
                ] as const
              ).map(([title, checked, setter]) => (
                <label
                  key={title}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  {title}
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setter(e.target.checked)}
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
          <div className="min-w-0 p-4 sm:p-6">
            <div className="mb-6">
              <h3 className="font-medium">Conversion journey</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {variants.find((v) => v.value === variant)!.description}
              </p>
            </div>
            <FunnelChart
              key={replay}
              data={data}
              label="stage"
              value="count"
              variant={variant}
              {...(colors ? { colors } : {})}
              height={400}
              gap={gap}
              borderRadius={radius}
              showValues={showValues}
              showPercentages={showPercentages}
              showConversionRates={showConversionRates}
              showDropOff={showDropOff}
              showConnectors={showConnectors}
              animation={animation}
              loading={state === "loading" || state === "initial-loading"}
              error={
                state === "error"
                  ? "Unable to load journey data. Try again."
                  : null
              }
              ariaLabel="Current funnel"
              onClick={(row, index) =>
                setSelected(`${index + 1}. ${row.stage}: ${row.count}`)
              }
            />
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              Hover, tap, or focus a stage to inspect. Use arrows to move,
              Home/End to jump, Enter to select, and Escape to dismiss. Scroll
              to reach crowded stages.
            </p>
            <p
              role="status"
              className="mt-3 min-h-5 text-xs text-muted-foreground"
            >
              {selected
                ? `Selected ${selected}`
                : "Select a stage to see its original observation."}
            </p>
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Choose a shape</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {variants.map((v) => (
            <button
              type="button"
              key={v.value}
              aria-pressed={v.value === variant}
              onClick={() => {
                setVariant(v.value);
                document
                  .getElementById("playground-title")
                  ?.scrollIntoView({ block: "start", behavior: "instant" });
              }}
              className="rounded-md border p-4 text-left hover:bg-muted/40"
            >
              <span className="text-sm font-medium">{v.name}</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                {v.description}
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Usage</h2>
        <CodeBlock code={example} language="tsx" />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Reading conversion
        </h2>
        <div className="max-w-3xl space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            50,000 visitors followed by 28,000 product views means 56% step
            conversion and 22,000 lost between those observations. The final
            2,800 purchases are 5.6% of the first stage. Adding stage counts
            would count the same journey more than once.
          </p>
          <p>
            The largest observed stage sets the visual scale. Input order is
            preserved, so stages can widen when additional people enter a
            process. The chart reports an increase and a rate above 100%;
            whether that matches your funnel definition depends on your data.
          </p>
          <p>
            Tapered and smooth shapes transition from each stage&apos;s entry
            width to the next stage&apos;s width. Their areas mix both values.
            Choose straight, horizontal, or columns for direct size comparison.
            Zero counts have no painted area, while labels and inspection remain
            available.
          </p>
          <p>
            A zero first stage has no defined overall percentage; a zero
            preceding stage has no defined step rate. Missing counts are errors,
            not zero. Tooltip rates are nullable, and rawValue preserves the
            original input. Use data and index to access the original stage when
            migrating custom inspection.
          </p>
        </div>
      </section>
      <p className="text-sm text-muted-foreground">
        For a journey that splits into alternative paths and rejoins, use the{" "}
        <Link
          href="/docs/components/sankey-chart"
          className="text-foreground underline underline-offset-4"
        >
          Sankey Chart
        </Link>{" "}
        with measured connections between nodes.
      </p>
      <APIReference
        props={props}
        description="Typed props for stage values, shapes, conversion, and inspection."
      />
    </div>
  );
}
