"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { HERO_CHART_COLUMNS, HERO_CHART_FORMS } from "./hero-chart";
import { TextField } from "./text-field";

interface HeroChartFieldProps {
  className?: string;
}

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Long enough to read as a considered change rather than a slideshow. */
const FORM_INTERVAL_MS = 4200;

/** The chart resolves after the headline and before the portrait. */
const ROW_DELAY_MS = 14;

const CHART_STYLE = {
  fontSize: `min(1.1vh, calc(var(--chart-w) / ${HERO_CHART_COLUMNS} / 0.6), calc(560px / ${HERO_CHART_COLUMNS} / 0.6))`,
};

/**
 * The hero of a chart library ought to contain a chart. This one is drawn in
 * the same characters as the portrait, from committed data, so the two regions
 * read as one field rather than as an illustration next to a picture.
 *
 * It is decoration: unnamed, so it adds nothing for a screen reader that the
 * heading beside it does not already say.
 */
export function HeroChartField({ className }: HeroChartFieldProps) {
  const [form, setForm] = useState(0);

  useEffect(() => {
    // Read the query after mount, never during render: the server has no
    // matchMedia, and the first form renders either way, so the server tree
    // and the reduced-motion tree are the same tree.
    if (window.matchMedia(MOTION_QUERY).matches) return;

    const timer = setInterval(() => {
      setForm((current) => (current + 1) % HERO_CHART_FORMS.length);
    }, FORM_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <TextField
      text={HERO_CHART_FORMS[form] ?? HERO_CHART_FORMS[0] ?? ""}
      style={CHART_STYLE}
      rowDelayMs={ROW_DELAY_MS}
      className={cn("text-muted-foreground", className)}
    />
  );
}
