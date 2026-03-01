"use client";

import { useState } from "react";
import { Breadcrumbs } from "../../../../components/site/breadcrumbs";
import { HeatmapChart } from "@/src/components/charts/heatmap";
import { ExampleShowcase } from "../../../../components/ui/example-showcase";
import { APIReference } from "../../../../components/ui/api-reference";
import { InstallationGuide } from "../../../../components/ui/installation-guide";
import { GridFour } from "@phosphor-icons/react";
import { StyledSelect } from "../../../../components/ui/styled-select";
import { AnimatedCheckbox } from "../../../../components/ui/animated-checkbox";
import type { ColorScheme, HeatmapVariant } from "@/src/components/charts/heatmap";

// Dataset 1: Temperature by hour × day (grid)
const temperatureData = (() => {
  const hours = ["6am", "9am", "12pm", "3pm", "6pm", "9pm"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const baseTemps = [16, 18, 20, 19, 17, 22, 23];
  const hourMultiplier = [0.8, 0.9, 1.1, 1.15, 1.0, 0.85];
  return days.flatMap((day, di) =>
    hours.map((hour, hi) => ({
      day,
      hour,
      temp: Math.round(baseTemps[di]! * hourMultiplier[hi]!),
    }))
  );
})();

// Dataset 2: Traffic by hour × day (radial)
const trafficData = (() => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}h`);
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return hours.flatMap((hour, hi) =>
    weekdays.map((day, di) => ({
      hour,
      day,
      traffic: Math.round(
        Math.abs(Math.sin((hi * Math.PI) / 12)) * 100 *
        (di < 5 ? 1 : 0.5) *
        (hi >= 8 && hi <= 18 ? 1 : 0.3) + (hi * di) % 15
      ),
    }))
  );
})();

// Dataset 3: Stock market heatmap (S&P 500 sectors)
const stockData = [
  { name: "Apple",       change:  3.21, marketCap: 2780 },
  { name: "Microsoft",   change:  1.87, marketCap: 2490 },
  { name: "Nvidia",      change:  6.44, marketCap: 1820 },
  { name: "Amazon",      change: -2.10, marketCap: 1750 },
  { name: "Alphabet",    change:  0.95, marketCap: 1640 },
  { name: "Meta",        change:  4.32, marketCap: 1210 },
  { name: "Tesla",       change: -5.67, marketCap:  780 },
  { name: "Berkshire",   change:  0.41, marketCap:  860 },
  { name: "Broadcom",    change:  2.88, marketCap:  720 },
  { name: "JPMorgan",    change: -0.73, marketCap:  580 },
  { name: "Visa",        change:  1.12, marketCap:  520 },
  { name: "ExxonMobil",  change: -1.44, marketCap:  490 },
  { name: "UnitedHealth",change:  0.28, marketCap:  460 },
  { name: "Johnson",     change: -0.55, marketCap:  380 },
  { name: "Walmart",     change:  2.01, marketCap:  420 },
  { name: "Mastercard",  change:  1.34, marketCap:  395 },
  { name: "P&G",         change: -0.18, marketCap:  360 },
  { name: "ASML",        change:  3.77, marketCap:  310 },
  { name: "Netflix",     change:  7.22, marketCap:  290 },
  { name: "AMD",         change:  5.90, marketCap:  240 },
  { name: "Costco",      change:  0.63, marketCap:  345 },
  { name: "Oracle",      change:  2.15, marketCap:  350 },
  { name: "Salesforce",  change: -1.82, marketCap:  245 },
  { name: "Adobe",       change: -3.10, marketCap:  210 },
] as const;

// API Reference
const heatmapProps = [
  { name: "data", type: "readonly T[]", description: "Array of data objects", required: true },
  { name: "x", type: "keyof T", description: "Column / angular axis / stock label key", required: true },
  { name: "y", type: "keyof T", description: "Row / ring axis key (not used for stock)", required: true },
  { name: "value", type: "keyof T", description: "Numeric value key — color intensity for grid/radial, % change for stock", required: true },
  { name: "weight", type: "keyof T", description: "Area weight key for stock treemap (e.g. marketCap). Defaults to equal area." },
  {
    name: "variant",
    type: "'grid' | 'radial' | 'stock'",
    default: "'grid'",
    description: "grid: standard with cross-highlight; radial: polar clock rings; stock: treemap sized by weight",
  },
  {
    name: "colorScheme",
    type: "'blue' | 'green' | 'amber' | 'purple' | 'diverging'",
    default: "'blue'",
    description: "Built-in color scheme. Stock variant uses red/green regardless unless colorFrom/colorTo are set.",
  },
  { name: "colorFrom", type: "string", description: "Override low-value color (hex). For stock: overrides the negative/red end." },
  { name: "colorTo", type: "string", description: "Override high-value color (hex). For stock: overrides the positive/green end." },
  { name: "showLabels", type: "boolean", default: "true", description: "Show axis labels" },
  { name: "showLegend", type: "boolean", default: "false", description: "Show color legend swatch" },
  { name: "cellRadius", type: "number", default: "4", description: "Cell border radius in pixels (grid variant)" },
  { name: "height", type: "number", default: "320", description: "Height of the chart in pixels" },
  { name: "loading", type: "boolean", default: "false", description: "Show loading skeleton state" },
  { name: "error", type: "string | null", default: "null", description: "Error message to display" },
  { name: "animation", type: "boolean", default: "true", description: "Enable entrance animation" },
  {
    name: "onClick",
    type: "(item: T, colLabel: string, rowLabel: string) => void",
    description: "Callback on cell click",
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
    title: "Add the HeatmapChart component",
    description: "Install the HeatmapChart component using the CLI.",
    code: `npx mario-charts@latest add heatmap`,
    language: "bash",
  },
  {
    title: "Start using the component",
    description: "Import and use HeatmapChart in your components.",
    code: `import { HeatmapChart } from "@/components/charts/heatmap";

<HeatmapChart
  data={stockData}
  x="name"
  y="name"
  value="change"
  weight="marketCap"
  variant="stock"
  showLegend
/>`,
    language: "tsx",
  },
];

export function HeatmapContent() {
  const [variant, setVariant] = useState<HeatmapVariant>("grid");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("amber");
  const [showLabels, setShowLabels] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);

  const replay = () => setChartKey(prev => prev + 1);

  // Dataset for interactive example
  const isStock = variant === "stock";
  const isRadial = variant === "radial";
  const activeH = isRadial ? 360 : isStock ? 340 : 280;

  return (
    <div className="max-w-none space-y-12">
      <Breadcrumbs />

      {/* Hero */}
      <div className="flex flex-col space-y-4 pb-8 pt-6">
        <div className="flex items-center space-x-3">
          <GridFour size={24} weight="duotone" className="text-primary" />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Heatmap Chart
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-7 max-w-3xl">
          Three powerful heatmap variants — grid with crosshair highlight, radial polar clock, and a stock-market treemap
          where cell size encodes market cap and color encodes price change.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          {[
            "Grid + Cross-Highlight",
            "Radial / Polar Clock",
            "Stock Treemap",
            "Color Interpolation",
            "Color Legend",
            "Responsive",
            "TypeScript",
          ].map(f => (
            <div key={f} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Example 1: Interactive — all 3 variants */}
      <ExampleShowcase
        title="Three Variants — Switch Live"
        description="Grid, Radial, and Stock with different datasets — all from the same component"
        preview={
          <div className="space-y-4">
            <div style={{ height: activeH }}>
              {isStock ? (
                <HeatmapChart
                  key={`${chartKey}-${variant}`}
                  data={stockData}
                  x="name"
                  y="name"
                  value="change"
                  weight="marketCap"
                  variant="stock"
                  colorScheme={colorScheme}
                  showLabels={showLabels}
                  showLegend={showLegend}
                  animation={showAnimation}
                  height={activeH}
                />
              ) : isRadial ? (
                <HeatmapChart
                  key={`${chartKey}-${variant}`}
                  data={trafficData}
                  x="hour"
                  y="day"
                  value="traffic"
                  variant="radial"
                  colorScheme={colorScheme}
                  showLabels={showLabels}
                  showLegend={showLegend}
                  animation={showAnimation}
                  height={activeH}
                />
              ) : (
                <HeatmapChart
                  key={`${chartKey}-${variant}`}
                  data={temperatureData}
                  x="hour"
                  y="day"
                  value="temp"
                  variant="grid"
                  colorScheme={colorScheme}
                  showLabels={showLabels}
                  showLegend={showLegend}
                  animation={showAnimation}
                  height={activeH}
                />
              )}
            </div>
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Variant:</span>
                    <StyledSelect
                      value={variant}
                      onValueChange={v => {
                        setVariant(v as HeatmapVariant);
                        if (v === "stock") setColorScheme("diverging");
                        else if (v === "radial") setColorScheme("blue");
                        else setColorScheme("amber");
                      }}
                      options={[
                        { value: "grid", label: "Grid" },
                        { value: "radial", label: "Radial" },
                        { value: "stock", label: "Stock" },
                      ]}
                    />
                  </div>
                  {variant !== "stock" && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>Color:</span>
                      <StyledSelect
                        value={colorScheme}
                        onValueChange={v => setColorScheme(v as ColorScheme)}
                        options={[
                          { value: "amber", label: "Amber" },
                          { value: "blue", label: "Blue" },
                          { value: "green", label: "Green" },
                          { value: "purple", label: "Purple" },
                          { value: "diverging", label: "Diverging" },
                        ]}
                      />
                    </div>
                  )}
                  {variant !== "stock" && (
                    <AnimatedCheckbox checked={showLabels} onChange={setShowLabels} label="Labels" id="heatmap-labels" />
                  )}
                  <AnimatedCheckbox checked={showLegend} onChange={setShowLegend} label="Legend" id="heatmap-legend" />
                  <AnimatedCheckbox checked={showAnimation} onChange={setShowAnimation} label="Animation" id="heatmap-anim" />
                </div>
                <button
                  onClick={replay}
                  disabled={!showAnimation}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  Replay
                </button>
              </div>
            </div>
          </div>
        }
        code={`import { HeatmapChart } from '@/components/charts/heatmap';

// Grid
<HeatmapChart data={data} x="hour" y="day" value="temp" variant="grid" colorScheme="amber" showLegend />

// Radial
<HeatmapChart data={data} x="hour" y="day" value="traffic" variant="radial" showLegend />

// Stock treemap
<HeatmapChart data={stocks} x="name" y="name" value="change" weight="marketCap" variant="stock" showLegend />`}
      />

      <InstallationGuide
        title="Installation"
        description="Get started with the HeatmapChart component in just a few steps."
        cliCommand="npx mario-charts@latest add heatmap"
        steps={installationSteps}
        copyPasteCode="// Complete HeatmapChart component code available after CLI installation"
      />

      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Examples</h2>
          <p className="text-muted-foreground">Dedicated examples for each variant.</p>
        </div>

        {/* Example 2: Stock treemap */}
        <ExampleShowcase
          title="Stock Market Treemap"
          description="Cell area = market cap, color = daily % change. Negative red, positive green — just like Finviz."
          preview={
            <div style={{ height: 360 }}>
              <HeatmapChart
                key={`stock-${chartKey}`}
                data={stockData}
                x="name"
                y="name"
                value="change"
                weight="marketCap"
                variant="stock"
                showLegend
                height={360}
                animation={showAnimation}
              />
            </div>
          }
          code={`import { HeatmapChart } from '@/components/charts/heatmap';

const stockData = [
  { name: "Apple",   change:  3.21, marketCap: 2780 },
  { name: "Nvidia",  change:  6.44, marketCap: 1820 },
  { name: "Amazon",  change: -2.10, marketCap: 1750 },
  { name: "Tesla",   change: -5.67, marketCap:  780 },
  // ...
];

<HeatmapChart
  data={stockData}
  x="name"
  y="name"
  value="change"
  weight="marketCap"
  variant="stock"
  showLegend
  height={360}
/>`}
        />

        {/* Example 3: Radial */}
        <ExampleShowcase
          title="Radial / Polar Clock — Hourly Traffic"
          description="Cyclical patterns rendered as concentric rings. Each angle = hour, each ring = day of week."
          preview={
            <div style={{ height: 380 }}>
              <HeatmapChart
                key={`radial-${chartKey}`}
                data={trafficData}
                x="hour"
                y="day"
                value="traffic"
                variant="radial"
                colorScheme="blue"
                showLegend
                height={380}
                animation={showAnimation}
              />
            </div>
          }
          code={`import { HeatmapChart } from '@/components/charts/heatmap';

// x = angular segments (hours), y = concentric rings (days)
<HeatmapChart
  data={trafficData}
  x="hour"
  y="day"
  value="traffic"
  variant="radial"
  colorScheme="blue"
  showLegend
  height={380}
/>`}
        />

        {/* Example 4: Grid cross-highlight */}
        <ExampleShowcase
          title="Grid — Cross-Highlight on Hover"
          description="Hover any cell to see its entire row and column dim — a crosshair effect not found in standard chart libraries."
          preview={
            <div style={{ height: 280 }}>
              <HeatmapChart
                key={`grid-${chartKey}`}
                data={temperatureData}
                x="hour"
                y="day"
                value="temp"
                variant="grid"
                colorScheme="amber"
                showLegend
                height={280}
                animation={showAnimation}
              />
            </div>
          }
          code={`import { HeatmapChart } from '@/components/charts/heatmap';

// Hover any cell → row + column dim to 30% opacity (crosshair effect)
<HeatmapChart
  data={temperatureData}
  x="hour"
  y="day"
  value="temp"
  variant="grid"
  colorScheme="amber"
  showLegend
/>`}
        />

        {/* States */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Loading State</h3>
            <div className="h-56">
              <HeatmapChart data={temperatureData} x="hour" y="day" value="temp" loading height={210} />
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Error State</h3>
            <div className="h-56">
              <HeatmapChart data={temperatureData} x="hour" y="day" value="temp" error="Failed to load data" height={210} />
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Empty State</h3>
            <div className="h-56">
              <HeatmapChart data={[]} x="hour" y="day" value="temp" height={210} />
            </div>
          </div>
        </div>
      </div>

      <APIReference
        title="API Reference"
        description="Complete TypeScript interface with all available props and configurations."
        props={heatmapProps}
      />
    </div>
  );
}
