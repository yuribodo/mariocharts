# Landing Design System Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the three unmigrated landing sections — showcase, CTA, footer — onto the design system, and retire the easter-egg system.

**Architecture:** The showcase's 500vh sticky scroll and its ~1,400 lines of bespoke SVG animation are replaced by a preview-first index that renders real Mario Charts components. The CTA drops its duplicated, keyboard-inaccessible copy control in favour of the accessible `CommandSnippet` built in Phase 1. The footer moves onto semantic tokens. The easter-egg system is deleted across twelve files.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Lucide React, Mario Charts components, Jest, Testing Library.

This is slice (a) of the craft redesign. It is deliberately the mechanical half: it
buys coherence and deletes dead weight. Slice (b) — the craft layer from
`docs/superpowers/specs/2026-07-28-landing-craft-redesign-design.md` — lands on top
afterwards.

**Where the craft layer appears early, and why.** Slice (b) owns the craft pass,
but Tasks 3 and 4 build new markup from scratch, so press feedback, hover gating,
and the easing token cost nothing there and are included. The hero's CTAs and the
footer's links keep their current interaction styling in this slice: touching them
would mean editing files this plan otherwise leaves alone. A reviewer should read
that asymmetry as scoped, not as an omission.

**Two steps describe requirements instead of supplying code, deliberately.**
Task 3 Step 4 and Task 5 Step 3 state what to build rather than what to type.
Task 3 renders six chart components whose exact prop signatures are not verified
here — inventing them would put wrong code in a plan, so the step instead names
the authoritative source to read for each. Task 5 depends on what
`terminal-link.tsx` does to a link's accessible name, which decides whether its
typing effect survives. Both are flagged rather than guessed.

## Global Constraints

- Work in the worktree `.worktrees/premium-ecosystem-redesign` on branch `feat/premium-ecosystem-redesign`.
- Radii stay between 4px and 8px: `rounded`, `rounded-md`. Never `rounded-xl`, `rounded-2xl`, `rounded-3xl`.
- Connected regions use one-pixel dividers with no gap. No floating cards.
- No `backdrop-blur`, no decorative shadows. `shadow-lg` is forbidden.
- No raw Tailwind color literals (`bg-green-500`, `text-green-500`, `border-green-500/50`). Use semantic tokens or `var(--chart-*)`.
- Prefer plain semantic tokens over opacity-modified ones: `border`, not `border-border/50`.
- Data palette colors are reserved for data. They are not page decoration.
- UI transitions run 150ms to 220ms with exponential ease-out: `ease-[cubic-bezier(0.16,1,0.3,1)]`. Never `transition: all`. Honour `motion-reduce`.
- Large display type is reserved for the hero. Section headings stay at `text-2xl`/`text-3xl` with `font-semibold`.
- Touch targets stay at least 44px, or a compact visual target inside an expanded hit area.
- Reduced motion must render the **same tree** with motion removed — never a separate fallback tree.
- Replace the words "beautiful", "modern", and "customizable" with a demonstration or a concrete statement. #60 requires evidence over adjectives.
- `lib/chart-paths.ts` must NOT be deleted — `hero/morphing-chart.tsx` and `hooks/use-morphing-chart.ts` still import it.
- The hero (`components/landing/hero/*`) and the code workbench (`components/landing/code-demo/*`) are already migrated. Do not restyle them in this plan; Task 2 touches the workbench for one line only.
- Tests are colocated as `*.test.tsx`.

---

### Task 1: Sync the branch with main

The branch is five commits behind `main`, and `main` carries a twelfth chart —
`waterfall-chart`, merged in #62 — that does not exist on this branch. Building
the chart index before syncing would produce an index that silently omits it.

A dry-run merge (`git merge-tree --write-tree origin/main HEAD`) was already run
and reported no conflicts.

**Files:**
- Modify: whatever `main` brings. No hand edits.

- [ ] **Step 1: Confirm the merge is still conflict-free**

```bash
cd .worktrees/premium-ecosystem-redesign
git fetch origin
git merge-tree --write-tree origin/main HEAD
```

Expected: a single tree SHA and exit code 0. If it prints conflict markers or a
non-zero status, stop and report — do not force the merge.

- [ ] **Step 2: Merge**

```bash
git merge origin/main --no-edit
```

