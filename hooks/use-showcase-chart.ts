"use client";

import { useRef, useEffect, useMemo, useCallback } from "react";
import { gsap } from "@/lib/gsap-config";
import {
  normalizeData,
  generateAreaPath,
  generateSmoothLinePath,
  generateBarPaths,
  generatePieSlices,
  generateRadarPolygonPath,
  generateRadarGridPath,
  generateRadarAxisPath,
  DEFAULT_DATA,
  type ChartDimensions,
} from "@/lib/chart-paths";

export type ShowcaseChartType = "bar" | "area" | "pie" | "radar";

interface UseShowcaseChartConfig {
  activeChart: ShowcaseChartType;
  width: number;
  height: number;
  padding?: number;
}

interface UseShowcaseChartReturn {
  linePathRef: React.RefObject<SVGPathElement | null>;
  lineDotsRef: React.RefObject<SVGGElement | null>;
  areaPathRef: React.RefObject<SVGPathElement | null>;
  barsRef: React.RefObject<SVGGElement | null>;
  pieRef: React.RefObject<SVGGElement | null>;
  radarRef: React.RefObject<SVGGElement | null>;
  chartData: {
    cx: number;
    cy: number;
    radius: number;
    baseline: number;
    linePath: string;
    areaPath: string;
    barPaths: string[];
    pieSlices: string[];
    radarPath: string;
    radarGridPaths: string[];
    radarAxisPaths: string[];
    points: { x: number; y: number; value: number }[];
    largestFirst: number[];
    smallestFirst: number[];
  };
}

// Animation constants
const DURATION = 0.7;
const STAGGER = 0.1;
const EASE_IN = "power2.out";
const EASE_OUT = "power2.inOut";

// Radar data (6 points for hexagon)
const RADAR_DATA = [75, 90, 60, 85, 70, 80] as const;
const RADAR_AXES = 6;
const RADAR_GRID_LEVELS = 4;

/**
 * Premium Showcase Chart Animation Hook
 *
 * Animation Patterns:
 *
 * LINE CHART:
 * - Entry "Ink Flow": Progressive draw with dots appearing as line reaches them
 * - Exit "Dissolve Trail": Evaporates left to right with blur + translateY
 *
 * PIE CHART:
 * - Entry "Radial Unfold": Scale from center + rotation, stagger from largest
 * - Exit "Collapse & Spin": Collapse with spin, smaller slices exit first
 *
 * RADAR CHART:
 * - Entry "Pulse Expansion": Polygon expands in pulses (spring physics), grid first
 * - Exit "Retract & Fade": Contract with thickening stroke, grid fades last
 */
