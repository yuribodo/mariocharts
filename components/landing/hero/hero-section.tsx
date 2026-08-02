"use client";

import { cn } from "@/lib/utils";
import { CommandSnippet } from "@/components/ui/command-snippet";

import { HeroPortrait } from "./hero-portrait";

interface HeroSectionProps {
  className?: string;
}

const CLI_COMMAND = "npx mario-charts@latest init";

/**
 * The portrait and the copy are ordinary grid siblings, not layers stacked
 * with absolute positioning — that's what makes "the two never overlap"
 * true by construction rather than by careful measurement. The copy comes
 * first in the DOM, so it's read first, and is capped to a comfortable
 * max-width; the portrait takes the other column and clips its own
 * overflow, so even at an extreme viewport it crops within its own box
 * instead of spilling onto the copy. Below `sm` the two stack instead of
 * sitting side by side — there isn't room for a legible portrait and
 * readable copy side by side at phone widths — with the portrait given its
 * own full-width row rather than being squeezed into a half column.
 * HeroPortrait's `--portrait-w` custom property (see hero-portrait.tsx)
 * tracks this same breakpoint split so the field's own sizing always
 * matches the column the layout actually gave it. Text sits directly on the
 * page background with no scrim, which is only safe because the two never
 * share the same space.
 */
export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className={cn(
        "relative w-full overflow-hidden border-b",
        className,
      )}
    >
      <div className="mx-auto grid min-h-[calc(100svh-7rem)] w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 py-12 sm:grid-cols-2 sm:gap-6 lg:gap-12">
        <div className="flex flex-col items-start">
          <h1
            id="hero-title"
            className="font-mono text-3xl font-semibold uppercase leading-[1.05] tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Every chart here
            <br />
            is yours.
          </h1>

          <div className="mt-8 w-full max-w-md">
            <CommandSnippet command={CLI_COMMAND} />
          </div>
        </div>

        <div className="flex items-center justify-center overflow-hidden sm:justify-end">
          <HeroPortrait />
        </div>
      </div>
    </section>
  );
}
