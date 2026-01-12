"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMorphingChart, useChartData, type ChartPhase } from "@/hooks";
import { CHART_COLORS, DEFAULT_DATA } from "@/lib/chart-paths";
import { cn } from "@/lib/utils";

interface MorphingChartProps {
  className?: string;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  showLabel?: boolean;
}

const PHASE_LABELS: Record<ChartPhase, string> = {
  bar: "Bar Chart",
  line: "Line Chart",
  pie: "Pie Chart",
};

/**
 * Ultra-Smooth Morphing Chart Component
 *
 * Architecture:
 * - Single path for line chart with strokeDasharray animation
 * - Separate <circle> elements for line dots (animated with stagger)
 * - Separate <rect> elements for bars (animated with stagger)
 * - Separate <path> elements for pie slices (animated with stagger)
 */
export function MorphingChart({
  className,
  width = 400,
  height = 300,
  autoPlay = true,
  showLabel = true,
}: MorphingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width, height });

  // Responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width: w, height: h } = entry.contentRect;
        const size = Math.min(w, h * 1.33);
        setContainerSize({
          width: size,
          height: size * 0.75,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const padding = 40;

  const {
    pathRef,
    lineDotsRef,
    barsRef,
    pieRef,
    currentPhase,
    isPlaying,
  } = useMorphingChart({
    width: containerSize.width,
    height: containerSize.height,
    autoPlay,
    padding,
  });

  // Get chart data for rendering bars and pie
  const chartData = useChartData(
    DEFAULT_DATA,
    containerSize.width,
    containerSize.height,
    padding
  );

  const label = PHASE_LABELS[currentPhase];

  // Calculate bar dimensions directly
  const bars = useMemo(() => {
    const maxValue = Math.max(...DEFAULT_DATA);
    const usableWidth = containerSize.width - 2 * padding;
    const usableHeight = containerSize.height - 2 * padding;
    const barWidth = (usableWidth / DEFAULT_DATA.length) * 0.6;
    const gap = (usableWidth / DEFAULT_DATA.length) * 0.4;
    const baseline = containerSize.height - padding;

    return DEFAULT_DATA.map((value, i) => {
      const barHeight = (value / maxValue) * usableHeight;
      const x = padding + i * (barWidth + gap) + gap / 2;
      const y = baseline - barHeight;

      return { x, y, w: barWidth, h: barHeight, baseline, key: i };
    });
  }, [containerSize.width, containerSize.height, padding]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center justify-center",
        className
      )}
    >
      <motion.svg
        width={containerSize.width}
        height={containerSize.height}
        viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <defs>
          <linearGradient
            id="morphing-area-gradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={CHART_COLORS.areaGradient.start} />
            <stop offset="100%" stopColor={CHART_COLORS.areaGradient.end} />
          </linearGradient>

          <linearGradient
            id="morphing-line-glow"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="transparent" />
            <stop offset="85%" stopColor="transparent" />
            <stop offset="100%" stopColor={CHART_COLORS.stroke} stopOpacity="0.6" />
          </linearGradient>

          <filter id="morphing-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feOffset in="blur" dx="0" dy="4" result="offsetBlur" />
            <feFlood floodOpacity="0.08" result="color" />
            <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="dot-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="dissolve-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="blur" />
          </filter>

          <filter id="pie-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
            <feFlood floodOpacity="0.15" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          ref={pathRef}
          opacity={0}
          fill="none"
          stroke={CHART_COLORS.stroke}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#morphing-filter)"
        />

        <g ref={lineDotsRef} opacity={0}>
          {chartData.points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={6}
              fill="var(--background)"
              stroke={CHART_COLORS.stroke}
              strokeWidth={2.5}
              filter="url(#dot-glow)"
            />
          ))}
        </g>

        <g ref={barsRef} opacity={0}>
          {bars.map((bar) => bar && (
            <rect
              key={bar.key}
              x={bar.x}
              y={bar.y}
              width={bar.w}
              height={bar.h}
              rx={4}
              fill={CHART_COLORS.areaGradient.start}
              stroke={CHART_COLORS.stroke}
              strokeWidth={1}
            />
          ))}
        </g>

        <g ref={pieRef} opacity={0}>
          {chartData.pieSlices.map((pathStr: string, i: number) => (
            <path
              key={i}
              d={pathStr}
              fill={CHART_COLORS.areaGradient.start}
              stroke={CHART_COLORS.stroke}
              strokeWidth={1}
              filter="url(#morphing-filter)"
            />
          ))}
        </g>
      </motion.svg>

      {showLabel && (
        <AnimatePresence mode="wait">
          {label && (
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <span className="rounded-full bg-muted/60 px-4 py-1.5 text-xs font-medium text-muted-foreground/80 backdrop-blur-md">
                {label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <span className="sr-only">
        {isPlaying ? "Chart animation playing" : "Chart animation paused"}
        {label && `, currently showing ${label}`}
      </span>
    </div>
  );
}
