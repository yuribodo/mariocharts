"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Export configured gsap instance
export { gsap, ScrollTrigger };

// Default GSAP settings for consistent animations
export const gsapDefaults = {
  ease: "power2.out",
  duration: 0.6,
} as const;

// Scroll trigger defaults
export const scrollTriggerDefaults = {
  start: "top center",
  end: "bottom center",
  toggleActions: "play none none reverse",
} as const;
