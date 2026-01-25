"use client";

import { useState } from "react";
import { Breadcrumbs } from "../../../../components/site/breadcrumbs";
import { RadarChart } from "@/src/components/charts/radar-chart";
import { ExampleShowcase } from "../../../../components/ui/example-showcase";
import { APIReference } from "../../../../components/ui/api-reference";
import { InstallationGuide } from "../../../../components/ui/installation-guide";
import { ChartPolar } from "@phosphor-icons/react";
import { AnimatedCheckbox } from "../../../../components/ui/animated-checkbox";

// Sample data sets for different examples

// FIFA-style player stats (primary use case)
const playerStats = [
  {
    id: "messi",
    name: "Lionel Messi",
    data: {
      pace: 85,
      shooting: 92,
      passing: 91,
      dribbling: 95,
      defending: 35,
      physical: 65,
    },
  },
  {
    id: "ronaldo",
    name: "Cristiano Ronaldo",
    data: {
      pace: 87,
      shooting: 93,
      passing: 82,
      dribbling: 88,
      defending: 35,
      physical: 77,
    },
  },
];

const playerAxes = [
  { key: "pace", label: "PAC" },
  { key: "shooting", label: "SHO" },
  { key: "passing", label: "PAS" },
  { key: "dribbling", label: "DRI" },
  { key: "defending", label: "DEF" },
  { key: "physical", label: "PHY" },
];

// Skills assessment data
const skillsData = [
  {
    id: "fullstack",
    name: "Full Stack",
    data: {
      frontend: 85,
      backend: 88,
      database: 80,
      devops: 70,
      design: 55,
    },
  },
  {
    id: "frontend",
    name: "Frontend Dev",
    data: {
      frontend: 95,
      backend: 50,
      database: 45,
      devops: 40,
      design: 85,
    },
  },
];

const skillsAxes = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "database", label: "Database" },
  { key: "devops", label: "DevOps" },
  { key: "design", label: "Design" },
];

// Product comparison data
const productData = [
  {
    id: "productA",
    name: "Product A",
    data: {
      price: 4,
      quality: 5,
      features: 4,
      support: 3,
      performance: 5,
    },
  },
  {
    id: "productB",
    name: "Product B",
    data: {
      price: 5,
      quality: 3,
      features: 5,
      support: 4,
      performance: 3,
    },
  },
  {
    id: "productC",
    name: "Product C",
    data: {
      price: 3,
      quality: 4,
      features: 3,
      support: 5,
      performance: 4,
    },
  },
];

const productAxes = [
  { key: "price", label: "Price", max: 5 },
  { key: "quality", label: "Quality", max: 5 },
  { key: "features", label: "Features", max: 5 },
  { key: "support", label: "Support", max: 5 },
  { key: "performance", label: "Performance", max: 5 },
];

