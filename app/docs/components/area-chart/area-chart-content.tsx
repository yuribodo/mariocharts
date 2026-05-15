"use client";

import { useState } from "react";
import { Breadcrumbs } from "../../../../components/site/breadcrumbs";
import { AreaChart } from "@/src/components/charts/area-chart";
import { ExampleShowcase } from "../../../../components/ui/example-showcase";
import { APIReference } from "../../../../components/ui/api-reference";
import { InstallationGuide } from "../../../../components/ui/installation-guide";
import { ChartLineUp } from "@phosphor-icons/react";
import { StyledSelect } from "../../../../components/ui/styled-select";
import { AnimatedCheckbox } from "../../../../components/ui/animated-checkbox";

const weeklyTraffic = [
  { day: "Mon", visitors: 3200, pageViews: 8400, bounceRate: 42 },
  { day: "Tue", visitors: 4100, pageViews: 10200, bounceRate: 38 },
  { day: "Wed", visitors: 3800, pageViews: 9600, bounceRate: 40 },
  { day: "Thu", visitors: 5200, pageViews: 13100, bounceRate: 35 },
  { day: "Fri", visitors: 4800, pageViews: 12400, bounceRate: 37 },
  { day: "Sat", visitors: 6100, pageViews: 15800, bounceRate: 32 },
  { day: "Sun", visitors: 5500, pageViews: 14200, bounceRate: 34 },
] as const;

const monthlyMetrics = [
  { month: "Jan", revenue: 4500, costs: 2800, profit: 1700 },
  { month: "Feb", revenue: 5200, costs: 3100, profit: 2100 },
  { month: "Mar", revenue: 4800, costs: 2900, profit: 1900 },
  { month: "Apr", revenue: 6100, costs: 3400, profit: 2700 },
  { month: "May", revenue: 5900, costs: 3200, profit: 2700 },
  { month: "Jun", revenue: 7200, costs: 3800, profit: 3400 },
] as const;

const temperatureData = [
  { hour: "00:00", temperature: 18.5 },
  { hour: "04:00", temperature: 16.2 },
  { hour: "08:00", temperature: 21.8 },
  { hour: "12:00", temperature: 28.4 },
  { hour: "16:00", temperature: 26.1 },
  { hour: "20:00", temperature: 22.3 },
] as const;

const areaChartProps = [
  {
    name: "data",
    type: "readonly T[]",
    description: "Array of data objects to display in the chart",
    required: true,
  },
  {
    name: "x",
    type: "keyof T",
    description: "Key from data object to use for x-axis labels",
    required: true,
  },
  {
    name: "y",
    type: "keyof T | readonly (keyof T)[]",
    description: "Key(s) from data object to use for y-axis values. Single key for one area, array for multiple series",
    required: true,
  },
  {
    name: "colors",
    type: "readonly string[]",
    default: "DEFAULT_COLORS",
    description: "Array of colors to use for areas (cycles through for multiple series)",
  },
  {
    name: "height",
    type: "number",
    default: "300",
    description: "Height of the chart in pixels",
  },
  {
    name: "areaOpacity",
    type: "number",
    default: "0.3",
    description: "Fill opacity for the area (0 to 1)",
  },
  {
    name: "gradient",
    type: "boolean",
    default: "true",
    description: "Use gradient fill from top to bottom instead of solid color",
  },
  {
    name: "stacked",
    type: "boolean",
    default: "false",
    description: "Stack areas on top of each other for cumulative visualization",
  },
  {
    name: "strokeWidth",
    type: "number",
    default: "1.5",
    description: "Width of the area border line in pixels",
  },
  {
    name: "curve",
    type: "'linear' | 'monotone' | 'natural' | 'step'",
    default: "'monotone'",
    description: "Type of curve interpolation for the area boundary",
  },
  {
    name: "showDots",
    type: "boolean",
    default: "false",
    description: "Show circle markers at each data point",
  },
  {
    name: "showGrid",
    type: "boolean",
    default: "false",
    description: "Show horizontal grid lines and Y-axis tick labels",
  },
  {
    name: "gridStyle",
    type: "'solid' | 'dashed' | 'dotted'",
    default: "'dashed'",
    description: "Style of the grid lines when showGrid is enabled",
  },
  {
    name: "showLegend",
    type: "boolean",
    default: "false",
    description: "Show legend below the chart for multi-series data",
  },
  {
    name: "connectNulls",
    type: "boolean",
    default: "true",
    description: "Whether to connect points across null/missing values",
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: "Show loading state with animated skeleton",
  },
  {
    name: "error",
    type: "string | null",
    default: "null",
    description: "Error message to display",
  },
  {
    name: "animation",
    type: "boolean",
    default: "true",
    description: "Enable entrance animations",
  },
  {
    name: "onPointClick",
    type: "(data: T, index: number, series?: string) => void",
    description: "Callback fired when a data point is clicked",
  },
  {
    name: "tooltipRenderer",
    type: "(data: AreaChartTooltipData<T>) => React.ReactNode",
    description: "Custom tooltip render function for full control over tooltip content",
  },
  {
    name: "className",
    type: "string",
    description: "Additional CSS classes to apply to the container",
  },
];

