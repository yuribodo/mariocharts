"use client";

import { cn } from "@/lib/utils";
import { CommandSnippet } from "@/components/ui/command-snippet";

import { HeroChartField } from "./hero-chart-field";
import { HeroPortrait } from "./hero-portrait";

interface HeroSectionProps {
  className?: string;
}

const CLI_COMMAND = "npx mario-charts@latest init";

/** Small labels along the top, which is what makes the grid read as a grid. */
const EYEBROW = ["MARIO CHARTS", "12 COMPONENTS", "MIT", "REACT + TS"] as const;

/**
 * The hero is one monospaced field in four regions: an eyebrow rule, the
 * heading, a chart drawn in characters, and the portrait. They share a font
 * and a rhythm so they read as one grid rather than as separate blocks with
 * gaps between them — which is what stops the section reading as empty.
 *
 * The grid is a visual conceit, not a rendering strategy. The heading is a
 * real <h1> and the command is the real CommandSnippet with its real button
 * and live region; they are only aligned to the fields' metrics. Painting the
 * copy as characters would trade the accessible name, the copy button, text
 * selection and indexability for an effect indistinguishable from alignment.
 *
 * The portrait and the copy stay ordinary grid siblings rather than stacked
 * layers, which is what makes "they never overlap" true by construction
 * instead of by measurement. Text sits directly on the background with no
 * scrim, which is only safe because they never share space.
 *
 * Entrance order is heading, chart, portrait — set by the delays below and by
 * each field's own per-row stagger.
 */
export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className={cn("relative w-full overflow-hidden border-b", className)}
    >
      <div className="mx-auto flex min-h-[calc(100svh-7rem)] w-full max-w-7xl flex-col justify-center gap-8 px-6 py-12">
        <ul
          className="hero-resolve flex flex-wrap gap-x-6 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground"
          style={{ animationDelay: "0ms" }}
        >
          {EYEBROW.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>

        <div className="grid grid-cols-1 items-center gap-10 sm:grid-cols-2 sm:gap-6 lg:gap-12">
          <div className="flex flex-col items-start">
            <h1
              id="hero-title"
              className="hero-resolve font-mono text-3xl font-semibold uppercase leading-[1.05] tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              style={{ animationDelay: "60ms" }}
            >
              Every chart here
              <br />
              is yours.
            </h1>

            <div
              className="hero-resolve mt-8 w-full max-w-md"
              style={{ animationDelay: "140ms" }}
            >
              <CommandSnippet command={CLI_COMMAND} />
            </div>

            <HeroChartField className="hero-resolve-rows mt-10 w-full [--chart-w:80vw] sm:[--chart-w:40vw]" />
          </div>

          <div className="flex items-center justify-center overflow-hidden sm:justify-end">
            <HeroPortrait className="hero-resolve-rows" />
          </div>
        </div>
      </div>
    </section>
  );
}
