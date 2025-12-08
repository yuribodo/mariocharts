"use client";

import { useState } from "react";
import { Breadcrumbs } from "../../../../components/site/breadcrumbs";
import { PieChart } from "@/src/components/charts/pie-chart";
import { ExampleShowcase } from "../../../../components/ui/example-showcase";
import { APIReference } from "../../../../components/ui/api-reference";
import { InstallationGuide } from "../../../../components/ui/installation-guide";
import { ChartPie } from "@phosphor-icons/react";
import { StyledSelect } from "../../../../components/ui/styled-select";
import { AnimatedCheckbox } from "../../../../components/ui/animated-checkbox";

// Sample data sets
const marketShare = [
  { company: "Apple", share: 28.5 },
  { company: "Samsung", share: 23.1 },
  { company: "Xiaomi", share: 12.8 },
  { company: "Oppo", share: 9.2 },
  { company: "Vivo", share: 8.4 },
  { company: "Others", share: 18.0 }
];

const taskStatus = [
  { status: "Completed", count: 45 },
  { status: "In Progress", count: 28 },
  { status: "Pending", count: 15 },
  { status: "Blocked", count: 7 }
];

const budgetBreakdown = [
  { category: "Engineering", amount: 450000 },
  { category: "Marketing", amount: 280000 },
  { category: "Sales", amount: 320000 },
  { category: "Operations", amount: 180000 },
  { category: "HR", amount: 120000 }
];

const progressData = [
  { segment: "Achieved", value: 73 },
  { segment: "Remaining", value: 27 }
];

