# Manifesto Morph Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the landing `CodeDemoSection` with a craft-first manifesto moment: editorial headline morphs into a real `LineChart`.

**Architecture:** Pure geometry/state helpers drive a Framer Motion glyph stage; after the morph settles, swap to the real `LineChart`. Section triggers once on in-view, honors `prefers-reduced-motion`, and carries sparse copy only.

**Tech Stack:** Next.js App Router, React 18+, TypeScript, Framer Motion, Tailwind, existing `LineChart`, Jest (`ts-jest` / node) for pure helpers.

**Spec:** `docs/superpowers/specs/2026-08-03-manifesto-morph-section-design.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `components/landing/manifesto-morph/types.ts` | Phases, copy constants, demo data, layout constants |
| `components/landing/manifesto-morph/morph-geometry.ts` | Pure helpers: glyph split, target points, mapping |
| `components/landing/manifesto-morph/morph-geometry.test.ts` | Jest tests for pure helpers |
| `components/landing/manifesto-morph/morph-phase.ts` | Pure phase reducer + initial phase |
| `components/landing/manifesto-morph/morph-phase.test.ts` | Phase transition tests |
| `components/landing/manifesto-morph/use-manifesto-morph.ts` | In-view trigger, session flag, wires reducer |
| `components/landing/manifesto-morph/settled-line-chart.tsx` | Real LineChart + a11y label |
| `components/landing/manifesto-morph/glyph-morph.tsx` | Headline → particles → path stage |
| `components/landing/manifesto-morph/manifesto-morph-section.tsx` | Section shell, reduced-motion path, copy |
| `components/landing/manifesto-morph/index.ts` | Public exports |
| `components/landing/index.ts` | Export new section |
| `app/landing-content.tsx` | Swap `CodeDemoSection` → `ManifestoMorphSection` |

**Deferred (not in this plan):** deleting `components/landing/code-demo/**`.

---

### Task 1: Types + morph geometry helpers (TDD)

**Files:**
- Create: `components/landing/manifesto-morph/types.ts`
- Create: `components/landing/manifesto-morph/morph-geometry.ts`
- Create: `components/landing/manifesto-morph/morph-geometry.test.ts`

- [ ] **Step 1: Write failing tests for geometry helpers**

```ts
// components/landing/manifesto-morph/morph-geometry.test.ts
import {
  splitHeadlineToGlyphs,
  computeLineTargets,
  mapGlyphsToTargets,
} from "./morph-geometry";
import { DEMO_SERIES, MORPH_VIEWBOX } from "./types";

describe("splitHeadlineToGlyphs", () => {
  it("keeps spaces as glyphs and preserves order", () => {
    const glyphs = splitHeadlineToGlyphs("Own the pixels.");
    expect(glyphs.map((g) => g.char)).toEqual([
      "O", "w", "n", " ", "t", "h", "e", " ", "p", "i", "x", "e", "l", "s", ".",
    ]);
    expect(glyphs[0]?.id).toBe("g-0");
  });
});

describe("computeLineTargets", () => {
  it("returns one target per demo point inside the viewBox", () => {
    const targets = computeLineTargets(DEMO_SERIES, MORPH_VIEWBOX);
    expect(targets).toHaveLength(DEMO_SERIES.length);
    for (const t of targets) {
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.x).toBeLessThanOrEqual(MORPH_VIEWBOX.width);
      expect(t.y).toBeGreaterThanOrEqual(0);
      expect(t.y).toBeLessThanOrEqual(MORPH_VIEWBOX.height);
    }
  });

  it("places higher values higher on screen (smaller y)", () => {
    const targets = computeLineTargets(
      [
        { month: "A", value: 100 },
        { month: "B", value: 900 },
      ],
      { width: 400, height: 200, padding: 20 }
    );
    expect(targets[1]!.y).toBeLessThan(targets[0]!.y);
  });
});

describe("mapGlyphsToTargets", () => {
  it("maps each target to a source glyph index (round-robin over non-space glyphs)", () => {
    const glyphs = splitHeadlineToGlyphs("Own the pixels.");
    const targets = computeLineTargets(DEMO_SERIES, MORPH_VIEWBOX);
    const mapping = mapGlyphsToTargets(glyphs, targets);
    expect(mapping).toHaveLength(targets.length);
    for (const m of mapping) {
      expect(glyphs[m.glyphIndex]?.char.trim().length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- components/landing/manifesto-morph/morph-geometry.test.ts`

Expected: FAIL (module not found / cannot find module)

- [ ] **Step 3: Implement types + geometry**

```ts
// components/landing/manifesto-morph/types.ts
export type MorphPhase = "idle" | "morphing" | "settled";

export const HEADLINE = "Own the pixels.";
export const SUPPORT_LINE = "Charts you keep — not another dependency.";

export const DEMO_SERIES = [
  { month: "Jan", value: 4200 },
  { month: "Feb", value: 5100 },
  { month: "Mar", value: 4800 },
  { month: "Apr", value: 6200 },
  { month: "May", value: 5900 },
  { month: "Jun", value: 7100 },
  { month: "Jul", value: 6800 },
  { month: "Aug", value: 7600 },
] as const;

export type DemoPoint = (typeof DEMO_SERIES)[number];

export const MORPH_VIEWBOX = {
  width: 640,
  height: 280,
  padding: 32,
} as const;

export const MORPH_DURATION_MS = 1600;
export const SESSION_KEY = "mario-manifesto-morph-settled";

export type Glyph = {
  readonly id: string;
  readonly char: string;
  readonly index: number;
};

export type PointTarget = {
  readonly x: number;
  readonly y: number;
  readonly value: number;
  readonly label: string;
};

export type GlyphTargetMap = {
  readonly glyphIndex: number;
  readonly targetIndex: number;
  readonly x: number;
  readonly y: number;
};
```

```ts
// components/landing/manifesto-morph/morph-geometry.ts
import type { DemoPoint, Glyph, GlyphTargetMap, PointTarget } from "./types";

export function splitHeadlineToGlyphs(headline: string): Glyph[] {
  return Array.from(headline).map((char, index) => ({
    id: `g-${index}`,
    char,
    index,
  }));
}

export function computeLineTargets(
  series: readonly DemoPoint[],
  viewBox: { width: number; height: number; padding: number }
): PointTarget[] {
  if (series.length === 0) return [];

  const values = series.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const { width, height, padding } = viewBox;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  return series.map((point, i) => {
    const x =
      series.length === 1
        ? padding + innerW / 2
        : padding + (i / (series.length - 1)) * innerW;
    const y = padding + (1 - (point.value - min) / range) * innerH;
    return {
      x,
      y,
      value: point.value,
      label: point.month,
    };
  });
}

export function mapGlyphsToTargets(
  glyphs: readonly Glyph[],
  targets: readonly PointTarget[]
): GlyphTargetMap[] {
  const sources = glyphs
    .map((g, glyphIndex) => ({ g, glyphIndex }))
    .filter(({ g }) => g.char.trim().length > 0);

  if (sources.length === 0) return [];

  return targets.map((target, targetIndex) => {
    const source = sources[targetIndex % sources.length]!;
    return {
      glyphIndex: source.glyphIndex,
      targetIndex,
      x: target.x,
      y: target.y,
    };
  });
}

export function buildLinePath(targets: readonly PointTarget[]): string {
  if (targets.length === 0) return "";
  return targets
    .map((t, i) => `${i === 0 ? "M" : "L"} ${t.x} ${t.y}`)
    .join(" ");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- components/landing/manifesto-morph/morph-geometry.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/landing/manifesto-morph/types.ts \
  components/landing/manifesto-morph/morph-geometry.ts \
  components/landing/manifesto-morph/morph-geometry.test.ts
git commit -m "feat(landing): add manifesto morph geometry helpers"
```

---

### Task 2: Phase state machine helper (TDD)

**Files:**
- Create: `components/landing/manifesto-morph/morph-phase.ts`
- Create: `components/landing/manifesto-morph/morph-phase.test.ts`

Keep session / transition logic pure so Jest (node) can test it without React Testing Library.

- [ ] **Step 1: Write failing tests**

```ts
// components/landing/manifesto-morph/morph-phase.test.ts
import {
  getInitialPhase,
  reduceMorphEvent,
  type MorphEvent,
} from "./morph-phase";
import type { MorphPhase } from "./types";

describe("getInitialPhase", () => {
  it("returns settled when session already completed", () => {
    expect(getInitialPhase(true)).toBe("settled");
  });

  it("returns idle when session not completed", () => {
    expect(getInitialPhase(false)).toBe("idle");
  });
});

describe("reduceMorphEvent", () => {
  const cases: Array<[MorphPhase, MorphEvent, MorphPhase]> = [
    ["idle", "ENTER_VIEW", "morphing"],
    ["idle", "MORPH_DONE", "idle"],
    ["morphing", "MORPH_DONE", "settled"],
    ["morphing", "ENTER_VIEW", "morphing"],
    ["settled", "ENTER_VIEW", "settled"],
    ["settled", "MORPH_DONE", "settled"],
    ["morphing", "ABORT_SETTLE", "settled"],
  ];

  it.each(cases)("%s + %s → %s", (phase, event, next) => {
    expect(reduceMorphEvent(phase, event)).toBe(next);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npm test -- components/landing/manifesto-morph/morph-phase.test.ts`

Expected: FAIL (module not found)

- [ ] **Step 3: Implement reducer**

```ts
// components/landing/manifesto-morph/morph-phase.ts
import type { MorphPhase } from "./types";

export type MorphEvent = "ENTER_VIEW" | "MORPH_DONE" | "ABORT_SETTLE";

export function getInitialPhase(hasSettledInSession: boolean): MorphPhase {
  return hasSettledInSession ? "settled" : "idle";
}

export function reduceMorphEvent(
  phase: MorphPhase,
  event: MorphEvent
): MorphPhase {
  if (phase === "settled") return "settled";

  if (event === "ABORT_SETTLE") return "settled";

  if (phase === "idle" && event === "ENTER_VIEW") return "morphing";
  if (phase === "morphing" && event === "MORPH_DONE") return "settled";

  return phase;
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npm test -- components/landing/manifesto-morph/morph-phase.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/landing/manifesto-morph/morph-phase.ts \
  components/landing/manifesto-morph/morph-phase.test.ts
git commit -m "feat(landing): add manifesto morph phase reducer"
```

---

### Task 3: `useManifestoMorph` hook + settled chart

**Files:**
- Create: `components/landing/manifesto-morph/use-manifesto-morph.ts`
- Create: `components/landing/manifesto-morph/settled-line-chart.tsx`

- [ ] **Step 1: Implement the hook**

```ts
// components/landing/manifesto-morph/use-manifesto-morph.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  getInitialPhase,
  reduceMorphEvent,
} from "./morph-phase";
import { MORPH_DURATION_MS, SESSION_KEY, type MorphPhase } from "./types";

function readSessionSettled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSessionSettled(): void {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}

export function useManifestoMorph(sectionRef: React.RefObject<HTMLElement | null>) {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<MorphPhase>("idle");
  const startedRef = useRef(false);

  useEffect(() => {
    setPhase(getInitialPhase(readSessionSettled()));
  }, []);

  const settle = useCallback(() => {
    setPhase((prev) => reduceMorphEvent(prev, "MORPH_DONE"));
    writeSessionSettled();
  }, []);

  const abortToSettled = useCallback(() => {
    setPhase((prev) => reduceMorphEvent(prev, "ABORT_SETTLE"));
    writeSessionSettled();
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || phase === "settled") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || startedRef.current) return;
        startedRef.current = true;

        if (shouldReduceMotion) {
          setPhase("settled");
          writeSessionSettled();
          return;
        }

        setPhase((prev) => reduceMorphEvent(prev, "ENTER_VIEW"));
      },
      { threshold: 0.45 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [sectionRef, phase, shouldReduceMotion]);

  useEffect(() => {
    if (phase !== "morphing") return;

    const timeout = window.setTimeout(() => {
      settle();
    }, MORPH_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [phase, settle]);

  // If user scrolls away mid-morph, finish to settled (no half-state)
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || phase !== "morphing") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && !entry.isIntersecting) abortToSettled();
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [sectionRef, phase, abortToSettled]);

  return { phase, shouldReduceMotion } as const;
}
```

- [ ] **Step 2: Implement settled LineChart wrapper**

```tsx
// components/landing/manifesto-morph/settled-line-chart.tsx
"use client";

import { LineChart } from "@/src/components/charts/line-chart";
import { DEMO_SERIES } from "./types";

interface SettledLineChartProps {
  className?: string;
}

export function SettledLineChart({ className }: SettledLineChartProps) {
  return (
    <div
      className={className}
      role="img"
      aria-label="Line chart showing monthly values from January through August"
    >
      <LineChart
        data={DEMO_SERIES}
        x="month"
        y="value"
        height={280}
        showDots
        curve="monotone"
        showGrid
        animation={false}
      />
    </div>
  );
}
```

- [ ] **Step 3: Typecheck the new files**

Run: `npx tsc --noEmit --pretty false 2>&1 | head -40`

Expected: no errors in `manifesto-morph/*` (project may have unrelated noise — fix only errors you introduced)

- [ ] **Step 4: Commit**

```bash
git add components/landing/manifesto-morph/use-manifesto-morph.ts \
  components/landing/manifesto-morph/settled-line-chart.tsx
git commit -m "feat(landing): add manifesto morph hook and settled LineChart"
```

---

### Task 4: `GlyphMorph` stage

**Files:**
- Create: `components/landing/manifesto-morph/glyph-morph.tsx`

Visual stage only. When `phase === "morphing"`, animate mapped glyphs toward targets and draw the path. When `phase === "idle"`, show static headline. Parent swaps to `SettledLineChart` on `settled`.

- [ ] **Step 1: Implement GlyphMorph**

```tsx
// components/landing/manifesto-morph/glyph-morph.tsx
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  buildLinePath,
  computeLineTargets,
  mapGlyphsToTargets,
  splitHeadlineToGlyphs,
} from "./morph-geometry";
import {
  DEMO_SERIES,
  HEADLINE,
  MORPH_DURATION_MS,
  MORPH_VIEWBOX,
  type MorphPhase,
} from "./types";

interface GlyphMorphProps {
  phase: MorphPhase;
  className?: string;
}

export function GlyphMorph({ phase, className }: GlyphMorphProps) {
  const glyphs = useMemo(() => splitHeadlineToGlyphs(HEADLINE), []);
  const targets = useMemo(
    () => computeLineTargets(DEMO_SERIES, MORPH_VIEWBOX),
    []
  );
  const mapping = useMemo(
    () => mapGlyphsToTargets(glyphs, targets),
    [glyphs, targets]
  );
  const path = useMemo(() => buildLinePath(targets), [targets]);

  const isMorphing = phase === "morphing";

  return (
    <div className={cn("relative mx-auto w-full max-w-3xl", className)}>
      {/* Idle / morphing headline layer */}
      <motion.h2
        className={cn(
          "text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl",
          isMorphing && "pointer-events-none"
        )}
        aria-hidden={isMorphing}
      >
        {glyphs.map((glyph) => {
          const mapped = mapping.find((m) => m.glyphIndex === glyph.index);
          const isFlyer = Boolean(mapped) && isMorphing;

          return (
            <motion.span
              key={glyph.id}
              className="inline-block"
              initial={false}
              animate={
                isFlyer && mapped
                  ? {
                      // Approximate: fly upward into chart band; exact pixel
                      // docking is handled by the SVG dots layer below.
                      opacity: 0,
                      y: -24,
                      scale: 0.4,
                    }
                  : isMorphing
                    ? { opacity: 0.15, letterSpacing: "0.12em" }
                    : { opacity: 1, y: 0, scale: 1, letterSpacing: "0em" }
              }
              transition={{
                duration: MORPH_DURATION_MS / 1000,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {glyph.char === " " ? "\u00A0" : glyph.char}
            </motion.span>
          );
        })}
      </motion.h2>

      {/* Chart geometry reveal */}
      <motion.svg
        viewBox={`0 0 ${MORPH_VIEWBOX.width} ${MORPH_VIEWBOX.height}`}
        className="mx-auto mt-10 h-[240px] w-full text-foreground"
        initial={false}
        animate={{ opacity: isMorphing ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        aria-hidden
      >
        <motion.path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            isMorphing
              ? { pathLength: 1, opacity: 0.85 }
              : { pathLength: 0, opacity: 0 }
          }
          transition={{
            duration: MORPH_DURATION_MS / 1000,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
        {targets.map((target, i) => (
          <motion.circle
            key={target.label}
            cx={target.x}
            cy={target.y}
            r={4}
            fill="var(--background)"
            stroke="currentColor"
            strokeWidth={2}
            initial={{ scale: 0, opacity: 0 }}
            animate={
              isMorphing
                ? { scale: 1, opacity: 1 }
                : { scale: 0, opacity: 0 }
            }
            transition={{
              delay: isMorphing ? 0.35 + i * 0.06 : 0,
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        ))}
      </motion.svg>
    </div>
  );
}
```

Craft note for the implementer: if the headline→dot flight feels weak, upgrade mapped glyphs to use measured `getBoundingClientRect` → SVG coordinates. MVP above is acceptable if the path+dot reveal + headline dissolve reads as one moment; polish measurement in the same file before calling the task done if time allows (~30–60 extra minutes).

- [ ] **Step 2: Manual smoke in isolation (optional story not required)**

No Storybook story required. Proceed to section wiring.

- [ ] **Step 3: Commit**

```bash
git add components/landing/manifesto-morph/glyph-morph.tsx
git commit -m "feat(landing): add manifesto glyph morph stage"
```

---

### Task 5: Section shell + landing

**Files:**
- Create: `components/landing/manifesto-morph/manifesto-morph-section.tsx`
- Create: `components/landing/manifesto-morph/index.ts`
- Modify: `components/landing/index.ts`
- Modify: `app/landing-content.tsx`

- [ ] **Step 1: Implement section**

```tsx
// components/landing/manifesto-morph/manifesto-morph-section.tsx
"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlyphMorph } from "./glyph-morph";
import { SettledLineChart } from "./settled-line-chart";
import { useManifestoMorph } from "./use-manifesto-morph";
import { HEADLINE, SUPPORT_LINE } from "./types";

interface ManifestoMorphSectionProps {
  className?: string;
}

export function ManifestoMorphSection({ className }: ManifestoMorphSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { phase, shouldReduceMotion } = useManifestoMorph(sectionRef);

  const showSettled = phase === "settled";
  const showMorphStage = !showSettled;

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative overflow-hidden py-24 lg:py-32",
        className
      )}
    >
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6">
        {/* sr-only belief always available */}
        <p className="sr-only">{HEADLINE}</p>

        <div className="flex min-h-[360px] w-full flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {showMorphStage && (
              <motion.div
                key="morph-stage"
                className="w-full"
                initial={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: { duration: shouldReduceMotion ? 0.2 : 0.35 },
                }}
              >
                {shouldReduceMotion ? (
                  <h2 className="text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                    {HEADLINE}
                  </h2>
                ) : (
                  <GlyphMorph phase={phase} />
                )}
              </motion.div>
            )}

            {showSettled && (
              <motion.div
                key="settled"
                className="w-full"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.25 : 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <SettledLineChart />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.p
          className="mt-10 max-w-md text-center text-base text-muted-foreground sm:text-lg"
          initial={false}
          animate={{ opacity: showSettled ? 1 : 0, y: showSettled ? 0 : 8 }}
          transition={{ duration: 0.4, delay: showSettled ? 0.1 : 0 }}
        >
          {SUPPORT_LINE}
        </motion.p>
      </div>
    </section>
  );
}
```

```ts
// components/landing/manifesto-morph/index.ts
export { ManifestoMorphSection } from "./manifesto-morph-section";
export { HEADLINE, SUPPORT_LINE } from "./types";
```

- [ ] **Step 2: Wire landing exports**

In `components/landing/index.ts`, replace the Code Demo export block with:

```ts
// Manifesto Morph Section
export { ManifestoMorphSection } from "./manifesto-morph";
```

Keep `code-demo` exports removed from the barrel (files can remain on disk).

- [ ] **Step 3: Swap landing content**

In `app/landing-content.tsx`:

```tsx
import {
  HeroSection,
  ShowcaseSection,
  ManifestoMorphSection,
  CTASection,
  LandingFooter,
  EasterEggsProvider,
} from "@/components/landing";
import { LandingBackground } from "@/components/landing/shared/landing-background";

/**
 * Mario Charts Landing Page Content
 *
 * 1. Hero - Morphing chart animation
 * 2. Showcase - Apple-style sticky scroll
 * 3. Manifesto Morph - Typography → LineChart craft moment
 * 4. CTA - Final call-to-action with easter eggs
 * 5. Footer - Interactive chart and terminal-style links
 */
export function LandingContent() {
  return (
    <EasterEggsProvider>
      <main className="landing-page relative min-h-screen w-full bg-background">
        <LandingBackground className="z-0" />

        <div className="relative z-10">
          <HeroSection />
          <ShowcaseSection />
          <ManifestoMorphSection />
          <CTASection />
          <LandingFooter />
        </div>
      </main>
    </EasterEggsProvider>
  );
}
```

- [ ] **Step 4: Lint + typecheck touched files**

Run:
```bash
npm run typecheck
npm run lint -- components/landing/manifesto-morph app/landing-content.tsx components/landing/index.ts
```

Expected: clean for new files; fix any issues introduced.

- [ ] **Step 5: Commit**

```bash
git add components/landing/manifesto-morph \
  components/landing/index.ts \
  app/landing-content.tsx
git commit -m "feat(landing): replace code demo with manifesto morph section"
```

---

### Task 6: Verification + craft polish pass

**Files (touch only if needed):**
- `components/landing/manifesto-morph/glyph-morph.tsx`
- `components/landing/manifesto-morph/manifesto-morph-section.tsx`

- [ ] **Step 1: Run unit tests**

Run: `npm test -- components/landing/manifesto-morph`

Expected: all PASS

- [ ] **Step 2: Manual QA on `npm run dev`**

Checklist:
1. Fresh session: scroll to section → headline appears → morph plays once → LineChart settles → support line fades in  
2. Reload with same tab session: section shows settled chart immediately (no replay)  
3. OS reduced-motion enabled: headline crossfades to chart, no glyph fragmentation  
4. Scroll away mid-morph: lands on settled chart, no stuck half-state  
5. No prop toggles / code editor visible on landing  
6. Keyboard/screen-reader: belief text available; chart region has `aria-label`  
7. Mobile width: typography wraps cleanly; chart remains usable  

- [ ] **Step 3: Polish if morph feels disconnected**

Only if QA fails the “one moment” feel:
- Measure glyph centers and animate SVG dots from those positions to targets (same duration)  
- Keep path draw synced to `MORPH_DURATION_MS`  
- Do not add controls or extra copy  

- [ ] **Step 4: Final commit (if polish landed)**

```bash
git add components/landing/manifesto-morph
git commit -m "polish(landing): tighten manifesto morph handoff"
```

---

## Spec coverage check

| Spec requirement | Task |
|------------------|------|
| Replace CodeDemoSection on landing | Task 5 |
| Headline “Own the pixels.” | Task 1 types + Task 4/5 |
| Support line copy | Task 5 |
| Real LineChart after settle | Task 3 + 5 |
| Glyph → line geometry morph | Task 1 + 4 |
| Once per visit | Task 2 + 3 hook |
| Interrupt → settled | Task 2 + 3 hook |
| prefers-reduced-motion | Task 3 hook + Task 5 |
| No primary CTA in section | Task 5 |
| a11y belief + chart label | Task 3 settled + Task 5 sr-only |
| No prop playground | Task 5 wiring |
| Defer code-demo deletion | File map note |

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-03-manifesto-morph-section.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
**2. Inline Execution** — run tasks in this session with checkpoints  

Which approach?
