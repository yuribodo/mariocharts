# Design Foundations and Docs Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the approved Geist-and-Resend-inspired visual foundations and prove them on the shared header plus the documentation introduction page.

**Architecture:** Keep semantic design tokens in `app/globals.css`, mirror reusable chart-series values in a small typed module, and build focused shared components rather than restyling every route at once. The existing Next.js app shell remains intact; the representative docs slice validates navigation, command copying, responsive layout, dark mode, and accessibility before later plans migrate the home page and dashboards.

**Tech Stack:** Next.js 15, React 18+, TypeScript strict mode, Tailwind CSS 4, Jest, Testing Library, next-themes, Lucide React.

---

## File Map

- Create `DESIGN.md`: canonical visual-token and component guidance.
- Modify `app/globals.css`: OKLCH semantic tokens, radii, motion, focus, and data colors.
- Create `lib/design-tokens.ts`: typed data-series palette used by React code.
- Create `lib/design-tokens.test.ts`: token completeness and uniqueness tests.
- Create `components/ui/command-snippet.tsx`: accessible reusable command copier.
- Create `components/ui/command-snippet.test.tsx`: keyboard and clipboard behavior.
- Modify `components/site/site-header.tsx`: common neutral ecosystem navigation.
- Create `components/site/site-header.test.tsx`: active navigation and accessible controls.
- Modify `app/docs/layout.tsx`: stable three-region documentation shell.
- Modify `components/site/docs-sidebar-nav.tsx`: compact accessible search and navigation.
- Create `components/site/docs-sidebar-nav.test.tsx`: filtering and disclosure behavior.
- Modify `app/docs/docs-content.tsx`: concise introduction and one-minute quickstart.
- Create `app/docs/docs-content.test.tsx`: page hierarchy and quickstart behavior.
- Modify `components/ui/code-block.tsx`: visible copy action and theme-aware Shiki output.

## Task 1: Document and encode the design foundations

**Files:**
- Create: `DESIGN.md`
- Create: `lib/design-tokens.ts`
- Create: `lib/design-tokens.test.ts`
- Modify: `app/globals.css:4-8`
- Modify: `app/globals.css:448-581`

- [ ] **Step 1: Write the failing palette tests**

Create `lib/design-tokens.test.ts`:

```ts
import { chartSeries } from "./design-tokens";

describe("chartSeries", () => {
  it("provides six named series in a stable order", () => {
    expect(Object.keys(chartSeries)).toEqual([
      "blue",
      "green",
      "amber",
      "coral",
      "violet",
      "cyan",
    ]);
  });

  it("uses unique CSS variable references", () => {
    const values = Object.values(chartSeries);
    expect(new Set(values).size).toBe(values.length);
    expect(values.every((value) => value.startsWith("var(--chart-"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test and confirm the missing module failure**

Run: `npm test -- lib/design-tokens.test.ts --runInBand`

Expected: FAIL because `./design-tokens` does not exist.

- [ ] **Step 3: Add the typed palette module**

Create `lib/design-tokens.ts`:

```ts
export const chartSeries = {
  blue: "var(--chart-blue)",
  green: "var(--chart-green)",
  amber: "var(--chart-amber)",
  coral: "var(--chart-coral)",
  violet: "var(--chart-violet)",
  cyan: "var(--chart-cyan)",
} as const;

