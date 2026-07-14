# Wide Documentation Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the desktop documentation shell and central interactive area without widening prose or changing tablet and mobile behavior.

**Architecture:** Keep the existing three-region grid and breakpoint behavior. Let the grid span the viewport so its fixed sidebars touch the outer edges while the `960px` content wrapper remains centered.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Jest, Testing Library.

---

### Task 1: Test the Expanded Shell

**Files:**
- Create: `app/docs/layout.test.tsx`
- Modify: `app/docs/layout.tsx`

- [ ] **Step 1: Write the failing structural test**

Mock the sidebar components, render `DocsLayout`, and assert the shell does not include an extra-large max-width, while the main wrapper includes `max-w-[960px]` and the main element includes `xl:px-10`.

- [ ] **Step 2: Verify the test fails**

Run: `npm test -- app/docs/layout.test.tsx --runInBand`

Expected: FAIL because the current shell still includes `xl:max-w-[1600px]`.

- [ ] **Step 3: Update the layout classes**

In `app/docs/layout.tsx`, remove `xl:max-w-[1600px]`. Preserve the `960px` inner content width, fixed sidebar tracks, padding, and responsive visibility.

- [ ] **Step 4: Run focused checks**

Run focused Jest, TypeScript, and scoped ESLint. Expected: all pass.

### Task 2: Verify and Publish

**Files:**
- Verify: `app/docs/layout.tsx`

- [ ] **Step 1: Request the Bar Chart route**

Request `http://localhost:3001/docs/components/bar-chart`. Expected: HTTP 200.

- [ ] **Step 2: Run the complete Jest suite**

Run: `npm test -- --runInBand`. Expected: 29 suites and 280 or more tests pass; existing Framer Motion mock warnings may remain.

- [ ] **Step 3: Commit and push**

Commit the layout, test, and plan as `Expand Documentation Content Area`, then push the feature branch.
