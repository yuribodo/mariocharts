"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  getInitialPhase,
  reduceMorphEvent,
} from "./morph-phase";
import { MORPH_DURATION_MS, SESSION_KEY, type MorphPhase } from "./types";

function readSessionSettled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSessionSettled(): void {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}

export function useManifestoMorph(sectionRef: React.RefObject<HTMLElement | null>) {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<MorphPhase>("idle");
  const startedRef = useRef(false);

  useEffect(() => {
    setPhase(getInitialPhase(readSessionSettled()));
  }, []);

  const settle = useCallback(() => {
    setPhase((prev) => reduceMorphEvent(prev, "MORPH_DONE"));
    writeSessionSettled();
  }, []);

  const abortToSettled = useCallback(() => {
    setPhase((prev) => reduceMorphEvent(prev, "ABORT_SETTLE"));
    writeSessionSettled();
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || phase === "settled") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || startedRef.current) return;
        startedRef.current = true;

        if (shouldReduceMotion) {
          setPhase("settled");
          writeSessionSettled();
          return;
        }

        setPhase((prev) => reduceMorphEvent(prev, "ENTER_VIEW"));
      },
      { threshold: 0.45 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [sectionRef, phase, shouldReduceMotion]);

  useEffect(() => {
    if (phase !== "morphing") return;

    const timeout = window.setTimeout(() => {
      settle();
    }, MORPH_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [phase, settle]);

  // If user scrolls away mid-morph, finish to settled (no half-state)
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || phase !== "morphing") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && !entry.isIntersecting) abortToSettled();
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [sectionRef, phase, abortToSettled]);

  return { phase, shouldReduceMotion } as const;
}