// API Reference data
const radarChartProps = [
  {
    name: "series",
    type: "readonly RadarSeries<T>[]",
    description: "Array of data series to display. Each series has id, name, data object, and optional color",
    required: true
  },
  {
    name: "axes",
    type: "readonly RadarAxis[]",
    description: "Configuration for each axis/dimension with key, label, and optional min/max bounds",
    required: true
  },
  {
    name: "colors",
    type: "readonly string[]",
    default: "DEFAULT_COLORS",
    description: "Array of colors to use for series (cycles through for multiple series)"
  },
  {
    name: "height",
    type: "number",
    default: "400",
    description: "Height of the chart in pixels"
  },
  {
    name: "showAxisLabels",
    type: "boolean",
    default: "true",
    description: "Show labels at the end of each axis"
  },
  {
    name: "showDots",
    type: "boolean",
    default: "true",
    description: "Show dots at each data point vertex"
  },
  {
    name: "fillOpacity",
    type: "number",
    default: "0.25",
    description: "Opacity of the polygon fill (0-1)"
  },
  {
    name: "strokeWidth",
    type: "number",
    default: "2",
    description: "Width of the polygon stroke in pixels"
  },
  {
    name: "labelOffset",
    type: "number",
    default: "25",
    description: "Distance of axis labels from the chart edge"
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
    description: "Enable entrance and hover animations"
  },
  {
    name: "onSeriesClick",
    type: "(series: RadarSeries<T>, index: number) => void",
    description: "Callback fired when a series polygon is clicked"
  },
  {
    name: "onAxisClick",
    type: "(axis: RadarAxis, index: number) => void",
    description: "Callback fired when an axis is clicked"
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
npx mario-charts@latest init --components radar-chart`,
    language: "bash"
  },
  {
    title: "Add the RadarChart component",
    description: "Install the RadarChart component using the CLI. This automatically handles dependencies.",
    code: `# Add RadarChart component
npx mario-charts@latest add radar-chart

# Add multiple chart components at once
npx mario-charts@latest add radar-chart bar-chart pie-chart`,
    language: "bash"
  },
  {
    title: "Start using the component",
    description: "Import and use the RadarChart in your React components.",
    code: `import { RadarChart } from "@/components/charts/radar-chart";

const playerStats = [
  {
    id: "player1",
    name: "Player 1",
    data: { pace: 85, shooting: 92, passing: 91 }
  }
];

const axes = [
  { key: "pace", label: "Pace" },
  { key: "shooting", label: "Shooting" },
  { key: "passing", label: "Passing" }
];

<RadarChart series={playerStats} axes={axes} />`,
    language: "tsx"
  }
];

export function RadarChartContent() {
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);
  const [showDots, setShowDots] = useState(true);

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
          <ChartPolar size={24} weight="duotone" className="text-primary" />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Radar Chart
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-7 max-w-3xl">
          A versatile radar chart (spider/web chart) for visualizing multi-dimensional data.
          Perfect for player stats, skills assessment, product comparisons, and performance metrics.
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Multi-Series
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Gaming Ready
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Interactive Tooltips
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Smooth Animations
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Keyboard Accessible
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
        title="Basic Radar Chart"
        description="Compare developer skill profiles across multiple dimensions with interactive hover and click"
        preview={
          <div className="space-y-4">
            <div className="h-96">
              <RadarChart
                key={chartKey}
                series={skillsData}
                axes={skillsAxes}
                showDots={showDots}
                animation={showAnimation}
                onSeriesClick={(series) => setSelectedSeries(series.id)}
              />
            </div>

            {/* Interactive feedback */}
            <div className="p-3 bg-muted/50 rounded-lg border text-sm">
              <div className="font-medium">
                Selected: {selectedSeries
                  ? skillsData.find(s => s.id === selectedSeries)?.name
                  : 'Click the chart to select'}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between flex-wrap gap-4">
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
                    label="Show Dots"
                    id="show-dots"
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
        code={`import { RadarChart } from '@/components/charts/radar-chart';

const skillsData = [
  {
    id: "fullstack",
    name: "Full Stack",
    data: {
      frontend: 85,
      backend: 88,
      database: 80,
      devops: 70,
      design: 55,
    },
  },
  {
    id: "frontend",
    name: "Frontend Dev",
    data: {
      frontend: 95,
      backend: 50,
      database: 45,
      devops: 40,
      design: 85,
    },
  },
];

const skillsAxes = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "database", label: "Database" },
  { key: "devops", label: "DevOps" },
  { key: "design", label: "Design" },
];

