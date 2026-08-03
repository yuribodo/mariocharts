// components/landing/manifesto-morph/glyph-morph.tsx
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  buildLinePath,
  computeLineTargets,
  mapGlyphsToTargets,
  splitHeadlineToGlyphs,
} from "./morph-geometry";
import {
  DEMO_SERIES,
  HEADLINE,
  MORPH_DURATION_MS,
  MORPH_VIEWBOX,
  type MorphPhase,
} from "./types";

interface GlyphMorphProps {
  phase: MorphPhase;
  className?: string;
}

export function GlyphMorph({ phase, className }: GlyphMorphProps) {
  const glyphs = useMemo(() => splitHeadlineToGlyphs(HEADLINE), []);
  const targets = useMemo(
    () => computeLineTargets(DEMO_SERIES, MORPH_VIEWBOX),
    []
  );
  const mapping = useMemo(
    () => mapGlyphsToTargets(glyphs, targets),
    [glyphs, targets]
  );
  const path = useMemo(() => buildLinePath(targets), [targets]);

  const isMorphing = phase === "morphing";

  return (
    <div className={cn("relative mx-auto w-full max-w-3xl", className)}>
      {/* Idle / morphing headline layer */}
      <motion.h2
        className={cn(
          "text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl",
          isMorphing && "pointer-events-none"
        )}
        aria-hidden={isMorphing}
      >
        {glyphs.map((glyph) => {
          const mapped = mapping.find((m) => m.glyphIndex === glyph.index);
          const isFlyer = Boolean(mapped) && isMorphing;

          return (
            <motion.span
              key={glyph.id}
              className="inline-block"
              initial={false}
              animate={
                isFlyer && mapped
                  ? {
                      // Approximate: fly upward into chart band; exact pixel
                      // docking is handled by the SVG dots layer below.
                      opacity: 0,
                      y: -24,
                      scale: 0.4,
                    }
                  : isMorphing
                    ? { opacity: 0.15, letterSpacing: "0.12em" }
                    : { opacity: 1, y: 0, scale: 1, letterSpacing: "0em" }
              }
              transition={{
                duration: MORPH_DURATION_MS / 1000,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {glyph.char === " " ? "\u00A0" : glyph.char}
            </motion.span>
          );
        })}
      </motion.h2>

      {/* Chart geometry reveal */}
      <motion.svg
        viewBox={`0 0 ${MORPH_VIEWBOX.width} ${MORPH_VIEWBOX.height}`}
        className="mx-auto mt-10 h-[240px] w-full text-foreground"
        initial={false}
        animate={{ opacity: isMorphing ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        aria-hidden
      >
        <motion.path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            isMorphing
              ? { pathLength: 1, opacity: 0.85 }
              : { pathLength: 0, opacity: 0 }
          }
          transition={{
            duration: MORPH_DURATION_MS / 1000,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
        {targets.map((target, i) => (
          <motion.circle
            key={target.label}
            cx={target.x}
            cy={target.y}
            r={4}
            fill="var(--background)"
            stroke="currentColor"
            strokeWidth={2}
            initial={{ scale: 0, opacity: 0 }}
            animate={
              isMorphing
                ? { scale: 1, opacity: 1 }
                : { scale: 0, opacity: 0 }
            }
            transition={{
              delay: isMorphing ? 0.35 + i * 0.06 : 0,
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        ))}
      </motion.svg>
    </div>
  );
}
