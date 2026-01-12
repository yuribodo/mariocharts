"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  normalizeData,
  DEFAULT_DATA,
  type ChartDimensions,
} from "@/lib/chart-paths";
import { cn } from "@/lib/utils";
import { type DemoConfig } from "./types";
import { DemoCard } from "./demo-card";

interface LivePreviewProps {
  className?: string;
  config: DemoConfig;
}

/**
 * Live Chart Preview Component
 *
 * Monochromatic, minimal chart preview
 */
export function LivePreview({ className, config }: LivePreviewProps) {
  const shouldReduceMotion = useReducedMotion();
  const [animationKey, setAnimationKey] = useState(0);
  const prevAnimatedRef = useRef(config.animated);

  // Trigger re-animation when animated toggle changes from off to on
  useEffect(() => {
    if (config.animated && !prevAnimatedRef.current) {
      setAnimationKey((k) => k + 1);
    }
    prevAnimatedRef.current = config.animated;
  }, [config.animated]);

  const width = 400;
  const height = 180;
  const padding = 24;

  const points = useMemo(() => {
    const dimensions: ChartDimensions = { width, height, padding };
    return normalizeData(DEFAULT_DATA, dimensions);
  }, []);

  // Generate smooth curve path
  const generateSmoothPath = useMemo(() => {
    if (points.length === 0) return "";

    const firstPoint = points[0];
    if (!firstPoint) return "";

    let path = `M ${firstPoint.x} ${firstPoint.y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      if (!prev || !curr) continue;

      const cpX = (prev.x + curr.x) / 2;
      path += ` Q ${prev.x + (curr.x - prev.x) * 0.5} ${prev.y}, ${cpX} ${
        (prev.y + curr.y) / 2
      }`;
      path += ` T ${curr.x} ${curr.y}`;
    }

    return path;
  }, [points]);

  // Generate straight line path
  const generateLinePath = useMemo(() => {
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }, [points]);

  // Generate area path (for filled variant)
  const areaPath = useMemo(() => {
    if (points.length === 0) return "";

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    if (!firstPoint || !lastPoint) return "";

    const linePath = config.smooth ? generateSmoothPath : generateLinePath;
    return `${linePath} L ${lastPoint.x} ${height - padding} L ${firstPoint.x} ${height - padding} Z`;
  }, [config.smooth, generateSmoothPath, generateLinePath, points, height, padding]);

  const linePath = config.smooth ? generateSmoothPath : generateLinePath;

  const shouldAnimate = config.animated && !shouldReduceMotion;

  const activeCount = Object.values(config).filter(Boolean).length;

  return (
    <DemoCard
      className={className}
      header={{
        icon: <div className="h-2 w-2 rounded-full bg-green-500/50" />,
        title: "Preview",
        badge: "Live",
      }}
      footer={
        <>
          <span className="text-xs text-muted-foreground">
            {activeCount} props active
          </span>
          <span className="text-[10px] text-muted-foreground/50">
            Real-time
          </span>
        </>
      }
    >
      <div className="flex h-full items-center justify-center p-4">
        <svg
          key={animationKey}
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block"
        >
          <defs>
            {/* Monochromatic gradient - foreground only */}
            <linearGradient id="mono-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.12} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>

            {/* Solid fill for non-gradient mode */}
            <linearGradient id="mono-solid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.06} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* Area fill - only show if not minimal variant */}
          <AnimatePresence>
            {!config.variant && (
              <motion.path
                key="area"
                d={areaPath}
                fill={config.gradient ? "url(#mono-gradient)" : "url(#mono-solid)"}
                className="text-foreground"
                initial={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* Line stroke - monochromatic */}
          <motion.path
            key={`line-${config.smooth ? "smooth" : "sharp"}`}
            d={linePath}
            fill="none"
            stroke="currentColor"
            className="text-foreground"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.8}
            initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* Data points */}
          <AnimatePresence>
            {config.showDots &&
              points.map((point, i) => (
                <motion.circle
                  key={`dot-${i}`}
                  cx={point.x}
                  cy={point.y}
                  r={4}
                  fill="var(--background)"
                  stroke="currentColor"
                  className="text-foreground"
                  strokeWidth={2}
                  strokeOpacity={0.8}
                  initial={shouldAnimate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0, transition: { duration: 0.1 } }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    delay: shouldAnimate ? i * 0.04 : 0,
                  }}
                />
              ))}
          </AnimatePresence>

          {/* Value labels */}
          <AnimatePresence>
            {config.showLabels &&
              points.map((point, i) => (
                <motion.g
                  key={`label-${i}`}
                  initial={shouldAnimate ? { opacity: 0, y: 6 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6, transition: { duration: 0.1 } }}
                  transition={{
                    duration: 0.2,
                    delay: shouldAnimate ? 0.15 + i * 0.04 : 0,
                  }}
                >
                  {/* Label background */}
                  <rect
                    x={point.x - 14}
                    y={point.y - 26}
                    width={28}
                    height={16}
                    rx={3}
                    fill="var(--background)"
                    stroke="currentColor"
                    strokeOpacity={0.15}
                    className="text-foreground"
                    strokeWidth={1}
                  />
                  {/* Label text */}
                  <text
                    x={point.x}
                    y={point.y - 15}
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-foreground text-[9px] font-medium"
                    style={{ fontFamily: "var(--font-family-mono)" }}
                  >
                    {DEFAULT_DATA[i]}
                  </text>
                </motion.g>
              ))}
          </AnimatePresence>
        </svg>
      </div>
    </DemoCard>
  );
}