- [ ] **Step 3: Confirm the twelfth chart arrived**

```bash
ls src/components/charts
```

Expected: `waterfall-chart` is present alongside the other eleven and `_shared`.

- [ ] **Step 4: Confirm nothing regressed**

```bash
npx tsc --noEmit
npx jest
```

Expected: typecheck clean, full suite green. Report the test count — it should
rise, because `main` carries the CLI unit tests this branch did not have.

- [ ] **Step 5: Discard the build artifact if present**

`npm run build` regenerates `packages/cli/src/utils/fallback-generated.ts` with
different line endings. If `git status` shows it modified without you having
edited it, discard it:

```bash
git checkout -- packages/cli/src/utils/fallback-generated.ts
```

No commit is needed for this task beyond the merge commit `git merge` creates.

---

### Task 2: Retire the easter-egg system

Party mode, the Konami handler, and the badge system are removed. #60 asks for
easter eggs to sit outside conversion flows; today they sit inside the CTA.

This reverses one decision from the workbench slice, where the copy button kept
`unlock("first-copy")` running silently. That call goes.

**Decision, made here rather than left open:** removing the last `unlock` call
leaves `CodeBlock`'s `onCopy` prop with no consumer, so **remove the prop**. A
public prop nothing calls is dead surface, and re-adding it later is three lines.
Remove its two tests along with it.

**Files:**
- Delete: `components/landing/easter-eggs/easter-eggs-provider.tsx`
- Delete: `components/landing/easter-eggs/party-mode.tsx`
- Delete: `components/landing/easter-eggs/index.ts`
- Delete: `components/landing/cta/badge-display.tsx`
- Delete: `hooks/use-badges.ts`
- Delete: `lib/badges.ts`
- Modify: `hooks/index.ts`
- Modify: `components/landing/index.ts`
- Modify: `app/landing-content.tsx`
- Modify: `lib/animations.ts`
- Modify: `package.json`
- Modify: `components/landing/cta/cta-section.tsx`
- Modify: `components/landing/code-demo/workbench-code.tsx`
- Modify: `components/landing/code-demo/workbench-code.test.tsx`
- Modify: `components/landing/code-demo/code-demo-section.test.tsx`
- Modify: `components/ui/code-block.tsx`
- Modify: `components/ui/code-block.test.tsx`

**Interfaces:**
- Produces: `CodeBlock(props: { code: string; language?: string; className?: string; highlightedLines?: readonly number[] })` — `onCopy` is gone.

- [ ] **Step 1: Delete the modules**

```bash
git rm components/landing/easter-eggs/easter-eggs-provider.tsx components/landing/easter-eggs/party-mode.tsx components/landing/easter-eggs/index.ts components/landing/cta/badge-display.tsx hooks/use-badges.ts lib/badges.ts
```

- [ ] **Step 2: Unwrap the provider**

In `app/landing-content.tsx`, remove `EasterEggsProvider` from the import list
and unwrap it, so `<main>` becomes the outermost element. Leave `HeroSection`,
`ShowcaseSection`, `CodeDemoSection`, `CTASection`, `LandingFooter`, and
`LandingBackground` exactly as they are — Task 3 replaces `ShowcaseSection`.

- [ ] **Step 3: Clean the barrels**

In `hooks/index.ts`, delete:

```ts
export { useBadges } from "./use-badges";
```

In `components/landing/index.ts`, delete:

```ts
export { EasterEggsProvider, useEasterEggs, PartyMode } from "./easter-eggs";
```

- [ ] **Step 4: Remove the confetti presets and the dependency**

Delete the whole `confettiConfig` export from `lib/animations.ts` — party mode
was its last consumer, so `default`, `party`, and `copy` all go. Then remove
`canvas-confetti` from `package.json` dependencies and refresh the lockfile:

```bash
npm uninstall canvas-confetti
```

If `@types/canvas-confetti` is also present, remove it the same way.

- [ ] **Step 5: Strip the badge wiring from the CTA**

In `components/landing/cta/cta-section.tsx`, remove the `BadgeToast` import, the
`useBadges` import, the `const { lastUnlocked, clearLastUnlocked } = useBadges();`
line, and the `<BadgeToast ... />` element. Leave the rest of the file alone —
Task 4 rewrites it.

- [ ] **Step 6: Remove the workbench's unlock call**

