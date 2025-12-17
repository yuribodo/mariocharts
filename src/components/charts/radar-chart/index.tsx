"use client";

import * as React from "react";
import { memo, useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useIsomorphicLayoutEffect } from "../../../../lib/hooks";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "../../../../lib/utils";

// Internal modules
import type {
  ChartDataItem,
  RadarChartProps,
  RadarSeries,
  RadarAxis,
  ProcessedAxis,
  ProcessedSeries,
  ProcessedPoint,
  HoveredState,
} from "./types";
import {
  polarToCartesian,
  calculateAxisAngle,
  generatePolygonPath,
  generateCircularGridPath,
  generatePolygonGridPath,
  calculateLabelPosition,
} from "./geometry";
import {
  getNumericValue,
  calculateAxisBounds,
  normalizeValue,
  formatValue,
} from "./scales";

// Re-export types for consumers
export type {
  ChartDataItem,
  RadarChartProps,
  RadarSeries,
  RadarAxis,
};

// Constants
const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
] as const;

const DEFAULT_HEIGHT = 400;
const DEFAULT_GRID_LEVELS = 5;
const DEFAULT_FILL_OPACITY = 0.25;
const DEFAULT_STROKE_WIDTH = 2;
const PADDING = 40;
const DEFAULT_LABEL_OFFSET = 30;
const MAX_RECOMMENDED_SERIES = 5;
const LEGEND_HEIGHT = 50;

// Animation constants
const ANIMATION_DURATION = 0.6;
const ANIMATION_EASING = [0.4, 0, 0.2, 1] as const;
const HOVER_DURATION = 0.2;
const STAGGER_DELAY = 0.1;
const HOVER_DEBOUNCE_MS = 50;

/**
 * Custom hook for responsive container dimensions
 * Uses ResizeObserver for efficient updates
 */
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

// ============================================================================
// State Components
// ============================================================================

