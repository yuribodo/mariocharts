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
import type { ColorScheme, HeatmapVariant } from "@/src/components/charts/heatmap";

// Dataset 1: Activity calendar (7 weeks × 7 days)
const activityData = (() => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeks = Array.from({ length: 7 }, (_, i) => `W${i + 1}`);
  const data: { week: string; day: string; commits: number }[] = [];
  const seed = [4, 9, 2, 11, 7, 1, 6, 3, 10, 5, 8, 0, 12, 2];
  let si = 0;
  for (const week of weeks) {
    for (const day of days) {
      const isWeekend = day === "Sat" || day === "Sun";
      data.push({
        week,
        day,
        commits: isWeekend ? (seed[si++ % seed.length]! % 3) : (seed[si++ % seed.length]! % 12),
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

// Dataset 4: Traffic by hour × day (radial)
const hours = Array.from({ length: 24 }, (_, i) => `${i}h`);
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const trafficData = hours.flatMap((hour, hi) =>
  weekdays.map((day, di) => ({
    hour,
    day,
    traffic: Math.round(
      Math.abs(Math.sin((hi * Math.PI) / 12)) * 100 *
      (di < 5 ? 1 : 0.5) *
      (hi >= 8 && hi <= 18 ? 1 : 0.3) +
      Math.random() * 10
    ),
  }))
);

// API Reference
const heatmapProps = [
  { name: "data", type: "readonly T[]", description: "Array of data objects to display", required: true },
  { name: "x", type: "keyof T", description: "Key for column labels (x-axis / angular axis)", required: true },
  { name: "y", type: "keyof T", description: "Key for row labels (y-axis / radial axis)", required: true },
  { name: "value", type: "keyof T", description: "Key for numeric cell values", required: true },
  {
    name: "variant",
    type: "'grid' | 'calendar' | 'bubble' | 'radial'",
    default: "'grid'",
    description: "grid: standard heatmap with cross-highlight; calendar: GitHub-style; bubble: circle-sized cells; radial: polar clock",
  },
  {
    name: "colorScheme",
    type: "'blue' | 'green' | 'amber' | 'purple' | 'diverging'",
    default: "'blue'",
    description: "Built-in color scheme. 'diverging' interpolates through neutral midpoint",
  },
  { name: "colorFrom", type: "string", description: "Override the low-value color (hex). Overrides colorScheme start." },
  { name: "colorTo", type: "string", description: "Override the high-value color (hex). Overrides colorScheme end." },
  { name: "showLabels", type: "boolean", default: "true", description: "Show axis labels" },
  { name: "showLegend", type: "boolean", default: "false", description: "Show color legend (Less/More). Default true for calendar." },
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
  variant="calendar"
  colorScheme="green"
  showLegend
/>`,
    language: "tsx",
  },
];

export function HeatmapContent() {
  const [variant, setVariant] = useState<HeatmapVariant>("grid");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("green");
  const [showLabels, setShowLabels] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);

  const [corrScheme, setCorrScheme] = useState<ColorScheme>("diverging");
  const [tempScheme, setTempScheme] = useState<ColorScheme>("amber");

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
          Four powerful heatmap variants — grid with crosshair highlight, GitHub-style calendar, bubble matrix, and radial polar clock.
          Full color interpolation, legend, and zero external dependencies beyond Framer Motion.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          {[
            "4 Variants",
            "Cross-Highlight",
            "Color Interpolation",
            "Calendar Mode",
            "Bubble Matrix",
            "Radial / Polar",
            "Color Legend",
            "TypeScript",
          ].map(f => (
            <div key={f} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Example 1: All variants on activity data */}
      <ExampleShowcase
        title="Activity Heatmap — All Variants"
        description="Switch between grid (with crosshair highlight), calendar, bubble, and radial — all using the same data format"
        preview={
          <div className="space-y-4">
            <div style={{ height: variant === "radial" ? 340 : 280 }}>
              <HeatmapChart
                key={`${chartKey}-${variant}`}
                data={activityData}
                x="week"
                y="day"
                value="commits"
                variant={variant}
                colorScheme={colorScheme}
                showLabels={showLabels}
                showLegend={showLegend}
                animation={showAnimation}
                height={variant === "radial" ? 340 : 280}
              />
            </div>
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Variant:</span>
                    <StyledSelect
                      value={variant}
                      onValueChange={v => setVariant(v as HeatmapVariant)}
                      options={[
                        { value: "grid", label: "Grid" },
                        { value: "calendar", label: "Calendar" },
                        { value: "bubble", label: "Bubble" },
                        { value: "radial", label: "Radial" },
                      ]}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>Color:</span>
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
                  <AnimatedCheckbox checked={showLegend} onChange={setShowLegend} label="Legend" id="heatmap-legend" />
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

// Same data, four variants
<HeatmapChart
  data={activityData}
  x="week"
  y="day"
  value="commits"
  variant="calendar"   // "grid" | "calendar" | "bubble" | "radial"
  colorScheme="green"
  showLegend
/>`}
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
          <p className="text-muted-foreground">Variant-specific use cases and real-world datasets.</p>
        </div>

        {/* Example 2: Grid with cross-highlight */}
        <ExampleShowcase
          title="Grid — Cross-Highlight on Hover"
          description="Hover any cell to highlight its row and column with a crosshair effect. Unique to Mario Charts."
          preview={
            <div className="space-y-4">
              <div style={{ height: 260 }}>
                <HeatmapChart
                  key={`temp-${chartKey}`}
                  data={temperatureData}
                  x="hour"
                  y="day"
                  value="temp"
                  variant="grid"
                  colorScheme={tempScheme}
                  showLegend
                  height={260}
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

// Hover a cell → its row + column dim out, crosshair appears
<HeatmapChart
  data={temperatureData}
  x="hour"
  y="day"
  value="temp"
  variant="grid"
  colorScheme="amber"
  showLegend
/>`}
        />

        {/* Example 3: Bubble matrix */}
        <ExampleShowcase
          title="Bubble Matrix — Size + Color Encoding"
          description="Each cell's circle radius scales with value, doubling the information density of a standard heatmap"
          preview={
            <div className="space-y-4">
              <div style={{ height: 280 }}>
                <HeatmapChart
                  key={`corr-${chartKey}`}
                  data={correlationData}
                  x="productA"
                  y="productB"
                  value="correlation"
                  variant="bubble"
                  colorScheme={corrScheme}
                  cellRadius={2}
                  showLegend
                  height={280}
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

<HeatmapChart
  data={correlationData}
  x="productA"
  y="productB"
  value="correlation"
  variant="bubble"
  colorScheme="diverging"
  showLegend
/>`}
        />

        {/* Example 4: Radial — traffic by hour × day */}
        <ExampleShowcase
          title="Radial / Polar Clock — Traffic by Hour & Day"
          description="Cyclical data rendered as concentric rings — ideal for time-of-day × day-of-week patterns"
          preview={
            <div style={{ height: 360 }}>
              <HeatmapChart
                key={`radial-${chartKey}`}
                data={trafficData}
                x="hour"
                y="day"
                value="traffic"
                variant="radial"
                colorScheme="blue"
                showLegend
                height={360}
                animation={showAnimation}
              />
            </div>
          }
          code={`import { HeatmapChart } from '@/components/charts/heatmap';

// x = angular (hours), y = rings (days)
<HeatmapChart
  data={trafficData}
  x="hour"
  y="day"
  value="traffic"
  variant="radial"
  colorScheme="blue"
  showLegend
  height={360}
/>`}
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
