"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ChartBar, ChartColumn, Check, Database, LoaderCircle, RotateCcw, Square, SquareDashed, TriangleAlert } from "lucide-react";
import { BarChart } from "@/src/components/charts/bar-chart";
import { cn } from "@/lib/utils";
import { APIReference } from "../../../../components/ui/api-reference";
import { CodeBlock } from "../../../../components/ui/code-block";
import { CommandSnippet } from "../../../../components/ui/command-snippet";

const monthlyRevenue = [
  { month: "Jan", revenue: 4500 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 5900 },
  { month: "Jun", revenue: 7200 },
] as const;

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
  { name: "data", type: "readonly T[]", description: "Data objects rendered by the chart.", required: true },
  { name: "x", type: "keyof T", description: "Property used for category labels.", required: true },
  { name: "y", type: "keyof T", default: '"value"', description: "Property used for numeric values." },
  { name: "colors", type: "readonly string[]", default: "chart palette", description: "Colors applied to bars in order." },
  { name: "variant", type: '"filled" | "outline"', default: '"filled"', description: "Visual treatment for each bar." },
  { name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Direction in which bars grow." },
  { name: "height", type: "number", default: "300", description: "Chart height in pixels." },
  { name: "showGrid", type: "boolean", default: "false", description: "Displays grid lines and value ticks." },
  { name: "animation", type: "boolean", default: "true", description: "Enables the entrance animation." },
  { name: "loading", type: "boolean", default: "false", description: "Displays the loading state." },
  { name: "error", type: "string | null", default: "null", description: "Displays an actionable error state." },
  { name: "onBarClick", type: "(data: T, index: number) => void", description: "Runs when a bar is selected." },
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
    description: "Replaces the plot with an actionable message without shifting the layout.",
    prop: 'error="Could not load data"',
    icon: TriangleAlert,
    color: "var(--chart-coral)",
  },
  {
    title: "Empty",
    description: "Explains that no values are available instead of rendering an empty plot.",
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

  return (
    <article className="space-y-16 pb-20">
      <header className="border-b pb-10 pt-3">
        <p className="mb-3 font-mono text-xs uppercase text-muted-foreground">Charts / Categorical</p>
        <h1 className="text-4xl font-semibold tracking-normal">Bar Chart</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          Compare values across categories with accessible interactions, responsive layouts, and useful production states built in.
        </p>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-label="Component qualities">
          {["Type-safe", "Keyboard accessible", "Responsive", "Copy-paste ready"].map((quality) => (
            <li key={quality} className="flex items-center gap-2"><Check className="size-3.5 text-[var(--chart-green)]" aria-hidden="true" />{quality}</li>
          ))}
        </ul>
        <div className="mt-8 max-w-xl">
          <CommandSnippet command="npx mario-charts@latest add bar-chart" label="Install Bar Chart" />
        </div>
      </header>

      <section aria-labelledby="playground-title" className="space-y-5">
        <div>
          <h2 id="playground-title" className="text-2xl font-semibold">Playground</h2>
          <p className="mt-2 text-muted-foreground">Start with the default, then adjust only what your data needs.</p>
        </div>

        <div className="grid overflow-hidden rounded-md border bg-card md:grid-cols-[190px_minmax(0,1fr)]">
          <aside className="border-b bg-muted/20 p-4 md:border-b-0 md:border-r" aria-label="Chart settings">
            <div className="mb-5">
              <h3 className="text-sm font-semibold">Settings</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Tune the preview without changing its data.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-1">
              <SegmentedControl label="Orientation" description="Direction of comparison." value={orientation} options={orientationOptions} onChange={setOrientation} />

              <SegmentedControl label="Appearance" description="Visual weight of the bars." value={variant} options={appearanceOptions} onChange={setVariant} />
            </div>

            <div className="mt-5 flex items-center justify-between border-t pt-4">
              <label className="flex min-h-10 items-center gap-2 text-sm">
                <input type="checkbox" checked={animation} onChange={(event) => setAnimation(event.target.checked)} className="size-4 accent-foreground" />
                Animate
              </label>
              <button type="button" onClick={() => setChartKey((key) => key + 1)} disabled={!animation} className="inline-flex size-10 items-center justify-center rounded border bg-background text-muted-foreground transition-colors hover:text-foreground active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Replay animation" title="Replay animation">
                <RotateCcw className="size-4" aria-hidden="true" />
              </button>
            </div>
          </aside>

          <div className="h-[360px] min-w-0 p-5 sm:p-8">
            <BarChart key={chartKey} data={monthlyRevenue} x="month" y="revenue" colors={chartColors} orientation={orientation} variant={variant} animation={animation} showGrid />
          </div>
        </div>

        <CodeBlock code={exampleCode} language="tsx" />
      </section>

      <section aria-labelledby="states-title" className="space-y-5">
        <div>
          <h2 id="states-title" className="text-2xl font-semibold">Resilient by default</h2>
          <p className="mt-2 text-muted-foreground">Built-in states preserve context when the data is not ready to render.</p>
        </div>
        <ul className="divide-y overflow-hidden rounded-md border bg-card">
          {productionStates.map((state) => {
            const Icon = state.icon;
            return (
              <li key={state.title} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
                <div className="flex min-w-0 gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded border bg-background" style={{ color: state.color }}>
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-medium">{state.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{state.description}</p>
                  </div>
                </div>
                <code className="w-fit rounded border bg-muted/35 px-2.5 py-1.5 font-mono text-xs text-muted-foreground">{state.prop}</code>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="decisions-title" className="space-y-5">
        <div>
          <h2 id="decisions-title" className="text-2xl font-semibold">Choose the right orientation</h2>
          <p className="mt-2 text-muted-foreground">The shape of the labels should decide the layout.</p>
        </div>
        <div className="grid divide-y rounded-md border md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="p-5"><h3 className="font-medium">Vertical</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Best for short category labels and chronological comparison.</p></div>
          <div className="p-5"><h3 className="font-medium">Horizontal</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Best for long labels, rankings, and dense category lists.</p></div>
        </div>
      </section>

      <APIReference title="API Reference" description="The core surface stays small; advanced behavior remains explicit." props={barChartProps} />
    </article>
  );
}

interface SegmentedOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly icon: LucideIcon;
}

function SegmentedControl<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string;
  description: string;
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
}) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + options.length) % options.length;
    const nextOption = options[nextIndex];
    if (!nextOption) return;

    onChange(nextOption.value);
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button");
    buttons?.[nextIndex]?.focus();
  };

  return (
    <div>
      <span className="text-xs font-medium text-foreground">{label}</span>
      <div role="group" aria-label={label} className="mt-2 grid grid-cols-2 gap-1 rounded-md border bg-muted/45 p-1">
        {options.map((option, index) => {
          const Icon = option.icon;
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "inline-flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded text-xs font-medium transition-[color,background-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]",
                isActive
                  ? "bg-background text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                  : "text-muted-foreground hover:bg-background/55 hover:text-foreground",
              )}
            >
              <Icon className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
      <span className="mt-1.5 block text-xs font-normal leading-5 text-muted-foreground">{description}</span>
    </div>
  );
}
