"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlyphMorph } from "./glyph-morph";
import { SettledLineChart } from "./settled-line-chart";
import { useManifestoMorph } from "./use-manifesto-morph";
import { HEADLINE, SUPPORT_LINE } from "./types";

interface ManifestoMorphSectionProps {
  className?: string;
}

export function ManifestoMorphSection({ className }: ManifestoMorphSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { phase, shouldReduceMotion } = useManifestoMorph(sectionRef);

  const showSettled = phase === "settled";
  const showMorphStage = !showSettled;

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative overflow-hidden border-b py-16 lg:py-24",
        className
      )}
    >
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6">
        {/* sr-only belief always available */}
        <p className="sr-only">{HEADLINE}</p>

        <div className="flex min-h-[360px] w-full flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {showMorphStage && (
              <motion.div
                key="morph-stage"
                className="w-full"
                initial={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: { duration: shouldReduceMotion ? 0.2 : 0.35 },
                }}
              >
                {shouldReduceMotion ? (
                  <h2
                    aria-hidden="true"
                    className="text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
                  >
                    {HEADLINE}
                  </h2>
                ) : (
                  <GlyphMorph phase={phase} />
                )}
              </motion.div>
            )}

            {showSettled && (
              <motion.div
                key="settled"
                className="w-full"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.25 : 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <SettledLineChart />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.p
          className="mt-10 max-w-md text-center text-base text-muted-foreground sm:text-lg"
          initial={false}
          animate={{ opacity: showSettled ? 1 : 0, y: showSettled ? 0 : 8 }}
          transition={{ duration: 0.4, delay: showSettled ? 0.1 : 0 }}
        >
          {SUPPORT_LINE}
        </motion.p>
      </div>
    </section>
  );
}
