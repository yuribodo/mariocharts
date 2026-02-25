# Gauge Chart Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 3/4-arc gauge chart with configurable color zones, filled-arc progress, and center value display.

**Architecture:** Custom SVG component following the same pattern as all other mario-charts components — ResizeObserver for responsive width, Framer Motion for animations, loading/error/empty states. Arc geometry reuses the `polarToCartesian` approach from PieChart.

**Tech Stack:** React 18, TypeScript 5 (strict), Framer Motion 11, Tailwind CSS 4, Jest 29

**Design doc:** `docs/plans/2026-02-20-gauge-chart-design.md`

---

## Task 1: Jest setup + geometry utilities (TDD)

Pure functions are the only testable part of a visual SVG chart. Get them right first.

**Files:**
- Create: `jest.config.ts`
- Create: `src/components/charts/gauge-chart/utils.ts`
- Create: `src/components/charts/gauge-chart/utils.test.ts`

**Step 1: Create jest config**

```ts
// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default config;
```

Install ts-jest if missing:
```bash
npm install --save-dev ts-jest @types/jest
```

**Step 2: Write failing tests**

```ts
// src/components/charts/gauge-chart/utils.test.ts
import { clampValue, valueToAngle, polarToCartesian, computeZoneArcs } from './utils';

describe('clampValue', () => {
  it('returns value when within range', () => {
    expect(clampValue(50, 0, 100)).toBe(50);
  });
  it('clamps to min', () => {
    expect(clampValue(-10, 0, 100)).toBe(0);
  });
  it('clamps to max', () => {
    expect(clampValue(150, 0, 100)).toBe(100);
  });
});

describe('valueToAngle', () => {
  // Gauge: 270° arc, starts at 135°, ends at 405°
  it('maps min to start angle (135)', () => {
    expect(valueToAngle(0, 0, 100)).toBeCloseTo(135);
  });
  it('maps max to end angle (405)', () => {
    expect(valueToAngle(100, 0, 100)).toBeCloseTo(405);
  });
  it('maps midpoint to 270', () => {
    expect(valueToAngle(50, 0, 100)).toBeCloseTo(270);
  });
});

describe('polarToCartesian', () => {
  it('maps 0° (top) to top of circle', () => {
    const p = polarToCartesian(0, 0, 100, -90);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(-100);
  });
  it('maps 90° to right of circle', () => {
    const p = polarToCartesian(0, 0, 100, 0);
    expect(p.x).toBeCloseTo(100);
    expect(p.y).toBeCloseTo(0);
  });
});

describe('computeZoneArcs', () => {
  const zones = [
    { from: 0, to: 60, color: '#22c55e' },
    { from: 60, to: 80, color: '#f59e0b' },
    { from: 80, to: 100, color: '#ef4444' },
  ];

  it('returns one arc per zone', () => {
    const arcs = computeZoneArcs(zones, 0, 100);
    expect(arcs).toHaveLength(3);
  });
  it('first zone starts at gauge start angle', () => {
    const arcs = computeZoneArcs(zones, 0, 100);
    expect(arcs[0].startAngle).toBeCloseTo(135);
  });
  it('last zone ends at gauge end angle', () => {
    const arcs = computeZoneArcs(zones, 0, 100);
    expect(arcs[2].endAngle).toBeCloseTo(405);
  });
});
```

**Step 3: Run to confirm FAIL**

```bash
npm test -- --testPathPattern=gauge-chart/utils
```

Expected: FAIL — module not found.

**Step 4: Implement utils.ts**

```ts
// src/components/charts/gauge-chart/utils.ts

export const GAUGE_START_ANGLE = 135;   // 7 o'clock
export const GAUGE_TOTAL_ANGLE = 270;   // 3/4 arc
export const GAUGE_END_ANGLE = GAUGE_START_ANGLE + GAUGE_TOTAL_ANGLE; // 405

export function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function valueToAngle(value: number, min: number, max: number): number {
  const fraction = (value - min) / (max - min || 1);
  return GAUGE_START_ANGLE + fraction * GAUGE_TOTAL_ANGLE;
}

export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDegrees: number
): { x: number; y: number } {
  const rad = (angleDegrees - 90) * (Math.PI / 180);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

export interface ZoneArc {
  startAngle: number;
  endAngle: number;
  color: string;
  label?: string;
}

export function computeZoneArcs(
  zones: readonly { from: number; to: number; color: string; label?: string }[],
  min: number,
  max: number
): ZoneArc[] {
  return zones.map((zone) => ({
    startAngle: valueToAngle(zone.from, min, max),
    endAngle: valueToAngle(zone.to, min, max),
    color: zone.color,
    label: zone.label,
  }));
}

export function describeArcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}
```

