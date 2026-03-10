"use client";

import { useState } from "react";
import { Breadcrumbs } from "../../../../components/site/breadcrumbs";
import { TreeMapChart } from "@/src/components/charts/treemap-chart";
import { ExampleShowcase } from "../../../../components/ui/example-showcase";
import { APIReference } from "../../../../components/ui/api-reference";
import { InstallationGuide } from "../../../../components/ui/installation-guide";
import { GridFour } from "@phosphor-icons/react";
import { AnimatedCheckbox } from "../../../../components/ui/animated-checkbox";

// Sample data: Tech company revenue by segment
const techRevenue = [
  {
    name: "Cloud Services",
    children: [
      { name: "AWS", value: 80000 },
      { name: "Azure", value: 65000 },
      { name: "GCP", value: 33000 },
      { name: "Others", value: 12000 },
    ],
  },
  {
    name: "Hardware",
    children: [
      { name: "Smartphones", value: 52000 },
      { name: "Laptops", value: 38000 },
      { name: "Wearables", value: 18000 },
    ],
  },
  {
    name: "Software",
    children: [
      { name: "Productivity", value: 45000 },
      { name: "Security", value: 28000 },
      { name: "DevTools", value: 15000 },
    ],
  },
  {
    name: "Services",
    children: [
      { name: "Consulting", value: 22000 },
      { name: "Support", value: 14000 },
    ],
  },
] as const;

// Flat data: Disk usage
const diskUsage = [
  { name: "Documents", value: 45 },
  { name: "Photos", value: 32 },
  { name: "Videos", value: 28 },
  { name: "Applications", value: 18 },
  { name: "Music", value: 12 },
  { name: "Downloads", value: 8 },
  { name: "System", value: 6 },
  { name: "Other", value: 4 },
] as const;

// Nested data: Portfolio
const portfolio = [
  {
    name: "Equities",
    children: [
      {
        name: "US Large Cap",
        children: [
          { name: "AAPL", value: 15000 },
          { name: "MSFT", value: 12000 },
          { name: "GOOGL", value: 8000 },
        ],
      },
      {
        name: "International",
        children: [
          { name: "TSM", value: 6000 },
          { name: "ASML", value: 4500 },
        ],
      },
    ],
  },
  {
    name: "Fixed Income",
    children: [
      { name: "Treasury", value: 18000 },
      { name: "Corporate", value: 8000 },
    ],
  },
  {
    name: "Alternatives",
    children: [
      { name: "Real Estate", value: 10000 },
      { name: "Commodities", value: 5000 },
    ],
  },
] as const;

// API Reference
const treemapProps = [
  {
    name: "data",
    type: "readonly TreeMapNode[]",
    description: "Array of tree nodes with name, optional value, and optional children",
    required: true,
  },
  {
    name: "colors",
    type: "readonly string[]",
    default: "DEFAULT_COLORS",
    description: "Array of colors for top-level categories. Children inherit parent color at reduced opacity.",
  },
  {
    name: "height",
    type: "number",
    default: "400",
    description: "Height of the chart in pixels",
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: "Show loading skeleton state",
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
    description: "Enable entrance animations (scale + opacity stagger)",
  },
  {
    name: "onClick",
    type: "(node: TreeMapNode, path: string[]) => void",
    description: "Callback fired when a rectangle is clicked. Path contains the ancestry from root to clicked node.",
  },
  {
    name: "className",
    type: "string",
    description: "Additional CSS classes to apply to the container",
  },
];

// Installation steps
const installationSteps = [
  {
    title: "Initialize Mario Charts (first time only)",
    description: "Set up Mario Charts in your React project. This configures paths and dependencies.",
    code: `# Initialize the project (run once)
npx mario-charts@latest init

# Or initialize with components
npx mario-charts@latest init --components treemap-chart`,
    language: "bash",
  },
  {
    title: "Add the TreeMapChart component",
    description: "Install the TreeMapChart component using the CLI. This automatically handles dependencies.",
    code: `# Add TreeMapChart component
npx mario-charts@latest add treemap-chart

# Add multiple components at once
npx mario-charts@latest add treemap-chart bar-chart line-chart`,
    language: "bash",
  },
  {
    title: "Start using the component",
    description: "Import and use the TreeMapChart in your React components.",
    code: `import { TreeMapChart } from "@/components/charts/treemap-chart";

const data = [
  {
    name: "Category A",
    children: [
      { name: "Item 1", value: 100 },
      { name: "Item 2", value: 80 },
    ],
  },
  { name: "Category B", value: 60 },
];

<TreeMapChart data={data} />`,
    language: "tsx",
  },
];

