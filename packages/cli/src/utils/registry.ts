import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs-extra';
// Removed unused 'z' import
import { RegistryIndex, RegistryItem, registryIndexSchema, registryItemSchema } from './types.js';
import { Logger } from './logger.js';

const logger = new Logger();

export const DEFAULT_REGISTRY_URL = 'https://mariocharts.com/registry';

// Fallback registry data embedded in the CLI
const FALLBACK_REGISTRY_INDEX = [
  {
    "name": "bar-chart",
    "type": "chart" as const,
    "category": "charts",
    "subcategory": "basic",
    "description": "A customizable bar chart component with animations, hover effects, responsive design, and support for both vertical and horizontal orientations with filled or outline variants",
    "dependencies": ["framer-motion"],
    "devDependencies": [],
    "registryDependencies": [],
    "peerDependencies": ["react", "react-dom"],
    "meta": {
      "importName": "BarChart",
      "exportName": "BarChart",
      "displayName": "Bar Chart"
    }
  },
  {
    "name": "line-chart",
    "type": "chart" as const,
    "category": "charts",
    "subcategory": "basic",
    "description": "A sophisticated line chart component with triangular markers, textured area fills, multiple series support, gap handling, curve interpolation, and advanced animations",
    "dependencies": ["framer-motion"],
    "devDependencies": [],
    "registryDependencies": [],
    "peerDependencies": ["react", "react-dom"],
    "meta": {
      "importName": "LineChart",
      "exportName": "LineChart",
      "displayName": "Line Chart"
    }
  },
  {
    "name": "pie-chart",
    "type": "chart" as const,
    "category": "charts",
    "subcategory": "basic",
    "description": "A beautiful pie and donut chart component with native center content support, smooth animations, keyboard navigation, and semi-circle gauge variant",
    "dependencies": ["framer-motion"],
    "devDependencies": [],
    "registryDependencies": [],
    "peerDependencies": ["react", "react-dom"],
    "meta": {
      "importName": "PieChart",
      "exportName": "PieChart",
      "displayName": "Pie Chart"
    }
  }
];

