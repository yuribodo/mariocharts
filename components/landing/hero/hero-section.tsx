"use client";

import { cn } from "@/lib/utils";
import { CommandSnippet } from "@/components/ui/command-snippet";

import { HeroPortrait } from "./hero-portrait";

interface HeroSectionProps {
  className?: string;
}

const CLI_COMMAND = "npx mario-charts@latest init";

/**
 * The portrait is the hero. It is wrapped, not stretched: HeroPortrait's own
 * wrapper is `w-fit` so its canvas overlay stays pixel-aligned to the
 * rendered text grid (see hero-portrait.tsx), so this section positions that
 * intrinsically-sized block within the field instead of resizing it —
 * `inset-0 flex justify-end` centers it vertically and pins it to the right
 * edge, leaving the left of the field empty. The type sits in that emptiness,
 * on genuinely blank space rather than on top of drawn glyphs, which is why
 * no scrim is needed to keep it readable.
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
      <div className="relative flex min-h-[calc(100svh-7rem)] items-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-end">
          <HeroPortrait />
        </div>

        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start px-6">
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
      </div>
    </section>
  );
}
