# Landing Hero ASCII Portrait Design

## Goal

Replace the split-grid hero with a single full-bleed ASCII portrait carrying a
type-driven headline, and retire the morphing chart.

## Problem

The hero has two focal points competing for the same two seconds: a copy column
on the left and a `MorphingChart` in a bordered card on the right. Neither wins.

Three further defects sit in it today:

- The headline reads "**Beautiful** data. Readable code." Issue #60 requires
  "beautiful", "modern" and "customizable" to be replaced by a demonstration or
  a concrete statement. Every other landing section now complies; the hero was
  declared out of scope by the design-system unification plan and escaped.
- `MorphingChart` is the last remaining source of a hydration mismatch. It draws
  through `lib/chart-paths.ts`, whose arc maths differs between server and
  client at the fourteenth decimal. The showcase was the other source and is
  gone.
- The chart index built directly below the hero already proves the product with
  six real components. The morphing chart is a second, weaker proof of the same
  claim.

## Scope

In: `components/landing/hero/*`, the portrait asset and its conversion script,
and the one-line heading change in the chart index.

Out: every other landing section. The craft layer in
`2026-07-28-landing-craft-redesign-design.md` still lands on top afterwards and
is not folded in here.

## Composition

One `100svh` section, no grid split.

The ASCII portrait is a full-bleed field of monospaced text sized in `ch` and
`vw` so it rescales without reflow. The subject occupies the right third of the
field; the left two thirds are empty. The headline and the install command sit
in that empty field.

The type sits on emptiness, not on top of the portrait. This is what makes the
composition legal under the design system: no overlay, no `backdrop-blur`, no
text shadow, no scrim — all four are forbidden, and none is needed.

```
                                        .::::::::::::::::::::::::::::
                                        ......:----=====++++++::---**
                                         ...:---===+++++++++=  +%%..*
    EVERY CHART HERE                    +-    :--==+**#######*-. .-#@
    IS YOURS.                           ==-   :-=++*#########%%**##**
                                        =---::--=+**=.-*******=-+++**
    npx mario-charts@latest init   [⧉]  :--:::-==+=.    .::----=+++**
                                         ...::---=-          .-==++++
```

Headline: `EVERY CHART HERE / IS YOURS.` Below it, the `CommandSnippet` already
built in Phase 1 — nothing else.

**Both hero buttons go.** "Get Started" and "Browse Charts" dilute a type-driven
hero, and both destinations are already reachable from the site header and from
the chart index one screen below.

**Knock-on:** the chart index heading currently reads "Every chart below is the
component you install." That repeats the new headline two hundred pixels later.
It becomes "These are the components you install."

## The asset

Source: `public/hero-portrait.jpg`, chosen by the project owner.

The pipeline is deliberately image-agnostic — it reads whatever sits at that
path — so the portrait can be swapped without touching a line of component code.

The current source is 474×568 with a full luminance range. Resolution is not a
constraint — the conversion samples to roughly 120 columns regardless.

Two properties of the source do need work, and both happen inside the conversion
script so the committed art is reproducible from the original file:

1. **Recompose.** The source is a tight centred crop with no negative space. It
   is pasted onto a 16:9 matte-black canvas, anchored right, which creates the
   empty left field the type needs.
2. **Dissolve the source background.** The original's blurred brown backdrop
   converts to a mid-tone field with a visible rectangular seam at the pasted
   image's edge. It is darkened toward black before conversion so it fades into
   the canvas rather than drawing a box.

## Technique

**Conversion is offline.** `scripts/ascii-portrait.ts` reads
`public/hero-portrait.jpg`, recomposes it, maps luminance onto a ramp, and
writes `components/landing/hero/hero-ascii.ts` exporting the portrait as a
string constant. The output is committed.

This buys three things a runtime canvas cannot: the portrait is in the
server-rendered HTML and appears before any JavaScript, the result is
deterministic, and any change to it shows up as a reviewable diff.

**The effect layer is optional and additive.** A `<canvas>` positioned over the
text field redraws only the neighbourhood of the cursor, swapping glyphs for
denser ones within a short radius. It mounts only behind `(hover: hover)` and
only when `prefers-reduced-motion` is not set.

When it does not mount — no JavaScript, coarse pointer, reduced motion — the
rendered tree is **the same tree**, minus the canvas. This is the rule the rest
of the landing was just brought onto, and the regression the old showcase
committed by rendering a different tree under reduced motion.

## Components

- `hero-ascii.ts` — generated. Exports `HERO_ASCII: string` and the column count
  it was generated at. No logic.
- `hero-portrait.tsx` — renders the `<pre>`. Owns sizing and the accessible
  name. Knows nothing about the effect.
- `hero-portrait-effect.tsx` — the canvas layer. Mounts itself or does not.
  Takes the same text and the same grid metrics as props.
- `hero-section.tsx` — composition and copy only.

`morphing-chart.tsx`, `hooks/use-morphing-chart.ts` and `lib/chart-paths.ts` are
deleted, along with the hydration mismatch they carry. Roughly a thousand lines.

## Accessibility

The portrait is a `<pre role="img">` labelled `Mario, rendered in ASCII` — one
short description instead of four thousand characters read aloud. The label
describes the picture and makes no product claim; the headline beside it is
already real text. The `<pre>` itself is
never focusable, and the canvas layer is `aria-hidden` and `inert` — the chart
index just proved how easily decoration leaks into the tab order.

Contrast is checked against the text that sits over the empty field, not against
the portrait, because no glyph is drawn there.

## Testing

Colocated `*.test.tsx`, matching the rest of the landing.

- The headline renders and contains no adjective claim.
- The portrait renders from the committed constant, with an `aria-label` and no
  focusable descendants.
- The effect layer does not mount when `prefers-reduced-motion` is set, and the
  portrait renders identically with and without it.
- `scripts/ascii-portrait.ts` is deterministic: the same input produces the
  committed output. This is what stops the art drifting silently.

## Verification

Beyond the release gates, three checks in a real browser, because this slice
taught us that jsdom does not model layout, tab order or SSR attribute
behaviour:

- The portrait is present in the server-rendered HTML before hydration.
- The section adds no focusable stops to the tab order.
- The effect layer is absent under reduced motion and the DOM structure matches
  the motion-enabled render.

## Deferred

Not part of this design, recorded so they are not lost:

- The treemap preview in the chart index reads as a stacked bar at 327×160.
- `TreeMapChart` cannot accept `var(--chart-*)` colours; it appends a hex alpha
  suffix and produces invalid CSS.
- Charts set `tabIndex={0}` on every mark unconditionally, whether or not a
  click handler was supplied.
- The 390×844 viewport check on the previous slice was never run.
