"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useShowcaseChart, type ShowcaseChartType } from "@/hooks";
import { CHART_COLORS, DEFAULT_DATA } from "@/lib/chart-paths";
import { cn } from "@/lib/utils";

interface ShowcaseChartProps {
  activeChart: ShowcaseChartType;
  className?: string;
  width?: number;
  height?: number;
}

// Radar data (same as hook)
const RADAR_DATA = [75, 90, 60, 85, 70, 80] as const;

/**
 * Premium Showcase Chart Component
 *
 * Features:
 * - Line Chart with "Ink Flow" entry and "Dissolve Trail" exit
 * - Pie Chart with "Radial Unfold" entry and "Collapse & Spin" exit
 * - Radar Chart with "Pulse Expansion" entry and "Retract & Fade" exit
 * - All animations use GSAP for smooth performance
 */
export function ShowcaseChart({
  activeChart,
  className,
  width = 400,
  height = 320,
}: ShowcaseChartProps) {
  const padding = 40;

  const {
    linePathRef,
    lineDotsRef,
    areaPathRef,
    barsRef,
    pieRef,
    radarRef,
    chartData,
  } = useShowcaseChart({
    activeChart,
    width,
    height,
    padding,
  });

  // Calculate bar dimensions
  const bars = useMemo(() => {
    const maxValue = Math.max(...DEFAULT_DATA);
    const usableWidth = width - 2 * padding;
    const usableHeight = height - 2 * padding;
    const barWidth = (usableWidth / DEFAULT_DATA.length) * 0.6;
    const gap = (usableWidth / DEFAULT_DATA.length) * 0.4;
    const baseline = height - padding;

    return DEFAULT_DATA.map((value, i) => {
      const barHeight = (value / maxValue) * usableHeight;
      const x = padding + i * (barWidth + gap) + gap / 2;
      const y = baseline - barHeight;

      return { x, y, w: barWidth, h: barHeight, key: i };
    });
  }, [width, height, padding]);

  return (
    <div className={cn("relative", className)}>
      {/* Subtle glow effect */}
      <div
        className="absolute inset-0 blur-3xl opacity-10"
        style={{
          background: `radial-gradient(ellipse at center, var(--foreground) 0%, transparent 70%)`,
        }}
      />

      {/* SVG Chart */}
      <motion.svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <defs>
          {/* Area gradient - monochromatic */}
          <linearGradient
            id="showcase-area-gradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={CHART_COLORS.areaGradient.start} />
            <stop offset="100%" stopColor={CHART_COLORS.areaGradient.end} />
          </linearGradient>

          {/* Soft shadow filter */}
          <filter
            id="showcase-filter"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feOffset in="blur" dx="0" dy="4" result="offsetBlur" />
            <feFlood floodOpacity="0.08" result="color" />
            <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Dot glow filter - for line chart dots */}
          <filter
            id="showcase-dot-glow"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Radar dot glow filter */}
          <filter
            id="showcase-radar-glow"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Pie slice glow */}
          <filter
            id="showcase-pie-glow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
            <feFlood floodOpacity="0.15" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Bar Chart Group */}
        <g ref={barsRef} opacity={0}>
          {bars.map((bar) => (
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
              filter="url(#showcase-filter)"
            />
          ))}
        </g>

        {/* Area Chart - Line + Area Fill + Dots */}
        {/* Area fill (under the line) */}
        <path
          ref={areaPathRef}
          d={chartData.areaPath}
          opacity={0}
          fill="url(#showcase-area-gradient)"
          filter="url(#showcase-filter)"
        />

        {/* Line path */}
        <path
          ref={linePathRef}
          d={chartData.linePath}
          opacity={0}
          fill="none"
          stroke={CHART_COLORS.stroke}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#showcase-filter)"
        />

        {/* Line chart dots */}
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
              filter="url(#showcase-dot-glow)"
            />
          ))}
        </g>

        {/* Pie Chart Group */}
        <g ref={pieRef} opacity={0}>
          {chartData.pieSlices.map((pathStr, i) => (
            <path
              key={i}
              d={pathStr}
              fill={CHART_COLORS.areaGradient.start}
              stroke={CHART_COLORS.stroke}
              strokeWidth={1}
              filter="url(#showcase-filter)"
            />
          ))}
        </g>

        {/* Radar Chart Group */}
        <g ref={radarRef} opacity={0}>
          {/* Axis lines (spokes) */}
          {chartData.radarAxisPaths.map((pathStr, i) => (
            <path
              key={`axis-${i}`}
              className="radar-axis"
              d={pathStr}
              fill="none"
              stroke={CHART_COLORS.stroke}
              strokeWidth={1}
              opacity={0.4}
            />
          ))}

          {/* Grid rings */}
          {chartData.radarGridPaths.map((pathStr, i) => (
            <path
              key={`grid-${i}`}
              className="radar-grid"
              d={pathStr}
              fill="none"
              stroke={CHART_COLORS.stroke}
              strokeWidth={1}
              opacity={0.3}
              style={{
                transformOrigin: `${chartData.cx}px ${chartData.cy}px`,
              }}
            />
          ))}

          {/* Data polygon */}
          <path
            className="radar-polygon"
            d={chartData.radarPath}
            fill={CHART_COLORS.areaGradient.start}
            stroke={CHART_COLORS.stroke}
            strokeWidth={2}
            strokeLinejoin="round"
            filter="url(#showcase-filter)"
            style={{
              transformOrigin: `${chartData.cx}px ${chartData.cy}px`,
            }}
          />

          {/* Data points on radar vertices */}
          {RADAR_DATA.map((value, i) => {
            const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
            const r = (value / 90) * chartData.radius;
            const x = chartData.cx + r * Math.cos(angle);
            const y = chartData.cy + r * Math.sin(angle);

            return (
              <circle
                key={`dot-${i}`}
                className="radar-dot"
                cx={x}
                cy={y}
                r={4}
                fill="var(--background)"
                stroke={CHART_COLORS.stroke}
                strokeWidth={2}
              />
            );
          })}
        </g>
      </motion.svg>
    </div>
  );
}
