"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface ChartTooltipProps {
  readonly visible: boolean;
  readonly x: number;
  readonly y: number;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function ChartTooltip({ visible, x, y, children, className, style }: ChartTooltipProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`absolute pointer-events-none z-50 bg-popover/98 backdrop-blur-md border border-border rounded-lg px-3 py-2.5 shadow-xl ${className ?? ""}`}
          style={{ left: x, top: y, ...(style as Record<string, unknown>) }}
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.9 }}
          transition={{ duration: reduceMotion ? 0 : 0.15, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