In `components/landing/code-demo/workbench-code.tsx`, drop the `useBadges`
import, the `const { unlock } = useBadges();` line, and the `onCopy` prop passed
to `CodeBlock`.

In `workbench-code.test.tsx`, delete the `jest.mock("@/hooks", ...)` factory, the
`unlock` mock, the `unlock.mockClear()` in `beforeEach`, and the test named
`"unlocks the first-copy badge without any celebration"`. Remove `onCopy` from
the local `CodeBlock` mock's props.

In `code-demo-section.test.tsx`, delete the `jest.mock("@/hooks", ...)` factory.

- [ ] **Step 7: Remove the `onCopy` prop from CodeBlock**

In `components/ui/code-block.tsx`: delete `onCopy` from `CodeBlockProps`
(including its JSDoc line), from the destructured signature, and the `onCopy?.();`
call in `copyToClipboard`.

In `components/ui/code-block.test.tsx`, delete the two tests
`"reports a successful copy to its caller"` and
`"does not report a copy that failed"`. Keep every other test, including the
retry test and the `"keeps the copy action visible and announces success"` test —
the copy button and its `aria-live` announcement remain.

- [ ] **Step 8: Confirm nothing survives**

```bash
grep -rn 'useBadges\|EasterEggs\|PartyMode\|party-mode\|easter-egg\|confettiConfig\|canvas-confetti\|BadgeToast\|onCopy\|first-copy' --include=*.ts --include=*.tsx app components hooks lib src
```

Expected: no output. `app/docs/components/funnel-chart/funnel-chart-content.tsx`
contains the word "badges" in prose about conversion-rate labels — it is
unrelated and must not be touched, and this grep does not match it.

- [ ] **Step 9: Verify and commit**

```bash
npx tsc --noEmit
npx jest
npx eslint app components hooks lib
```

Expected: typecheck clean, suite green, no new lint errors. The suite loses four
tests (one badge test, two `onCopy` tests, and nothing else) — confirm the drop
is exactly that and not larger.

```bash
git add -A
git commit -m "Retire Landing Easter Eggs"
```

---

### Task 3: Replace the sticky showcase with a chart index

The showcase spends five viewport heights (`height: 500vh`) showing four charts,
and under `prefers-reduced-motion` it abandons the effect and renders a
different static tree. It also draws its charts with ~1,400 lines of bespoke SVG
animation rather than the components the library ships — the same credibility
problem the code workbench was rebuilt to fix.

Replace it with a preview-first index of **real** chart components, scannable in
one view, structurally identical with and without reduced motion.

**Files:**
- Create: `components/landing/chart-index/chart-index-section.tsx`
- Create: `components/landing/chart-index/chart-index-data.ts`
- Create: `components/landing/chart-index/chart-index-section.test.tsx`
- Create: `components/landing/chart-index/index.ts`
- Delete: `components/landing/showcase/showcase-section.tsx`
- Delete: `components/landing/showcase/showcase-chart.tsx`
- Delete: `components/landing/showcase/showcase-content.tsx`
- Delete: `components/landing/showcase/index.ts`
- Delete: `hooks/use-showcase-chart.ts`
- Modify: `hooks/index.ts`
- Modify: `components/landing/index.ts`
- Modify: `app/landing-content.tsx`

**Interfaces:**
- Produces: `ChartIndexSection(props: { className?: string })`, and from `chart-index-data.ts` a `CHART_INDEX` array of `{ name, href, summary }` entries.

**Sourcing the chart props — read this before writing any preview.**

Do not guess any chart's API. Each chart has a documentation page under
`app/docs/components/<chart>/<chart>-content.tsx` that renders it with verified
working props. Read the page for each chart you render and copy its prop usage.
Two traps confirmed present:

- The docs directory for the treemap is `app/docs/components/treemap/`, but the
  component directory is `src/components/charts/treemap-chart/`.
- Charts are imported from `@/src/components/charts/<chart>`, not
  `@/components/charts/<chart>`. The latter path is what the CLI writes into a
  *consumer's* project and does not resolve inside this repo.

Render six charts, not all twelve: the landing is an invitation, and
`/docs/components` is the complete index (built in Phase 3). Use `bar-chart`,
`line-chart`, `area-chart`, `pie-chart`, `radar-chart`, and `treemap-chart` —
a spread of shapes rather than six variations on bars. Link to the full index.