export function TreeMapContent() {
  const [showAnimation, setShowAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);
  const [clickedNode, setClickedNode] = useState<{ name: string; path: string } | null>(null);

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
          <GridFour size={24} weight="duotone" className="text-primary" />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            TreeMap
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-7 max-w-3xl">
          Visualize hierarchical data as proportional rectangles. Each area represents its value
          relative to the whole, making patterns in large datasets instantly visible.
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Hierarchical Data
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Squarified Layout
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Animated Entry
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
            Tooltips
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Click Handlers
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Keyboard Accessible
          </div>
        </div>
      </div>

      {/* Main Example */}
      <ExampleShowcase
        title="Revenue Breakdown"
        description="Tech company revenue segmented by business unit and product line"
        preview={
          <div className="space-y-4">
            <div className="h-[400px]">
              <TreeMapChart
                key={chartKey}
                data={techRevenue}
                animation={showAnimation}
                onClick={(node, path) => {
                  setClickedNode({ name: node.name, path: path.join(" \u203A ") });
                }}
              />
            </div>

            {/* Interactive feedback */}
            <div className="p-3 bg-muted/50 rounded-lg border text-sm">
              <div className="font-medium">
                Selected:{" "}
                {clickedNode
                  ? `${clickedNode.name} (${clickedNode.path})`
                  : "Click a rectangle to select"}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <AnimatedCheckbox
                  checked={showAnimation}
                  onChange={setShowAnimation}
                  label="Animations"
                  id="treemap-animations"
                />

                <button
                  onClick={replayAnimation}
                  disabled={!showAnimation}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        code={`import { TreeMapChart } from '@/components/charts/treemap-chart';

const techRevenue = [
  {
    name: "Cloud Services",
    children: [
      { name: "AWS", value: 80000 },
      { name: "Azure", value: 65000 },
      { name: "GCP", value: 33000 },
    ],
  },
  {
    name: "Hardware",
    children: [
      { name: "Smartphones", value: 52000 },
      { name: "Laptops", value: 38000 },
    ],
  },
];

export function RevenueTreeMap() {
  return (
    <TreeMapChart
      data={techRevenue}
      onClick={(node, path) => {
        console.log('Clicked:', node.name, path);
      }}
    />
  );
}`}
      />

      {/* Installation */}
      <InstallationGuide
        title="Installation"
        description="Get started with the TreeMapChart component in just a few steps."
        cliCommand="npx mario-charts@latest add treemap-chart"
        steps={installationSteps}
        copyPasteCode="// Complete TreeMapChart component code available after CLI installation"
      />

      {/* More Examples */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Examples</h2>
          <p className="text-muted-foreground">
            Explore different data shapes and use cases for the TreeMapChart component.
          </p>
        </div>

        {/* Flat data example */}
        <ExampleShowcase
          title="Flat Data - Disk Usage"
          description="Simple non-hierarchical data showing proportional disk usage"
          preview={
            <div className="h-80">
              <TreeMapChart
                key={`disk-${chartKey}`}
                data={diskUsage}
                colors={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#64748b"]}
                animation={showAnimation}
              />
            </div>
          }
          code={`import { TreeMapChart } from '@/components/charts/treemap-chart';

const diskUsage = [
  { name: "Documents", value: 45 },
  { name: "Photos", value: 32 },
  { name: "Videos", value: 28 },
  { name: "Applications", value: 18 },
  { name: "Music", value: 12 },
];

export function DiskUsageChart() {
  return <TreeMapChart data={diskUsage} />;
}`}
        />

        {/* Deep nesting example */}
        <ExampleShowcase
          title="Portfolio Allocation"
          description="Multi-level hierarchy showing investment portfolio breakdown by asset class"
          preview={
            <div className="h-96">
              <TreeMapChart
                key={`portfolio-${chartKey}`}
                data={portfolio}
                colors={["#10b981", "#3b82f6", "#f59e0b"]}
                height={384}
                animation={showAnimation}
              />
            </div>
          }
          code={`import { TreeMapChart } from '@/components/charts/treemap-chart';

const portfolio = [
  {
    name: "Equities",
    children: [
      {
        name: "US Large Cap",
        children: [
          { name: "AAPL", value: 15000 },
          { name: "MSFT", value: 12000 },
        ],
      },
      {
        name: "International",
        children: [
          { name: "TSM", value: 6000 },
          { name: "ASML", value: 4500 },
        ],
      },
    ],
  },
  {
    name: "Fixed Income",
    children: [
      { name: "Treasury", value: 18000 },
      { name: "Corporate", value: 8000 },
    ],
  },
];

export function PortfolioChart() {
  return <TreeMapChart data={portfolio} height={384} />;
}`}
        />

        {/* States Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Loading State</h3>
            <div className="h-64">
              <TreeMapChart data={techRevenue} loading={true} height={256} />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Error State</h3>
            <div className="h-64">
              <TreeMapChart
                data={techRevenue}
                error="Failed to load category data"
                height={256}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Empty State</h3>
            <div className="h-64">
              <TreeMapChart data={[]} height={256} />
            </div>
          </div>
        </div>
      </div>

      {/* API Reference */}
      <APIReference
        title="API Reference"
        description="Complete TypeScript interface with all available props and configurations."
        props={treemapProps}
      />
    </div>
  );
}
