"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { BarChart } from "@/src/components/charts/bar-chart";
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

        <div className="overflow-hidden rounded-md border bg-card">
          <div className="flex flex-col gap-4 border-b bg-muted/25 p-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
                <span>Orientation</span>
                <select aria-label="Orientation" value={orientation} onChange={(event) => setOrientation(event.target.value as Orientation)} className="h-9 min-w-32 rounded border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="vertical">Vertical</option>
                  <option value="horizontal">Horizontal</option>
                </select>
              </label>
              <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
                <span>Variant</span>
                <select aria-label="Variant" value={variant} onChange={(event) => setVariant(event.target.value as Variant)} className="h-9 min-w-32 rounded border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="filled">Filled</option>
                  <option value="outline">Outline</option>
                </select>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex min-h-9 items-center gap-2 text-sm">
                <input type="checkbox" checked={animation} onChange={(event) => setAnimation(event.target.checked)} className="size-4 accent-foreground" />
                Animate
              </label>
              <button type="button" onClick={() => setChartKey((key) => key + 1)} disabled={!animation} className="inline-flex size-9 items-center justify-center rounded border bg-background text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40" aria-label="Replay animation" title="Replay animation">
                <RotateCcw className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="h-[360px] p-5 sm:p-8">
            <BarChart key={chartKey} data={monthlyRevenue} x="month" y="revenue" colors={chartColors} orientation={orientation} variant={variant} animation={animation} showGrid />
          </div>
        </div>

        <CodeBlock code={exampleCode} language="tsx" />
      </section>

      <section aria-labelledby="states-title" className="space-y-5">
        <div>
          <h2 id="states-title" className="text-2xl font-semibold">Production states</h2>
          <p className="mt-2 text-muted-foreground">Loading, failure, and empty data use the same stable chart frame.</p>
        </div>
        <div className="grid divide-y overflow-hidden rounded-md border bg-card md:grid-cols-3 md:divide-x md:divide-y-0">
          <StatePreview title="Loading"><BarChart data={monthlyRevenue} x="month" y="revenue" loading /></StatePreview>
          <StatePreview title="Error"><BarChart data={monthlyRevenue} x="month" y="revenue" error="Could not load revenue" /></StatePreview>
          <StatePreview title="Empty"><BarChart data={[]} x="month" y="revenue" /></StatePreview>
        </div>
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

function StatePreview({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="p-4"><h3 className="mb-3 font-mono text-xs uppercase text-muted-foreground">{title}</h3><div className="h-52">{children}</div></div>;
}