Pass `animation={false}` to every preview if the prop exists on that chart. Six
simultaneously animating charts is decoration, and the grid must look identical
under reduced motion.

- [ ] **Step 1: Write the failing test**

Create `components/landing/chart-index/chart-index-section.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { ChartIndexSection } from "./chart-index-section";
import { CHART_INDEX } from "./chart-index-data";

jest.mock("@/src/components/charts/bar-chart", () => ({ BarChart: () => <div /> }));
jest.mock("@/src/components/charts/line-chart", () => ({ LineChart: () => <div /> }));
jest.mock("@/src/components/charts/area-chart", () => ({ AreaChart: () => <div /> }));
jest.mock("@/src/components/charts/pie-chart", () => ({ PieChart: () => <div /> }));
jest.mock("@/src/components/charts/radar-chart", () => ({ RadarChart: () => <div /> }));
jest.mock("@/src/components/charts/treemap-chart", () => ({ TreemapChart: () => <div /> }));

describe("ChartIndexSection", () => {
  it("presents every indexed chart as a link to its documentation", () => {
    render(<ChartIndexSection />);

    expect(CHART_INDEX.length).toBe(6);
    for (const entry of CHART_INDEX) {
      expect(screen.getByRole("link", { name: new RegExp(entry.name, "i") })).toHaveAttribute(
        "href",
        entry.href,
      );
    }
  });

  it("offers a path to the complete component index", () => {
    render(<ChartIndexSection />);

    expect(
      screen.getByRole("link", { name: /browse all components/i }),
    ).toHaveAttribute("href", "/docs/components");
  });

  it("does not hijack scroll with a tall spacer", () => {
    const { container } = render(<ChartIndexSection />);
    const markup = container.innerHTML;

    expect(markup).not.toContain("500vh");
    expect(markup).not.toContain("sticky");
  });

  it("uses connected surfaces instead of floating cards", () => {
    const { container } = render(<ChartIndexSection />);
    const markup = container.innerHTML;

    expect(markup).not.toContain("rounded-xl");
    expect(markup).not.toContain("rounded-2xl");
    expect(markup).not.toContain("backdrop-blur");
    expect(markup).not.toContain("shadow-lg");
  });

  it("keeps the heading out of hero display sizing", () => {
    render(<ChartIndexSection />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.className).not.toMatch(/text-(4|5|6|7)xl/);
    expect(heading.className).not.toContain("font-bold");
  });
});
```

**The mock export names above are unverified.** `jest.mock` factories are written
against guessed export names (`LineChart`, `TreemapChart`, …). Before running the
test, open each chart's `index.tsx` under `src/components/charts/<chart>/` and
correct every factory to the real exported name. A wrong name makes the factory
return a module without the export the component imports, which fails with a
confusing render error rather than an obvious mock error.

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx jest components/landing/chart-index
```

Expected: FAIL — `Cannot find module './chart-index-section'`.

- [ ] **Step 3: Create the index data**

Create `components/landing/chart-index/chart-index-data.ts`. Each `summary` must
say what analytical question the chart answers — not that it is beautiful:

```ts
export interface ChartIndexEntry {
  readonly name: string;
  readonly href: string;
  readonly summary: string;
}

