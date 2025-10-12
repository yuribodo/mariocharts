"use client";

import { useState } from "react";
import { Breadcrumbs } from "../../../../components/site/breadcrumbs";
import { StackedBarChart } from "../../../../src/components/charts/stacked-bar-chart";
import { ExampleShowcase } from "../../../../components/ui/example-showcase";
import { APIReference } from "../../../../components/ui/api-reference";
import { InstallationGuide } from "../../../../components/ui/installation-guide";
import { ChartBar } from "@phosphor-icons/react";
import { StyledSelect } from "../../../../components/ui/styled-select";
import { AnimatedCheckbox } from "../../../../components/ui/animated-checkbox";

// Sample data sets for different examples

// 1. Monthly Revenue Breakdown by Product Categories
const monthlyRevenueBreakdown = [
  { month: "Jan", desktop: 4200, mobile: 2400, services: 1800 },
  { month: "Feb", desktop: 5100, mobile: 2800, services: 2200 },
  { month: "Mar", desktop: 4600, mobile: 2100, services: 1900 },
  { month: "Apr", desktop: 6200, mobile: 3400, services: 2500 },
  { month: "May", desktop: 5800, mobile: 3100, services: 2400 },
  { month: "Jun", desktop: 7100, mobile: 3900, services: 3000 }
] as const;

// 2. Quarterly Sales by Region
const quarterlySales = [
  { quarter: "Q1 2024", north: 45000, south: 32000, east: 28000, west: 39000 },
  { quarter: "Q2 2024", north: 52000, south: 38000, east: 31000, west: 44000 },
  { quarter: "Q3 2024", north: 48000, south: 35000, east: 29000, west: 41000 },
  { quarter: "Q4 2024", north: 61000, south: 43000, east: 36000, west: 52000 }
] as const;

// 3. Marketing Channels - Monthly Leads
const marketingChannels = [
  { month: "Jan", email: 1200, social: 850, direct: 620, referral: 340 },
  { month: "Feb", email: 1450, social: 920, direct: 780, referral: 410 },
  { month: "Mar", email: 1380, social: 890, direct: 710, referral: 390 },
  { month: "Apr", email: 1650, social: 1100, direct: 850, referral: 480 },
  { month: "May", email: 1590, social: 1020, direct: 820, referral: 460 },
  { month: "Jun", email: 1820, social: 1250, direct: 950, referral: 540 }
] as const;

// 4. Product Mix by Store
const productMixByStore = [
  { store: "NYC", electronics: 82000, apparel: 54000, home: 38000 },
  { store: "LA", electronics: 75000, apparel: 61000, home: 42000 },
  { store: "Chicago", electronics: 68000, apparel: 48000, home: 35000 },
  { store: "Miami", electronics: 59000, apparel: 52000, home: 31000 },
  { store: "Seattle", electronics: 71000, apparel: 56000, home: 39000 }
] as const;

// 5. Large Dataset - 20+ bars with 4+ categories
const largeDataset = Array.from({ length: 24 }, (_, i) => ({
  period: `Period ${i + 1}`,
  categoryA: 1000 + (i * 50) + Math.random() * 500,
  categoryB: 800 + (i * 40) + Math.random() * 400,
  categoryC: 600 + (i * 30) + Math.random() * 300,
  categoryD: 400 + (i * 20) + Math.random() * 200
}));

