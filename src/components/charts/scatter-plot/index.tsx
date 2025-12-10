"use client";

import * as React from "react";
import { memo, useMemo, useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../../lib/utils";

// Types
type ChartDataItem = Record<string, unknown>;

interface ScatterPlotProps<T extends ChartDataItem> {
  // Required
  readonly data: readonly T[];
  readonly x: keyof T;
  readonly y: keyof T;

  // Common chart props
  readonly colors?: readonly string[];
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;

  // Scatter-specific
  readonly series?: keyof T;
  readonly size?: keyof T | number;
  readonly sizeRange?: readonly [number, number];

  // P1 Features
  readonly showTrendLine?: boolean;
  readonly trendLineColor?: string;
  readonly showLegend?: boolean;
  readonly showGrid?: boolean;
  readonly gridStyle?: 'solid' | 'dashed' | 'dotted';
  readonly xDomain?: readonly [number, number];
  readonly yDomain?: readonly [number, number];

  // Event handlers
  readonly onPointClick?: (data: T, index: number, series?: string) => void;
}

// Constants
const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
] as const;

const DEFAULT_HEIGHT = 300;
const DEFAULT_POINT_SIZE = 6;
const DEFAULT_SIZE_RANGE = [4, 40] as const;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };

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
    return isFinite(parsed) ? parsed : null;
  }
  return null;
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

// Scale value from data domain to screen range
function scaleValue(
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number]
): number {
  const [domainMin, domainMax] = domain;
  const [rangeMin, rangeMax] = range;
  if (domainMax === domainMin) return (rangeMin + rangeMax) / 2;
  return rangeMin + ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin);
}

// Calculate nice axis ticks
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

// Linear regression calculation
function calculateLinearRegression(points: { x: number; y: number }[]): {
  slope: number;
  intercept: number;
  r2: number;
} {
  if (points.length < 2) {
    return { slope: 0, intercept: points[0]?.y ?? 0, r2: 0 };
  }

  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const sumY2 = points.reduce((s, p) => s + p.y * p.y, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) {
    return { slope: 0, intercept: sumY / n, r2: 0 };
  }

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const meanY = sumY / n;
  const ssTotal = points.reduce((s, p) => s + Math.pow(p.y - meanY, 2), 0);
  const ssResidual = points.reduce((s, p) => s + Math.pow(p.y - (slope * p.x + intercept), 2), 0);
  const r2 = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;

  return { slope, intercept, r2 };
}

