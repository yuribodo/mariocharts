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

interface GaugeZone {
  readonly from: number;
  readonly to: number;
  readonly color: string;
  readonly label?: string;
}

interface GaugeChartProps {
  readonly value: number;
  readonly min?: number;
  readonly max?: number;
  readonly zones: readonly GaugeZone[];
  readonly unit?: string;
  readonly label?: string;
  readonly strokeWidth?: number;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
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
    const update = () => setWidth(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
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
            d={describeArcPath(cx, cy, midRadius, zone.startAngle, zone.endAngle - 0.01)}
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
            stroke={activeZone?.color ?? "currentColor"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              filter: activeZone ? `drop-shadow(0 0 8px ${activeZone.color})` : undefined,
            }}
            {...(shouldAnimate
              ? {
                  initial: { pathLength: 0 },
                  animate: { pathLength: 1 },
                  transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] as const },
                }
              : {})}
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