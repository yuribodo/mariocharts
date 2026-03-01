"use client";

import * as React from "react";
import { memo, useMemo, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useIsomorphicLayoutEffect } from "../../../../lib/hooks";
import { cn } from "../../../../lib/utils";

// Types
type ChartDataItem = Record<string, unknown>;

interface FunnelChartProps<T extends ChartDataItem> {
  readonly data: readonly T[];
  readonly label: keyof T;
  readonly value: keyof T;
  readonly colors?: readonly string[];
  readonly variant?: "tapered" | "straight";
  readonly showValues?: boolean;
  readonly showPercentages?: boolean;
  readonly showConversionRates?: boolean;
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly onClick?: (item: T, index: number) => void;
}

interface ProcessedStage<T> {
  readonly data: T;
  readonly index: number;
  readonly labelText: string;
  readonly rawValue: number;
  readonly formattedValue: string;
  readonly pctOfTotal: number;
  readonly pctFromPrev: number | null;
  readonly color: string;
  readonly topWidth: number;
  readonly bottomWidth: number;
  readonly cx: number;
  readonly stageY: number;
  readonly stageHeight: number;
  readonly connectorY: number;
  readonly connectorHeight: number;
  readonly connectorTopWidth: number;
  readonly connectorBottomWidth: number;
}

// Constants
const DEFAULT_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4",
] as const;

const DEFAULT_HEIGHT = 400;
const MARGIN = { top: 16, right: 24, bottom: 16, left: 24 };
const STAGE_GAP = 6;
const MIN_STAGE_WIDTH_RATIO = 0.15; // minimum 15% width even for tiny values

// Utilities
function getNumericValue(data: ChartDataItem, key: keyof ChartDataItem): number {
  const val = data[key];
  if (typeof val === "number" && isFinite(val)) return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val.replace(/[,$%\s]/g, ""));
    if (isFinite(parsed)) return parsed;
  }
  return 0;
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function buildPolygon(cx: number, topW: number, bottomW: number, y: number, h: number): string {
  const tl = cx - topW / 2;
  const tr = cx + topW / 2;
  const bl = cx - bottomW / 2;
  const br = cx + bottomW / 2;
  return `${tl},${y} ${tr},${y} ${br},${y + h} ${bl},${y + h}`;
}

function useContainerDimensions() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rafId = 0;
    const update = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setWidth(el.getBoundingClientRect().width));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return [ref, width] as const;
}

// States
function LoadingState({ height }: { height: number }) {
  return (
    <div className="relative w-full flex items-center justify-center" style={{ height }}>
      <div className="w-full px-8 space-y-2 animate-pulse">
        {[80, 65, 50, 35, 20].map((pct, i) => (
          <div
            key={i}
            className="mx-auto rounded bg-muted"
            style={{ width: `${pct}%`, height: 44, animationDelay: `${i * 0.1}s` }}
          />
        ))}
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
        <div className="text-sm text-muted-foreground">There&apos;s no data to display</div>
      </div>
    </div>
  );
}

