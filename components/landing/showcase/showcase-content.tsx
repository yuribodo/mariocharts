"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChartType = "bar" | "area" | "pie" | "radar";

interface ShowcaseContentProps {
  activeChart: ChartType;
  className?: string;
}

interface ChartInfo {
  title: string;
  description: string;
  href: string;
}

export const SHOWCASE_CONTENT: Record<ChartType, ChartInfo> = {
  bar: {
    title: "Bar Chart",
    description: "Compare categorical data with horizontal or vertical bars. Perfect for showing rankings, comparisons, and distributions across categories.",
    href: "/docs/components/bar-chart",
  },
  area: {
    title: "Line Chart",
    description: "Visualize trends and patterns over time with smooth lines. Ideal for showing progress, changes over time, and time-series data.",
    href: "/docs/components/line-chart",
  },
  pie: {
    title: "Pie Chart",
    description: "Display proportions and percentages at a glance. Best for showing part-to-whole relationships with a small number of categories.",
    href: "/docs/components/pie-chart",
  },
  radar: {
    title: "Radar Chart",
    description: "Compare multiple variables across different dimensions. Great for performance metrics, skill assessments, and multi-factor analysis.",
    href: "/docs/components/radar-chart",
  },
};

export const CHART_SEQUENCE: ChartType[] = ["bar", "area", "pie", "radar"];

/**
 * Showcase Content Panel
 *
 * Clean content display with:
 * - Title
 * - Description
 * - CTA button
 */
export function ShowcaseContent({ activeChart, className }: ShowcaseContentProps) {
  const content = SHOWCASE_CONTENT[activeChart];

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeChart}
          initial={{ opacity: 0, y: 12, filter: "blur(10px)", scale: 0.98 }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
          exit={{ opacity: 0, y: -8, filter: "blur(10px)", scale: 0.98 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left"
        >
          {/* Title */}
          <motion.h2
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 10, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0.0, ease: [0.22, 1, 0.36, 1] }}
          >
            {content.title}
          </motion.h2>

          {/* Description */}
          <motion.p
            className="max-w-md text-base text-muted-foreground lg:text-lg"
            initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            {content.description}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={content.href}
              className="group inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:bg-foreground/90"
            >
              View Documentation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * Progress Dots Component
 */
interface ProgressDotsProps {
  activeIndex: number;
  total: number;
  className?: string;
  onDotClick?: (index: number) => void;
}

export function ProgressDots({
  activeIndex,
  total,
  className,
  onDotClick,
}: ProgressDotsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} role="tablist">
      {Array.from({ length: total }).map((_, i) => (
        <motion.button
          key={i}
          onClick={() => onDotClick?.(i)}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i === activeIndex
              ? "w-8 bg-foreground"
              : "w-2 bg-foreground/30 hover:bg-foreground/50"
          )}
          animate={{
            scale: i === activeIndex ? 1 : 0.85,
          }}
          whileHover={{ scale: i === activeIndex ? 1 : 1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={`Go to ${CHART_SEQUENCE[i]} chart`}
          aria-selected={i === activeIndex}
          role="tab"
        />
      ))}
    </div>
  );
}