// API Reference data
const stackedBarChartProps = [
  {
    name: "data",
    type: "readonly T[]",
    description: "Array of data objects to display in the chart. Each object should contain the x-axis key and all y-axis keys for stacking",
    required: true
  },
  {
    name: "x",
    type: "keyof T",
    description: "Key from data object to use for x-axis labels (bar labels)",
    required: true
  },
  {
    name: "y",
    type: "readonly (keyof T)[]",
    description: "Array of keys from data object to stack. Each key represents a segment in the stacked bars. Order determines stacking sequence (bottom to top for vertical, left to right for horizontal)",
    required: true
  },
  {
    name: "colors",
    type: "readonly string[]",
    default: "DEFAULT_COLORS",
    description: "Array of colors for each stacked segment. Colors cycle through the array if more segments than colors"
  },
  {
    name: "variant",
    type: "'filled' | 'outline'",
    default: "'filled'",
    description: "Visual style of bars - filled with solid colors or outline only for modern minimalist designs"
  },
  {
    name: "orientation",
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: "Direction of stacking - vertical (bottom-up) or horizontal (left-right)"
  },
  {
    name: "showLegend",
    type: "boolean",
    default: "false",
    description: "Display legend showing all stacked categories with their colors"
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
    description: "Show loading state with animated skeleton matching the selected variant and orientation"
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
    description: "Enable entrance animations with staggered segment reveals"
  },
  {
    name: "onSegmentClick",
    type: "(data: T, stackKey: string, index: number) => void",
    description: "Callback fired when a segment is clicked. Receives the data object, the segment key, and bar index"
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
npx mario-charts@latest init --components stacked-bar-chart`,
    language: "bash"
  },
  {
    title: "Add the StackedBarChart component",
    description: "Install the StackedBarChart component using the CLI. This automatically handles dependencies.",
    code: `# Add StackedBarChart component
npx mario-charts@latest add stacked-bar-chart

# Add multiple chart components at once
npx mario-charts@latest add stacked-bar-chart bar-chart line-chart`,
    language: "bash"
  },
  {
    title: "Start using the component",
    description: "Import and use the StackedBarChart in your React components.",
    code: `import { StackedBarChart } from "@/components/charts/stacked-bar-chart";

// Define your data with multiple categories
const data = [
  { month: "Jan", desktop: 4200, mobile: 2400, services: 1800 },
  { month: "Feb", desktop: 5100, mobile: 2800, services: 2200 }
];

// Use in your component - y must be an array!
<StackedBarChart
  data={data}
  x="month"
  y={["desktop", "mobile", "services"]}
  showLegend
/>`,
    language: "tsx"
  }
];

// Type for segment selection with proper data structure
interface SegmentSelection {
  data: { month: string; [key: string]: string | number };
  key: string;
  index: number;
}

export default function StackedBarChartPage() {
  const [selectedSegment, setSelectedSegment] = useState<SegmentSelection | null>(null);

  // Basic example controls
  const [showAnimation, setShowAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);
  const [variant, setVariant] = useState<'filled' | 'outline'>('filled');
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [showLegend, setShowLegend] = useState(true);

  // Quarterly sales controls
  const [quarterlyAnimation, setQuarterlyAnimation] = useState(true);
  const [quarterlyVariant, setQuarterlyVariant] = useState<'filled' | 'outline'>('filled');
  const [quarterlyOrientation, setQuarterlyOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [quarterlyLegend, setQuarterlyLegend] = useState(true);

  // Marketing channels controls
  const [marketingAnimation, setMarketingAnimation] = useState(true);
  const [marketingVariant, setMarketingVariant] = useState<'filled' | 'outline'>('outline');
  const [marketingOrientation, setMarketingOrientation] = useState<'vertical' | 'horizontal'>('horizontal');
  const [marketingLegend, setMarketingLegend] = useState(true);

  // Large dataset controls
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
          <ChartBar size={24} weight="duotone" className="text-primary" />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Stacked Bar Chart
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-7 max-w-3xl">
          Visualize multi-category data with production-ready stacked bars. Perfect for comparing composition across different groups with zero configuration required. Built for complex datasets with TypeScript-first design.
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Multi-Category Support
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
            Interactive Legend
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Multi-Segment Tooltips
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
        </div>
      </div>

      {/* Quick Start Example */}
      <ExampleShowcase
        title="Revenue Breakdown by Product Category"
        description="Track monthly revenue split across Desktop, Mobile, and Services with interactive segments and dynamic legend"
        preview={
          <div className="space-y-4">
            <div className="h-96">
              <StackedBarChart
                key={chartKey}
                data={monthlyRevenueBreakdown}
                x="month"
                y={["desktop", "mobile", "services"]}
                variant={variant}
                orientation={orientation}
                showLegend={showLegend}
                animation={showAnimation}
                colors={['#3b82f6', '#10b981', '#f59e0b']}
                onSegmentClick={(data: SegmentSelection['data'], stackKey: string, index: number) => {
                  setSelectedSegment({ data, key: stackKey, index });
                  console.log('Clicked segment:', { data, stackKey, index });
                }}
              />
            </div>

            {/* Interactive feedback */}
            <div className="p-3 bg-muted/50 rounded-lg border text-sm">
              <div className="font-medium">
                Selected: {selectedSegment
                  ? (() => {
                      const value = selectedSegment.data[selectedSegment.key];
                      const formattedValue = typeof value === 'number' ? value.toLocaleString() : String(value);
                      return `${selectedSegment.data.month} - ${selectedSegment.key}: $${formattedValue}`;
                    })()
                  : 'Click a segment to select'}
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
                    checked={showLegend}
                    onChange={setShowLegend}
                    label="Legend"
                    id="basic-legend"
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
        code={`import { StackedBarChart } from '@/components/charts/stacked-bar-chart';
import { useState } from 'react';

const monthlyRevenue = [
  { month: "Jan", desktop: 4200, mobile: 2400, services: 1800 },
  { month: "Feb", desktop: 5100, mobile: 2800, services: 2200 },
  { month: "Mar", desktop: 4600, mobile: 2100, services: 1900 },
  { month: "Apr", desktop: 6200, mobile: 3400, services: 2500 },
  { month: "May", desktop: 5800, mobile: 3100, services: 2400 },
  { month: "Jun", desktop: 7100, mobile: 3900, services: 3000 }
];

export function RevenueBreakdownChart() {
  const [selected, setSelected] = useState(null);

  return (
    <StackedBarChart
      data={monthlyRevenue}
      x="month"
      y={["desktop", "mobile", "services"]}
      colors={['#3b82f6', '#10b981', '#f59e0b']}
      showLegend
      onSegmentClick={(data: SegmentSelection['data'], stackKey: string, index: number) => {
        setSelected({ data, stackKey, index });
        console.log('Clicked:', { data, stackKey, index });
      }}
    />
  );
}`}
      />

      {/* Installation */}
      <InstallationGuide
        title="Installation"
        description="Get started with the StackedBarChart component in just a few steps."
        cliCommand="npx mario-charts@latest add stacked-bar-chart"
        steps={installationSteps}
        copyPasteCode={`// The complete StackedBarChart component will be available in your project
// after running the CLI command. The component includes:
// - Full TypeScript support
// - Loading, error, and empty states
// - Framer Motion animations
// - ResizeObserver for responsive sizing
// - ARIA labels for accessibility`}
      />

      {/* Advanced Examples */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Examples</h2>
          <p className="text-muted-foreground">
            Explore different configurations and use cases for comparing composition across categories.
          </p>
        </div>

        {/* Quarterly Sales by Region */}
        <ExampleShowcase
          title="Quarterly Sales by Region"
          description="Four-segment stacked bars showing sales distribution across North, South, East, and West regions with rich tooltips displaying all segments and totals"
          preview={
            <div className="space-y-4">
              <div className="h-96">
                <StackedBarChart
                  key={`quarterly-${chartKey}`}
                  data={quarterlySales}
                  x="quarter"
                  y={["north", "south", "east", "west"]}
                  colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
                  variant={quarterlyVariant}
                  orientation={quarterlyOrientation}
                  showLegend={quarterlyLegend}
                  animation={quarterlyAnimation}
                />
              </div>

              {/* Controls */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <AnimatedCheckbox
                      checked={quarterlyAnimation}
                      onChange={setQuarterlyAnimation}
                      label="Animations"
                      id="quarterly-animations"
                    />

                    <AnimatedCheckbox
                      checked={quarterlyLegend}
                      onChange={setQuarterlyLegend}
                      label="Legend"
                      id="quarterly-legend"
                    />

                    <div className="flex items-center space-x-2 text-sm">
                      <span>Variant:</span>
                      <StyledSelect
                        value={quarterlyVariant}
                        onValueChange={(value) => setQuarterlyVariant(value as 'filled' | 'outline')}
                        options={[
                          { value: 'filled', label: 'Filled' },
                          { value: 'outline', label: 'Outline' }
                        ]}
                      />
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <span>Orientation:</span>
                      <StyledSelect
                        value={quarterlyOrientation}
                        onValueChange={(value) => setQuarterlyOrientation(value as 'vertical' | 'horizontal')}
                        options={[
                          { value: 'vertical', label: 'Vertical' },
                          { value: 'horizontal', label: 'Horizontal' }
                        ]}
                      />
                    </div>
                  </div>

                  <button
                    onClick={replayAnimation}
                    disabled={!quarterlyAnimation}
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
          code={`import { StackedBarChart } from '@/components/charts/stacked-bar-chart';

const quarterlySales = [
  { quarter: "Q1 2024", north: 45000, south: 32000, east: 28000, west: 39000 },
  { quarter: "Q2 2024", north: 52000, south: 38000, east: 31000, west: 44000 },
  { quarter: "Q3 2024", north: 48000, south: 35000, east: 29000, west: 41000 },
  { quarter: "Q4 2024", north: 61000, south: 43000, east: 36000, west: 52000 }
];

export function QuarterlySalesChart() {
  return (
    <StackedBarChart
      data={quarterlySales}
      x="quarter"
      y={["north", "south", "east", "west"]}
      colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
      showLegend
    />
  );
}`}
        />

        {/* Marketing Channels - Horizontal + Outline */}
        <ExampleShowcase
          title="Marketing Channels - Modern Dashboard Style"
          description="Horizontal orientation with outline variant creates a contemporary look perfect for modern dashboards. Shows lead generation across Email, Social, Direct, and Referral channels"
          preview={
            <div className="space-y-4">
              <div className="h-96">
                <StackedBarChart
                  key={`marketing-${chartKey}`}
                  data={marketingChannels}
                  x="month"
                  y={["email", "social", "direct", "referral"]}
                  colors={['#8b5cf6', '#06b6d4', '#f97316', '#ec4899']}
                  variant={marketingVariant}
                  orientation={marketingOrientation}
                  showLegend={marketingLegend}
                  animation={marketingAnimation}
                />
              </div>

              {/* Controls */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <AnimatedCheckbox
                      checked={marketingAnimation}
                      onChange={setMarketingAnimation}
                      label="Animations"
                      id="marketing-animations"
                    />

                    <AnimatedCheckbox
                      checked={marketingLegend}
                      onChange={setMarketingLegend}
                      label="Legend"
                      id="marketing-legend"
                    />

                    <div className="flex items-center space-x-2 text-sm">
                      <span>Variant:</span>
                      <StyledSelect
                        value={marketingVariant}
                        onValueChange={(value) => setMarketingVariant(value as 'filled' | 'outline')}
                        options={[
                          { value: 'filled', label: 'Filled' },
                          { value: 'outline', label: 'Outline' }
                        ]}
                      />
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <span>Orientation:</span>
                      <StyledSelect
                        value={marketingOrientation}
                        onValueChange={(value) => setMarketingOrientation(value as 'vertical' | 'horizontal')}
                        options={[
                          { value: 'vertical', label: 'Vertical' },
                          { value: 'horizontal', label: 'Horizontal' }
                        ]}
                      />
                    </div>
                  </div>

                  <button
                    onClick={replayAnimation}
                    disabled={!marketingAnimation}
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
          code={`import { StackedBarChart } from '@/components/charts/stacked-bar-chart';

const marketingChannels = [
  { month: "Jan", email: 1200, social: 850, direct: 620, referral: 340 },
  { month: "Feb", email: 1450, social: 920, direct: 780, referral: 410 },
  { month: "Mar", email: 1380, social: 890, direct: 710, referral: 390 },
  { month: "Apr", email: 1650, social: 1100, direct: 850, referral: 480 },
  { month: "May", email: 1590, social: 1020, direct: 820, referral: 460 },
  { month: "Jun", email: 1820, social: 1250, direct: 950, referral: 540 }
];

export function MarketingChannelsChart() {
  return (
    <StackedBarChart
      data={marketingChannels}
      x="month"
      y={["email", "social", "direct", "referral"]}
      colors={['#8b5cf6', '#06b6d4', '#f97316', '#ec4899']}
      variant="outline"
      orientation="horizontal"
      showLegend
    />
  );
}`}
        />

        {/* Product Mix by Store */}
        <ExampleShowcase
          title="Product Mix by Store Location"
          description="Compare product category distribution across different store locations. Demonstrates proportion visualization for comparing composition"
          preview={
            <div className="h-96">
              <StackedBarChart
                key={`product-mix-${chartKey}`}
                data={productMixByStore}
                x="store"
                y={["electronics", "apparel", "home"]}
                colors={['#3b82f6', '#10b981', '#f59e0b']}
                variant="filled"
                orientation="vertical"
                showLegend
                animation={showAnimation}
              />
            </div>
          }
          code={`import { StackedBarChart } from '@/components/charts/stacked-bar-chart';

const productMixByStore = [
  { store: "NYC", electronics: 82000, apparel: 54000, home: 38000 },
  { store: "LA", electronics: 75000, apparel: 61000, home: 42000 },
  { store: "Chicago", electronics: 68000, apparel: 48000, home: 35000 },
  { store: "Miami", electronics: 59000, apparel: 52000, home: 31000 },
  { store: "Seattle", electronics: 71000, apparel: 56000, home: 39000 }
];

export function ProductMixChart() {
  return (
    <StackedBarChart
      data={productMixByStore}
      x="store"
      y={["electronics", "apparel", "home"]}
      colors={['#3b82f6', '#10b981', '#f59e0b']}
      showLegend
    />
  );
}`}
        />

        {/* Large Dataset Performance */}
        <ExampleShowcase
          title="Large Dataset Performance"
          description="24 bars with 4 stacked categories each (96 total segments) demonstrating smooth performance with memoization and optimized rendering"
          preview={
            <div className="space-y-4">
              <div className="h-96">
                <StackedBarChart
                  key={`large-${chartKey}`}
                  data={largeDataset}
                  x="period"
                  y={["categoryA", "categoryB", "categoryC", "categoryD"]}
                  colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
                  variant={largeVariant}
                  orientation={largeOrientation}
                  showLegend={false}
                  animation={largeAnimation}
                  className="text-xs"
                />
              </div>

              {/* Performance notes */}
              <div className="p-3 bg-muted/50 rounded-lg border text-sm">
                <div className="font-medium mb-1">Performance Notes:</div>
                <ul className="text-muted-foreground space-y-1">
                  <li>• 24 bars × 4 categories = 96 segments rendered smoothly</li>
                  <li>• Memoized data processing prevents unnecessary recalculations</li>
                  <li>• ResizeObserver handles responsive updates efficiently</li>
                  <li>• Legend hidden for cleaner visualization with many bars</li>
                </ul>
              </div>

              {/* Controls */}
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
          code={`import { StackedBarChart } from '@/components/charts/stacked-bar-chart';

// Generate large dataset
const largeDataset = Array.from({ length: 24 }, (_, i) => ({
  period: \`Period \${i + 1}\`,
  categoryA: 1000 + (i * 50) + Math.random() * 500,
  categoryB: 800 + (i * 40) + Math.random() * 400,
  categoryC: 600 + (i * 30) + Math.random() * 300,
  categoryD: 400 + (i * 20) + Math.random() * 200
}));

export function LargeDatasetChart() {
  return (
    <StackedBarChart
      data={largeDataset}
      x="period"
      y={["categoryA", "categoryB", "categoryC", "categoryD"]}
      colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
      showLegend={false}
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
              <StackedBarChart
                key={`loading-${chartKey}`}
                data={monthlyRevenueBreakdown}
                x="month"
                y={["desktop", "mobile", "services"]}
                loading={true}
                variant={variant}
                orientation={orientation}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Error State</h3>
            <div className="h-64">
              <StackedBarChart
                key={`error-${chartKey}`}
                data={monthlyRevenueBreakdown}
                x="month"
                y={["desktop", "mobile", "services"]}
                error="Failed to load revenue data"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Empty State</h3>
            <div className="h-64">
              <StackedBarChart
                key={`empty-${chartKey}`}
                data={[]}
                x="month"
                y={["desktop", "mobile", "services"]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Variant & Orientation Showcase */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Variants & Orientations</h2>
          <p className="text-muted-foreground">
            Mix and match variants with orientations to achieve different visual styles for your dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vertical Filled */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Vertical + Filled</h3>
              <p className="text-sm text-muted-foreground">
                Classic stacked bars - solid colors, bottom-up stacking
              </p>
            </div>

            <div className="h-80 mb-4">
              <StackedBarChart
                key={`vfilled-${chartKey}`}
                data={quarterlySales}
                x="quarter"
                y={["north", "south", "east", "west"]}
                variant="filled"
                orientation="vertical"
                showLegend
                animation={showAnimation}
                colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
              />
            </div>
          </div>

          {/* Vertical Outline */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Vertical + Outline</h3>
              <p className="text-sm text-muted-foreground">
                Modern minimalist look with outline-only segments
              </p>
            </div>

            <div className="h-80 mb-4">
              <StackedBarChart
                key={`voutline-${chartKey}`}
                data={quarterlySales}
                x="quarter"
                y={["north", "south", "east", "west"]}
                variant="outline"
                orientation="vertical"
                showLegend
                animation={showAnimation}
                colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
              />
            </div>
          </div>

          {/* Horizontal Filled */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Horizontal + Filled</h3>
              <p className="text-sm text-muted-foreground">
                Left-to-right stacking with solid fills - great for rankings
              </p>
            </div>

            <div className="h-80 mb-4">
              <StackedBarChart
                key={`hfilled-${chartKey}`}
                data={quarterlySales}
                x="quarter"
                y={["north", "south", "east", "west"]}
                variant="filled"
                orientation="horizontal"
                showLegend
                animation={showAnimation}
                colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
              />
            </div>
          </div>

          {/* Horizontal Outline */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Horizontal + Outline</h3>
              <p className="text-sm text-muted-foreground">
                Contemporary dashboard style - perfect for executive views
              </p>
            </div>

            <div className="h-80 mb-4">
              <StackedBarChart
                key={`houtline-${chartKey}`}
                data={quarterlySales}
                x="quarter"
                y={["north", "south", "east", "west"]}
                variant="outline"
                orientation="horizontal"
                showLegend
                animation={showAnimation}
                colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
              />
            </div>
          </div>
        </div>
      </div>

      {/* API Reference */}
      <APIReference
        title="API Reference"
        description="Complete TypeScript interface with all available props and configurations for StackedBarChart."
        props={stackedBarChartProps}
      />
    </div>
  );
}
