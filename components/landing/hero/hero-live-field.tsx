"use client";

import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";

import {
  BACKDROP_COLUMNS,
  HERO_BACKDROP,
  HERO_BACKDROP_CHART,
} from "./hero-backdrop";
import { HeroChartEffect, HeroFieldEffect } from "./hero-field-effect";
import { TextField } from "./text-field";

/**
 * The larger of a width-fit and a height-fit term, so the field always covers
 * the section in both dimensions and the overflow is clipped — width-fit alone
 * left the field shorter than tall viewports and taller than wide ones, with
 * its lower rows below the fold.
 */
const BACKDROP_STYLE = {
  fontSize: `max(7px, calc(108vw / ${BACKDROP_COLUMNS} / 0.6), calc(104svh / 90 / 1.05))`,
};

interface HeroLiveFieldProps {
  /**
   * When false the live canvases stay off and the static SSR field is hidden
   * — the world-intro warp owns the pixels. Defaults to true so the field
   * still works if rendered outside the entrance orchestrator.
   */
  active?: boolean;
  /**
   * When true the field cluster plays `hero-field-reveal` so the ASCII world
   * eases in with the copy/portrait instead of popping fully opaque.
   */
  reveal?: boolean;
}

/**
 * The field, alive. Frame 0 is committed into the DOM as a TextField so the
 * server and the client's first paint match. Once the canvas has painted a
 * live frame it takes over — continuous time via rAF, no React state per
 * tick — and the static field hides so the two never double-ink. Under
 * reduced motion the canvas never mounts and the field simply is its first
 * frame.
 */
export function HeroLiveField({
  active = true,
  reveal = true,
}: HeroLiveFieldProps) {
  const [fieldLive, setFieldLive] = useState(false);
  const [chartLive, setChartLive] = useState(false);
  const onFieldReady = useCallback(() => setFieldLive(true), []);
  const onChartReady = useCallback(() => setChartLive(true), []);

  // While the entrance warp is running, hide the SSR field entirely so only
  // the tunnel is visible. Once active, show frame 0 until the live canvas
  // paints, then hand off (text-transparent).
  const fieldClass = !active
    ? "text-transparent"
    : fieldLive
      ? "text-transparent"
      : "text-foreground/[0.16]";
  const chartClass = !active
    ? "text-transparent"
    : chartLive
      ? "text-transparent"
      : "text-foreground/[0.4]";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0",
        !reveal && "opacity-0",
        reveal && "hero-field-reveal",
      )}
      aria-hidden="true"
    >
      {/*
        The backdrop bleeds past the section's edges and is clipped by it, so
        no viewport can reach its end and expose a hard boundary. It is
        decoration and unnamed, so it adds nothing for a screen reader. The
        canvas re-inks the live field (and the cursor spotlight) on top.
      */}
      <div className="absolute -left-4 -top-4 select-none">
        <TextField
          text={HERO_BACKDROP}
          className={fieldClass}
          style={BACKDROP_STYLE}
        />
        <HeroFieldEffect active={active} onReady={onFieldReady} />
      </div>

      {/*
        The data strip: an area chart across the section's full width, pinned
        to its bottom edge so it is always above the fold's floor. Its surface
        line never moves with time — the wash inside it breathes, the data
        does not.
      */}
      <div className="absolute -bottom-1 -left-4 select-none">
        <TextField
          text={HERO_BACKDROP_CHART}
          className={chartClass}
          style={BACKDROP_STYLE}
        />
        <HeroChartEffect active={active} onReady={onChartReady} />
      </div>
    </div>
  );
}
