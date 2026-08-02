import { cn } from "@/lib/utils";

import { HERO_ASCII, HERO_ASCII_COLUMNS } from "./hero-ascii";
import { HeroPortraitEffect } from "./hero-portrait-effect";

interface HeroPortraitProps {
  className?: string;
}

/**
 * The portrait is server-rendered text, so it is on screen before any
 * JavaScript runs. Sizing takes the smaller of a viewport-height term and a
 * viewport-width term derived from the column count: the field scales with the
 * viewport without ever reflowing, because a monospaced grid of a fixed column
 * count has a fixed aspect.
 */
export function HeroPortrait({ className }: HeroPortraitProps) {
  return (
    <div className={cn("relative", className)}>
      <pre
        role="img"
        aria-label="Mario, rendered in ASCII"
        style={{ fontSize: `min(1.6vh, calc(96vw / ${HERO_ASCII_COLUMNS} / 0.6))` }}
        className="select-none whitespace-pre font-mono leading-[1.05] text-muted-foreground"
      >
        {HERO_ASCII}
      </pre>
      <HeroPortraitEffect text={HERO_ASCII} columns={HERO_ASCII_COLUMNS} />
    </div>
  );
}