// State components
const states = {
  Loading: ({ height = DEFAULT_HEIGHT }: { height?: number }) => (
    <div className="relative w-full flex items-center justify-center" style={{ height }}>
      <div className="w-full max-w-full p-6">
        <div className="animate-pulse bg-muted rounded h-4 w-32 mb-4" />
        <div className="relative border-l border-b border-muted/30"
             style={{ height: height - 100, margin: '0 50px 40px 50px' }}>
          <svg width="100%" height="100%" className="absolute inset-0">
            {/* Animated scatter dots skeleton */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.circle
                key={i}
                cx={`${15 + (i % 4) * 25}%`}
                cy={`${20 + Math.floor(i / 4) * 30}%`}
                r={6 + (i % 3) * 4}
                className="fill-muted"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.5 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 1
                }}
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
function ScatterPlotComponent<T extends ChartDataItem>({
  data,
  x,
  y,
  colors = DEFAULT_COLORS,
  className,
  height = DEFAULT_HEIGHT,
  loading = false,
  error = null,
  animation = true,
  series,
  size,
  sizeRange = DEFAULT_SIZE_RANGE,
  showTrendLine = false,
  trendLineColor,
  showLegend = false,
  showGrid = false,
  gridStyle = 'dashed',
  xDomain,
  yDomain,
  onPointClick,
}: ScatterPlotProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; series: string } | null>(null);

  const chartWidth = Math.max(0, containerWidth - MARGIN.left - MARGIN.right);
  const chartHeight = height - MARGIN.top - MARGIN.bottom;

  const { processedSeries, xTicks, yTicks, effectiveXDomain, effectiveYDomain } = useMemo(() => {
    if (!data.length || chartWidth <= 0 || chartHeight <= 0) {
      return {
        processedSeries: [],
        xTicks: [],
        yTicks: [],
        effectiveXDomain: [0, 1] as const,
        effectiveYDomain: [0, 1] as const
      };
    }

    // Extract all values
    const rawPoints = data.map((item, index) => {
      const xVal = getNumericValue(item, x as string);
      const yVal = getNumericValue(item, y as string);
      const sizeVal = typeof size === 'number'
        ? size
        : size
          ? getNumericValue(item, size as string) ?? DEFAULT_POINT_SIZE
          : DEFAULT_POINT_SIZE;
      const seriesKey = series ? String(item[series]) : 'default';

      return {
        data: item,
        index,
        xValue: xVal,
        yValue: yVal,
        sizeValue: sizeVal,
        seriesKey,
        label: series ? String(item[series]) : `Point ${index + 1}`,
      };
    }).filter(p => p.xValue !== null && p.yValue !== null);

    if (!rawPoints.length) {
      return {
        processedSeries: [],
        xTicks: [],
        yTicks: [],
        effectiveXDomain: [0, 1] as const,
        effectiveYDomain: [0, 1] as const
      };
    }

    // Calculate domains
    const xValues = rawPoints.map(p => p.xValue!);
    const yValues = rawPoints.map(p => p.yValue!);
    const sizeValues = rawPoints.map(p => p.sizeValue);

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const sizeMin = Math.min(...sizeValues);
    const sizeMax = Math.max(...sizeValues);

    // Add 5% padding to domains
    const xPadding = (xMax - xMin) * 0.05 || 1;
    const yPadding = (yMax - yMin) * 0.05 || 1;

    const effectiveXDomain: readonly [number, number] = xDomain ?? [xMin - xPadding, xMax + xPadding];
    const effectiveYDomain: readonly [number, number] = yDomain ?? [yMin - yPadding, yMax + yPadding];

    // Calculate ticks
    const xTicks = calculateNiceTicks(effectiveXDomain[0], effectiveXDomain[1], 6);
    const yTicks = calculateNiceTicks(effectiveYDomain[0], effectiveYDomain[1], 5);

    // Group by series
    const seriesGroups = new Map<string, typeof rawPoints>();
    rawPoints.forEach(point => {
      const existing = seriesGroups.get(point.seriesKey) || [];
      existing.push(point);
      seriesGroups.set(point.seriesKey, existing);
    });

    // Process each series
    const processedSeries = Array.from(seriesGroups.entries()).map(
      ([seriesKey, points], seriesIndex) => {
        const seriesColor = colors[seriesIndex % colors.length] || DEFAULT_COLORS[0];

        const processedPoints = points.map(point => ({
          ...point,
          screenX: scaleValue(point.xValue!, effectiveXDomain, [0, chartWidth]),
          screenY: scaleValue(point.yValue!, effectiveYDomain, [chartHeight, 0]),
          radius: typeof size === 'number' || !size
            ? (typeof size === 'number' ? size : DEFAULT_POINT_SIZE)
            : scaleValue(
                point.sizeValue,
                [sizeMin, sizeMax],
                sizeRange
              ),
          color: seriesColor,
          formattedX: formatValue(point.xValue),
          formattedY: formatValue(point.yValue),
          formattedSize: size && typeof size !== 'number' ? formatValue(point.sizeValue) : null,
        }));

        // Calculate trend line if enabled
        let trendLine = null;
        if (showTrendLine && processedPoints.length >= 2) {
          const regression = calculateLinearRegression(
            processedPoints.map(p => ({ x: p.xValue!, y: p.yValue! }))
          );

          // Calculate line endpoints within domain
          const lineX1 = effectiveXDomain[0];
          const lineX2 = effectiveXDomain[1];
          const lineY1 = regression.slope * lineX1 + regression.intercept;
          const lineY2 = regression.slope * lineX2 + regression.intercept;

          trendLine = {
            ...regression,
            screenX1: scaleValue(lineX1, effectiveXDomain, [0, chartWidth]),
            screenY1: scaleValue(lineY1, effectiveYDomain, [chartHeight, 0]),
            screenX2: scaleValue(lineX2, effectiveXDomain, [0, chartWidth]),
            screenY2: scaleValue(lineY2, effectiveYDomain, [chartHeight, 0]),
          };
        }

        return {
          key: seriesKey,
          color: seriesColor,
          points: processedPoints,
          trendLine,
        };
      }
    );

    return { processedSeries, xTicks, yTicks, effectiveXDomain, effectiveYDomain };
  }, [data, x, y, series, size, sizeRange, colors, chartWidth, chartHeight, xDomain, yDomain, showTrendLine]);

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

  // Get grid dasharray based on style
  const getGridDasharray = () => {
    switch (gridStyle) {
      case 'solid': return 'none';
      case 'dotted': return '2 4';
      case 'dashed':
      default: return '4 4';
    }
  };

  // Find hovered point data for tooltip
  const getHoveredPointData = () => {
    if (!hoveredPoint) return null;
    const seriesData = processedSeries.find(s => s.key === hoveredPoint.series);
    if (!seriesData) return null;
    const point = seriesData.points.find(p => p.index === hoveredPoint.index);
    return point ? { point, seriesKey: seriesData.key, color: seriesData.color } : null;
  };

  const hoveredData = getHoveredPointData();

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      style={{ height }}
    >
      <svg width="100%" height={height} className="overflow-visible">
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Grid lines */}
          {showGrid && (
            <>
              {/* Horizontal grid lines */}
              {yTicks.map((tick, i) => {
                const tickY = scaleValue(tick, effectiveYDomain, [chartHeight, 0]);
                return (
                  <line
                    key={`grid-h-${i}`}
                    x1={0}
                    y1={tickY}
                    x2={chartWidth}
                    y2={tickY}
                    stroke="currentColor"
                    opacity={0.1}
                    strokeDasharray={getGridDasharray()}
                  />
                );
              })}
              {/* Vertical grid lines */}
              {xTicks.map((tick, i) => {
                const tickX = scaleValue(tick, effectiveXDomain, [0, chartWidth]);
                return (
                  <line
                    key={`grid-v-${i}`}
                    x1={tickX}
                    y1={0}
                    x2={tickX}
                    y2={chartHeight}
                    stroke="currentColor"
                    opacity={0.1}
                    strokeDasharray={getGridDasharray()}
                  />
                );
              })}
            </>
          )}

          {/* Y Axis */}
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
            opacity={0.3}
            strokeWidth={1.5}
          />

          {/* Y Axis ticks and labels */}
          {yTicks.map((tick, i) => {
            const tickY = scaleValue(tick, effectiveYDomain, [chartHeight, 0]);
            return (
              <g key={`y-tick-${i}`}>
                <line
                  x1={-4}
                  y1={tickY}
                  x2={0}
                  y2={tickY}
                  stroke="currentColor"
                  opacity={0.3}
                />
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

          {/* X Axis ticks and labels */}
          {xTicks.map((tick, i) => {
            const tickX = scaleValue(tick, effectiveXDomain, [0, chartWidth]);
            return (
              <g key={`x-tick-${i}`}>
                <line
                  x1={tickX}
                  y1={chartHeight}
                  x2={tickX}
                  y2={chartHeight + 4}
                  stroke="currentColor"
                  opacity={0.3}
                />
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

          {/* Trend lines */}
          {showTrendLine && processedSeries.map((series, seriesIndex) => (
            series.trendLine && (
              <motion.line
                key={`trend-${seriesIndex}`}
                x1={series.trendLine.screenX1}
                y1={series.trendLine.screenY1}
                x2={series.trendLine.screenX2}
                y2={series.trendLine.screenY2}
                stroke={trendLineColor || series.color}
                strokeWidth={2}
                strokeDasharray="6 4"
                opacity={0.6}
                {...(animation && {
                  initial: { pathLength: 0, opacity: 0 },
                  animate: { pathLength: 1, opacity: 0.6 },
                  transition: {
                    duration: 0.8,
                    delay: 0.5 + seriesIndex * 0.1,
                    ease: [0.4, 0, 0.2, 1]
                  }
                })}
              />
            )
          ))}

          {/* Points */}
          {processedSeries.flatMap((series, seriesIndex) =>
            series.points.map((point, pointIndex) => {
              const isHovered = hoveredPoint?.index === point.index && hoveredPoint?.series === series.key;

              return (
                <motion.circle
                  key={`point-${seriesIndex}-${pointIndex}`}
                  cx={point.screenX}
                  cy={point.screenY}
                  r={isHovered ? point.radius * 1.2 : point.radius}
                  fill={point.color}
                  stroke="white"
                  strokeWidth={2}
                  className="cursor-pointer"
                  style={{ transformOrigin: `${point.screenX}px ${point.screenY}px` }}
                  onMouseEnter={() => setHoveredPoint({ index: point.index, series: series.key })}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => onPointClick?.(point.data, point.index, series.key)}
                  {...(animation && {
                    initial: { scale: 0, opacity: 0 },
                    animate: { scale: 1, opacity: 1 },
                    transition: {
                      duration: 0.4,
                      delay: seriesIndex * 0.1 + pointIndex * 0.02,
                      ease: [0.4, 0, 0.2, 1]
                    }
                  })}
                />
              );
            })
          )}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredData && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute pointer-events-none z-50 bg-background border rounded-lg px-3 py-2 shadow-xl transform -translate-x-1/2"
          style={{
            left: hoveredData.point.screenX + MARGIN.left,
            top: Math.max(10, hoveredData.point.screenY + MARGIN.top - 80),
          }}
        >
          {processedSeries.length > 1 && (
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredData.color }} />
              <span className="text-xs font-medium">{hoveredData.seriesKey}</span>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            X: <span className="font-medium text-foreground">{hoveredData.point.formattedX}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Y: <span className="font-medium text-foreground">{hoveredData.point.formattedY}</span>
          </div>
          {hoveredData.point.formattedSize && (
            <div className="text-xs text-muted-foreground">
              Size: <span className="font-medium text-foreground">{hoveredData.point.formattedSize}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Legend */}
      {showLegend && processedSeries.length > 1 && (
        <div className="flex flex-wrap gap-4 justify-center mt-2 px-4">
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

export const ScatterPlot = memo(ScatterPlotComponent);
export type { ChartDataItem, ScatterPlotProps };
export { DEFAULT_COLORS, formatValue };