**Step 5: Run to confirm PASS**

```bash
npm test -- --testPathPattern=gauge-chart/utils
```

Expected: All tests PASS.

**Step 6: Commit**

```bash
git add src/components/charts/gauge-chart/utils.ts jest.config.ts
git commit -m "feat(gauge-chart): add geometry utilities with tests"
```

---

## Task 2: Component scaffold — types, constants, states

**Files:**
- Create: `src/components/charts/gauge-chart/index.tsx`

**Step 1: Write the file**

```tsx
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

  // Scaffold only — rendering comes in Task 3
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
      <svg width="100%" height={height} role="img" aria-label={`Gauge chart showing ${value}${unit ?? ""}`}>
        <text x="50%" y="50%" textAnchor="middle" className="fill-muted-foreground text-sm">
          (arcs render in Task 3)
        </text>
      </svg>
    </div>
  );
}

export const GaugeChart = memo(GaugeChartComponent);
export type { GaugeChartProps, GaugeZone };
```

**Step 2: Verify TypeScript**

```bash
npm run typecheck
```

Expected: No errors.

**Step 3: Commit**

```bash
git add src/components/charts/gauge-chart/index.tsx
git commit -m "feat(gauge-chart): scaffold component with types and states"
```

---

## Task 3: Zone arcs + progress arc

Replace the placeholder SVG content with the real arc rendering.

**Files:**
- Modify: `src/components/charts/gauge-chart/index.tsx`

**Step 1: Add geometry calculations inside component (replace the placeholder SVG)**

Replace the `return` block inside `GaugeChartComponent` (after the guard clauses) with:

```tsx
  // ─── Geometry ────────────────────────────────────────────────────────────────
  const size = Math.min(containerWidth - PADDING * 2, height - PADDING * 2);
  const cx = containerWidth / 2;
  const cy = height / 2 + size * 0.1; // slight downward offset so arc isn't clipped
  const outerRadius = size / 2;
  const innerRadius = outerRadius - strokeWidth;
  const midRadius = outerRadius - strokeWidth / 2; // for stroke-based arcs

  const clampedValue = clampValue(value, min, max);
  const valueAngle = valueToAngle(clampedValue, min, max);

  const zoneArcs = useMemo(
    () => computeZoneArcs(zones, min, max),
    [zones, min, max]
  );

  // Active zone: the zone where current value falls
  const activeZone = zoneArcs.findLast((z) =>
    valueAngle >= z.startAngle
  );

  // Min/max label positions (at arc endpoints)
  const minLabelPos = polarToCartesian(cx, cy, midRadius + strokeWidth * 0.8, GAUGE_START_ANGLE);
  const maxLabelPos = polarToCartesian(cx, cy, midRadius + strokeWidth * 0.8, GAUGE_END_ANGLE);

  // Full background arc path (gray base)
  const bgArcPath = describeArcPath(cx, cy, midRadius, GAUGE_START_ANGLE, GAUGE_END_ANGLE - 0.01);

  // Progress arc path (from start to value)
  const progressArcPath = clampedValue > min
    ? describeArcPath(cx, cy, midRadius, GAUGE_START_ANGLE, valueAngle)
    : '';

  return (
    <div ref={containerRef} className={cn("relative w-full", className)} style={{ height }}>
      <svg
        width="100%"
        height={height}
        className="overflow-visible"
        role="img"
        aria-label={`Gauge showing ${clampedValue}${unit ?? ""} of ${max}${unit ?? ""}`}
      >
        {/* ── Background arc (gray base) ─────────────────────────────────── */}
        <path
          d={bgArcPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.1}
        />

        {/* ── Zone arcs (dimmed) ─────────────────────────────────────────── */}
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

        {/* ── Progress arc (full opacity, colored by active zone) ────────── */}
        {progressArcPath && (
          <motion.path
            d={progressArcPath}
            fill="none"
            stroke={activeZone?.color ?? "currentColor"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              filter: activeZone
                ? `drop-shadow(0 0 8px ${activeZone.color})`
                : undefined,
            }}
            {...(shouldAnimate && {
              initial: { pathLength: 0 },
              animate: { pathLength: 1 },
              transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
            })}
          />
        )}

        {/* ── Min / max labels ───────────────────────────────────────────── */}
        <text
          x={minLabelPos.x}
          y={minLabelPos.y + strokeWidth}
          textAnchor="middle"
          fontSize={11}
          className="fill-muted-foreground"
        >
          {min}
        </text>
        <text
          x={maxLabelPos.x}
          y={maxLabelPos.y + strokeWidth}
          textAnchor="middle"
          fontSize={11}
          className="fill-muted-foreground"
        >
          {max}
        </text>

        {/* ── Center: value + unit + label ───────────────────────────────── */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize={36}
          fontWeight="bold"
          className="fill-foreground"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {clampedValue.toLocaleString()}{unit && (
            <tspan fontSize={20} className="fill-muted-foreground"> {unit}</tspan>
          )}
        </text>
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
```

