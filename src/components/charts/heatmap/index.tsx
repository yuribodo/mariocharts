"use client";

import * as React from "react";
import { memo, useMemo, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useIsomorphicLayoutEffect } from "../../../../lib/hooks";
import { cn } from "../../../../lib/utils";

// Types
type ChartDataItem = Record<string, unknown>;
type ColorScheme = "blue" | "green" | "amber" | "purple" | "diverging";
type HeatmapVariant = "grid" | "calendar" | "bubble" | "radial";

interface HeatmapChartProps<T extends ChartDataItem> {
  readonly data: readonly T[];
  readonly x: keyof T;
  readonly y: keyof T;
  readonly value: keyof T;
  readonly variant?: HeatmapVariant;
  readonly colorScheme?: ColorScheme;
  readonly colorFrom?: string;
  readonly colorTo?: string;
  readonly showLabels?: boolean;
  readonly showLegend?: boolean;
  readonly cellRadius?: number;
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly onClick?: (item: T, colLabel: string, rowLabel: string) => void;
}

interface ProcessedCell<T> {
  readonly data: T;
  readonly colLabel: string;
  readonly rowLabel: string;
  readonly rawValue: number;
  readonly normalizedValue: number;
  readonly colIndex: number;
  readonly rowIndex: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly fillColor: string;
  readonly animDelay: number;
}

// Constants
const DEFAULT_HEIGHT = 320;
const LABEL_SIZE = 60;
const CELL_GAP = 2;
const MAX_STAGGER_MS = 800;
const LEGEND_HEIGHT = 28;

// Color scheme defaults: [from, to]
const SCHEME_COLORS: Record<ColorScheme, [string, string]> = {
  blue: ["#dbeafe", "#1d4ed8"],
  green: ["#dcfce7", "#166534"],
  amber: ["#fef9c3", "#92400e"],
  purple: ["#f3e8ff", "#6b21a8"],
  diverging: ["#1d4ed8", "#991b1b"],
};

// ── Color interpolation ──────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
}

function lerpHex(from: string, to: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const tt = Math.max(0, Math.min(1, t));
  return rgbToHex(clamp(r1 + (r2 - r1) * tt), clamp(g1 + (g2 - g1) * tt), clamp(b1 + (b2 - b1) * tt));
}

function getCellColor(
  normalizedValue: number,
  scheme: ColorScheme,
  colorFrom?: string,
  colorTo?: string,
): string {
  const [defaultFrom, defaultTo] = SCHEME_COLORS[scheme];
  const from = colorFrom ?? defaultFrom;
  const to = colorTo ?? defaultTo;

  if (scheme === "diverging" && !colorFrom && !colorTo) {
    // Blue → neutral → red
    const neutral = "#f5f5f5";
    if (normalizedValue < 0.5) return lerpHex(from, neutral, normalizedValue * 2);
    return lerpHex(neutral, to, (normalizedValue - 0.5) * 2);
  }

  return lerpHex(from, to, normalizedValue);
}

// ── Utilities ────────────────────────────────────────────────────────────────

function getNumericValue(data: ChartDataItem, key: keyof ChartDataItem): number {
  const val = data[key];
  if (typeof val === "number" && isFinite(val)) return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val.replace(/[,$%\s]/g, ""));
    if (isFinite(parsed)) return parsed;
  }
  return 0;
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function useContainerDimensions() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rafId = 0;
    const update = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setWidth(el.getBoundingClientRect().width));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return [ref, width] as const;
}

// ── States ───────────────────────────────────────────────────────────────────

function LoadingState({ height }: { height: number }) {
  return (
    <div className="relative w-full animate-pulse" style={{ height }}>
      <div className="m-4 grid gap-1" style={{ gridTemplateColumns: "repeat(8, 1fr)", gridTemplateRows: "repeat(6, 1fr)", height: height - 32 }}>
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className="rounded bg-muted" style={{ opacity: 0.3 + (i % 5) * 0.1 }} />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-2">
        <div className="text-destructive font-medium">Chart Error</div>
        <div className="text-sm text-muted-foreground">{error}</div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-2">
        <div className="text-muted-foreground">No Data</div>
        <div className="text-sm text-muted-foreground">There&apos;s no data to display</div>
      </div>
    </div>
  );
}

// ── Legend ───────────────────────────────────────────────────────────────────

