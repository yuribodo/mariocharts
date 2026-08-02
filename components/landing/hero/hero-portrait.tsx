import { cn } from "@/lib/utils";

import { HERO_ASCII, HERO_ASCII_COLUMNS } from "./hero-ascii";
import { HeroPortraitEffect } from "./hero-portrait-effect";

interface HeroPortraitProps {
  className?: string;
}

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
      <pre
        role="img"
        aria-label="Mario, rendered in ASCII"
        style={{
          fontSize: `min(0.9vh, calc(var(--portrait-w) / ${HERO_ASCII_COLUMNS} / 0.6), calc(540px / ${HERO_ASCII_COLUMNS} / 0.6))`,
        }}
        className="select-none whitespace-pre font-mono leading-[1.05] text-foreground"
      >
        {HERO_ASCII}
      </pre>
      <HeroPortraitEffect text={HERO_ASCII} columns={HERO_ASCII_COLUMNS} />
    </div>
  );
}