function LoadingState({ height = DEFAULT_HEIGHT }: { height?: number }) {
  const size = Math.min(height - PADDING * 4, 200);

  return (
    <div
      className="relative w-full flex items-center justify-center"
      style={{ height }}
    >
      <svg
        width={size}
        height={size}
        className="animate-pulse"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Pulsing concentric rings */}
        {Array.from({ length: 5 }).map((_, i) => {
          const radius = (size / 2 - 10) * ((i + 1) / 5);
          return (
            <circle
              key={`ring-${i}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={1.5}
              opacity={0.3 + i * 0.1}
            />
          );
        })}
        {/* Pulsing axis lines */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = calculateAxisAngle(i, 6);
          const end = polarToCartesian(size / 2, size / 2, size / 2 - 10, angle);
          return (
            <line
              key={`axis-${i}`}
              x1={size / 2}
              y1={size / 2}
              x2={end.x}
              y2={end.y}
              stroke="hsl(var(--muted))"
              strokeWidth={1.5}
              opacity={0.3}
            />
          );
        })}
      </svg>
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

// ============================================================================
// Main Component
// ============================================================================

function RadarChartComponent<T extends ChartDataItem>({
  series,
  axes,
  colors = DEFAULT_COLORS,
  className,
  height = DEFAULT_HEIGHT,
  loading = false,
  error = null,
  animation = true,
  gridType = 'polygon',
  gridLevels = DEFAULT_GRID_LEVELS,
  showAxisLabels = true,
  showAxisLines = true,
  showGridLines = true,
  showDots = true,
  fillOpacity = DEFAULT_FILL_OPACITY,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  labelOffset = DEFAULT_LABEL_OFFSET,
  onSeriesClick,
  onAxisClick,
}: RadarChartProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const [hoveredState, setHoveredState] = useState<HoveredState | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const reduceMotion = useReducedMotion();
  const shouldAnimate = animation && !reduceMotion;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Soft limit warning for too many series
  if (process.env.NODE_ENV === 'development' && series.length > MAX_RECOMMENDED_SERIES) {
    console.warn(
      `[RadarChart] ${series.length} series detected. More than ${MAX_RECOMMENDED_SERIES} series may cause visual clutter. Consider using separate charts or a different visualization.`
    );
  }

  // Calculate chart dimensions - reserve space for legend
  const hasLegend = series.length > 1;
  const svgHeight = hasLegend ? height - LEGEND_HEIGHT : height;
  const chartSize = Math.min(containerWidth - PADDING * 2, svgHeight - PADDING * 2);
  const cx = containerWidth / 2;
  const cy = svgHeight / 2;
  const radius = Math.max(0, (chartSize / 2) - labelOffset);

  // Process axes with memoization
  const processedAxes = useMemo((): ProcessedAxis[] => {
    if (!axes.length || radius <= 0) return [];

    return axes.map((axis, index) => {
      const angle = calculateAxisAngle(index, axes.length);
      const bounds = calculateAxisBounds(axis, series);
      const endpoint = polarToCartesian(cx, cy, radius, angle);
      const labelPos = calculateLabelPosition(angle, cx, cy, radius, labelOffset);

      return {
        index,
        key: axis.key,
        label: axis.label,
        angle,
        maxValue: bounds.max,
        minValue: bounds.min,
        labelX: labelPos.x,
        labelY: labelPos.y,
        endpointX: endpoint.x,
        endpointY: endpoint.y,
      };
    });
  }, [axes, series, cx, cy, radius, labelOffset]);

  // Process series with memoization
  const processedSeries = useMemo((): ProcessedSeries<T>[] => {
    if (!series.length || !processedAxes.length || radius <= 0) return [];

    return series.map((s, seriesIndex) => {
      const points: ProcessedPoint[] = processedAxes.map((axis) => {
        const rawValue = getNumericValue(s.data, axis.key);
        const normalizedValue = normalizeValue(rawValue, axis.minValue, axis.maxValue);
        const pointRadius = radius * normalizedValue;
        const { x, y } = polarToCartesian(cx, cy, pointRadius, axis.angle);

        return {
          axisIndex: axis.index,
          rawValue,
          normalizedValue,
          x,
          y,
        };
      });

      const path = generatePolygonPath(points);
      const color = s.color ?? colors[seriesIndex % colors.length] ?? DEFAULT_COLORS[0];

      return {
        id: s.id,
        name: s.name,
        data: s.data,
        color,
        points,
        path,
      };
    });
  }, [series, processedAxes, colors, cx, cy, radius]);

  // Generate grid paths with memoization
  const gridPaths = useMemo((): string[] => {
    if (radius <= 0 || gridLevels <= 0) return [];

    return Array.from({ length: gridLevels }).map((_, i) => {
      const levelRadius = (radius * (i + 1)) / gridLevels;
      return gridType === 'circular'
        ? generateCircularGridPath(cx, cy, levelRadius)
        : generatePolygonGridPath(cx, cy, levelRadius, axes.length);
    });
  }, [gridType, gridLevels, radius, cx, cy, axes.length]);

  // Event handlers with debouncing to prevent flickering
  const handleSeriesMouseEnter = useCallback((seriesId: string, pointIndex?: number) => {
    // Clear any pending leave timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredState(
      pointIndex !== undefined
        ? { type: 'series', seriesId, pointIndex }
        : { type: 'series', seriesId }
    );
  }, []);

  const handleSeriesMouseLeave = useCallback(() => {
    // Debounce the leave to prevent flickering when moving between elements
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredState(null);
      setMousePos(null);
    }, HOVER_DEBOUNCE_MS);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleSeriesClick = useCallback((s: ProcessedSeries<T>, index: number) => {
    const originalSeries = series[index];
    if (originalSeries && onSeriesClick) {
      onSeriesClick(originalSeries, index);
    }
  }, [series, onSeriesClick]);

  const handleAxisClick = useCallback((axis: ProcessedAxis) => {
    const originalAxis = axes[axis.index];
    if (originalAxis && onAxisClick) {
      onAxisClick(originalAxis, axis.index);
    }
  }, [axes, onAxisClick]);

  // ============================================================================
  // Early Returns
  // ============================================================================

  if (loading) return <LoadingState height={height} />;
  if (error) return <ErrorState error={error} />;
  if (!series.length || !axes.length) return <EmptyState />;
  if (axes.length < 3) {
    return <ErrorState error="Radar chart requires at least 3 axes" />;
  }

  // Wait for container dimensions
  if (!containerWidth) {
    return (
      <div
        ref={containerRef}
        className={cn('relative w-full', className)}
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  // Get hovered series for tooltip
  const hoveredSeries = hoveredState?.seriesId
    ? processedSeries.find(s => s.id === hoveredState.seriesId)
    : null;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      style={{ height }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height={svgHeight}
        className="overflow-visible"
        role="img"
        aria-label={`Radar chart with ${series.length} series and ${axes.length} axes`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHoveredState(null);
          setMousePos(null);
        }}
      >
        {/* Grid Lines - Concentric rings */}
        {showGridLines && gridPaths.map((path, i) => (
          <motion.path
            key={`grid-${i}`}
            d={path}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={1}
            strokeOpacity={0.5}
            {...(shouldAnimate && {
              initial: { scale: 0.8, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              transition: {
                duration: 0.4,
                delay: i * 0.08,
                ease: ANIMATION_EASING,
              },
            })}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}

        {/* Axis Lines - Spokes from center */}
        {showAxisLines && processedAxes.map((axis) => (
          <motion.line
            key={`axis-line-${axis.index}`}
            x1={cx}
            y1={cy}
            x2={axis.endpointX}
            y2={axis.endpointY}
            stroke="hsl(var(--border))"
            strokeWidth={1}
            strokeOpacity={0.6}
            className={onAxisClick ? 'cursor-pointer hover:stroke-foreground' : undefined}
            onClick={() => handleAxisClick(axis)}
            {...(shouldAnimate && {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: {
                duration: 0.3,
                delay: axis.index * 0.05,
                ease: ANIMATION_EASING,
              },
            })}
          />
        ))}

        {/* Series Polygons - render non-hovered first, then hovered on top */}
        {processedSeries
          .map((s, index) => ({ s, index, isHovered: hoveredState?.seriesId === s.id }))
          .sort((a, b) => (a.isHovered ? 1 : 0) - (b.isHovered ? 1 : 0))
          .map(({ s, index, isHovered }) => {
          const otherHovered = hoveredState?.seriesId && !isHovered;

          // Separate initial animation from hover animation
          const initialAnimationProps = shouldAnimate ? {
            initial: { scale: 0, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            transition: {
              duration: ANIMATION_DURATION,
              delay: index * STAGGER_DELAY,
              ease: ANIMATION_EASING,
            },
          } : {};

          return (
            <g
              key={s.id}
              style={{
                opacity: otherHovered ? 0.25 : 1,
                transition: `opacity ${HOVER_DURATION}s ease-out`,
              }}
            >
              {/* Filled area */}
              <motion.path
                d={s.path}
                fill={s.color}
                fillOpacity={isHovered ? fillOpacity * 2.5 : fillOpacity}
                stroke="none"
                className="cursor-pointer outline-none"
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  transition: `fill-opacity ${HOVER_DURATION}s ease-out`,
                }}
                onMouseEnter={() => handleSeriesMouseEnter(s.id)}
                onMouseLeave={handleSeriesMouseLeave}
                onClick={() => handleSeriesClick(s, index)}
                role="graphics-symbol"
                aria-label={`${s.name}: ${processedAxes.map(a => `${a.label} ${formatValue(getNumericValue(s.data, a.key))}`).join(', ')}`}
                tabIndex={0}
                onFocus={() => handleSeriesMouseEnter(s.id)}
                onBlur={handleSeriesMouseLeave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSeriesClick(s, index);
                  }
                }}
                {...initialAnimationProps}
              />
              {/* Visible stroke line */}
              <motion.path
                d={s.path}
                fill="none"
                stroke={s.color}
                strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
                className="pointer-events-none"
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  filter: isHovered ? `drop-shadow(0 0 8px ${s.color}) drop-shadow(0 0 16px ${s.color})` : 'none',
                  transition: `stroke-width ${HOVER_DURATION}s ease-out, filter ${HOVER_DURATION}s ease-out`,
                }}
                {...initialAnimationProps}
              />
              {/* Invisible wider stroke for easier hover on lines */}
              <path
                d={s.path}
                fill="none"
                stroke="transparent"
                strokeWidth={16}
                strokeLinejoin="round"
                className="cursor-pointer"
                onMouseEnter={() => handleSeriesMouseEnter(s.id)}
                onMouseLeave={handleSeriesMouseLeave}
                onClick={() => handleSeriesClick(s, index)}
              />
            </g>
          );
        })}

        {/* Data Point Dots - Interactive with priority over area */}
        {showDots && processedSeries
          .map((s, seriesIndex) => ({ s, seriesIndex, isSeriesHovered: hoveredState?.seriesId === s.id }))
          .sort((a, b) => (a.isSeriesHovered ? 1 : 0) - (b.isSeriesHovered ? 1 : 0))
          .map(({ s, seriesIndex, isSeriesHovered }) => {
          const otherHovered = hoveredState?.seriesId && !isSeriesHovered;
          const hoveredPointIndex = isSeriesHovered ? hoveredState?.pointIndex : undefined;

          return s.points.map((point, pointIndex) => {
            const isPointHovered = isSeriesHovered && hoveredPointIndex === pointIndex;
            const dotRadius = isPointHovered ? 8 : isSeriesHovered ? 6 : 4;

            const dotAnimationProps = shouldAnimate ? {
              initial: { scale: 0, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              transition: {
                duration: 0.4,
                delay: seriesIndex * STAGGER_DELAY + pointIndex * 0.03,
                ease: ANIMATION_EASING,
              },
            } : {};

            return (
              <g
                key={`${s.id}-dot-group-${pointIndex}`}
                style={{
                  opacity: otherHovered ? 0.3 : 1,
                  transition: `opacity ${HOVER_DURATION}s ease-out`,
                }}
              >
                {/* Invisible hit area - larger for easier targeting */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={20}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => handleSeriesMouseEnter(s.id, pointIndex)}
                  onMouseLeave={handleSeriesMouseLeave}
                  onClick={() => {
                    const originalSeries = series[seriesIndex];
                    if (originalSeries && onSeriesClick) {
                      onSeriesClick(originalSeries, seriesIndex);
                    }
                  }}
                />
                {/* Visible dot */}
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r={dotRadius}
                  fill={s.color}
                  stroke="hsl(var(--background))"
                  strokeWidth={isSeriesHovered ? 3 : 2}
                  className="pointer-events-none"
                  style={{
                    filter: isSeriesHovered
                      ? `drop-shadow(0 0 ${isPointHovered ? 12 : 8}px ${s.color})`
                      : 'none',
                    transition: `r ${HOVER_DURATION}s ease-out, filter ${HOVER_DURATION}s ease-out`,
                  }}
                  {...dotAnimationProps}
                />
                {/* Show value label on point hover */}
                {isPointHovered && (
                  <g className="pointer-events-none">
                    <text
                      x={point.x}
                      y={point.y - 16}
                      textAnchor="middle"
                      className="text-xs font-bold fill-foreground"
                      style={{
                        textShadow: '0 0 4px hsl(var(--background)), 0 0 8px hsl(var(--background))',
                      }}
                    >
                      {formatValue(point.rawValue)}
                    </text>
                  </g>
                )}
              </g>
            );
          });
        })}

        {/* Axis Labels */}
        {showAxisLabels && processedAxes.map((axis) => {
          const labelPos = calculateLabelPosition(
            axis.angle,
            cx,
            cy,
            radius,
            labelOffset
          );

          return (
            <motion.text
              key={`label-${axis.index}`}
              x={labelPos.x}
              y={labelPos.y}
              textAnchor={labelPos.textAnchor}
              dominantBaseline={labelPos.dominantBaseline}
              className={cn(
                'text-xs font-medium fill-muted-foreground select-none',
                onAxisClick && 'cursor-pointer hover:fill-foreground'
              )}
              onClick={() => handleAxisClick(axis)}
              {...(shouldAnimate && {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                transition: {
                  duration: 0.3,
                  delay: 0.3 + axis.index * 0.05,
                },
              })}
            >
              {axis.label}
            </motion.text>
          );
        })}
      </svg>

      {/* Tooltip - follows mouse with smart positioning */}
      <AnimatePresence>
        {hoveredSeries && mousePos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute pointer-events-none z-50 bg-popover/98 backdrop-blur-md border border-border rounded-lg px-3 py-2.5 shadow-xl"
            style={{
              left: Math.min(Math.max(mousePos.x + 16, 10), containerWidth - 180),
              top: mousePos.y < svgHeight / 2
                ? mousePos.y + 20
                : mousePos.y - 140,
              minWidth: 170,
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{
                  backgroundColor: hoveredSeries.color,
                  boxShadow: `0 0 8px ${hoveredSeries.color}`,
                }}
              />
              <span className="font-semibold text-sm text-foreground">{hoveredSeries.name}</span>
            </div>
            {/* Stats Grid */}
            <div className="space-y-1">
              {processedAxes.map((axis, axisIndex) => {
                const value = getNumericValue(hoveredSeries.data, axis.key);
                const percentage = ((value - axis.minValue) / (axis.maxValue - axis.minValue)) * 100;
                const isHighlightedPoint = hoveredState?.pointIndex === axisIndex;
                return (
                  <div
                    key={axis.key}
                    className={cn(
                      "flex items-center justify-between gap-3 py-0.5 px-1 -mx-1 rounded",
                      isHighlightedPoint && "bg-muted/50"
                    )}
                  >
                    <span className={cn(
                      "text-xs",
                      isHighlightedPoint ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {axis.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: hoveredSeries.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        />
                      </div>
                      <span className={cn(
                        "text-xs tabular-nums w-8 text-right",
                        isHighlightedPoint ? "font-bold text-foreground" : "font-medium text-foreground"
                      )}>
                        {formatValue(value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      {hasLegend && (
        <div className="flex items-center justify-center gap-2 pt-4" style={{ height: LEGEND_HEIGHT }}>
          {processedSeries.map((s) => {
            const isHovered = hoveredState?.seriesId === s.id;
            const otherHovered = hoveredState?.seriesId && hoveredState.seriesId !== s.id;

            return (
              <motion.button
                key={s.id}
                type="button"
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full transition-all',
                  'border border-transparent',
                  'hover:border-border hover:bg-muted/50',
                  isHovered && 'border-border bg-muted shadow-sm',
                  otherHovered && 'opacity-50'
                )}
                onMouseEnter={(e) => {
                  handleSeriesMouseEnter(s.id);
                  // Set mouse position for tooltip near the legend item
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    setMousePos({
                      x: e.clientX - rect.left,
                      y: svgHeight + 10,
                    });
                  }
                }}
                onMouseLeave={handleSeriesMouseLeave}
                onClick={() => {
                  const index = processedSeries.findIndex(ps => ps.id === s.id);
                  const originalSeries = series[index];
                  if (originalSeries && onSeriesClick) {
                    onSeriesClick(originalSeries, index);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: s.color }}
                  animate={{
                    scale: isHovered ? 1.2 : 1,
                    boxShadow: isHovered ? `0 0 8px ${s.color}` : '0 0 0px transparent',
                  }}
                  transition={{ duration: 0.2 }}
                />
                <span className={cn(
                  'text-xs font-medium transition-colors',
                  isHovered ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {s.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Export memoized component
export const RadarChart = memo(RadarChartComponent) as typeof RadarChartComponent;

// Export utilities for advanced use cases
export { DEFAULT_COLORS, formatValue };
