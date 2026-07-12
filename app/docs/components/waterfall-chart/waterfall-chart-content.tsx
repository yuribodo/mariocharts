"use client";

import { useState } from "react";
import { Breadcrumbs } from "../../../../components/site/breadcrumbs";
import { WaterfallChart } from "@/src/components/charts/waterfall-chart";
import { ExampleShowcase } from "../../../../components/ui/example-showcase";
import { APIReference } from "../../../../components/ui/api-reference";
import { InstallationGuide } from "../../../../components/ui/installation-guide";
import { ChartBar } from "@phosphor-icons/react";
import { StyledSelect } from "../../../../components/ui/styled-select";
import { AnimatedCheckbox } from "../../../../components/ui/animated-checkbox";

const quarterlyCashFlow = [
  { label: "Starting", value: 100000, type: "total" },
  { label: "Sales", value: 45000, type: "increase" },
  { label: "Services", value: 22000, type: "increase" },
  { label: "Refunds", value: -12000, type: "decrease" },
  { label: "Op. Costs", value: -28000, type: "decrease" },
  { label: "Taxes", value: -9000, type: "decrease" },
  { label: "Net", value: 118000, type: "total" },
] as const;

const budgetBreakdown = [
  { label: "Budget", value: 50000, type: "total" },
  { label: "Marketing", value: -12000, type: "decrease" },
  { label: "Engineering", value: -18000, type: "decrease" },
  { label: "Design", value: -6000, type: "decrease" },
  { label: "Remaining", value: 14000, type: "total" },
] as const;

const productMix = [
  { label: "Q1", value: 32000, type: "total" },
  { label: "New", value: 18000, type: "increase" },
  { label: "Upsell", value: 9000, type: "increase" },
  { label: "Churn", value: -14000, type: "decrease" },
  { label: "Q2", value: 45000, type: "total" },
] as const;

