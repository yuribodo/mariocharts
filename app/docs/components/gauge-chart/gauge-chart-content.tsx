"use client";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  GaugeChart,
  type GaugeZone,
} from "@/src/components/charts/gauge-chart";
import { APIReference } from "../../../../components/ui/api-reference";
import { CodeBlock } from "../../../../components/ui/code-block";
import { CommandSnippet } from "../../../../components/ui/command-snippet";
const zones: readonly GaugeZone[] = [
  { from: 0, to: 60, color: "#22c55e", label: "Normal" },
  { from: 60, to: 80, color: "#f59e0b", label: "High" },
  { from: 80, to: 100, color: "#ef4444", label: "Critical" },
];
const presets = {
  cpu: { min: 0, max: 100, zones, label: "CPU utilization", unit: "%" },
  signed: {
    min: -50,
    max: 50,
    zones: [
      { from: -50, to: 0, color: "#3b82f6", label: "Below reference" },
      { from: 0, to: 50, color: "#f59e0b", label: "Above reference" },
    ],
    label: "Temperature offset",
    unit: "°C",
  },
  offset: {
    min: 20,
    max: 120,
    zones: [
      { from: 20, to: 70, color: "#22c55e", label: "Normal" },
      { from: 70, to: 120, color: "#f59e0b", label: "High" },
    ],
    label: "Operating pressure",
    unit: "kPa",
  },
  gap: {
    min: 0,
    max: 100,
    zones: [zones[0]!, zones[2]!],
    label: "CPU utilization",
    unit: "%",
  },
  repeated: {
    min: 0,
    max: 100,
    zones: zones.map((zone) => ({ ...zone, color: "#3b82f6" })),
    label: "CPU utilization",
    unit: "%",
  },
  unsorted: {
    min: 0,
    max: 100,
    zones: [...zones].reverse(),
    label: "CPU utilization",
    unit: "%",
  },
  long: {
    min: 0,
    max: 100,
    zones: zones.map((zone) => ({
      ...zone,
      label: `${zone.label} operating range for enterprise workloads`,
    })),
    label: "CPU utilization across all production workloads in North America",
    unit: "%",
  },
  overlap: {
    min: 0,
    max: 100,
    zones: [zones[0]!, { ...zones[1]!, from: 50 }, zones[2]!],
    label: "CPU utilization",
    unit: "%",
  },
  outside: {
    min: 0,
    max: 100,
    zones: [{ ...zones[0]!, from: -10 }, zones[1]!, zones[2]!],
    label: "CPU utilization",
    unit: "%",
  },
  reversed: { min: 100, max: 0, zones, label: "CPU utilization", unit: "%" },
} satisfies Record<
  string,
  {
    min: number;
    max: number;
    zones: readonly GaugeZone[];
    label: string;
    unit: string;
  }
