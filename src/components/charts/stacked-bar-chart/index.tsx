"use client";

import * as React from "react";
import { memo, useMemo, useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../../lib/utils";

// Types
type ChartDataItem = Record<string, unknown>;

interface StackedBarChartProps<T extends ChartDataItem> {
  readonly data: readonly T[];
  readonly x: keyof T;
  readonly y: readonly (keyof T)[];
  readonly colors?: readonly string[];
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly variant?: 'filled' | 'outline';
  readonly orientation?: 'vertical' | 'horizontal';
  readonly showLegend?: boolean;
  readonly onSegmentClick?: (data: T, stackKey: string, index: number) => void;
}

interface StackSegment {
  readonly key: string;
  readonly value: number;
  readonly formattedValue: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly color: string;
  readonly stackIndex: number;
}

interface ProcessedBar<T> {
  readonly data: T;
  readonly barIndex: number;
  readonly label: string;
  readonly segments: readonly StackSegment[];
  readonly totalValue: number;
  readonly formattedTotal: string;
}

// Constants
const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
] as const;

const DEFAULT_HEIGHT = 300;
const MARGIN = { top: 10, right: 15, bottom: 25, left: 25 };

// Utilities
/**
 * Format numeric values with K/M suffixes for better readability
 */
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

/**
 * Safely extract numeric values from data, handling strings with currency symbols, etc.
 */
function getNumericValue(data: ChartDataItem, key: keyof ChartDataItem): number {
  const value = data[key];
  if (typeof value === 'number' && isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[,$%\s]/g, ''));
    return isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/**
 * Custom hook to track container dimensions with ResizeObserver
 */
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

