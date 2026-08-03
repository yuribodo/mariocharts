"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useState, type ReactNode } from "react";

import "lenis/dist/lenis.css";

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Lenis options tuned for a buttery marketing scroll without feeling drunk.
 * Lower lerp = smoother / heavier; 0.1 is the usual sweet spot.
 */
const LENIS_OPTIONS = {
  lerp: 0.1,
  smoothWheel: true,
  anchors: true,
  // Native touch scrolling stays native — syncTouch on iOS often feels worse
  // than the platform inertia, and the wheel path is what visitors notice.
  syncTouch: false,
} as const;

/**
 * Site-wide smooth scrolling via Lenis. Mounts only when the visitor has not
 * asked for reduced motion — under that preference the tree is unchanged and
 * the browser scrolls normally.
 *
 * `root` binds Lenis to the document scroller (not a nested overflow box),
 * which is what the marketing site and docs both use.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia(MOTION_QUERY);
    const update = () => setEnabled(!motionQuery.matches);
    update();
    motionQuery.addEventListener("change", update);
    return () => motionQuery.removeEventListener("change", update);
  }, []);

  if (!enabled) return children;

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      {children}
    </ReactLenis>
  );
}
