"use client";

import * as React from "react";
import { memo, useMemo, useCallback } from "react";
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
  readonly variant?: "tapered" | "straight" | "horizontal";
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

interface ProcessedVerticalStage<T> {
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

interface ProcessedHorizontalStage<T> {
  readonly data: T;
  readonly index: number;
  readonly labelText: string;
  readonly rawValue: number;
  readonly formattedValue: string;
  readonly pctOfTotal: number;
  readonly pctFromPrev: number | null;
  readonly color: string;
  readonly sx: number;    // stage left x
  readonly sw: number;    // stage width
  readonly sy: number;    // stage top y
  readonly sh: number;    // stage height
  readonly cy: number;    // center y of whole chart area
}

// Constants
const DEFAULT_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4",
] as const;

const DEFAULT_HEIGHT = 400;
const MARGIN = { top: 16, right: 24, bottom: 16, left: 24 };
const STAGE_GAP = 6;
const STAGE_GAP_WITH_RATES = 36;
const MIN_STAGE_RATIO = 0.15;
const H_STAGE_GAP = 10;   // horizontal gap between stages

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

import { useRef } from "react";

function useContainerDimensions() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);

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

// ── Vertical funnel (tapered / straight) ─────────────────────────────────────

function VerticalFunnel<T extends ChartDataItem>({
  processedStages,
  hoveredIndex,
  setHoveredIndex,
  showValues,
  showPercentages,
  showConversionRates,
  shouldAnimate,
  onClick,
  handleKeyDown,
  height,
  stageGap,
}: {
  processedStages: ProcessedVerticalStage<T>[];
  hoveredIndex: number | null;
  setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>;
  showValues: boolean;
  showPercentages: boolean;
  showConversionRates: boolean;
  shouldAnimate: boolean;
  onClick: ((item: T, index: number) => void) | undefined;
  handleKeyDown: (e: React.KeyboardEvent, item: T, index: number) => void;
  height: number;
  stageGap: number;
}) {
  return (
    <svg
      width="100%"
      height={height}
      className="overflow-visible"
      role="img"
      aria-label={`Funnel chart with ${processedStages.length} stages`}
    >
      {processedStages.map((stage) => {
        const isHovered = hoveredIndex === stage.index;
        const stagePoints = buildPolygon(stage.cx, stage.topWidth, stage.bottomWidth, stage.stageY, stage.stageHeight);
        const centerY = stage.stageY + stage.stageHeight / 2;
        const gapCenterY = stage.connectorY + stageGap / 2;

        return (
          <g key={stage.index}>
            {/* Connector */}
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

            {/* Conversion rate badge in gap */}
            {showConversionRates && stage.pctFromPrev !== null && stage.index > 0 && (
              <g>
                <rect
                  x={stage.cx - 36}
                  y={gapCenterY - 10}
                  width={72}
                  height={20}
                  rx={10}
                  ry={10}
                  className="fill-muted stroke-border"
                  strokeWidth={1}
                />
                <text
                  x={stage.cx}
                  y={gapCenterY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10}
                  className="fill-muted-foreground pointer-events-none"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  ↓ {stage.pctFromPrev.toFixed(0)}%
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Horizontal funnel (rectangles + trapezoid connectors) ────────────────────

function HorizontalFunnel<T extends ChartDataItem>({
  processedH,
  hoveredIndex,
  setHoveredIndex,
  showValues,
  showPercentages,
  showConversionRates,
  shouldAnimate,
  onClick,
  handleKeyDown,
  height,
}: {
  processedH: ProcessedHorizontalStage<T>[];
  hoveredIndex: number | null;
  setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>;
  showValues: boolean;
  showPercentages: boolean;
  showConversionRates: boolean;
  shouldAnimate: boolean;
  onClick: ((item: T, index: number) => void) | undefined;
  handleKeyDown: (e: React.KeyboardEvent, item: T, index: number) => void;
  height: number;
}) {
  return (
    <svg
      width="100%"
      height={height}
      className="overflow-visible"
      role="img"
      aria-label={`Horizontal funnel chart with ${processedH.length} stages`}
    >
      {processedH.map((stage, i) => {
        const isHovered = hoveredIndex === stage.index;
        const nextStage = processedH[i + 1];
        const rectCx = stage.sx + stage.sw / 2;
        const rectCy = stage.sy + stage.sh / 2;
        const labelY = stage.sy - 6;
        const valueY = stage.sy + stage.sh + 6;

        return (
          <g key={stage.index}>
            {/* Trapezoid connector to next stage */}
            {nextStage && (
              <polygon
                points={[
                  `${stage.sx + stage.sw},${stage.sy}`,
                  `${nextStage.sx},${nextStage.sy}`,
                  `${nextStage.sx},${nextStage.sy + nextStage.sh}`,
                  `${stage.sx + stage.sw},${stage.sy + stage.sh}`,
                ].join(" ")}
                fill={stage.color}
                fillOpacity={0.10}
              />
            )}

            {/* Stage rectangle */}
            <motion.rect
              x={stage.sx}
              y={stage.sy}
              width={stage.sw}
              height={stage.sh}
              rx={4}
              ry={4}
              fill={stage.color}
              fillOpacity={isHovered ? 0.9 : 0.75}
              stroke={stage.color}
              strokeWidth={isHovered ? 2 : 0}
              strokeOpacity={0.6}
              className={cn("outline-none", onClick && "cursor-pointer")}
              style={{
                transformOrigin: `${rectCx}px ${rectCy}px`,
                filter: isHovered ? `drop-shadow(0 0 6px ${stage.color})` : "none",
              }}
              initial={shouldAnimate ? { scaleY: 0, opacity: 0 } : { scaleY: 1, opacity: 1 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={
                shouldAnimate
                  ? { duration: 0.45, delay: stage.index * 0.07, ease: [0.4, 0, 0.2, 1] }
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

            {/* Label above */}
            <text
              x={rectCx}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="auto"
              fontSize={11}
              fontWeight="600"
              className="fill-foreground pointer-events-none"
            >
              {stage.labelText}
            </text>

            {/* Value + pct below */}
            {(showValues || showPercentages) && (
              <text
                x={rectCx}
                y={valueY}
                textAnchor="middle"
                dominantBaseline="hanging"
                fontSize={10}
                className="fill-muted-foreground pointer-events-none"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {showValues && stage.formattedValue}
                {showValues && showPercentages && " · "}
                {showPercentages && `${stage.pctOfTotal.toFixed(1)}%`}
              </text>
            )}

            {/* Conversion rate in connector gap */}
            {showConversionRates && stage.pctFromPrev !== null && stage.index > 0 && (() => {
              const prevStage = processedH[i - 1]!;
              const gapCx = prevStage.sx + prevStage.sw + H_STAGE_GAP / 2;
              const rateCy = stage.cy + stage.sh / 2 + 10;
              return (
                <text
                  key="conv"
                  x={gapCx}
                  y={rateCy}
                  textAnchor="middle"
                  dominantBaseline="hanging"
                  fontSize={9}
                  className="fill-muted-foreground pointer-events-none"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  ↓{stage.pctFromPrev.toFixed(0)}%
                </text>
              );
            })()}
          </g>
        );
      })}
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

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
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animation && !reduceMotion;

  const chartWidth = Math.max(0, containerWidth - MARGIN.left - MARGIN.right);
  const stageGap = showConversionRates ? STAGE_GAP_WITH_RATES : STAGE_GAP;

  // ── Vertical stages (tapered / straight) ──
  const processedStages = useMemo((): ProcessedVerticalStage<T>[] => {
    if (variant === "horizontal" || !data.length || chartWidth <= 0) return [];

    const values = data.map(d => Math.max(0, getNumericValue(d, value as string)));
    const total = values[0] ?? 1;
    const stageCount = data.length;

    const availableHeight = height - MARGIN.top - MARGIN.bottom;
    const stageHeight = (availableHeight - (stageCount - 1) * stageGap) / stageCount;
    const cx = containerWidth / 2;

    return data.map((item, i) => {
      const rawValue = values[i] ?? 0;
      const ratio = total > 0 ? rawValue / total : 0;
      const prevValue = i > 0 ? (values[i - 1] ?? 0) : null;
      const pctFromPrev = prevValue !== null && prevValue > 0 ? (rawValue / prevValue) * 100 : null;

      let topWidth: number, bottomWidth: number;
      if (variant === "straight") {
        topWidth = chartWidth;
        bottomWidth = chartWidth;
      } else {
        const clampedRatio = Math.max(MIN_STAGE_RATIO, ratio);
        const clampedPrevRatio = i === 0 ? 1 : Math.max(MIN_STAGE_RATIO, (values[i - 1] ?? 0) / total);
        topWidth = chartWidth * clampedPrevRatio;
        bottomWidth = chartWidth * clampedRatio;
      }

      const stageY = MARGIN.top + i * (stageHeight + stageGap);
      const connectorY = stageY + stageHeight;
      const connectorBottomWidth = i < stageCount - 1
        ? variant === "straight"
          ? chartWidth
          : chartWidth * Math.max(MIN_STAGE_RATIO, (values[i + 1] ?? 0) / total)
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
        connectorHeight: stageGap,
        connectorTopWidth: bottomWidth,
        connectorBottomWidth,
      };
    });
  }, [data, label, value, colors, variant, chartWidth, height, containerWidth, stageGap]);

  // ── Horizontal stages ──
  const processedH = useMemo((): ProcessedHorizontalStage<T>[] => {
    if (variant !== "horizontal" || !data.length || chartWidth <= 0) return [];

    const values = data.map(d => Math.max(0, getNumericValue(d, value as string)));
    const total = values[0] ?? 1;
    const n = data.length;

    const labelAreaTop = 22;
    const labelAreaBottom = (showValues || showPercentages) ? 22 : 0;
    const convAreaBottom = showConversionRates ? 18 : 0;
    const innerHeight = height - MARGIN.top - MARGIN.bottom - labelAreaTop - labelAreaBottom - convAreaBottom;
    const maxHalfH = Math.max(4, innerHeight / 2);
    const cy = MARGIN.top + labelAreaTop + innerHeight / 2;

    const sw = (chartWidth - (n - 1) * H_STAGE_GAP) / n;

    return data.map((item, i) => {
      const rawValue = values[i] ?? 0;
      const ratio = total > 0 ? rawValue / total : 0;
      const clampedRatio = Math.max(MIN_STAGE_RATIO, ratio);
      const halfH = maxHalfH * clampedRatio;
      const sh = halfH * 2;

      const prevValue = i > 0 ? (values[i - 1] ?? 0) : null;
      const pctFromPrev = prevValue !== null && prevValue > 0 ? (rawValue / prevValue) * 100 : null;
      const sx = MARGIN.left + i * (sw + H_STAGE_GAP);

      return {
        data: item,
        index: i,
        labelText: String(item[label]),
        rawValue,
        formattedValue: formatValue(rawValue),
        pctOfTotal: total > 0 ? (rawValue / total) * 100 : 0,
        pctFromPrev,
        color: colors[i % colors.length] ?? DEFAULT_COLORS[0],
        sx,
        sw,
        sy: cy - halfH,
        sh,
        cy,
      };
    });
  }, [data, label, value, colors, variant, chartWidth, height, showValues, showPercentages, showConversionRates]);

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
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const hoveredStage = hoveredIndex !== null
    ? (variant === "horizontal" ? processedH[hoveredIndex] : processedStages[hoveredIndex])
    : null;

  const tooltipLeft = variant === "horizontal" && hoveredStage
    ? (hoveredStage as ProcessedHorizontalStage<T>).sx + (hoveredStage as ProcessedHorizontalStage<T>).sw / 2
    : hoveredStage ? (hoveredStage as ProcessedVerticalStage<T>).cx : 0;

  const tooltipTop = variant === "horizontal" && hoveredStage
    ? Math.max(8, (hoveredStage as ProcessedHorizontalStage<T>).sy - 80)
    : hoveredStage ? Math.max(8, (hoveredStage as ProcessedVerticalStage<T>).stageY - 80) : 0;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)} style={{ height }}>
      {variant === "horizontal" ? (
        <HorizontalFunnel
          processedH={processedH}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
          showValues={showValues}
          showPercentages={showPercentages}
          showConversionRates={showConversionRates}
          shouldAnimate={shouldAnimate}
          onClick={onClick}
          handleKeyDown={handleKeyDown}
          height={height}
        />
      ) : (
        <VerticalFunnel
          processedStages={processedStages}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
          showValues={showValues}
          showPercentages={showPercentages}
          showConversionRates={showConversionRates}
          shouldAnimate={shouldAnimate}
          onClick={onClick}
          handleKeyDown={handleKeyDown}
          height={height}
          stageGap={stageGap}
        />
      )}

      <AnimatePresence>
        {hoveredStage && (
          <motion.div
            key="funnel-tooltip"
            initial={{ opacity: 0, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, x: "-50%" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute pointer-events-none z-50 bg-popover/98 backdrop-blur-md border border-border rounded-lg px-3 py-2.5 shadow-xl"
            style={{ left: tooltipLeft, top: tooltipTop }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredStage.color }} />
              <span className="text-xs font-medium text-foreground whitespace-nowrap">{hoveredStage.labelText}</span>
            </div>
            <div className="text-sm font-bold text-primary tabular-nums text-center">
              {hoveredStage.formattedValue}
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {hoveredStage.pctOfTotal.toFixed(1)}% of total
            </div>
            {hoveredStage.pctFromPrev !== null && (
              <div className="text-xs text-muted-foreground text-center">
                {hoveredStage.pctFromPrev.toFixed(1)}% from prev
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const FunnelChart = memo(FunnelChartComponent) as typeof FunnelChartComponent;
export type { FunnelChartProps };
