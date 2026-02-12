"use client";

import { useState } from "react";
import { Breadcrumbs } from "../../../../components/site/breadcrumbs";
import { LineChart } from "@/src/components/charts/line-chart";
import { ExampleShowcase } from "../../../../components/ui/example-showcase";
import { APIReference } from "../../../../components/ui/api-reference";
import { InstallationGuide } from "../../../../components/ui/installation-guide";
import { Graph } from "@phosphor-icons/react";
import { StyledSelect } from "../../../../components/ui/styled-select";
import { AnimatedCheckbox } from "../../../../components/ui/animated-checkbox";

// Sample data sets for different examples
const monthlyMetrics = [
  { month: "Jan", revenue: 4500, users: 1200, conversion: 2.3 },
  { month: "Feb", revenue: 5200, users: 1400, conversion: 2.8 },
  { month: "Mar", revenue: 4800, users: 1100, conversion: 2.1 },
  { month: "Apr", revenue: 6100, users: 1800, conversion: 3.2 },
  { month: "May", revenue: 5900, users: 1600, conversion: 2.9 },
  { month: "Jun", revenue: 7200, users: 2200, conversion: 3.8 }
] as const;

const stockData = [
  { date: "2024-01", price: 150, volume: 2500000 },
  { date: "2024-02", price: 165, volume: 2800000 },
  { date: "2024-03", price: 145, volume: 3200000 },
  { date: "2024-04", price: 178, volume: 2100000 },
  { date: "2024-05", price: 192, volume: 2900000 },
  { date: "2024-06", price: 185, volume: 3500000 }
] as const;

const temperatureData = [
  { hour: "00:00", temperature: 22.5, humidity: 65 },
  { hour: "04:00", temperature: 19.8, humidity: 72 },
  { hour: "08:00", temperature: 25.2, humidity: 58 },
  { hour: "12:00", temperature: 31.7, humidity: 45 },
  { hour: "16:00", temperature: 28.4, humidity: 52 },
  { hour: "20:00", temperature: 24.1, humidity: 61 }
] as const;

// Data with gaps to demonstrate null handling
const irregularData = [
  { date: "Week 1", sales: 1200 },
  { date: "Week 2", sales: 1500 },
  { date: "Week 3", sales: null }, // Missing data
  { date: "Week 4", sales: 1800 },
  { date: "Week 5", sales: null }, // Missing data
  { date: "Week 6", sales: 2100 },
  { date: "Week 7", sales: 1950 }
] as const;

// Large time series dataset
const largeTimeSeries = Array.from({ length: 100 }, (_, i) => ({
  day: `Day ${i + 1}`,
  value: 50 + Math.sin(i * 0.1) * 20 + Math.random() * 10,
  trend: 50 + i * 0.5 + Math.sin(i * 0.05) * 15
}));

