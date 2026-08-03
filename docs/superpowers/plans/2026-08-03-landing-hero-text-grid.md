# Landing Hero Text Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the hero into one monospaced character grid that writes itself on load, with a real ASCII chart in it and the portrait demoted to one region.

**Architecture:** A second build-time generator emits an ASCII chart from committed data, exactly as the portrait generator does. The hero composes eyebrow labels, a real `<h1>`, the chart field and the portrait against shared character metrics. The entrance is a CSS row-wave: each row of a field is its own element carrying a positional delay.

**Tech Stack:** Next.js 15.5.9, React 18.3.1, TypeScript, Tailwind CSS, sharp, tsx, Jest + ts-jest + Testing Library.

Design spec: `docs/superpowers/specs/2026-08-03-landing-hero-text-grid-design.md`.

**Four steps describe requirements instead of supplying code, deliberately.**
Task 1 Step 4, and Task 3 Steps 3, 4 and 5, state what to build rather than what
to type. They are the steps whose right answer depends on how the result looks
once rendered — a chart's glyph choice, an easing curve, a grid's rhythm — and
inventing exact code for them here would put a number in the plan that the
implementer should be deriving from the screen. The last plan in this project
did the same for its layout step, and the implementer's solution was better than
the code the plan would have prescribed. Every other step carries its code.

## Global Constraints

- Work in the worktree `.worktrees/premium-ecosystem-redesign` on branch `feat/premium-ecosystem-redesign`.
- **The headline stays a real `<h1>` and the command stays the real `CommandSnippet`.** The grid is shared font, cell size and baseline — never copy painted as characters or into a canvas. This is the decision the whole design rests on.
- Radii 4-8px only: `rounded`, `rounded-md`. Never `rounded-xl` and up.
- No `backdrop-blur`, no decorative shadows, no `shadow-lg`, no scrim behind text.
- No raw Tailwind colour literals — semantic tokens only. Plain tokens over opacity-modified ones.
- Transitions and entrance easing use `cubic-bezier(0.16, 1, 0.3, 1)`. Never `transition: all`.
- Nothing translates more than a few pixels, nothing scales past 1, nothing overshoots.
- Under `prefers-reduced-motion: reduce` the hero renders its **final state immediately** — same tree, same characters, no entrance. Never a separate fallback tree.
- The entrance runs once and never replays on scroll.
- Never write an `inert` attribute in JSX: React 18 emits it client-side but drops it in server rendering, and hydration does not reconcile attribute mismatches. Set it from an effect if needed.
- Chart data is a committed constant. No network call, no `Date.now()`, no `Math.random()` in anything that renders — a value differing between server and client is a hydration mismatch by construction.
- `hero-portrait.tsx` stays free of `"use client"`. Its wrapper stays `relative w-fit` so the canvas overlay stays aligned to the text grid; never pass it a conflicting width utility, because `cn` uses `twMerge` and yours would win.
- Tests colocated as `*.test.ts` / `*.test.tsx`. Run `npx tsc --noEmit`, `npx jest` and `npx eslint app components scripts` before committing. Two lint errors already exist in `components/site/problem-section.tsx` and `components/ui/container-scroll-animation.tsx` — leave them, they are not yours.

## File Structure

| File | Responsibility |
|---|---|
| `scripts/ascii-chart.ts` | Renders a dataset as an ASCII chart in three forms. Pure functions plus a `main` that writes the generated module. |
| `scripts/ascii-chart.test.ts` | Determinism, shape and committed-output guards. |
| `components/landing/hero/hero-chart-data.ts` | The committed dataset. Data only, no logic. |
| `components/landing/hero/hero-chart.ts` | Generated. The three rendered forms plus the column count. |
| `components/landing/hero/hero-chart-field.tsx` | Renders the chart field and cycles its form. |
| `components/landing/hero/text-field.tsx` | Shared row-splitting renderer that both fields use, and the entrance's only moving part. |
| `components/landing/hero/hero-section.tsx` | Composition: eyebrow, heading, chart field, portrait. |

---

### Task 1: Generate the ASCII chart

