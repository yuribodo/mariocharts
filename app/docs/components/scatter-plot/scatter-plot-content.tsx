"use client";

import { useState } from "react";
import { Breadcrumbs } from "../../../../components/site/breadcrumbs";
import { ScatterPlot } from "@/src/components/charts/scatter-plot";
import { ExampleShowcase } from "../../../../components/ui/example-showcase";
import { APIReference } from "../../../../components/ui/api-reference";
import { InstallationGuide } from "../../../../components/ui/installation-guide";
import { ChartScatter } from "@phosphor-icons/react";
import { AnimatedCheckbox } from "../../../../components/ui/animated-checkbox";

// Sample data sets for different examples
const salaryData = [
  { experience: 1, salary: 45000 },
  { experience: 2, salary: 48000 },
  { experience: 3, salary: 55000 },
  { experience: 4, salary: 58000 },
  { experience: 5, salary: 70000 },
  { experience: 6, salary: 72000 },
  { experience: 7, salary: 85000 },
  { experience: 8, salary: 88000 },
  { experience: 10, salary: 100000 },
  { experience: 12, salary: 115000 },
] as const;

const departmentData = [
  { experience: 2, salary: 52000, department: "Engineering" },
  { experience: 4, salary: 68000, department: "Engineering" },
  { experience: 6, salary: 85000, department: "Engineering" },
  { experience: 8, salary: 105000, department: "Engineering" },
  { experience: 10, salary: 125000, department: "Engineering" },
  { experience: 1, salary: 42000, department: "Marketing" },
  { experience: 3, salary: 52000, department: "Marketing" },
  { experience: 5, salary: 65000, department: "Marketing" },
  { experience: 7, salary: 78000, department: "Marketing" },
  { experience: 2, salary: 48000, department: "Sales" },
  { experience: 4, salary: 62000, department: "Sales" },
  { experience: 6, salary: 80000, department: "Sales" },
  { experience: 9, salary: 95000, department: "Sales" },
] as const;

// Bubble chart data - world countries
const countryData = [
  { gdp: 63000, lifeExpectancy: 78.9, population: 331000000, country: "USA" },
  { gdp: 46000, lifeExpectancy: 82.7, population: 67000000, country: "France" },
  { gdp: 40000, lifeExpectancy: 84.6, population: 125800000, country: "Japan" },
  { gdp: 12000, lifeExpectancy: 77.3, population: 1400000000, country: "China" },
  { gdp: 2100, lifeExpectancy: 69.7, population: 1380000000, country: "India" },
  { gdp: 8700, lifeExpectancy: 75.9, population: 212000000, country: "Brazil" },
  { gdp: 51000, lifeExpectancy: 81.3, population: 83000000, country: "Germany" },
  { gdp: 42000, lifeExpectancy: 81.2, population: 67000000, country: "UK" },
] as const;

// Data for trend line example
const studyData = [
  { hoursStudied: 1, testScore: 52 },
  { hoursStudied: 2, testScore: 58 },
  { hoursStudied: 2.5, testScore: 62 },
  { hoursStudied: 3, testScore: 65 },
  { hoursStudied: 4, testScore: 71 },
  { hoursStudied: 4.5, testScore: 68 },
  { hoursStudied: 5, testScore: 75 },
  { hoursStudied: 6, testScore: 80 },
  { hoursStudied: 7, testScore: 82 },
  { hoursStudied: 8, testScore: 88 },
  { hoursStudied: 9, testScore: 90 },
  { hoursStudied: 10, testScore: 95 },
] as const;