>;
const example = `import { GaugeChart } from "@/components/charts/gauge-chart";

const zones = [
  { from: 0, to: 60, color: "#22c55e", label: "Normal" },
  { from: 60, to: 80, color: "#f59e0b", label: "High" },
  { from: 80, to: 100, color: "#ef4444", label: "Critical" },
];

export function Utilization() {
  return <GaugeChart value={65} zones={zones} unit="%"
    label="CPU utilization" ariaLabel="CPU utilization" height={360} />;
}`;
const props = [
  {
    name: "value",
    type: "number",
    required: true,
    description:
      "Actual finite measurement. Outside-range values remain visible; the arc is clamped and retains the boundary zone color, with an Above range / Below range indication.",
  },
  {
    name: "zones",
    type: "readonly GaugeZone[]",
    required: true,
    description:
      "Nonoverlapping { from, to, color, label? } regions inside the range. Zones may be unordered and share colors. Gaps remain unclassified; an empty list displays No Data.",
  },
  {
    name: "min / max",
    type: "number",
    default: "0 / 100",
    description:
      "Finite bounds with min < max. Signed ranges and nonzero minima are supported.",
  },
  {
    name: "unit / label",
    type: "string",
    description:
      "Unit appended to the formatted measurement and a descriptive center label. Full text remains available through inspection.",
  },
  {
    name: "strokeWidth",
    type: "number",
    default: "20",
    description:
      "Positive requested stroke thickness in pixels; capped to fit small frames.",
  },
  {
    name: "strokeLinecap",
    type: "'round' | 'butt'",
    default: "'round'",
    description:
      "Rounded or flat progress/track ends. Zone boundaries stay flat so adjacent regions do not overlap.",
  },
  {
    name: "height",
    type: "number",
    default: "300",
    description:
      "Stable positive frame height across ready, loading, empty, and error states.",
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description:
      "Retain the measurement and zones for matching skeleton geometry. Missing/invalid input uses a neutral placeholder.",
  },
  {
    name: "error",
    type: "string | null",
    default: "null",
    description: "Actionable error message inside the persistent frame.",
  },
  {
    name: "animation",
    type: "boolean",
    default: "true",
    description:
      "Sweep from the minimum on entrance and animate updates from the current arc. Focus finishes motion immediately; reduced motion is respected.",
  },
  {
    name: "valueFormatter",
    type: "(value: number) => string",
    default: "formatValue",
    description:
      "Format the actual measurement, ranges, and inspection. Unit is appended separately.",
  },
  {
    name: "axisValueFormatter",
    type: "(value: number) => string",
    default: "valueFormatter",
    description: "Optional compact endpoint formatting.",
  },
  {
    name: "ariaLabel / description",
    type: "string",
    default: "label or 'Gauge' / undefined",
    description:
      "Accessible meter name and context. ARIA reports the actual measurement in value text and the bounded arc value numerically.",
  },
  {
    name: "tooltipRenderer",
    type: "TooltipRenderer<GaugeChartTooltipData>",
    description:
      "Actual value, clampedValue, min/max, rangeStatus, bounded range-position percentage, unit/label, and the actual zone with original index.",
  },
  {
    name: "className",
    type: "string",
    description: "Classes for the persistent outer frame.",
  },
];
const selectClass = "h-10 min-w-0 rounded border bg-background px-2";
export function GaugeChartContent() {
  const [preset, setPreset] = useState<keyof typeof presets>("cpu");
  const [value, setValue] = useState(65);
  const [state, setState] = useState("ready");
  const [strokeWidth, setStrokeWidth] = useState(20);
  const [strokeLinecap, setStrokeLinecap] = useState<"round" | "butt">("round");
  const [animation, setAnimation] = useState(true);
  const [replay, setReplay] = useState(0);
  const config = presets[preset];
  const loading = state === "loading" || state === "initial-loading";
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Components
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Gauge Chart
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Put a measurement in context with a bounded scale and meaningful
          ranges. Keep the exact value visible, even when it goes beyond a
          limit.
        </p>
        <CommandSnippet command="npx mario-charts@latest add gauge-chart" />
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
            Explore live values, thresholds, and range limits.
          </p>
        </div>
        <div className="grid overflow-hidden rounded-md border bg-card lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="space-y-5 border-b p-4 lg:border-b-0 lg:border-r">
            <div>
              <h3 className="text-sm font-medium">Settings</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                The same gauge through every state.
              </p>
            </div>
            <label className="grid gap-2 text-sm">
              Preset
              <select
                aria-label="Preset"
                className={selectClass}
                value={preset}
                onChange={(e) => {
                  const key = e.target.value as typeof preset;
                  setPreset(key);
                  setValue(key === "signed" ? 15 : 65);
                }}
              >
                {[
                  ["cpu", "CPU utilization"],
                  ["signed", "Signed range"],
                  ["offset", "Nonzero minimum"],
                  ["gap", "Gap between zones"],
                  ["repeated", "Repeated colors"],
                  ["unsorted", "Unordered zones"],
                  ["long", "Long labels"],
                  ["overlap", "Overlapping zones"],
                  ["outside", "Zone outside range"],
                  ["reversed", "Invalid range"],
                ].map(([key, title]) => (
                  <option key={key} value={key}>
                    {title}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Value · {value}
              {config.unit}
              <input
                aria-label="Value"
                type="range"
                min={Math.min(config.min, config.max) - 20}
                max={Math.max(config.min, config.max) + 20}
                step={1}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                ["Minimum", config.min],
                ["Maximum", config.max],
                ["Above range", config.max + 15],
              ].map(([title, next]) => (
                <button
                  key={title}
                  type="button"
                  className="rounded border px-2 py-1 text-xs hover:bg-muted"
                  onClick={() => setValue(Number(next))}
                >
                  {title}
                </button>
              ))}
            </div>
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
                  ["invalid", "Invalid value"],
                ].map(([key, title]) => (
                  <option key={key} value={key}>
                    {title}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              End caps
              <select
                aria-label="End caps"
                className={selectClass}
                value={strokeLinecap}
                onChange={(e) =>
                  setStrokeLinecap(e.target.value as typeof strokeLinecap)
                }
              >
                <option value="round">Rounded</option>
                <option value="butt">Flat</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Stroke width · {strokeWidth}px
              <input
                aria-label="Stroke width"
                type="range"
                min={8}
                max={40}
                step={2}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
              />
            </label>
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
                onClick={() => setReplay((v) => v + 1)}
                className="rounded border p-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8">
            <div className="mb-6">
              <h3 className="font-medium">{config.label}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Illustrative measurement · {config.min} to {config.max}
                {config.unit}
              </p>
            </div>
            <GaugeChart
              key={replay}
              {...config}
              value={
                state === "invalid" || state === "initial-loading" ? NaN : value
              }
              zones={
                state === "empty" || state === "initial-loading"
                  ? []
                  : config.zones
              }
              height={360}
              strokeWidth={strokeWidth}
              strokeLinecap={strokeLinecap}
              animation={animation}
              loading={loading}
              error={
                state === "error"
                  ? "Could not load the measurement. Check your connection and try again."
                  : null
              }
              ariaLabel="Current measurement"
              description="Illustrative measurement with configurable thresholds."
            />
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              Hover, tap, or focus the gauge to inspect. Escape dismisses the
              tooltip. Change the value to see the arc update.
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
          Reading the gauge
        </h2>
        <div className="max-w-3xl space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            The arc shows position within the configured range, measured from
            the minimum. A range of 20–120 places 70 at the midpoint; this is
            not a percentage of the maximum.
          </p>
          <p>
            The center and tooltip retain the actual measurement. Above or below
            the range, the arc stops at its endpoint and keeps the boundary zone’s
            color. A visible status explains why. The meter is read-only.
          </p>
          <p>
            Zones include their starting value and exclude their ending value,
            except at the gauge maximum. A shared boundary belongs to the zone
            starting there. Gaps remain unclassified; overlapping zones produce
            an error.
          </p>
          <p>
            Use thresholds that match your metric. A high value may be good for
            target attainment and bad for CPU pressure. Keep labels descriptive
            so color is not the only explanation.
          </p>
        </div>
      </section>
      <APIReference
        title="API Reference"
        description="Typed props for values, ranges, zones, and inspection."
        props={props}
      />
    </div>
  );
}