**Files:**
- Create: `components/landing/hero/hero-chart-data.ts`
- Create: `scripts/ascii-chart.ts`
- Create: `scripts/ascii-chart.test.ts`
- Create: `components/landing/hero/hero-chart.ts` (generated)
- Modify: `package.json`

**Interfaces:**
- Produces: `renderChart(values: readonly number[], options: { columns: number; rows: number; form: ChartForm }): string` and `type ChartForm = "area" | "bars" | "line"` from `scripts/ascii-chart.ts`.
- Produces: `HERO_CHART_FORMS: readonly string[]` and `HERO_CHART_COLUMNS: number` from `components/landing/hero/hero-chart.ts`.

- [ ] **Step 1: Create the dataset**

Create `components/landing/hero/hero-chart-data.ts`:

```ts
/**
 * Committed, not fetched. A hero that renders different characters on the
 * server and the client is a hydration mismatch by construction, and this
 * project has already spent two rounds removing those.
 */
export const HERO_CHART_VALUES = [
  12, 19, 15, 27, 24, 33, 30, 41, 38, 52, 47, 61, 58, 72, 69, 84,
] as const;
```

- [ ] **Step 2: Write the failing test**

Create `scripts/ascii-chart.test.ts`:

```ts
import { renderChart } from "./ascii-chart";
import { HERO_CHART_VALUES } from "../components/landing/hero/hero-chart-data";

const OPTIONS = { columns: 64, rows: 16 } as const;

describe("renderChart", () => {
  it("fills the requested grid exactly", () => {
    const art = renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "area" });
    const lines = art.split("\n");

    expect(lines).toHaveLength(OPTIONS.rows);
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(OPTIONS.columns);
    }
  });

  it("puts high values higher up the field than low ones", () => {
    // The dataset rises overall, so the last column must have ink further up
    // than the first. This is the assertion that fails if the y axis is
    // inverted — the single most likely way to get a plausible-looking but
    // wrong chart.
    const lines = renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "bars" })
      .split("\n");
    const topmostInk = (column: number) =>
      lines.findIndex((line) => (line[column] ?? " ") !== " ");

    const first = topmostInk(0);
    const last = topmostInk(OPTIONS.columns - 1);

    expect(first).toBeGreaterThan(-1);
    expect(last).toBeGreaterThan(-1);
    expect(last).toBeLessThan(first);
  });

  it("draws each form differently", () => {
    const area = renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "area" });
    const bars = renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "bars" });
    const line = renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "line" });

    expect(new Set([area, bars, line]).size).toBe(3);
  });

  it("draws less ink for a line than for an area", () => {
    const ink = (art: string) => art.replace(/[\s\n]/g, "").length;

    expect(ink(renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "line" })))
      .toBeLessThan(
        ink(renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "area" })),
      );
  });

  it("is deterministic", () => {
    const once = renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "area" });
    const twice = renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "area" });

    expect(once).toBe(twice);
  });

  it("matches the committed art", async () => {
    const { HERO_CHART_FORMS, HERO_CHART_COLUMNS } = await import(
      "../components/landing/hero/hero-chart"
    );

    expect(HERO_CHART_FORMS).toHaveLength(3);
    expect(HERO_CHART_FORMS[0]).toBe(
      renderChart(HERO_CHART_VALUES, {
        columns: HERO_CHART_COLUMNS,
        rows: HERO_CHART_FORMS[0]!.split("\n").length,
        form: "area",
      }),
    );
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
npx jest scripts/ascii-chart
```

Expected: FAIL — `Cannot find module './ascii-chart'`.

- [ ] **Step 4: Write the generator**

Create `scripts/ascii-chart.ts`. Requirements, in place of code you would copy blindly:

- `renderChart` maps each of the `columns` cells to a value by sampling the
  dataset, scales values to `rows`, and returns exactly `rows` lines joined by
  `\n`, with trailing whitespace trimmed per line.
- **Row 0 is the top of the chart.** High values must produce ink in low row
  indices. Getting this backwards is the failure the second test exists to
  catch.
- `area` fills every cell from the value's row down to the baseline. `bars`
  fills the same but leaves a blank column between bars so they read as
  discrete. `line` inks only the value's own row per column.