// API Reference data
const lineChartProps = [
  {
    name: "data",
    type: "readonly T[]",
    description: "Array of data objects to display in the chart",
    required: true
  },
  {
    name: "x",
    type: "keyof T",
    description: "Key from data object to use for x-axis labels",
    required: true
  },
  {
    name: "y",
    type: "keyof T | readonly (keyof T)[]",
    description: "Key(s) from data object to use for y-axis values. Single key for one line, array for multiple lines",
    required: true
  },
  {
    name: "colors",
    type: "readonly string[]",
    default: "DEFAULT_COLORS",
    description: "Array of colors to use for lines (cycles through for multiple series)"
  },
  {
    name: "strokeWidth",
    type: "number",
    default: "2",
    description: "Width of the line stroke in pixels"
  },
  {
    name: "curve",
    type: "'linear' | 'monotone' | 'natural' | 'step'",
    default: "'monotone'",
    description: "Type of curve interpolation for the line"
  },
  {
    name: "showDots",
    type: "boolean",
    default: "true",
    description: "Show triangular markers at each data point with hover animations"
  },
  {
    name: "showArea",
    type: "boolean",
    default: "false",
    description: "Fill area under the line with gradient and dot pattern texture"
  },
  {
    name: "connectNulls",
    type: "boolean",
    default: "true",
    description: "Whether to connect points across null/missing values"
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
    description: "Enable line drawing and point entrance animations"
  },
  {
    name: "onPointClick",
    type: "(data: T, index: number, series?: string) => void",
    description: "Callback fired when a point is clicked"
  },
  {
    name: "showGrid",
    type: "boolean",
    default: "false",
    description: "Show horizontal grid lines and Y-axis tick labels"
  },
  {
    name: "gridStyle",
    type: "'solid' | 'dashed' | 'dotted'",
    default: "'dashed'",
    description: "Style of the grid lines when showGrid is enabled"
  },
  {
    name: "showLegend",
    type: "boolean",
    default: "false",
    description: "Show legend below the chart for multi-series data"
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
npx mario-charts@latest init --components line-chart`,
    language: "bash"
  },
  {
    title: "Add the LineChart component",
    description: "Install the LineChart component using the CLI. This automatically handles dependencies.",
    code: `# Add LineChart component
npx mario-charts@latest add line-chart

# Add multiple chart components at once
npx mario-charts@latest add line-chart bar-chart kpi-card`,
    language: "bash"
  },
  {
    title: "Start using the component",
    description: "Import and use the LineChart in your React components.",
    code: `import { LineChart } from "@/components/charts/line-chart";

// Single line chart
<LineChart
  data={data}
  x="month"
  y="revenue"
/>

// Multiple line chart
<LineChart
  data={data}
  x="month"
  y={["revenue", "users"]}
  curve="monotone"
  showArea={true}
/>`,
    language: "tsx"
  }
];

export function LineChartContent() {
  const [selectedPoint, setSelectedPoint] = useState<Record<string, unknown> | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);
  const [curve, setCurve] = useState<'linear' | 'monotone' | 'natural' | 'step'>('monotone');
  const [showDots, setShowDots] = useState(true);
  const [showArea, setShowArea] = useState(false);
  const [connectNulls, setConnectNulls] = useState(true);

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
          <Graph size={24} weight="duotone" className="text-primary" />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Line Chart
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-7 max-w-3xl">
          A sophisticated line chart component for time series and continuous data visualization.
          Supports multiple series, gap handling, curve interpolation, and advanced interactions.
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Triangular Markers
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Multiple Series Support
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Gap Handling
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Curve Interpolation
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Textured Area Fill
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
            Interactive Legend
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Keyboard Accessible
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Hover Glow
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Performance Optimized
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            TypeScript
          </div>
        </div>
      </div>

      {/* Quick Start Example */}
      <ExampleShowcase
        title="Basic Line Chart"
        description="A simple line chart showing monthly revenue with interactive points and customizable curve styles"
        preview={
          <div className="space-y-4">
            <div className="h-80">
              <LineChart
                key={chartKey}
                data={monthlyMetrics}
                x="month"
                y="revenue"
                curve={curve}
                showDots={showDots}
                showArea={showArea}
                showGrid={true}
                onPointClick={(data, index) => {
                  setSelectedPoint(data);
                  console.log('Clicked:', data, index);
                }}
                animation={showAnimation}
              />
            </div>

            {/* Interactive feedback */}
            <div className="p-3 bg-muted/50 rounded-lg border text-sm">
              <div className="font-medium">
                Selected: {selectedPoint ? `${selectedPoint.month} - $${(selectedPoint.revenue as number).toLocaleString()}` : 'Click a point to select'}
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
                    label="Show Triangles"
                    id="show-triangles"
                  />

                  <AnimatedCheckbox
                    checked={showArea}
                    onChange={setShowArea}
                    label="Show Area"
                    id="show-area"
                  />

                  <div className="flex items-center space-x-2 text-sm">
                    <span>Curve:</span>
                    <StyledSelect
                      value={curve}
                      onValueChange={(value) => setCurve(value as 'linear' | 'monotone' | 'natural' | 'step')}
                      options={[
                        { value: 'linear', label: 'Linear' },
                        { value: 'monotone', label: 'Monotone' },
                        { value: 'natural', label: 'Natural' },
                        { value: 'step', label: 'Step' }
                      ]}
                    />
                  </div>
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
        code={`import { LineChart } from '@/components/charts/line-chart';

const monthlyRevenue = [
  { month: "Jan", revenue: 4500 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 5900 },
  { month: "Jun", revenue: 7200 }
];

export function RevenueLineChart() {
  const [selectedPoint, setSelectedPoint] = useState(null);

  return (
    <LineChart
      data={monthlyRevenue}
      x="month"
      y="revenue"
      curve="monotone"
      showDots={true}
      showGrid={true}
      onPointClick={(data, index) => {
        setSelectedPoint(data);
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
        description="Get started with the LineChart component in just a few steps."
        cliCommand="npx mario-charts@latest add line-chart"
        steps={installationSteps}
        copyPasteCode={`// Complete LineChart component code available after CLI installation`}
      />

      {/* Advanced Examples */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Examples</h2>
          <p className="text-muted-foreground">
            Explore different configurations and use cases for the LineChart component.
          </p>
        </div>

        {/* Multiple Series */}
        <ExampleShowcase
          title="Multiple Series - Revenue & Users"
          description="Multiple lines on the same chart with different colors and multi-point tooltips"
          preview={
            <div className="space-y-4">
              <div className="h-80">
                <LineChart
                  key={`multi-${chartKey}`}
                  data={monthlyMetrics}
                  x="month"
                  y={["revenue", "users"]}
                  colors={['#3b82f6', '#10b981']}
                  curve="monotone"
                  showDots={true}
                  showGrid={true}
                  showLegend={true}
                  animation={showAnimation}
                />
              </div>
            </div>
          }
          code={`import { LineChart } from '@/components/charts/line-chart';

const monthlyMetrics = [
  { month: "Jan", revenue: 4500, users: 1200 },
  { month: "Feb", revenue: 5200, users: 1400 },
  { month: "Mar", revenue: 4800, users: 1100 },
  { month: "Apr", revenue: 6100, users: 1800 },
  { month: "May", revenue: 5900, users: 1600 },
  { month: "Jun", revenue: 7200, users: 2200 }
];

export function MultiSeriesChart() {
  return (
    <LineChart
      data={monthlyMetrics}
      x="month"
      y={["revenue", "users"]}
      colors={['#3b82f6', '#10b981']}
      curve="monotone"
      showDots={true}
      showGrid={true}
      showLegend={true}
    />
  );
}`}
        />

        {/* Gap Handling */}
        <ExampleShowcase
          title="Missing Data Handling"
          description="Demonstrates how the chart handles null values and missing data points"
          preview={
            <div className="space-y-4">
              <div className="h-80">
                <LineChart
                  key={`gaps-${chartKey}`}
                  data={irregularData}
                  x="date"
                  y="sales"
                  colors={['#ef4444']}
                  curve="monotone"
                  showDots={true} // Triangular markers
                  connectNulls={connectNulls}
                  animation={showAnimation}
                />
              </div>

              <div className="flex items-center space-x-4 pt-2 border-t">
                <AnimatedCheckbox
                  checked={connectNulls}
                  onChange={setConnectNulls}
                  label="Connect Nulls"
                  id="connect-nulls"
                />
                <span className="text-sm text-muted-foreground">
                  Toggle to see how missing data is handled
                </span>
              </div>
            </div>
          }
          code={`import { LineChart } from '@/components/charts/line-chart';

const irregularData = [
  { date: "Week 1", sales: 1200 },
  { date: "Week 2", sales: 1500 },
  { date: "Week 3", sales: null }, // Missing data
  { date: "Week 4", sales: 1800 },
  { date: "Week 5", sales: null }, // Missing data
  { date: "Week 6", sales: 2100 },
  { date: "Week 7", sales: 1950 }
];

export function GapHandlingChart() {
  return (
    <LineChart
      data={irregularData}
      x="date"
      y="sales"
      connectNulls={false} // Breaks line at null values
      showDots={true} // Triangular markers
    />
  );
}`}
        />

        {/* Area Chart */}
        <ExampleShowcase
          title="Textured Area Chart"
          description="Line chart with innovative dot-pattern textured area fill combining gradient and micro-dots"
          preview={
            <div className="h-80">
              <LineChart
                key={`area-${chartKey}`}
                data={stockData}
                x="date"
                y="price"
                colors={['#8b5cf6']}
                curve="monotone"
                showDots={false}
                showArea={true}
                strokeWidth={3}
                animation={showAnimation}
              />
            </div>
          }
          code={`import { LineChart } from '@/components/charts/line-chart';

const stockData = [
  { date: "2024-01", price: 150 },
  { date: "2024-02", price: 165 },
  { date: "2024-03", price: 145 },
  { date: "2024-04", price: 178 },
  { date: "2024-05", price: 192 },
  { date: "2024-06", price: 185 }
];

export function StockAreaChart() {
  return (
    <LineChart
      data={stockData}
      x="date"
      y="price"
      colors={['#8b5cf6']}
      showArea={true}
      showDots={false}
      strokeWidth={3}
    />
  );
}`}
        />

        {/* Large Dataset Performance */}
        <ExampleShowcase
          title="Large Dataset Performance"
          description="100 data points with smooth performance and optimized rendering"
          preview={
            <div className="space-y-4">
              <div className="h-80">
                <LineChart
                  key={`large-${chartKey}`}
                  data={largeTimeSeries}
                  x="day"
                  y={["value", "trend"]}
                  colors={['#3b82f6', '#10b981']}
                  curve="monotone"
                  showDots={false}
                  showGrid={true}
                  showLegend={true}
                  strokeWidth={2}
                  animation={showAnimation}
                  className="text-xs"
                />
              </div>

              <div className="p-3 bg-muted/50 rounded-lg border text-sm">
                <div className="font-medium mb-1">Performance Notes:</div>
                <ul className="text-muted-foreground space-y-1">
                  <li>• 100 data points rendered smoothly</li>
                  <li>• Dots disabled for better performance with large datasets</li>
                  <li>• Optimized SVG path generation</li>
                </ul>
              </div>
            </div>
          }
          code={`import { LineChart } from '@/components/charts/line-chart';

const largeTimeSeries = Array.from({ length: 100 }, (_, i) => ({
  day: \`Day \${i + 1}\`,
  value: 50 + Math.sin(i * 0.1) * 20 + Math.random() * 10,
  trend: 50 + i * 0.5 + Math.sin(i * 0.05) * 15
}));

export function LargeDatasetChart() {
  return (
    <LineChart
      data={largeTimeSeries}
      x="day"
      y={["value", "trend"]}
      showDots={false} // Better performance for large datasets
      curve="monotone"
    />
  );
}`}
        />

        {/* States Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Loading State</h3>
            <div className="h-64">
              <LineChart
                key={`loading-${chartKey}`}
                data={monthlyMetrics}
                x="month"
                y="revenue"
                loading={true}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Error State</h3>
            <div className="h-64">
              <LineChart
                key={`error-${chartKey}`}
                data={monthlyMetrics}
                x="month"
                y="revenue"
                error="Failed to load time series data"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Empty State</h3>
            <div className="h-64">
              <LineChart
                key={`empty-${chartKey}`}
                data={[]}
                x="month"
                y="revenue"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Curve Types Comparison */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Curve Types</h2>
          <p className="text-muted-foreground">
            Different curve interpolation methods for various data visualization needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Linear Interpolation</h3>
              <p className="text-sm text-muted-foreground">
                Straight lines between points - best for discrete data
              </p>
            </div>

            <div className="h-64 mb-4">
              <LineChart
                key={`linear-demo-${chartKey}`}
                data={temperatureData}
                x="hour"
                y="temperature"
                curve="linear"
                colors={['#ef4444']}
                showDots={true} // Triangular markers
                animation={showAnimation}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Monotone Curves</h3>
              <p className="text-sm text-muted-foreground">
                Smooth curves that preserve monotonicity - best for most time series
              </p>
            </div>

            <div className="h-64 mb-4">
              <LineChart
                key={`monotone-demo-${chartKey}`}
                data={temperatureData}
                x="hour"
                y="temperature"
                curve="monotone"
                colors={['#10b981']}
                showDots={true} // Triangular markers
                animation={showAnimation}
              />
            </div>
          </div>
        </div>
      </div>

      {/* API Reference */}
      <APIReference
        title="API Reference"
        description="Complete TypeScript interface with all available props and configurations for LineChart."
        props={lineChartProps}
      />
    </div>
  );
}
