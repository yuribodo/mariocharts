"use client";

import * as React from "react";
import { memo, useMemo, useState, useRef, useCallback } from "react";
import { useIsomorphicLayoutEffect } from "../../../../lib/hooks";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "../../../../lib/utils";

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
  readonly variant?: 'filled' | 'outline';
  readonly orientation?: 'vertical' | 'horizontal';
  readonly showGrid?: boolean;
  readonly gridStyle?: 'solid' | 'dashed' | 'dotted';
  readonly onBarClick?: (data: T, index: number) => void;
}

// Constants
const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
] as const;

const DEFAULT_HEIGHT = 300;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };
const ANIMATION_EASING = [0.4, 0, 0.2, 1] as const;
const HOVER_DURATION = 0.2;

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

function getNumericValue(data: ChartDataItem, key: keyof ChartDataItem): number {
  const value = data[key];
  if (typeof value === 'number' && isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[,$%\s]/g, ''));
    if (isFinite(parsed)) return parsed;
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[BarChart] Could not parse value "${value}" for key "${String(key)}". Using 0.`);
    }
  }
  if (process.env.NODE_ENV === 'development' && value !== null && value !== undefined) {
    console.warn(`[BarChart] Unexpected value type for key "${String(key)}": ${typeof value}. Using 0.`);
  }
  return 0;
}

function calculateNiceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const range = max - min;
  const roughStep = range / (count - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalizedStep = roughStep / magnitude;
  let niceStep: number;
  if (normalizedStep <= 1) niceStep = magnitude;
  else if (normalizedStep <= 2) niceStep = 2 * magnitude;
  else if (normalizedStep <= 5) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;
  const niceMin = Math.floor(min / niceStep) * niceStep;
  const niceMax = Math.ceil(max / niceStep) * niceStep;
  const ticks: number[] = [];
  for (let tick = niceMin; tick <= niceMax; tick += niceStep) {
    ticks.push(tick);
  }
  return ticks;
}

function getGridDasharray(gridStyle: 'solid' | 'dashed' | 'dotted'): string {
  switch (gridStyle) {
    case 'solid': return 'none';
    case 'dotted': return '2 4';
    case 'dashed':
    default: return '4 4';
  }
}

function useContainerDimensions() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useIsomorphicLayoutEffect(() => {
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
  const isFilled = variant === 'filled';

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
            <div className={`flex ${isVertical ? 'items-end space-x-2 h-full' : 'flex-col justify-center space-y-2 w-full'}`}>
              {Array.from({ length: 5 }).map((_, i) => {
                const barSize = isVertical
                  ? { width: 32, height: 40 + (i * 20) }
                  : { width: 60 + (i * 30), height: 24 };

                return (
                  <div
                    key={i}
                    className={`${isFilled ? 'bg-muted' : 'border-2 border-muted bg-transparent'} rounded animate-pulse`}
                    style={{
                      width: barSize.width,
                      height: barSize.height,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                );
              })}
            </div>
            <div className={`absolute ${isVertical ? 'bottom-0 left-0 right-0 flex justify-around mt-2' : 'left-0 top-0 bottom-0 flex flex-col justify-around -ml-8'}`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`label-${i}`}
                  className="animate-pulse bg-muted rounded h-3 w-8"
                  style={{ animationDelay: `${(i + 5) * 0.1}s` }}
                />
              ))}
            </div>
          </div>
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
          There&apos;s no data to display
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
  variant = 'filled',
  orientation = 'vertical',
  showGrid = false,
  gridStyle = 'dashed',
  onBarClick,
}: BarChartProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const reduceMotion = useReducedMotion();
  const shouldAnimate = animation && !reduceMotion;

  const chartWidth = Math.max(0, containerWidth - MARGIN.left - MARGIN.right);
  const chartHeight = height - MARGIN.top - MARGIN.bottom;

  // Dev warning for large datasets
  if (process.env.NODE_ENV === 'development' && data.length > 50) {
    console.warn(
      `[BarChart] ${data.length} data points detected. Consider pagination or a different visualization for large datasets.`
    );
  }

  // Extract value domain for grid/ticks
  const valueDomain = useMemo(() => {
    if (!data.length) return { min: 0, max: 0 };
    const values = data.map(d => getNumericValue(d, y as string));
    const maxValue = Math.max(...values, 0);
    return { min: 0, max: maxValue };
  }, [data, y]);

  const yTicks = useMemo(() => {
    if (valueDomain.max <= 0) return [];
    return calculateNiceTicks(0, valueDomain.max, 5);
  }, [valueDomain]);

  const gridDasharray = useMemo(() => getGridDasharray(gridStyle), [gridStyle]);

  const processedBars = useMemo(() => {
    if (!data.length || chartWidth <= 0 || chartHeight <= 0) return [];

    const values = data.map(d => getNumericValue(d, y as string));
    const maxValue = valueDomain.max;

    const isVertical = orientation === 'vertical';
    const barCount = data.length;

    const barSize = isVertical ? chartWidth / barCount : chartHeight / barCount;
    const barSpacing = barSize * 0.2;
    const actualBarSize = barSize * 0.8;

    if (maxValue <= 0) {
      return data.map((item, index) => ({
        data: item,
        index,
        x: isVertical ? index * barSize + barSpacing / 2 : 0,
        y: isVertical ? chartHeight : index * barSize + barSpacing / 2,
        width: isVertical ? actualBarSize : 0,
        height: isVertical ? 0 : actualBarSize,
        color: colors[index % colors.length] || DEFAULT_COLORS[0],
        label: String(item[x]),
        value: formatValue(values[index]),
        rawValue: values[index]
      }));
    }

    // Use niceMax from ticks for consistent scaling with grid
    const scaleMax = yTicks.length > 0 ? Math.max(...yTicks) : maxValue;

    return data.map((item, index) => {
      const value = values[index] || 0;

      if (isVertical) {
        const normalizedHeight = Math.max(0, (value / scaleMax) * chartHeight);
        return {
          data: item,
          index,
          x: index * barSize + barSpacing / 2,
          y: chartHeight - normalizedHeight,
          width: actualBarSize,
          height: normalizedHeight,
          color: colors[index % colors.length] || DEFAULT_COLORS[0],
          label: String(item[x]),
          value: formatValue(value),
          rawValue: value
        };
      } else {
        const normalizedWidth = Math.max(0, (value / scaleMax) * chartWidth);
        return {
          data: item,
          index,
          x: 0,
          y: index * barSize + barSpacing / 2,
          width: normalizedWidth,
          height: actualBarSize,
          color: colors[index % colors.length] || DEFAULT_COLORS[0],
          label: String(item[x]),
          value: formatValue(value),
          rawValue: value
        };
      }
    });
  }, [data, x, y, colors, chartWidth, chartHeight, orientation, valueDomain, yTicks]);

  // Event handlers with useCallback
  const handleBarMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index);
  }, []);

  const handleBarMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const handleBarClick = useCallback((barData: T, index: number) => {
    onBarClick?.(barData, index);
  }, [onBarClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, barData: T, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onBarClick?.(barData, index);
    }
  }, [onBarClick]);

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

  const isVertical = orientation === 'vertical';
  const scaleMax = yTicks.length > 0 ? Math.max(...yTicks) : valueDomain.max;

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      style={{ height }}
    >
      <svg
        width="100%"
        height={height}
        className="overflow-visible"
        role="img"
        aria-label={`Bar chart with ${data.length} bars in ${orientation} orientation`}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Grid lines */}
          {showGrid && isVertical && scaleMax > 0 && yTicks.map((tick, i) => {
            const tickY = chartHeight - (tick / scaleMax) * chartHeight;
            return (
              <line
                key={`grid-h-${i}`}
                x1={0}
                y1={tickY}
                x2={chartWidth}
                y2={tickY}
                stroke="currentColor"
                opacity={0.1}
                strokeDasharray={gridDasharray}
              />
            );
          })}
          {showGrid && !isVertical && scaleMax > 0 && yTicks.map((tick, i) => {
            const tickX = (tick / scaleMax) * chartWidth;
            return (
              <line
                key={`grid-v-${i}`}
                x1={tickX}
                y1={0}
                x2={tickX}
                y2={chartHeight}
                stroke="currentColor"
                opacity={0.1}
                strokeDasharray={gridDasharray}
              />
            );
          })}

          {/* Axes */}
          {isVertical ? (
            <>
              <line
                x1={0} y1={0} x2={0} y2={chartHeight}
                stroke="currentColor" opacity={0.3} strokeWidth={1.5}
              />
              <line
                x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight}
                stroke="currentColor" opacity={0.3} strokeWidth={1.5}
              />
            </>
          ) : (
            <>
              <line
                x1={0} y1={0} x2={0} y2={chartHeight}
                stroke="currentColor" opacity={0.3} strokeWidth={1.5}
              />
              <line
                x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight}
                stroke="currentColor" opacity={0.1}
              />
            </>
          )}

          {/* Y-axis ticks and labels (vertical) / X-axis ticks and labels (horizontal) */}
          {isVertical && scaleMax > 0 && yTicks.map((tick, i) => {
            const tickY = chartHeight - (tick / scaleMax) * chartHeight;
            return (
              <g key={`y-tick-${i}`}>
                <line x1={-4} y1={tickY} x2={0} y2={tickY} stroke="currentColor" opacity={0.3} />
                <text
                  x={-8}
                  y={tickY}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  className="fill-muted-foreground"
                >
                  {formatValue(tick)}
                </text>
              </g>
            );
          })}
          {!isVertical && scaleMax > 0 && yTicks.map((tick, i) => {
            const tickX = (tick / scaleMax) * chartWidth;
            return (
              <g key={`x-tick-${i}`}>
                <line x1={tickX} y1={chartHeight} x2={tickX} y2={chartHeight + 4} stroke="currentColor" opacity={0.3} />
                <text
                  x={tickX}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  fontSize={11}
                  className="fill-muted-foreground"
                >
                  {formatValue(tick)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {processedBars.map((bar) => {
            const isFilled = variant === 'filled';
            const isHovered = hoveredIndex === bar.index;

            const motionProps = shouldAnimate ? {
              initial: isVertical ? { scaleY: 0 } : { scaleX: 0 },
              animate: isVertical ? { scaleY: 1 } : { scaleX: 1 },
              transition: {
                duration: 0.6,
                delay: bar.index * 0.05,
                ease: ANIMATION_EASING,
              },
            } : {};

            const transformOrigin = isVertical
              ? `${bar.x + bar.width/2}px ${bar.y + bar.height}px`
              : `${bar.x}px ${bar.y + bar.height/2}px`;

            return (
              <g key={bar.index}>
                {/* Invisible hit area for outline variant */}
                {!isFilled && (
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    fill="transparent"
                    className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    tabIndex={0}
                    role="graphics-symbol"
                    aria-label={`${bar.label}: ${bar.value}`}
                    onMouseEnter={() => handleBarMouseEnter(bar.index)}
                    onMouseLeave={handleBarMouseLeave}
                    onFocus={() => handleBarMouseEnter(bar.index)}
                    onBlur={handleBarMouseLeave}
                    onClick={() => handleBarClick(bar.data, bar.index)}
                    onKeyDown={(e) => handleKeyDown(e, bar.data, bar.index)}
                  />
                )}

                {/* Visible bar */}
                <motion.rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  fill={isFilled ? bar.color : 'none'}
                  stroke={isFilled ? 'none' : bar.color}
                  strokeWidth={isFilled ? 0 : 2}
                  rx={4}
                  className={cn(
                    isFilled
                      ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      : "pointer-events-none"
                  )}
                  style={{
                    transformOrigin,
                    filter: isHovered ? `drop-shadow(0 0 6px ${bar.color})` : 'none',
                    transition: `filter ${HOVER_DURATION}s ease-out`,
                  }}
                  {...motionProps}
                  {...(isFilled && {
                    tabIndex: 0,
                    role: "graphics-symbol" as const,
                    "aria-label": `${bar.label}: ${bar.value}`,
                    onMouseEnter: () => handleBarMouseEnter(bar.index),
                    onMouseLeave: handleBarMouseLeave,
                    onFocus: () => handleBarMouseEnter(bar.index),
                    onBlur: handleBarMouseLeave,
                    onClick: () => handleBarClick(bar.data, bar.index),
                    onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, bar.data, bar.index),
                  })}
                />
              </g>
            );
          })}

          {/* X-axis labels (vertical) / Y-axis labels (horizontal) */}
          {processedBars.map((bar) => (
            <g key={`label-group-${bar.index}`}>
              {/* Tick mark */}
              {isVertical ? (
                <line
                  x1={bar.x + bar.width / 2}
                  y1={chartHeight}
                  x2={bar.x + bar.width / 2}
                  y2={chartHeight + 4}
                  stroke="currentColor"
                  opacity={0.3}
                />
              ) : (
                <line
                  x1={-4}
                  y1={bar.y + bar.height / 2}
                  x2={0}
                  y2={bar.y + bar.height / 2}
                  stroke="currentColor"
                  opacity={0.3}
                />
              )}
              <text
                x={isVertical ? bar.x + bar.width / 2 : -8}
                y={isVertical ? chartHeight + 16 : bar.y + bar.height / 2}
                textAnchor={isVertical ? "middle" : "end"}
                dominantBaseline={isVertical ? "auto" : "middle"}
                fontSize={11}
                className="fill-muted-foreground"
              >
                {bar.label}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredIndex !== null && processedBars[hoveredIndex] && (() => {
          const bar = processedBars[hoveredIndex];

          const tooltipStyle = isVertical ? {
            left: bar.x + bar.width / 2 + MARGIN.left,
            top: Math.max(10, bar.y + MARGIN.top - 60),
          } : {
            left: bar.x + bar.width + MARGIN.left + 10,
            top: bar.y + bar.height / 2 + MARGIN.top,
          };

          return (
            <motion.div
              key="bar-tooltip"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={cn(
                "absolute pointer-events-none z-50 bg-popover/98 backdrop-blur-md border border-border rounded-lg px-3 py-2.5 shadow-xl",
                isVertical ? 'transform -translate-x-1/2' : 'transform -translate-y-1/2'
              )}
              style={tooltipStyle}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: bar.color }}
                />
                <span className="text-xs font-medium text-foreground whitespace-nowrap">
                  {bar.label}
                </span>
              </div>
              <div className="text-sm font-bold text-primary tabular-nums text-center">
                {bar.value}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

export const BarChart = memo(BarChartComponent);
export type { ChartDataItem, BarChartProps };
export { DEFAULT_COLORS, formatValue };