export type ChartSeriesName = keyof typeof chartSeries;
```

- [ ] **Step 4: Replace the current hex/HSL theme with semantic OKLCH tokens**

In `app/globals.css`, keep the existing Tailwind mappings but set the root radius to `0.5rem`, add `--duration-fast: 150ms`, `--duration-base: 200ms`, and use these light values:

```css
:root {
  --radius: 0.5rem;
  --background: oklch(0.985 0.003 95);
  --foreground: oklch(0.205 0.008 95);
  --card: oklch(0.995 0.002 95);
  --card-foreground: var(--foreground);
  --popover: oklch(0.995 0.002 95);
  --popover-foreground: var(--foreground);
  --primary: oklch(0.24 0.01 95);
  --primary-foreground: oklch(0.985 0.003 95);
  --secondary: oklch(0.955 0.004 95);
  --secondary-foreground: oklch(0.34 0.008 95);
  --muted: oklch(0.955 0.004 95);
  --muted-foreground: oklch(0.49 0.012 95);
  --accent: oklch(0.94 0.006 95);
  --accent-foreground: var(--foreground);
  --destructive: oklch(0.58 0.2 25);
  --border: oklch(0.885 0.006 95);
  --input: oklch(0.86 0.007 95);
  --ring: oklch(0.55 0.17 255);
  --chart-blue: oklch(0.59 0.18 255);
  --chart-green: oklch(0.63 0.14 155);
  --chart-amber: oklch(0.72 0.15 78);
  --chart-coral: oklch(0.64 0.19 30);
  --chart-violet: oklch(0.59 0.17 300);
  --chart-cyan: oklch(0.67 0.12 205);
  --chart-1: var(--chart-blue);
  --chart-2: var(--chart-green);
  --chart-3: var(--chart-amber);
  --chart-4: var(--chart-coral);
  --chart-5: var(--chart-violet);
  --sidebar: oklch(0.965 0.004 95);
  --sidebar-foreground: var(--foreground);
  --sidebar-primary: var(--primary);
  --sidebar-primary-foreground: var(--primary-foreground);
  --sidebar-accent: oklch(0.935 0.006 95);
  --sidebar-accent-foreground: var(--foreground);
  --sidebar-border: var(--border);
  --sidebar-ring: var(--ring);
  --duration-fast: 150ms;
  --duration-base: 200ms;
}
```

Add equivalent dark tokens using tinted neutrals: `--background: oklch(0.17 0.006 95)`, `--foreground: oklch(0.94 0.004 95)`, `--card: oklch(0.195 0.006 95)`, and `--border: oklch(0.31 0.007 95)`. Keep the same six hues but raise lightness enough to maintain contrast on the dark background. Remove `.glass-card`, `.btn-gradient`, and the remote GIF mask used by the theme transition. Do not remove chart-specific gradients used to encode chart data.

- [ ] **Step 5: Write the canonical design reference**

Create `DESIGN.md` with the sections `Visual Theme`, `Color`, `Typography`, `Shape`, `Elevation`, `Motion`, `Charts`, `Components`, `Responsive Behavior`, and `Accessibility`. Record the exact variables from Step 4, Geist Sans/Mono roles, 4px-8px radii, one-pixel dividers, 150ms-220ms motion, and the rule that multicolor is restricted to data and semantic state.

- [ ] **Step 6: Run focused and static verification**

Run: `npm test -- lib/design-tokens.test.ts --runInBand && npm run typecheck && npm run lint`

Expected: all commands exit `0`.

- [ ] **Step 7: Commit the foundations**

```bash
git add DESIGN.md app/globals.css lib/design-tokens.ts lib/design-tokens.test.ts
git commit -m "Add Premium Design Foundations"
```

## Task 2: Build the reusable command snippet

**Files:**
- Create: `components/ui/command-snippet.tsx`
- Create: `components/ui/command-snippet.test.tsx`

- [ ] **Step 1: Write failing interaction tests**

Create `components/ui/command-snippet.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { CommandSnippet } from "./command-snippet";

