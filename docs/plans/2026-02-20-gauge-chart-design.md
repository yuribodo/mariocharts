# Gauge Chart — Design Document

**Date:** 2026-02-20
**Status:** Approved

---

## Summary

A 3/4 arc gauge chart for displaying a single value within a configurable
range, with color-coded zone segments. Follows the same SVG-custom approach
as all other charts in the mario-charts library.

---

## API

```typescript
interface GaugeChartProps {
  readonly value: number
  readonly min?: number              // default: 0
  readonly max?: number              // default: 100
  readonly zones: readonly {
    readonly from: number
    readonly to: number
    readonly color: string
    readonly label?: string          // ex: "Normal", "Crítico"
  }[]
  readonly unit?: string             // ex: "%", "km/h", "°C"
  readonly label?: string            // text below value in center
  readonly strokeWidth?: number      // arc thickness, default: 20
  readonly height?: number           // default: 300
  readonly loading?: boolean
  readonly error?: string | null
  readonly animation?: boolean
  readonly className?: string
}
```

**Usage example:**
```tsx
<GaugeChart
  value={73}
  min={0}
  max={100}
  unit="%"
  label="CPU Usage"
  zones={[
    { from: 0,  to: 60,  color: "#22c55e", label: "Normal" },
    { from: 60, to: 80,  color: "#f59e0b", label: "Atenção" },
    { from: 80, to: 100, color: "#ef4444", label: "Crítico" },
  ]}
/>
```

---

## Visual & Geometry

**Arc geometry:**
- 270° arc (3/4 circle), gap at the bottom
- Starts at 135° (7 o'clock) → ends at 45° (5 o'clock), clockwise
- Reuses `polarToCartesian` pattern from PieChart

**Zone rendering:**
1. All zones rendered as background arcs at ~25% opacity (shows full range)
2. Filled portion up to `value` re-rendered at 100% opacity on top
3. Active zone (where value lands) gets a `drop-shadow` glow
4. Result: unfilled zones appear dimmed, filled portion glows with correct zone color

**Center content:**
- Large bold value + unit (e.g. `87%`)
- Label below in `text-muted-foreground` (e.g. `CPU Usage`)

**Min/max labels:**
- `min` at the left endpoint of the arc (135° position)
- `max` at the right endpoint (45° position)

**Animation:**
- Progress arc animates via `pathLength` from 0 → current value on mount
- Respects `prefers-reduced-motion`

---

## Architecture

**File structure:**
```
src/components/charts/gauge-chart/
└── index.tsx
```

**Internal structure:**
```
Constants & types
polarToCartesian() + describeArc() (adapted from pie-chart)
useContainerDimensions() (ResizeObserver)
computeZoneArcs()    — paths for all background zone arcs
computeProgressArc() — path for filled arc up to value
LoadingState / ErrorState / EmptyState
GaugeChartComponent (memoized export)
```

**Validations:**
- `value` outside `[min, max]` → clamped silently
- Zones not covering full `[min, max]` → ok, background arc only where zones exist
- Empty `zones` array → renders plain gray arc without colors

**Required states:**
- `loading` → circular skeleton (mirrors PieChart loading state)
- `error` → centered error message
- `empty` → when zones is empty, renders arc without color segments

**Responsiveness:**
- Width via ResizeObserver, height fixed via prop
- Arc centered in container

---

## Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Implementation | Custom SVG | Consistent with full library, no new deps |
| Arc span | 270° (3/4) | More readable than semicircle, modern look |
| Indicator style | Filled arc (no needle) | Cleaner, animates better with pathLength |
| Center content | Value + unit + label | Fixed layout, no slot — keeps API simple |
| Zone rendering | Dimmed background + full-opacity overlay | Clearly communicates current zone |