// Loading State Component
function LoadingState({
  orientation = 'vertical',
  variant = 'filled',
  height = DEFAULT_HEIGHT
}: {
  orientation?: 'vertical' | 'horizontal';
  variant?: 'filled' | 'outline';
  height?: number;
}) {
  const isVertical = orientation === 'vertical';

  return (
    <div className="relative w-full" style={{ height }}>
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-full max-w-full">
          <div className="animate-pulse bg-muted rounded h-4 w-32 mb-4" />

          <div
            className="relative border-l border-b border-muted/30"
            style={{
              height: height - MARGIN.top - MARGIN.bottom - 50,
              marginLeft: MARGIN.left,
              marginRight: MARGIN.right,
              marginBottom: MARGIN.bottom,
            }}
          >
            {/* Stacked bars skeleton */}
            <div className={`flex ${isVertical ? 'items-end space-x-2 h-full' : 'flex-col justify-center space-y-2 w-full'}`}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex ${isVertical ? 'flex-col' : 'flex-row'}`}
                  style={isVertical ? { width: 40 } : { height: 40 }}
                >
                  {/* Stacked segments */}
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className={`${variant === 'filled' ? 'bg-muted' : 'border-2 border-muted'} rounded-sm animate-pulse`}
                      style={isVertical
                        ? { height: 30 + (j * 10), width: '100%', animationDelay: `${(i * 3 + j) * 0.1}s` }
                        : { width: 40 + (j * 15), height: '100%', animationDelay: `${(i * 3 + j) * 0.1}s` }
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error State Component
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

// Empty State Component
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
function StackedBarChartComponent<T extends ChartDataItem>({
  data,
  x,
  y,
  colors = DEFAULT_COLORS,
  className,
  height = DEFAULT_HEIGHT,
  loading = false,
  error = null,
  animation = true,
  variant = 'filled',
  orientation = 'vertical',
  showLegend = false,
  onSegmentClick,
}: StackedBarChartProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const chartWidth = Math.max(0, containerWidth - MARGIN.left - MARGIN.right);
  const chartHeight = height - MARGIN.top - MARGIN.bottom;

  /**
   * Process data to calculate stacked bar positions and dimensions
   * Handles both vertical (bottom-up) and horizontal (left-right) orientations
   */
  const processedBars = useMemo(() => {
    if (!data.length || chartWidth <= 0 || chartHeight <= 0) return [];

    const isVertical = orientation === 'vertical';
    const barCount = data.length;

    // Calculate bar dimensions based on orientation
    const barSize = isVertical ? chartWidth / barCount : chartHeight / barCount;
    const barSpacing = barSize * 0.2;
    const actualBarSize = barSize * 0.8;

    // Process each bar with stacked segments
    return data.map((item, barIndex) => {
      // 1. Extract values for all y-keys
      const stackValues = y.map(key => getNumericValue(item, key as string));

      // 2. Calculate total value for this bar
      const totalValue = stackValues.reduce((sum, val) => sum + val, 0);

      // 3. Calculate cumulative positions for stacking
      let cumulativeValue = 0;
      const segments: StackSegment[] = y.map((key, stackIndex) => {
        const value = stackValues[stackIndex] || 0;
        const startValue = cumulativeValue;
        cumulativeValue += value;

        if (isVertical) {
          // Vertical: stack from bottom to top
          const segmentHeight = totalValue > 0 ? (value / totalValue) * chartHeight : 0;
          const segmentY = totalValue > 0
            ? chartHeight - (cumulativeValue / totalValue) * chartHeight
            : chartHeight;

          return {
            key: String(key),
            value,
            formattedValue: formatValue(value),
            x: barIndex * barSize + barSpacing / 2,
            y: segmentY,
            width: actualBarSize,
            height: segmentHeight,
            color: colors[stackIndex % colors.length] || DEFAULT_COLORS[0],
            stackIndex,
          };
        } else {
          // Horizontal: stack from left to right
          const segmentWidth = totalValue > 0 ? (value / totalValue) * chartWidth : 0;
          const segmentX = totalValue > 0 ? (startValue / totalValue) * chartWidth : 0;

          return {
            key: String(key),
            value,
            formattedValue: formatValue(value),
            x: segmentX,
            y: barIndex * barSize + barSpacing / 2,
            width: segmentWidth,
            height: actualBarSize,
            color: colors[stackIndex % colors.length] || DEFAULT_COLORS[0],
            stackIndex,
          };
        }
      });

      return {
        data: item,
        barIndex,
        label: String(item[x]),
        segments,
        totalValue,
        formattedTotal: formatValue(totalValue),
      };
    });
  }, [data, x, y, colors, chartWidth, chartHeight, orientation]);

  // Handle loading, error, and empty states
  if (loading) return <LoadingState orientation={orientation} variant={variant} height={height} />;
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
      <svg width="100%" height={height} className="overflow-hidden" role="img" aria-label="Stacked bar chart">
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Axes - adapt to orientation */}
          {orientation === 'vertical' ? (
            <>
              {/* Y Axis */}
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={chartHeight}
                stroke="currentColor"
                opacity={0.1}
              />

              {/* X Axis - base */}
              <line
                x1={0}
                y1={chartHeight}
                x2={chartWidth}
                y2={chartHeight}
                stroke="currentColor"
                opacity={0.3}
                strokeWidth={1.5}
              />
            </>
          ) : (
            <>
              {/* Y Axis - left side */}
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={chartHeight}
                stroke="currentColor"
                opacity={0.3}
                strokeWidth={1.5}
              />

              {/* X Axis */}
              <line
                x1={0}
                y1={chartHeight}
                x2={chartWidth}
                y2={chartHeight}
                stroke="currentColor"
                opacity={0.1}
              />
            </>
          )}

          {/* Render stacked bars */}
          {processedBars.map((bar) => (
            <g key={bar.barIndex}>
              {/* Invisible hit area for outline variant - captures mouse events */}
              {variant === 'outline' && bar.segments.length > 0 && (() => {
                const firstSegment = bar.segments[0];
                const lastSegment = bar.segments[bar.segments.length - 1];
                const isVertical = orientation === 'vertical';

                return (
                  <rect
                    x={firstSegment?.x ?? 0}
                    y={isVertical ? (lastSegment?.y ?? 0) : (firstSegment?.y ?? 0)}
                    width={firstSegment?.width ?? 0}
                    height={isVertical
                      ? ((firstSegment?.y ?? 0) + (firstSegment?.height ?? 0) - (lastSegment?.y ?? 0))
                      : (firstSegment?.height ?? 0)
                    }
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredBar(bar.barIndex)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                );
              })()}

              {/* Render each segment in the stack */}
              {bar.segments.map((segment) => {
                const isFilled = variant === 'filled';
                const isVertical = orientation === 'vertical';

                const motionProps = animation ? {
                  initial: isVertical ? { scaleY: 0 } : { scaleX: 0 },
                  animate: isVertical ? { scaleY: 1 } : { scaleX: 1 },
                  transition: {
                    duration: 0.6,
                    delay: bar.barIndex * 0.05 + segment.stackIndex * 0.02,
                    ease: [0.4, 0, 0.2, 1],
                  },
                  whileHover: { opacity: 0.8 }
                } : {};

                const transformOrigin = isVertical
                  ? `${segment.x + segment.width/2}px ${segment.y + segment.height}px`
                  : `${segment.x}px ${segment.y + segment.height/2}px`;

                return (
                  <motion.rect
                    key={`${bar.barIndex}-${segment.stackIndex}`}
                    x={segment.x}
                    y={segment.y}
                    width={segment.width}
                    height={segment.height}
                    fill={isFilled ? segment.color : 'none'}
                    stroke={isFilled ? 'none' : segment.color}
                    strokeWidth={isFilled ? 0 : 2}
                    rx={2}
                    className="cursor-pointer"
                    style={{ transformOrigin, pointerEvents: isFilled ? 'auto' : 'none' }}
                    tabIndex={0}
                    role="graphics-symbol"
                    aria-label={`${segment.key}: ${segment.formattedValue}`}
                    {...motionProps}
                    onMouseEnter={() => isFilled && setHoveredBar(bar.barIndex)}
                    onMouseLeave={() => isFilled && setHoveredBar(null)}
                    onClick={() => onSegmentClick?.(bar.data, segment.key, bar.barIndex)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSegmentClick?.(bar.data, segment.key, bar.barIndex);
                      }
                    }}
                  />
                );
              })}
            </g>
          ))}

          {/* Axis labels */}
          {processedBars.map((bar) => {
            const isVertical = orientation === 'vertical';
            const firstSegment = bar.segments[0];
            if (!firstSegment) return null;

            return (
              <text
                key={`label-${bar.barIndex}`}
                x={isVertical ? firstSegment.x + firstSegment.width / 2 : -8}
                y={isVertical ? chartHeight + 15 : firstSegment.y + firstSegment.height / 2}
                textAnchor={isVertical ? "middle" : "end"}
                dominantBaseline={isVertical ? "auto" : "middle"}
                fontSize={11}
                className="fill-muted-foreground"
              >
                {bar.label}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredBar !== null && processedBars[hoveredBar] && (() => {
        const bar = processedBars[hoveredBar];
        const isVertical = orientation === 'vertical';
        const firstSegment = bar.segments[0];

        if (!firstSegment) return null;

        const tooltipStyle = isVertical ? {
          left: firstSegment.x + firstSegment.width / 2 + MARGIN.left,
          top: Math.max(10, MARGIN.top - 10),
        } : {
          left: chartWidth + MARGIN.left + 10,
          top: firstSegment.y + firstSegment.height / 2 + MARGIN.top,
        };

        return (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={`absolute pointer-events-none z-50 bg-background border rounded-lg px-3 py-2 shadow-xl ${
              isVertical ? 'transform -translate-x-1/2' : 'transform -translate-y-1/2'
            }`}
            style={tooltipStyle}
          >
            <div className="text-xs font-medium mb-2">{bar.label}</div>

            {/* Show each segment */}
            {bar.segments.map((segment) => (
              <div key={segment.key} className="flex items-center space-x-2 text-sm mb-1">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-muted-foreground">{segment.key}:</span>
                <span className="font-medium">{segment.formattedValue}</span>
              </div>
            ))}

            {/* Total */}
            <div className="border-t mt-1 pt-1 text-sm font-bold">
              Total: {bar.formattedTotal}
            </div>
          </motion.div>
        );
      })()}

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 justify-center mt-4 px-4">
          {y.map((key, index) => (
            <div key={String(key)} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: colors[index % colors.length] || DEFAULT_COLORS[0] }}
              />
              <span className="text-sm text-muted-foreground">{String(key)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const StackedBarChart = memo(StackedBarChartComponent) as <T extends ChartDataItem>(
  props: StackedBarChartProps<T>
) => React.ReactElement;

export type { ChartDataItem, StackedBarChartProps, StackSegment, ProcessedBar };
export { DEFAULT_COLORS, formatValue };
