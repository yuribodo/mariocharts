"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface StickySectionProps {
  children: ReactNode;
  className?: string;
  zIndex?: number;
  background?: string;
  id?: string;
}

export function StickySection({
  children,
  className = "",
  zIndex = 10,
  background = "bg-black",
  id,
}: StickySectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      className={`sticky top-0 h-screen flex items-center justify-center overflow-hidden ${background} ${className}`}
      style={{ zIndex }}
    >
      {children}
    </motion.section>
  );
}
