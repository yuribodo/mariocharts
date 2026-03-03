"use client";

import { useState } from "react";
import { Breadcrumbs } from "../../../../components/site/breadcrumbs";
import { FunnelChart } from "@/src/components/charts/funnel-chart";
import { ExampleShowcase } from "../../../../components/ui/example-showcase";
import { APIReference } from "../../../../components/ui/api-reference";
import { InstallationGuide } from "../../../../components/ui/installation-guide";
import { FunnelSimple } from "@phosphor-icons/react";
import { StyledSelect } from "../../../../components/ui/styled-select";
import { AnimatedCheckbox } from "../../../../components/ui/animated-checkbox";

// Dataset 1: E-commerce funnel
const ecommerceFunnel = [
  { stage: "Visitors", users: 50000 },
  { stage: "Product View", users: 28000 },
  { stage: "Add to Cart", users: 12000 },
  { stage: "Checkout", users: 5500 },
  { stage: "Purchase", users: 2800 },
] as const;

// Dataset 2: SaaS onboarding
const onboardingFunnel = [
  { stage: "Sign Up", users: 10000 },
  { stage: "Email Verified", users: 7200 },
  { stage: "Profile Set Up", users: 5100 },
  { stage: "First Action", users: 3400 },
  { stage: "Retained (30d)", users: 1800 },
  { stage: "Advocate", users: 620 },
] as const;

// Dataset 3: Sales pipeline (horizontal)
const salesPipeline = [
  { stage: "Leads", value: 480000 },
  { stage: "Qualified", value: 320000 },
  { stage: "Proposal", value: 190000 },
  { stage: "Negotiation", value: 120000 },
  { stage: "Closed Won", value: 72000 },
] as const;

// API Reference
const funnelProps = [
  { name: "data", type: "readonly T[]", description: "Array of data objects for each funnel stage", required: true },
  { name: "label", type: "keyof T", description: "Key for stage label text", required: true },
  { name: "value", type: "keyof T", description: "Key for numeric stage value", required: true },
  {
    name: "colors",
    type: "readonly string[]",
    default: "DEFAULT_COLORS",
    description: "Array of colors, one per stage (cycles if fewer than stages)",
  },
  {
    name: "variant",
    type: "'tapered' | 'straight' | 'horizontal'",
    default: "'tapered'",
    description: "Tapered shrinks by value ratio; straight uses uniform width; horizontal renders left-to-right chevrons",
  },
  { name: "showValues", type: "boolean", default: "true", description: "Show numeric values inside stages" },
  { name: "showPercentages", type: "boolean", default: "true", description: "Show % of total inside stages" },
  {
    name: "showConversionRates",
    type: "boolean",
    default: "false",
    description: "Show conversion rate badge between each stage",
  },
  { name: "height", type: "number", default: "400", description: "Height of the chart in pixels" },
  { name: "loading", type: "boolean", default: "false", description: "Show loading skeleton state" },
  { name: "error", type: "string | null", default: "null", description: "Error message to display" },
  { name: "animation", type: "boolean", default: "true", description: "Enable stagger entrance animation" },
  {
    name: "onClick",
    type: "(item: T, index: number) => void",
    description: "Callback when a stage is clicked",
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
    title: "Add the FunnelChart component",
    description: "Install the FunnelChart component using the CLI.",
    code: `npx mario-charts@latest add funnel-chart`,
    language: "bash",
  },
  {
    title: "Start using the component",
    description: "Import and use the FunnelChart in your React components.",
    code: `import { FunnelChart } from "@/components/charts/funnel-chart";

<FunnelChart
  data={funnelData}
  label="stage"
  value="users"
  showConversionRates
/>`,
    language: "tsx",
  },
];

