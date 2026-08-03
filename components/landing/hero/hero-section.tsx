"use client";

import { cn } from "@/lib/utils";
import { CommandSnippet } from "@/components/ui/command-snippet";

import { BACKDROP_COLUMNS, HERO_BACKDROP } from "./hero-backdrop";
import { HeroChartField } from "./hero-chart-field";
import { HeroPortrait } from "./hero-portrait";
import { TextField } from "./text-field";

interface HeroSectionProps {
  className?: string;
}

const CLI_COMMAND = "npx mario-charts@latest init";

/** Small labels along the top rule, in the grid's own voice. */
const EYEBROW = ["MARIO CHARTS", "12 COMPONENTS", "MIT", "REACT + TS"] as const;

/**
 * The hero is a full-bleed character field, not a container with ASCII in it.
 *
 * The previous version kept an ordinary centred layout — max width, side
 * padding, vertically centred content — and dropped two ASCII blocks inside.
 * That is why it read as empty: nothing was drawing the background, so most of
 * the section was blank page with decoration floating on it. Here the field
 * covers the viewport edge to edge and every cell is a character, so there is
 * no empty region left. The copy sits in a cleared area of that field.
 *
 * The grid is still a visual conceit, not a rendering strategy: the heading is
 * a real <h1> and the command is the real CommandSnippet with its button and
 * live region. Only their metrics are shared with the fields.
 */
export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className={cn(
        "relative w-full overflow-hidden border-b min-h-[calc(100svh-7rem)]",
        className,
      )}
    >
      {/*
        The backdrop bleeds past all four edges and is clipped by the section,
        so no viewport can reach its end and expose a hard boundary. It is
        decoration and unnamed, so it adds nothing for a screen reader.
      */}
      <TextField
        text={HERO_BACKDROP}
        className="pointer-events-none absolute -left-4 -top-4 select-none text-foreground/[0.09]"
        style={{
          fontSize: `max(7px, calc(108vw / ${BACKDROP_COLUMNS} / 0.6))`,
        }}
      />

      <div className="relative flex min-h-[calc(100svh-7rem)] flex-col justify-center gap-10 px-6 py-12 sm:px-10 lg:px-16">
        <ul
          className="hero-resolve flex flex-wrap gap-x-6 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground"
          style={{ animationDelay: "0ms" }}
        >
          {EYEBROW.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>

        <div className="grid grid-cols-1 items-center gap-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-8 lg:gap-16">
          <div className="flex flex-col items-start">
            {/*
              No plate behind the copy: the backdrop clears itself here (see
              CLEARING in hero-backdrop.ts), so the type sits on genuine
              emptiness rather than on a scrim over drawn glyphs.
            */}
            <div>
              <h1
                id="hero-title"
                className="hero-resolve font-mono text-3xl font-semibold uppercase leading-[1.05] tracking-tight text-foreground sm:text-4xl lg:text-6xl"
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
            </div>

            <HeroChartField className="hero-resolve-rows mt-12 w-full [--chart-w:82vw] sm:[--chart-w:44vw]" />
          </div>

          <div className="flex items-center justify-center overflow-hidden sm:justify-end">
            <HeroPortrait className="hero-resolve-rows" />
          </div>
        </div>
      </div>
    </section>
  );
}