const waterfallChartProps = [
  {
    name: "data",
    type: "readonly T[]",
    description: "Array of step objects (label, value, and optional type) to display",
    required: true,
  },
  {
    name: "x",
    type: "keyof T",
    default: "'label'",
    description: "Key from each object to use for the step label",
  },
  {
    name: "y",
    type: "keyof T",
    default: "'value'",
    description: "Key from each object holding the numeric value",
  },
  {
    name: "type",
    type: "keyof T",
    default: "'type'",
    description:
      "Key holding each step's type ('increase' | 'decrease' | 'total'). When absent, the type is inferred from the sign of the value",
  },
  {
    name: "colors",
    type: "{ increase?: string; decrease?: string; total?: string }",
    default: "{ increase: '#10b981', decrease: '#ef4444', total: '#3b82f6' }",
    description: "Override the color used for each bar type",
  },
  {
    name: "orientation",
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: "Layout direction of the bars",
  },
  {
    name: "showConnectors",
    type: "boolean",
    default: "true",
    description: "Draw the connector lines that link each step's running total to the next",
  },
  {
    name: "showValues",
    type: "boolean",
    default: "false",
    description: "Render the signed delta (or absolute total) on each bar",
  },
  {
    name: "showLegend",
    type: "boolean",
    default: "false",
    description: "Show the increase / decrease / total legend below the chart",
  },
  {
    name: "showGrid",
    type: "boolean",
    default: "false",
    description: "Show value grid lines and axis tick labels",
  },
  {
    name: "gridStyle",
    type: "'solid' | 'dashed' | 'dotted'",
    default: "'dashed'",
    description: "Style of the grid lines when showGrid is enabled",
  },
  {
    name: "height",
    type: "number",
    default: "300",
    description: "Height of the chart in pixels",
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
    description: "Enable entrance animations (respects prefers-reduced-motion)",
  },
  {
    name: "onBarClick",
    type: "(data: T, index: number) => void",
    description: "Callback fired when a bar is clicked",
  },
  {
    name: "tooltipRenderer",
    type: "(data: WaterfallChartTooltipData<T>) => React.ReactNode",
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
npx mario-charts@latest init --components waterfall-chart`,
    language: "bash",
  },
  {
    title: "Add the WaterfallChart component",
    description: "Install the WaterfallChart component using the CLI. This automatically handles dependencies.",
    code: `# Add WaterfallChart component
npx mario-charts@latest add waterfall-chart

# Add multiple chart components at once
npx mario-charts@latest add waterfall-chart bar-chart line-chart`,
    language: "bash",
  },
  {
    title: "Start using the component",
    description: "Import and use the WaterfallChart in your React components.",
    code: `import { WaterfallChart } from "@/components/charts/waterfall-chart";

const data = [
  { label: "Starting", value: 100000, type: "total" },
  { label: "Sales", value: 45000, type: "increase" },
  { label: "Refunds", value: -12000, type: "decrease" },
  { label: "Expenses", value: -28000, type: "decrease" },
  { label: "Net", value: 105000, type: "total" },
];

<WaterfallChart data={data} showConnectors showValues />`,
    language: "tsx",
  },
];

export function WaterfallChartContent() {
  const [selectedStep, setSelectedStep] = useState<Record<string, unknown> | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [showConnectors, setShowConnectors] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

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
          <ChartBar size={24} weight="duotone" className="text-primary" />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Waterfall Chart
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-7 max-w-3xl">
          Show how an initial value is affected by a sequence of positive and negative changes.
          Waterfall charts are a staple of financial dashboards for cash flow, budgets, and
          variance analysis — with running totals, connector lines, and color-coded steps.
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          {[
            "CLI Installation",
            "Increase / Decrease / Total",
            "Running Totals",
            "Connector Lines",
            "Horizontal & Vertical",
            "Interactive Tooltips",
            "Keyboard Accessible",
            "Performance Optimized",
            "TypeScript",
            "Zero Dependencies",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start Example */}
      <ExampleShowcase
        title="Basic Example"
        description="A quarterly cash-flow waterfall — a starting total, a series of gains and losses, and a closing total"
        preview={
          <div className="space-y-4">
            <div className="h-80">
              <WaterfallChart
                key={chartKey}
                data={quarterlyCashFlow}
                orientation={orientation}
                showConnectors={showConnectors}
                showValues={showValues}
                showLegend={showLegend}
                showGrid
                animation={showAnimation}
                onBarClick={(data) => {
                  setSelectedStep(data as unknown as Record<string, unknown>);
                }}
              />
            </div>

            {/* Interactive feedback */}
            <div className="p-3 bg-muted/50 rounded-lg border text-sm">
              <div className="font-medium">
                Selected:{" "}
                {selectedStep
                  ? `${selectedStep.label} — ${Number(selectedStep.value).toLocaleString()}`
                  : "Click a bar to select"}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-6 flex-wrap gap-y-2">
                  <AnimatedCheckbox
                    checked={showAnimation}
                    onChange={setShowAnimation}
                    label="Animations"
                    id="wf-animations"
                  />
                  <AnimatedCheckbox
                    checked={showConnectors}
                    onChange={setShowConnectors}
                    label="Connectors"
                    id="wf-connectors"
                  />
                  <AnimatedCheckbox
                    checked={showValues}
                    onChange={setShowValues}
                    label="Values"
                    id="wf-values"
                  />
                  <AnimatedCheckbox
                    checked={showLegend}
                    onChange={setShowLegend}
                    label="Legend"
                    id="wf-legend"
                  />

                  <div className="flex items-center space-x-2 text-sm">
                    <span>Orientation:</span>
                    <StyledSelect
                      value={orientation}
                      onValueChange={(value) =>
                        setOrientation(value as "vertical" | "horizontal")
                      }
                      options={[
                        { value: "vertical", label: "Vertical" },
                        { value: "horizontal", label: "Horizontal" },
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
        code={`import { WaterfallChart } from '@/components/charts/waterfall-chart';

const quarterlyCashFlow = [
  { label: "Starting", value: 100000, type: "total" },
  { label: "Sales", value: 45000, type: "increase" },
  { label: "Services", value: 22000, type: "increase" },
  { label: "Refunds", value: -12000, type: "decrease" },
  { label: "Op. Costs", value: -28000, type: "decrease" },
  { label: "Taxes", value: -9000, type: "decrease" },
  { label: "Net", value: 118000, type: "total" },
];

export function CashFlowChart() {
  return (
    <WaterfallChart
      data={quarterlyCashFlow}
      showConnectors
      showValues
      showLegend
      showGrid
      onBarClick={(data, index) => {
        console.log('Clicked:', data, index);
      }}
    />
  );
}`}
      />

      {/* Installation */}
      <InstallationGuide
        title="Installation"
        description="Get started with the WaterfallChart component in just a few steps."
        cliCommand="npx mario-charts@latest add waterfall-chart"
        steps={installationSteps}
        copyPasteCode={`// Complete WaterfallChart component code available after CLI installation`}
      />

      {/* Advanced Examples */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Examples</h2>
          <p className="text-muted-foreground">
            Explore different configurations and use cases for the WaterfallChart component.
          </p>
        </div>

        {/* Type inference */}
        <ExampleShowcase
          title="Automatic Type Inference"
          description="Omit the type field and the chart infers increases and decreases from the sign of each value — only totals need to be marked explicitly"
          preview={
            <div className="h-80">
              <WaterfallChart
                key={`infer-${chartKey}`}
                data={productMix}
                showValues
                showGrid
                animation={showAnimation}
              />
            </div>
          }
          code={`import { WaterfallChart } from '@/components/charts/waterfall-chart';

const productMix = [
  { label: "Q1", value: 32000, type: "total" },
  { label: "New", value: 18000 },      // inferred: increase
  { label: "Upsell", value: 9000 },    // inferred: increase
  { label: "Churn", value: -14000 },   // inferred: decrease
  { label: "Q2", value: 45000, type: "total" },
];

export function ProductMixChart() {
  return <WaterfallChart data={productMix} showValues showGrid />;
}`}
        />

        {/* Horizontal orientation */}
        <ExampleShowcase
          title="Horizontal Orientation"
          description="A horizontal budget breakdown — useful when step labels are long or you have many steps"
          preview={
            <div className="h-80">
              <WaterfallChart
                key={`horizontal-${chartKey}`}
                data={budgetBreakdown}
                orientation="horizontal"
                showConnectors
                showValues
                showGrid
                animation={showAnimation}
              />
            </div>
          }
          code={`import { WaterfallChart } from '@/components/charts/waterfall-chart';

export function BudgetBreakdown() {
  return (
    <WaterfallChart
      data={budgetBreakdown}
      orientation="horizontal"
      showConnectors
      showValues
      showGrid
    />
  );
}`}
        />

        {/* Custom colors */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Custom Colors</h3>
            <p className="text-sm text-muted-foreground">
              Override any of the three bar types via the <code className="bg-muted px-1.5 py-0.5 rounded">colors</code> prop
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium mb-1">Default</p>
              <p className="text-xs text-muted-foreground mb-2">green / red / blue</p>
              <div className="h-64">
                <WaterfallChart
                  key={`colors-default-${chartKey}`}
                  data={budgetBreakdown}
                  height={256}
                  showValues
                  animation={showAnimation}
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Custom</p>
              <p className="text-xs text-muted-foreground mb-2">
                <code className="bg-muted px-1.5 py-0.5 rounded">{`colors={{ increase: '#8b5cf6', decrease: '#f59e0b', total: '#0ea5e9' }}`}</code>
              </p>
              <div className="h-64">
                <WaterfallChart
                  key={`colors-custom-${chartKey}`}
                  data={budgetBreakdown}
                  colors={{ increase: "#8b5cf6", decrease: "#f59e0b", total: "#0ea5e9" }}
                  height={256}
                  showValues
                  animation={showAnimation}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chart States */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Chart States</h3>
            <p className="text-sm text-muted-foreground">
              Built-in loading, error, and empty states
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium mb-3">Loading</p>
              <div className="h-64">
                <WaterfallChart key={`loading-${chartKey}`} data={quarterlyCashFlow} height={256} loading />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Error</p>
              <div className="h-64">
                <WaterfallChart
                  key={`error-${chartKey}`}
                  data={quarterlyCashFlow}
                  error="Network connection failed"
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Empty</p>
              <div className="h-64">
                <WaterfallChart key={`empty-${chartKey}`} data={[]} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Reference */}
      <APIReference
        title="API Reference"
        description="Complete TypeScript interface with all available props and configurations."
        props={waterfallChartProps}
      />
    </div>
  );
}