export function FunnelChartContent() {
  const [variant, setVariant] = useState<"tapered" | "straight" | "horizontal">("tapered");
  const [showConversionRates, setShowConversionRates] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [showPercentages, setShowPercentages] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);

  const replay = () => setChartKey(prev => prev + 1);

  return (
    <div className="max-w-none space-y-12">
      <Breadcrumbs />

      {/* Hero */}
      <div className="flex flex-col space-y-4 pb-8 pt-6">
        <div className="flex items-center space-x-3">
          <FunnelSimple size={24} weight="duotone" className="text-primary" />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Funnel Chart
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-7 max-w-3xl">
          A production-ready funnel chart for visualizing conversion pipelines and stage-by-stage drop-off.
          Three variants — tapered, straight, and horizontal chevron — for any dashboard layout.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          {[
            "Tapered, Straight & Horizontal",
            "Conversion Rate Badges",
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

      {/* Example 1: E-commerce with controls */}
      <ExampleShowcase
        title="E-commerce Conversion Funnel"
        description="Classic conversion funnel from visitors to purchase — try all three variants and toggle conversion rate badges"
        preview={
          <div className="space-y-4">
            <div style={{ height: variant === "horizontal" ? 280 : 360 }}>
              <FunnelChart
                key={chartKey}
                data={ecommerceFunnel}
                label="stage"
                value="users"
                variant={variant}
                showValues={showValues}
                showPercentages={showPercentages}
                showConversionRates={showConversionRates}
                animation={showAnimation}
                height={variant === "horizontal" ? 280 : 360}
                colors={["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"]}
              />
            </div>
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Variant:</span>
                    <StyledSelect
                      value={variant}
                      onValueChange={v => setVariant(v as "tapered" | "straight" | "horizontal")}
                      options={[
                        { value: "tapered", label: "Tapered" },
                        { value: "straight", label: "Straight" },
                        { value: "horizontal", label: "Horizontal" },
                      ]}
                    />
                  </div>
                  <AnimatedCheckbox checked={showValues} onChange={setShowValues} label="Values" id="funnel-values" />
                  <AnimatedCheckbox checked={showPercentages} onChange={setShowPercentages} label="Percentages" id="funnel-pct" />
                  <AnimatedCheckbox checked={showConversionRates} onChange={setShowConversionRates} label="Conversion Rates" id="funnel-conv" />
                  <AnimatedCheckbox checked={showAnimation} onChange={setShowAnimation} label="Animation" id="funnel-anim" />
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
        code={`import { FunnelChart } from '@/components/charts/funnel-chart';

const ecommerceFunnel = [
  { stage: "Visitors", users: 50000 },
  { stage: "Product View", users: 28000 },
  { stage: "Add to Cart", users: 12000 },
  { stage: "Checkout", users: 5500 },
  { stage: "Purchase", users: 2800 },
];

export function EcommerceFunnel() {
  return (
    <FunnelChart
      data={ecommerceFunnel}
      label="stage"
      value="users"
      showConversionRates
      colors={["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"]}
    />
  );
}`}
      />

      <InstallationGuide
        title="Installation"
        description="Get started with the FunnelChart component in just a few steps."
        cliCommand="npx mario-charts@latest add funnel-chart"
        steps={installationSteps}
        copyPasteCode="// Complete FunnelChart component code available after CLI installation"
      />

      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Examples</h2>
          <p className="text-muted-foreground">Different use cases and configurations for the FunnelChart component.</p>
        </div>

        {/* Example 2: Horizontal bar pipeline */}
        <ExampleShowcase
          title="Sales Pipeline — Horizontal Variant"
          description="Stage-by-stage pipeline as diminishing horizontal bars — labels on the left, bars extending right"
          preview={
            <div style={{ height: 280 }}>
              <FunnelChart
                key={`pipeline-${chartKey}`}
                data={salesPipeline}
                label="stage"
                value="value"
                variant="horizontal"
                showValues
                showPercentages
                showConversionRates
                animation={showAnimation}
                height={280}
                colors={["#6366f1", "#8b5cf6", "#a855f7", "#c084fc", "#d8b4fe"]}
              />
            </div>
          }
          code={`import { FunnelChart } from '@/components/charts/funnel-chart';

const salesPipeline = [
  { stage: "Leads", value: 480000 },
  { stage: "Qualified", value: 320000 },
  { stage: "Proposal", value: 190000 },
  { stage: "Negotiation", value: 120000 },
  { stage: "Closed Won", value: 72000 },
];

export function SalesPipeline() {
  return (
    <FunnelChart
      data={salesPipeline}
      label="stage"
      value="value"
      variant="horizontal"
      showConversionRates
    />
  );
}`}
        />

        {/* Example 3: SaaS onboarding */}
        <ExampleShowcase
          title="SaaS Onboarding Flow"
          description="6-stage onboarding funnel with conversion rate badges between each step"
          preview={
            <div style={{ height: 440 }}>
              <FunnelChart
                key={`onboard-${chartKey}`}
                data={onboardingFunnel}
                label="stage"
                value="users"
                variant="tapered"
                showValues
                showPercentages
                showConversionRates
                animation={showAnimation}
                height={440}
                colors={["#6366f1", "#8b5cf6", "#a855f7", "#c084fc", "#d8b4fe", "#e9d5ff"]}
              />
            </div>
          }
          code={`import { FunnelChart } from '@/components/charts/funnel-chart';

const onboardingFunnel = [
  { stage: "Sign Up", users: 10000 },
  { stage: "Email Verified", users: 7200 },
  { stage: "Profile Set Up", users: 5100 },
  { stage: "First Action", users: 3400 },
  { stage: "Retained (30d)", users: 1800 },
  { stage: "Advocate", users: 620 },
];

export function OnboardingFunnel() {
  return (
    <FunnelChart
      data={onboardingFunnel}
      label="stage"
      value="users"
      showConversionRates
    />
  );
}`}
        />

        {/* States */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Loading State</h3>
            <div className="h-64">
              <FunnelChart data={ecommerceFunnel} label="stage" value="users" loading height={240} />
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Error State</h3>
            <div className="h-64">
              <FunnelChart data={ecommerceFunnel} label="stage" value="users" error="Failed to load data" height={240} />
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Empty State</h3>
            <div className="h-64">
              <FunnelChart data={[]} label="stage" value="users" height={240} />
            </div>
          </div>
        </div>
      </div>

      <APIReference
        title="API Reference"
        description="Complete TypeScript interface with all available props and configurations."
        props={funnelProps}
      />
    </div>
  );
}
