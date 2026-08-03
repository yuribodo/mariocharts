# Sales Dashboard Connected Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Sales dashboard as a connected, question-driven analytical workspace that establishes reusable dashboard primitives for later examples.

**Architecture:** Extract the duplicated metric, section, and chart-panel surfaces into `components/dashboard/dashboard-primitives.tsx`. Keep chart configuration and sales-specific data in the Sales route, but replace floating cards, shadows, manual SVG icons, and raw palette hex values with connected grids, Lucide icons, and chart tokens.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Lucide React, Mario Charts components, Jest, Testing Library.

---

### Task 1: Lock the Dashboard Structure

**Files:**
- Create: `app/examples/dashboards/sales/sales-dashboard-content.test.tsx`
- Modify: `app/examples/dashboards/sales/sales-dashboard-content.tsx`

- [ ] Mock chart components and render `SalesDashboardContent`.
- [ ] Assert the `Sales & Revenue` heading, four metrics, and analytical section headings.
- [ ] Assert one `Executive metrics` group and connected panel groups for target, revenue sources, and team performance.
- [ ] Assert the dashboard does not render `shadow-sm` or `rounded-xl` surfaces.
- [ ] Run the focused test and confirm it fails against the current card implementation.

### Task 2: Build Shared Dashboard Primitives

**Files:**
- Create: `components/dashboard/dashboard-primitives.tsx`
- Create: `components/dashboard/dashboard-primitives.test.tsx`

- [ ] Implement `DashboardSection` with a restrained heading and description.
- [ ] Implement `MetricCell` with Lucide icon, tabular value, semantic change text, previous value, and context.
- [ ] Implement `DashboardPanel` with question-driven header, optional insight, stable content region, and no shadow.
- [ ] Keep radii at `rounded-md`, use dividers for grouping, and accept `className` through `cn`.
- [ ] Test headings, metric semantics, and class merging.

### Task 3: Migrate Sales to Connected Grids

**Files:**
- Modify: `app/examples/dashboards/sales/sales-dashboard-content.tsx`
- Modify: `app/examples/dashboards/sales/data.ts`

- [ ] Replace manual SVG icons with Lucide `DollarSign`, `ShoppingCart`, `ReceiptText`, and `Percent`.
- [ ] Render KPIs in one bordered grid with internal dividers and no gaps.
- [ ] Render Target Tracking in one connected `2/3 + 1/3` grid.
- [ ] Render Revenue Sources in one connected `3/5 + 2/5` grid.
- [ ] Keep Team Performance as one framed analytical panel.
- [ ] Replace chart color hex values with `var(--chart-*)` tokens, including gauge zones and segment bars.
- [ ] Keep chart heights stable and preserve all existing data and analytical insights.
- [ ] Adapt mobile by converting connected horizontal dividers into vertical row dividers.

### Task 4: Verify and Publish

**Files:**
- Verify: `components/dashboard/dashboard-primitives.tsx`
- Verify: `app/examples/dashboards/sales/sales-dashboard-content.tsx`

- [ ] Run focused Jest, TypeScript, scoped ESLint, and `git diff --check`.
- [ ] Capture desktop `1440x1000` and mobile `390x844` screenshots after charts render.
- [ ] Confirm no overflow, blank chart surfaces, nested cards, shadows, or detached panels.
- [ ] Run the complete Jest suite.
- [ ] Commit as `Redesign Sales Dashboard Grid` and push the feature branch.
