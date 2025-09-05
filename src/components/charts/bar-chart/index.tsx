"use client";

import * as React from "react";
import { memo, useMemo, useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
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
      <div className={`flex items-center justify-center h-full p-6`}>
        <div className="w-full max-w-full">
          {/* Loading title skeleton */}
          <div className="animate-pulse bg-muted rounded h-4 w-32 mb-4" />
          
          {/* Chart area with proper margins */}
          <div 
            className="relative border-l border-b border-muted/30"
            style={{
              height: height - MARGIN.top - MARGIN.bottom - 50,
              marginLeft: MARGIN.left,
              marginRight: MARGIN.right,
              marginBottom: MARGIN.bottom,
            }}
          >
            {/* Loading bars */}
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
            
            {/* Axis labels skeleton */}
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
  onBarClick,
}: BarChartProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const chartWidth = Math.max(0, containerWidth - MARGIN.left - MARGIN.right);
  const chartHeight = height - MARGIN.top - MARGIN.bottom;
  
  const processedBars = useMemo(() => {
    if (!data.length || chartWidth <= 0 || chartHeight <= 0) return [];
    
    // 1. Extract numeric values
    const values = data.map(d => getNumericValue(d, y as string));
    const maxValue = Math.max(...values);
    
    const isVertical = orientation === 'vertical';
    const barCount = data.length;
    
    // Calculate bar dimensions based on orientation
    const barSize = isVertical ? chartWidth / barCount : chartHeight / barCount;
    const barSpacing = barSize * 0.2;
    const actualBarSize = barSize * 0.8;
    
    // 2. If all values are 0 or negative, use dimension 0
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
    
    // 3. Process bars normally - using available space efficiently
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
        // Horizontal orientation
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
          
          {/* Bars */}
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
              ? `${bar.x + bar.width/2}px ${bar.y + bar.height}px` // Vertical: origin at base
              : `${bar.x}px ${bar.y + bar.height/2}px`; // Horizontal: origin at left center
            
            return (
              <g key={bar.index}>
                {/* Invisible hit area for outline variant - captures mouse events across entire bar */}
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
                  className={isFilled ? "cursor-pointer" : "pointer-events-none"}
                  style={{ 
                    transformOrigin
                  }}
                  {...motionProps}
                  onMouseEnter={isFilled ? () => setHoveredIndex(bar.index) : undefined}
                  onMouseLeave={isFilled ? () => setHoveredIndex(null) : undefined}
                  onClick={isFilled ? () => onBarClick?.(bar.data, bar.index) : undefined}
                />
              </g>
            );
          })}
          
          {/* Labels - adapt to orientation */}
          {processedBars.map((bar) => {
            const isVertical = orientation === 'vertical';
            
            return (
              <text
                key={`label-${bar.index}`}
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
      
      {/* Tooltip */}
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
            className={`absolute pointer-events-none z-50 bg-background border rounded-lg px-3 py-2 shadow-xl ${
              isVertical ? 'transform -translate-x-1/2' : 'transform -translate-y-1/2'
            }`}
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
export { DEFAULT_COLORS, formatValue };