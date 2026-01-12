"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { gsap } from "@/lib/gsap-config";
import {
  normalizeData,
  generateSmoothLinePath,
  generateBarPaths,
  generatePieSlices,
  DEFAULT_DATA,
  type ChartDimensions,
} from "@/lib/chart-paths";

export type ChartPhase = "bar" | "line" | "pie";

interface UseMorphingChartConfig {
  data?: readonly number[];
  width: number;
  height: number;
  autoPlay?: boolean;
  padding?: number;
}

interface UseMorphingChartReturn {
  pathRef: React.RefObject<SVGPathElement | null>;
  lineDotsRef: React.RefObject<SVGGElement | null>;
  barsRef: React.RefObject<SVGGElement | null>;
  pieRef: React.RefObject<SVGGElement | null>;
  currentPhase: ChartPhase;
  progress: number;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  restart: () => void;
}

export function useMorphingChart(
  config: UseMorphingChartConfig
): UseMorphingChartReturn {
  const {
    data = DEFAULT_DATA,
    width,
    height,
    autoPlay = true,
    padding = 40,
  } = config;

  const pathRef = useRef<SVGPathElement>(null);
  const lineDotsRef = useRef<SVGGElement>(null);
  const barsRef = useRef<SVGGElement>(null);
  const pieRef = useRef<SVGGElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const [currentPhase, setCurrentPhase] = useState<ChartPhase>("bar");
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Chart center coordinates
  const cx = width / 2;
  const cy = height / 2;

  // Generate chart data
  const chartData = useMemo(() => {
    const dimensions: ChartDimensions = { width, height, padding };
    const points = normalizeData(data, dimensions);
    const radius = Math.min(width, height) * 0.35;

    // Sort by value descending (largest first for entry)
    const dataWithIndex = [...data].map((value, index) => ({ value, index }));
    const sortedDesc = [...dataWithIndex].sort((a, b) => b.value - a.value);
    const sortedAsc = [...dataWithIndex].sort((a, b) => a.value - b.value);

    return {
      cx,
      cy,
      radius,
      points,
      linePath: generateSmoothLinePath(points),
      barPaths: generateBarPaths(data, dimensions),
      pieSlices: generatePieSlices(data, cx, cy, radius),
      largestFirst: sortedDesc.map((d) => d.index),
      smallestFirst: sortedAsc.map((d) => d.index),
    };
  }, [data, width, height, padding, cx, cy]);

  useEffect(() => {
    if (!pathRef.current) return;

    const path = pathRef.current;
    const lineDotsGroup = lineDotsRef.current;
    const barsGroup = barsRef.current;
    const pieGroup = pieRef.current;

    path.setAttribute("d", chartData.linePath);

    const initTimeout = setTimeout(() => {
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.5,
        onUpdate: () => setProgress(tl.progress()),
      });

      // ═══════════════════════════════════════════════════════════════════════
      // BAR CHART - Using attr animation for reliable SVG positioning
      // ═══════════════════════════════════════════════════════════════════════
      if (barsGroup) {
        const rects = barsGroup.querySelectorAll("rect");
        const baseline = height - padding;

        tl.set(barsGroup, { opacity: 1 });

        // Store original values and set initial state (bars at baseline with 0 height)
        rects.forEach((rect) => {
          const originalY = rect.getAttribute("y");
          const originalHeight = rect.getAttribute("height");
          rect.dataset.originalY = originalY || "0";
          rect.dataset.originalHeight = originalHeight || "0";
          gsap.set(rect, { attr: { y: baseline, height: 0 } });
        });

        // Animate bars growing from baseline
        rects.forEach((rect, i) => {
          const finalY = parseFloat(rect.dataset.originalY || "0");
          const finalHeight = parseFloat(rect.dataset.originalHeight || "0");

          const tweenVars: gsap.TweenVars = {
            attr: { y: finalY, height: finalHeight },
            duration: 0.8,
            ease: "back.out(1.7)",
          };
          if (i === 0) tweenVars.onStart = () => setCurrentPhase("bar");

          tl.to(rect, tweenVars, i * 0.1);
        });

        tl.to({}, { duration: 1.5 });

        // Exit - bars shrink back to baseline
        rects.forEach((rect, i) => {
          const exitVars: gsap.TweenVars = {
            attr: { y: baseline, height: 0 },
            duration: 0.4,
            ease: "power2.in",
          };
          if (i === 0) exitVars.onStart = () => setCurrentPhase("line");

          tl.to(rect, exitVars, `>-${0.35 - i * 0.05}`);
        });

        tl.set(barsGroup, { opacity: 0 });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // LINE CHART - "Ink Flow" Entry (Premium)
      //
      // - Progressive stroke draw with power2.inOut
      // - Dots appear SYNCHRONIZED with line as it reaches each point
      // - Each dot has "pop" micro-bounce + glow pulse
      // ═══════════════════════════════════════════════════════════════════════
      const pathLength = 1200;
      const lineDuration = 1.0; // Faster line draw
      const numPoints = chartData.points.length;

      // Setup line for draw animation
      tl.set(path, {
        opacity: 1,
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      });

      // Add label to mark when line drawing starts
      tl.add("lineStart");

      // Draw line progressively
      tl.to(path, {
        strokeDashoffset: 0,
        duration: lineDuration,
        ease: "power2.inOut",
      }, "lineStart");

      // Dots appear synchronized with line drawing
      if (lineDotsGroup) {
        const dots = lineDotsGroup.querySelectorAll("circle");

        // Show dots group at start of line animation
        tl.set(lineDotsGroup, { opacity: 1 }, "lineStart");
        tl.set(dots, {
          scale: 0,
          opacity: 0,
          transformOrigin: "center center"
        }, "lineStart");

        // Calculate when each dot should appear based on its position along the line
        // Using ABSOLUTE positions relative to lineStart label (not cascading)
        dots.forEach((dot, i) => {
          // Dot appears at proportional time through line animation
          const progress = (i + 0.5) / numPoints;
          const dotAppearTime = lineDuration * progress;

          // Pop animation: scale 0 → 1.3 → 1 with glow
          tl.to(dot, {
            opacity: 1,
            scale: 1.3,
            duration: 0.12,
            ease: "back.out(2)",
          }, `lineStart+=${dotAppearTime}`);

          // Settle to final scale
          tl.to(dot, {
            scale: 1,
            duration: 0.15,
            ease: "power2.out",
          }, ">");
        });
      }

      tl.to({}, { duration: 1.2 });

      // Line Exit
      if (lineDotsGroup) {
        const dots = lineDotsGroup.querySelectorAll("circle");
        tl.to(dots, {
          scale: 0,
          y: -8,
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
          stagger: 0.04,
          onStart: () => setCurrentPhase("pie"),
        });
        tl.set(lineDotsGroup, { opacity: 0 });
      }

      tl.to(path, {
        strokeDashoffset: -pathLength,
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
      }, "<0.1");

      // ═══════════════════════════════════════════════════════════════════════
      // PIE CHART - "Radial Unfold" Entry (Premium)
      //
      // - Fatias nascem do centro com scale 0 + rotation -90deg
      // - Expansão com elastic overshoot (back.out)
      // - Stagger ~80ms começando pela MAIOR fatia
      // ═══════════════════════════════════════════════════════════════════════
      if (pieGroup) {
        const slices = pieGroup.querySelectorAll("path");

        // Show group
        tl.set(pieGroup, { opacity: 1, rotation: 0, svgOrigin: `${cx} ${cy}` });

        // Initial state - collapsed at center with -90deg rotation
        tl.set(slices, {
          scale: 0,
          rotation: -90,
          opacity: 0,
          svgOrigin: `${cx} ${cy}`,
        });

        // Get slices ordered by size (largest first)
        const orderedSlices = chartData.largestFirst
          .map(i => slices[i])
          .filter((s): s is SVGPathElement => s !== undefined);

        // Animate each slice with stagger - elastic unfold
        orderedSlices.forEach((slice, i) => {
          const delay = i * 0.08; // 80ms stagger

          // Combined animation with back.out for elastic overshoot
          tl.to(slice, {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.55,
            ease: "back.out(1.7)",
          }, delay === 0 ? undefined : `<${delay}`);
        });

        tl.to({}, { duration: 1.6 });

        // ═══════════════════════════════════════════════════════════════════════
        // PIE CHART - "Collapse & Spin" Exit (Premium)
        //
        // - Rotação coletiva 15deg acelerando (sendo "sugado")
        // - Fatias MENORES colapsam primeiro
        // - Fade out nos últimos 30%
        // ═══════════════════════════════════════════════════════════════════════

        const exitSlices = chartData.smallestFirst
          .map(i => slices[i])
          .filter((s): s is SVGPathElement => s !== undefined);

        // Collective spin acceleration (being sucked to center)
        tl.to(pieGroup, {
          rotation: 15,
          duration: 0.7,
          ease: "power3.in",
        });

        // Each slice collapses with stagger (smallest first)
        exitSlices.forEach((slice, i) => {
          const delay = i * 0.06;

          tl.to(slice, {
            scale: 0,
            rotation: 30,
            duration: 0.4,
            ease: "power3.in",
          }, delay === 0 ? "<" : `<${delay}`);
        });

        // Fade out in last 30%
        tl.to(slices, {
          opacity: 0,
          duration: 0.15,
        }, ">-0.2");

        // Reset
        tl.set(pieGroup, { opacity: 0, rotation: 0 });
        tl.set(slices, { opacity: 1, scale: 1, rotation: 0 });
      }

      // Reset bars for next cycle
      if (barsGroup) {
        const rects = barsGroup.querySelectorAll("rect");
        rects.forEach((rect) => {
          const originalY = rect.dataset.originalY || "0";
          const originalHeight = rect.dataset.originalHeight || "0";
          tl.set(rect, { attr: { y: parseFloat(originalY), height: parseFloat(originalHeight) } });
        });
      }

      // Reset line for next cycle
      tl.set(path, { opacity: 0, y: 0, strokeDashoffset: pathLength });
      if (lineDotsGroup) {
        const dots = lineDotsGroup.querySelectorAll("circle");
        tl.set(dots, { y: 0, opacity: 1, scale: 0 });
      }

      timelineRef.current = tl;

      if (autoPlay) {
        tl.play();
        setIsPlaying(true);
      } else {
        tl.pause();
      }
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      timelineRef.current?.kill();
      timelineRef.current = null;
    };
  }, [autoPlay, chartData, cx, cy]);

  const play = useCallback(() => {
    timelineRef.current?.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    timelineRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const restart = useCallback(() => {
    timelineRef.current?.restart();
    setIsPlaying(true);
  }, []);

  return {
    pathRef,
    lineDotsRef,
    barsRef,
    pieRef,
    currentPhase,
    progress,
    isPlaying,
    play,
    pause,
    restart,
  };
}

export function useChartData(
  data: readonly number[],
  width: number,
  height: number,
  padding: number = 40
) {
  return useMemo(() => {
    const dimensions: ChartDimensions = { width, height, padding };
    const points = normalizeData(data, dimensions);
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.35;

    return {
      points,
      barPaths: generateBarPaths(data, dimensions),
      pieSlices: generatePieSlices(data, cx, cy, radius),
      cx,
      cy,
    };
  }, [data, width, height, padding]);
}
