"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShowcaseChart } from "./showcase-chart";
import {
  ShowcaseContent,
  ProgressDots,
  CHART_SEQUENCE,
  type ChartType,
} from "./showcase-content";

interface ShowcaseSectionProps {
  className?: string;
}

/**
 * Showcase Section
 *
 * A sticky scroll experience showcasing different chart types.
 * - Charts animate with GSAP (bar, area, pie, radar)
 * - Content transitions smoothly between steps
 * - Progress dots for navigation
 */
export function ShowcaseSection({ className }: ShowcaseSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepCount = CHART_SEQUENCE.length;
  const [activeChart, setActiveChart] = useState<ChartType>(CHART_SEQUENCE[0] ?? "bar");
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // Use ref to track current index without causing re-renders on scroll
  const currentIndexRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (!viewportHeight || stepCount === 0) return;

    // One full viewport height per chart step
    const maxScroll = viewportHeight * stepCount;
    const scrolled = Math.min(Math.max(-rect.top, 0), maxScroll);
    const chartIndex = Math.min(
      stepCount - 1,
      Math.floor(scrolled / viewportHeight)
    );

    // Only update state if chart index changed
    const newChart = CHART_SEQUENCE[chartIndex];
    if (chartIndex !== currentIndexRef.current && newChart) {
      currentIndexRef.current = chartIndex;
      setActiveIndex(chartIndex);
      setActiveChart(newChart);
    }
  }, [stepCount]);

  const onScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      handleScroll();
    });
  }, [handleScroll]);

  const scrollToChart = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const viewportHeight = window.innerHeight;
    const targetScroll = container.offsetTop + index * viewportHeight;

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll, onScroll, shouldReduceMotion]);

  // Fallback for reduced motion
  if (shouldReduceMotion) {
    return (
      <section
        className={cn(
          "relative overflow-hidden py-24 lg:py-32",
          className
        )}
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-16 text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Chart Components
          </h2>
          <div className="grid gap-8 sm:gap-12 md:grid-cols-2">
            {CHART_SEQUENCE.map((chart) => (
              <div
                key={chart}
                className="rounded-2xl border border-border/40 bg-card/30 p-6 shadow-lg shadow-black/5"
              >
                <ShowcaseContent activeChart={chart} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative",
        className
      )}
      style={{ height: `${(stepCount + 1) * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-12 sm:gap-16 md:gap-20 lg:flex-row lg:items-center lg:justify-between lg:gap-24 xl:gap-32">
          <div className="flex w-full items-center justify-center lg:w-1/2">
            <ShowcaseChart
              activeChart={activeChart}
              width={400}
              height={320}
            />
          </div>

          <div className="w-full lg:w-1/2">
            <ShowcaseContent activeChart={activeChart} />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ProgressDots
            activeIndex={activeIndex}
            total={CHART_SEQUENCE.length}
            onDotClick={scrollToChart}
          />
        </div>

        {activeIndex === 0 && (
          <motion.div
            className="absolute bottom-16 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <span className="text-xs">Scroll to explore</span>
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