// Fallback component data
const FALLBACK_COMPONENTS: Record<string, any> = {
  "bar-chart": {
    "name": "bar-chart",
    "type": "chart",
    "category": "charts", 
    "subcategory": "basic",
    "description": "A customizable bar chart component with animations, hover effects, responsive design, and support for both vertical and horizontal orientations with filled or outline variants",
    "dependencies": ["framer-motion"],
    "devDependencies": [],
    "registryDependencies": [],
    "peerDependencies": ["react", "react-dom"],
    "files": [
      {
        "name": "bar-chart/index.tsx",
        "content": `"use client";

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
  readonly variant?: 'filled' | 'outline';
  readonly orientation?: 'vertical' | 'horizontal';
  readonly onBarClick?: (data: T, index: number) => void;
}

// Constants
const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
] as const;

const DEFAULT_HEIGHT = 300;
const MARGIN = { top: 10, right: 15, bottom: 25, left: 25 }; // Optimized margins

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
            <div className={\`flex \${isVertical ? 'items-end space-x-2 h-full' : 'flex-col justify-center space-y-2 w-full'}\`}>
              {Array.from({ length: 5 }).map((_, i) => {
                const barSize = isVertical 
                  ? { width: 32, height: 40 + (i * 20) }
                  : { width: 60 + (i * 30), height: 24 };
                
                return (
                  <div
                    key={i}
                    className={\`\${isFilled ? 'bg-muted' : 'border-2 border-muted bg-transparent'} rounded animate-pulse\`}
                    style={{
                      width: barSize.width,
                      height: barSize.height,
                      animationDelay: \`\${i * 0.1}s\`
                    }}
                  />
                );
              })}
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
  variant = 'filled',
  orientation = 'vertical',
  onBarClick,
}: BarChartProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const chartWidth = Math.max(0, containerWidth - MARGIN.left - MARGIN.right);
  const chartHeight = height - MARGIN.top - MARGIN.bottom;
  
  const processedBars = useMemo(() => {
    if (!data.length || chartWidth <= 0 || chartHeight <= 0) return [];
    
    const values = data.map(d => getNumericValue(d, y as string));
    const maxValue = Math.max(...values);
    
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
    
    return data.map((item, index) => {
      const value = values[index] || 0;
      
      if (isVertical) {
        const normalizedHeight = Math.max(0, (value / maxValue) * chartHeight);
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
        const normalizedWidth = Math.max(0, (value / maxValue) * chartWidth);
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
  }, [data, x, y, colors, chartWidth, chartHeight, orientation]);
  
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
      <svg width="100%" height={height} className="overflow-hidden">
        <g transform={\`translate(\${MARGIN.left}, \${MARGIN.top})\`}>
          {orientation === 'vertical' ? (
            <>
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
            </>
          ) : (
            <>
              <line 
                x1={0} 
                y1={0} 
                x2={0} 
                y2={chartHeight} 
                stroke="currentColor" 
                opacity={0.3} 
                strokeWidth={1.5}
              />
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
          
          {processedBars.map((bar) => {
            const isVertical = orientation === 'vertical';
            const isFilled = variant === 'filled';
            
            const motionProps = animation ? {
              initial: isVertical ? { scaleY: 0 } : { scaleX: 0 },
              animate: isVertical ? { scaleY: 1 } : { scaleX: 1 },
              transition: {
                duration: 0.6,
                delay: bar.index * 0.05,
                ease: [0.4, 0, 0.2, 1],
              },
              whileHover: { opacity: 0.8 }
            } : {};
            
            const transformOrigin = isVertical 
              ? \`\${bar.x + bar.width/2}px \${bar.y + bar.height}px\`
              : \`\${bar.x}px \${bar.y + bar.height/2}px\`;
            
            return (
              <g key={bar.index}>
                {!isFilled && (
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(bar.index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => onBarClick?.(bar.data, bar.index)}
                  />
                )}
                
                <motion.rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  fill={isFilled ? bar.color : 'none'}
                  stroke={isFilled ? 'none' : bar.color}
                  strokeWidth={isFilled ? 0 : 2}
                  rx={4}
                  className={isFilled ? "cursor-pointer" : "pointer-events-none"}
                  style={{ transformOrigin }}
                  {...motionProps}
                  onMouseEnter={isFilled ? () => setHoveredIndex(bar.index) : undefined}
                  onMouseLeave={isFilled ? () => setHoveredIndex(null) : undefined}
                  onClick={isFilled ? () => onBarClick?.(bar.data, bar.index) : undefined}
                />
              </g>
            );
          })}
          
          {processedBars.map((bar) => {
            const isVertical = orientation === 'vertical';
            
            return (
              <text
                key={\`label-\${bar.index}\`}
                x={isVertical ? bar.x + bar.width / 2 : -8}
                y={isVertical ? chartHeight + 10 : bar.y + bar.height / 2}
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
      
      {hoveredIndex !== null && processedBars[hoveredIndex] && (() => {
        const bar = processedBars[hoveredIndex];
        const isVertical = orientation === 'vertical';
        
        const tooltipStyle = isVertical ? {
          left: bar.x + bar.width / 2 + MARGIN.left,
          top: Math.max(10, bar.y + MARGIN.top - 55),
        } : {
          left: bar.x + bar.width + MARGIN.left + 10,
          top: bar.y + bar.height / 2 + MARGIN.top,
        };
        
        return (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={\`absolute pointer-events-none z-50 bg-background border rounded-lg px-3 py-2 shadow-xl \${
              isVertical ? 'transform -translate-x-1/2' : 'transform -translate-y-1/2'
            }\`}
            style={tooltipStyle}
          >
            <div className="text-xs font-medium text-center whitespace-nowrap">
              {bar.label}
            </div>
            <div className="text-sm font-bold text-primary text-center">
              {bar.value}
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}

export const BarChart = memo(BarChartComponent);
export type { ChartDataItem, BarChartProps };
export { DEFAULT_COLORS, formatValue };`
      }
    ],
    "meta": {
      "importName": "BarChart",
      "exportName": "BarChart",
      "displayName": "Bar Chart"
    }
  },
  "line-chart": {
    "name": "line-chart",
    "type": "chart",
    "category": "charts",
    "subcategory": "basic",
    "description": "A sophisticated line chart component with triangular markers, textured area fills, multiple series support, gap handling, curve interpolation, and advanced animations",
    "dependencies": ["framer-motion"],
    "devDependencies": [],
    "registryDependencies": [],
    "peerDependencies": ["react", "react-dom"],
    "files": [
      {
        "name": "line-chart/index.tsx",
        "content": `"use client";

import * as React from "react";
import { memo, useMemo, useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
      return \`\${(value / 1000000).toFixed(1)}M\`;
    } else if (Math.abs(value) >= 1000) {
      return \`\${(value / 1000).toFixed(1)}K\`;
    }
    return value.toLocaleString();
  }
  return String(value);
}

function getNumericValue(data: ChartDataItem, key: keyof ChartDataItem): number | null {
  const value = data[key];
  if (typeof value === 'number' && isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[,$%\\s]/g, ''));
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
      path + (i === 0 ? \`M \${point.x} \${point.y}\` : \` L \${point.x} \${point.y}\`), '');
  }
  
  // Monotone curve
  const firstPoint = validPoints[0];
  if (!firstPoint) return '';
  
  let path = \`M \${firstPoint.x} \${firstPoint.y}\`;
  
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
    
    path += \` C \${prev.x + dx * 0.3} \${cp1y}, \${curr.x - dx * 0.3} \${cp2y}, \${curr.x} \${curr.y}\`;
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
                d={\`M 0 \${60 + i * 30} Q 100 \${40 + i * 30} 200 \${60 + i * 30} T 400 \${60 + i * 30}\`}
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
        <div className="text-sm text-muted-foreground">There's no data to display</div>
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
      
      const points = seriesData.map(item => ({
        ...item,
        y: item.hasValue 
          ? chartHeight - ((item.yValue! - minValue) / range) * chartHeight 
          : chartHeight,
        color: seriesColor,
      }));
      
      const linePath = generatePath(points, curve, connectNulls);
      const areaPath = showArea && linePath 
        ? \`\${linePath} L \${chartWidth} \${chartHeight} L 0 \${chartHeight} Z\` 
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
            <g key={\`series-defs-\${index}\`}>
              <linearGradient
                id={\`area-gradient-\${index}\`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor={series.color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={series.color} stopOpacity={0.05} />
              </linearGradient>
              
              <pattern
                id={\`dot-pattern-\${index}\`}
                patternUnits="userSpaceOnUse"
                width="8"
                height="8"
              >
                <rect width="8" height="8" fill={\`url(#area-gradient-\${index})\`} />
                <circle cx="4" cy="4" r="0.6" fill={series.color} fillOpacity="0.25" />
              </pattern>
            </g>
          ))}
        </defs>
        
        <g transform={\`translate(\${MARGIN.left}, \${MARGIN.top})\`}>
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
          
          {processedSeries.map((series, seriesIndex) => (
            <g key={\`series-\${seriesIndex}\`}>
              {showArea && (
                <motion.path
                  d={series.areaPath}
                  fill={\`url(#dot-pattern-\${seriesIndex})\`}
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
          
          {showDots && processedSeries.flatMap((series, seriesIndex) => 
            series.points
              .filter((point) => point.hasValue)
              .map((point) => {
                const size = hoveredIndex === point.index ? 10 : 7;
                const trianglePath = \`M \${point.x} \${point.y - size} L \${point.x - size * 0.866} \${point.y + size * 0.5} L \${point.x + size * 0.866} \${point.y + size * 0.5} Z\`;
                
                return (
                  <motion.path
                    key={\`triangle-\${seriesIndex}-\${point.index}\`}
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
          
          {data.map((item, index) => (
            <text
              key={\`x-label-\${index}\`}
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
export { DEFAULT_COLORS, formatValue };`
      }
    ],
    "meta": {
      "importName": "LineChart",
      "exportName": "LineChart",
      "displayName": "Line Chart"
    }
  },
  "pie-chart": {
    "name": "pie-chart",
    "type": "chart",
    "category": "charts",
    "subcategory": "basic",
    "description": "A beautiful pie and donut chart component with native center content support, smooth animations, keyboard navigation, and semi-circle gauge variant",
    "dependencies": ["framer-motion"],
    "devDependencies": [],
    "registryDependencies": [],
    "peerDependencies": ["react", "react-dom"],
    "files": [
      {
        "name": "pie-chart/index.tsx",
        "content": `"use client";

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
    if (!data.length || chartSize <= 0) return { processedSlices: [] as any[], total: 0 };
    const values = data.map(d => Math.max(0, getNumericValue(d, value as string)));
    const totalValue = values.reduce((sum, v) => sum + v, 0);
    if (totalValue <= 0) return { processedSlices: [] as any[], total: 0 };

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
  if (!data.length) return <EmptyState />;

  if (!containerWidth) {
    return <div ref={containerRef} className={cn('relative w-full', className)} style={{ height }}><div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading...</div></div>;
  }

  if (total <= 0) return <EmptyState />;

  const centerSize = actualInnerRadius * 2 * 0.8;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)} style={{ height: effectiveHeight }}>
      <svg width="100%" height={effectiveHeight} className="overflow-visible" role="img" aria-label={\`\${variant} chart with \${data.length} segments\`}>
        {processedSlices.map((slice: any) => {
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
              tabIndex={0} onKeyDown={(e: any) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSliceClick?.(slice.data, slice.index); }}}
              onFocus={() => setHoveredIndex(slice.index)} onBlur={() => setHoveredIndex(null)} {...motionProps}
            />
          );
        })}

        {(variant === 'donut' || variant === 'semi') && centerContent && actualInnerRadius > 0 && (() => {
          const centerY = isSemi ? cy - centerSize / 2 - actualInnerRadius * 0.4 : cy - centerSize / 2;
          return (
            <foreignObject x={cx - centerSize / 2} y={centerY} width={centerSize} height={centerSize} className="pointer-events-none">
              <div className="w-full h-full flex items-center justify-center">
                {typeof centerContent === 'function' ? centerContent({ total, items: data }) : centerContent}
              </div>
            </foreignObject>
          );
        })()}
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
export { DEFAULT_COLORS, formatValue };`
      }
    ],
    "meta": {
      "importName": "PieChart",
      "exportName": "PieChart",
      "displayName": "Pie Chart"
    }
  }
};

