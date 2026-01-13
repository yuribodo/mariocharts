"use client";

import { motion, useReducedMotion } from "framer-motion";

interface LogoAnimatedProps {
  size?: number;
  className?: string;
}

export function LogoAnimated({ size = 32, className }: LogoAnimatedProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              scale: 1.05,
            }
      }
      whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      aria-hidden="true"
      style={{ cursor: "pointer" }}
    >
      {/* Background rounded square - uses currentColor (foreground) */}
      <rect width="32" height="32" rx="6" fill="currentColor" />

      {/* Chart line - uses background color (opposite of currentColor) */}
      <motion.path
        d="M6.5 21 L12 10 L16 18 L20 10 L25.5 16"
        fill="none"
        className="stroke-background"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      <circle cx="12" cy="10" r="1.6" className="fill-background" />
      <circle cx="20" cy="10" r="1.6" className="fill-background" />
    </motion.svg>
  );
}
