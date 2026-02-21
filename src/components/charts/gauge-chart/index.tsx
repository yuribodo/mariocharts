"use client";

import * as React from "react";
import { memo, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useIsomorphicLayoutEffect } from "../../../../lib/hooks";
import { cn } from "../../../../lib/utils";
import {
  clampValue,
  valueToAngle,
  polarToCartesian,
  describeArcPath,
  computeZoneArcs,
  GAUGE_START_ANGLE,
  GAUGE_END_ANGLE,
} from "./utils";

/**
 * Defines a colored zone region on the gauge arc.
 */
interface GaugeZone {
  /** Data value where this zone begins (inclusive). */
  readonly from: number;
  /** Data value where this zone ends (inclusive). */
  readonly to: number;
  /** CSS color string for this zone's arc segment. */
  readonly color: string;
  /** Optional label shown in the center when the needle is in this zone. */
  readonly label?: string;
}

/**
 * Props for the {@link GaugeChart} component.
 */
interface GaugeChartProps {
  /** The current value to display on the gauge. */
  readonly value: number;
  /** Minimum value of the gauge range. @default 0 */
  readonly min?: number;
  /** Maximum value of the gauge range. @default 100 */
  readonly max?: number;
  /** Array of zone objects defining color regions. */
  readonly zones: readonly GaugeZone[];
  /** Unit label shown next to the center value (e.g. `"%"`, `"GB"`). */
  readonly unit?: string;
  /** Descriptive label shown below the center value. */
  readonly label?: string;
  /** Thickness of the gauge arc stroke in pixels. @default 20 */
  readonly strokeWidth?: number;
  /** Height of the chart container in pixels. @default 300 */
  readonly height?: number;
  /** Show loading skeleton state. @default false */
  readonly loading?: boolean;
  /** Error message to display in place of the chart. @default null */
  readonly error?: string | null;
  /** Enable entrance animation for the progress arc. @default true */
  readonly animation?: boolean;
  /** Additional CSS classes to apply to the container. */
  readonly className?: string;
}

const DEFAULT_HEIGHT = 300;
const DEFAULT_STROKE_WIDTH = 20;
const PADDING = 24;

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

function LoadingState({ height }: { height: number }) {
  const size = Math.min(height - PADDING * 2, 200);
  return (
    <div className="relative w-full flex items-center justify-center" style={{ height }}>
      <div
        className="rounded-full border-8 border-muted animate-pulse"
        style={{ width: size, height: size, borderTopColor: "hsl(var(--muted-foreground) / 0.3)" }}
      />
      <div
        className="absolute rounded-full bg-background"
        style={{ width: size * 0.6, height: size * 0.6 }}
      />
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
        <div className="text-sm text-muted-foreground">Configure zones to display the gauge</div>
      </div>
    </div>
  );
}

