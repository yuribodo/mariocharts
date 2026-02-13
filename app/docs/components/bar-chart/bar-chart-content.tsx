"use client";

import { useState } from "react";
import { Breadcrumbs } from "../../../../components/site/breadcrumbs";
import { BarChart } from "@/src/components/charts/bar-chart";
import { ExampleShowcase } from "../../../../components/ui/example-showcase";
import { APIReference } from "../../../../components/ui/api-reference";
import { InstallationGuide } from "../../../../components/ui/installation-guide";
import { Graph } from "@phosphor-icons/react";
import { StyledSelect } from "../../../../components/ui/styled-select";
import { AnimatedCheckbox } from "../../../../components/ui/animated-checkbox";

// Sample data sets for different examples
const monthlyRevenue = [
  { month: "Jan", revenue: 4500, profit: 1200 },
  { month: "Feb", revenue: 5200, profit: 1400 },
  { month: "Mar", revenue: 4800, profit: 1100 },
  { month: "Apr", revenue: 6100, profit: 1800 },
  { month: "May", revenue: 5900, profit: 1600 },
  { month: "Jun", revenue: 7200, profit: 2200 }
] as const;

const productSales = [
  { product: "MacBook", sales: 120000, category: "Laptops" },
  { product: "iPhone", sales: 89000, category: "Phones" },
  { product: "iPad", sales: 67000, category: "Tablets" },
  { product: "AirPods", sales: 45000, category: "Audio" },
  { product: "Watch", sales: 32000, category: "Wearables" }
] as const;

const largeDataset = Array.from({ length: 50 }, (_, i) => ({
  day: `Day ${i + 1}`,
  value: 100 + (i * 18) + (i % 7 * 25) + (i % 13 * 15),
  category: i % 3 === 0 ? 'High' : i % 2 === 0 ? 'Medium' : 'Low'
}));

