# Bar Chart Controls and States Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the awkward inline playground controls and repeated state previews with a developer-tool property panel and concise resilient-state documentation.

**Architecture:** Keep state and rendering inside `BarChartContent`; no new public component API is needed. Use native selects and checkbox semantics in a responsive two-column playground, then render static state documentation from a local typed array.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide icons, Jest, Testing Library.

---

### Task 1: Lock the New Documentation Contract

**Files:**
- Modify: `app/docs/components/bar-chart/bar-chart-content.test.tsx`

- [ ] **Step 1: Update the heading and state assertions**

Replace the `Production states` assertion with:

```tsx
expect(screen.getByRole("heading", { level: 2, name: "Resilient by default" })).toBeInTheDocument();
expect(screen.getByText("Loading")).toBeInTheDocument();
expect(screen.getByText("Error")).toBeInTheDocument();
expect(screen.getByText("Empty")).toBeInTheDocument();
expect(screen.getByText("loading={true}")).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm test -- app/docs/components/bar-chart/bar-chart-content.test.tsx --runInBand`

Expected: FAIL because `Resilient by default` and the prop reference are not rendered yet.

### Task 2: Build the Property Panel and State Documentation

**Files:**
- Modify: `app/docs/components/bar-chart/bar-chart-content.tsx`
- Test: `app/docs/components/bar-chart/bar-chart-content.test.tsx`

- [ ] **Step 1: Add state metadata**

Define a local array with `Loading`, `Error`, and `Empty`, including their public prop snippets and descriptions. Use Lucide `LoaderCircle`, `TriangleAlert`, and `Database` icons when rendering.

- [ ] **Step 2: Replace the inline toolbar**

Use `md:grid-cols-[190px_minmax(0,1fr)]`. The first column contains a `Settings` heading, full-width native selects labeled `Orientation` and `Appearance`, supporting copy, the animation checkbox, and replay icon button. The second column contains the existing stable-height chart.

- [ ] **Step 3: Replace full chart state previews**

Render one bordered list with three rows from the metadata array. Each row contains an icon, state title, description, and a monospace public-prop snippet. Do not mount three more chart instances.

- [ ] **Step 4: Run focused verification**

Run:

```bash
npm test -- app/docs/components/bar-chart/bar-chart-content.test.tsx --runInBand
npm run typecheck
npx eslint app/docs/components/bar-chart/bar-chart-content.tsx app/docs/components/bar-chart/bar-chart-content.test.tsx
```

Expected: all commands pass.

### Task 3: Verify and Publish

**Files:**
- Verify: `app/docs/components/bar-chart/bar-chart-content.tsx`

- [ ] **Step 1: Verify the live route**

Request `http://localhost:3001/docs/components/bar-chart` and confirm HTTP 200 plus the `Resilient by default` heading.

- [ ] **Step 2: Run the full regression suite**

Run: `npm test -- --runInBand`

Expected: 28 suites and 279 or more tests pass; existing Framer Motion mock warnings may remain.

- [ ] **Step 3: Commit and push**

```bash
git add app/docs/components/bar-chart/bar-chart-content.tsx app/docs/components/bar-chart/bar-chart-content.test.tsx docs/superpowers/plans/2026-07-12-bar-chart-controls-and-states.md
git commit -m "Refine Bar Chart Controls and States"
git push
```