function GaugeChartComponent({
  value,
  min = 0,
  max = 100,
  zones,
  unit,
  label,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  height = DEFAULT_HEIGHT,
  loading = false,
  error = null,
  animation = true,
  className,
}: GaugeChartProps) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animation && !reduceMotion;

  const clampedValue = clampValue(value, min, max);

  const size = containerWidth > 0
    ? Math.min(containerWidth - PADDING * 2, height - PADDING * 2)
    : 0;
  const cx = containerWidth / 2;
  const cy = height / 2 + size * 0.1;
  const midRadius = size / 2 - strokeWidth / 2;

  const zoneArcs = useMemo(
    () => (containerWidth > 0 ? computeZoneArcs(zones, min, max) : []),
    [zones, min, max, containerWidth]
  );

  const valueAngle = useMemo(
    () => valueToAngle(clampedValue, min, max),
    [clampedValue, min, max]
  );

  const activeZone = useMemo(
    () => [...zoneArcs].reverse().find((z) => valueAngle >= z.startAngle) ?? null,
    [zoneArcs, valueAngle]
  );

  const zoneArcPaths = useMemo(
    () => zoneArcs.map((zone) => describeArcPath(cx, cy, midRadius, zone.startAngle, zone.endAngle - 0.01)),
    [zoneArcs, cx, cy, midRadius]
  );

  const bgArcPath = useMemo(
    () => (midRadius > 0 ? describeArcPath(cx, cy, midRadius, GAUGE_START_ANGLE, GAUGE_END_ANGLE - 0.01) : ''),
    [cx, cy, midRadius]
  );

  const progressArcPath = useMemo(
    () => (midRadius > 0 && clampedValue > min
      ? describeArcPath(cx, cy, midRadius, GAUGE_START_ANGLE, valueAngle)
      : ''),
    [cx, cy, midRadius, clampedValue, min, valueAngle]
  );

  const minLabelPos = useMemo(
    () => (midRadius > 0 ? polarToCartesian(cx, cy, midRadius + strokeWidth * 0.8, GAUGE_START_ANGLE) : { x: 0, y: 0 }),
    [cx, cy, midRadius, strokeWidth]
  );

  const maxLabelPos = useMemo(
    () => (midRadius > 0 ? polarToCartesian(cx, cy, midRadius + strokeWidth * 0.8, GAUGE_END_ANGLE) : { x: 0, y: 0 }),
    [cx, cy, midRadius, strokeWidth]
  );

  if (loading) return <LoadingState height={height} />;
  if (error) return <ErrorState error={error} />;
  if (!zones.length) return <EmptyState />;

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
        aria-label={`Gauge showing ${clampedValue}${unit ?? ""} of ${max}${unit ?? ""}`}
      >
        {/* Background arc */}
        <path
          d={bgArcPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.1}
        />

        {/* Zone arcs (dimmed) */}
        {zoneArcs.map((zone, i) => (
          <path
            key={i}
            d={zoneArcPaths[i]}
            fill="none"
            stroke={zone.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.2}
          />
        ))}

        {/* Progress arc */}
        {progressArcPath && (
          <motion.path
            d={progressArcPath}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              filter: activeZone ? `drop-shadow(0 0 8px ${activeZone.color})` : undefined,
            }}
            initial={{
              pathLength: shouldAnimate ? 0 : 1,
              stroke: activeZone?.color ?? "currentColor",
            }}
            animate={{
              pathLength: 1,
              stroke: activeZone?.color ?? "currentColor",
            }}
            transition={{
              pathLength: { duration: shouldAnimate ? 1.2 : 0, ease: [0.4, 0, 0.2, 1] as const },
              stroke: { duration: 0 },
            }}
          />
        )}

        {/* Min label */}
        <text
          x={minLabelPos.x}
          y={minLabelPos.y + strokeWidth}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={11}
          className="fill-muted-foreground"
        >
          {min}
        </text>

        {/* Max label */}
        <text
          x={maxLabelPos.x}
          y={maxLabelPos.y + strokeWidth}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={11}
          className="fill-muted-foreground"
        >
          {max}
        </text>

        {/* Center value */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="auto"
          fontSize={36}
          fontWeight="bold"
          className="fill-foreground"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {clampedValue.toLocaleString()}
          {unit && (
            <tspan fontSize={20} className="fill-muted-foreground">
              {" "}{unit}
            </tspan>
          )}
        </text>

        {/* Label */}
        {label && (
          <text
            x={cx}
            y={cy + 24}
            textAnchor="middle"
            fontSize={13}
            className="fill-muted-foreground"
          >
            {label}
          </text>
        )}

        {/* Active zone label */}
        {activeZone?.label && (
          <text
            x={cx}
            y={cy + 42}
            textAnchor="middle"
            fontSize={11}
            fill={activeZone.color}
            fontWeight="600"
          >
            {activeZone.label}
          </text>
        )}
      </svg>
    </div>
  );
}

export const GaugeChart = memo(GaugeChartComponent);
export type { GaugeChartProps, GaugeZone };