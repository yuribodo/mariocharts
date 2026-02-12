"use client";

import * as React from "react";
import { memo, useMemo, useState, useRef, useCallback } from "react";
import { useIsomorphicLayoutEffect } from "../../../../lib/hooks";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "../../../../lib/utils";

// Types
type ChartDataItem = Record<string, unknown>;

interface LineChartProps<T extends ChartDataItem> {
  readonly data: readonly T[];
  readonly x: keyof T;
  readonly y: keyof T | readonly (keyof T)[];
  readonly colors?: readonly string[];
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly strokeWidth?: number;
  readonly curve?: 'linear' | 'monotone' | 'natural' | 'step';
  readonly showDots?: boolean;
  readonly showArea?: boolean;
  readonly showGrid?: boolean;
  readonly gridStyle?: 'solid' | 'dashed' | 'dotted';
  readonly showLegend?: boolean;
  readonly connectNulls?: boolean;
  readonly onPointClick?: (data: T, index: number, series?: string) => void;
}

// Constants
const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
] as const;

const DEFAULT_HEIGHT = 300;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };
const ANIMATION_EASING = [0.4, 0, 0.2, 1] as const;
const HOVER_DURATION = 0.2;
const LEGEND_HEIGHT = 40;

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

function getNumericValue(data: ChartDataItem, key: keyof ChartDataItem): number | null {
  const value = data[key];
  if (typeof value === 'number' && isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[,$%\s]/g, ''));
    if (isFinite(parsed)) return parsed;
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[LineChart] Could not parse value "${value}" for key "${String(key)}". Treating as null.`);
    }
  }
  if (process.env.NODE_ENV === 'development' && value !== null && value !== undefined) {
    console.warn(`[LineChart] Unexpected value type for key "${String(key)}": ${typeof value}. Treating as null.`);
  }
  return null;
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

// Path generation utilities
type PathPoint = { x: number; y: number; hasValue: boolean };

function generatePath(points: PathPoint[], curve: 'linear' | 'monotone' | 'natural' | 'step', connectNulls = true): string {
  if (!points.length) return '';

  const validPoints = connectNulls ? points : points.filter(p => p?.hasValue);
  if (!validPoints.length) return '';

  if (curve === 'linear' || curve === 'step' || curve === 'natural' || validPoints.length < 2) {
    return validPoints.reduce((path, point, i) =>
      path + (i === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`), '');
  }

  // Monotone curve
  const firstPoint = validPoints[0];
  if (!firstPoint) return '';

  let path = `M ${firstPoint.x} ${firstPoint.y}`;

  for (let i = 1; i < validPoints.length; i++) {
    const prev = validPoints[i - 1];
    const curr = validPoints[i];
    const next = validPoints[i + 1];

    if (!prev || !curr) continue;

    const dx = curr.x - prev.x;
    let cp1y = prev.y, cp2y = curr.y;

    if (next && dx !== 0) {
      const slope1 = (curr.y - prev.y) / dx;
      const slope2 = (next.y - curr.y) / (next.x - curr.x);
      const avgSlope = (slope1 + slope2) / 2;

      cp1y = prev.y + dx * 0.3 * avgSlope;
      cp2y = curr.y - dx * 0.3 * avgSlope;
    }

    path += ` C ${prev.x + dx * 0.3} ${cp1y}, ${curr.x - dx * 0.3} ${cp2y}, ${curr.x} ${curr.y}`;
  }

  return path;
}