const installationSteps = [
  {
    title: "Initialize Mario Charts (first time only)",
    description: "Set up Mario Charts in your React project. This configures paths and dependencies.",
    code: `# Initialize the project (run once)
npx mario-charts@latest init

# Or initialize with components
npx mario-charts@latest init --components area-chart`,
    language: "bash",
  },
  {
    title: "Add the AreaChart component",
    description: "Install the AreaChart component using the CLI. This automatically handles dependencies.",
    code: `# Add AreaChart component
npx mario-charts@latest add area-chart

# Add multiple chart components at once
npx mario-charts@latest add area-chart line-chart bar-chart`,
    language: "bash",
  },
  {
    title: "Start using the component",
    description: "Import and use the AreaChart in your React components.",
    code: `import { AreaChart } from "@/components/charts/area-chart";

// Single area chart
<AreaChart
  data={data}
  x="day"
  y="visitors"
/>

// Multiple series with stacking
<AreaChart
  data={data}
  x="month"
  y={["revenue", "costs"]}
  stacked
  showLegend
/>`,
    language: "tsx",
  },
];

export function AreaChartContent() {
  const [selectedPoint, setSelectedPoint] = useState<Record<string, unknown> | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);
  const [curve, setCurve] = useState<"linear" | "monotone" | "natural" | "step">("monotone");
  const [showDots, setShowDots] = useState(false);
  const [useGradient, setUseGradient] = useState(true);

  const replayAnimation = () => {
    setChartKey((prev) => prev + 1);
  };

  return (
    <div className="max-w-none space-y-12">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Hero Section */}
      <div className="flex flex-col space-y-4 pb-8 pt-6">
        <div className="flex items-center space-x-3">
          <ChartLineUp size={24} weight="duotone" className="text-primary" />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Area Chart
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-7 max-w-3xl">
          A versatile area chart component for visualizing trends and volumes over time.
          Supports gradient fills, stacked areas, multiple series, and smooth animations.
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            CLI Installation
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Gradient & Solid Fill
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Stacked Areas
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Multiple Series
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Curve Interpolation
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Interactive Tooltips
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Grid Lines & Y-Axis
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Keyboard Accessible
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Performance Optimized
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            TypeScript
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Zero Dependencies
          </div>
        </div>
      </div>

      {/* Quick Start Example */}
      <ExampleShowcase
        title="Basic Example"
        description="A simple area chart showing weekly website traffic with gradient fill and interactive points"
        preview={
          <div className="space-y-4">
            <div className="h-80">
              <AreaChart
                key={chartKey}
                data={weeklyTraffic}
                x="day"
                y="visitors"
                curve={curve}
                showDots={showDots}
                gradient={useGradient}
                showGrid={true}
                onPointClick={(data) => {
                  setSelectedPoint(data as unknown as Record<string, unknown>);
                }}
                animation={showAnimation}
              />
            </div>

            {/* Interactive feedback */}
            <div className="p-3 bg-muted/50 rounded-lg border text-sm">
              <div className="font-medium">
                Selected:{" "}
                {selectedPoint
                  ? `${selectedPoint.day} - ${Number(selectedPoint.visitors).toLocaleString()} visitors`
                  : "Click a point to select"}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <AnimatedCheckbox
                    checked={showAnimation}
                    onChange={setShowAnimation}
                    label="Animations"
                    id="basic-animations"
                  />

                  <AnimatedCheckbox
                    checked={showDots}
                    onChange={setShowDots}
                    label="Dots"
                    id="basic-dots"
                  />

                  <AnimatedCheckbox
                    checked={useGradient}
                    onChange={setUseGradient}
                    label="Gradient"
                    id="basic-gradient"
                  />

                  <div className="flex items-center space-x-2 text-sm">
                    <span>Curve:</span>
                    <StyledSelect
                      value={curve}
                      onValueChange={(value) =>
                        setCurve(value as "linear" | "monotone" | "natural" | "step")
                      }
                      options={[
                        { value: "monotone", label: "Monotone" },
                        { value: "linear", label: "Linear" },
                        { value: "natural", label: "Natural" },
                        { value: "step", label: "Step" },
                      ]}
                    />
                  </div>
                </div>

                <button
                  onClick={replayAnimation}
                  disabled={!showAnimation}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Replay Animation
                </button>
              </div>
            </div>
          </div>
        }
        code={`import { AreaChart } from '@/components/charts/area-chart';

const weeklyTraffic = [
  { day: "Mon", visitors: 3200 },
  { day: "Tue", visitors: 4100 },
  { day: "Wed", visitors: 3800 },
  { day: "Thu", visitors: 5200 },
  { day: "Fri", visitors: 4800 },
  { day: "Sat", visitors: 6100 },
  { day: "Sun", visitors: 5500 },
];

export function TrafficChart() {
  const [selected, setSelected] = useState(null);

  return (
    <AreaChart
      data={weeklyTraffic}
      x="day"
      y="visitors"
      showGrid={true}
      showDots={true}
      onPointClick={(data, index) => {
        setSelected(data);
        console.log('Clicked:', data, index);
      }}
      animation={true}
    />
  );
}`}
      />

      {/* Installation */}
      <InstallationGuide
        title="Installation"
        description="Get started with the AreaChart component in just a few steps."
        cliCommand="npx mario-charts@latest add area-chart"
        steps={installationSteps}
        copyPasteCode={`// Complete AreaChart component code available after CLI installation`}
      />

      {/* Advanced Examples */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Examples</h2>
          <p className="text-muted-foreground">
            Explore different configurations and use cases for the AreaChart component.
          </p>
        </div>

        {/* Multiple Series */}
        <ExampleShowcase
          title="Multiple Series"
          description="Revenue, costs, and profit visualized as overlapping areas with an interactive legend"
          preview={
            <div className="h-80">
              <AreaChart
                key={`multi-${chartKey}`}
                data={monthlyMetrics}
                x="month"
                y={["revenue", "costs", "profit"]}
                showLegend
                showGrid
                animation={showAnimation}
              />
            </div>
          }
          code={`import { AreaChart } from '@/components/charts/area-chart';

const monthlyMetrics = [
  { month: "Jan", revenue: 4500, costs: 2800, profit: 1700 },
  { month: "Feb", revenue: 5200, costs: 3100, profit: 2100 },
  { month: "Mar", revenue: 4800, costs: 2900, profit: 1900 },
  { month: "Apr", revenue: 6100, costs: 3400, profit: 2700 },
  { month: "May", revenue: 5900, costs: 3200, profit: 2700 },
  { month: "Jun", revenue: 7200, costs: 3800, profit: 3400 },
];

export function RevenueBreakdown() {
  return (
    <AreaChart
      data={monthlyMetrics}
      x="month"
      y={["revenue", "costs", "profit"]}
      showLegend
      showGrid
    />
  );
}`}
        />

        {/* Stacked Areas */}
        <ExampleShowcase
          title="Stacked Areas"
          description="Areas stacked on top of each other for cumulative visualization of revenue and costs"
          preview={
            <div className="h-80">
              <AreaChart
                key={`stacked-${chartKey}`}
                data={monthlyMetrics}
                x="month"
                y={["revenue", "costs"]}
                stacked
                showLegend
                showGrid
                animation={showAnimation}
              />
            </div>
          }
          code={`import { AreaChart } from '@/components/charts/area-chart';

export function StackedRevenueChart() {
  return (
    <AreaChart
      data={monthlyMetrics}
      x="month"
      y={["revenue", "costs"]}
      stacked
      showLegend
      showGrid
    />
  );
}`}
        />

        {/* Curve Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(["linear", "monotone", "natural", "step"] as const).map((curveType) => (
            <div key={curveType} className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1 capitalize">{curveType} Curve</h3>
                <p className="text-sm text-muted-foreground">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">curve=&quot;{curveType}&quot;</code>
                </p>
              </div>
              <div className="h-48">
                <AreaChart
                  data={temperatureData}
                  x="hour"
                  y="temperature"
                  curve={curveType}
                  animation={false}
                  showGrid
                />
              </div>
            </div>
          ))}
        </div>

        {/* Solid Fill vs Gradient */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Gradient Fill</h3>
              <p className="text-sm text-muted-foreground">
                Default gradient from solid to transparent
              </p>
            </div>
            <div className="h-48">
              <AreaChart
                key={`gradient-${chartKey}`}
                data={weeklyTraffic}
                x="day"
                y="visitors"
                gradient={true}
                animation={showAnimation}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Solid Fill</h3>
              <p className="text-sm text-muted-foreground">
                Flat color fill with adjustable opacity
              </p>
            </div>
            <div className="h-48">
              <AreaChart
                key={`solid-${chartKey}`}
                data={weeklyTraffic}
                x="day"
                y="visitors"
                gradient={false}
                areaOpacity={0.4}
                animation={showAnimation}
              />
            </div>
          </div>
        </div>

        {/* States Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Loading State</h3>
            <div className="h-64">
              <AreaChart
                key={`loading-${chartKey}`}
                data={weeklyTraffic}
                x="day"
                y="visitors"
                loading={true}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Error State</h3>
            <div className="h-64">
              <AreaChart
                key={`error-${chartKey}`}
                data={weeklyTraffic}
                x="day"
                y="visitors"
                error="Network connection failed"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Empty State</h3>
            <div className="h-64">
              <AreaChart
                key={`empty-${chartKey}`}
                data={[]}
                x="day"
                y="visitors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* API Reference */}
      <APIReference
        title="API Reference"
        description="Complete TypeScript interface with all available props and configurations."
        props={areaChartProps}
      />
    </div>
  );
}
