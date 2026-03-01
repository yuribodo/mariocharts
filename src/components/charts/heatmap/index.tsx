"use client";

import * as React from "react";
import { memo, useMemo, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useIsomorphicLayoutEffect } from "../../../../lib/hooks";
import { cn } from "../../../../lib/utils";

// Types
type ChartDataItem = Record<string, unknown>;

type ColorScheme = "blue" | "green" | "amber" | "purple" | "diverging";

interface HeatmapChartProps<T extends ChartDataItem> {
  readonly data: readonly T[];
  readonly x: keyof T;
  readonly y: keyof T;
  readonly value: keyof T;
  readonly colorScheme?: ColorScheme;
  readonly showLabels?: boolean;
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
  readonly fillOpacity: number;
  readonly animDelay: number;
}

// Constants
const DEFAULT_HEIGHT = 320;
const LABEL_SIZE = 60;
const CELL_GAP = 2;
const MAX_STAGGER_MS = 800;

// Color scheme base colors
const SCHEME_COLORS: Record<ColorScheme, { base: string; divergeLow: string; divergeHigh: string }> = {
  blue: { base: "#3b82f6", divergeLow: "#3b82f6", divergeHigh: "#ef4444" },
  green: { base: "#10b981", divergeLow: "#10b981", divergeHigh: "#ef4444" },
  amber: { base: "#f59e0b", divergeLow: "#f59e0b", divergeHigh: "#ef4444" },
  purple: { base: "#8b5cf6", divergeLow: "#8b5cf6", divergeHigh: "#ef4444" },
  diverging: { base: "#3b82f6", divergeLow: "#3b82f6", divergeHigh: "#ef4444" },
};

// Utilities
function getNumericValue(data: ChartDataItem, key: keyof ChartDataItem): number {
  const val = data[key];
  if (typeof val === "number" && isFinite(val)) return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val.replace(/[,$%\s]/g, ""));
    if (isFinite(parsed)) return parsed;
  }
  return 0;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}



function getCellColor(normalizedValue: number, scheme: ColorScheme): { color: string; opacity: number } {
  const schemeConfig = SCHEME_COLORS[scheme];
  if (scheme === "diverging") {
    if (normalizedValue < 0.5) {
      // Low: blue (divergeLow)
      return {
        color: schemeConfig.divergeLow,
        opacity: lerp(0.06, 0.94, 1 - normalizedValue * 2),
      };
    } else {
      // High: red (divergeHigh)
      return {
        color: schemeConfig.divergeHigh,
        opacity: lerp(0.06, 0.94, (normalizedValue - 0.5) * 2),
      };
    }
  }
  return {
    color: schemeConfig.base,
    opacity: lerp(0.06, 0.94, normalizedValue),
  };
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

// States
function LoadingState({ height }: { height: number }) {
  return (
    <div className="relative w-full animate-pulse" style={{ height }}>
      <div className="m-4 grid gap-1" style={{ gridTemplateColumns: "repeat(8, 1fr)", gridTemplateRows: "repeat(6, 1fr)", height: height - 32 }}>
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className="rounded bg-muted" style={{ opacity: 0.3 + Math.random() * 0.5 }} />
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

// Main component
function HeatmapChartComponent<T extends ChartDataItem>({
  data,
  x,
  y,
  value,
  colorScheme = "blue",
  showLabels = true,
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

  // All useMemo calls BEFORE early returns (hooks rules)
  const colLabels = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const d of data) {
      const label = String(d[x]);
      if (!seen.has(label)) { seen.add(label); result.push(label); }
    }
    return result;
  }, [data, x]);

  const rowLabels = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const d of data) {
      const label = String(d[y]);
      if (!seen.has(label)) { seen.add(label); result.push(label); }
    }
    return result;
  }, [data, y]);

  const { minVal, maxVal } = useMemo(() => {
    if (!data.length) return { minVal: 0, maxVal: 0 };
    const values = data.map(d => getNumericValue(d, value as string));
    return { minVal: Math.min(...values), maxVal: Math.max(...values) };
  }, [data, value]);

  const labelAreaLeft = showLabels ? LABEL_SIZE : 8;
  const labelAreaTop = showLabels ? 28 : 8;
  const chartAreaWidth = Math.max(0, containerWidth - labelAreaLeft - 8);
  const chartAreaHeight = Math.max(0, height - labelAreaTop - 8);

  const cellWidth = colLabels.length > 0 ? (chartAreaWidth - (colLabels.length - 1) * CELL_GAP) / colLabels.length : 0;
  const cellHeight = rowLabels.length > 0 ? (chartAreaHeight - (rowLabels.length - 1) * CELL_GAP) / rowLabels.length : 0;
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
        const { color, opacity } = getCellColor(normalizedValue, colorScheme);
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
          fillColor: color,
          fillOpacity: opacity,
          animDelay: delay,
        });
        cellIndex++;
      }
    }
    return cells;
  }, [data, x, y, value, colLabels, rowLabels, minVal, maxVal, cellWidth, cellHeight, colorScheme, shouldAnimate, totalCells, labelAreaLeft, labelAreaTop]);

  const handleSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
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
  }, [cellWidth, cellHeight, colLabels.length, rowLabels.length, labelAreaLeft, labelAreaTop]);

  const handleSvgMouseLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

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
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)} style={{ height }}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        className={cn("overflow-visible", onClick && "cursor-pointer")}
        role="img"
        aria-label={`Heatmap chart with ${colLabels.length} columns and ${rowLabels.length} rows`}
        onMouseMove={handleSvgMouseMove}
        onMouseLeave={handleSvgMouseLeave}
        onClick={handleSvgClick}
      >
        {/* Column labels (top) */}
        {showLabels && colLabels.map((label, i) => {
          const cx = labelAreaLeft + i * (cellWidth + CELL_GAP) + cellWidth / 2;
          return (
            <text
              key={`col-${i}`}
              x={cx}
              y={14}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              className="fill-muted-foreground"
            >
              {label.length > 6 ? `${label.slice(0, 5)}…` : label}
            </text>
          );
        })}

        {/* Row labels (left) */}
        {showLabels && rowLabels.map((label, i) => {
          const cy = labelAreaTop + i * (cellHeight + CELL_GAP) + cellHeight / 2;
          return (
            <text
              key={`row-${i}`}
              x={labelAreaLeft - 6}
              y={cy}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={10}
              className="fill-muted-foreground"
            >
              {label.length > 8 ? `${label.slice(0, 7)}…` : label}
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
              fillOpacity={cell.fillOpacity}
              stroke={isHovered ? cell.fillColor : "transparent"}
              strokeWidth={isHovered ? 2 : 0}
              strokeOpacity={0.8}
              style={{ filter: isHovered ? `drop-shadow(0 0 4px ${cell.fillColor})` : "none" }}
              initial={shouldAnimate ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={
                shouldAnimate
                  ? { duration: 0.3, delay: cell.animDelay, ease: [0.4, 0, 0.2, 1] }
                  : { duration: 0 }
              }
            />
          );
        })}
      </svg>

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
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: hoveredCellData.fillColor, opacity: Math.max(0.5, hoveredCellData.fillOpacity) }}
              />
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
export type { HeatmapChartProps, ColorScheme };
