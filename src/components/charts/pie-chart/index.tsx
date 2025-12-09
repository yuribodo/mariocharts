"use client";

import * as React from "react";
import { memo, useMemo, useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../../lib/utils";

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

interface ProcessedSlice<T> {
  readonly data: T;
  readonly index: number;
  readonly value: number;
  readonly percentage: number;
  readonly startAngle: number;
  readonly endAngle: number;
  readonly path: string;
  readonly color: string;
  readonly labelText: string;
  readonly formattedValue: string;
  readonly midAngle: number;
}

// Constants
const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
  '#ec4899', '#84cc16', '#f97316', '#6366f1',
] as const;

const DEFAULT_HEIGHT = 300;
const DEFAULT_INNER_RADIUS = 0.6;
const PADDING = 20;
const FULL_CIRCLE_THRESHOLD = 360 - 1e-6;
const ARC_EPSILON = 1e-4;

// Utilities
function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  }
  return String(value);
}

function getNumericValue(
  data: ChartDataItem,
  key: keyof ChartDataItem,
  index?: number
): number {
  const value = data[key];

  if (typeof value === 'number') {
    if (!isFinite(value)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[PieChart] Invalid value at index ${index ?? 'unknown'}: ${value}. Using 0.`
        );
      }
      return 0;
    }
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[,$%\s]/g, ''));
    if (!isFinite(parsed)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[PieChart] Could not parse value at index ${index ?? 'unknown'}: "${value}". Using 0.`
        );
      }
      return 0;
    }
    return parsed;
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `[PieChart] Unexpected value type at index ${index ?? 'unknown'}: ${typeof value}. Using 0.`
    );
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

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number): { x: number; y: number } {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  // Handle full circle case (360 degrees) - use precise threshold for floating-point safety
  const isFullCircle = Math.abs(endAngle - startAngle) >= FULL_CIRCLE_THRESHOLD;

  if (isFullCircle) {
    // For full circle, we draw two arcs
    const midAngle = startAngle + 180;

    if (innerRadius > 0) {
      // Full donut
      const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
      const outerMid = polarToCartesian(cx, cy, outerRadius, midAngle);
      const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle - ARC_EPSILON);
      const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
      const innerMid = polarToCartesian(cx, cy, innerRadius, midAngle);
      const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle - ARC_EPSILON);

      return [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${outerRadius} ${outerRadius} 0 0 1 ${outerMid.x} ${outerMid.y}`,
        `A ${outerRadius} ${outerRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${innerRadius} ${innerRadius} 0 0 0 ${innerMid.x} ${innerMid.y}`,
        `A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}`,
        'Z'
      ].join(' ');
    } else {
      // Full pie
      const start = polarToCartesian(cx, cy, outerRadius, startAngle);
      const mid = polarToCartesian(cx, cy, outerRadius, midAngle);
      const end = polarToCartesian(cx, cy, outerRadius, endAngle - ARC_EPSILON);

      return [
        `M ${cx} ${cy}`,
        `L ${start.x} ${start.y}`,
        `A ${outerRadius} ${outerRadius} 0 0 1 ${mid.x} ${mid.y}`,
        `A ${outerRadius} ${outerRadius} 0 0 1 ${end.x} ${end.y}`,
        'Z'
      ].join(' ');
    }
  }

  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  if (innerRadius > 0) {
    // Donut slice
    const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
    const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);

    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
      'Z'
    ].join(' ');
  } else {
    // Pie slice
    return [
      `M ${cx} ${cy}`,
      `L ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
      'Z'
    ].join(' ');
  }
}

// Loading State - Circular skeleton
function LoadingState({ height = DEFAULT_HEIGHT }: { height?: number }) {
  const size = Math.min(height - PADDING * 2, 200);

  return (
    <div className="relative w-full flex items-center justify-center" style={{ height }}>
      <div
        className="rounded-full border-8 border-muted animate-pulse"
        style={{
          width: size,
          height: size,
          borderTopColor: 'hsl(var(--muted-foreground) / 0.3)',
        }}
      />
      <div
        className="absolute rounded-full bg-background"
        style={{
          width: size * 0.6,
          height: size * 0.6,
        }}
      />
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
          There&apos;s no data to display
        </div>
      </div>
    </div>
  );
}