function ColorLegend({
  scheme,
  colorFrom,
  colorTo,
  isCalendar,
  svgWidth,
  y,
}: {
  scheme: ColorScheme;
  colorFrom: string | undefined;
  colorTo: string | undefined;
  isCalendar: boolean;
  svgWidth: number;
  y: number;
}) {
  const [defaultFrom, defaultTo] = SCHEME_COLORS[scheme];
  const from = colorFrom ?? defaultFrom;
  const to = colorTo ?? defaultTo;
  const gradId = "hm-legend-grad";
  const swatchW = 80;
  const swatchH = 10;
  const cx = svgWidth / 2;

  return (
    <g transform={`translate(${cx - swatchW / 2 - 24}, ${y})`}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={from} />
          {scheme === "diverging" && !colorFrom && !colorTo && (
            <stop offset="50%" stopColor="#f5f5f5" />
          )}
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <text x={0} y={swatchH / 2} dominantBaseline="middle" fontSize={9} className="fill-muted-foreground">
        {isCalendar ? "Less" : "Min"}
      </text>
      <rect x={24} y={0} width={swatchW} height={swatchH} rx={3} fill={`url(#${gradId})`} />
      <text x={24 + swatchW + 4} y={swatchH / 2} dominantBaseline="middle" fontSize={9} className="fill-muted-foreground">
        {isCalendar ? "More" : "Max"}
      </text>
    </g>
  );
}

// ── Grid variant ─────────────────────────────────────────────────────────────

