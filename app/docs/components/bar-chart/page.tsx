"use client";

import { useState } from "react";
import { Breadcrumbs } from "../../../../components/site/breadcrumbs";
import { BarChart } from "@/src/components/charts/bar-chart";
import { ExampleShowcase } from "../../../../components/ui/example-showcase";
import { APIReference } from "../../../../components/ui/api-reference";
import { InstallationGuide } from "../../../../components/ui/installation-guide";
import { cn } from "@/lib/utils";
import { Graph } from "@phosphor-icons/react";

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
    name: "className",
    type: "string",
    description: "Additional CSS classes to apply to the container"
  }
];

// Installation steps
const installationSteps = [
  {
    title: "Install dependencies",
    description: "Add the required peer dependencies to your project.",
    code: `npm install framer-motion clsx tailwind-merge
# or
yarn add framer-motion clsx tailwind-merge
# or  
pnpm add framer-motion clsx tailwind-merge`,
    language: "bash"
  },
  {
    title: "Copy the component",
    description: "Copy and paste the BarChart component into your project.",
    code: `// Copy this entire component to your project
// File: components/ui/bar-chart.tsx`,
    language: "bash"
  },
  {
    title: "Update import paths",
    description: "Make sure the import path matches your project structure.",
    code: `import { BarChart } from "@/components/ui/bar-chart";`,
    language: "tsx"
  }
];