// Main Component
function PieChartComponent<T extends ChartDataItem>({
  data,
  value,
  label,
  colors = DEFAULT_COLORS,
  className,
  height = DEFAULT_HEIGHT,
  loading = false,
  error = null,
  animation = true,
  variant = 'donut',
  innerRadius = DEFAULT_INNER_RADIUS,
  centerContent,
  onSliceClick,
}: PieChartProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate chart dimensions
  const isSemi = variant === 'semi';
  const chartSize = Math.min(containerWidth - PADDING * 2, height - PADDING * 2);
  const effectiveHeight = isSemi ? chartSize / 2 + PADDING * 2 : height;
  const cx = containerWidth / 2;
  const cy = isSemi ? chartSize / 2 + PADDING : height / 2;
  const outerRadius = chartSize / 2;
  const actualInnerRadius = variant === 'pie' ? 0 : outerRadius * innerRadius;

  // Process data into slices
  const { processedSlices, total } = useMemo(() => {
    if (!data.length || chartSize <= 0) {
      return { processedSlices: [] as ProcessedSlice<T>[], total: 0 };
    }

    // Extract and validate values
    const values = data.map((d, i) => Math.max(0, getNumericValue(d, value as string, i)));
    const totalValue = values.reduce((sum, v) => sum + v, 0);

    if (totalValue <= 0) {
      return { processedSlices: [] as ProcessedSlice<T>[], total: 0 };
    }

    // Calculate angles - for semi, we use 180 degrees, else 360
    const totalAngle = isSemi ? 180 : 360;
    const startOffset = isSemi ? -90 : -90; // Start from top

    let currentAngle = startOffset;

    const slices: ProcessedSlice<T>[] = data.map((item, index) => {
      const itemValue = values[index] ?? 0;
      const percentage = (itemValue / totalValue) * 100;
      const sliceAngle = (itemValue / totalValue) * totalAngle;

      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;

      currentAngle = endAngle;

      const path = describeArc(
        cx,
        cy,
        outerRadius,
        actualInnerRadius,
        startAngle,
        endAngle
      );

      return {
        data: item,
        index,
        value: itemValue,
        percentage,
        startAngle,
        endAngle,
        path,
        color: colors[index % colors.length] || DEFAULT_COLORS[0],
        labelText: String(item[label]),
        formattedValue: formatValue(itemValue),
        midAngle,
      };
    });

    return { processedSlices: slices, total: totalValue };
  }, [data, value, label, colors, chartSize, cx, cy, outerRadius, actualInnerRadius, isSemi]);

  // Check for negative values
  const hasNegativeValues = useMemo(() => {
    return data.some((d, i) => getNumericValue(d, value as string, i) < 0);
  }, [data, value]);

  if (loading) return <LoadingState height={height} />;
  if (error) return <ErrorState error={error} />;
  if (hasNegativeValues) {
    return <ErrorState error="Pie charts cannot display negative values" />;
  }
  if (!data.length) return <EmptyState />;

  // Wait for container to have dimensions before checking total
  if (!containerWidth) {
    return (
      <div ref={containerRef} className={cn('relative w-full', className)} style={{ height }}>
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  // Now we can safely check total since we have dimensions
  if (total <= 0) return <EmptyState />;

  const centerSize = actualInnerRadius * 2 * 0.8;

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      style={{ height: effectiveHeight }}
    >
      <svg
        width="100%"
        height={effectiveHeight}
        className="overflow-visible"
        role="img"
        aria-label={`${variant === 'pie' ? 'Pie' : variant === 'semi' ? 'Semi-circle' : 'Donut'} chart with ${data.length} segments`}
      >
        {/* Slices */}
        {processedSlices.map((slice) => {
          const isHovered = hoveredIndex === slice.index;

          const motionProps = animation ? {
            initial: { scale: 0, opacity: 0 },
            animate: {
              scale: isHovered ? 1.03 : 1,
              opacity: 1,
            },
            transition: {
              scale: { duration: 0.2 },
              opacity: { duration: 0.5, delay: slice.index * 0.05 },
            },
          } : {
            style: { transform: isHovered ? 'scale(1.03)' : 'scale(1)' }
          };

          return (
            <motion.path
              key={slice.index}
              d={slice.path}
              fill={slice.color}
              stroke="hsl(var(--background))"
              strokeWidth={2}
              className="cursor-pointer outline-none"
              style={{ transformOrigin: `${cx}px ${cy}px` }}
              onMouseEnter={() => setHoveredIndex(slice.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSliceClick?.(slice.data, slice.index)}
              role="graphics-symbol"
              aria-label={`${slice.labelText}: ${slice.formattedValue} (${slice.percentage.toFixed(1)}%)`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSliceClick?.(slice.data, slice.index);
                }
              }}
              onFocus={() => setHoveredIndex(slice.index)}
              onBlur={() => setHoveredIndex(null)}
              {...motionProps}
            />
          );
        })}

        {/* Center content for donut and semi variants */}
        {(variant === 'donut' || variant === 'semi') && centerContent && actualInnerRadius > 0 && (() => {
          // For semi-circle, position center content in the visible arc area (above the flat edge)
          // Move it up by ~40% of inner radius to center it in the curved portion
          const centerY = isSemi
            ? cy - centerSize / 2 - actualInnerRadius * 0.4
            : cy - centerSize / 2;

          return (
            <foreignObject
              x={cx - centerSize / 2}
              y={centerY}
              width={centerSize}
              height={centerSize}
              className="pointer-events-none"
            >
              <div className="w-full h-full flex items-center justify-center">
                {typeof centerContent === 'function'
                  ? centerContent({ total, items: data })
                  : centerContent}
              </div>
            </foreignObject>
          );
        })()}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && processedSlices[hoveredIndex] && (() => {
        const slice = processedSlices[hoveredIndex];
        const tooltipPoint = polarToCartesian(
          cx,
          cy,
          outerRadius * 0.7,
          slice.midAngle
        );

        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute pointer-events-none z-50 bg-background border rounded-lg px-3 py-2 shadow-xl transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: tooltipPoint.x,
              top: tooltipPoint.y,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-xs font-medium whitespace-nowrap">
                {slice.labelText}
              </span>
            </div>
            <div className="text-sm font-bold text-primary text-center mt-1">
              {slice.formattedValue}
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {slice.percentage.toFixed(1)}%
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}

export const PieChart = memo(PieChartComponent);
export type { ChartDataItem, PieChartProps };
export { DEFAULT_COLORS, formatValue };
