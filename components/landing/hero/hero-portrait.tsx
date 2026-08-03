import { cn } from "@/lib/utils";

import { HERO_ASCII_COLUMNS, HERO_ASCII_DARK, HERO_ASCII_LIGHT } from "./hero-ascii";
import { HeroPortraitEffect } from "./hero-portrait-effect";
import { TextField } from "./text-field";

/**
 * The portrait resolves last, so its rows carry the slowest stagger of the
 * three regions. Both variants use the same value: they are the same grid, and
 * a visitor switching theme mid-entrance must not see the wave restart.
 */
const ROW_DELAY_MS = 9;

interface HeroPortraitProps {
  className?: string;
}

const PORTRAIT_STYLE = {
  fontSize: `min(0.9vh, calc(var(--portrait-w) / ${HERO_ASCII_COLUMNS} / 0.6), calc(540px / ${HERO_ASCII_COLUMNS} / 0.6))`,
};

/**
 * The portrait is server-rendered text, so it is on screen before any
 * JavaScript runs. Sizing takes the smallest of three terms:
 *
 * - a viewport-height term, so the field reads as a substantial block
 *   rather than floating small in a corner;
 * - a `--portrait-w` term, a custom property set by className below (not a
 *   width utility — see the note on the wrapper) so it can vary per
 *   breakpoint: hero-section.tsx gives the portrait its own full-width row
 *   under `sm`, and a right-hand column at `sm` and up, and this term tracks
 *   whichever share of the viewport that column actually gets, so the
 *   field never grows wider than the space the layout reserved for it;
 * - a fixed-pixel term, because `hero-section`'s container caps out at
 *   `max-w-7xl`: past that width `vw` terms keep growing while the column's
 *   actual pixel width does not, so without this the field would eventually
 *   outgrow its column on very wide screens.
 *
 * Whichever term is smallest wins, so this can only ever shrink the field,
 * never add a lower bound that could force it wider than the viewport.
 */
export function HeroPortrait({ className }: HeroPortraitProps) {
  return (
    // w-fit shrinks the wrapper to the pre's intrinsic (max-content) width
    // instead of stretching to fill the row: the canvas is absolutely
    // positioned inset-0 inside it, so this is what keeps the canvas grid
    // exactly aligned to the rendered text grid rather than to whatever
    // width the surrounding layout happens to hand the wrapper. The
    // `[--portrait-w:...]` classes only declare a custom property consumed
    // by the inline fontSize below — they don't set an actual width, so
    // they don't fight w-fit the way a width utility would.
    <div
      className={cn(
        "relative w-fit [--portrait-w:78vw] sm:[--portrait-w:38vw]",
        className,
      )}
    >
      {/*
        Two variants, same grid, opposite ramp direction (see
        scripts/ascii-portrait.ts) — one reads correctly on a dark page, the
        other on a light one. Both stay mounted always; which one a sighted
        visitor sees is a pure CSS switch keyed off the `dark` class next-
        themes puts on <html>, so the correct portrait is there on first
        paint with no client JS and no hydration risk. `[.dark_&]` targets
        that class directly rather than Tailwind's `dark:` shorthand, which
        in this project's Tailwind config defaults to a `prefers-color-
        scheme` media query — that would desync from the actual theme
        whenever a visitor's OS preference disagrees with their chosen
        theme, since next-themes here is class-only (`enableSystem={false}`).
        Visibility is done with a transparent text colour, not `hidden`:
        a `display:none` variant would drop out of the accessibility tree
        entirely, and whichever of the two is currently labelled would then
        have no visible copy to attach that label to.
      */}
      <TextField
        text={HERO_ASCII_DARK}
        label="Mario, rendered in ASCII"
        style={PORTRAIT_STYLE}
        rowDelayMs={ROW_DELAY_MS}
        className="text-transparent [.dark_&]:text-foreground"
      />
      <TextField
        text={HERO_ASCII_LIGHT}
        style={PORTRAIT_STYLE}
        rowDelayMs={ROW_DELAY_MS}
        className="absolute inset-0 text-foreground [.dark_&]:text-transparent"
      />
      <HeroPortraitEffect
        textDark={HERO_ASCII_DARK}
        textLight={HERO_ASCII_LIGHT}
        columns={HERO_ASCII_COLUMNS}
      />
    </div>
  );
}
