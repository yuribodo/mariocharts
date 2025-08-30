import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs-extra';
import { z } from 'zod';
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
  private version: string;
  private useLocal: boolean;
  private localPath: string;

  constructor(baseUrl = DEFAULT_REGISTRY_URL, version = 'latest', useLocal = false) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.version = version;
    
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