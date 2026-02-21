"use client";

import * as React from "react";
import { memo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useIsomorphicLayoutEffect } from "../../../../lib/hooks";
import { cn } from "../../../../lib/utils";
import { clampValue } from "./utils";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_HEIGHT = 300;
const DEFAULT_STROKE_WIDTH = 20;
const PADDING = 24;

// ─── Hooks ────────────────────────────────────────────────────────────────────

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

// ─── States ───────────────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

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

  // Keep clampValue in use so the import is live; will be expanded in Task 3
  const _clamped = clampValue(value, min, max);

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
        role="img"
        aria-label={`Gauge chart showing ${_clamped}${unit ?? ""}`}
      >
        <text x="50%" y="50%" textAnchor="middle" className="fill-muted-foreground text-sm">
          {label ?? "Gauge"}
        </text>
      </svg>
    </div>
  );
}

// Suppress unused-variable lint for shouldAnimate — will be wired in Task 3

export const GaugeChart = memo(GaugeChartComponent);
export type { GaugeChartProps, GaugeZone };