// Find registry path by looking for it in common locations
function findLocalRegistryPath(): string | null {
  const possiblePaths = [
    path.resolve(__dirname, '../../../registry'),
    path.resolve(process.cwd(), 'packages/registry'),
    path.resolve(process.cwd(), '../registry'),
    path.resolve(process.cwd(), 'registry'),
  ];

  for (const registryPath of possiblePaths) {
    if (fs.existsSync(path.join(registryPath, 'index.json'))) {
      return registryPath;
    }
  }
  
  return null;
}

export class RegistryClient {
  private baseUrl: string;
  private useLocal: boolean;
  private localPath: string;

  constructor(baseUrl = DEFAULT_REGISTRY_URL, useLocal = false) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    
    const localPath = findLocalRegistryPath();
    this.useLocal = useLocal || (localPath !== null);
    this.localPath = localPath || '';
    
    if (this.useLocal && localPath) {
      logger.debug(`Using local registry at: ${localPath}`);
    }
  }

  async getIndex(): Promise<RegistryIndex> {
    try {
      // Try local first if available
      if (this.useLocal) {
        const indexPath = path.join(this.localPath, 'index.json');
        logger.debug(`Fetching registry index from local file: ${indexPath}`);
        
        if (await fs.pathExists(indexPath)) {
          const data = await fs.readJSON(indexPath);
          return registryIndexSchema.parse(data);
        }
      }

      // Try remote
      const url = `${this.baseUrl}/index.json`;
      logger.debug(`Fetching registry index from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        // If remote fails, use fallback
        logger.debug('Remote registry not available, using embedded components');
        return registryIndexSchema.parse(FALLBACK_REGISTRY_INDEX);
      }

      const data = await response.json();
      return registryIndexSchema.parse(data);
    } catch (error) {
      // Always fallback to embedded components
      logger.debug('Using embedded components as fallback');
      return registryIndexSchema.parse(FALLBACK_REGISTRY_INDEX);
    }
  }

  async getComponent(name: string): Promise<RegistryItem> {
    try {
      // Try local first if available
      if (this.useLocal) {
        const componentPath = path.join(this.localPath, 'components', `${name}.json`);
        logger.debug(`Fetching component from local file: ${componentPath}`);
        
        if (await fs.pathExists(componentPath)) {
          const data = await fs.readJSON(componentPath);
          return registryItemSchema.parse(data);
        }
      }

      // Try remote
      const url = `${this.baseUrl}/components/${name}.json`;
      logger.debug(`Fetching component from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        // If remote fails, check fallback
        if (FALLBACK_COMPONENTS[name]) {
          logger.debug(`Using embedded component: ${name}`);
          return registryItemSchema.parse(FALLBACK_COMPONENTS[name]);
        }
        throw new Error(`Component "${name}" not found in registry`);
      }

      const data = await response.json();
      return registryItemSchema.parse(data);
    } catch (error) {
      // Try fallback before failing
      if (FALLBACK_COMPONENTS[name]) {
        logger.debug(`Using embedded component as fallback: ${name}`);
        return registryItemSchema.parse(FALLBACK_COMPONENTS[name]);
      }
      
      logger.error(`Failed to fetch component "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async getComponentsByType(type: RegistryItem['type']): Promise<RegistryIndex> {
    const index = await this.getIndex();
    return index.filter(item => item.type === type);
  }

  async getAllComponents(): Promise<RegistryIndex> {
    return await this.getIndex();
  }

  async searchComponents(query: string): Promise<RegistryIndex> {
    const index = await this.getIndex();
    const lowercaseQuery = query.toLowerCase();
    
    return index.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery) ||
      (item.subcategory && item.subcategory.toLowerCase().includes(lowercaseQuery))
    );
  }

  async resolveDependencies(components: string[]): Promise<{
    resolved: RegistryItem[];
    npmDependencies: string[];
    registryDependencies: string[];
  }> {
    const resolved: RegistryItem[] = [];
    const npmDependencies = new Set<string>();
    const registryDependencies = new Set<string>();
    const processed = new Set<string>();

    const processComponent = async (name: string): Promise<void> => {
      if (processed.has(name)) return;
      processed.add(name);

      try {
        const component = await this.getComponent(name);
        resolved.push(component);

        // Adicionar dependências npm
        component.dependencies.forEach(dep => npmDependencies.add(dep));
        component.devDependencies.forEach(dep => npmDependencies.add(dep));
        component.peerDependencies.forEach(dep => npmDependencies.add(dep));

        // Processar dependências de registry recursivamente
        for (const dep of component.registryDependencies) {
          registryDependencies.add(dep);
          await processComponent(dep);
        }
      } catch (error) {
        logger.warn(`Could not resolve component dependency: ${name}`);
      }
    };

    // Processar todos os componentes solicitados
    for (const component of components) {
      await processComponent(component);
    }

    return {
      resolved,
      npmDependencies: Array.from(npmDependencies),
      registryDependencies: Array.from(registryDependencies),
    };
  }
}

// Instância padrão do cliente
export const defaultRegistry = new RegistryClient();