describe("CommandSnippet", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  it("copies the complete command and announces success", async () => {
    render(<CommandSnippet command="npx mario-charts@latest init" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy command" }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "npx mario-charts@latest init",
    );
    expect(await screen.findByText("Command copied")).toBeInTheDocument();
  });

  it("shows the command as code", () => {
    render(<CommandSnippet command="npm run dev" />);
    expect(screen.getByText("npm run dev").tagName).toBe("CODE");
  });
});
```

- [ ] **Step 2: Run the test and confirm the missing component failure**

Run: `npm test -- components/ui/command-snippet.test.tsx --runInBand`

Expected: FAIL because `CommandSnippet` does not exist.

- [ ] **Step 3: Implement the command snippet**

Create a client component accepting `command: string`, `label?: string`, and `className?: string`. Render a semantic `<code>` element and a 36px visual copy button with at least a 44px touch target. Use Lucide `Copy` and `Check`, `aria-label="Copy command"`, and a polite live region containing `Command copied` for two seconds after a successful clipboard write. On failure, announce `Unable to copy command` and leave the command selectable. Use `rounded-md border bg-card` with no shadow or backdrop blur.

- [ ] **Step 4: Run the focused test**

Run: `npm test -- components/ui/command-snippet.test.tsx --runInBand`

Expected: PASS with 2 tests.

- [ ] **Step 5: Commit the component**

```bash
git add components/ui/command-snippet.tsx components/ui/command-snippet.test.tsx
git commit -m "Add Accessible Command Snippet"
```

## Task 3: Unify the ecosystem header

**Files:**
- Modify: `components/site/site-header.tsx`
- Create: `components/site/site-header.test.tsx`

- [ ] **Step 1: Write failing header tests**

Mock `next/navigation`, `ThemeToggle`, `LogoAnimated`, and `GitHubStars`. Assert that `Charts`, `Examples`, and `Docs` are present; `Charts` points to `/docs/components`; the current section has `aria-current="page"`; and the GitHub link has an accessible name.

- [ ] **Step 2: Run the test and verify the accessible-current assertion fails**

Run: `npm test -- components/site/site-header.test.tsx --runInBand`

Expected: FAIL because the existing active link does not expose `aria-current` and navigation ordering differs.

- [ ] **Step 3: Implement the neutral shared header**

Update the navigation to this order:

```ts
const navigation = [
  { name: "Charts", href: "/docs/components" },
  { name: "Examples", href: "/examples" },
  { name: "Docs", href: "/docs" },
] as const;
```

Use a `56px` stable height, an opaque `bg-background` with `border-b`, and no default backdrop blur. Active links receive `aria-current="page"`, strong foreground color, and a subtle neutral background. Keep all icon buttons at a 40px desktop hit target and 44px mobile hit target. Preserve mobile drawers and progress dots, but ensure home-only progress UI does not change header dimensions.

- [ ] **Step 4: Run focused verification**

Run: `npm test -- components/site/site-header.test.tsx --runInBand && npm run typecheck`

Expected: PASS and exit `0`.

- [ ] **Step 5: Commit the header**

```bash
git add components/site/site-header.tsx components/site/site-header.test.tsx
git commit -m "Refine Ecosystem Header"
```

## Task 4: Stabilize the documentation shell and navigation

**Files:**
- Modify: `app/docs/layout.tsx`
- Modify: `components/site/docs-sidebar-nav.tsx`
- Create: `components/site/docs-sidebar-nav.test.tsx`

- [ ] **Step 1: Write failing sidebar behavior tests**

Render with pathname `/docs/components/bar-chart`. Assert that the search input has the accessible name `Search documentation`, filtering for `heatmap` hides `Bar Chart` and shows `Heatmap`, the active Bar Chart link has `aria-current="page"`, and section disclosure buttons expose `aria-expanded`.

- [ ] **Step 2: Run the tests and confirm ARIA failures**

Run: `npm test -- components/site/docs-sidebar-nav.test.tsx --runInBand`

Expected: FAIL because the existing input has no label, active links lack `aria-current`, and disclosure state is not exposed.

- [ ] **Step 3: Refine the docs grid**

In `app/docs/layout.tsx`, use `md:grid-cols-[220px_minmax(0,1fr)]` and `xl:grid-cols-[240px_minmax(0,760px)_220px]`. Keep the reading column capped at `760px`, use one-pixel borders between regions, and give sidebars `bg-sidebar`. Keep the mobile TOC affordance and ensure the main element has `min-w-0`.

- [ ] **Step 4: Make sidebar behavior explicit and compact**

Add a visually hidden `<label htmlFor="docs-search">Search documentation</label>`, set `id="docs-search"` and `type="search"`, expose `aria-expanded` and `aria-controls` on section buttons, add stable child IDs, and set `aria-current="page"` on the active link. Replace height animation with a grid-row or opacity/transform transition so layout height is not animated directly. Use 32px visual rows with expanded touch targets on coarse pointers.

- [ ] **Step 5: Run focused verification**

Run: `npm test -- components/site/docs-sidebar-nav.test.tsx --runInBand && npm run typecheck`

Expected: PASS and exit `0`.

- [ ] **Step 6: Commit the docs shell**

```bash
git add app/docs/layout.tsx components/site/docs-sidebar-nav.tsx components/site/docs-sidebar-nav.test.tsx
git commit -m "Refine Documentation Shell"
```

## Task 5: Prove the system on the documentation introduction

**Files:**
- Modify: `app/docs/docs-content.tsx`
- Create: `app/docs/docs-content.test.tsx`
- Modify: `components/ui/code-block.tsx`

- [ ] **Step 1: Write failing introduction tests**

Create `app/docs/docs-content.test.tsx`. Mock `AnimatedFAQ` and render `DocsContent`. Assert one `h1` named `Mario Charts`, an `h2` named `Start in one minute`, the command `npx mario-charts@latest init`, links named `Browse charts` and `Read installation guide`, and no visible phrase `not just a chart library`.

- [ ] **Step 2: Run the test and verify the content failures**

Run: `npm test -- app/docs/docs-content.test.tsx --runInBand`

Expected: FAIL against the current introduction structure and copy.

- [ ] **Step 3: Rewrite the introduction around developer workflow**

Use this content hierarchy:

```tsx
<p className="text-sm font-medium text-muted-foreground">Overview</p>
<h1>Mario Charts</h1>
<p>
  Copy production-ready chart components into your React application.
  You own every line.
