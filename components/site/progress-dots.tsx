"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useScrollProgress } from "../../hooks/use-scroll-progress";
import { cn } from "../../lib/utils";

interface ProgressDotsProps {
  segments?: number;
  labels?: string[];
  onDotClick?: (index: number) => void;
  className?: string;
}

export function ProgressDots({
  segments = 4,
  labels = ["Hero", "Features", "Charts", "Footer"],
  onDotClick,
  className,
}: ProgressDotsProps) {
  const { progress } = useScrollProgress({ segments });
  const shouldReduceMotion = useReducedMotion();

  const handleDotClick = (index: number) => {
    if (onDotClick) {
      onDotClick(index);
      return;
    }

    const scrollPercentage = index / (segments - 1);
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollableHeight = docHeight - winHeight;
    const targetScroll = scrollableHeight * scrollPercentage;

    window.scrollTo({
      top: targetScroll,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    >
      {Array.from({ length: segments }).map((_, index) => {
        // Calculate fill for this specific dot
        // Each dot represents a segment of the page
        const segmentStart = index / segments;
        const segmentEnd = (index + 1) / segments;

        // How much of this segment is filled (0 to 1)
        let dotFill = 0;
        if (progress >= segmentEnd) {
          dotFill = 1; // Fully filled
        } else if (progress > segmentStart) {
          // Partially filled - calculate percentage within this segment
          dotFill = (progress - segmentStart) / (segmentEnd - segmentStart);
        }

        const label = labels[index] || `Section ${index + 1}`;

        return (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={cn(
              "relative w-2 h-2 rounded-full overflow-hidden",
              "bg-foreground/20",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "group cursor-pointer transition-transform hover:scale-125"
            )}
            aria-label={`Scroll to ${label}`}
            title={label}
          >
            {/* Fill indicator */}
            <motion.div
              className="absolute inset-0 bg-foreground rounded-full origin-bottom"
              initial={false}
              animate={{
                scaleY: dotFill,
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.15,
                ease: "easeOut",
              }}
              style={{
                transformOrigin: "bottom",
              }}
            />

            {/* Tooltip */}
            <span
              className={cn(
                "absolute left-1/2 -translate-x-1/2 top-full mt-2",
                "px-2 py-1 text-xs font-medium whitespace-nowrap",
                "bg-foreground text-background rounded",
                "opacity-0 scale-95 pointer-events-none",
                "group-hover:opacity-100 group-hover:scale-100",
                "transition-all duration-150 z-10"
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