// API Reference data
const barChartProps = [
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
    type: "keyof T",
    default: "'value'",
    description: "Key from data object to use for y-axis values"
  },
  {
    name: "colors",
    type: "readonly string[]",
    default: "DEFAULT_COLORS",
    description: "Array of colors to use for bars"
  },
  {
    name: "variant",
    type: "'filled' | 'outline'",
    default: "'filled'",
    description: "Visual style of bars - filled with color or outline only"
  },
  {
    name: "orientation",
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: "Direction of bar growth - vertical (bottom-up) or horizontal (left-right)"
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
    description: "Show loading state"
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
    description: "Enable entrance animations"
  },
  {
    name: "onBarClick",
    type: "(data: T, index: number) => void",
    description: "Callback fired when a bar is clicked"
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
npx mario-charts@latest init --components bar-chart`,
    language: "bash"
  },
  {
    title: "Add the BarChart component",
    description: "Install the BarChart component using the CLI. This automatically handles dependencies.",
    code: `# Add BarChart component
npx mario-charts@latest add bar-chart

# Add multiple components at once
npx mario-charts@latest add bar-chart line-chart kpi-card`,
    language: "bash"
  },
  {
    title: "Start using the component",
    description: "Import and use the BarChart in your React components.",
    code: `import { BarChart } from "@/components/charts/bar-chart";

// Use in your component
<BarChart
  data={data}
  x="month"
  y="revenue"
/>`,
    language: "tsx"
  }
];

export function BarChartContent() {
  const [selectedBar, setSelectedBar] = useState<Record<string, unknown> | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);
  const [variant, setVariant] = useState<'filled' | 'outline'>('filled');
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');

  // Controls for Product Sales example
  const [productAnimation, setProductAnimation] = useState(true);
  const [productVariant, setProductVariant] = useState<'filled' | 'outline'>('filled');
  const [productOrientation, setProductOrientation] = useState<'vertical' | 'horizontal'>('vertical');

  // Controls for Large Dataset example
  const [largeAnimation, setLargeAnimation] = useState(true);
  const [largeVariant, setLargeVariant] = useState<'filled' | 'outline'>('filled');
  const [largeOrientation, setLargeOrientation] = useState<'vertical' | 'horizontal'>('vertical');

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
            Bar Chart
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-7 max-w-3xl">
          A production-ready, highly customizable bar chart component with zero configuration required.
          Perfect TypeScript support, advanced animations, and one-command installation.
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            CLI Installation
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Filled & Outline Variants
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Vertical & Horizontal
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Performance Optimized
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Responsive
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            TypeScript
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
            Hover Glow
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
        description="A simple bar chart showing monthly revenue data with click interactions"
        preview={
          <div className="space-y-4">
            <div className="h-80">
              <BarChart
                key={chartKey}
                data={monthlyRevenue}
                x="month"
                y="revenue"
                variant={variant}
                orientation={orientation}
                showGrid={true}
                onBarClick={(data, index) => {
                  setSelectedBar(data);
                }}
                animation={showAnimation}
              />
            </div>

            {/* Interactive feedback */}
            <div className="p-3 bg-muted/50 rounded-lg border text-sm">
              <div className="font-medium">
                Selected: {selectedBar ? `${selectedBar.month} - $${(selectedBar.revenue as number).toLocaleString()}` : 'Click a bar to select'}
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

                  <div className="flex items-center space-x-2 text-sm">
                    <span>Variant:</span>
                    <StyledSelect
                      value={variant}
                      onValueChange={(value) => setVariant(value as 'filled' | 'outline')}
                      options={[
                        { value: 'filled', label: 'Filled' },
                        { value: 'outline', label: 'Outline' }
                      ]}
                    />
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <span>Orientation:</span>
                    <StyledSelect
                      value={orientation}
                      onValueChange={(value) => setOrientation(value as 'vertical' | 'horizontal')}
                      options={[
                        { value: 'vertical', label: 'Vertical' },
                        { value: 'horizontal', label: 'Horizontal' }
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
        code={`import { BarChart } from '@/components/charts/bar-chart';

const monthlyRevenue = [
  { month: "Jan", revenue: 4500 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 5900 },
  { month: "Jun", revenue: 7200 }
];

export function RevenueChart() {
  const [selectedBar, setSelectedBar] = useState(null);

  return (
    <BarChart
      data={monthlyRevenue}
      x="month"
      y="revenue"
      showGrid={true}
      onBarClick={(data, index) => {
        setSelectedBar(data);
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
        description="Get started with the BarChart component in just a few steps."
        cliCommand="npx mario-charts@latest add bar-chart"
        steps={installationSteps}
        copyPasteCode={`// Complete BarChart component code available after CLI installation`}
      />

      {/* Advanced Examples */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Examples</h2>
          <p className="text-muted-foreground">
            Explore different configurations and use cases for the BarChart component.
          </p>
        </div>

        {/* Custom Theme & Formatting */}
        <ExampleShowcase
          title="Product Sales - Custom Theme"
          description="Custom colors, axis labels, and value formatting with advanced tooltips"
          preview={
            <div className="space-y-4">
              <div className="h-80">
                <BarChart
                  key={`advanced-${chartKey}`}
                  data={productSales}
                  x="product"
                  y="sales"
                  colors={['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']}
                  showGrid={true}
                  animation={productAnimation}
                  variant={productVariant}
                  orientation={productOrientation}
                />
              </div>

              {/* Controls for product sales */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <AnimatedCheckbox
                      checked={productAnimation}
                      onChange={setProductAnimation}
                      label="Animations"
                      id="product-animations"
                    />

                    <div className="flex items-center space-x-2 text-sm">
                      <span>Variant:</span>
                      <StyledSelect
                        value={productVariant}
                        onValueChange={(value) => setProductVariant(value as 'filled' | 'outline')}
                        options={[
                          { value: 'filled', label: 'Filled' },
                          { value: 'outline', label: 'Outline' }
                        ]}
                      />
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <span>Orientation:</span>
                      <StyledSelect
                        value={productOrientation}
                        onValueChange={(value) => setProductOrientation(value as 'vertical' | 'horizontal')}
                        options={[
                          { value: 'vertical', label: 'Vertical' },
                          { value: 'horizontal', label: 'Horizontal' }
                        ]}
                      />
                    </div>
                  </div>

                  <button
                    onClick={replayAnimation}
                    disabled={!productAnimation}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          code={`import { BarChart } from '@/components/charts/bar-chart';

const productSales = [
  { product: "MacBook", sales: 120000, category: "Laptops" },
  { product: "iPhone", sales: 89000, category: "Phones" },
  { product: "iPad", sales: 67000, category: "Tablets" },
  { product: "AirPods", sales: 45000, category: "Audio" },
  { product: "Watch", sales: 32000, category: "Wearables" }
];

export function ProductSalesChart() {
  return (
    <BarChart
      data={productSales}
      x="product"
      y="sales"
      colors={['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']}
      showGrid={true}
    />
  );
}`}
        />

        {/* Large Dataset Performance */}
        <ExampleShowcase
          title="Large Dataset Performance"
          description="50 data points with smooth performance and animations"
          preview={
            <div className="space-y-4">
              <div className="h-80">
                <BarChart
                  key={`large-${chartKey}`}
                  data={largeDataset}
                  x="day"
                  y="value"
                  colors={largeDataset.map(item =>
                    item.category === 'High' ? '#ef4444' :
                    item.category === 'Medium' ? '#f59e0b' : '#10b981'
                  )}
                  className="text-xs"
                  animation={largeAnimation}
                  variant={largeVariant}
                  orientation={largeOrientation}
                />
              </div>

              {/* Controls for large dataset */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <AnimatedCheckbox
                      checked={largeAnimation}
                      onChange={setLargeAnimation}
                      label="Animations"
                      id="large-animations"
                    />

                    <div className="flex items-center space-x-2 text-sm">
                      <span>Variant:</span>
                      <StyledSelect
                        value={largeVariant}
                        onValueChange={(value) => setLargeVariant(value as 'filled' | 'outline')}
                        options={[
                          { value: 'filled', label: 'Filled' },
                          { value: 'outline', label: 'Outline' }
                        ]}
                      />
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <span>Orientation:</span>
                      <StyledSelect
                        value={largeOrientation}
                        onValueChange={(value) => setLargeOrientation(value as 'vertical' | 'horizontal')}
                        options={[
                          { value: 'vertical', label: 'Vertical' },
                          { value: 'horizontal', label: 'Horizontal' }
                        ]}
                      />
                    </div>
                  </div>

                  <button
                    onClick={replayAnimation}
                    disabled={!largeAnimation}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          code={`import { BarChart } from '@/components/charts/bar-chart';

const largeDataset = Array.from({ length: 50 }, (_, i) => ({
  day: \`Day \${i + 1}\`,
  value: 100 + (i * 18) + (i % 7 * 25) + (i % 13 * 15),
  category: i % 3 === 0 ? 'High' : i % 2 === 0 ? 'Medium' : 'Low'
}));

export function LargeDatasetChart() {
  return (
    <BarChart
      data={largeDataset}
      x="day"
      y="value"
      colors={largeDataset.map(item =>
        item.category === 'High' ? '#ef4444' :
        item.category === 'Medium' ? '#f59e0b' : '#10b981'
      )}
      className="text-xs"
    />
  );
}`}
        />

        {/* States Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Loading State</h3>
            <div className="h-64">
              <BarChart
                key={`loading-${chartKey}`}
                data={monthlyRevenue}
                x="month"
                y="revenue"
                loading={true}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Error State</h3>
            <div className="h-64">
              <BarChart
                key={`error-${chartKey}`}
                data={monthlyRevenue}
                x="month"
                y="revenue"
                error="Network connection failed"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Empty State</h3>
            <div className="h-64">
              <BarChart
                key={`empty-${chartKey}`}
                data={[]}
                x="month"
                y="revenue"
              />
            </div>
          </div>
        </div>
      </div>

      {/* New Features Examples */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">New Features</h2>
          <p className="text-muted-foreground">
            Explore the latest additions: outline variants and horizontal orientation support.
          </p>
        </div>

        {/* Variant Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Filled Variant</h3>
              <p className="text-sm text-muted-foreground">
                Traditional filled bars with solid colors
              </p>
            </div>

            <div className="h-64 mb-4">
              <BarChart
                key={`filled-demo-${chartKey}`}
                data={monthlyRevenue.slice(0, 4)}
                x="month"
                y="revenue"
                variant="filled"
                colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
                animation={showAnimation}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Outline Variant</h3>
              <p className="text-sm text-muted-foreground">
                Modern outline-only bars for minimalist designs
              </p>
            </div>

            <div className="h-64 mb-4">
              <BarChart
                key={`outline-demo-${chartKey}`}
                data={monthlyRevenue.slice(0, 4)}
                x="month"
                y="revenue"
                variant="outline"
                colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
                animation={showAnimation}
              />
            </div>
          </div>
        </div>

        {/* Orientation Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Vertical Orientation</h3>
              <p className="text-sm text-muted-foreground">
                Standard vertical bars growing from bottom to top
              </p>
            </div>

            <div className="h-80 mb-4">
              <BarChart
                key={`vertical-demo-${chartKey}`}
                data={productSales.slice(0, 4)}
                x="product"
                y="sales"
                orientation="vertical"
                variant="filled"
                colors={['#3b82f6', '#ef4444', '#10b981', '#f59e0b']}
                animation={showAnimation}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Horizontal Orientation</h3>
              <p className="text-sm text-muted-foreground">
                Horizontal bars growing from left to right
              </p>
            </div>

            <div className="h-80 mb-4">
              <BarChart
                key={`horizontal-demo-${chartKey}`}
                data={productSales.slice(0, 4)}
                x="product"
                y="sales"
                orientation="horizontal"
                variant="filled"
                colors={['#3b82f6', '#ef4444', '#10b981', '#f59e0b']}
                animation={showAnimation}
              />
            </div>
          </div>
        </div>

        {/* Advanced Combination */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">Advanced Combination</h3>
            <p className="text-sm text-muted-foreground">
              Horizontal orientation with outline variant - perfect for modern dashboards
            </p>
          </div>

          <div className="h-80 mb-4">
            <BarChart
              key={`combo-demo-${chartKey}`}
              data={productSales}
              x="product"
              y="sales"
              orientation="horizontal"
              variant="outline"
              colors={['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']}
              animation={showAnimation}
            />
          </div>

          {/* Controls for advanced combination */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Horizontal + Outline • Enhanced loading states • Responsive tooltips
            </div>

            <button
              onClick={replayAnimation}
              disabled={!showAnimation}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Replay Animation
            </button>
          </div>
        </div>
      </div>

      {/* API Reference */}
      <APIReference
        title="API Reference"
        description="Complete TypeScript interface with all available props and configurations."
        props={barChartProps}
      />
    </div>
  );
}