// API Reference data
const scatterPlotProps = [
  {
    name: "data",
    type: "readonly T[]",
    description: "Array of data objects to display as scatter points",
    required: true
  },
  {
    name: "x",
    type: "keyof T",
    description: "Key from data object to use for x-axis values (numeric)",
    required: true
  },
  {
    name: "y",
    type: "keyof T",
    description: "Key from data object to use for y-axis values (numeric)",
    required: true
  },
  {
    name: "series",
    type: "keyof T",
    description: "Key to group data into colored series (categorical)"
  },
  {
    name: "size",
    type: "keyof T | number",
    default: "6",
    description: "Bubble size: data key for dynamic sizing or fixed number for uniform size"
  },
  {
    name: "sizeRange",
    type: "[number, number]",
    default: "[4, 40]",
    description: "Min and max radius for bubble sizing when using data-driven size"
  },
  {
    name: "colors",
    type: "readonly string[]",
    default: "DEFAULT_COLORS",
    description: "Array of colors to use for series (cycles through for multiple series)"
  },
  {
    name: "showTrendLine",
    type: "boolean",
    default: "false",
    description: "Display a linear regression trend line for each series"
  },
  {
    name: "trendLineColor",
    type: "string",
    description: "Custom color for trend line (defaults to series color)"
  },
  {
    name: "showLegend",
    type: "boolean",
    default: "false",
    description: "Show legend for multi-series charts"
  },
  {
    name: "showGrid",
    type: "boolean",
    default: "false",
    description: "Show background grid lines"
  },
  {
    name: "gridStyle",
    type: "'solid' | 'dashed' | 'dotted'",
    default: "'dashed'",
    description: "Style of grid lines"
  },
  {
    name: "xDomain",
    type: "[number, number]",
    description: "Custom domain for x-axis [min, max]"
  },
  {
    name: "yDomain",
    type: "[number, number]",
    description: "Custom domain for y-axis [min, max]"
  },
  {
    name: "height",
    type: "number",
    default: "300",
    description: "Height of the chart in pixels"
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: "Show loading state with animated skeleton"
  },
  {
    name: "error",
    type: "string | null",
    default: "null",
    description: "Error message to display"
  },
  {
    name: "animation",
    type: "boolean",
    default: "true",
    description: "Enable point entrance animations"
  },
  {
    name: "onPointClick",
    type: "(data: T, index: number, series?: string) => void",
    description: "Callback fired when a point is clicked"
  },
  {
    name: "className",
    type: "string",
    description: "Additional CSS classes to apply to the container"
  }
];

// Installation steps
const installationSteps = [
  {
    title: "Initialize Mario Charts (first time only)",
    description: "Set up Mario Charts in your React project. This configures paths and dependencies.",
    code: `# Initialize the project (run once)
npx mario-charts@latest init

# Or initialize with components
npx mario-charts@latest init --components scatter-plot`,
    language: "bash"
  },
  {
    title: "Add the ScatterPlot component",
    description: "Install the ScatterPlot component using the CLI. This automatically handles dependencies.",
    code: `# Add ScatterPlot component
npx mario-charts@latest add scatter-plot

# Add multiple chart components at once
npx mario-charts@latest add scatter-plot line-chart bar-chart`,
    language: "bash"
  },
  {
    title: "Start using the component",
    description: "Import and use the ScatterPlot in your React components.",
    code: `import { ScatterPlot } from "@/components/charts/scatter-plot";

// Basic scatter plot
<ScatterPlot
  data={data}
  x="experience"
  y="salary"
/>

// Bubble chart with size
<ScatterPlot
  data={countries}
  x="gdp"
  y="lifeExpectancy"
  size="population"
  sizeRange={[8, 50]}
/>`,
    language: "tsx"
  }
];

