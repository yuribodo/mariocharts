# Docs Sidebar and Code Contrast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make documentation sidebar backgrounds cover long pages and keep code blocks clearly readable in both themes.

**Architecture:** Separate each sidebar's full-height background wrapper from its sticky scrolling child. Track highlighted code together with the Shiki theme that produced it so code tokens and surfaces always change atomically.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, next-themes, Shiki, Jest, Testing Library.

---

### Task 1: Full-Height Sidebar Columns

**Files:**
- Modify: `app/docs/layout.tsx`
- Test: `app/docs/layout.test.tsx`

- [ ] Add assertions that each outer `aside` owns `bg-sidebar` and `self-stretch` but not `sticky`.
- [ ] Add assertions that the first child of each sidebar owns `sticky`, `top-14`, and viewport height.
- [ ] Run the focused test and confirm it fails against the current layout.
- [ ] Move sticky positioning and scroll behavior to inner wrappers on both sidebars.
- [ ] Run the focused test and confirm it passes.

### Task 2: Adaptive Code Contrast

**Files:**
- Modify: `components/ui/code-block.tsx`
- Test: `components/ui/code-block.test.tsx`

- [ ] Mock the resolved theme per test and assert `github-light` for light plus `dracula` for dark.
- [ ] Assert explicit light header `#eef1f4`, content `#f6f8fa`, and fallback text `#24292f` classes.
- [ ] Run the focused test and confirm the new light-surface assertion fails.
- [ ] Store highlighted HTML as `{ html, theme }`, rendering it only when its theme matches the resolved theme.
- [ ] Add explicit light and dark surface classes to header, highlighted content, and fallback.
- [ ] Run focused Jest, TypeScript, and scoped ESLint.

### Task 3: Regression and Publish

**Files:**
- Verify: `app/docs/layout.tsx`
- Verify: `components/ui/code-block.tsx`

- [ ] Request `/docs/components/bar-chart` and confirm HTTP 200.
- [ ] Run `npm test -- --runInBand` and confirm all suites pass.
- [ ] Commit as `Fix Docs Sidebar and Code Contrast` and push the feature branch.