Also move the `zoneArcs` useMemo above the return (not inside JSX) and add the missing import for `useMemo` if not already present.

**Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: No errors.

**Step 3: Dev server — visual check**

```bash
npm run dev
```

Open browser and test the component manually with a quick test page or in the existing docs.

**Step 4: Commit**

```bash
git add src/components/charts/gauge-chart/index.tsx
git commit -m "feat(gauge-chart): implement zone arcs, progress arc, and center labels"
```

---

## Task 4: Docs sidebar + docs page

Wire the gauge chart into the documentation site.

**Files:**
- Modify: `components/site/docs-sidebar-nav.tsx`
- Create: `app/docs/components/gauge-chart/page.tsx`
- Create: `app/docs/components/gauge-chart/gauge-chart-content.tsx`

**Step 1: Add to sidebar**

In `components/site/docs-sidebar-nav.tsx`, find the Components section children array and add after `stacked-bar-chart`:

```ts
{
  title: "Gauge Chart",
  href: "/docs/components/gauge-chart"
},
```

**Step 2: Create page.tsx**

```tsx
// app/docs/components/gauge-chart/page.tsx
import type { Metadata } from "next";
import { GaugeChartContent } from "./gauge-chart-content";
import { BreadcrumbSchema } from "../../../../components/seo/json-ld";

export const metadata: Metadata = {
  title: "Gauge Chart",
  description: "Production-ready gauge chart component for React. Displays a single value with configurable color zones on a 3/4 arc. Copy-paste ready.",
  keywords: ["gauge chart", "react gauge", "speedometer chart", "data visualization", "typescript chart"],
  alternates: { canonical: "/docs/components/gauge-chart" },
  openGraph: {
    title: "Gauge Chart Component | Mario Charts",
    description: "Production-ready gauge chart component for React with configurable zones.",
    url: "https://mariocharts.com/docs/components/gauge-chart",
    type: "article",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://mariocharts.com" },
  { name: "Docs", url: "https://mariocharts.com/docs" },
  { name: "Components", url: "https://mariocharts.com/docs/components" },
  { name: "Gauge Chart", url: "https://mariocharts.com/docs/components/gauge-chart" },
];

export default function GaugeChartPage() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <GaugeChartContent />
    </>
  );
}
```

**Step 3: Create gauge-chart-content.tsx**

Model it exactly after `bar-chart-content.tsx`. Include:
- A live interactive example (value slider, zone presets)
- `<InstallationGuide component="gauge-chart" />`
- `<APIReference props={gaugeChartProps} />`
- Sample data showing CPU, memory, and performance use cases

The props table should document all 9 props from the API design doc.

**Step 4: Typecheck + dev check**

```bash
npm run typecheck
npm run dev
```

Navigate to `/docs/components/gauge-chart` and verify the page renders.

**Step 5: Commit**

```bash
git add app/docs/components/gauge-chart/ components/site/docs-sidebar-nav.tsx
git commit -m "feat(gauge-chart): add docs page and sidebar entry"
```

---

## Task 5: Final checks + PR

**Step 1: Full typecheck**

```bash
npm run typecheck
```

Expected: Zero errors.

**Step 2: Lint**

```bash
npm run lint
```

Expected: Zero warnings.

**Step 3: Run tests**

```bash
npm test
```

Expected: All geometry utility tests pass.

**Step 4: Build**

```bash
npm run build
```

Expected: Clean build, no errors.

**Step 5: Commit any fixes, then finish**

```bash
git add -p   # stage only relevant files
git commit -m "fix: resolve any typecheck/lint issues in gauge chart"
```

Invoke `superpowers:finishing-a-development-branch` to decide on merge/PR.