export function ScatterPlotContent() {
  const [selectedPoint, setSelectedPoint] = useState<Record<string, unknown> | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);
  const [showTrendLine, setShowTrendLine] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  const replayAnimation = () => {
    setChartKey(prev => prev + 1);
  };

  return (
    <div className="max-w-none space-y-12">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Hero Section */}
      <div className="flex flex-col space-y-4 pb-8 pt-6">
        <div className="flex items-center space-x-3">
          <ChartScatter size={24} weight="duotone" className="text-primary" />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Scatter Plot
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-7 max-w-3xl">
          A versatile scatter plot and bubble chart component for visualizing relationships between variables.
          Supports multi-series, trend lines, and dynamic bubble sizing.
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Scatter & Bubble
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Multi-Series Support
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Trend Lines
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Dynamic Sizing
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Interactive Tooltips
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Custom Domains
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Responsive
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            TypeScript
          </div>
        </div>
      </div>

      {/* Quick Start Example */}
      <ExampleShowcase
        title="Basic Scatter Plot"
        description="A simple scatter plot showing the relationship between years of experience and salary"
        preview={
          <div className="space-y-4">
            <div className="h-80">
              <ScatterPlot
                key={chartKey}
                data={salaryData}
                x="experience"
                y="salary"
                showGrid={showGrid}
                showTrendLine={showTrendLine}
                onPointClick={(data) => {
                  setSelectedPoint(data);
                }}
                animation={showAnimation}
              />
            </div>

            {/* Interactive feedback */}
            <div className="p-3 bg-muted/50 rounded-lg border text-sm">
              <div className="font-medium">
                Selected: {selectedPoint
                  ? `${selectedPoint.experience} years - $${(selectedPoint.salary as number).toLocaleString()}`
                  : 'Click a point to select'}
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
                    checked={showTrendLine}
                    onChange={setShowTrendLine}
                    label="Trend Line"
                    id="show-trend"
                  />

                  <AnimatedCheckbox
                    checked={showGrid}
                    onChange={setShowGrid}
                    label="Grid"
                    id="show-grid"
                  />
                </div>

                <button
                  onClick={replayAnimation}
                  disabled={!showAnimation}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Replay Animation
                </button>
              </div>
            </div>
          </div>
        }
        code={`import { ScatterPlot } from '@/components/charts/scatter-plot';

const salaryData = [
  { experience: 1, salary: 45000 },
  { experience: 2, salary: 48000 },
  { experience: 3, salary: 55000 },
  { experience: 5, salary: 70000 },
  { experience: 7, salary: 85000 },
  { experience: 10, salary: 100000 },
];

export function SalaryScatterPlot() {
  return (
    <ScatterPlot
      data={salaryData}
      x="experience"
      y="salary"
      showTrendLine={true}
      showGrid={true}
      onPointClick={(data, index) => {
        console.log('Clicked:', data, index);
      }}
    />
  );
}`}
      />

      {/* Installation */}
      <InstallationGuide
        title="Installation"
        description="Get started with the ScatterPlot component in just a few steps."
        cliCommand="npx mario-charts@latest add scatter-plot"
        steps={installationSteps}
        copyPasteCode={`// Complete ScatterPlot component code available after CLI installation`}
      />

      {/* Advanced Examples */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Examples</h2>
          <p className="text-muted-foreground">
            Explore different configurations and use cases for the ScatterPlot component.
          </p>
        </div>

        {/* Multiple Series */}
        <ExampleShowcase
          title="Multiple Series by Department"
          description="Group data points by category with automatic coloring and legend"
          preview={
            <div className="space-y-4">
              <div className="h-80">
                <ScatterPlot
                  key={`multi-${chartKey}`}
                  data={departmentData}
                  x="experience"
                  y="salary"
                  series="department"
                  showLegend={showLegend}
                  showGrid={true}
                  animation={showAnimation}
                />
              </div>
              <div className="flex items-center space-x-6 pt-2 border-t">
                <AnimatedCheckbox
                  checked={showLegend}
                  onChange={setShowLegend}
                  label="Show Legend"
                  id="multi-legend"
                />
              </div>
            </div>
          }
          code={`import { ScatterPlot } from '@/components/charts/scatter-plot';

const departmentData = [
  { experience: 2, salary: 52000, department: "Engineering" },
  { experience: 4, salary: 68000, department: "Engineering" },
  { experience: 6, salary: 85000, department: "Engineering" },
  { experience: 1, salary: 42000, department: "Marketing" },
  { experience: 3, salary: 52000, department: "Marketing" },
  { experience: 5, salary: 65000, department: "Marketing" },
  { experience: 2, salary: 48000, department: "Sales" },
  { experience: 4, salary: 62000, department: "Sales" },
];

export function DepartmentScatter() {
  return (
    <ScatterPlot
      data={departmentData}
      x="experience"
      y="salary"
      series="department"
      showLegend={true}
      showGrid={true}
    />
  );
}`}
        />

        {/* Bubble Chart */}
        <ExampleShowcase
          title="Bubble Chart - World Countries"
          description="Visualize three dimensions: GDP per capita (X), life expectancy (Y), and population (size)"
          preview={
            <div className="h-96">
              <ScatterPlot
                key={`bubble-${chartKey}`}
                data={countryData}
                x="gdp"
                y="lifeExpectancy"
                size="population"
                sizeRange={[10, 60]}
                showGrid={true}
                animation={showAnimation}
              />
            </div>
          }
          code={`import { ScatterPlot } from '@/components/charts/scatter-plot';

const countryData = [
  { gdp: 63000, lifeExpectancy: 78.9, population: 331000000, country: "USA" },
  { gdp: 46000, lifeExpectancy: 82.7, population: 67000000, country: "France" },
  { gdp: 40000, lifeExpectancy: 84.6, population: 125800000, country: "Japan" },
  { gdp: 12000, lifeExpectancy: 77.3, population: 1400000000, country: "China" },
  { gdp: 2100, lifeExpectancy: 69.7, population: 1380000000, country: "India" },
];

export function WorldBubbleChart() {
  return (
    <ScatterPlot
      data={countryData}
      x="gdp"
      y="lifeExpectancy"
      size="population"
      sizeRange={[10, 60]}
      showGrid={true}
    />
  );
}`}
        />

        {/* Trend Line */}
        <ExampleShowcase
          title="With Trend Line"
          description="Linear regression trend line showing correlation between study hours and test scores"
          preview={
            <div className="h-80">
              <ScatterPlot
                key={`trend-${chartKey}`}
                data={studyData}
                x="hoursStudied"
                y="testScore"
                showTrendLine={true}
                showGrid={true}
                animation={showAnimation}
              />
            </div>
          }
          code={`import { ScatterPlot } from '@/components/charts/scatter-plot';

const studyData = [
  { hoursStudied: 1, testScore: 52 },
  { hoursStudied: 2, testScore: 58 },
  { hoursStudied: 3, testScore: 65 },
  { hoursStudied: 5, testScore: 75 },
  { hoursStudied: 7, testScore: 82 },
  { hoursStudied: 10, testScore: 95 },
];

export function StudyCorrelation() {
  return (
    <ScatterPlot
      data={studyData}
      x="hoursStudied"
      y="testScore"
      showTrendLine={true}
      showGrid={true}
    />
  );
}`}
        />
      </div>

      {/* Chart States */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Chart States</h2>
          <p className="text-muted-foreground">
            Built-in states for loading, error, and empty data scenarios.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loading State */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Loading State</h3>
            <div className="h-64">
              <ScatterPlot
                data={[]}
                x="x"
                y="y"
                loading={true}
              />
            </div>
          </div>

          {/* Error State */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Error State</h3>
            <div className="h-64">
              <ScatterPlot
                data={[]}
                x="x"
                y="y"
                error="Failed to load chart data. Please try again."
              />
            </div>
          </div>

          {/* Empty State */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Empty State</h3>
            <div className="h-64">
              <ScatterPlot
                data={[]}
                x="x"
                y="y"
              />
            </div>
          </div>
        </div>
      </div>

      {/* API Reference */}
      <APIReference
        title="API Reference"
        description="Complete list of props available for the ScatterPlot component."
        props={scatterPlotProps}
      />
    </div>
  );
}
