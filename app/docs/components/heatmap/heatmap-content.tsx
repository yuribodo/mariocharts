"use client";

import { useState } from "react";
import { Breadcrumbs } from "../../../../components/site/breadcrumbs";
import { HeatmapChart } from "@/src/components/charts/heatmap";
import { ExampleShowcase } from "../../../../components/ui/example-showcase";
import { APIReference } from "../../../../components/ui/api-reference";
import { InstallationGuide } from "../../../../components/ui/installation-guide";
import { GridFour } from "@phosphor-icons/react";
import { StyledSelect } from "../../../../components/ui/styled-select";
import { AnimatedCheckbox } from "../../../../components/ui/animated-checkbox";
import type { ColorScheme } from "@/src/components/charts/heatmap";

// Dataset 1: GitHub-style activity calendar (7 weeks × 7 days)
const activityData = (() => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeks = Array.from({ length: 7 }, (_, i) => `W${i + 1}`);
  const data: { week: string; day: string; commits: number }[] = [];
  for (const week of weeks) {
    for (const day of days) {
      const isWeekend = day === "Sat" || day === "Sun";
      data.push({
        week,
        day,
        commits: isWeekend
          ? Math.floor(Math.random() * 3)
          : Math.floor(Math.random() * 12),
      });
    }
  }
  return data;
})();

