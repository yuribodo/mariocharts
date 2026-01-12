"use client";

import { useEffect, useState, useCallback } from "react";

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
] as const;

interface UseKonamiCodeOptions {
  onActivate?: () => void;
  onProgress?: (index: number, total: number) => void;
  enabled?: boolean;
}

interface UseKonamiCodeReturn {
  isActivated: boolean;
  progress: number;
  reset: () => void;
}

/**
 * Hook to detect Konami Code input
 *
 * Sequence: ↑↑↓↓←→←→BA
 *
 * @example
 * ```tsx
 * const { isActivated } = useKonamiCode({
 *   onActivate: () => {
 *     console.log("Party mode activated!");
 *     startPartyMode();
 *   }
 * });
 * ```
 */
export function useKonamiCode(
  options: UseKonamiCodeOptions = {}
): UseKonamiCodeReturn {
  const { onActivate, onProgress, enabled = true } = options;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActivated, setIsActivated] = useState(false);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setIsActivated(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const expectedKey = KONAMI_CODE[currentIndex];

      if (event.code === expectedKey) {
        const newIndex = currentIndex + 1;

        if (newIndex === KONAMI_CODE.length) {
          // Code completed!
          setIsActivated(true);
          setCurrentIndex(0);
          onActivate?.();
        } else {
          setCurrentIndex(newIndex);
          onProgress?.(newIndex, KONAMI_CODE.length);
        }
      } else {
        // Wrong key - reset
        setCurrentIndex(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, enabled, onActivate, onProgress]);

  return {
    isActivated,
    progress: currentIndex / KONAMI_CODE.length,
    reset,
  };
}