export const CHART_INDEX: readonly ChartIndexEntry[] = [
  { name: "Bar Chart", href: "/docs/components/bar-chart", summary: "Compare values across categories." },
  { name: "Line Chart", href: "/docs/components/line-chart", summary: "Follow a value over time." },
  { name: "Area Chart", href: "/docs/components/area-chart", summary: "Show volume beneath a trend." },
  { name: "Pie Chart", href: "/docs/components/pie-chart", summary: "Read parts against a whole." },
  { name: "Radar Chart", href: "/docs/components/radar-chart", summary: "Weigh several dimensions at once." },
  { name: "Treemap", href: "/docs/components/treemap", summary: "Rank nested shares by area." },
] as const;
```

Note the treemap's `href` is `/docs/components/treemap` — matching its docs
directory, not the component directory name.

- [ ] **Step 4: Build the section**

Create `components/landing/chart-index/chart-index-section.tsx`. Structure
requirements, in place of code you would otherwise copy blindly:

- One `<section aria-labelledby>` with an eyebrow, an `<h2>` at
  `text-2xl font-semibold sm:text-3xl`, and one supporting line.
- A connected grid: one bordered `rounded-md` container, `sm:grid-cols-2
  lg:grid-cols-3`, with cells separated by one-pixel dividers and **no gap**.
  Use `divide-x divide-y` or per-cell borders — not `gap-*` between cards.
- Each cell is a `<Link>` to the chart's docs page containing: a fixed-height
  preview region (`h-40` or similar — identical across all six so hover never
  shifts layout), the chart name, and the summary.
- Each cell gets `active:scale-[0.99]` with a 150ms `ease-[cubic-bezier(0.16,1,0.3,1)]`
  transition, and any hover style sits behind `@media (hover: hover)` — express
  that in Tailwind as `[@media(hover:hover)]:hover:bg-accent`.
- Below the grid, a single link reading "Browse all components" to
  `/docs/components`.
- No `motion.*` wrappers, no `whileInView`, no `useReducedMotion`. Entry
  animation is out of scope for this task; slice (b) adds it in CSS.

Read each chart's docs content page for its real props before rendering it.

- [ ] **Step 5: Create the barrel**

Create `components/landing/chart-index/index.ts`:

```ts
export { ChartIndexSection } from "./chart-index-section";
```

- [ ] **Step 6: Run the test to verify it passes**

```bash
npx jest components/landing/chart-index
```

Expected: PASS, 5 tests.

- [ ] **Step 7: Swap it into the page and delete the showcase**

In `app/landing-content.tsx`, replace `<ShowcaseSection />` with
`<ChartIndexSection />` and update the import. Then:

```bash
git rm components/landing/showcase/showcase-section.tsx components/landing/showcase/showcase-chart.tsx components/landing/showcase/showcase-content.tsx components/landing/showcase/index.ts hooks/use-showcase-chart.ts
```

In `hooks/index.ts`, remove the `useShowcaseChart` export. In
`components/landing/index.ts`, remove the showcase exports and add the chart
index.

- [ ] **Step 8: Confirm nothing survives**

```bash
grep -rn 'use-showcase-chart\|useShowcaseChart\|ShowcaseChart\|ShowcaseSection\|showcase-content\|SHOWCASE_CONTENT\|CHART_SEQUENCE\|ProgressDots' --include=*.ts --include=*.tsx app components hooks lib src
```

Expected: no output.

Also confirm `lib/chart-paths.ts` still exists and is still imported by the hero:

```bash
grep -rln 'chart-paths' --include=*.ts --include=*.tsx app components hooks lib src
```

Expected: `components/landing/hero/morphing-chart.tsx` and
`hooks/use-morphing-chart.ts`. The file must NOT be deleted.

- [ ] **Step 9: Verify and commit**

```bash
npx tsc --noEmit
npx jest
npx eslint app components hooks lib
git add -A
git commit -m "Replace Sticky Showcase With Chart Index"
```

---

### Task 4: Migrate the CTA onto the design system

The CTA carries the most defects of any landing section, including a real
accessibility bug: the command container is a `<div>` with `onClick` and no
`role`, `tabIndex`, or key handler, so the command cannot be copied by keyboard.
Its copy failure path is a bare `console.error` with nothing shown to the user.
It also types the command out character by character at 50ms — roughly 1.6
seconds of decoration before there is any text to copy, inside a conversion flow.

All three are already solved by `components/ui/command-snippet.tsx`, built in
Phase 1: a real button, `idle`/`success`/`error` states, a `role="status"`
`aria-live` region, and a 44px target.

**Files:**
- Modify: `components/landing/cta/cta-section.tsx`
- Create: `components/landing/cta/cta-section.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/landing/cta/cta-section.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { CTASection } from "./cta-section";

