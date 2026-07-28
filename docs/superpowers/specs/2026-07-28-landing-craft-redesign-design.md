# Landing Craft Redesign Design

## Goal

Bring the whole landing page to one visual language and raise its finish to the
level of the best library sites — input-otp, sonner, vaul. This does not replace
the direction approved in #60. It keeps those tokens, that typography, and that
anti-reference list, and lifts the execution ceiling inside them.

## Problem

The landing is half-migrated. The hero and the code workbench were rebuilt
against `DESIGN.md`; the showcase, CTA, and footer never were. They still carry
the pre-#60 vocabulary:

| File | Still violating |
|---|---|
| `showcase-section.tsx` | `py-24 lg:py-32`, `text-4xl/5xl font-bold`, `rounded-2xl`, `shadow-lg`, `height: 500vh` |
| `showcase-content.tsx` | `text-4xl/5xl/6xl font-bold`, `rounded-xl` |
| `cta-section.tsx` | `py-24 lg:py-32`, `text-4xl/5xl font-bold`, `rounded-xl` ×3, `backdrop-blur` |

The page reads as three products because three of its five sections were never
migrated. That is the first problem, and it is mechanical.

The second is craft, and it is not mechanical:

1. **The showcase takes five viewport heights of scroll to show four charts**,
   and under `prefers-reduced-motion` it abandons the effect entirely and renders
   a different static grid. Reduced-motion users see a different page.
2. **The two most important buttons on the site have no press feedback.**
   `SegmentedControl` and the workbench replay button already use
   `active:scale-[0.96]`; "Get Started" and "Browse Charts" do nothing on press.
3. **The hero's entrance animates through Framer Motion's `x`/`opacity`
   shorthand at 700ms**, which runs on `requestAnimationFrame` on the main
   thread — during first paint, when that thread is busiest. Predetermined
   entrance animation belongs in CSS, which runs off the main thread.
4. **No hover state is gated behind `@media (hover: hover)`**, so touch devices
   keep hover styles stuck after a tap.

## Scope

The landing page: hero, showcase, workbench, CTA, footer, and the shared
background.

Out of scope: docs, dashboards, and the global header. The header is shared with
those surfaces and moving it pulls the rest of the ecosystem along.

The code workbench keeps its logic — generated source, changed-line tint, real
`BarChart`. It receives the new finish only after the language is settled, with
one exception noted under Retirement below.

## Structural decision 1: the showcase becomes a visual index

Replace the 500vh sticky scroll with a preview-first index of live charts,
scannable in one view. This is what #60 already asks for as item 3 of the
landing sequence — a "preview-first visual index" for component discovery.

- Every preview renders a real chart at stable dimensions, so hover, labels, and
  loading states never shift the layout.
- The grid behaves identically with and without reduced motion. No separate
  fallback tree.
- Entrance uses a short stagger (30–80ms between items) that never blocks
  interaction.
- Four viewport heights of scroll return to the reader.

## Structural decision 2: the easter eggs are retired

Party mode, the Konami handler, and the badge system are removed. #60 asks for
easter eggs to sit outside conversion flows, and today they sit inside the CTA.
Rather than relocate them, they go.

This reverses a decision made earlier in the workbench slice, where the copy
button kept `unlock("first-copy")` running silently. That call goes too.

Removal covers:

- `components/landing/easter-eggs/` (provider, party mode, barrel)
- `components/landing/cta/badge-display.tsx`
- `hooks/use-badges.ts` and its re-export in `hooks/index.ts`
- `lib/badges.ts`
- `confettiConfig` in `lib/animations.ts` — party mode was its last consumer
- `canvas-confetti` in `package.json`
- the `EasterEggsProvider` wrapper in `app/landing-content.tsx`
- the re-export in `components/landing/index.ts`
- `onCopy={() => unlock("first-copy")}` in `workbench-code.tsx`, and the badge
  assertions in `workbench-code.test.tsx` and `code-demo-section.test.tsx`

`app/docs/components/funnel-chart/funnel-chart-content.tsx` matches a grep for
"badges" only in prose about conversion-rate labels. It is unrelated and must
not be touched.

**Open decision for the plan:** removing the last `unlock` call leaves
`CodeBlock`'s `onCopy` prop with no consumer. Either drop the prop (YAGNI) or
keep it as a deliberate extension point. The plan must pick one explicitly
rather than leaving an unused public prop by accident.

## Craft layer

These apply across every section, not to one component.

### Press feedback

Every pressable element gets `active:scale-[0.97]` with a 100–160ms ease-out
transition. Buttons must feel like the interface heard the press. The segmented
control and replay button already do this; the hero CTAs, the CTA section, and
the footer links do not.

### Entrance animation moves to CSS

Predetermined entrance animation — the hero, the index stagger — uses CSS
transitions or `@starting-style`, not Framer Motion's `x`/`y` shorthand. CSS
animation runs off the main thread and holds its frame rate while the page is
still loading. Framer Motion stays for interruptible, state-driven motion.

### Easing

Use the project's `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` explicitly.
Never `ease-in` on UI: it delays the first movement, which is the moment the
user is watching. Never `transition: all` — name the properties.

### Motion budget

| Element | Duration |
|---|---|
| Press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, segmented controls | 150–250ms |
| Section entrance, marketing | may exceed 300ms |

UI feedback stays under 300ms. Marketing and explanatory motion may run longer
because it is seen once.

### Hover gating

Every hover state sits behind `@media (hover: hover) and (pointer: fine)` so a
tap on a touch device does not leave the hover style stuck.

### Never from zero

Entrances start from `scale(0.95)` with `opacity: 0`, never `scale(0)`. Nothing
in the real world appears from nothing.

## Accessibility

- WCAG 2.1 AA for text, controls, focus indicators, and meaningful graphics.
- Reduced motion removes movement and position animation while keeping opacity
  and colour transitions that aid comprehension. It must not produce a different
  page — the same tree, with motion removed.
- Complete keyboard operation with visible `:focus-visible` in both themes.
- Touch targets at least 44px, or a compact visual target inside an expanded hit
  area.
- Layout usable at 200% zoom.

## Verification

- Jest and Testing Library per section, including keyboard and ARIA assertions
  and the negative assertions that forbid `rounded-xl`, `rounded-2xl`,
  `backdrop-blur`, and `shadow-lg`.
- A test asserting the reduced-motion tree matches the standard tree in
  structure, so the showcase's old two-page problem cannot return.
- `npm run lint`, `npx tsc --noEmit`, `npx jest`, `npm run build`.
- Screenshots at `1440x1000` and `390x844`, light and dark, after charts render.
- Confirm total page scroll height drops by roughly four viewport heights.
- Confirm no console hydration warnings are introduced. One pre-existing
  floating-point hydration mismatch already exists in `morphing-chart.tsx` and
  `showcase-chart.tsx` via `lib/chart-paths.ts`; retiring the sticky showcase may
  remove one of its two sources, but fixing it is not in scope here.
