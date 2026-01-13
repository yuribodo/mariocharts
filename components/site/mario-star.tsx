"use client";

import { motion, useReducedMotion } from "framer-motion";

interface MarioStarProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function MarioStar({ size = 16, className, animate = true }: MarioStarProps) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = animate && !shouldReduceMotion;

  const hoverAnimation = shouldAnimate
    ? {
        rotate: [0, 15, -15, 0],
        transition: { duration: 0.4, ease: "easeInOut" as const },
      }
    : {};

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      whileHover={hoverAnimation}
      aria-hidden="true"
    >
      {/* Mario Super Star - 4 pointed star shape */}
      <motion.path
        d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
        fill="#FFD700"
        stroke="#E5A700"
        strokeWidth="0.5"
        initial={{ scale: 1 }}
        whileHover={shouldAnimate ? { scale: 1.1 } : {}}
      />
      {/* Inner highlight for 3D effect */}
      <path
        d="M12 3L13.5 9.5L20 12L13.5 14.5L12 21L10.5 14.5L4 12L10.5 9.5L12 3Z"
        fill="#FFED4A"
        opacity="0.6"
      />
    </motion.svg>
  );
}
