"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "../../lib/utils";

interface MarioStarProps {
  size?: number;
  className?: string;
  animate?: boolean;
  /** Controlled invincibility mode — e.g. whole GitHub link hover. */
  powered?: boolean;
}

const POWER_GLOW = [
  "drop-shadow(0 0 2px #FFD54F) drop-shadow(0 0 10px #FF9800)",
  "drop-shadow(0 0 3px #FFFFFF) drop-shadow(0 0 14px #4FC3F7)",
  "drop-shadow(0 0 3px #F8BBD0) drop-shadow(0 0 14px #EC407A)",
  "drop-shadow(0 0 3px #B39DDB) drop-shadow(0 0 14px #7E57C2)",
  "drop-shadow(0 0 3px #C5E1A5) drop-shadow(0 0 14px #66BB6A)",
  "drop-shadow(0 0 3px #FFE082) drop-shadow(0 0 12px #FFCA28)",
];

/**
 * Super Star power-up — the chubby five-point gold star with eyes from Mario.
 * Idle wobble; hover (or `powered`) goes invincible: bigger + rainbow flash.
 */
export function MarioStar({
  size = 16,
  className,
  animate = true,
  powered,
}: MarioStarProps) {
  const reactId = useId();
  const fillId = `mario-star-fill-${reactId}`;
  const glossId = `mario-star-gloss-${reactId}`;
  const rainbowId = `mario-star-rainbow-${reactId}`;
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = animate && !shouldReduceMotion;
  const [hovered, setHovered] = useState(false);
  const isPowered = shouldAnimate && (powered ?? hovered);

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("mario-star shrink-0", className)}
      aria-hidden="true"
      style={{ transformOrigin: "50% 55%" }}
      onHoverStart={() => {
        if (powered === undefined) setHovered(true);
      }}
      onHoverEnd={() => {
        if (powered === undefined) setHovered(false);
      }}
      animate={
        isPowered
          ? {
              rotate: 360,
              scale: 1.48,
              filter: POWER_GLOW,
            }
          : shouldAnimate
            ? {
                rotate: [0, -7, 7, -4, 4, 0],
                y: [0, -0.6, 0, -0.35, 0],
                scale: 1,
                filter: "drop-shadow(0 0 0px transparent)",
              }
            : { scale: 1 }
      }
      transition={
        isPowered
          ? {
              rotate: { duration: 0.55, ease: [0.22, 1.35, 0.36, 1] },
              scale: { duration: 0.22, ease: [0.22, 1.4, 0.36, 1] },
              filter: {
                duration: 0.55,
                ease: "linear",
                repeat: Infinity,
              },
            }
          : shouldAnimate
            ? {
                duration: 2.6,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 1.4,
                filter: { duration: 0.2 },
                scale: { duration: 0.2 },
              }
            : { duration: 0.2 }
      }
    >
      <defs>
        <linearGradient
          id={fillId}
          x1="16"
          y1="2"
          x2="16"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFE86A" />
          <stop offset="48%" stopColor="#FFC933" />
          <stop offset="100%" stopColor="#F0A010" />
        </linearGradient>
        <linearGradient
          id={glossId}
          x1="11"
          y1="4"
          x2="18"
          y2="14"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFF6C2" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFF6C2" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={rainbowId}
          x1="2"
          y1="2"
          x2="30"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FF5C5C" />
          <stop offset="22%" stopColor="#FFC933" />
          <stop offset="44%" stopColor="#7CFF6B" />
          <stop offset="66%" stopColor="#4FC3F7" />
          <stop offset="84%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
      </defs>

      <ellipse cx="16" cy="29.2" rx="7.5" ry="1.35" fill="#C47F00" opacity="0.22" />

      <path
        d="M16 2.2
           L19.55 11.15
           L29.2 11.55
           L21.7 17.55
           L24.55 27.4
           L16 21.85
           L7.45 27.4
           L10.3 17.55
           L2.8 11.55
           L12.45 11.15
           Z"
        fill={`url(#${fillId})`}
        stroke="#C47F00"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />

      {/* Star-power wash — rainbow body during invincibility. */}
      <motion.path
        d="M16 2.2
           L19.55 11.15
           L29.2 11.55
           L21.7 17.55
           L24.55 27.4
           L16 21.85
           L7.45 27.4
           L10.3 17.55
           L2.8 11.55
           L12.45 11.15
           Z"
        fill={`url(#${rainbowId})`}
        stroke="#FFFFFF"
        strokeWidth="1.1"
        strokeLinejoin="round"
        initial={false}
        animate={{ opacity: isPowered ? [0.55, 0.9, 0.45, 0.85, 0.55] : 0 }}
        transition={
          isPowered
            ? { duration: 0.45, ease: "linear", repeat: Infinity }
            : { duration: 0.15 }
        }
      />

      <path
        d="M16 4.6
           L18.35 11.1
           L16 10.55
           L12.9 11.05
           Z"
        fill={`url(#${glossId})`}
        opacity="0.85"
      />

      <ellipse cx="12.55" cy="14.6" rx="1.55" ry="2.35" fill="#1A1208" />
      <ellipse cx="19.45" cy="14.6" rx="1.55" ry="2.35" fill="#1A1208" />
      <ellipse cx="12.15" cy="13.55" rx="0.45" ry="0.55" fill="#FFF8D6" opacity="0.85" />
      <ellipse cx="19.05" cy="13.55" rx="0.45" ry="0.55" fill="#FFF8D6" opacity="0.85" />
    </motion.svg>
  );
}