</p>
<section aria-labelledby="quickstart-title">
  <h2 id="quickstart-title">Start in one minute</h2>
  <CommandSnippet command="npx mario-charts@latest init" />
</section>
```

Follow with three unframed principle rows: `Own the source`, `Start with strong defaults`, and `Customize without an abstraction ceiling`. Use dividers between rows instead of icon cards. End with text links `Browse charts` and `Read installation guide`. Keep FAQ below the primary onboarding flow.

- [ ] **Step 4: Make CodeBlock copy controls persistent and theme-aware**

In `components/ui/code-block.tsx`, show the copy button at all times, set `aria-label` to `Copy code`, add a polite success live region, and select `github-light` or `github-dark` from the resolved theme. Dispose the Shiki highlighter in the effect cleanup. Keep the frame at `rounded-md border` without blur or shadow.

- [ ] **Step 5: Run focused tests and static checks**

Run: `npm test -- app/docs/docs-content.test.tsx components/ui/command-snippet.test.tsx --runInBand && npm run typecheck && npm run lint`

Expected: all commands exit `0`.

- [ ] **Step 6: Commit the representative page**

```bash
git add app/docs/docs-content.tsx app/docs/docs-content.test.tsx components/ui/code-block.tsx
git commit -m "Redesign Documentation Introduction"
```

## Task 6: Validate the vertical slice in browsers

**Files:**
- Modify only files from Tasks 1-5 if validation exposes defects.

- [ ] **Step 1: Run the complete release checks**

Run: `npm run lint && npm run typecheck && npm test -- --runInBand && npm run build`

Expected: all commands exit `0`; the build completes without route or hydration errors.

- [ ] **Step 2: Start the app**

Run: `npm run dev`

Expected: Next.js reports a local URL. Keep the session running through visual verification.

- [ ] **Step 3: Capture representative desktop states**

With `agent-browser`, open `/docs` at `1440x1000` in light mode and dark mode. Capture screenshots after network idle. Verify the 240px navigation, reading column no wider than 760px, visible right TOC, stable 56px header, persistent command copy control, and absence of blur, gradient text, or nested cards.

- [ ] **Step 4: Capture representative mobile states**

Set the browser to an iPhone 14 viewport and open `/docs`. Verify no horizontal overflow, 44px touch targets, accessible mobile navigation, visible quickstart command, and legible command wrapping or horizontal scrolling inside its own region.

- [ ] **Step 5: Verify keyboard, zoom, and reduced motion**

Navigate the header, docs search, sidebar, quickstart copy action, content links, and FAQ using only Tab, Shift+Tab, Enter, Space, and Escape. Repeat at 200% browser zoom. Emulate reduced motion and confirm no decorative entrance animation runs and no content disappears.

- [ ] **Step 6: Fix defects and rerun the relevant check**

For each defect, add or tighten a Jest assertion where practical, make the smallest implementation correction, and rerun the focused test plus `npm run typecheck`. Do not broaden this task into home or dashboard redesign work.

- [ ] **Step 7: Commit validation fixes**

```bash
git add app/globals.css app/docs components/site components/ui lib DESIGN.md
git commit -m "Polish Design Foundations Slice"
```

## Follow-on Plans

After this slice is approved visually, write and execute separate plans in this order:

1. Home hero and code-to-preview workflow.
2. Component discovery index and representative chart detail template.
3. Sales dashboard connected-grid example.
4. Remaining documentation and dashboard migration.

Each follow-on plan must reuse the foundations and shared components proven here rather than redefining tokens or navigation.