// API Reference data
const pieChartProps = [
  {
    name: "data",
    type: "readonly T[]",
    description: "Array of data objects to display in the chart",
    required: true
  },
  {
    name: "value",
    type: "keyof T",
    description: "Key from data object to use for slice values",
    required: true
  },
  {
    name: "label",
    type: "keyof T",
    description: "Key from data object to use for slice labels",
    required: true
  },
  {
    name: "variant",
    type: "'pie' | 'donut' | 'semi'",
    default: "'donut'",
    description: "Visual style - classic pie, donut with center hole, or semi-circle gauge"
  },
  {
    name: "innerRadius",
    type: "number",
    default: "0.6",
    description: "Inner radius as percentage of outer radius (0-1). Only applies to donut/semi variants"
  },
  {
    name: "centerContent",
    type: "ReactNode | ((data) => ReactNode)",
    description: "Content to display in the center of donut/semi charts. Can be a static element or render function"
  },
  {
    name: "colors",
    type: "readonly string[]",
    default: "DEFAULT_COLORS",
    description: "Array of colors to use for slices"
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
    description: "Show loading state with circular skeleton"
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
    name: "onSliceClick",
    type: "(data: T, index: number) => void",
    description: "Callback fired when a slice is clicked"
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
npx mario-charts@latest init --components pie-chart`,
    language: "bash"
  },
  {
    title: "Add the PieChart component",
    description: "Install the PieChart component using the CLI. This automatically handles dependencies.",
    code: `# Add PieChart component
npx mario-charts@latest add pie-chart

# Add multiple components at once
npx mario-charts@latest add pie-chart bar-chart line-chart`,
    language: "bash"
  },
  {
    title: "Start using the component",
    description: "Import and use the PieChart in your React components.",
    code: `import { PieChart } from "@/components/charts/pie-chart";

// Use in your component
<PieChart
  data={data}
  value="amount"
  label="category"
  variant="donut"
/>`,
    language: "tsx"
  }
];

export default function PieChartPage() {
  const [selectedSlice, setSelectedSlice] = useState<Record<string, unknown> | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);
  const [variant, setVariant] = useState<'pie' | 'donut' | 'semi'>('donut');

  // Controls for Budget example
  const [budgetVariant, setBudgetVariant] = useState<'pie' | 'donut' | 'semi'>('donut');
  const [budgetAnimation, setBudgetAnimation] = useState(true);

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
          <ChartPie size={24} weight="duotone" className="text-primary" />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Pie Chart
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-7 max-w-3xl">
          A beautiful, accessible pie and donut chart component with native center content support,
          smooth animations, and keyboard navigation. Perfect for visualizing proportions and distributions.
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Pie, Donut & Semi-circle
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Center Content API
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Smooth Animations
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Keyboard Navigation
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            TypeScript
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Responsive
          </div>
        </div>
      </div>

      {/* Quick Start Example */}
      <ExampleShowcase
        title="Basic Example"
        description="A donut chart showing market share data with click interactions and center content"
        preview={
          <div className="space-y-4">
            <div className="h-80">
              <PieChart
                key={chartKey}
                data={marketShare}
                value="share"
                label="company"
                variant={variant}
                onSliceClick={(data, index) => {
                  setSelectedSlice(data);
                  console.log('Clicked:', data, index);
                }}
                animation={showAnimation}
                centerContent={({ total }) => (
                  <div className="text-center">
                    <div className="text-2xl font-bold">{total.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Market Share</div>
                  </div>
                )}
              />
            </div>

            {/* Interactive feedback */}
            <div className="p-3 bg-muted/50 rounded-lg border text-sm">
              <div className="font-medium">
                Selected: {selectedSlice ? `${selectedSlice.company} - ${selectedSlice.share}%` : 'Click a slice to select'}
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
                      onValueChange={(value) => setVariant(value as 'pie' | 'donut' | 'semi')}
                      options={[
                        { value: 'pie', label: 'Pie' },
                        { value: 'donut', label: 'Donut' },
                        { value: 'semi', label: 'Semi-circle' }
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
        code={`import { PieChart } from '@/components/charts/pie-chart';

const marketShare = [
  { company: "Apple", share: 28.5 },
  { company: "Samsung", share: 23.1 },
  { company: "Xiaomi", share: 12.8 },
  { company: "Oppo", share: 9.2 },
  { company: "Vivo", share: 8.4 },
  { company: "Others", share: 18.0 }
];

export function MarketShareChart() {
  const [selected, setSelected] = useState(null);

  return (
    <PieChart
      data={marketShare}
      value="share"
      label="company"
      variant="donut"
      onSliceClick={(data, index) => {
        setSelected(data);
        console.log('Clicked:', data, index);
      }}
      centerContent={({ total }) => (
        <div className="text-center">
          <div className="text-2xl font-bold">{total.toFixed(0)}%</div>
          <div className="text-xs text-muted-foreground">Market Share</div>
        </div>
      )}
    />
  );
}`}
      />

      {/* Installation */}
      <InstallationGuide
        title="Installation"
        description="Get started with the PieChart component in just a few steps."
        cliCommand="npx mario-charts@latest add pie-chart"
        steps={installationSteps}
        copyPasteCode={`"use client";

import * as React from "react";
import { memo, useMemo, useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Types
type ChartDataItem = Record<string, unknown>;

interface PieChartProps<T extends ChartDataItem> {
  readonly data: readonly T[];
  readonly value: keyof T;
  readonly label: keyof T;
  readonly colors?: readonly string[];
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly variant?: 'pie' | 'donut' | 'semi';
  readonly innerRadius?: number;
  readonly centerContent?: React.ReactNode | ((data: { total: number; items: readonly T[] }) => React.ReactNode);
  readonly onSliceClick?: (data: T, index: number) => void;
}

// Constants
const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
  '#ec4899', '#84cc16', '#f97316', '#6366f1',
] as const;

const DEFAULT_HEIGHT = 300;
const DEFAULT_INNER_RADIUS = 0.6;
const PADDING = 20;

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

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(cx: number, cy: number, outerRadius: number, innerRadius: number, startAngle: number, endAngle: number): string {
  const isFullCircle = Math.abs(endAngle - startAngle) >= 359.99;

  if (isFullCircle) {
    const midAngle = startAngle + 180;
    if (innerRadius > 0) {
      const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
      const outerMid = polarToCartesian(cx, cy, outerRadius, midAngle);
      const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle - 0.01);
      const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
      const innerMid = polarToCartesian(cx, cy, innerRadius, midAngle);
      const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle - 0.01);
      return \`M \${outerStart.x} \${outerStart.y} A \${outerRadius} \${outerRadius} 0 0 1 \${outerMid.x} \${outerMid.y} A \${outerRadius} \${outerRadius} 0 0 1 \${outerEnd.x} \${outerEnd.y} L \${innerEnd.x} \${innerEnd.y} A \${innerRadius} \${innerRadius} 0 0 0 \${innerMid.x} \${innerMid.y} A \${innerRadius} \${innerRadius} 0 0 0 \${innerStart.x} \${innerStart.y} Z\`;
    } else {
      const start = polarToCartesian(cx, cy, outerRadius, startAngle);
      const mid = polarToCartesian(cx, cy, outerRadius, midAngle);
      const end = polarToCartesian(cx, cy, outerRadius, endAngle - 0.01);
      return \`M \${cx} \${cy} L \${start.x} \${start.y} A \${outerRadius} \${outerRadius} 0 0 1 \${mid.x} \${mid.y} A \${outerRadius} \${outerRadius} 0 0 1 \${end.x} \${end.y} Z\`;
    }
  }

  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  if (innerRadius > 0) {
    const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
    const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
    return \`M \${outerStart.x} \${outerStart.y} A \${outerRadius} \${outerRadius} 0 \${largeArcFlag} 1 \${outerEnd.x} \${outerEnd.y} L \${innerEnd.x} \${innerEnd.y} A \${innerRadius} \${innerRadius} 0 \${largeArcFlag} 0 \${innerStart.x} \${innerStart.y} Z\`;
  } else {
    return \`M \${cx} \${cy} L \${outerStart.x} \${outerStart.y} A \${outerRadius} \${outerRadius} 0 \${largeArcFlag} 1 \${outerEnd.x} \${outerEnd.y} Z\`;
  }
}

// Loading/Error/Empty States
function LoadingState({ height = DEFAULT_HEIGHT }: { height?: number }) {
  const size = Math.min(height - PADDING * 2, 200);
  return (
    <div className="relative w-full flex items-center justify-center" style={{ height }}>
      <div className="rounded-full border-8 border-muted animate-pulse" style={{ width: size, height: size, borderTopColor: 'hsl(var(--muted-foreground) / 0.3)' }} />
      <div className="absolute rounded-full bg-background" style={{ width: size * 0.6, height: size * 0.6 }} />
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
        <div className="text-sm text-muted-foreground">There's no data to display</div>
      </div>
    </div>
  );
}

// Main Component
function PieChartComponent<T extends ChartDataItem>({
  data, value, label, colors = DEFAULT_COLORS, className, height = DEFAULT_HEIGHT,
  loading = false, error = null, animation = true, variant = 'donut',
  innerRadius = DEFAULT_INNER_RADIUS, centerContent, onSliceClick,
}: PieChartProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isSemi = variant === 'semi';
  const chartSize = Math.min(containerWidth - PADDING * 2, height - PADDING * 2);
  const effectiveHeight = isSemi ? chartSize / 2 + PADDING * 2 : height;
  const cx = containerWidth / 2;
  const cy = isSemi ? chartSize / 2 + PADDING : height / 2;
  const outerRadius = chartSize / 2;
  const actualInnerRadius = variant === 'pie' ? 0 : outerRadius * innerRadius;

  const { processedSlices, total } = useMemo(() => {
    if (!data.length || chartSize <= 0) return { processedSlices: [], total: 0 };
    const values = data.map(d => Math.max(0, getNumericValue(d, value as string)));
    const totalValue = values.reduce((sum, v) => sum + v, 0);
    if (totalValue <= 0) return { processedSlices: [], total: 0 };

    const totalAngle = isSemi ? 180 : 360;
    let currentAngle = -90;

    const slices = data.map((item, index) => {
      const itemValue = values[index] ?? 0;
      const percentage = (itemValue / totalValue) * 100;
      const sliceAngle = (itemValue / totalValue) * totalAngle;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;
      currentAngle = endAngle;

      return {
        data: item, index, value: itemValue, percentage, startAngle, endAngle,
        path: describeArc(cx, cy, outerRadius, actualInnerRadius, startAngle, endAngle),
        color: colors[index % colors.length] || DEFAULT_COLORS[0],
        labelText: String(item[label]), formattedValue: formatValue(itemValue), midAngle,
      };
    });

    return { processedSlices: slices, total: totalValue };
  }, [data, value, label, colors, chartSize, cx, cy, outerRadius, actualInnerRadius, isSemi]);

  const hasNegativeValues = useMemo(() => data.some(d => getNumericValue(d, value as string) < 0), [data, value]);

  if (loading) return <LoadingState height={height} />;
  if (error) return <ErrorState error={error} />;
  if (hasNegativeValues) return <ErrorState error="Pie charts cannot display negative values" />;
  if (!data.length || total <= 0) return <EmptyState />;

  if (!containerWidth) {
    return <div ref={containerRef} className={cn('relative w-full', className)} style={{ height }}><div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading...</div></div>;
  }

  const centerSize = actualInnerRadius * 2 * 0.8;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)} style={{ height: effectiveHeight }}>
      <svg width="100%" height={effectiveHeight} className="overflow-visible" role="img" aria-label={\`\${variant} chart with \${data.length} segments\`}>
        {processedSlices.map((slice) => {
          const isHovered = hoveredIndex === slice.index;
          const motionProps = animation ? {
            initial: { scale: 0, opacity: 0 },
            animate: { scale: isHovered ? 1.03 : 1, opacity: 1 },
            transition: { scale: { duration: 0.2 }, opacity: { duration: 0.5, delay: slice.index * 0.05 } },
          } : { style: { transform: isHovered ? 'scale(1.03)' : 'scale(1)' } };

          return (
            <motion.path key={slice.index} d={slice.path} fill={slice.color} stroke="hsl(var(--background))" strokeWidth={2}
              className="cursor-pointer outline-none" style={{ transformOrigin: \`\${cx}px \${cy}px\` }}
              onMouseEnter={() => setHoveredIndex(slice.index)} onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSliceClick?.(slice.data, slice.index)} role="graphics-symbol"
              aria-label={\`\${slice.labelText}: \${slice.formattedValue} (\${slice.percentage.toFixed(1)}%)\`}
              tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSliceClick?.(slice.data, slice.index); }}}
              onFocus={() => setHoveredIndex(slice.index)} onBlur={() => setHoveredIndex(null)} {...motionProps}
            />
          );
        })}

        {(variant === 'donut' || variant === 'semi') && centerContent && actualInnerRadius > 0 && (
          <foreignObject x={cx - centerSize / 2} y={cy - centerSize / 2} width={centerSize} height={centerSize} className="pointer-events-none">
            <div className="w-full h-full flex items-center justify-center">
              {typeof centerContent === 'function' ? centerContent({ total, items: data }) : centerContent}
            </div>
          </foreignObject>
        )}
      </svg>

      {hoveredIndex !== null && processedSlices[hoveredIndex] && (() => {
        const slice = processedSlices[hoveredIndex];
        const tooltipPoint = polarToCartesian(cx, cy, outerRadius * 0.7, slice.midAngle);
        return (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="absolute pointer-events-none z-50 bg-background border rounded-lg px-3 py-2 shadow-xl transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: tooltipPoint.x, top: tooltipPoint.y }}>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: slice.color }} />
              <span className="text-xs font-medium whitespace-nowrap">{slice.labelText}</span></div>
            <div className="text-sm font-bold text-primary text-center mt-1">{slice.formattedValue}</div>
            <div className="text-xs text-muted-foreground text-center">{slice.percentage.toFixed(1)}%</div>
          </motion.div>
        );
      })()}
    </div>
  );
}

export const PieChart = memo(PieChartComponent);
export type { ChartDataItem, PieChartProps };
export { DEFAULT_COLORS, formatValue };`}
      />

      {/* Variants Comparison */}
      <ExampleShowcase
        title="Variants Comparison"
        description="Compare all three chart variants: classic pie, donut with center content, and semi-circle gauge"
        preview={
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-center">Pie</h4>
              <PieChart
                data={taskStatus}
                value="count"
                label="status"
                variant="pie"
                height={200}
              />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-center">Donut</h4>
              <PieChart
                data={taskStatus}
                value="count"
                label="status"
                variant="donut"
                height={200}
                centerContent={({ total }) => (
                  <div className="text-center">
                    <div className="text-xl font-bold">{total}</div>
                    <div className="text-xs text-muted-foreground">Tasks</div>
                  </div>
                )}
              />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-center">Semi-circle</h4>
              <PieChart
                data={progressData}
                value="value"
                label="segment"
                variant="semi"
                height={200}
                colors={['#22c55e', '#e5e7eb']}
                centerContent={({ items }) => (
                  <div className="text-center">
                    <div className="text-xl font-bold">{items[0]?.value as number}%</div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </div>
                )}
              />
            </div>
          </div>
        }
        code={`// Pie Chart - Classic style
<PieChart
  data={taskStatus}
  value="count"
  label="status"
  variant="pie"
/>

// Donut Chart - With center content
<PieChart
  data={taskStatus}
  value="count"
  label="status"
  variant="donut"
  centerContent={({ total }) => (
    <div className="text-center">
      <div className="text-xl font-bold">{total}</div>
      <div className="text-xs text-muted-foreground">Tasks</div>
    </div>
  )}
/>

// Semi-circle - Gauge style
<PieChart
  data={progressData}
  value="value"
  label="segment"
  variant="semi"
  colors={['#22c55e', '#e5e7eb']}
  centerContent={({ items }) => (
    <div className="text-center">
      <div className="text-xl font-bold">{items[0]?.value}%</div>
      <div className="text-xs text-muted-foreground">Complete</div>
    </div>
  )}
/>`}
      />

      {/* Center Content Example */}
      <ExampleShowcase
        title="Custom Center Content"
        description="The centerContent prop accepts either a ReactNode or a render function that receives the total and all items"
        preview={
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-center">Static Content</h4>
              <PieChart
                data={budgetBreakdown}
                value="amount"
                label="category"
                variant="donut"
                height={250}
                centerContent={
                  <div className="text-center">
                    <div className="text-lg font-bold">Budget</div>
                    <div className="text-xs text-muted-foreground">2024 Q1</div>
                  </div>
                }
              />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-center">Dynamic Content</h4>
              <PieChart
                data={budgetBreakdown}
                value="amount"
                label="category"
                variant="donut"
                height={250}
                centerContent={({ total }) => (
                  <div className="text-center">
                    <div className="text-lg font-bold">${(total / 1000000).toFixed(2)}M</div>
                    <div className="text-xs text-muted-foreground">Total Budget</div>
                  </div>
                )}
              />
            </div>
          </div>
        }
        code={`// Static ReactNode
<PieChart
  data={budgetBreakdown}
  value="amount"
  label="category"
  variant="donut"
  centerContent={
    <div className="text-center">
      <div className="text-lg font-bold">Budget</div>
      <div className="text-xs text-muted-foreground">2024 Q1</div>
    </div>
  }
/>

// Render function with data access
<PieChart
  data={budgetBreakdown}
  value="amount"
  label="category"
  variant="donut"
  centerContent={({ total }) => (
    <div className="text-center">
      <div className="text-lg font-bold">
        \${(total / 1000000).toFixed(2)}M
      </div>
      <div className="text-xs text-muted-foreground">Total Budget</div>
    </div>
  )}
/>`}
      />

      {/* Budget Breakdown Example */}
      <ExampleShowcase
        title="Budget Breakdown"
        description="A complete budget visualization with custom colors and interactive controls"
        preview={
          <div className="space-y-4">
            <div className="h-80">
              <PieChart
                data={budgetBreakdown}
                value="amount"
                label="category"
                variant={budgetVariant}
                animation={budgetAnimation}
                colors={['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']}
                centerContent={budgetVariant !== 'pie' ? ({ total }) => (
                  <div className="text-center">
                    <div className="text-xl font-bold">${(total / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                ) : undefined}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-6 pt-2 border-t">
              <AnimatedCheckbox
                checked={budgetAnimation}
                onChange={setBudgetAnimation}
                label="Animations"
                id="budget-animations"
              />

              <div className="flex items-center space-x-2 text-sm">
                <span>Variant:</span>
                <StyledSelect
                  value={budgetVariant}
                  onValueChange={(value) => setBudgetVariant(value as 'pie' | 'donut' | 'semi')}
                  options={[
                    { value: 'pie', label: 'Pie' },
                    { value: 'donut', label: 'Donut' },
                    { value: 'semi', label: 'Semi-circle' }
                  ]}
                />
              </div>
            </div>
          </div>
        }
        code={`const budgetBreakdown = [
  { category: "Engineering", amount: 450000 },
  { category: "Marketing", amount: 280000 },
  { category: "Sales", amount: 320000 },
  { category: "Operations", amount: 180000 },
  { category: "HR", amount: 120000 }
];

<PieChart
  data={budgetBreakdown}
  value="amount"
  label="category"
  variant="donut"
  colors={['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']}
  centerContent={({ total }) => (
    <div className="text-center">
      <div className="text-xl font-bold">\${(total / 1000).toFixed(0)}K</div>
      <div className="text-xs text-muted-foreground">Total</div>
    </div>
  )}
/>`}
      />

      {/* States Demo */}
      <ExampleShowcase
        title="Chart States"
        description="Built-in handling for loading, error, and empty states"
        preview={
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-center">Loading</h4>
              <div className="border rounded-lg p-4">
                <PieChart
                  data={[]}
                  value="amount"
                  label="category"
                  loading={true}
                  height={200}
                />
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-center">Error</h4>
              <div className="border rounded-lg p-4">
                <PieChart
                  data={[]}
                  value="amount"
                  label="category"
                  error="Failed to load chart data"
                  height={200}
                />
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-center">Empty</h4>
              <div className="border rounded-lg p-4">
                <PieChart
                  data={[]}
                  value="amount"
                  label="category"
                  height={200}
                />
              </div>
            </div>
          </div>
        }
        code={`// Loading state
<PieChart
  data={[]}
  value="amount"
  label="category"
  loading={true}
/>

// Error state
<PieChart
  data={[]}
  value="amount"
  label="category"
  error="Failed to load chart data"
/>

// Empty state (no data)
<PieChart
  data={[]}
  value="amount"
  label="category"
/>`}
      />

      {/* API Reference */}
      <APIReference
        title="API Reference"
        description="Complete reference for all PieChart props"
        props={pieChartProps}
      />
    </div>
  );
}