describe("CTASection", () => {
  it("offers the install command through the accessible snippet", () => {
    render(<CTASection />);

    expect(screen.getByText("npx mario-charts@latest init")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy command" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("routes to the docs and the repository", () => {
    render(<CTASection />);

    expect(screen.getByRole("link", { name: /read the docs/i })).toHaveAttribute(
      "href",
      "/docs",
    );
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/yuribodo/mariocharts",
    );
  });

  it("states the offer without adjective claims", () => {
    render(<CTASection />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).not.toMatch(/beautiful|modern|customizable/i);
    expect(heading.className).not.toMatch(/text-(4|5|6|7)xl/);
    expect(heading.className).not.toContain("font-bold");
  });

  it("drops the pre-design-system surfaces", () => {
    const { container } = render(<CTASection />);
    const markup = container.innerHTML;

    expect(markup).not.toContain("rounded-xl");
    expect(markup).not.toContain("backdrop-blur");
    expect(markup).not.toContain("shadow-lg");
    expect(markup).not.toContain("transition-all");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx jest components/landing/cta
```

Expected: FAIL — the heading still reads "Ready to build something beautiful?"
and the markup still contains `rounded-xl` and `backdrop-blur`.

- [ ] **Step 3: Rewrite the section**

Replace the whole contents of `components/landing/cta/cta-section.tsx`:

```tsx
"use client";

import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

import { cn } from "@/lib/utils";
import { CommandSnippet } from "@/components/ui/command-snippet";

interface CTASectionProps {
  className?: string;
}

const CLI_COMMAND = "npx mario-charts@latest init";

export function CTASection({ className }: CTASectionProps) {
  return (
    <section
      aria-labelledby="cta-title"
      className={cn("border-t py-16 lg:py-24", className)}
    >
      <div className="mx-auto max-w-2xl px-6">
        <h2
          id="cta-title"
          className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl"
        >
          Install it and own the source.
        </h2>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          One command writes the components into your project. No runtime
          dependency on us, nothing to eject from later.
        </p>

        <div className="mt-8">
          <CommandSnippet command={CLI_COMMAND} />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/docs"
            className="group inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-[transform,opacity] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [@media(hover:hover)]:hover:opacity-90 motion-reduce:transition-none"
          >
            Read the Docs
            <ArrowRight
              className="size-4 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </Link>

          <a
            href="https://github.com/yuribodo/mariocharts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border px-5 text-sm font-medium text-foreground transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [@media(hover:hover)]:hover:bg-accent motion-reduce:transition-none"
          >
            <Github className="size-4" aria-hidden="true" />
            Star on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
```

Note what left: the typing `useEffect` and its `setInterval`, the duplicated
clipboard handler, the `console.error`, the `div`-with-`onClick`, the
`text-primary` colored word, the raw `green-500` literals, `backdrop-blur-sm`,
three `rounded-xl`, four `transition-all`, and the `whileHover`/`whileTap`
wrappers — replaced by CSS `active:scale`, which is both cheaper and works when
the main thread is busy.

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx jest components/landing/cta
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Check for orphaned animation helpers**

```bash
grep -rn 'buttonHover\|buttonTap' --include=*.ts --include=*.tsx app components hooks lib src
```

If `lib/animations.ts` is now their only reference, remove both exports. If other
surfaces still use them, leave them.

- [ ] **Step 6: Verify and commit**

```bash
npx tsc --noEmit
npx jest
npx eslint app components hooks lib
git add -A
git commit -m "Migrate Landing CTA To Design System"
```

---

### Task 5: Migrate the footer onto the design system

The footer is the mildest of the three — no forbidden radii or shadows. What it
carries is token drift (`border-border/50`, `border-border/30`,
`text-muted-foreground/70`, `text-muted-foreground/60`), an adjective claim
("Beautiful charts, zero config."), and main-thread entry animation through
`whileInView`.

**Files:**
- Modify: `components/landing/footer/landing-footer.tsx`
- Create: `components/landing/footer/landing-footer.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/landing/footer/landing-footer.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { LandingFooter } from "./landing-footer";

describe("LandingFooter", () => {
  it("links to the documentation surfaces", () => {
    render(<LandingFooter />);

    expect(screen.getByRole("link", { name: /^docs$/i })).toHaveAttribute("href", "/docs");
    expect(screen.getByRole("link", { name: /components/i })).toHaveAttribute(
      "href",
      "/docs/components",
    );
    expect(screen.getByRole("link", { name: /installation/i })).toHaveAttribute(
      "href",
      "/docs/installation",
    );
  });

  it("names its navigation groups for assistive technology", () => {
    render(<LandingFooter />);

    expect(screen.getByRole("navigation", { name: /navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /connect/i })).toBeInTheDocument();
  });

  it("describes the product without adjective claims", () => {
    const { container } = render(<LandingFooter />);

    expect(container.textContent).not.toMatch(/beautiful|modern|customizable/i);
  });

  it("uses plain semantic tokens for dividers and muted text", () => {
    const { container } = render(<LandingFooter />);
    const markup = container.innerHTML;

    expect(markup).not.toContain("border-border/");
    expect(markup).not.toContain("text-muted-foreground/");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx jest components/landing/footer
```

Expected: FAIL — the copy still says "Beautiful charts" and the markup still
contains `border-border/50`.

- [ ] **Step 3: Rewrite the footer**

Requirements, applied to `components/landing/footer/landing-footer.tsx`:

- Drop `motion` and `useReducedMotion` entirely. No entry animation in this task.
- Replace `border-border/50` and `border-border/30` with `border`, and
  `text-muted-foreground/70` and `text-muted-foreground/60` with
  `text-muted-foreground`.
- Replace the brand line "Beautiful charts, / zero config." with a concrete
  statement: `Copy-paste chart components. You own every line.`
- Give each `<nav>` an `aria-label` matching its visible heading ("Navigation",
  "Connect") so the two navigation landmarks are distinguishable.
- Keep `NAV_LINKS` and `SOCIAL_LINKS` as they are.
- Keep the `TerminalLink` children, but confirm each rendered link exposes an
  accessible name equal to its label. If `TerminalLink`'s typing effect means the
  accessible name is initially empty or partial, that breaks the test above and
  the effect must go — the link text is navigation, not decoration. Read
  `components/landing/footer/terminal-link.tsx` before deciding, and report which
  way you went.
- The copyright line: keep `new Date().getFullYear()`, but note in your report
  whether it renders inside a client component (it does) and whether that risks a
  hydration mismatch across a year boundary. Do not fix it here.

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx jest components/landing/footer
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Verify and commit**

```bash
npx tsc --noEmit
npx jest
npx eslint app components hooks lib
git add -A
git commit -m "Migrate Landing Footer To Design System"
```

---

### Task 6: Verify the slice end to end

**Files:**
- Verify: `app/landing-content.tsx`, `components/landing/**`

- [ ] **Step 1: Run the release gates**

```bash
npx tsc --noEmit
npx eslint app components hooks lib
npx jest --runInBand
npm run build
```

Expected: all four clean. Report the test count.

- [ ] **Step 2: Confirm the deletion actually landed**

```bash
git diff --stat origin/main...HEAD -- components/landing hooks lib
```

Expected: a net deletion in the low thousands of lines, driven by
`use-showcase-chart.ts` (953), `showcase-chart.tsx` (308), `party-mode.tsx`
(237), `lib/badges.ts` (195), `showcase-content.tsx` (148),
`easter-eggs-provider.tsx` (178), `badge-display.tsx` (129), and
`use-badges.ts` (90).

- [ ] **Step 3: Measure the scroll reduction**

```bash
npm run dev -- --port 3100
```

In the browser console on `http://localhost:3100`:

```js
document.documentElement.scrollHeight / window.innerHeight
```

Expected: roughly four viewport heights lower than before the change. Record both
numbers in your report. (Before this slice, the showcase alone contributed 5.)

- [ ] **Step 4: Drive the page**

In light and dark, at `1440x1000` and `390x844`, confirm:

- All six chart previews render actual charts, none blank or clipped.
- Every preview cell is reachable by keyboard with a visible focus ring, and
  pressing one navigates to that chart's docs page.
- The CTA command is copyable **by keyboard alone** (tab to the button, press
  Enter) and announces success or failure.
- No section hijacks scroll.
- Nothing shifts layout on hover.

- [ ] **Step 5: Confirm reduced motion renders the same tree**

Enable the OS reduced-motion setting, reload, and confirm the chart index has the
same structure — same six cells, same grid — with motion removed. This is the
regression that mattered: the old showcase rendered a different tree entirely.

- [ ] **Step 6: Check the console**

Confirm no **new** hydration warnings. One pre-existing floating-point mismatch
exists via `lib/chart-paths.ts`; retiring the showcase should remove one of its
two sources (`showcase-chart.tsx`), leaving only `morphing-chart.tsx`. Confirm
that is what you see, and do not fix the remainder here.

- [ ] **Step 7: Push**

```bash
git push origin feat/premium-ecosystem-redesign
```
