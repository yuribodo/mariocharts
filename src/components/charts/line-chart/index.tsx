"use client";

import * as React from "react";
import { memo, useMemo, useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
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
  readonly connectNulls?: boolean;
  readonly onPointClick?: (data: T, index: number, series?: string) => void;
}

// Constants
const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
] as const;

const DEFAULT_HEIGHT = 300;
const MARGIN = { top: 10, right: 15, bottom: 25, left: 25 };

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
             style={{ height: height - 100, margin: '0 15px 25px 25px' }}>
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
  connectNulls = true,
  onPointClick,
}: LineChartProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const chartWidth = Math.max(0, containerWidth - MARGIN.left - MARGIN.right);
  const chartHeight = height - MARGIN.top - MARGIN.bottom;
  
  const processedSeries = useMemo(() => {
    if (!data.length || chartWidth <= 0 || chartHeight <= 0) return [];
    
    const yKeys = Array.isArray(y) ? y : [y];
    
    return yKeys.map((yKey, seriesIndex) => {
      // Extract and process data in one pass
      const seriesData = data.map((item, index) => {
        const yVal = getNumericValue(item, yKey as string);
        return {
          data: item,
          index,
          xValue: item[x],
          yValue: yVal,
          hasValue: yVal !== null,
          x: (index / (data.length - 1)) * chartWidth,
          label: String(item[x]),
          value: yVal !== null ? formatValue(yVal) : 'N/A',
        };
      });
      
      const validValues = seriesData.filter(item => item.hasValue).map(item => item.yValue!);
      if (!validValues.length) return null;
      
      const minValue = Math.min(...validValues);
      const maxValue = Math.max(...validValues);
      const range = maxValue - minValue || 1;
      const seriesColor = colors[seriesIndex % colors.length] || DEFAULT_COLORS[0];
      
      // Calculate y positions
      const points = seriesData.map(item => ({
        ...item,
        y: item.hasValue 
          ? chartHeight - ((item.yValue! - minValue) / range) * chartHeight 
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
        minValue,
        maxValue,
      };
    }).filter((series): series is NonNullable<typeof series> => series !== null);
  }, [data, x, y, colors, chartWidth, chartHeight, curve, connectNulls, showArea]);
  
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
  
  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      style={{ height }}
    >
      <svg width="100%" height={height} className="overflow-hidden">
        <defs>
          {processedSeries.map((series, index) => (
            <g key={`series-defs-${index}`}>
              {/* Gradient for area fill */}
              <linearGradient
                id={`area-gradient-${index}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor={series.color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={series.color} stopOpacity={0.05} />
              </linearGradient>
              
              {/* Minimal dot pattern */}
              <pattern
                id={`dot-pattern-${index}`}
                patternUnits="userSpaceOnUse"
                width="8"
                height="8"
              >
                <rect width="8" height="8" fill={`url(#area-gradient-${index})`} />
                <circle cx="4" cy="4" r="0.6" fill={series.color} fillOpacity="0.25" />
              </pattern>
            </g>
          ))}
        </defs>
        
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Axes */}
          <line 
            x1={0} 
            y1={0} 
            x2={0} 
            y2={chartHeight} 
            stroke="currentColor" 
            opacity={0.1} 
          />
          <line 
            x1={0} 
            y1={chartHeight} 
            x2={chartWidth} 
            y2={chartHeight} 
            stroke="currentColor" 
            opacity={0.3} 
            strokeWidth={1.5}
          />
          
          {/* Hover line */}
          {hoveredIndex !== null && (
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
          {processedSeries.map((series, seriesIndex) => (
            <g key={`series-${seriesIndex}`}>
              {showArea && (
                <motion.path
                  d={series.areaPath}
                  fill={`url(#dot-pattern-${seriesIndex})`}
                  {...(animation && {
                    initial: { opacity: 0, scaleY: 0 },
                    animate: { opacity: 1, scaleY: 1 },
                    transition: {
                      duration: 0.8,
                      delay: seriesIndex * 0.15,
                      ease: [0.4, 0, 0.2, 1]
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
                {...(animation && {
                  initial: { pathLength: 0 },
                  animate: { pathLength: 1 },
                  transition: {
                    duration: 1.2,
                    delay: seriesIndex * 0.1,
                    ease: [0.4, 0, 0.2, 1]
                  }
                })}
              />
            </g>
          ))}
          
          {/* Triangle Dots */}
          {showDots && processedSeries.flatMap((series, seriesIndex) => 
            series.points
              .filter((point) => point.hasValue)
              .map((point) => {
                const size = hoveredIndex === point.index ? 10 : 7;
                const trianglePath = `M ${point.x} ${point.y - size} L ${point.x - size * 0.866} ${point.y + size * 0.5} L ${point.x + size * 0.866} ${point.y + size * 0.5} Z`;
                
                return (
                  <motion.path
                    key={`triangle-${seriesIndex}-${point.index}`}
                    d={trianglePath}
                    fill={series.color}
                    stroke="white"
                    strokeWidth={2}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(point.index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => onPointClick?.(point.data, point.index, series.key)}
                    {...(animation && {
                      initial: { scale: 0, rotate: -180 },
                      animate: { scale: 1, rotate: 0 },
                      whileHover: { scale: 1.3, rotate: 360 },
                      transition: {
                        duration: 0.4,
                        delay: seriesIndex * 0.1 + point.index * 0.02,
                        ease: [0.4, 0, 0.2, 1]
                      }
                    })}
                  />
                );
              })
          )}
          
          {/* X-axis labels */}
          {data.map((item, index) => (
            <text
              key={`x-label-${index}`}
              x={(index / (data.length - 1)) * chartWidth}
              y={chartHeight + 15}
              textAnchor="middle"
              fontSize={11}
              className="fill-muted-foreground"
            >
              {String(item[x])}
            </text>
          ))}
        </g>
      </svg>
      
      {/* Tooltip */}
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
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute pointer-events-none z-50 bg-background border rounded-lg px-3 py-2 shadow-xl transform -translate-x-1/2"
            style={{
              left: (hoveredIndex / (data.length - 1)) * chartWidth + MARGIN.left,
              top: Math.max(10, MARGIN.top - 60),
            }}
          >
            <div className="text-xs font-medium text-center whitespace-nowrap mb-1">
              {tooltipData[0]?.point?.label || ''}
            </div>
            {tooltipData.map(({ key, point, color }) => (
              <div key={key} className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="font-medium text-primary">{point!.value}</span>
              </div>
            ))}
          </motion.div>
        );
      })()}
    </div>
  );
}

export const LineChart = memo(LineChartComponent);
export type { ChartDataItem, LineChartProps };
export { DEFAULT_COLORS, formatValue };