// Dataset 2: Temperature by hour × day
const temperatureData = (() => {
  const hours = ["6am", "9am", "12pm", "3pm", "6pm", "9pm"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const baseTemps = [16, 18, 20, 19, 17, 22, 23];
  const hourMultiplier = [0.8, 0.9, 1.1, 1.15, 1.0, 0.85];
  return days.flatMap((day, di) =>
    hours.map((hour, hi) => ({
      day,
      hour,
      temp: Math.round(baseTemps[di]! * hourMultiplier[hi]!),
    }))
  );
})();

// Dataset 3: Product correlation matrix (6×6)
const products = ["Laptop", "Phone", "Tablet", "Watch", "Earbuds", "Cable"];
const correlationData = products.flatMap((productA, i) =>
  products.map((productB, j) => ({
    productA,
    productB,
    correlation: i === j ? 100 : Math.round(Math.abs(Math.sin((i + 1) * (j + 1)) * 90)),
  }))
);

// API Reference
const heatmapProps = [
  { name: "data", type: "readonly T[]", description: "Array of data objects to display", required: true },
  { name: "x", type: "keyof T", description: "Key for column labels (x-axis)", required: true },
  { name: "y", type: "keyof T", description: "Key for row labels (y-axis)", required: true },
  { name: "value", type: "keyof T", description: "Key for numeric cell values", required: true },
  {
    name: "colorScheme",
    type: "'blue' | 'green' | 'amber' | 'purple' | 'diverging'",
    default: "'blue'",
    description: "Color scheme for cell intensity. 'diverging' uses blue/red for low/high values",
  },
  { name: "showLabels", type: "boolean", default: "true", description: "Show column and row labels" },
  { name: "cellRadius", type: "number", default: "4", description: "Border radius of each cell in pixels" },
  { name: "height", type: "number", default: "320", description: "Height of the chart in pixels" },
  { name: "loading", type: "boolean", default: "false", description: "Show loading skeleton state" },
  { name: "error", type: "string | null", default: "null", description: "Error message to display" },
  { name: "animation", type: "boolean", default: "true", description: "Enable stagger entrance animation" },
  {
    name: "onClick",
    type: "(item: T, colLabel: string, rowLabel: string) => void",
    description: "Callback when a cell is clicked",
  },
  { name: "className", type: "string", description: "Additional CSS classes for the container" },
];

const installationSteps = [
  {
    title: "Initialize Mario Charts (first time only)",
    description: "Set up Mario Charts in your React project.",
    code: `npx mario-charts@latest init`,
    language: "bash",
  },
  {
    title: "Add the HeatmapChart component",
    description: "Install the HeatmapChart component using the CLI.",
    code: `npx mario-charts@latest add heatmap`,
    language: "bash",
  },
  {
    title: "Start using the component",
    description: "Import and use the HeatmapChart in your React components.",
    code: `import { HeatmapChart } from "@/components/charts/heatmap";

<HeatmapChart
  data={data}
  x="week"
  y="day"
  value="commits"
  colorScheme="green"
/>`,
    language: "tsx",
  },
];

export function HeatmapContent() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("green");
  const [showLabels, setShowLabels] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);

  const [tempScheme, setTempScheme] = useState<ColorScheme>("amber");
  const [corrScheme, setCorrScheme] = useState<ColorScheme>("diverging");

  const replay = () => setChartKey(prev => prev + 1);

  return (
    <div className="max-w-none space-y-12">
      <Breadcrumbs />

      {/* Hero */}
      <div className="flex flex-col space-y-4 pb-8 pt-6">
        <div className="flex items-center space-x-3">
          <GridFour size={24} weight="duotone" className="text-primary" />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Heatmap Chart
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-7 max-w-3xl">
          A production-ready heatmap component for visualizing NxM grids with color-coded intensity.
          Perfect for activity calendars, correlation matrices, and time-series patterns.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          {[
            "5 Color Schemes",
            "Stagger Animation",
            "Hover Tooltip",
            "Responsive",
            "TypeScript",
            "Keyboard Accessible",
            "Reduced Motion",
          ].map(f => (
            <div key={f} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Example 1: Activity calendar */}
      <ExampleShowcase
        title="GitHub-Style Activity Calendar"
        description="Weekly commit activity heatmap with configurable color scheme and labels"
        preview={
          <div className="space-y-4">
            <div className="h-64">
              <HeatmapChart
                key={chartKey}
                data={activityData}
                x="week"
                y="day"
                value="commits"
                colorScheme={colorScheme}
                showLabels={showLabels}
                animation={showAnimation}
                height={240}
              />
            </div>
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Color scheme:</span>
                    <StyledSelect
                      value={colorScheme}
                      onValueChange={v => setColorScheme(v as ColorScheme)}
                      options={[
                        { value: "green", label: "Green" },
                        { value: "blue", label: "Blue" },
                        { value: "amber", label: "Amber" },
                        { value: "purple", label: "Purple" },
                        { value: "diverging", label: "Diverging" },
                      ]}
                    />
                  </div>
                  <AnimatedCheckbox checked={showLabels} onChange={setShowLabels} label="Labels" id="heatmap-labels" />
                  <AnimatedCheckbox checked={showAnimation} onChange={setShowAnimation} label="Animation" id="heatmap-anim" />
                </div>
                <button
                  onClick={replay}
                  disabled={!showAnimation}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  Replay Animation
                </button>
              </div>
            </div>
          </div>
        }
        code={`import { HeatmapChart } from '@/components/charts/heatmap';

const activityData = weeks.flatMap(week =>
  days.map(day => ({ week, day, commits: Math.floor(Math.random() * 12) }))
);

export function ActivityCalendar() {
  return (
    <HeatmapChart
      data={activityData}
      x="week"
      y="day"
      value="commits"
      colorScheme="green"
      showLabels
    />
  );
}`}
      />

      <InstallationGuide
        title="Installation"
        description="Get started with the HeatmapChart component in just a few steps."
        cliCommand="npx mario-charts@latest add heatmap"
        steps={installationSteps}
        copyPasteCode="// Complete HeatmapChart component code available after CLI installation"
      />

      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Examples</h2>
          <p className="text-muted-foreground">Different datasets and color schemes for the HeatmapChart component.</p>
        </div>

        {/* Example 2: Temperature */}
        <ExampleShowcase
          title="Hourly Temperature Matrix"
          description="Temperature readings by hour and day of week using amber color scheme"
          preview={
            <div className="space-y-4">
              <div className="h-64">
                <HeatmapChart
                  key={`temp-${chartKey}`}
                  data={temperatureData}
                  x="hour"
                  y="day"
                  value="temp"
                  colorScheme={tempScheme}
                  height={240}
                  animation={showAnimation}
                />
              </div>
              <div className="flex items-center gap-4 pt-2 border-t text-sm">
                <span>Color scheme:</span>
                <StyledSelect
                  value={tempScheme}
                  onValueChange={v => setTempScheme(v as ColorScheme)}
                  options={[
                    { value: "amber", label: "Amber" },
                    { value: "blue", label: "Blue" },
                    { value: "green", label: "Green" },
                    { value: "purple", label: "Purple" },
                  ]}
                />
              </div>
            </div>
          }
          code={`import { HeatmapChart } from '@/components/charts/heatmap';

const temperatureData = days.flatMap(day =>
  hours.map(hour => ({ day, hour, temp: getTemp(day, hour) }))
);

export function TemperatureMatrix() {
  return (
    <HeatmapChart
      data={temperatureData}
      x="hour"
      y="day"
      value="temp"
      colorScheme="amber"
    />
  );
}`}
        />

        {/* Example 3: Correlation matrix */}
        <ExampleShowcase
          title="Product Correlation Matrix"
          description="6×6 cross-sell correlation matrix with diverging color scheme"
          preview={
            <div className="space-y-4">
              <div className="h-72">
                <HeatmapChart
                  key={`corr-${chartKey}`}
                  data={correlationData}
                  x="productA"
                  y="productB"
                  value="correlation"
                  colorScheme={corrScheme}
                  cellRadius={2}
                  height={256}
                  animation={showAnimation}
                />
              </div>
              <div className="flex items-center gap-4 pt-2 border-t text-sm">
                <span>Color scheme:</span>
                <StyledSelect
                  value={corrScheme}
                  onValueChange={v => setCorrScheme(v as ColorScheme)}
                  options={[
                    { value: "diverging", label: "Diverging" },
                    { value: "blue", label: "Blue" },
                    { value: "purple", label: "Purple" },
                  ]}
                />
              </div>
            </div>
          }
          code={`import { HeatmapChart } from '@/components/charts/heatmap';

const correlationData = products.flatMap(productA =>
  products.map(productB => ({
    productA,
    productB,
    correlation: getCorrelation(productA, productB),
  }))
);

export function CorrelationMatrix() {
  return (
    <HeatmapChart
      data={correlationData}
      x="productA"
      y="productB"
      value="correlation"
      colorScheme="diverging"
      cellRadius={2}
    />
  );
}`}
        />

        {/* States */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Loading State</h3>
            <div className="h-56">
              <HeatmapChart data={activityData} x="week" y="day" value="commits" loading height={210} />
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Error State</h3>
            <div className="h-56">
              <HeatmapChart data={activityData} x="week" y="day" value="commits" error="Failed to load data" height={210} />
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Empty State</h3>
            <div className="h-56">
              <HeatmapChart data={[]} x="week" y="day" value="commits" height={210} />
            </div>
          </div>
        </div>
      </div>

      <APIReference
        title="API Reference"
        description="Complete TypeScript interface with all available props and configurations."
        props={heatmapProps}
      />
    </div>
  );
}