export default function BarChartPage() {
  const [selectedBar, setSelectedBar] = useState<any>(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);
  
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
          Perfect TypeScript support, advanced animations, and copy-paste installation.
        </p>
        
        {/* Features */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Copy-Paste Ready
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            CSS Variables
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
                onBarClick={(data, index) => {
                  setSelectedBar(data);
                  console.log('Clicked:', data, index);
                }}
                animation={showAnimation}
              />
            </div>
            
            {/* Interactive feedback */}
            <div className="p-3 bg-muted/50 rounded-lg border text-sm">
              <div className="font-medium">
                Selected: {selectedBar ? `${selectedBar.month} - $${selectedBar.revenue.toLocaleString()}` : 'Click a bar to select'}
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between pt-2 border-t">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showAnimation}
                  onChange={(e) => setShowAnimation(e.target.checked)}
                  className="rounded"
                />
                <span>Animations</span>
              </label>
              
              <button
                onClick={replayAnimation}
                disabled={!showAnimation}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Replay Animation
              </button>
            </div>
          </div>
        }
        code={`import { BarChart } from '@/components/ui/bar-chart';

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
      onBarClick={(data, index) => {
        setSelectedBar(data);
        console.log('Clicked:', data, index);
      }}
      animation={true}
    />
  );
}`}
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
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">Product Sales - Custom Theme</h3>
            <p className="text-sm text-muted-foreground">
              Custom colors, axis labels, and value formatting
            </p>
          </div>
          
          <div className="h-80 mb-4">
            <BarChart
              key={`advanced-${chartKey}`}
              data={productSales}
              x="product"
              y="sales"
              colors={['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']}
            />
          </div>
          
          {/* Controls for product sales */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Custom theme with product sales data • Advanced tooltips
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

        {/* Large Dataset with Performance */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">Large Dataset Performance</h3>
            <p className="text-sm text-muted-foreground">
              50 data points with smooth performance and animations
            </p>
          </div>
          
          <div className="h-80 mb-4">
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
            />
          </div>
          
          {/* Controls for large dataset */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Large dataset with 50 data points • Smooth animations
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

        {/* States Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Loading State</h3>
            <div className="h-56 mb-3">
              <BarChart
                key={`loading-${chartKey}`}
                data={monthlyRevenue}
                x="month"
                y="revenue"
                loading={true}
              />
            </div>
            <button
              onClick={replayAnimation}
              disabled={!showAnimation}
              className="w-full inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Replay Animation
            </button>
          </div>
          
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Error State</h3>
            <div className="h-56 mb-3">
              <BarChart
                key={`error-${chartKey}`}
                data={monthlyRevenue}
                x="month"
                y="revenue"
                error="Network connection failed"
              />
            </div>
            <button
              onClick={replayAnimation}
              disabled={!showAnimation}
              className="w-full inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
              Replay Animation
            </button>
          </div>
          
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Empty State</h3>
            <div className="h-56 mb-3">
              <BarChart
                key={`empty-${chartKey}`}
                data={[]}
                x="month"
                y="revenue"
              />
            </div>
            <button
              onClick={replayAnimation}
              disabled={!showAnimation}
              className="w-full inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* Installation */}
      <InstallationGuide
        title="Installation"
        description="Get started with the BarChart component in just a few steps."
        cliCommand="npx mario-charts@latest add bar-chart"
        steps={installationSteps}
        copyPasteCode={`"use client";

import * as React from "react";
import { memo, useMemo, useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Types
type ChartDataItem = Record<string, unknown>;

interface BarChartProps<T extends ChartDataItem> {
  readonly data: readonly T[];
  readonly x: keyof T;
  readonly y?: keyof T;
  readonly colors?: readonly string[];
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly onBarClick?: (data: T, index: number) => void;
}

// Constants
const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
] as const;

const DEFAULT_HEIGHT = 300;
const MARGIN = { top: 5, right: 10, bottom: 20, left: 30 };

// Utilities
function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    if (Math.abs(value) >= 1000000) {
      return \`\${(value / 1000000).toFixed(1)}M\`;
    } else if (Math.abs(value) >= 1000) {
      return \`\${(value / 1000).toFixed(1)}K\`;
    }
    return value.toLocaleString();
  }
  return String(value);
}

function getNumericValue(data: ChartDataItem, key: keyof ChartDataItem): number {
  const value = data[key];
  if (typeof value === 'number' && isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[,$%\\s]/g, ''));
    return isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function useContainerDimensions() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const updateWidth = () => {
      setWidth(element.getBoundingClientRect().width);
    };
    
    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(element);
    
    return () => resizeObserver.disconnect();
  }, []);
  
  return [ref, width] as const;
}

// Loading/Error States
function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="space-y-3">
        <div className="animate-pulse bg-muted rounded h-4 w-32" />
        <div className="flex space-x-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted rounded w-8 animate-pulse"
              style={{ height: 40 + (i * 12) }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-2">
        <div className="text-destructive font-medium">Chart Error</div>
        <div className="text-sm text-muted-foreground">{error}</div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-2">
        <div className="text-muted-foreground">No Data</div>
        <div className="text-sm text-muted-foreground">
          There's no data to display
        </div>
      </div>
    </div>
  );
}

// Main Component
function BarChartComponent<T extends ChartDataItem>({
  data,
  x,
  y = 'value' as keyof T,
  colors = DEFAULT_COLORS,
  className,
  height = DEFAULT_HEIGHT,
  loading = false,
  error = null,
  animation = true,
  onBarClick,
}: BarChartProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const chartWidth = Math.max(0, containerWidth - MARGIN.left - MARGIN.right);
  const chartHeight = height - MARGIN.top - MARGIN.bottom;
  
  const processedBars = useMemo(() => {
    if (!data.length || chartWidth <= 0 || chartHeight <= 0) return [];
    
    // 1. Extrair valores numéricos
    const values = data.map(d => getNumericValue(d, y as string));
    const maxValue = Math.max(...values);
    
    // 2. Se todos os valores são 0 ou negativos, usar altura 0
    if (maxValue <= 0) {
      return data.map((item, index) => ({
        data: item,
        index,
        x: (index + 0.1) * (chartWidth / data.length),
        y: chartHeight, // Sempre na base
        width: (chartWidth / data.length) * 0.8,
        height: 0,
        color: colors[index % colors.length] || DEFAULT_COLORS[0],
        label: String(item[x]),
        value: formatValue(values[index]),
        rawValue: values[index]
      }));
    }
    
    // 3. Processar barras normalmente
    return data.map((item, index) => {
      const value = values[index] || 0;
      const normalizedHeight = Math.max(0, (value / maxValue) * chartHeight);
      
      return {
        data: item,
        index,
        x: (index + 0.1) * (chartWidth / data.length),
        y: chartHeight - normalizedHeight,
        width: (chartWidth / data.length) * 0.8,
        height: normalizedHeight,
        color: colors[index % colors.length] || DEFAULT_COLORS[0],
        label: String(item[x]),
        value: formatValue(value),
        rawValue: value
      };
    });
  }, [data, x, y, colors, chartWidth, chartHeight]);
  
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!data.length) return <EmptyState />;
  
  if (!containerWidth) {
    return (
      <div ref={containerRef} className={cn('relative w-full', className)} style={{ height }}>
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }
  
  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      style={{ height }}
    >
      <svg width="100%" height={height} className="overflow-visible">
        <g transform={\`translate(\${MARGIN.left}, \${MARGIN.top})\`}>
          {/* Eixo Y */}
          <line 
            x1={0} 
            y1={0} 
            x2={0} 
            y2={chartHeight} 
            stroke="currentColor" 
            opacity={0.1} 
          />
          
          {/* Eixo X - SEMPRE na base */}
          <line 
            x1={0} 
            y1={chartHeight} 
            x2={chartWidth} 
            y2={chartHeight} 
            stroke="currentColor" 
            opacity={0.3} 
            strokeWidth={1.5}
          />
          
          {/* Barras */}
          {processedBars.map((bar) => {
            const motionProps = animation ? {
              initial: { scaleY: 0 },
              animate: { scaleY: 1 },
              transition: {
                duration: 0.6,
                delay: bar.index * 0.05,
                ease: [0.4, 0, 0.2, 1],
              },
              whileHover: { opacity: 0.8 }
            } : {};
            
            return (
              <motion.rect
                key={bar.index}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill={bar.color}
                rx={4}
                className="cursor-pointer"
                style={{ 
                  transformOrigin: \`\${bar.x + bar.width/2}px \${bar.y + bar.height}px\`
                }}
                {...motionProps}
                onMouseEnter={() => setHoveredIndex(bar.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onBarClick?.(bar.data, bar.index)}
              />
            );
          })}
          
          {/* Labels do eixo X */}
          {processedBars.map((bar) => (
            <text
              key={\`label-\${bar.index}\`}
              x={bar.x + bar.width / 2}
              y={chartHeight + 10}
              textAnchor="middle"
              fontSize={11}
              className="fill-muted-foreground"
            >
              {bar.label}
            </text>
          ))}
        </g>
      </svg>
      
      {/* Tooltip */}
      {hoveredIndex !== null && processedBars[hoveredIndex] && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute pointer-events-none z-50 bg-background border rounded-lg px-3 py-2 shadow-xl transform -translate-x-1/2"
          style={{
            left: processedBars[hoveredIndex].x + processedBars[hoveredIndex].width / 2 + MARGIN.left,
            top: Math.max(10, processedBars[hoveredIndex].y + MARGIN.top - 55),
          }}
        >
          <div className="text-xs font-medium text-center whitespace-nowrap">
            {processedBars[hoveredIndex].label}
          </div>
          <div className="text-sm font-bold text-primary text-center">
            {processedBars[hoveredIndex].value}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export const BarChart = memo(BarChartComponent);
export type { ChartDataItem, BarChartProps };
export { DEFAULT_COLORS, formatValue };`}
      />
    </div>
  );
}