export function useShowcaseChart(
  config: UseShowcaseChartConfig
): UseShowcaseChartReturn {
  const { activeChart, width, height, padding = 40 } = config;

  const linePathRef = useRef<SVGPathElement>(null);
  const lineDotsRef = useRef<SVGGElement>(null);
  const areaPathRef = useRef<SVGPathElement>(null);
  const barsRef = useRef<SVGGElement>(null);
  const pieRef = useRef<SVGGElement>(null);
  const radarRef = useRef<SVGGElement>(null);
  const prevChartRef = useRef<ShowcaseChartType | null>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);

  // Generate chart data
  const chartData = useMemo(() => {
    const dimensions: ChartDimensions = { width, height, padding };
    const points = normalizeData(DEFAULT_DATA, dimensions);
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.35;
    const baseline = height - padding;

    // Sort pie slices by value for stagger ordering
    const dataWithIndex = [...DEFAULT_DATA].map((value, index) => ({
      value,
      index,
    }));
    const sortedDesc = [...dataWithIndex].sort((a, b) => b.value - a.value);
    const sortedAsc = [...dataWithIndex].sort((a, b) => a.value - b.value);

    // Radar grid and axis paths
    const radarGridPaths = Array.from({ length: RADAR_GRID_LEVELS }).map(
      (_, i) =>
        generateRadarGridPath(cx, cy, radius, RADAR_AXES, i + 1, RADAR_GRID_LEVELS)
    );

    const radarAxisPaths = Array.from({ length: RADAR_AXES }).map((_, i) =>
      generateRadarAxisPath(cx, cy, radius, i, RADAR_AXES)
    );

    return {
      cx,
      cy,
      radius,
      baseline,
      linePath: generateSmoothLinePath(points),
      areaPath: generateAreaPath(points, baseline),
      barPaths: generateBarPaths(DEFAULT_DATA, dimensions),
      pieSlices: generatePieSlices(DEFAULT_DATA, cx, cy, radius),
      radarPath: generateRadarPolygonPath(RADAR_DATA, cx, cy, radius),
      radarGridPaths,
      radarAxisPaths,
      points,
      largestFirst: sortedDesc.map((d) => d.index),
      smallestFirst: sortedAsc.map((d) => d.index),
    };
  }, [width, height, padding]);

  // Premium exit animations
  const exitChart = useCallback(
    (chartType: ShowcaseChartType, tl: gsap.core.Timeline) => {
      switch (chartType) {
        case "bar": {
          const barsGroup = barsRef.current;
          if (barsGroup) {
            const bars = barsGroup.querySelectorAll("rect");
            tl.to(
              bars,
              {
                scaleY: 0,
                duration: 0.5,
                ease: "power2.in",
                stagger: 0.06,
              },
              0
            );
            tl.set(barsGroup, { opacity: 0 }, 0.5);
          }
          break;
        }

        case "area": {
          // "Dissolve Trail" exit - evaporate with blur + translateY
          const linePath = linePathRef.current;
          const lineDotsGroup = lineDotsRef.current;
          const areaPath = areaPathRef.current;

          // Dots exit first with scale down + float up
          if (lineDotsGroup) {
            const dots = lineDotsGroup.querySelectorAll("circle");
            tl.to(
              dots,
              {
                scale: 0,
                y: -8,
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
                stagger: 0.05,
              },
              0
            );
            tl.set(lineDotsGroup, { opacity: 0 }, 0.35);
          }

          // Line evaporates left to right
          if (linePath) {
            tl.to(
              linePath,
              {
                strokeDashoffset: -1200,
                opacity: 0,
                y: -8,
                duration: 0.6,
                ease: EASE_OUT,
              },
              0.1
            );
          }

          // Area fades
          if (areaPath) {
            tl.to(
              areaPath,
              {
                scaleY: 0,
                opacity: 0,
                duration: 0.5,
                ease: EASE_OUT,
              },
              0
            );
          }
          break;
        }

        case "pie": {
          // ═══════════════════════════════════════════════════════════════════════
          // PIE CHART - "Collapse & Spin" Exit
          // EXACTLY matches hero's use-morphing-chart.ts pattern
          // ═══════════════════════════════════════════════════════════════════════
          const pieGroup = pieRef.current;
          const cx = chartData.cx;
          const cy = chartData.cy;

          if (pieGroup) {
            const slices = pieGroup.querySelectorAll("path");

            // Get slices ordered by size (smallest first for exit)
            const exitSlices = chartData.smallestFirst
              .map(i => slices[i])
              .filter((s): s is SVGPathElement => s !== undefined);

            // Collective spin acceleration (being sucked to center)
            tl.to(pieGroup, {
              rotation: 15,
              duration: 0.7,
              ease: "power3.in",
            });

            // Each slice collapses with stagger (smallest first) - EXACT hero pattern
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
            tl.set(pieGroup, { opacity: 0, rotation: 0, svgOrigin: `${cx} ${cy}` });
            tl.set(slices, { opacity: 1, scale: 1, rotation: 0, svgOrigin: `${cx} ${cy}` });
          }
          break;
        }

        case "radar": {
          // ═══════════════════════════════════════════════════════════════════════
          // RADAR CHART - "Retract & Fade" Exit (Premium)
          //
          // - Polygon contracts smoothly while opacity decreases
          // - Stroke thickens 2 → 3 during contraction ("energy concentrating")
          // - Grid fades out LAST, 150ms after polygon finishes
          // ═══════════════════════════════════════════════════════════════════════
          const radarGroup = radarRef.current;
          const cx = chartData.cx;
          const cy = chartData.cy;

          if (radarGroup) {
            const polygon = radarGroup.querySelector(".radar-polygon");
            const grid = radarGroup.querySelectorAll(".radar-grid");
            const axes = radarGroup.querySelectorAll(".radar-axis");
            const dots = radarGroup.querySelectorAll(".radar-dot");

            // ─────────────────────────────────────────────────────────────────────
            // STEP 1: Dots fade out first (quick)
            // ─────────────────────────────────────────────────────────────────────
            tl.to(
              dots,
              {
                scale: 0.5,
                opacity: 0,
                duration: 0.2,
                stagger: 0.03,
                ease: "power2.in",
              },
              0
            );

            // ─────────────────────────────────────────────────────────────────────
            // STEP 2: Polygon contracts with stroke thickening (2 → 3)
            // Creates "energy concentrating" effect before disappearing
            // ─────────────────────────────────────────────────────────────────────
            tl.to(
              polygon,
              {
                scale: 0,
                opacity: 0,
                strokeWidth: 3, // Thickens from 2 → 3
                duration: 0.5,
                ease: "power2.in",
                svgOrigin: `${cx} ${cy}`,
              },
              0.1
            );

            // ─────────────────────────────────────────────────────────────────────
            // STEP 3: Grid fades out LAST (150ms after polygon finishes)
            // Polygon finishes at 0.1 + 0.5 = 0.6, grid starts at 0.75
            // ─────────────────────────────────────────────────────────────────────
            const gridFadeStart = 0.6 + 0.15; // 150ms after polygon

            tl.to(
              grid,
              {
                opacity: 0,
                duration: 0.25,
                stagger: -0.03, // Reverse stagger (outer first)
              },
              gridFadeStart
            );

            // Axes fade with grid
            tl.to(
              axes,
              {
                opacity: 0,
                duration: 0.25,
              },
              gridFadeStart
            );

            tl.set(radarGroup, { opacity: 0 }, gridFadeStart + 0.25);
          }
          break;
        }
      }
    },
    [chartData]
  );

  // Premium enter animations
  const enterChart = useCallback(
    (chartType: ShowcaseChartType, tl: gsap.core.Timeline, startTime: number) => {
      switch (chartType) {
        case "bar": {
          // Elastic rise with overshoot
          const barsGroup = barsRef.current;
          if (barsGroup) {
            const bars = barsGroup.querySelectorAll("rect");
            tl.set(barsGroup, { opacity: 1 }, startTime);
            tl.set(
              bars,
              {
                scaleY: 0,
                opacity: 1,
                transformOrigin: "50% 100%",
              },
              startTime
            );
            tl.to(
              bars,
              {
                scaleY: 1,
                duration: 0.8,
                ease: "back.out(1.7)",
                stagger: STAGGER,
              },
              startTime
            );
          }
          break;
        }

        case "area": {
          // "Ink Flow" entry - progressive draw with dots synchronized
          const linePath = linePathRef.current;
          const lineDotsGroup = lineDotsRef.current;
          const areaPath = areaPathRef.current;
          const pathLength = 1200;
          const lineDuration = 1.4;
          const numPoints = chartData.points.length;

          // Setup line for draw animation
          if (linePath) {
            tl.set(
              linePath,
              {
                opacity: 1,
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength,
                y: 0,
              },
              startTime
            );

            // Draw line progressively
            tl.to(
              linePath,
              {
                strokeDashoffset: 0,
                duration: lineDuration,
                ease: "power2.inOut",
              },
              startTime
            );
          }

          // Dots appear SYNCHRONIZED with line as it reaches each point
          if (lineDotsGroup) {
            const dots = lineDotsGroup.querySelectorAll("circle");

            tl.set(lineDotsGroup, { opacity: 1 }, startTime);
            tl.set(dots, {
              scale: 0,
              opacity: 0,
              y: 0,
              transformOrigin: "center center"
            }, startTime);

            dots.forEach((dot, i) => {
              // Dot appears when line reaches its position
              const progress = (i + 0.5) / numPoints;
              const dotAppearTime = startTime + lineDuration * progress;

              // Pop animation: scale 0 → 1.3 → 1
              tl.to(
                dot,
                {
                  opacity: 1,
                  scale: 1.3,
                  duration: 0.15,
                  ease: "back.out(2)",
                },
                dotAppearTime
              );

              // Settle to final scale
              tl.to(
                dot,
                {
                  scale: 1,
                  duration: 0.2,
                  ease: "power2.out",
                },
                ">"
              );
            });
          }

          // Area scales up from baseline
          if (areaPath) {
            tl.set(
              areaPath,
              {
                opacity: 0,
                scaleY: 0,
                transformOrigin: `center bottom`,
              },
              startTime
            );
            tl.to(
              areaPath,
              {
                opacity: 0.6,
                scaleY: 1,
                duration: 1.0,
                ease: EASE_IN,
              },
              startTime + 0.3
            );
          }
          break;
        }

        case "pie": {
          // ═══════════════════════════════════════════════════════════════════════
          // PIE CHART - "Radial Unfold" Entry
          // EXACTLY matches hero's use-morphing-chart.ts pattern
          // ═══════════════════════════════════════════════════════════════════════
          const pieGroup = pieRef.current;
          const cx = chartData.cx;
          const cy = chartData.cy;

          if (pieGroup) {
            const slices = pieGroup.querySelectorAll("path");

            // Show group (no startTime - sequential like hero)
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

            // Animate each slice with stagger - elastic unfold (EXACT hero pattern)
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
          }
          break;
        }

        case "radar": {
          // ═══════════════════════════════════════════════════════════════════════
          // RADAR CHART - "Pulse Expansion" Entry (Premium)
          //
          // - Grid/web fades in FIRST (300ms)
          // - Polygon expands in 2-3 "waves" with spring physics (overshoot)
          // - Vertices (dots) glow momentarily when "anchoring" at final position
          // ═══════════════════════════════════════════════════════════════════════
          const radarGroup = radarRef.current;
          const cx = chartData.cx;
          const cy = chartData.cy;

          if (radarGroup) {
            const polygon = radarGroup.querySelector(".radar-polygon");
            const grid = radarGroup.querySelectorAll(".radar-grid");
            const axes = radarGroup.querySelectorAll(".radar-axis");
            const dots = radarGroup.querySelectorAll(".radar-dot");

            tl.set(radarGroup, { opacity: 1 }, startTime);

            // ─────────────────────────────────────────────────────────────────────
            // STEP 1: Grid/web fades in FIRST (300ms)
            // ─────────────────────────────────────────────────────────────────────
            tl.set(axes, { opacity: 0 }, startTime);
            tl.set(grid, { opacity: 0, scale: 1, svgOrigin: `${cx} ${cy}` }, startTime);

            // Axes fade in
            tl.to(
              axes,
              {
                opacity: 0.4,
                duration: 0.3,
                stagger: 0.03,
              },
              startTime
            );

            // Grid rings fade in (not scale)
            tl.to(
              grid,
              {
                opacity: 0.3,
                duration: 0.3,
                stagger: 0.05,
              },
              startTime
            );

            // ─────────────────────────────────────────────────────────────────────
            // STEP 2: Polygon expands in 2-3 "waves" (spring physics)
            // Starts AFTER grid fades in (300ms)
            // ─────────────────────────────────────────────────────────────────────
            const polygonStart = startTime + 0.3;

            tl.set(
              polygon,
              {
                scale: 0,
                opacity: 0,
                strokeWidth: 2,
                svgOrigin: `${cx} ${cy}`,
              },
              startTime
            );

            // Wave 1: Expand with overshoot
            tl.to(
              polygon,
              {
                scale: 1.12,
                opacity: 0.8,
                duration: 0.25,
                ease: "power2.out",
              },
              polygonStart
            );

            // Wave 2: Contract back
            tl.to(
              polygon,
              {
                scale: 0.92,
                opacity: 0.95,
                duration: 0.18,
                ease: "power2.inOut",
              },
              ">"
            );

            // Wave 3: Slight overshoot again
            tl.to(
              polygon,
              {
                scale: 1.04,
                opacity: 1,
                duration: 0.14,
                ease: "power2.out",
              },
              ">"
            );

            // Settle to final position
            tl.to(
              polygon,
              {
                scale: 1,
                duration: 0.12,
                ease: "power2.inOut",
              },
              ">"
            );

            // ─────────────────────────────────────────────────────────────────────
            // STEP 3: Dots "anchor" with glow when polygon reaches final position
            // ─────────────────────────────────────────────────────────────────────
            const dotsAnchorTime = polygonStart + 0.25 + 0.18 + 0.14; // When polygon settles

            tl.set(
              dots,
              {
                scale: 0,
                opacity: 0,
                transformOrigin: "center center",
              },
              startTime
            );

            // Dots pop in with scale overshoot
            tl.to(
              dots,
              {
                scale: 1.4,
                opacity: 1,
                duration: 0.12,
                stagger: 0.04,
                ease: "back.out(2)",
              },
              dotsAnchorTime
            );

            // Settle to final scale
            tl.to(
              dots,
              {
                scale: 1,
                duration: 0.15,
                stagger: 0.02,
                ease: "power2.out",
              },
              ">"
            );

            // Glow pulse on anchor (momentary)
            tl.to(
              dots,
              {
                filter: "url(#showcase-radar-glow)",
                duration: 0.08,
                stagger: 0.03,
              },
              dotsAnchorTime
            );
            tl.to(
              dots,
              {
                filter: "none",
                duration: 0.25,
                stagger: 0.02,
              },
              ">"
            );
          }
          break;
        }
      }
    },
    [chartData]
  );

  // Hide all charts except the specified one
  const hideAllExcept = useCallback(
    (exceptChart: ShowcaseChartType, cx: number, cy: number) => {
      if (barsRef.current && exceptChart !== "bar") {
        gsap.set(barsRef.current, { opacity: 0 });
      }
      if (linePathRef.current && exceptChart !== "area") {
        gsap.set(linePathRef.current, { opacity: 0, y: 0 });
      }
      if (lineDotsRef.current && exceptChart !== "area") {
        gsap.set(lineDotsRef.current, { opacity: 0 });
      }
      if (areaPathRef.current && exceptChart !== "area") {
        gsap.set(areaPathRef.current, { opacity: 0, scaleY: 0 });
      }
      if (pieRef.current && exceptChart !== "pie") {
        // Always set svgOrigin when hiding to ensure correct transform origin
        gsap.set(pieRef.current, { opacity: 0, rotation: 0, svgOrigin: `${cx} ${cy}` });
        const slices = pieRef.current.querySelectorAll("path");
        gsap.set(slices, { scale: 0, opacity: 0, rotation: 0, svgOrigin: `${cx} ${cy}` });
      }
      if (radarRef.current && exceptChart !== "radar") {
        gsap.set(radarRef.current, { opacity: 0 });
      }
    },
    []
  );

  // Handle chart transitions
  useEffect(() => {
    const prevChart = prevChartRef.current;

    if (prevChart === activeChart) return;

    animationRef.current?.kill();
    hideAllExcept(activeChart, chartData.cx, chartData.cy);

    const tl = gsap.timeline();
    enterChart(activeChart, tl, 0);

    animationRef.current = tl;
    prevChartRef.current = activeChart;

    return () => {
      animationRef.current?.kill();
    };
  }, [activeChart, enterChart, hideAllExcept, chartData.cx, chartData.cy]);

  // Initial setup
  useEffect(() => {
    const { cx, cy } = chartData;
    hideAllExcept(activeChart, cx, cy);

    // Setup and show active chart
    if (activeChart === "bar" && barsRef.current) {
      const bars = barsRef.current.querySelectorAll("rect");
      gsap.set(barsRef.current, { opacity: 1 });
      gsap.set(bars, { scaleY: 1, transformOrigin: "50% 100%" });
    }
    if (activeChart === "area") {
      if (linePathRef.current) {
        gsap.set(linePathRef.current, {
          opacity: 1,
          strokeDasharray: 1200,
          strokeDashoffset: 0,
          y: 0,
        });
      }
      if (lineDotsRef.current) {
        const dots = lineDotsRef.current.querySelectorAll("circle");
        gsap.set(lineDotsRef.current, { opacity: 1 });
        gsap.set(dots, { scale: 1, y: 0, opacity: 1 });
      }
      if (areaPathRef.current) {
        gsap.set(areaPathRef.current, {
          opacity: 0.6,
          scaleY: 1,
          transformOrigin: "center bottom",
        });
      }
    }
    if (activeChart === "pie") {
      if (pieRef.current) {
        const slices = pieRef.current.querySelectorAll("path");
        gsap.set(pieRef.current, { opacity: 1, rotation: 0, svgOrigin: `${cx} ${cy}` });
        gsap.set(slices, {
          scale: 1,
          rotation: 0,
          opacity: 1,
          svgOrigin: `${cx} ${cy}`,
        });
      }
    }
    if (activeChart === "radar" && radarRef.current) {
      const polygon = radarRef.current.querySelector(".radar-polygon");
      const grid = radarRef.current.querySelectorAll(".radar-grid");
      const axes = radarRef.current.querySelectorAll(".radar-axis");
      const dots = radarRef.current.querySelectorAll(".radar-dot");
      gsap.set(radarRef.current, { opacity: 1 });
      gsap.set(polygon, {
        scale: 1,
        opacity: 1,
        strokeWidth: 2,
        svgOrigin: `${cx} ${cy}`,
      });
      gsap.set(grid, {
        scale: 1,
        opacity: 0.3,
        svgOrigin: `${cx} ${cy}`,
      });
      gsap.set(axes, { opacity: 0.4 });
      gsap.set(dots, { scale: 1, opacity: 1 });
    }

    prevChartRef.current = activeChart;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    linePathRef,
    lineDotsRef,
    areaPathRef,
    barsRef,
    pieRef,
    radarRef,
    chartData,
  };
}
