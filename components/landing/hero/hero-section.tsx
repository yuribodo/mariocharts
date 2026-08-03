"use client";

import { cn } from "@/lib/utils";
import { CommandSnippet } from "@/components/ui/command-snippet";

import { useWorldEntrance } from "../world-entrance";
import { HeroLiveField } from "./hero-live-field";
import { HeroPortrait } from "./hero-portrait";

interface HeroSectionProps {
  className?: string;
}

const CLI_COMMAND = "npx mario-charts@latest init";

/** Small labels in the grid's own voice, kept with the copy they introduce. */
const EYEBROW = ["MARIO CHARTS", "12 COMPONENTS", "MIT", "REACT + TS"] as const;

/**
 * The hero is a full-bleed character field, alive: the noise drifts, the data
 * strip flickers, and a light trails the cursor. The welcome/portal entrance
 * lives at the page shell ({@link WorldEntranceProvider}); this section only
 * settles the field, copy, and portrait when that shell hands off.
 */
export function HeroSection({ className }: HeroSectionProps) {
  const entrance = useWorldEntrance();

  return (
    <section
      aria-labelledby="hero-title"
      className={cn(
        "relative w-full overflow-hidden border-b min-h-[calc(100svh-7rem)]",
        className,
      )}
    >
      <HeroLiveField
        active={entrance.fieldActive}
        reveal={entrance.fieldReveal}
      />

      <div className="relative z-[2] flex min-h-[calc(100svh-7rem)] flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 items-end gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6 lg:gap-12">
          <div
            className={cn(
              "flex flex-col items-start pb-4 sm:pb-10",
              !entrance.copyReveal && "opacity-0",
            )}
          >
            <ul
              className={cn(
                "mb-6 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground",
                entrance.copyReveal && "hero-resolve",
              )}
              style={{ animationDelay: "0ms" }}
            >
              {EYEBROW.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>

            <h1
              id="hero-title"
              className={cn(
                "font-mono text-4xl font-semibold uppercase leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl",
                entrance.copyReveal && "hero-resolve",
              )}
              style={{ animationDelay: "60ms" }}
            >
              Every chart
              <br />
              here is yours.
            </h1>

            <p
              className={cn(
                "mt-6 max-w-md font-mono text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7",
                entrance.copyReveal && "hero-resolve",
              )}
              style={{ animationDelay: "110ms" }}
            >
              React charts you paste into your repo and reshape line by line.
              No runtime dependency on us.
            </p>

            <div
              className={cn(
                "mt-8 w-full max-w-md",
                entrance.copyReveal && "hero-resolve",
              )}
              style={{ animationDelay: "160ms" }}
            >
              <CommandSnippet command={CLI_COMMAND} />
            </div>
          </div>

          <div
            className={cn(
              "flex justify-center sm:justify-end sm:translate-x-2 sm:translate-y-6 lg:translate-x-4 lg:translate-y-8",
              !entrance.portraitReveal && "opacity-0",
            )}
          >
            <HeroPortrait
              className={
                entrance.portraitReveal ? "hero-resolve-rows" : undefined
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
