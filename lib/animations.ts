import type { Variants, Transition } from "framer-motion";

// Spring configurations
export const springConfig = {
  gentle: { type: "spring", stiffness: 120, damping: 14 },
  snappy: { type: "spring", stiffness: 300, damping: 20 },
  bouncy: { type: "spring", stiffness: 400, damping: 10 },
  smooth: { type: "spring", stiffness: 200, damping: 25, mass: 0.8 },
} as const;

// Easing presets
export const easings = {
  easeOut: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  expo: [0.16, 1, 0.3, 1],
  back: [0.68, -0.55, 0.265, 1.55],
} as const;

// Fade variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: easings.easeOut },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easings.easeOut },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easings.easeOut },
  },
};

// Scale variants
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easings.back },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springConfig.bouncy,
  },
};

// Slide variants
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: easings.easeOut },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: easings.easeOut },
  },
};

// Stagger container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easings.easeOut },
  },
};

// Hero-specific animations
export const heroTitle: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easings.expo },
  },
};

export const heroSubtitle: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easings.easeOut, delay: 0.2 },
  },
};

// Chart-specific animations
export const chartFadeIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: easings.easeOut },
  },
};

// Path drawing animation (for SVG)
export const drawPath: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.5, ease: "easeInOut" },
  },
};

// Button hover animation
export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.2 },
};

export const buttonTap = {
  scale: 0.98,
};

// Gradient text animation (for CSS animation)
export const gradientShiftKeyframes = `
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
`;

// Party mode animation
export const partyMode: Variants = {
  idle: { filter: "hue-rotate(0deg)" },
  party: {
    filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Confetti burst config
export const confettiConfig = {
  default: {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#a855f7", "#ec4899", "#22d3ee", "#f472b6", "#818cf8"],
  },
  party: {
    particleCount: 150,
    spread: 180,
    origin: { y: 0.5, x: 0.5 },
    colors: ["#a855f7", "#ec4899", "#22d3ee", "#f472b6", "#facc15"],
  },
  copy: {
    particleCount: 30,
    spread: 50,
    origin: { y: 0.8, x: 0.5 },
    colors: ["#22c55e", "#4ade80", "#86efac"],
  },
};

// Transition presets
export const transitions = {
  fast: { duration: 0.2 } as Transition,
  default: { duration: 0.4, ease: easings.easeOut } as Transition,
  slow: { duration: 0.8, ease: easings.easeOut } as Transition,
  spring: springConfig.smooth as Transition,
};
