# Landing Hero Text Grid Design

Supersedes the composition and entrance sections of
`2026-08-02-landing-hero-ascii-portrait-design.md`. The conversion pipeline,
the two theme variants, the cursor effect and the accessibility rules from that
document all still stand and are not restated here.

## Goal

Turn the hero from "a portrait with type beside it" into a single monospaced
character grid that writes itself on load, with the portrait as one region of
that grid rather than its subject.

## Problem

The portrait hero shipped and the owner rejected it on sight: it reads empty.
The diagnosis holds up. The left half is a headline and a command floating in a
void, the right half is the portrait, and nothing connects them. The portrait is
also carrying more weight than a mascot should — it is the only thing in the
hero with visual mass, so it reads as the subject of the page rather than as a
signature on it.

There is a second, larger miss. This is a chart library whose hero contains no
data. The product is proved two hundred pixels lower, in the chart index, and
not at all above the fold.

## References and what is taken from each

**`ertdfgcvb.xyz` — the uniqueness.** The entire page is one monospace grid:
navigation, prose, columns and animated art share the same cells. The art is not
placed on the page; the page *is* the grid. Taken: the single-grid composition,
which removes the concept of empty space — there is no void between elements
because every cell belongs to the same field.

**`linear.app` — the premium.** Taken, mechanically rather than atmospherically:
near-black rather than pure black, tight tracking with a short type hierarchy,
1px borders and no decorative shadows, mass below the fold pulling the eye, and
above all a **slow staggered entrance with confident easing** — everything rises
a few pixels and settles, nothing bounces or overshoots.

**The crossing of the two, which is the idea.** The entrance is neither a fade
nor a slide: the grid *writes itself*, resolving from sparse noise into the
final characters in waves, over roughly one second. The headline resolves first,
the chart second, the portrait last. It reads as a terminal painting itself,
paced like Linear rather than like a typewriter gimmick.

## The decision that keeps this shippable

"Everything lives in one grid" is a **visual conceit, not a rendering
strategy.** The headline stays a real `<h1>` and the install command stays the
real `CommandSnippet` with its real button and its live region. They are aligned
to the same character metrics as the ASCII field so they read as part of the
grid, but they remain ordinary DOM text.

Painting the copy as characters inside the field — or worse, into a canvas —
would destroy the accessible name, the copy button, text selection and the page
for search engines, in exchange for an effect nobody can tell apart from
alignment. The grid is achieved by sharing a font, a cell size and a baseline,
not by giving up real elements.

## Composition

One `100svh` section, one grid, four regions sharing cell metrics:

- an eyebrow line of small monospaced labels along the top, which is what makes
  the grid read as a grid rather than as centred content
- the `<h1>`, resolving first
- an ASCII chart field, drawn from real data
- the portrait, occupying a region at the right, no longer the subject

Below the fold, per the Linear reference, the chart index already supplies the
mass that stops the hero reading as thin. No change needed there beyond the
heading line already planned.

## The ASCII chart

A second generator, sibling to the portrait's: it takes a small dataset and
emits a chart drawn in characters at a fixed column count, using the same ramp
vocabulary as the portrait so the two regions look like one field.

It alternates form — area, then bars, then line — on a slow cycle, which is
what makes the hero prove the product: a chart library whose hero is a chart.
The cycle is motion and therefore stops entirely under reduced motion, resting
on the first form.

Data is a committed constant, not live. Nothing about this hero should depend on
a network call, and a chart that changes between server and client render is a
hydration mismatch by construction — the failure this project has already spent
two rounds removing.

## Entrance

Driven by CSS, not by a JavaScript animation loop. Each cell of the ASCII field
carries a small delay derived from its position, so the field resolves in waves;
the headline and command ride the same easing on a shorter delay.

- Duration around one second end to end, with `cubic-bezier(0.16, 1, 0.3, 1)`.
- Nothing translates more than a few pixels. Nothing scales past 1. Nothing
  overshoots.
- Under `prefers-reduced-motion: reduce` the grid renders in its final state
  immediately — same tree, same characters, no resolution animation. This is the
  rule already applied across the rest of the landing.
- The entrance runs once. It does not replay on scroll.

## What survives unchanged

The conversion pipeline and its committed output, the light and dark variants
and their CSS toggle, the cursor effect layer and its gating, the `<pre
role="img">` accessible name, and the grid layout that made copy/portrait
overlap structurally impossible.

## Testing

- The headline is a real heading and the command is a real button with a live
  region — asserted, because the whole design depends on them not becoming art.
- The ASCII chart generator is deterministic and its committed output matches
  its source data, mirroring the portrait generator's guards.
- Under reduced motion the entrance is absent and the final characters are
  present from the first render.
- The hero adds no focusable elements beyond the copy button.

## Verification in a browser

jsdom models none of this. A human confirms: the grid resolves once and settles,
the type is legible against the field at every width, nothing overlaps from
320px up, and the entrance does not run under reduced motion.

## Carried over, still not done

Task 5 of the previous plan — deleting `morphing-chart.tsx`,
`hooks/use-morphing-chart.ts` and `lib/chart-paths.ts`, and with them the last
hydration mismatch on the page — is unaffected by this redesign and still
pending. So is the final verification and push. Ten commits sit unpushed.
