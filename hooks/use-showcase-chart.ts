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
const BLUR_AMOUNT = "blur(8px)";
const BLUR_NONE = "blur(0px)";

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
            // Blur + scale exit for premium cross-fade
            tl.to(
              barsGroup,
              {
                filter: BLUR_AMOUNT,
                scale: 0.95,
                duration: 0.35,
                ease: "power2.inOut",
              },
              0
            );
            tl.to(
              bars,
              {
                scaleY: 0,
                duration: 0.4,
                ease: "power2.in",
                stagger: 0.04,
              },
              0
            );
            tl.to(
              barsGroup,
              {
                opacity: 0,
                duration: 0.2,
              },
              0.25
            );
            tl.set(barsGroup, { filter: BLUR_NONE, scale: 1 }, 0.45);
          }
          break;
        }

        case "area": {
          // "Dissolve Trail" exit with blur cross-fade
          const linePath = linePathRef.current;
          const lineDotsGroup = lineDotsRef.current;
          const areaPath = areaPathRef.current;

          // Apply blur to all area elements simultaneously
          if (lineDotsGroup) {
            tl.to(
              lineDotsGroup,
              {
                filter: BLUR_AMOUNT,
                duration: 0.3,
                ease: "power2.inOut",
              },
              0
            );
          }

          // Dots exit with scale down + float up
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
                stagger: 0.04,
              },
              0
            );
            tl.set(lineDotsGroup, { opacity: 0, filter: BLUR_NONE }, 0.35);
          }

          // Line evaporates with blur
          if (linePath) {
            tl.to(
              linePath,
              {
                filter: BLUR_AMOUNT,
                strokeDashoffset: -1200,
                opacity: 0,
                y: -8,
                duration: 0.5,
                ease: EASE_OUT,
              },
              0
            );
            tl.set(linePath, { filter: BLUR_NONE }, 0.5);
          }

          // Area fades with blur
          if (areaPath) {
            tl.to(
              areaPath,
              {
                filter: BLUR_AMOUNT,
                scaleY: 0,
                opacity: 0,
                duration: 0.4,
                ease: EASE_OUT,
              },
              0
            );
            tl.set(areaPath, { filter: BLUR_NONE }, 0.4);
          }
          break;
        }

        case "pie": {
          // ═══════════════════════════════════════════════════════════════════════
          // PIE CHART - "Collapse & Spin" Exit with blur cross-fade
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

            // Blur + spin for premium exit
            tl.to(pieGroup, {
              filter: BLUR_AMOUNT,
              scale: 0.95,
              rotation: 15,
              duration: 0.5,
              ease: "power3.in",
            }, 0);

            // Each slice collapses with stagger (smallest first)
            exitSlices.forEach((slice, i) => {
              const delay = i * 0.05;

              tl.to(slice, {
                scale: 0,
                rotation: 30,
                duration: 0.35,
                ease: "power3.in",
              }, delay === 0 ? 0 : delay);
            });

            // Fade out
            tl.to(pieGroup, {
              opacity: 0,
              duration: 0.15,
            }, 0.3);

            // Reset
            tl.set(pieGroup, { opacity: 0, rotation: 0, scale: 1, filter: BLUR_NONE, svgOrigin: `${cx} ${cy}` });
            tl.set(slices, { opacity: 1, scale: 1, rotation: 0, svgOrigin: `${cx} ${cy}` });
          }
          break;
        }

        case "radar": {
          // ═══════════════════════════════════════════════════════════════════════
          // RADAR CHART - "Retract & Fade" Exit with blur cross-fade
          // ═══════════════════════════════════════════════════════════════════════
          const radarGroup = radarRef.current;
          const cx = chartData.cx;
          const cy = chartData.cy;

          if (radarGroup) {
            const polygon = radarGroup.querySelector(".radar-polygon");
            const grid = radarGroup.querySelectorAll(".radar-grid");
            const axes = radarGroup.querySelectorAll(".radar-axis");
            const dots = radarGroup.querySelectorAll(".radar-dot");

            // Blur the entire group for premium exit
            tl.to(
              radarGroup,
              {
                filter: BLUR_AMOUNT,
                scale: 0.95,
                duration: 0.4,
                ease: "power2.inOut",
              },
              0
            );

            // Dots fade out first (quick)
            tl.to(
              dots,
              {
                scale: 0.5,
                opacity: 0,
                duration: 0.2,
                stagger: 0.02,
                ease: "power2.in",
              },
              0
            );

            // Polygon contracts
            tl.to(
              polygon,
              {
                scale: 0,
                opacity: 0,
                strokeWidth: 3,
                duration: 0.4,
                ease: "power2.in",
                svgOrigin: `${cx} ${cy}`,
              },
              0.05
            );

            // Grid and axes fade
            tl.to(
              [grid, axes],
              {
                opacity: 0,
                duration: 0.25,
              },
              0.2
            );

            // Final fade and reset
            tl.to(
              radarGroup,
              {
                opacity: 0,
                duration: 0.15,
              },
              0.35
            );

            tl.set(radarGroup, { opacity: 0, filter: BLUR_NONE, scale: 1 }, 0.5);
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
          // Elastic rise with blur-to-sharp transition
          const barsGroup = barsRef.current;
          if (barsGroup) {
            const bars = barsGroup.querySelectorAll("rect");
            // Start blurred and scaled up slightly
            tl.set(barsGroup, {
              opacity: 1,
              filter: BLUR_AMOUNT,
              scale: 1.05,
            }, startTime);
            tl.set(
              bars,
              {
                scaleY: 0,
                opacity: 1,
                transformOrigin: "50% 100%",
              },
              startTime
            );
            // Sharpen as bars animate
            tl.to(
              barsGroup,
              {
                filter: BLUR_NONE,
                scale: 1,
                duration: 0.5,
                ease: "power2.out",
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
          // "Ink Flow" entry with blur-to-sharp transition
          const linePath = linePathRef.current;
          const lineDotsGroup = lineDotsRef.current;
          const areaPath = areaPathRef.current;
          const pathLength = 1200;
          const lineDuration = 1.2;
          const numPoints = chartData.points.length;

          // Setup line for draw animation with initial blur
          if (linePath) {
            tl.set(
              linePath,
              {
                opacity: 1,
                filter: BLUR_AMOUNT,
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength,
                y: 0,
              },
              startTime
            );

            // Sharpen as line draws
            tl.to(
              linePath,
              {
                filter: BLUR_NONE,
                duration: 0.5,
                ease: "power2.out",
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

            tl.set(lineDotsGroup, { opacity: 1, filter: BLUR_NONE }, startTime);
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

          // Area scales up from baseline with blur
          if (areaPath) {
            tl.set(
              areaPath,
              {
                opacity: 0,
                scaleY: 0,
                filter: BLUR_AMOUNT,
                transformOrigin: `center bottom`,
              },
              startTime
            );
            tl.to(
              areaPath,
              {
                opacity: 0.6,
                scaleY: 1,
                filter: BLUR_NONE,
                duration: 0.9,
                ease: EASE_IN,
              },
              startTime + 0.2
            );
          }
          break;
        }

        case "pie": {
          // ═══════════════════════════════════════════════════════════════════════
          // PIE CHART - "Radial Unfold" Entry with blur-to-sharp
          // ═══════════════════════════════════════════════════════════════════════
          const pieGroup = pieRef.current;
          const cx = chartData.cx;
          const cy = chartData.cy;

          if (pieGroup) {
            const slices = pieGroup.querySelectorAll("path");

            // Start blurred and scaled up
            tl.set(pieGroup, {
              opacity: 1,
              rotation: 0,
              filter: BLUR_AMOUNT,
              scale: 1.05,
              svgOrigin: `${cx} ${cy}`,
            }, startTime);

            // Initial state - collapsed at center with -90deg rotation
            tl.set(slices, {
              scale: 0,
              rotation: -90,
              opacity: 0,
              svgOrigin: `${cx} ${cy}`,
            }, startTime);

            // Sharpen as pie unfolds
            tl.to(pieGroup, {
              filter: BLUR_NONE,
              scale: 1,
              duration: 0.5,
              ease: "power2.out",
            }, startTime);

            // Get slices ordered by size (largest first)
            const orderedSlices = chartData.largestFirst
              .map(i => slices[i])
              .filter((s): s is SVGPathElement => s !== undefined);

            // Animate each slice with stagger - elastic unfold
            orderedSlices.forEach((slice, i) => {
              const delay = startTime + i * 0.07; // 70ms stagger

              // Combined animation with back.out for elastic overshoot
              tl.to(slice, {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 0.55,
                ease: "back.out(1.7)",
              }, delay);
            });
          }
          break;
        }

        case "radar": {
          // ═══════════════════════════════════════════════════════════════════════
          // RADAR CHART - "Pulse Expansion" Entry with blur-to-sharp
          // ═══════════════════════════════════════════════════════════════════════
          const radarGroup = radarRef.current;
          const cx = chartData.cx;
          const cy = chartData.cy;

          if (radarGroup) {
            const polygon = radarGroup.querySelector(".radar-polygon");
            const grid = radarGroup.querySelectorAll(".radar-grid");
            const axes = radarGroup.querySelectorAll(".radar-axis");
            const dots = radarGroup.querySelectorAll(".radar-dot");

            // Start blurred and scaled up
            tl.set(radarGroup, {
              opacity: 1,
              filter: BLUR_AMOUNT,
              scale: 1.05,
            }, startTime);

            // Sharpen the group
            tl.to(
              radarGroup,
              {
                filter: BLUR_NONE,
                scale: 1,
                duration: 0.5,
                ease: "power2.out",
              },
              startTime
            );

            // Grid/web fades in FIRST
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

            // Grid rings fade in
            tl.to(
              grid,
              {
                opacity: 0.3,
                duration: 0.3,
                stagger: 0.05,
              },
              startTime
            );

            // Polygon expands in waves after grid
            const polygonStart = startTime + 0.25;

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
                duration: 0.22,
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
                duration: 0.16,
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
                duration: 0.12,
                ease: "power2.out",
              },
              ">"
            );

            // Settle to final position
            tl.to(
              polygon,
              {
                scale: 1,
                duration: 0.1,
                ease: "power2.inOut",
              },
              ">"
            );

            // Dots anchor when polygon settles
            const dotsAnchorTime = polygonStart + 0.22 + 0.16 + 0.12;

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

  // Handle chart transitions with blur cross-fade
  useEffect(() => {
    const prevChart = prevChartRef.current;

    if (prevChart === activeChart) return;

    animationRef.current?.kill();

    const tl = gsap.timeline();

    // If there was a previous chart, animate it out with blur
    if (prevChart) {
      exitChart(prevChart, tl);
    }

    // Hide all other charts (not the previous or current)
    const { cx, cy } = chartData;
    if (barsRef.current && activeChart !== "bar" && prevChart !== "bar") {
      gsap.set(barsRef.current, { opacity: 0, filter: BLUR_NONE, scale: 1 });
    }
    if (linePathRef.current && activeChart !== "area" && prevChart !== "area") {
      gsap.set(linePathRef.current, { opacity: 0, y: 0, filter: BLUR_NONE });
    }
    if (lineDotsRef.current && activeChart !== "area" && prevChart !== "area") {
      gsap.set(lineDotsRef.current, { opacity: 0, filter: BLUR_NONE });
    }
    if (areaPathRef.current && activeChart !== "area" && prevChart !== "area") {
      gsap.set(areaPathRef.current, { opacity: 0, scaleY: 0, filter: BLUR_NONE });
    }
    if (pieRef.current && activeChart !== "pie" && prevChart !== "pie") {
      gsap.set(pieRef.current, { opacity: 0, rotation: 0, filter: BLUR_NONE, scale: 1, svgOrigin: `${cx} ${cy}` });
      const slices = pieRef.current.querySelectorAll("path");
      gsap.set(slices, { scale: 0, opacity: 0, rotation: 0, svgOrigin: `${cx} ${cy}` });
    }
    if (radarRef.current && activeChart !== "radar" && prevChart !== "radar") {
      gsap.set(radarRef.current, { opacity: 0, filter: BLUR_NONE, scale: 1 });
    }

    // Start entry animation with overlap (0.15s after exit starts)
    const overlapTime = prevChart ? 0.15 : 0;
    enterChart(activeChart, tl, overlapTime);

    animationRef.current = tl;
    prevChartRef.current = activeChart;

    return () => {
      animationRef.current?.kill();
    };
  }, [activeChart, enterChart, exitChart, chartData]);

  // Initial setup
  useEffect(() => {
    const { cx, cy } = chartData;
    hideAllExcept(activeChart, cx, cy);

    // Setup and show active chart with no blur
    if (activeChart === "bar" && barsRef.current) {
      const bars = barsRef.current.querySelectorAll("rect");
      gsap.set(barsRef.current, { opacity: 1, filter: BLUR_NONE, scale: 1 });
      gsap.set(bars, { scaleY: 1, transformOrigin: "50% 100%" });
    }
    if (activeChart === "area") {
      if (linePathRef.current) {
        gsap.set(linePathRef.current, {
          opacity: 1,
          filter: BLUR_NONE,
          strokeDasharray: 1200,
          strokeDashoffset: 0,
          y: 0,
        });
      }
      if (lineDotsRef.current) {
        const dots = lineDotsRef.current.querySelectorAll("circle");
        gsap.set(lineDotsRef.current, { opacity: 1, filter: BLUR_NONE });
        gsap.set(dots, { scale: 1, y: 0, opacity: 1 });
      }
      if (areaPathRef.current) {
        gsap.set(areaPathRef.current, {
          opacity: 0.6,
          filter: BLUR_NONE,
          scaleY: 1,
          transformOrigin: "center bottom",
        });
      }
    }
    if (activeChart === "pie") {
      if (pieRef.current) {
        const slices = pieRef.current.querySelectorAll("path");
        gsap.set(pieRef.current, { opacity: 1, rotation: 0, filter: BLUR_NONE, scale: 1, svgOrigin: `${cx} ${cy}` });
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
      gsap.set(radarRef.current, { opacity: 1, filter: BLUR_NONE, scale: 1 });
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
