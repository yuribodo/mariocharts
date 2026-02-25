"use client";

import { useState } from "react";
import { Breadcrumbs } from "../../../../components/site/breadcrumbs";
import { GaugeChart, type GaugeZone } from "@/src/components/charts/gauge-chart";
import { ExampleShowcase } from "../../../../components/ui/example-showcase";
import { APIReference } from "../../../../components/ui/api-reference";
import { InstallationGuide } from "../../../../components/ui/installation-guide";
import { ChartLine } from "@phosphor-icons/react";
import { StyledSelect } from "../../../../components/ui/styled-select";
import { AnimatedCheckbox } from "../../../../components/ui/animated-checkbox";

// Zone presets
const cpuZones: readonly GaugeZone[] = [
  { from: 0, to: 60, color: "#22c55e", label: "Normal" },
  { from: 60, to: 80, color: "#f59e0b", label: "High" },
  { from: 80, to: 100, color: "#ef4444", label: "Critical" },
];

const memoryZones: readonly GaugeZone[] = [
  { from: 0, to: 16, color: "#22c55e", label: "Available" },
  { from: 16, to: 24, color: "#f59e0b", label: "Pressure" },
  { from: 24, to: 32, color: "#ef4444", label: "Critical" },
];

const performanceZones: readonly GaugeZone[] = [
  { from: 0, to: 50, color: "#ef4444", label: "Poor" },
  { from: 50, to: 80, color: "#f59e0b", label: "Needs Work" },
  { from: 80, to: 100, color: "#22c55e", label: "Good" },
];