// Main component
function FunnelChartComponent<T extends ChartDataItem>({
  data,
  label,
  value,
  colors = DEFAULT_COLORS,
  variant = "tapered",
  showValues = true,
  showPercentages = true,
  showConversionRates = false,
  className,
  height = DEFAULT_HEIGHT,
  loading = false,
  error = null,
  animation = true,
  onClick,
}: FunnelChartProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animation && !reduceMotion;

  // All useMemo BEFORE early returns
  const chartWidth = Math.max(0, containerWidth - MARGIN.left - MARGIN.right);

  const processedStages = useMemo((): ProcessedStage<T>[] => {
    if (!data.length || chartWidth <= 0) return [];

    const values = data.map(d => Math.max(0, getNumericValue(d, value as string)));
    const total = values[0] ?? 1; // First stage is total (100%)
    const stageCount = data.length;
    const connectorCount = stageCount - 1;

    // Total vertical space available
    const availableHeight = height - MARGIN.top - MARGIN.bottom;
    const totalConnectorHeight = connectorCount * STAGE_GAP;
    const stageHeight = (availableHeight - totalConnectorHeight) / stageCount;

    const cx = containerWidth / 2;

    const stages: ProcessedStage<T>[] = data.map((item, i) => {
      const rawValue = values[i] ?? 0;
      const ratio = total > 0 ? rawValue / total : 0;
      const prevValue = i > 0 ? (values[i - 1] ?? 0) : null;
      const pctFromPrev = prevValue !== null && prevValue > 0 ? (rawValue / prevValue) * 100 : null;

      let topWidth: number;
      let bottomWidth: number;

      if (variant === "straight") {
        topWidth = chartWidth;
        bottomWidth = chartWidth;
      } else {
        // Tapered: width proportional to ratio, with minimum floor
        const clampedRatio = Math.max(MIN_STAGE_WIDTH_RATIO, ratio);
        const clampedPrevRatio = i === 0
          ? 1
          : Math.max(MIN_STAGE_WIDTH_RATIO, (values[i - 1] ?? 0) / total);

        topWidth = chartWidth * clampedPrevRatio;
        bottomWidth = chartWidth * clampedRatio;
      }

      const stageY = MARGIN.top + i * (stageHeight + STAGE_GAP);
      const connectorY = stageY + stageHeight;
      const connectorBottomWidth = i < stageCount - 1
        ? variant === "straight"
          ? chartWidth
          : chartWidth * Math.max(MIN_STAGE_WIDTH_RATIO, (values[i + 1] ?? 0) / total)
        : bottomWidth;

      return {
        data: item,
        index: i,
        labelText: String(item[label]),
        rawValue,
        formattedValue: formatValue(rawValue),
        pctOfTotal: total > 0 ? (rawValue / total) * 100 : 0,
        pctFromPrev,
        color: colors[i % colors.length] ?? DEFAULT_COLORS[0],
        topWidth,
        bottomWidth,
        cx,
        stageY,
        stageHeight,
        connectorY,
        connectorHeight: STAGE_GAP,
        connectorTopWidth: bottomWidth,
        connectorBottomWidth,
      };
    });

    return stages;
  }, [data, label, value, colors, variant, chartWidth, height, containerWidth]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, item: T, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(item, index);
    }
  }, [onClick]);

  if (loading) return <LoadingState height={height} />;
  if (error) return <ErrorState error={error} />;
  if (!data.length) return <EmptyState />;

  if (!containerWidth) {
    return (
      <div ref={containerRef} className={cn("relative w-full", className)} style={{ height }}>
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading...</div>
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
        aria-label={`Funnel chart with ${data.length} stages`}
      >
        {processedStages.map((stage) => {
          const isHovered = hoveredIndex === stage.index;
          const stagePoints = buildPolygon(stage.cx, stage.topWidth, stage.bottomWidth, stage.stageY, stage.stageHeight);
          const centerY = stage.stageY + stage.stageHeight / 2;

          return (
            <g key={stage.index}>
              {/* Connector (gap between stages) */}
              {stage.index < processedStages.length - 1 && (
                <polygon
                  points={buildPolygon(
                    stage.cx,
                    stage.connectorTopWidth,
                    stage.connectorBottomWidth,
                    stage.connectorY,
                    stage.connectorHeight,
                  )}
                  fill={stage.color}
                  fillOpacity={0.12}
                />
              )}

              {/* Stage bar */}
              <motion.polygon
                points={stagePoints}
                fill={stage.color}
                fillOpacity={isHovered ? 0.9 : 0.75}
                stroke={stage.color}
                strokeWidth={isHovered ? 2 : 0}
                strokeOpacity={0.5}
                className={cn("outline-none", onClick && "cursor-pointer")}
                style={{
                  transformOrigin: `${stage.cx}px ${centerY}px`,
                  filter: isHovered ? `drop-shadow(0 0 6px ${stage.color})` : "none",
                }}
                initial={shouldAnimate ? { scaleY: 0, opacity: 0 } : { scaleY: 1, opacity: 1 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={
                  shouldAnimate
                    ? { duration: 0.5, delay: stage.index * 0.08, ease: [0.4, 0, 0.2, 1] }
                    : { duration: 0 }
                }
                tabIndex={0}
                role="graphics-symbol"
                aria-label={`${stage.labelText}: ${stage.formattedValue} (${stage.pctOfTotal.toFixed(1)}%)`}
                onMouseEnter={() => setHoveredIndex(stage.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(stage.index)}
                onBlur={() => setHoveredIndex(null)}
                onClick={() => onClick?.(stage.data, stage.index)}
                onKeyDown={(e) => handleKeyDown(e, stage.data, stage.index)}
              />

              {/* Stage label */}
              <text
                x={stage.cx}
                y={centerY - (showValues || showPercentages ? 8 : 0)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12}
                fontWeight="600"
                className="fill-foreground pointer-events-none"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
              >
                {stage.labelText}
              </text>

              {/* Value + percentage */}
              {(showValues || showPercentages) && (
                <text
                  x={stage.cx}
                  y={centerY + 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10}
                  className="fill-foreground/70 pointer-events-none"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {showValues && stage.formattedValue}
                  {showValues && showPercentages && " · "}
                  {showPercentages && `${stage.pctOfTotal.toFixed(1)}%`}
                </text>
              )}

              {/* Conversion rate between stages */}
              {showConversionRates && stage.pctFromPrev !== null && (
                <text
                  x={stage.cx}
                  y={stage.stageY - 2}
                  textAnchor="middle"
                  dominantBaseline="auto"
                  fontSize={9}
                  className="fill-muted-foreground pointer-events-none"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  ↓ {stage.pctFromPrev.toFixed(0)}% from prev
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredIndex !== null && processedStages[hoveredIndex] && (() => {
          const stage = processedStages[hoveredIndex];
          return (
            <motion.div
              key="funnel-tooltip"
              initial={{ opacity: 0, scale: 0.9, x: "-50%", y: 0 }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: "-50%", y: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute pointer-events-none z-50 bg-popover/98 backdrop-blur-md border border-border rounded-lg px-3 py-2.5 shadow-xl"
              style={{
                left: stage.cx,
                top: Math.max(8, stage.stageY - 80),
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-xs font-medium text-foreground whitespace-nowrap">{stage.labelText}</span>
              </div>
              <div className="text-sm font-bold text-primary tabular-nums text-center">
                {stage.formattedValue}
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {stage.pctOfTotal.toFixed(1)}% of total
              </div>
              {stage.pctFromPrev !== null && (
                <div className="text-xs text-muted-foreground text-center">
                  {stage.pctFromPrev.toFixed(1)}% from prev
                </div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

export const FunnelChart = memo(FunnelChartComponent) as typeof FunnelChartComponent;
export type { FunnelChartProps };