function renderGrid<T extends ChartDataItem>({
  processedCells,
  colLabels,
  rowLabels,
  hoveredCell,
  setHoveredCell,
  setTooltipPos,
  svgRef,
  cellWidth,
  cellHeight,
  cellRadius,
  labelAreaLeft,
  labelAreaTop,
  showLabels,
  showLegend,
  shouldAnimate,
  height,
  scheme,
  colorFrom,
  colorTo,
  svgWidth,
  isBubble,
}: {
  processedCells: ProcessedCell<T>[];
  colLabels: string[];
  rowLabels: string[];
  hoveredCell: { col: number; row: number } | null;
  setHoveredCell: React.Dispatch<React.SetStateAction<{ col: number; row: number } | null>>;
  setTooltipPos: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  svgRef: React.RefObject<SVGSVGElement | null>;
  cellWidth: number;
  cellHeight: number;
  cellRadius: number;
  labelAreaLeft: number;
  labelAreaTop: number;
  showLabels: boolean;
  showLegend: boolean;
  shouldAnimate: boolean;
  height: number;
  scheme: ColorScheme;
  colorFrom: string | undefined;
  colorTo: string | undefined;
  svgWidth: number;
  isBubble: boolean;
}) {
  const legendY = height - LEGEND_HEIGHT + 8;

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = e.clientX - rect.left;
    const svgY = e.clientY - rect.top;
    const relX = svgX - labelAreaLeft;
    const relY = svgY - labelAreaTop;
    if (relX < 0 || relY < 0) { setHoveredCell(null); return; }
    const col = Math.floor(relX / (cellWidth + CELL_GAP));
    const row = Math.floor(relY / (cellHeight + CELL_GAP));
    if (col >= 0 && col < colLabels.length && row >= 0 && row < rowLabels.length) {
      setHoveredCell({ col, row });
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else {
      setHoveredCell(null);
    }
  }

  const maxR = Math.min(cellWidth, cellHeight) / 2 - 1;

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={height}
      className="overflow-visible cursor-default"
      role="img"
      aria-label={`Heatmap chart with ${colLabels.length} columns and ${rowLabels.length} rows`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredCell(null)}
    >
      {/* Column labels */}
      {showLabels && colLabels.map((lbl, i) => (
        <text
          key={`col-${i}`}
          x={labelAreaLeft + i * (cellWidth + CELL_GAP) + cellWidth / 2}
          y={14}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          className="fill-muted-foreground"
        >
          {lbl.length > 6 ? `${lbl.slice(0, 5)}…` : lbl}
        </text>
      ))}

      {/* Row labels */}
      {showLabels && rowLabels.map((lbl, i) => (
        <text
          key={`row-${i}`}
          x={labelAreaLeft - 6}
          y={labelAreaTop + i * (cellHeight + CELL_GAP) + cellHeight / 2}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={10}
          className="fill-muted-foreground"
        >
          {lbl.length > 8 ? `${lbl.slice(0, 7)}…` : lbl}
        </text>
      ))}

      {/* Cells */}
      {processedCells.map((cell) => {
        const isHovered = hoveredCell?.col === cell.colIndex && hoveredCell?.row === cell.rowIndex;
        const isCrossRow = hoveredCell !== null && hoveredCell.row === cell.rowIndex && !isHovered;
        const isCrossCol = hoveredCell !== null && hoveredCell.col === cell.colIndex && !isHovered;
        const isCross = isCrossRow || isCrossCol;

        if (isBubble) {
          const r = cell.normalizedValue < 0.01
            ? 1
            : maxR * Math.sqrt(cell.normalizedValue);
          const cx = cell.x + cellWidth / 2;
          const cy = cell.y + cellHeight / 2;
          return (
            <g key={`${cell.colIndex}-${cell.rowIndex}`}>
              {/* Faint background cell */}
              <rect
                x={cell.x}
                y={cell.y}
                width={cell.width}
                height={cell.height}
                rx={cellRadius}
                ry={cellRadius}
                fill={cell.fillColor}
                fillOpacity={0.08}
              />
              <motion.circle
                cx={cx}
                cy={cy}
                r={r}
                fill={cell.fillColor}
                fillOpacity={isCross ? 0.35 : isHovered ? 1 : 0.85}
                style={{ filter: isHovered ? `drop-shadow(0 0 4px ${cell.fillColor})` : "none" }}
                initial={shouldAnimate ? { r: 0, opacity: 0 } : { r, opacity: 0.85 }}
                animate={{ r, opacity: isCross ? 0.35 : isHovered ? 1 : 0.85 }}
                transition={
                  shouldAnimate
                    ? { duration: 0.35, delay: cell.animDelay, ease: [0.4, 0, 0.2, 1] }
                    : { duration: 0 }
                }
              />
            </g>
          );
        }

        return (
          <motion.rect
            key={`${cell.colIndex}-${cell.rowIndex}`}
            x={cell.x}
            y={cell.y}
            width={cell.width}
            height={cell.height}
            rx={cellRadius}
            ry={cellRadius}
            fill={cell.fillColor}
            fillOpacity={isCross ? 0.35 : isHovered ? 1 : 0.9}
            stroke={isHovered ? cell.fillColor : "transparent"}
            strokeWidth={isHovered ? 2 : 0}
            strokeOpacity={0.8}
            style={{ filter: isHovered ? `drop-shadow(0 0 4px ${cell.fillColor})` : "none" }}
            initial={shouldAnimate ? { opacity: 0, scale: 0.5 } : { opacity: 0.9, scale: 1 }}
            animate={{ opacity: isCross ? 0.35 : isHovered ? 1 : 0.9, scale: 1 }}
            transition={
              shouldAnimate
                ? { duration: 0.3, delay: cell.animDelay, ease: [0.4, 0, 0.2, 1] }
                : { duration: 0 }
            }
          />
        );
      })}

      {/* Legend */}
      {showLegend && (
        <ColorLegend
          scheme={scheme}
          colorFrom={colorFrom}
          colorTo={colorTo}
          isCalendar={false}
          svgWidth={svgWidth}
          y={legendY}
        />
      )}
    </svg>
  );
}

// ── Calendar variant ─────────────────────────────────────────────────────────

const WEEKDAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function renderCalendar<T extends ChartDataItem>({
  processedCells,
  colLabels,
  rowLabels,
  hoveredCell,
  setHoveredCell,
  setTooltipPos,
  svgRef,
  cellWidth,
  cellHeight,
  cellRadius,
  showLegend,
  shouldAnimate,
  height,
  scheme,
  colorFrom,
  colorTo,
  svgWidth,
  showLabels,
}: {
  processedCells: ProcessedCell<T>[];
  colLabels: string[];
  rowLabels: string[];
  hoveredCell: { col: number; row: number } | null;
  setHoveredCell: React.Dispatch<React.SetStateAction<{ col: number; row: number } | null>>;
  setTooltipPos: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  svgRef: React.RefObject<SVGSVGElement | null>;
  cellWidth: number;
  cellHeight: number;
  cellRadius: number;
  showLegend: boolean;
  shouldAnimate: boolean;
  height: number;
  scheme: ColorScheme;
  colorFrom: string | undefined;
  colorTo: string | undefined;
  svgWidth: number;
  showLabels: boolean;
}) {
  // GitHub-style labels: Mon/Wed/Fri on left, month names on top
  const dayLabels = ["Mon", "Wed", "Fri"];
  const labelAreaLeft = showLabels ? 28 : 4;
  const labelAreaTop = showLabels ? 20 : 4;
  const legendY = height - LEGEND_HEIGHT + 8;

  // Detect month names from colLabels (e.g. "Jan", "Feb" from first col of each month)
  const monthPositions: { label: string; col: number }[] = [];
  if (showLabels) {
    let lastMonth = "";
    for (let i = 0; i < colLabels.length; i++) {
      // If colLabels look like "2024-01-W1" or "Jan" etc — just show if changed
      const lbl = colLabels[i] ?? "";
      const monthMatch = lbl.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
      const month = monthMatch ? monthMatch[1]! : lbl.slice(0, 3);
      if (month !== lastMonth && month.length <= 3) {
        monthPositions.push({ label: month, col: i });
        lastMonth = month;
      }
    }
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = e.clientX - rect.left;
    const svgY = e.clientY - rect.top;
    const relX = svgX - labelAreaLeft;
    const relY = svgY - labelAreaTop;
    if (relX < 0 || relY < 0) { setHoveredCell(null); return; }
    const col = Math.floor(relX / (cellWidth + CELL_GAP));
    const row = Math.floor(relY / (cellHeight + CELL_GAP));
    if (col >= 0 && col < colLabels.length && row >= 0 && row < rowLabels.length) {
      setHoveredCell({ col, row });
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else {
      setHoveredCell(null);
    }
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={height}
      className="overflow-visible cursor-default"
      role="img"
      aria-label="GitHub-style activity calendar heatmap"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredCell(null)}
    >
      {/* Month labels on top */}
      {showLabels && monthPositions.map(({ label, col }) => (
        <text
          key={`month-${col}`}
          x={labelAreaLeft + col * (cellWidth + CELL_GAP)}
          y={10}
          textAnchor="start"
          dominantBaseline="middle"
          fontSize={9}
          className="fill-muted-foreground"
        >
          {label}
        </text>
      ))}

      {/* Day labels: Mon / Wed / Fri */}
      {showLabels && rowLabels.map((lbl, i) => {
        if (!dayLabels.includes(lbl)) return null;
        return (
          <text
            key={`day-${i}`}
            x={labelAreaLeft - 4}
            y={labelAreaTop + i * (cellHeight + CELL_GAP) + cellHeight / 2}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={9}
            className="fill-muted-foreground"
          >
            {lbl}
          </text>
        );
      })}

      {/* Cells */}
      {processedCells.map((cell) => {
        const isHovered = hoveredCell?.col === cell.colIndex && hoveredCell?.row === cell.rowIndex;
        return (
          <motion.rect
            key={`${cell.colIndex}-${cell.rowIndex}`}
            x={cell.x}
            y={cell.y}
            width={cell.width}
            height={cell.height}
            rx={cellRadius}
            ry={cellRadius}
            fill={cell.fillColor}
            fillOpacity={isHovered ? 1 : 0.9}
            stroke={isHovered ? cell.fillColor : "transparent"}
            strokeWidth={isHovered ? 1.5 : 0}
            style={{ filter: isHovered ? `drop-shadow(0 0 3px ${cell.fillColor})` : "none" }}
            initial={shouldAnimate ? { opacity: 0 } : { opacity: 0.9 }}
            animate={{ opacity: isHovered ? 1 : 0.9 }}
            transition={
              shouldAnimate
                ? { duration: 0.2, delay: cell.animDelay, ease: "easeOut" }
                : { duration: 0 }
            }
          />
        );
      })}

      {/* Legend */}
      {showLegend && (
        <ColorLegend
          scheme={scheme}
          colorFrom={colorFrom}
          colorTo={colorTo}
          isCalendar
          svgWidth={svgWidth}
          y={legendY}
        />
      )}
    </svg>
  );
}

// ── Radial variant ───────────────────────────────────────────────────────────