export function SkillsRadarChart() {
  return (
    <RadarChart
      series={skillsData}
      axes={skillsAxes}
      gridType="polygon"
      onSeriesClick={(series) => {
        console.log('Clicked:', series);
      }}
    />
  );
}`}
      />

      {/* Installation */}
      <InstallationGuide
        title="Installation"
        description="Get started with the RadarChart component in just a few steps."
        cliCommand="npx mario-charts@latest add radar-chart"
        steps={installationSteps}
        copyPasteCode={`// Complete RadarChart component code available after CLI installation`}
      />

      {/* Advanced Examples */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Examples</h2>
          <p className="text-muted-foreground">
            Explore different configurations and use cases for the RadarChart component.
          </p>
        </div>

        {/* FIFA-style Player Comparison */}
        <ExampleShowcase
          title="FIFA-Style Player Stats"
          description="Compare two players with overlapping radar polygons - a classic gaming use case"
          preview={
            <div className="h-96">
              <RadarChart
                key={`fifa-${chartKey}`}
                series={playerStats}
                axes={playerAxes}
                animation={showAnimation}
                fillOpacity={0.2}
                height={380}
              />
            </div>
          }
          code={`import { RadarChart } from '@/components/charts/radar-chart';

const playerStats = [
  {
    id: "messi",
    name: "Lionel Messi",
    data: {
      pace: 85,
      shooting: 92,
      passing: 91,
      dribbling: 95,
      defending: 35,
      physical: 65,
    },
  },
  {
    id: "ronaldo",
    name: "Cristiano Ronaldo",
    data: {
      pace: 87,
      shooting: 93,
      passing: 82,
      dribbling: 88,
      defending: 35,
      physical: 77,
    },
  },
];

const playerAxes = [
  { key: "pace", label: "PAC" },
  { key: "shooting", label: "SHO" },
  { key: "passing", label: "PAS" },
  { key: "dribbling", label: "DRI" },
  { key: "defending", label: "DEF" },
  { key: "physical", label: "PHY" },
];

export function PlayerComparison() {
  return (
    <RadarChart
      series={playerStats}
      axes={playerAxes}
      fillOpacity={0.2}
    />
  );
}`}
        />

        {/* Product Comparison - 3 Series */}
        <ExampleShowcase
          title="Product Comparison"
          description="Compare multiple products across various dimensions with automatic color cycling"
          preview={
            <div className="h-96">
              <RadarChart
                key={`product-${chartKey}`}
                series={productData}
                axes={productAxes}
                animation={showAnimation}
                fillOpacity={0.15}
                height={380}
              />
            </div>
          }
          code={`import { RadarChart } from '@/components/charts/radar-chart';

const productData = [
  {
    id: "productA",
    name: "Product A",
    data: { price: 4, quality: 5, features: 4, support: 3, performance: 5 },
  },
  {
    id: "productB",
    name: "Product B",
    data: { price: 5, quality: 3, features: 5, support: 4, performance: 3 },
  },
  {
    id: "productC",
    name: "Product C",
    data: { price: 3, quality: 4, features: 3, support: 5, performance: 4 },
  },
];

const productAxes = [
  { key: "price", label: "Price", max: 5 },
  { key: "quality", label: "Quality", max: 5 },
  { key: "features", label: "Features", max: 5 },
  { key: "support", label: "Support", max: 5 },
  { key: "performance", label: "Performance", max: 5 },
];

export function ProductComparison() {
  return (
    <RadarChart
      series={productData}
      axes={productAxes}
      fillOpacity={0.15}
    />
  );
}`}
        />

        {/* Custom Styling */}
        <ExampleShowcase
          title="Custom Styling"
          description="Customize colors, fill opacity, and stroke width for unique visual styles"
          preview={
            <div className="h-96">
              <RadarChart
                key={`custom-${chartKey}`}
                series={[
                  {
                    id: "custom",
                    name: "Custom Style",
                    data: {
                      metric1: 80,
                      metric2: 65,
                      metric3: 90,
                      metric4: 75,
                      metric5: 85,
                      metric6: 70,
                    },
                  },
                ]}
                axes={[
                  { key: "metric1", label: "Speed" },
                  { key: "metric2", label: "Power" },
                  { key: "metric3", label: "Accuracy" },
                  { key: "metric4", label: "Stamina" },
                  { key: "metric5", label: "Agility" },
                  { key: "metric6", label: "Defense" },
                ]}
                colors={['#8b5cf6']}
                fillOpacity={0.4}
                strokeWidth={3}
                gridLevels={4}
                animation={showAnimation}
                height={380}
              />
            </div>
          }
          code={`import { RadarChart } from '@/components/charts/radar-chart';

export function CustomStyledRadar() {
  return (
    <RadarChart
      series={[{
        id: "custom",
        name: "Custom Style",
        data: {
          speed: 80,
          power: 65,
          accuracy: 90,
          stamina: 75,
          agility: 85,
          defense: 70,
        },
      }]}
      axes={[
        { key: "speed", label: "Speed" },
        { key: "power", label: "Power" },
        { key: "accuracy", label: "Accuracy" },
        { key: "stamina", label: "Stamina" },
        { key: "agility", label: "Agility" },
        { key: "defense", label: "Defense" },
      ]}
      colors={['#8b5cf6']}
      fillOpacity={0.4}
      strokeWidth={3}
      gridLevels={4}
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
              <RadarChart
                series={[]}
                axes={skillsAxes}
                loading={true}
              />
            </div>
          </div>

          {/* Error State */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Error State</h3>
            <div className="h-64">
              <RadarChart
                series={[]}
                axes={skillsAxes}
                error="Failed to load chart data. Please try again."
              />
            </div>
          </div>

          {/* Empty State */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Empty State</h3>
            <div className="h-64">
              <RadarChart
                series={[]}
                axes={[]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* API Reference */}
      <APIReference
        title="API Reference"
        description="Complete list of props available for the RadarChart component."
        props={radarChartProps}
      />
    </div>
  );
}
