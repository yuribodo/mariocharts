"use client";

import * as React from "react";
import { memo, useMemo, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../../../lib/utils";
import {
  formatValue,
  calculateNiceTicks,
  getGridDasharray,
  useContainerDimensions,
  ChartTooltip,
} from "../_shared";
import type { ChartDataItem, WaterfallChartTooltipData, TooltipRenderer } from "../_shared";
import { computeWaterfallSeries, formatWaterfallDelta } from "./utils";
import type { WaterfallBar } from "./utils";

interface WaterfallColors {
  readonly increase?: string;
  readonly decrease?: string;
  readonly total?: string;
}

interface WaterfallChartProps<T extends ChartDataItem> {
  readonly data: readonly T[];
  /** Key holding each step's label. Defaults to `"label"`. */
  readonly x?: keyof T;
  /** Key holding each step's numeric value. Defaults to `"value"`. */
  readonly y?: keyof T;
  /** Key holding each step's type (`"increase" | "decrease" | "total"`). Defaults to `"type"`; inferred from sign when absent. */
  readonly type?: keyof T;
  readonly colors?: WaterfallColors;
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly orientation?: "vertical" | "horizontal";
  /** Draw the connector lines that link each step's running total to the next. Defaults to `true`. */
  readonly showConnectors?: boolean;
  /** Render the signed delta / total on each bar. Defaults to `false`. */
  readonly showValues?: boolean;
  readonly showGrid?: boolean;
  readonly gridStyle?: "solid" | "dashed" | "dotted";
  /** Show the increase/decrease/total legend. Defaults to `false`. */
  readonly showLegend?: boolean;
  readonly onBarClick?: (data: T, index: number) => void;
  readonly tooltipRenderer?: TooltipRenderer<WaterfallChartTooltipData<T>>;
}

// Constants
const DEFAULT_COLORS: Required<WaterfallColors> = {
  increase: "#10b981",
  decrease: "#ef4444",
  total: "#3b82f6",
};

const DEFAULT_HEIGHT = 300;
const MARGIN = { top: 24, right: 24, bottom: 40, left: 56 };
const ANIMATION_EASING = [0.4, 0, 0.2, 1] as const;
const HOVER_DURATION = 0.2;

// Loading/Error/Empty States
function LoadingState({ height = DEFAULT_HEIGHT }: { height?: number }) {
  const heights = [30, 55, 45, 70, 60];
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
            <div className="flex items-end space-x-3 h-full">
              {heights.map((h, i) => (
                <div
                  key={i}
                  className="bg-muted rounded animate-pulse flex-1"
                  style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
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

function Legend({ colors }: { colors: Required<WaterfallColors> }) {
  const items = [
    { label: "Increase", color: colors.increase },
    { label: "Decrease", color: colors.decrease },
    { label: "Total", color: colors.total },
  ] as const;
  return (
    <div className="flex items-center justify-center gap-4 mt-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Main Component
function WaterfallChartComponent<T extends ChartDataItem>({
  data,
  x = "label" as keyof T,
  y = "value" as keyof T,
  type = "type" as keyof T,
  colors,
  className,
  height = DEFAULT_HEIGHT,
  loading = false,
  error = null,
  animation = true,
  orientation = "vertical",
  showConnectors = true,
  showValues = false,
  showGrid = false,
  gridStyle = "dashed",
  showLegend = false,
  onBarClick,
  tooltipRenderer,
}: WaterfallChartProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const reduceMotion = useReducedMotion();
  const shouldAnimate = animation && !reduceMotion;

  const palette = useMemo<Required<WaterfallColors>>(
    () => ({ ...DEFAULT_COLORS, ...colors }),
    [colors]
  );

  const isVertical = orientation === "vertical";
  const chartWidth = Math.max(0, containerWidth - MARGIN.left - MARGIN.right);
  const chartHeight = height - MARGIN.top - MARGIN.bottom;

  // Dev warning for large datasets
  if (process.env.NODE_ENV === "development" && data.length > 50) {
    // eslint-disable-next-line no-console
    console.warn(
      `[WaterfallChart] ${data.length} data points detected. Waterfall charts read best with a small number of steps.`
    );
  }

  const series = useMemo(
    () => computeWaterfallSeries(data, { label: x, value: y, type }),
    [data, x, y, type]
  );

  const ticks = useMemo(() => {
    const { min, max } = series.domain;
    if (min === max) return [min];
    return calculateNiceTicks(min, max, 5);
  }, [series.domain]);

  const scale = useMemo(() => {
    const min = Math.min(series.domain.min, ...ticks);
    const max = Math.max(series.domain.max, ...ticks);
    const span = max - min || 1;
    return { min, max, span };
  }, [series.domain, ticks]);

  const gridDasharray = useMemo(() => getGridDasharray(gridStyle), [gridStyle]);

  // Map a value to a pixel position along the value axis (px from plot origin).
  const valueToPixel = useCallback(
    (value: number) => {
      const ratio = (value - scale.min) / scale.span;
      return isVertical ? chartHeight - ratio * chartHeight : ratio * chartWidth;
    },
    [scale, isVertical, chartHeight, chartWidth]
  );

  const bars = useMemo(() => {
    if (!series.bars.length || chartWidth <= 0 || chartHeight <= 0) return [];

    const count = series.bars.length;
    const slot = (isVertical ? chartWidth : chartHeight) / count;
    const thickness = slot * 0.68;
    const pad = (slot - thickness) / 2;

    return series.bars.map((bar) => {
      const cross = bar.index * slot + pad; // position along the category axis
      const lowPx = valueToPixel(bar.displayStart);
      const highPx = valueToPixel(bar.displayEnd);
      const startPx = valueToPixel(bar.start); // animation origin (running total before step)
      const color = palette[bar.type];

      // In vertical mode higher value → smaller y, so the "high" edge is the top (min y).
      const rect = isVertical
        ? { x: cross, y: Math.min(lowPx, highPx), width: thickness, height: Math.abs(lowPx - highPx) }
        : { x: Math.min(lowPx, highPx), y: cross, width: Math.abs(lowPx - highPx), height: thickness };

      return { bar, color, cross, thickness, startPx, rect };
    });
  }, [series.bars, chartWidth, chartHeight, isVertical, valueToPixel, palette]);

  const zeroPixel = useMemo(() => valueToPixel(0), [valueToPixel]);

  // Event handlers
  const handleMouseEnter = useCallback((index: number) => setHoveredIndex(index), []);
  const handleMouseLeave = useCallback(() => setHoveredIndex(null), []);
  const handleClick = useCallback(
    (barData: T, index: number) => onBarClick?.(barData, index),
    [onBarClick]
  );
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, barData: T, index: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onBarClick?.(barData, index);
      }
    },
    [onBarClick]
  );

  if (loading) return <LoadingState height={height} />;
  if (error) return <ErrorState error={error} />;
  if (!data.length) return <EmptyState />;

  if (!containerWidth) {
    return (
      <div ref={containerRef} className={cn("relative w-full", className)} style={{ height }}>
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)} style={{ height }}>
      <svg
        width="100%"
        height={height}
        className="overflow-visible"
        role="img"
        aria-label={`Waterfall chart with ${data.length} steps in ${orientation} orientation`}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Value grid lines */}
          {showGrid &&
            ticks.map((tick, i) => {
              const p = valueToPixel(tick);
              return isVertical ? (
                <line
                  key={`grid-${i}`}
                  x1={0}
                  y1={p}
                  x2={chartWidth}
                  y2={p}
                  stroke="currentColor"
                  opacity={0.1}
                  strokeDasharray={gridDasharray}
                />
              ) : (
                <line
                  key={`grid-${i}`}
                  x1={p}
                  y1={0}
                  x2={p}
                  y2={chartHeight}
                  stroke="currentColor"
                  opacity={0.1}
                  strokeDasharray={gridDasharray}
                />
              );
            })}

          {/* Value-axis ticks + labels */}
          {ticks.map((tick, i) => {
            const p = valueToPixel(tick);
            return isVertical ? (
              <g key={`tick-${i}`}>
                <line x1={-4} y1={p} x2={0} y2={p} stroke="currentColor" opacity={0.3} />
                <text
                  x={-8}
                  y={p}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  className="fill-muted-foreground"
                >
                  {formatValue(tick)}
                </text>
              </g>
            ) : (
              <g key={`tick-${i}`}>
                <line x1={p} y1={chartHeight} x2={p} y2={chartHeight + 4} stroke="currentColor" opacity={0.3} />
                <text
                  x={p}
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

          {/* Baseline (value = 0) */}
          {isVertical ? (
            <line x1={0} y1={zeroPixel} x2={chartWidth} y2={zeroPixel} stroke="currentColor" opacity={0.35} strokeWidth={1.5} />
          ) : (
            <line x1={zeroPixel} y1={0} x2={zeroPixel} y2={chartHeight} stroke="currentColor" opacity={0.35} strokeWidth={1.5} />
          )}

          {/* Connector lines between consecutive steps */}
          {showConnectors &&
            bars.map((b, i) => {
              if (i === bars.length - 1) return null;
              const next = bars[i + 1];
              if (!next) return null;
              const level = valueToPixel(b.bar.cumulative);
              return isVertical ? (
                <line
                  key={`conn-${i}`}
                  x1={b.rect.x + b.thickness}
                  y1={level}
                  x2={next.rect.x}
                  y2={level}
                  stroke="currentColor"
                  opacity={0.35}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                />
              ) : (
                <line
                  key={`conn-${i}`}
                  x1={level}
                  y1={b.rect.y + b.thickness}
                  x2={level}
                  y2={next.rect.y}
                  stroke="currentColor"
                  opacity={0.35}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                />
              );
            })}

          {/* Bars */}
          {bars.map(({ bar, color, rect, startPx }) => {
            const isHovered = hoveredIndex === bar.index;
            const transformOrigin = isVertical
              ? `${rect.x + rect.width / 2}px ${startPx}px`
              : `${startPx}px ${rect.y + rect.height / 2}px`;

            const motionProps = shouldAnimate
              ? {
                  initial: isVertical ? { scaleY: 0 } : { scaleX: 0 },
                  animate: isVertical ? { scaleY: 1 } : { scaleX: 1 },
                  transition: { duration: 0.6, delay: bar.index * 0.06, ease: ANIMATION_EASING },
                }
              : {};

            const deltaLabel = formatWaterfallDelta(bar, formatValue);
            const a11yLabel = `${bar.label}: ${bar.type}, ${deltaLabel}, running total ${formatValue(bar.cumulative)}`;

            return (
              <g key={bar.index}>
                <motion.rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={Math.max(rect.height, 1)}
                  fill={color}
                  rx={3}
                  className="cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    transformOrigin,
                    filter: isHovered && !reduceMotion ? `drop-shadow(0 0 6px ${color})` : "none",
                    transition: reduceMotion ? "none" : `filter ${HOVER_DURATION}s ease-out`,
                  }}
                  {...motionProps}
                  tabIndex={0}
                  role="graphics-symbol"
                  aria-label={a11yLabel}
                  onMouseEnter={() => handleMouseEnter(bar.index)}
                  onMouseLeave={handleMouseLeave}
                  onFocus={() => handleMouseEnter(bar.index)}
                  onBlur={handleMouseLeave}
                  onClick={() => handleClick(bar.data, bar.index)}
                  onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, bar.data, bar.index)}
                />

                {/* Value label on the bar */}
                {showValues &&
                  (isVertical ? (
                    <text
                      x={rect.x + rect.width / 2}
                      y={rect.y - 6}
                      textAnchor="middle"
                      fontSize={11}
                      className="fill-foreground font-medium select-none pointer-events-none"
                    >
                      {deltaLabel}
                    </text>
                  ) : (
                    <text
                      x={rect.x + rect.width + 6}
                      y={rect.y + rect.height / 2}
                      textAnchor="start"
                      dominantBaseline="middle"
                      fontSize={11}
                      className="fill-foreground font-medium select-none pointer-events-none"
                    >
                      {deltaLabel}
                    </text>
                  ))}
              </g>
            );
          })}

          {/* Category labels */}
          {bars.map(({ bar, cross, thickness }) => (
            <g key={`cat-${bar.index}`}>
              {isVertical ? (
                <text
                  x={cross + thickness / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  fontSize={11}
                  className="fill-muted-foreground"
                >
                  {bar.label}
                </text>
              ) : (
                <text
                  x={-8}
                  y={cross + thickness / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  className="fill-muted-foreground"
                >
                  {bar.label}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      {(() => {
        const hovered = hoveredIndex !== null ? bars[hoveredIndex] : null;
        if (!hovered) {
          return <ChartTooltip visible={false} x={0} y={0}>{null}</ChartTooltip>;
        }
        const { bar, color, rect } = hovered;
        const tipData: WaterfallChartTooltipData<T> = {
          label: bar.label,
          type: bar.type,
          value: bar.value,
          cumulative: bar.cumulative,
          color,
          index: bar.index,
          data: bar.data,
        };

        const tooltipPos = isVertical
          ? {
              left: rect.x + rect.width / 2 + MARGIN.left,
              top: Math.max(10, rect.y + MARGIN.top - 12),
            }
          : {
              left: rect.x + rect.width + MARGIN.left + 10,
              top: rect.y + rect.height / 2 + MARGIN.top,
            };

        return (
          <ChartTooltip
            visible
            x={tooltipPos.left}
            y={tooltipPos.top}
            className={isVertical ? "transform -translate-x-1/2 -translate-y-full" : "transform -translate-y-1/2"}
          >
            {tooltipRenderer ? (
              tooltipRenderer(tipData)
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-medium text-foreground whitespace-nowrap">
                    {bar.label}
                  </span>
                </div>
                <div className="text-sm font-bold text-primary tabular-nums text-center">
                  {formatWaterfallDelta(bar, formatValue)}
                </div>
                <div className="text-[11px] text-muted-foreground tabular-nums text-center mt-0.5">
                  Total: {formatValue(bar.cumulative)}
                </div>
              </>
            )}
          </ChartTooltip>
        );
      })()}

      {showLegend && <Legend colors={palette} />}
    </div>
  );
}

export const WaterfallChart = memo(WaterfallChartComponent);
export type { WaterfallChartProps, WaterfallColors };
export type { WaterfallBar, WaterfallType } from "./utils";
export { DEFAULT_COLORS };
