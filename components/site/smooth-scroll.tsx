"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

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
 * Snaps to the top on route changes instead of gliding there.
 *
 * Lenis interpolates every scroll offset (lerp 0.1), including the
 * scroll-to-top the App Router performs when hopping between charts — that
 * glide is what made Bar -> Scatter feel slow and "drunk". In-page anchors
 * keep the smooth behavior; only route transitions snap.
 *
 * Sibling of ReactLenis (not wrapped by it) so toggling smooth scrolling
 * never remounts page content — the instance is read from the forwarded ref.
 */
function RouteScrollReset({
  lenisRef,
}: {
  lenisRef: React.RefObject<LenisRef | null>;
}) {
  const pathname = usePathname();
  const isFirstPaint = useRef(true);

  useEffect(() => {
    if (isFirstPaint.current) {
      isFirstPaint.current = false;
      return;
    }
    const lenis = lenisRef.current?.lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname, lenisRef]);

  return null;
}

/**
 * Site-wide smooth scrolling via Lenis. Only the scroll controller mounts
 * when motion is enabled; page content keeps the same React tree during
 * hydration and when the visitor changes their motion preference.
 *
 * `root` binds Lenis to the document scroller (not a nested overflow box),
 * which is what the marketing site and docs both use.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const lenisRef = useRef<LenisRef | null>(null);

  useEffect(() => {
    const motionQuery = window.matchMedia(MOTION_QUERY);
    const update = () => setEnabled(!motionQuery.matches);
    update();
    motionQuery.addEventListener("change", update);
    return () => motionQuery.removeEventListener("change", update);
  }, []);

  return (
    <>
      {enabled && (
        <ReactLenis root options={LENIS_OPTIONS} ref={lenisRef} />
      )}
      <RouteScrollReset lenisRef={lenisRef} />
      {children}
    </>
  );
}