// State components
const states = {
  Loading: ({ height = DEFAULT_HEIGHT }: { height?: number }) => (
    <div className="relative w-full flex items-center justify-center" style={{ height }}>
      <div className="w-full max-w-full p-6">
        <div className="animate-pulse bg-muted rounded h-4 w-32 mb-4" />
        <div className="relative border-l border-b border-muted/30"
             style={{ height: height - 100, margin: `0 ${MARGIN.right}px ${MARGIN.bottom}px ${MARGIN.left}px` }}>
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="currentColor" stopOpacity={0.1} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {[0, 1, 2].map((i) => (
              <motion.path
                key={i}
                d={`M 0 ${60 + i * 30} Q 100 ${40 + i * 30} 200 ${60 + i * 30} T 400 ${60 + i * 30}`}
                stroke="url(#loadingGradient)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  ),

  Error: ({ error }: { error: string }) => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-2">
        <div className="text-destructive font-medium">Chart Error</div>
        <div className="text-sm text-muted-foreground">{error}</div>
      </div>
    </div>
  ),

  Empty: () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-2">
        <div className="text-muted-foreground">No Data</div>
        <div className="text-sm text-muted-foreground">There&apos;s no data to display</div>
      </div>
    </div>
  ),
};

// Main Component
function LineChartComponent<T extends ChartDataItem>({
  data,
  x,
  y,
  colors = DEFAULT_COLORS,
  className,
  height = DEFAULT_HEIGHT,
  loading = false,
  error = null,
  animation = true,
  strokeWidth = 2,
  curve = 'monotone',
  showDots = true,
  showArea = false,
  showGrid = false,
  gridStyle = 'dashed',
  showLegend = false,
  connectNulls = true,
  onPointClick,
}: LineChartProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const reduceMotion = useReducedMotion();
  const shouldAnimate = animation && !reduceMotion;

  const hasLegend = showLegend && Array.isArray(y) && y.length > 1;
  const svgHeight = hasLegend ? height - LEGEND_HEIGHT : height;
  const chartWidth = Math.max(0, containerWidth - MARGIN.left - MARGIN.right);
  const chartHeight = svgHeight - MARGIN.top - MARGIN.bottom;

  // Dev warning for large datasets
  if (process.env.NODE_ENV === 'development' && data.length > 200) {
    console.warn(
      `[LineChart] ${data.length} data points detected. Consider downsampling for better performance.`
    );
  }

  // Compute global domain across all series for shared Y-axis
  const globalDomain = useMemo(() => {
    if (!data.length) return { min: 0, max: 0 };

    const yKeys = Array.isArray(y) ? y : [y];
    let allMin = Infinity;
    let allMax = -Infinity;

    for (const yKey of yKeys) {
      for (const item of data) {
        const val = getNumericValue(item, yKey as string);
        if (val !== null) {
          if (val < allMin) allMin = val;
          if (val > allMax) allMax = val;
        }
      }
    }

    if (!isFinite(allMin) || !isFinite(allMax)) return { min: 0, max: 0 };
    return { min: allMin, max: allMax };
  }, [data, y]);

  const yTicks = useMemo(() => {
    if (globalDomain.min === globalDomain.max) return globalDomain.min === 0 ? [] : [globalDomain.min];
    return calculateNiceTicks(globalDomain.min, globalDomain.max, 5);
  }, [globalDomain]);

  const gridDasharray = useMemo(() => getGridDasharray(gridStyle), [gridStyle]);

  // Effective Y domain from nice ticks for consistent grid alignment
  const effectiveDomain = useMemo(() => {
    if (!yTicks.length) return globalDomain;
    return { min: Math.min(...yTicks), max: Math.max(...yTicks) };
  }, [yTicks, globalDomain]);

  const processedSeries = useMemo(() => {
    if (!data.length || chartWidth <= 0 || chartHeight <= 0) return [];

    const yKeys = Array.isArray(y) ? y : [y];
    const { min: scaleMin, max: scaleMax } = effectiveDomain;
    const range = scaleMax - scaleMin || 1;

    return yKeys.map((yKey, seriesIndex) => {
      const seriesData = data.map((item, index) => {
        const yVal = getNumericValue(item, yKey as string);
        return {
          data: item,
          index,
          xValue: item[x],
          yValue: yVal,
          hasValue: yVal !== null,
          x: data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth / 2,
          label: String(item[x]),
          value: yVal !== null ? formatValue(yVal) : 'N/A',
        };
      });

      const validValues = seriesData.filter(item => item.hasValue).map(item => item.yValue!);
      if (!validValues.length) return null;

      const seriesColor = colors[seriesIndex % colors.length] || DEFAULT_COLORS[0];

      // Calculate y positions using shared domain
      const points = seriesData.map(item => ({
        ...item,
        y: item.hasValue
          ? chartHeight - ((item.yValue! - scaleMin) / range) * chartHeight
          : chartHeight,
        color: seriesColor,
      }));

      const linePath = generatePath(points, curve, connectNulls);
      const areaPath = showArea && linePath
        ? `${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`
        : '';

      return {
        key: String(yKey),
        points,
        linePath,
        areaPath,
        color: seriesColor,
        minValue: Math.min(...validValues),
        maxValue: Math.max(...validValues),
      };
    }).filter((series): series is NonNullable<typeof series> => series !== null);
  }, [data, x, y, colors, chartWidth, chartHeight, curve, connectNulls, showArea, effectiveDomain]);

  // Event handlers with useCallback
  const handlePointMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index);
  }, []);

  const handlePointMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const handlePointClick = useCallback((pointData: T, index: number, series?: string) => {
    onPointClick?.(pointData, index, series);
  }, [onPointClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, pointData: T, index: number, series?: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPointClick?.(pointData, index, series);
    }
  }, [onPointClick]);

  if (loading) return <states.Loading height={height} />;
  if (error) return <states.Error error={error} />;
  if (!data.length) return <states.Empty />;

  if (!containerWidth) {
    return (
      <div ref={containerRef} className={cn('relative w-full', className)} style={{ height }}>
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  const { min: scaleMin, max: scaleMax } = effectiveDomain;
  const scaleRange = scaleMax - scaleMin || 1;

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      style={{ height }}
    >
      <svg
        width="100%"
        height={svgHeight}
        className="overflow-visible"
        role="img"
        aria-label={`Line chart with ${processedSeries.length} series and ${data.length} data points`}
      >
        <defs>
          {processedSeries.map((series, index) => (
            <g key={`series-defs-${index}`}>
              <linearGradient
                id={`area-gradient-${index}`}
                x1="0%" y1="0%" x2="0%" y2="100%"
              >
                <stop offset="0%" stopColor={series.color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={series.color} stopOpacity={0.05} />
              </linearGradient>
              <pattern
                id={`dot-pattern-${index}`}
                patternUnits="userSpaceOnUse"
                width="8" height="8"
              >
                <rect width="8" height="8" fill={`url(#area-gradient-${index})`} />
                <circle cx="4" cy="4" r="0.6" fill={series.color} fillOpacity="0.25" />
              </pattern>
            </g>
          ))}
        </defs>

        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Grid lines */}
          {showGrid && yTicks.map((tick, i) => {
            const tickY = chartHeight - ((tick - scaleMin) / scaleRange) * chartHeight;
            return (
              <line
                key={`grid-h-${i}`}
                x1={0} y1={tickY} x2={chartWidth} y2={tickY}
                stroke="currentColor" opacity={0.1}
                strokeDasharray={gridDasharray}
              />
            );
          })}

          {/* Axes */}
          <line
            x1={0} y1={0} x2={0} y2={chartHeight}
            stroke="currentColor" opacity={0.3} strokeWidth={1.5}
          />
          <line
            x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight}
            stroke="currentColor" opacity={0.3} strokeWidth={1.5}
          />

          {/* Y-axis ticks and labels */}
          {yTicks.map((tick, i) => {
            const tickY = chartHeight - ((tick - scaleMin) / scaleRange) * chartHeight;
            return (
              <g key={`y-tick-${i}`}>
                <line x1={-4} y1={tickY} x2={0} y2={tickY} stroke="currentColor" opacity={0.3} />
                <text
                  x={-8} y={tickY}
                  textAnchor="end" dominantBaseline="middle"
                  fontSize={11} className="fill-muted-foreground"
                >
                  {formatValue(tick)}
                </text>
              </g>
            );
          })}

          {/* Hover line */}
          {hoveredIndex !== null && data.length > 1 && (
            <line
              x1={(hoveredIndex / (data.length - 1)) * chartWidth}
              y1={0}
              x2={(hoveredIndex / (data.length - 1)) * chartWidth}
              y2={chartHeight}
              stroke="currentColor"
              opacity={0.3}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          )}

          {/* Areas and Lines */}
          {processedSeries.map((series, seriesIndex) => {
            const isSeriesHovered = hoveredIndex !== null && series.points[hoveredIndex]?.hasValue;

            return (
              <g key={`series-${seriesIndex}`}>
                {showArea && (
                  <motion.path
                    d={series.areaPath}
                    fill={`url(#dot-pattern-${seriesIndex})`}
                    {...(shouldAnimate && {
                      initial: { opacity: 0, scaleY: 0 },
                      animate: { opacity: 1, scaleY: 1 },
                      transition: {
                        duration: 0.8,
                        delay: seriesIndex * 0.15,
                        ease: ANIMATION_EASING,
                      }
                    })}
                    style={{ transformOrigin: 'bottom' }}
                  />
                )}
                <motion.path
                  d={series.linePath}
                  stroke={series.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pointer-events-none"
                  style={{
                    filter: isSeriesHovered ? `drop-shadow(0 0 8px ${series.color})` : 'none',
                    transition: `filter ${HOVER_DURATION}s ease-out`,
                  }}
                  {...(shouldAnimate && {
                    initial: { pathLength: 0 },
                    animate: { pathLength: 1 },
                    transition: {
                      duration: 1.2,
                      delay: seriesIndex * 0.1,
                      ease: ANIMATION_EASING,
                    }
                  })}
                />
              </g>
            );
          })}

          {/* Invisible hit areas for line hover */}
          {data.map((_, index) => {
            const xPos = data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth / 2;
            const sliceWidth = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;
            return (
              <rect
                key={`hit-${index}`}
                x={xPos - sliceWidth / 2}
                y={0}
                width={sliceWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => handlePointMouseEnter(index)}
                onMouseLeave={handlePointMouseLeave}
                onClick={() => {
                  const firstSeries = processedSeries[0];
                  if (!firstSeries) return;
                  const point = firstSeries.points[index];
                  if (point?.hasValue) handlePointClick(point.data, index, firstSeries.key);
                }}
              />
            );
          })}

          {/* Triangle Dots */}
          {showDots && processedSeries.flatMap((series, seriesIndex) =>
            series.points
              .filter((point) => point.hasValue)
              .map((point) => {
                const isHovered = hoveredIndex === point.index;
                const size = isHovered ? 10 : 7;
                const trianglePath = `M ${point.x} ${point.y - size} L ${point.x - size * 0.866} ${point.y + size * 0.5} L ${point.x + size * 0.866} ${point.y + size * 0.5} Z`;

                return (
                  <motion.path
                    key={`triangle-${seriesIndex}-${point.index}`}
                    d={trianglePath}
                    fill={series.color}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                    className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    tabIndex={0}
                    role="graphics-symbol"
                    aria-label={`${series.key}: ${point.label}, ${point.value}`}
                    onMouseEnter={() => handlePointMouseEnter(point.index)}
                    onMouseLeave={handlePointMouseLeave}
                    onFocus={() => handlePointMouseEnter(point.index)}
                    onBlur={handlePointMouseLeave}
                    onClick={() => handlePointClick(point.data, point.index, series.key)}
                    onKeyDown={(e) => handleKeyDown(e, point.data, point.index, series.key)}
                    style={{
                      filter: isHovered ? `drop-shadow(0 0 6px ${series.color})` : 'none',
                      transition: `filter ${HOVER_DURATION}s ease-out`,
                    }}
                    {...(shouldAnimate && {
                      initial: { scale: 0, rotate: -180 },
                      animate: { scale: 1, rotate: 0 },
                      whileHover: { scale: 1.3, rotate: 360 },
                      transition: {
                        duration: 0.4,
                        delay: seriesIndex * 0.1 + point.index * 0.02,
                        ease: ANIMATION_EASING,
                      }
                    })}
                  />
                );
              })
          )}

          {/* X-axis labels with tick marks */}
          {data.map((item, index) => {
            const xPos = data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth / 2;
            return (
              <g key={`x-label-${index}`}>
                <line
                  x1={xPos} y1={chartHeight}
                  x2={xPos} y2={chartHeight + 4}
                  stroke="currentColor" opacity={0.3}
                />
                <text
                  x={xPos}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  fontSize={11}
                  className="fill-muted-foreground"
                >
                  {String(item[x])}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredIndex !== null && hoveredIndex >= 0 && (() => {
          const tooltipData = processedSeries
            .map(series => ({
              key: series.key,
              color: series.color,
              point: series.points[hoveredIndex]
            }))
            .filter(item => item.point?.hasValue);

          if (!tooltipData.length) return null;

          return (
            <motion.div
              key="line-tooltip"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute pointer-events-none z-50 bg-popover/98 backdrop-blur-md border border-border rounded-lg px-3 py-2.5 shadow-xl transform -translate-x-1/2"
              style={{
                left: data.length > 1
                  ? (hoveredIndex / (data.length - 1)) * chartWidth + MARGIN.left
                  : chartWidth / 2 + MARGIN.left,
                top: Math.max(10, MARGIN.top - 10),
              }}
            >
              <div className="text-xs font-medium text-foreground mb-1.5 pb-1.5 border-b border-border/50 text-center whitespace-nowrap">
                {tooltipData[0]?.point?.label || ''}
              </div>
              {tooltipData.map(({ key, point, color }) => (
                <div key={key} className="flex items-center justify-between gap-3 py-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    {processedSeries.length > 1 && (
                      <span className="text-xs text-muted-foreground">{key}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-foreground tabular-nums">{point!.value}</span>
                </div>
              ))}
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Legend */}
      {hasLegend && processedSeries.length > 1 && (
        <div className="flex flex-wrap gap-4 justify-center px-4" style={{ height: LEGEND_HEIGHT }}>
          {processedSeries.map((series) => (
            <div key={series.key} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: series.color }}
              />
              <span className="text-sm text-muted-foreground">{series.key}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const LineChart = memo(LineChartComponent);
export type { ChartDataItem, LineChartProps };
export { DEFAULT_COLORS, formatValue };