- Glyphs come from the same vocabulary the portrait uses (`scripts/ascii-portrait.ts`'s ramp) so the two fields look like one field. Denser glyphs sit lower in an area fill, which is what gives it weight toward the baseline.
- A `main` writes `components/landing/hero/hero-chart.ts` exporting
  `HERO_CHART_COLUMNS` and `HERO_CHART_FORMS` as `[area, bars, line]`, with a
  generated-file header naming the npm script, exactly as the portrait
  generator's output does.
- No `Math.random`, no `Date`. The output must be a pure function of the input.

- [ ] **Step 5: Add the npm script**

In `package.json`, beside the existing `ascii:portrait` entry:

```json
    "ascii:chart": "tsx scripts/ascii-chart.ts",
```

- [ ] **Step 6: Generate and eyeball it**

```bash
npm run ascii:chart
npx tsx -e "import('./components/landing/hero/hero-chart.ts').then(m => m.HERO_CHART_FORMS.forEach((f, i) => console.log('\n--- form ' + i + ' ---\n' + f)))"
```

Print each of the three forms to your terminal and look at them. A chart that
does not read as a rising area, a set of bars and a line is not done — fix the
generator rather than the test. Report what you saw.

- [ ] **Step 7: Run the tests to verify they pass**

```bash
npx jest scripts/ascii-chart
```

Expected: PASS, 6 tests.

- [ ] **Step 8: Verify and commit**

```bash
npx tsc --noEmit
npx eslint scripts components
git add scripts components/landing/hero package.json
git commit -m "Generate The Hero ASCII Chart"
```

---

### Task 2: Share one row renderer between both fields

The entrance animates rows, so both the portrait and the chart need their text
split into per-row elements. That split belongs in one component, not two.

**Files:**
- Create: `components/landing/hero/text-field.tsx`
- Create: `components/landing/hero/text-field.test.tsx`
- Modify: `components/landing/hero/hero-portrait.tsx`

**Interfaces:**
- Produces: `TextField(props: { text: string; className?: string; label?: string; rowDelayMs?: number })`.

- [ ] **Step 1: Write the failing test**

Create `components/landing/hero/text-field.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { TextField } from "./text-field";

const ART = "aaa\nbbb\nccc";

describe("TextField", () => {
  it("renders one element per row without altering the text", () => {
    const { container } = render(<TextField text={ART} label="Example" />);
    const field = screen.getByRole("img", { name: "Example" });

    expect(field.children).toHaveLength(3);
    expect(field.textContent).toBe(ART);
    expect(container.querySelectorAll("[tabindex]")).toHaveLength(0);
  });

  it("staggers the rows so the field resolves as a wave", () => {
    const { container } = render(<TextField text={ART} label="Example" rowDelayMs={20} />);
    const rows = [...container.querySelectorAll<HTMLElement>("[data-row]")];

    expect(rows).toHaveLength(3);
    expect(rows.map((row) => row.style.animationDelay)).toEqual([
      "0ms",
      "20ms",
      "40ms",
    ]);
  });

  it("carries no accessible name when it is decoration", () => {
    const { container } = render(<TextField text={ART} />);

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx jest components/landing/hero/text-field
```

Expected: FAIL — `Cannot find module './text-field'`.

- [ ] **Step 3: Write the component**

Create `components/landing/hero/text-field.tsx`. Requirements:

- Renders a `<pre>` whose children are one `<span data-row>` per line, each a
  block so the rows stack, with the line's text as its content. `<pre>`
  preserves whitespace, so the rows must not be trimmed or re-joined.
- When `label` is given, the `<pre>` is `role="img"` with that label. When it is
  not, the `<pre>` is `aria-hidden="true"` and has no role — a decorative field
  must not announce itself.
- Nothing inside is focusable.
- Each row sets `animationDelay` from its index times `rowDelayMs`, defaulting
  to `0` when the prop is absent so a field can opt out of the entrance.
- The component itself must stay server-renderable: no hooks, no `"use client"`.

**One decision, made here rather than left open.** The entrance animates whole
rows, not individual characters. Per-character resolution would need one element
per cell — for the portrait that is over eight thousand elements, which costs
more than the effect is worth. A row wave reads as the field writing itself and
costs one element per line.

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx jest components/landing/hero/text-field
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Move the portrait onto it**

Rewrite `components/landing/hero/hero-portrait.tsx` so it renders `TextField`
with the theme-appropriate variant instead of its own `<pre>`. Both variants
still render, still toggle by CSS, and exactly one still carries the accessible
name. Keep the `relative w-fit` wrapper and the `HeroPortraitEffect` mount
exactly as they are.

Run the existing portrait tests and fix any that assert on the old internal
markup — but do not weaken what they assert about the accessible name or the
absence of tab stops.

- [ ] **Step 6: Verify and commit**

```bash
npx tsc --noEmit
npx jest components/landing/hero
npx eslint components
git add components/landing/hero
git commit -m "Share One Row Renderer Between The Hero Fields"
```

---

### Task 3: Compose the grid and its entrance

**Files:**
- Create: `components/landing/hero/hero-chart-field.tsx`
- Create: `components/landing/hero/hero-chart-field.test.tsx`
- Modify: `components/landing/hero/hero-section.tsx`
- Modify: `components/landing/hero/hero-section.test.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Write the failing tests**

Create `components/landing/hero/hero-chart-field.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

jest.mock("./hero-chart", () => ({
  HERO_CHART_COLUMNS: 8,
  HERO_CHART_FORMS: ["area-art", "bars-art", "line-art"],
}));

import { HeroChartField } from "./hero-chart-field";

describe("HeroChartField", () => {
  it("renders a form of the chart as decoration", () => {
    const { container } = render(<HeroChartField />);

    // The chart is illustration beside a real heading; it must not announce
    // itself as an image with a name the heading already carries.
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.textContent).toContain("area-art");
  });

  it("rests on the first form when motion is reduced", () => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })) as unknown as typeof window.matchMedia;

    const { container } = render(<HeroChartField />);

    expect(container.textContent).toContain("area-art");
    expect(container.textContent).not.toContain("bars-art");
  });
});
```

Then add to `components/landing/hero/hero-section.test.tsx`:

```tsx
  it("keeps the copy as real elements rather than art", () => {
    render(<HeroSection />);

    // The entire design rests on this: the grid is shared metrics, not copy
    // painted into a character field.
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toMatch(/every chart here/i);
    expect(screen.getByRole("button", { name: "Copy command" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest components/landing/hero
```

Expected: FAIL — `Cannot find module './hero-chart-field'`.

- [ ] **Step 3: Build the chart field**

Create `components/landing/hero/hero-chart-field.tsx`:

- Renders `TextField` with no `label`, so it is decorative.
- Cycles `HERO_CHART_FORMS` on a slow interval — around four seconds a form.
- Reads `prefers-reduced-motion` in a post-mount effect, never during render,
  and does not start the interval when it is set. The first form renders either
  way, so the server tree and the reduced-motion tree are identical.
- Clears the interval on unmount.

- [ ] **Step 4: Add the entrance keyframes**

In `app/globals.css`, add one keyframe that takes a row from invisible and a few
pixels low to its resting place, and a class that applies it with
`cubic-bezier(0.16, 1, 0.3, 1)`, `animation-fill-mode: both`, and a duration
around 500ms. Inside `@media (prefers-reduced-motion: reduce)`, set
`animation: none` on that class so rows render in their final state.

The animation must not repeat: no `infinite`, and nothing re-triggers it on
scroll.

- [ ] **Step 5: Compose the hero**

Rewrite `components/landing/hero/hero-section.tsx` so the section is one grid of
four regions sharing character metrics: an eyebrow row of small monospaced
labels, the `<h1>`, the chart field, and the portrait. Define the cell size once
on the section as a custom property and have every monospaced region read it, so
the fields and the copy sit on the same rhythm.

Give the heading and the command the entrance class with short delays, and the
two fields their row stagger, so the order resolves headline, then chart, then
portrait.

Keep: the real `<h1>`, the real `CommandSnippet`, no links, and the structural
non-overlap that the current grid guarantees. Do not reintroduce an absolutely
positioned portrait.

- [ ] **Step 6: Run the tests to verify they pass**

```bash
npx jest components/landing/hero
```

Expected: PASS.

- [ ] **Step 7: Verify and commit**

```bash
npx tsc --noEmit
npx jest
npx eslint app components
git add app components/landing/hero
git commit -m "Compose The Hero As One Text Grid"
```

---

### Task 4: Delete the morphing chart

Carried over unchanged from the previous plan. `morphing-chart.tsx` is
unreferenced since the hero was rewritten, and it is the last source of the
hydration mismatch on this page: it draws through `lib/chart-paths.ts`, whose
arc maths differs between server and client at the fourteenth decimal.

**Files:**
- Delete: `components/landing/hero/morphing-chart.tsx`, `hooks/use-morphing-chart.ts`, `lib/chart-paths.ts`
- Modify: `components/landing/hero/index.ts`, `hooks/index.ts`, `components/landing/chart-index/chart-index-section.tsx`

- [ ] **Step 1: Confirm nothing else uses them**

```bash
grep -rnE 'MorphingChart|use-morphing-chart|useMorphingChart|useChartData|chart-paths|ChartPhase' --include='*.ts' --include='*.tsx' app components hooks lib src
```

Expected: matches only inside the three files being deleted and the two barrels
being edited. Any other consumer means stop and report.

- [ ] **Step 2: Delete and clean the barrels**

```bash
git rm components/landing/hero/morphing-chart.tsx hooks/use-morphing-chart.ts lib/chart-paths.ts
```

Drop `MorphingChart` from `components/landing/hero/index.ts`. `hooks/index.ts`
exports only the morphing chart hooks, so it has nothing left — delete it, then
confirm nothing imported from the barrel:

```bash
git rm hooks/index.ts
grep -rn 'from "@/hooks"' --include='*.ts' --include='*.tsx' app components lib src
```

Expected: no output.

- [ ] **Step 3: Retire the repeated line in the chart index**

In `components/landing/chart-index/chart-index-section.tsx`, the `<h2>` reads
"Every chart below is the component you install." That repeats the hero headline
two hundred pixels later. Change it to `These are the components you install.`

- [ ] **Step 4: Verify and commit**

```bash
npx tsc --noEmit
npx jest
npx eslint app components hooks lib
git add -A
git commit -m "Retire The Morphing Chart"
```

Report the test count and the net line change.

---

### Task 5: Verify in a real browser and push

jsdom models neither layout nor animation. Every visual defect in this hero so
far was found by a human looking at it, not by the suite.

- [ ] **Step 1: Run the release gates**

```bash
npx tsc --noEmit
npx eslint app components hooks lib scripts
npx jest --runInBand
npm run build
```

If `git status` shows `packages/cli/src/utils/fallback-generated.ts` modified
without you editing it, the build regenerated it with different line endings:
`git checkout -- packages/cli/src/utils/fallback-generated.ts`.

- [ ] **Step 2: Confirm the grid is server-rendered**

```bash
npm run dev -- --port 3100
curl -s http://localhost:3100 | grep -c 'data-row'
```

Expected: a count in the dozens. Zero means the fields depend on JavaScript,
which defeats the design.

- [ ] **Step 3: Watch the entrance**

Load `http://localhost:3100` and watch it resolve. Confirm it runs once, takes
roughly a second, resolves headline then chart then portrait, and that nothing
overshoots or bounces. Reload a few times — a jump or a flash of unstyled rows
is a defect.

- [ ] **Step 4: Confirm reduced motion**

Enable the OS reduced-motion setting, reload, and confirm the grid is in its
final state from the first paint, with the same rows present and the chart
resting on its first form. Then check in the console:

```js
document.querySelectorAll('[data-row]').length
```

Expected: the same count as without reduced motion. A different number means a
different tree, which the design forbids.

- [ ] **Step 5: Check the console and the layout**

Expected: **no hydration warnings at all** — `lib/chart-paths.ts` is gone, so
its floating-point mismatch must be gone with it. Then narrow the window from
1440px down to about 320px and confirm the type stays legible, nothing overlaps,
and the page never scrolls sideways.

- [ ] **Step 6: Push**

```bash
git push origin feat/premium-ecosystem-redesign
```

Ten commits from earlier work are still unpushed; this is the first push of the
whole hero effort.