// API Reference props
const gaugeChartProps = [
  {
    name: "value",
    type: "number",
    description: "The current value to display on the gauge",
    required: true,
  },
  {
    name: "zones",
    type: "readonly GaugeZone[]",
    description: "Array of zone objects defining color regions: { from, to, color, label? }",
    required: true,
  },
  {
    name: "min",
    type: "number",
    default: "0",
    description: "Minimum value of the gauge range",
  },
  {
    name: "max",
    type: "number",
    default: "100",
    description: "Maximum value of the gauge range",
  },
  {
    name: "unit",
    type: "string",
    description: "Unit label displayed next to the center value (e.g. '%', 'GB')",
  },
  {
    name: "label",
    type: "string",
    description: "Descriptive label displayed below the center value",
  },
  {
    name: "strokeWidth",
    type: "number",
    default: "20",
    description: "Thickness of the gauge arc stroke in pixels",
  },
  {
    name: "height",
    type: "number",
    default: "300",
    description: "Height of the chart container in pixels",
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
    description: "Error message to display in place of the chart",
  },
  {
    name: "animation",
    type: "boolean",
    default: "true",
    description: "Enable entrance animation for the progress arc",
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
npx mario-charts@latest init --components gauge-chart`,
    language: "bash",
  },
  {
    title: "Add the GaugeChart component",
    description: "Install the GaugeChart component using the CLI. This automatically handles dependencies.",
    code: `# Add GaugeChart component
npx mario-charts@latest add gauge-chart

# Add multiple components at once
npx mario-charts@latest add gauge-chart bar-chart line-chart`,
    language: "bash",
  },
  {
    title: "Start using the component",
    description: "Import and use the GaugeChart in your React components.",
    code: `import { GaugeChart } from "@/components/charts/gauge-chart";

const zones = [
  { from: 0, to: 60, color: "#22c55e", label: "Normal" },
  { from: 60, to: 80, color: "#f59e0b", label: "High" },
  { from: 80, to: 100, color: "#ef4444", label: "Critical" },
];

export function CpuGauge() {
  return (
    <GaugeChart
      value={72}
      zones={zones}
      unit="%"
      label="CPU Usage"
    />
  );
}`,
    language: "tsx",
  },
];

type ZonePreset = "cpu" | "memory" | "performance";

const ZONE_PRESETS: Record<ZonePreset, { zones: readonly GaugeZone[]; max: number; unit: string; label: string }> = {
  cpu: { zones: cpuZones, max: 100, unit: "%", label: "CPU Usage" },
  memory: { zones: memoryZones, max: 32, unit: "GB", label: "Memory" },
  performance: { zones: performanceZones, max: 100, unit: "", label: "Performance Score" },
};

function ReplayButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Replay Animation
    </button>
  );
}

export function GaugeChartContent() {
  const [liveValue, setLiveValue] = useState(72);
  const [preset, setPreset] = useState<ZonePreset>("cpu");
  const [showAnimation, setShowAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);

  // Memory example controls
  const memoryValue = 20;
  const [memoryAnimation, setMemoryAnimation] = useState(true);

  // Performance example controls
  const perfValue = 85;
  const [perfAnimation, setPerfAnimation] = useState(true);

  const replayAnimation = () => {
    setChartKey((prev) => prev + 1);
  };

  const activePreset = ZONE_PRESETS[preset];

  return (
    <div className="max-w-none space-y-12">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Hero Section */}
      <div className="flex flex-col space-y-4 pb-8 pt-6">
        <div className="flex items-center space-x-3">
          <ChartLine size={24} weight="duotone" className="text-primary" />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Gauge Chart
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-7 max-w-3xl">
          A production-ready gauge chart with configurable color zones on a 3/4 arc.
          Perfect for dashboards displaying CPU, memory, scores, and any bounded metric.
          Full TypeScript support and one-command installation.
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            CLI Installation
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Configurable Zones
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            3/4 Arc Design
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Glow Effect
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
            Loading & Error States
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Reduced Motion
          </div>
        </div>
      </div>

      {/* Quick Start Example */}
      <ExampleShowcase
        title="Interactive Example"
        description="Drag the slider to update the gauge value in real time"
        preview={
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-full max-w-xs">
                <GaugeChart
                  key={chartKey}
                  value={liveValue}
                  min={0}
                  max={activePreset.max}
                  zones={activePreset.zones}
                  unit={activePreset.unit}
                  label={activePreset.label}
                  animation={showAnimation}
                  height={280}
                />
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Value</span>
                <span className="font-mono font-medium tabular-nums">
                  {liveValue}{activePreset.unit}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={activePreset.max}
                value={liveValue}
                onChange={(e) => setLiveValue(Number(e.target.value))}
                className="w-full accent-primary"
                aria-label="Gauge value"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{activePreset.max}</span>
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
                    id="gauge-animations"
                  />

                  <div className="flex items-center space-x-2 text-sm">
                    <span>Preset:</span>
                    <StyledSelect
                      value={preset}
                      onValueChange={(value) => {
                        if (value in ZONE_PRESETS) {
                          setPreset(value as ZonePreset);
                          setLiveValue(Math.round(ZONE_PRESETS[value as ZonePreset].max * 0.72));
                        }
                      }}
                      options={[
                        { value: "cpu", label: "CPU Usage" },
                        { value: "memory", label: "Memory" },
                        { value: "performance", label: "Performance" },
                      ]}
                    />
                  </div>
                </div>

                <ReplayButton onClick={replayAnimation} disabled={!showAnimation} />
              </div>
            </div>
          </div>
        }
        code={`import { GaugeChart } from '@/components/charts/gauge-chart';

const zones = [
  { from: 0, to: 60, color: "#22c55e", label: "Normal" },
  { from: 60, to: 80, color: "#f59e0b", label: "High" },
  { from: 80, to: 100, color: "#ef4444", label: "Critical" },
];

export function CpuGauge() {
  return (
    <GaugeChart
      value={72}
      min={0}
      max={100}
      zones={zones}
      unit="%"
      label="CPU Usage"
      animation={true}
    />
  );
}`}
      />

      {/* Installation */}
      <InstallationGuide
        title="Installation"
        description="Get started with the GaugeChart component in just a few steps."
        cliCommand="npx mario-charts@latest add gauge-chart"
        steps={installationSteps}
        copyPasteCode={`// Complete GaugeChart component code available after CLI installation`}
      />

      {/* Advanced Examples */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Examples</h2>
          <p className="text-muted-foreground">
            Explore different configurations and use cases for the GaugeChart component.
          </p>
        </div>

        {/* Memory Gauge */}
        <ExampleShowcase
          title="Memory Usage — GB Range"
          description="Gauge with a non-percentage range (0–32 GB) and zone labels"
          preview={
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-full max-w-xs">
                  <GaugeChart
                    key={`memory-${chartKey}`}
                    value={memoryValue}
                    min={0}
                    max={32}
                    zones={memoryZones}
                    unit="GB"
                    label="Memory"
                    animation={memoryAnimation}
                    height={280}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <AnimatedCheckbox
                      checked={memoryAnimation}
                      onChange={setMemoryAnimation}
                      label="Animations"
                      id="memory-animations"
                    />
                  </div>

                  <ReplayButton onClick={replayAnimation} disabled={!memoryAnimation} />
                </div>
              </div>
            </div>
          }
          code={`import { GaugeChart } from '@/components/charts/gauge-chart';

const memoryZones = [
  { from: 0,  to: 16, color: "#22c55e", label: "Available" },
  { from: 16, to: 24, color: "#f59e0b", label: "Pressure" },
  { from: 24, to: 32, color: "#ef4444", label: "Critical" },
];

export function MemoryGauge() {
  return (
    <GaugeChart
      value={20}
      min={0}
      max={32}
      zones={memoryZones}
      unit="GB"
      label="Memory"
    />
  );
}`}
        />

        {/* Performance Score */}
        <ExampleShowcase
          title="Performance Score — Reversed Zones"
          description="Zones ordered from worst to best — red at the low end, green at the high end"
          preview={
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-full max-w-xs">
                  <GaugeChart
                    key={`perf-${chartKey}`}
                    value={perfValue}
                    min={0}
                    max={100}
                    zones={performanceZones}
                    label="Performance Score"
                    animation={perfAnimation}
                    height={280}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <AnimatedCheckbox
                      checked={perfAnimation}
                      onChange={setPerfAnimation}
                      label="Animations"
                      id="perf-animations"
                    />
                  </div>

                  <ReplayButton onClick={replayAnimation} disabled={!perfAnimation} />
                </div>
              </div>
            </div>
          }
          code={`import { GaugeChart } from '@/components/charts/gauge-chart';

const performanceZones = [
  { from: 0,  to: 50,  color: "#ef4444", label: "Poor" },
  { from: 50, to: 80,  color: "#f59e0b", label: "Needs Work" },
  { from: 80, to: 100, color: "#22c55e", label: "Good" },
];

export function PerformanceGauge() {
  return (
    <GaugeChart
      value={85}
      min={0}
      max={100}
      zones={performanceZones}
      label="Performance Score"
    />
  );
}`}
        />

        {/* States Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Loading State</h3>
            <GaugeChart
              key={`loading-${chartKey}`}
              value={50}
              zones={cpuZones}
              loading={true}
              height={240}
            />
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Error State</h3>
            <GaugeChart
              key={`error-${chartKey}`}
              value={50}
              zones={cpuZones}
              error="Failed to fetch metric data"
              height={240}
            />
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Empty State</h3>
            <GaugeChart
              key={`empty-${chartKey}`}
              value={50}
              zones={[]}
              height={240}
            />
          </div>
        </div>
      </div>

      {/* API Reference */}
      <APIReference
        title="API Reference"
        description="Complete TypeScript interface with all available props and configurations."
        props={gaugeChartProps}
      />
    </div>
  );
}
