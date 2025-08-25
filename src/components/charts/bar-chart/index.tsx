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
  readonly onBarClick?: (data: T, index: number) => void;
}

// Constants
const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
] as const;

const DEFAULT_HEIGHT = 300;
const MARGIN = { top: 10, right: 15, bottom: 25, left: 25 }; // Margens otimizadas

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
function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="space-y-3">
        <div className="animate-pulse bg-muted rounded h-4 w-32" />
        <div className="flex space-x-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted rounded w-8 animate-pulse"
              style={{ height: 40 + (i * 12) }}
            />
          ))}
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
  onBarClick,
}: BarChartProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const chartWidth = Math.max(0, containerWidth - MARGIN.left - MARGIN.right);
  const chartHeight = height - MARGIN.top - MARGIN.bottom;
  
  const processedBars = useMemo(() => {
    if (!data.length || chartWidth <= 0 || chartHeight <= 0) return [];
    
    // 1. Extrair valores numéricos
    const values = data.map(d => getNumericValue(d, y as string));
    const maxValue = Math.max(...values);
    
    // 2. Se todos os valores são 0 ou negativos, usar altura 0
    const barWidth = chartWidth / data.length;
    const barSpacing = barWidth * 0.2;
    const actualBarWidth = barWidth * 0.8;
    
    if (maxValue <= 0) {
      return data.map((item, index) => ({
        data: item,
        index,
        x: index * barWidth + barSpacing / 2,
        y: chartHeight, // Sempre na base
        width: actualBarWidth,
        height: 0,
        color: colors[index % colors.length] || DEFAULT_COLORS[0],
        label: String(item[x]),
        value: formatValue(values[index]),
        rawValue: values[index]
      }));
    }
    
    // 3. Processar barras normalmente - usando espaço disponível de forma eficiente
    
    return data.map((item, index) => {
      const value = values[index] || 0;
      const normalizedHeight = Math.max(0, (value / maxValue) * chartHeight);
      
      return {
        data: item,
        index,
        x: index * barWidth + barSpacing / 2, // Centered position with spacing
        y: chartHeight - normalizedHeight,
        width: actualBarWidth,
        height: normalizedHeight,
        color: colors[index % colors.length] || DEFAULT_COLORS[0],
        label: String(item[x]),
        value: formatValue(value),
        rawValue: value
      };
    });
  }, [data, x, y, colors, chartWidth, chartHeight]);
  
  if (loading) return <LoadingState />;
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
          {/* Eixo Y */}
          <line 
            x1={0} 
            y1={0} 
            x2={0} 
            y2={chartHeight} 
            stroke="currentColor" 
            opacity={0.1} 
          />
          
          {/* Eixo X - SEMPRE na base */}
          <line 
            x1={0} 
            y1={chartHeight} 
            x2={chartWidth} 
            y2={chartHeight} 
            stroke="currentColor" 
            opacity={0.3} 
            strokeWidth={1.5}
          />
          
          {/* Barras */}
          {processedBars.map((bar) => {
            const motionProps = animation ? {
              initial: { scaleY: 0 }, // Escala Y inicia em 0
              animate: { scaleY: 1 }, // Cresce até escala completa
              transition: {
                duration: 0.6,
                delay: bar.index * 0.05,
                ease: [0.4, 0, 0.2, 1],
              },
              whileHover: { opacity: 0.8 }
            } : {};
            
            return (
              <motion.rect
                key={bar.index}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill={bar.color}
                rx={4}
                className="cursor-pointer"
                style={{ 
                  transformOrigin: `${bar.x + bar.width/2}px ${bar.y + bar.height}px` // Origin na base da barra
                }}
                {...motionProps}
                onMouseEnter={() => setHoveredIndex(bar.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onBarClick?.(bar.data, bar.index)}
              />
            );
          })}
          
          {/* Labels do eixo X */}
          {processedBars.map((bar) => (
            <text
              key={`label-${bar.index}`}
              x={bar.x + bar.width / 2}
              y={chartHeight + 10}
              textAnchor="middle"
              fontSize={11}
              className="fill-muted-foreground"
            >
              {bar.label}
            </text>
          ))}
        </g>
      </svg>
      
      {/* Tooltip */}
      {hoveredIndex !== null && processedBars[hoveredIndex] && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute pointer-events-none z-50 bg-background border rounded-lg px-3 py-2 shadow-xl transform -translate-x-1/2"
          style={{
            left: processedBars[hoveredIndex].x + processedBars[hoveredIndex].width / 2 + MARGIN.left,
            top: Math.max(10, processedBars[hoveredIndex].y + MARGIN.top - 55),
          }}
        >
          <div className="text-xs font-medium text-center whitespace-nowrap">
            {processedBars[hoveredIndex].label}
          </div>
          <div className="text-sm font-bold text-primary text-center">
            {processedBars[hoveredIndex].value}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export const BarChart = memo(BarChartComponent);
export type { ChartDataItem, BarChartProps };
export { DEFAULT_COLORS, formatValue };