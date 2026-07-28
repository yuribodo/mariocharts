# Landing Code Workbench Design

## Goal

Rebuild the landing code-to-preview workbench so the code shown produces the
chart shown. This is Phase 2 of the premium ecosystem redesign (#60): the hero
and command snippet already ship, and the workbench is the remaining surface.

## Problem

The current section claims `import { AreaChart } from "mario-charts"` while the
adjacent preview is a bespoke SVG built from `lib/chart-paths.ts`. Its six
toggles drive props that exist only in that SVG. The section contradicts the
first experience principle of #60 — demonstrate the product with working charts
and real controls before making claims about it.

The surface also predates the design system: `rounded-xl` cards separated by a
`gap-12`, a props drawer that covers the code behind `backdrop-blur`, macOS
traffic lights, confetti on copy, raw `bg-red-500/40` and `text-green-600`
literals, and a `text-5xl font-bold` heading with a colored word.

## Scope

In scope: `components/landing/code-demo/*`.

Out of scope: `components/landing/showcase/*`. The component visual index is
item 3 of the landing sequence and belongs to Phase 5.

`lib/chart-paths.ts` stays. The hero's `morphing-chart` and the showcase still
depend on it; only the workbench drops its use.

## Component Architecture

Replace the four current files with three:

- `code-demo-section.tsx` — composition, section heading, and the single source
  of workbench state.
- `workbench-code.tsx` — generated source plus controls. Delegates syntax
  rendering to `CodeBlock`.
- `workbench-preview.tsx` — renders a real `BarChart`.

Delete `demo-card.tsx`. The connected frame replaces the shared card wrapper.

Replace `types.ts`'s `DEMO_CONFIG` with types derived from the real `BarChart`
props.

Two shared extractions:

- Move `SegmentedControl` out of `app/docs/components/bar-chart/bar-chart-content.tsx`
  into `components/ui/segmented-control.tsx`. Both surfaces consume it. Without
  this the control would be duplicated.
- Add an optional `highlightedLines?: readonly number[]` prop to
  `components/ui/code-block.tsx`. Additive; documentation behavior is unchanged
  when the prop is absent.

## Composition

One frame, `rounded-md`, no shadow, divided by one-pixel dividers with no gap
between regions.

Desktop (`lg` and up), two columns:

- Left: generated source above, controls below, separated by a divider.
- Right: the live `BarChart`.

The controls sit beside the code rather than over it. The current drawer hides
the source while the user changes it, which defeats the connection the section
exists to show.

## Chart and Controls

Render `BarChart` with the prop set Phase 3 already validated on the Bar Chart
documentation page:

- `orientation` — vertical or horizontal
- `variant` — filled or outline
- `animation` — on or off, with replay

Every control maps to a real public prop. No invented props.

## Code and Preview Connection

Generate the displayed source from workbench state so a control moves the code
and the chart together. The documentation playground keeps `exampleCode` as a
static string; the landing workbench must not, because the connection is the
story the section tells.

When a control changes, tint the corresponding source line for roughly 200ms
with an exponential ease-out curve. This is the one optional element: #60 asks
for it "when practical", and cutting it does not invalidate the rest.

`CodeBlock` highlights asynchronously through Shiki. Retain the previously
highlighted markup until new markup resolves so rapid toggling never flashes an
empty code region.

## Copy Interaction

Adopt the `CommandSnippet` pattern: `idle`, `success`, and `error` states, a
`role="status"` region with `aria-live="polite"`, and a 44px target.

Remove the confetti burst and the green ripple. Keep `unlock("first-copy")`
running silently so the badge stays obtainable. Replace the current
`console.error` fallback with the visible error state.

## Visual Corrections

- Radii move from `rounded-xl` to `rounded-md`.
- Traffic lights, `backdrop-blur`, and decorative shadows are removed.
- Raw color literals become semantic tokens.
- Section padding drops from `py-24 lg:py-32` to `py-16 lg:py-24`, closer to the
  hero's `py-8 sm:py-12 lg:py-16`.
- The heading loses display sizing and the colored word. `DESIGN.md` reserves
  large display type for the hero.

## Section Copy

Replace "Copy. Paste. Ship." and "Get beautiful charts in seconds. No
configuration needed." with:

- Heading: `Adjust the props. The code updates with the chart.`
- Supporting line: `This is the component you install — same props, same output.`

## Responsive Behavior

Below `lg` the frame recomposes as a single column ordered chart, controls,
then code. In one column the evidence precedes the proof. Vertical dividers
become horizontal ones at the same one-pixel weight, still without gaps.

Touch targets stay at 44px and the code region scrolls horizontally rather than
forcing the page to.

## Accessibility

- Controls expose accessible names and current state.
- Focus remains visible in both themes.
- Reduced motion removes the line tint and chart animation without removing
  content or controls.
- The chart carries an accessible name.

## Verification

- Add `code-demo-section.test.tsx` asserting that changing a control updates
  both the generated source and the props passed to the chart.
- Assert the copy success and error states and the `aria-live` region.
- Assert the section renders no `rounded-xl`, `shadow-`, or `backdrop-blur`
  surfaces, matching the negative assertions the sales dashboard test uses.
- Add a `SegmentedControl` test at its new shared location.
- Run focused Jest, TypeScript, scoped ESLint, and the complete Jest suite.
- Capture desktop `1440x1000` and mobile `390x844` screenshots in light and dark
  after the chart renders.
