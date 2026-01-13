"use client";

import { useState, useEffect, useCallback } from "react";

interface ScrollProgressOptions {
  /** Number of segments to divide the page into */
  segments?: number;
  /** Throttle delay in ms */
  throttleMs?: number;
}

interface ScrollProgressResult {
  /** Current progress from 0 to 1 */
  progress: number;
  /** Number of filled segments (0 to segments) */
  filledSegments: number;
  /** Whether user is at the top of the page */
  isAtTop: boolean;
  /** Whether user is at the bottom of the page */
  isAtBottom: boolean;
}

export function useScrollProgress(
  options: ScrollProgressOptions = {}
): ScrollProgressResult {
  const { segments = 4, throttleMs = 16 } = options;

  const [progress, setProgress] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const calculateProgress = useCallback(() => {
    if (typeof window === "undefined") return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollableHeight = docHeight - winHeight;

    // Handle pages with no scroll
    if (scrollableHeight <= 0) {
      setProgress(1);
      setIsAtTop(true);
      setIsAtBottom(true);
      return;
    }

    const currentProgress = Math.min(scrollTop / scrollableHeight, 1);
    setProgress(currentProgress);
    setIsAtTop(scrollTop < 10);
    setIsAtBottom(scrollTop >= scrollableHeight - 10);
  }, []);

  useEffect(() => {
    // Initial calculation
    calculateProgress();

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (timeoutId) return;

      timeoutId = setTimeout(() => {
        calculateProgress();
        timeoutId = null;
      }, throttleMs);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", calculateProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", calculateProgress);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [calculateProgress, throttleMs]);

  // Calculate filled segments based on progress
  // Each segment fills at its threshold (e.g., 0.25, 0.5, 0.75, 1.0 for 4 segments)
  const filledSegments = Math.ceil(progress * segments);

  return {
    progress,
    filledSegments,
    isAtTop,
    isAtBottom,
  };
}