function arcPath(
  cx: number, cy: number,
  innerR: number, outerR: number,
  startAngle: number, endAngle: number,
): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const sa = toRad(startAngle);
  const ea = toRad(endAngle);
  const cos = Math.cos, sin = Math.sin;
  const x1 = cx + innerR * cos(sa), y1 = cy + innerR * sin(sa);
  const x2 = cx + outerR * cos(sa), y2 = cy + outerR * sin(sa);
  const x3 = cx + outerR * cos(ea), y3 = cy + outerR * sin(ea);
  const x4 = cx + innerR * cos(ea), y4 = cy + innerR * sin(ea);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `L ${x2} ${y2}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${x3} ${y3}`,
    `L ${x4} ${y4}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${x1} ${y1}`,
    "Z",
  ].join(" ");
}

function renderRadial<T extends ChartDataItem>({
  processedCells,
  colLabels,
  rowLabels,
  hoveredCell,
  setHoveredCell,
  setTooltipPos,
  svgRef,
  showLabels,
  showLegend,
  shouldAnimate,
  height,
  scheme,
  colorFrom,
  colorTo,
  svgWidth,
}: {
  processedCells: ProcessedCell<T>[];
  colLabels: string[];
  rowLabels: string[];
  hoveredCell: { col: number; row: number } | null;
  setHoveredCell: React.Dispatch<React.SetStateAction<{ col: number; row: number } | null>>;
  setTooltipPos: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  svgRef: React.RefObject<SVGSVGElement | null>;
  showLabels: boolean;
  showLegend: boolean;
  shouldAnimate: boolean;
  height: number;
  scheme: ColorScheme;
  colorFrom: string | undefined;
  colorTo: string | undefined;
  svgWidth: number;
}) {
  const legendAreaH = showLegend ? LEGEND_HEIGHT : 0;
  const cx = svgWidth / 2;
  const cy = (height - legendAreaH) / 2;
  const outerR = Math.min(cx, cy) * 0.88;
  const innerR = outerR * 0.35;

  const n = colLabels.length;  // angular segments
  const m = rowLabels.length;  // rings
  const ringThickness = (outerR - innerR) / m;

  const GAP_DEG = n > 1 ? 1.5 : 0;
  const segmentAngle = 360 / n;

  const legendY = height - LEGEND_HEIGHT + 8;

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = e.clientX - rect.left - cx;
    const svgY = e.clientY - rect.top - cy;
    const dist = Math.sqrt(svgX * svgX + svgY * svgY);
    if (dist < innerR || dist > outerR) { setHoveredCell(null); return; }

    let angleDeg = (Math.atan2(svgY, svgX) * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 360;
    const col = Math.floor(angleDeg / segmentAngle);
    const ringFromOuter = Math.floor((outerR - dist) / ringThickness);
    const row = m - 1 - ringFromOuter;

    if (col >= 0 && col < n && row >= 0 && row < m) {
      setHoveredCell({ col, row });
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else {
      setHoveredCell(null);
    }
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={height}
      className="overflow-visible cursor-default"
      role="img"
      aria-label="Radial heatmap chart"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredCell(null)}
    >
      {processedCells.map((cell) => {
        const isHovered = hoveredCell?.col === cell.colIndex && hoveredCell?.row === cell.rowIndex;
        const startAngle = cell.colIndex * segmentAngle + GAP_DEG / 2;
        const endAngle = (cell.colIndex + 1) * segmentAngle - GAP_DEG / 2;
        // Rings: rowIndex=0 is outermost
        const rOuter = outerR - cell.rowIndex * ringThickness;
        const rInner = rOuter - ringThickness + 1;
        const d = arcPath(cx, cy, rInner, rOuter, startAngle, endAngle);

        return (
          <motion.path
            key={`${cell.colIndex}-${cell.rowIndex}`}
            d={d}
            fill={cell.fillColor}
            fillOpacity={isHovered ? 1 : 0.85}
            stroke="var(--background)"
            strokeWidth={1}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              filter: isHovered ? `drop-shadow(0 0 4px ${cell.fillColor})` : "none",
            }}
            initial={shouldAnimate ? { opacity: 0, scale: 0.3 } : { opacity: 0.85, scale: 1 }}
            animate={{ opacity: isHovered ? 1 : 0.85, scale: 1 }}
            transition={
              shouldAnimate
                ? {
                    opacity: { duration: 0.3, delay: cell.rowIndex * 0.12 + cell.colIndex * 0.01 },
                    scale: { duration: 0.4, delay: cell.rowIndex * 0.12, ease: [0.4, 0, 0.2, 1] },
                  }
                : { duration: 0 }
            }
          />
        );
      })}

      {/* Angular labels (x-axis — outer ring) */}
      {showLabels && colLabels.map((lbl, i) => {
        const midAngle = ((i + 0.5) * segmentAngle * Math.PI) / 180;
        const labelR = outerR + 14;
        const lx = cx + labelR * Math.cos(midAngle);
        const ly = cy + labelR * Math.sin(midAngle);
        return (
          <text
            key={`col-${i}`}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9}
            className="fill-muted-foreground"
          >
            {lbl.length > 4 ? `${lbl.slice(0, 3)}` : lbl}
          </text>
        );
      })}

      {/* Ring labels (y-axis) */}
      {showLabels && rowLabels.map((lbl, i) => {
        const rMid = outerR - i * ringThickness - ringThickness / 2;
        return (
          <text
            key={`row-${i}`}
            x={cx - rMid}
            y={cy}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={8}
            className="fill-muted-foreground"
          >
            {lbl.length > 5 ? `${lbl.slice(0, 4)}…` : lbl}
          </text>
        );
      })}

      {/* Center hole */}
      <circle cx={cx} cy={cy} r={innerR - 2} className="fill-background" />

      {/* Legend */}
      {showLegend && (
        <ColorLegend
          scheme={scheme}
          colorFrom={colorFrom}
          colorTo={colorTo}
          isCalendar={false}
          svgWidth={svgWidth}
          y={legendY}
        />
      )}
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function HeatmapChartComponent<T extends ChartDataItem>({
  data,
  x,
  y,
  value,
  variant = "grid",
  colorScheme = "blue",
  colorFrom,
  colorTo,
  showLabels = true,
  showLegend = false,
  cellRadius = 4,
  className,
  height = DEFAULT_HEIGHT,
  loading = false,
  error = null,
  animation = true,
  onClick,
}: HeatmapChartProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const [hoveredCell, setHoveredCell] = useState<{ col: number; row: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animation && !reduceMotion;

  // Effective legend display
  const effectiveShowLegend = variant === "calendar" ? (showLegend === undefined ? true : showLegend) : showLegend;
  const legendAreaH = effectiveShowLegend ? LEGEND_HEIGHT : 0;

  // Column labels — for calendar, reorder rows to Mon-Sun
  const rawColLabels = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const d of data) {
      const lbl = String(d[x]);
      if (!seen.has(lbl)) { seen.add(lbl); result.push(lbl); }
    }
    return result;
  }, [data, x]);

  const rawRowLabels = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const d of data) {
      const lbl = String(d[y]);
      if (!seen.has(lbl)) { seen.add(lbl); result.push(lbl); }
    }
    return result;
  }, [data, y]);

  // For calendar, sort rows in weekday order if they match
  const colLabels = rawColLabels;
  const rowLabels = useMemo(() => {
    if (variant !== "calendar") return rawRowLabels;
    const isWeekdays = rawRowLabels.every(l => WEEKDAY_ORDER.includes(l));
    if (isWeekdays) {
      return WEEKDAY_ORDER.filter(d => rawRowLabels.includes(d));
    }
    return rawRowLabels;
  }, [rawRowLabels, variant]);

  const { minVal, maxVal } = useMemo(() => {
    if (!data.length) return { minVal: 0, maxVal: 0 };
    const values = data.map(d => getNumericValue(d, value as string));
    return { minVal: Math.min(...values), maxVal: Math.max(...values) };
  }, [data, value]);

  // Layout
  const isCalendar = variant === "calendar";
  const labelAreaLeft = showLabels
    ? (isCalendar ? 28 : LABEL_SIZE)
    : (isCalendar ? 4 : 8);
  const labelAreaTop = showLabels ? 28 : 8;

  const chartAreaWidth = Math.max(0, containerWidth - labelAreaLeft - 8);
  const chartAreaHeight = Math.max(0, height - labelAreaTop - 8 - legendAreaH);

  const cellWidth = colLabels.length > 0
    ? (chartAreaWidth - (colLabels.length - 1) * CELL_GAP) / colLabels.length
    : 0;
  const cellHeight = rowLabels.length > 0
    ? (chartAreaHeight - (rowLabels.length - 1) * CELL_GAP) / rowLabels.length
    : 0;

  const totalCells = colLabels.length * rowLabels.length;

  const processedCells = useMemo((): ProcessedCell<T>[] => {
    if (!data.length || cellWidth <= 0 || cellHeight <= 0) return [];
    const valueRange = maxVal - minVal;
    const dataMap = new Map<string, T>();
    for (const d of data) {
      dataMap.set(`${String(d[x])}::${String(d[y])}`, d);
    }

    const cells: ProcessedCell<T>[] = [];
    let cellIndex = 0;
    for (const rowLabel of rowLabels) {
      for (const colLabel of colLabels) {
        const item = dataMap.get(`${colLabel}::${rowLabel}`);
        const colIndex = colLabels.indexOf(colLabel);
        const rowIndex = rowLabels.indexOf(rowLabel);
        const rawValue = item ? getNumericValue(item, value as string) : 0;
        const normalizedValue = valueRange > 0 ? (rawValue - minVal) / valueRange : 0;
        const fillColor = getCellColor(normalizedValue, colorScheme, colorFrom, colorTo);
        const delay = shouldAnimate ? Math.min((cellIndex / totalCells) * MAX_STAGGER_MS, MAX_STAGGER_MS) / 1000 : 0;

        cells.push({
          data: item ?? ({} as T),
          colLabel,
          rowLabel,
          rawValue,
          normalizedValue,
          colIndex,
          rowIndex,
          x: labelAreaLeft + colIndex * (cellWidth + CELL_GAP),
          y: labelAreaTop + rowIndex * (cellHeight + CELL_GAP),
          width: cellWidth,
          height: cellHeight,
          fillColor,
          animDelay: delay,
        });
        cellIndex++;
      }
    }
    return cells;
  }, [data, x, y, value, colLabels, rowLabels, minVal, maxVal, cellWidth, cellHeight, colorScheme, colorFrom, colorTo, shouldAnimate, totalCells, labelAreaLeft, labelAreaTop]);

  const handleSvgClick = useCallback(() => {
    if (!hoveredCell || !onClick) return;
    const cell = processedCells.find(c => c.colIndex === hoveredCell.col && c.rowIndex === hoveredCell.row);
    if (cell) onClick(cell.data, cell.colLabel, cell.rowLabel);
  }, [hoveredCell, onClick, processedCells]);

  const hoveredCellData = useMemo(() => {
    if (!hoveredCell) return null;
    return processedCells.find(c => c.colIndex === hoveredCell.col && c.rowIndex === hoveredCell.row) ?? null;
  }, [hoveredCell, processedCells]);

  if (loading) return <LoadingState height={height} />;
  if (error) return <ErrorState error={error} />;
  if (!data.length) return <EmptyState />;

  if (!containerWidth) {
    return (
      <div ref={containerRef} className={cn("relative w-full", className)} style={{ height }}>
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const sharedProps = {
    processedCells,
    colLabels,
    rowLabels,
    hoveredCell,
    setHoveredCell,
    setTooltipPos,
    svgRef,
    showLabels,
    showLegend: effectiveShowLegend,
    shouldAnimate,
    height,
    scheme: colorScheme,
    colorFrom,
    colorTo,
    svgWidth: containerWidth,
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className, onClick && "cursor-pointer")}
      style={{ height }}
      onClick={handleSvgClick}
    >
      {variant === "radial" ? (
        renderRadial({ ...sharedProps })
      ) : variant === "calendar" ? (
        renderCalendar({
          ...sharedProps,
          cellWidth,
          cellHeight,
          cellRadius: cellRadius === 4 ? 2 : cellRadius,
        })
      ) : (
        renderGrid({
          ...sharedProps,
          cellWidth,
          cellHeight,
          cellRadius,
          labelAreaLeft,
          labelAreaTop,
          isBubble: variant === "bubble",
        })
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredCellData && tooltipPos && (
          <motion.div
            key="heatmap-tooltip"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute pointer-events-none z-50 bg-popover/98 backdrop-blur-md border border-border rounded-lg px-3 py-2.5 shadow-xl"
            style={{
              left: tooltipPos.x + 12,
              top: Math.max(8, tooltipPos.y - 40),
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: hoveredCellData.fillColor }} />
              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                {hoveredCellData.rowLabel} / {hoveredCellData.colLabel}
              </span>
            </div>
            <div className="text-sm font-bold text-primary tabular-nums text-center">
              {formatValue(hoveredCellData.rawValue)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const HeatmapChart = memo(HeatmapChartComponent) as typeof HeatmapChartComponent;
export type { HeatmapChartProps, ColorScheme, HeatmapVariant };
