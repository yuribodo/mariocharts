"use client";

import * as React from "react";
import { memo, useMemo, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { formatValue, useContainerDimensions, ChartTooltip } from "../_shared";
import type { TreemapChartTooltipData, TooltipRenderer } from "../_shared";
import { cn } from "../../../../lib/utils";
import { computeTreeMapLayout, nodeValue } from "./layout";
import type { TreeMapNode, LayoutRect } from "./layout";

// Re-export types
export type { TreeMapNode, LayoutRect };

// Props
export interface TreeMapChartProps {
  readonly data: readonly TreeMapNode[];
  readonly colors?: readonly string[];
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly onClick?: (node: TreeMapNode, path: readonly string[]) => void;
  readonly tooltipRenderer?: TooltipRenderer<TreemapChartTooltipData>;
}

// Constants
const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
] as const;

const DEFAULT_HEIGHT = 400;
const ANIMATION_EASING = [0.4, 0, 0.2, 1] as const;
const HOVER_DURATION = 0.2;
const MIN_LABEL_WIDTH = 40;
const MIN_LABEL_HEIGHT = 28;
const MIN_VALUE_HEIGHT = 44;


function colorWithOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return hex + alpha;
}


// Loading State
function LoadingState({ height = DEFAULT_HEIGHT }: { height?: number }) {
  return (
    <div className="relative w-full" style={{ height }}>
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => {
            const sizes = [
              'col-span-2 row-span-2',
              'col-span-1 row-span-1',
              'col-span-1 row-span-1',
              'col-span-1 row-span-1',
              'col-span-1 row-span-1',
              'col-span-1 row-span-1',
              'col-span-1 row-span-1',
              'col-span-1 row-span-1',
              'col-span-1 row-span-1',
            ];
            return (
              <div
                key={i}
                className={cn(
                  "bg-muted rounded animate-pulse",
                  sizes[i]
                )}
                style={{ animationDelay: `${i * 0.08}s` }}
              />
            );
          })}
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
function TreeMapChartComponent({
  data,
  colors = DEFAULT_COLORS,
  className,
  height = DEFAULT_HEIGHT,
  loading = false,
  error = null,
  animation = true,
  onClick,
  tooltipRenderer,
}: TreeMapChartProps) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const [hoveredRect, setHoveredRect] = useState<LayoutRect | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const reduceMotion = useReducedMotion();
  const shouldAnimate = animation && !reduceMotion;

  const rects = useMemo(() => {
    if (!containerWidth || !data.length) return [];
    return computeTreeMapLayout(data, containerWidth, height);
  }, [data, containerWidth, height]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const container = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMousePos({
      x: e.clientX - container.left,
      y: e.clientY - container.top,
    });
  }, []);

  const handleRectMouseEnter = useCallback((rect: LayoutRect) => {
    setHoveredRect(rect);
  }, []);

  const handleRectMouseLeave = useCallback(() => {
    setHoveredRect(null);
  }, []);

  const handleRectClick = useCallback((rect: LayoutRect) => {
    onClick?.(rect.node, rect.path);
  }, [onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, rect: LayoutRect) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(rect.node, rect.path);
    }
  }, [onClick]);

  if (loading) return <LoadingState height={height} />;
  if (error) return <ErrorState error={error} />;
  if (!data.length || data.every(d => nodeValue(d) <= 0)) return <EmptyState />;

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
      onMouseMove={handleMouseMove}
    >
      <svg
        width="100%"
        height={height}
        className="overflow-visible"
        role="img"
        aria-label={`Treemap chart with ${rects.length} segments`}
      >
        {rects.map((rect, i) => {
          const color = colors[rect.colorIndex % colors.length] || DEFAULT_COLORS[0];
          const fillOpacity = rect.depth === 0 ? 0.85 : Math.max(0.4, 0.85 - rect.depth * 0.15);
          const fillColor = colorWithOpacity(color, fillOpacity);
          const isHovered = hoveredRect === rect;
          const showName = rect.width >= MIN_LABEL_WIDTH && rect.height >= MIN_LABEL_HEIGHT;
          const showValue = rect.width >= MIN_LABEL_WIDTH && rect.height >= MIN_VALUE_HEIGHT;

          const motionProps = shouldAnimate ? {
            initial: { scaleX: 0, scaleY: 0, opacity: 0 },
            animate: { scaleX: 1, scaleY: 1, opacity: 1 },
            transition: {
              duration: 0.5,
              delay: i * 0.02,
              ease: ANIMATION_EASING,
            },
          } : {};

          const transformOrigin = `${rect.x}px ${rect.y}px`;

          return (
            <motion.g
              key={`${rect.path.join('/')}-${i}`}
              style={{ transformOrigin }}
              {...motionProps}
            >
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                fill={fillColor}
                rx={Math.min(3, rect.width / 4, rect.height / 4)}
                className="cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  filter: isHovered && !reduceMotion ? `brightness(1.2) drop-shadow(0 0 4px ${color})` : 'none',
                  transition: reduceMotion ? 'none' : `filter ${HOVER_DURATION}s ease-out`,
                }}
                tabIndex={0}
                role="graphics-symbol"
                aria-label={`${rect.node.name}: ${formatValue(nodeValue(rect.node))} (${rect.percentage.toFixed(1)}%)`}
                onMouseEnter={() => handleRectMouseEnter(rect)}
                onMouseLeave={handleRectMouseLeave}
                onFocus={() => handleRectMouseEnter(rect)}
                onBlur={handleRectMouseLeave}
                onClick={() => handleRectClick(rect)}
                onKeyDown={(e) => handleKeyDown(e, rect)}
              />

              {/* Labels inside rectangles */}
              {showName && (
                <text
                  x={rect.x + rect.width / 2}
                  y={rect.y + (showValue ? rect.height / 2 - 6 : rect.height / 2)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={Math.min(12, rect.width / 6)}
                  className="fill-foreground pointer-events-none select-none"
                  style={{ fontWeight: 500 }}
                >
                  {rect.node.name.length > rect.width / 7
                    ? rect.node.name.slice(0, Math.floor(rect.width / 7)) + '\u2026'
                    : rect.node.name}
                </text>
              )}
              {showValue && (
                <text
                  x={rect.x + rect.width / 2}
                  y={rect.y + rect.height / 2 + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={Math.min(10, rect.width / 8)}
                  className="fill-muted-foreground pointer-events-none select-none"
                >
                  {formatValue(nodeValue(rect.node))}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {(() => {
        const tipColor = hoveredRect
          ? colors[hoveredRect.colorIndex % colors.length] || DEFAULT_COLORS[0]
          : DEFAULT_COLORS[0];
        const tipData: TreemapChartTooltipData | null = hoveredRect
          ? {
              name: hoveredRect.node.name,
              value: nodeValue(hoveredRect.node),
              formattedValue: formatValue(nodeValue(hoveredRect.node)),
              percentage: hoveredRect.percentage,
              path: hoveredRect.path,
              color: tipColor,
            }
          : null;

        return (
          <ChartTooltip
            visible={hoveredRect != null}
            x={Math.min(mousePos.x + 12, containerWidth - 160)}
            y={Math.max(10, mousePos.y - 60)}
          >
            {tipData && (
              tooltipRenderer ? tooltipRenderer(tipData) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: tipData.color }}
                    />
                    <span className="text-xs font-medium text-foreground whitespace-nowrap">
                      {tipData.name}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-primary tabular-nums">
                    {tipData.formattedValue}
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    {tipData.percentage.toFixed(1)}% of total
                  </div>
                  {tipData.path.length > 1 && (
                    <div className="text-xs text-muted-foreground mt-1 pt-1 border-t border-border/50">
                      {tipData.path.join(' \u203A ')}
                    </div>
                  )}
                </>
              )
            )}
          </ChartTooltip>
        );
      })()}
    </div>
  );
}

export const TreeMapChart = memo(TreeMapChartComponent);
export { DEFAULT_COLORS };
