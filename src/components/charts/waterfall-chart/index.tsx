"use client";

import * as React from "react";
import { memo, useMemo, useRef, useState, useId } from "react";
import {
  animate,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { cn } from "../../../../lib/utils";
import { useIsomorphicLayoutEffect } from "../../../../lib/hooks";
import {
  formatValue,
  getGridDasharray,
  useContainerDimensions,
} from "../_shared";
import { InspectionTooltip } from "../_shared/inspection-tooltip";
import type {
  ChartDataItem,
  WaterfallChartTooltipData,
  TooltipRenderer,
} from "../_shared";
import {
  computeWaterfallSeries,
  formatWaterfallDelta,
  waterfallScale,
  truncateLabel,
} from "./utils";
import type {
  WaterfallVariant,
  WaterfallType,
  WaterfallDataKey,
} from "./utils";

interface WaterfallColors {
  readonly increase?: string;
  readonly decrease?: string;
  readonly total?: string;
  readonly subtotal?: string;
  readonly neutral?: string;
}
interface WaterfallChartProps<T extends ChartDataItem> {
  readonly data: readonly T[];
  /** Step label key. Defaults to "label". */
  readonly x?: WaterfallDataKey<T>;
  /** Finite numeric value key. Omit values for sum/subtotal steps. Defaults to "value". */
  readonly y?: WaterfallDataKey<T>;
  /** Step type key: increase, decrease, total, sum or subtotal. Missing types infer direction from sign. */
  readonly type?: WaterfallDataKey<T>;
  readonly colors?: WaterfallColors;
  readonly className?: string;
  /** Fixed outer height, at least 180px. Defaults to 300. Dense charts scroll inside this frame. */
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly orientation?: "vertical" | "horizontal";
  /** Filled or outlined marks. Defaults to filled. */
  readonly variant?: WaterfallVariant;
  /** Corner radius in pixels, from 0 to 24. Defaults to 3. */
  readonly borderRadius?: number;
  /** Fraction of the category slot occupied by a bar, from 0.2 to 0.9. Defaults to 0.65. */
  readonly barWidth?: number;
  /** Running balance before the first step. Defaults to 0. */
  readonly initialValue?: number;
  /** Connect consecutive balances. Absolute resets intentionally break the connector. Defaults to true. */
  readonly showConnectors?: boolean;
  readonly connectorStyle?: "solid" | "dashed" | "dotted";
  /** Show signed changes and absolute sums. Defaults to false. */
  readonly showValues?: boolean;
  readonly showGrid?: boolean;
  readonly gridStyle?: "solid" | "dashed" | "dotted";
  readonly showLegend?: boolean;
  /** Formats values consistently in axes, labels, tooltips and the data table. */
  readonly valueFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
  readonly onBarClick?: (data: T, index: number) => void;
  readonly tooltipRenderer?: TooltipRenderer<WaterfallChartTooltipData<T>>;
}
const DEFAULT_COLORS: Required<WaterfallColors> = {
  increase: "#059669",
  decrease: "#ef4444",
  total: "#3b82f6",
  subtotal: "#8b5cf6",
  neutral: "#64748b",
};
const TYPE_LABELS: Record<WaterfallType, string> = {
  increase: "Increase",
  decrease: "Decrease",
  total: "Absolute total",
  sum: "Running sum",
  subtotal: "Period subtotal",
};
const PLACEHOLDER = [
  { label: "Start", value: 60, type: "total" },
  { label: "Growth", value: 30 },
  { label: "Costs", value: -20 },
  { label: "Other", value: -10 },
  { label: "End", type: "sum" },
];
const buttonClass =
  "rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Native value-space transforms avoid SVG transform-origin differences and keep labels still. */
function GrowingMark({
  progress,
  anchor,
  vertical,
  index,
  count,
  children,
}: {
  progress: MotionValue<number>;
  anchor: number;
  vertical: boolean;
  index: number;
  count: number;
  children: React.ReactNode;
}) {
  const ref = useRef<SVGGElement>(null);
  useIsomorphicLayoutEffect(() => {
    const update = (value: number) => {
      const delay = count <= 1 ? 0 : (index / (count - 1)) * 0.25;
      const growth = Math.max(0, Math.min(1, (value - delay) / (1 - delay)));
      ref.current?.setAttribute(
        "transform",
        vertical
          ? `translate(0 ${anchor}) scale(1 ${growth}) translate(0 ${-anchor})`
          : `translate(${anchor} 0) scale(${growth} 1) translate(${-anchor} 0)`,
      );
    };
    update(progress.get());
    return progress.on("change", update);
  }, [progress, anchor, vertical, index, count]);
  return (
    <g ref={ref} data-waterfall-growth="" aria-hidden="true">
      {children}
    </g>
  );
}

function WaterfallChartComponent<T extends ChartDataItem>({
  data,
  x = "label" as WaterfallDataKey<T>,
  y = "value" as WaterfallDataKey<T>,
  type = "type" as WaterfallDataKey<T>,
  colors,
  className,
  height = 300,
  loading = false,
  error = null,
  animation = true,
  orientation = "vertical",
  variant = "filled",
  borderRadius = 3,
  barWidth = 0.65,
  initialValue = 0,
  showConnectors = true,
  connectorStyle = "dashed",
  showValues = false,
  showGrid = false,
  gridStyle = "dashed",
  showLegend = false,
  valueFormatter = formatValue,
  ariaLabel = "Waterfall chart",
  description,
  onBarClick,
  tooltipRenderer,
}: WaterfallChartProps<T>) {
  const [rootRef, width] = useContainerDimensions();
  const viewport = useRef<HTMLDivElement>(null);
  const targets = useRef(new Map<number, SVGRectElement>());
  const tableButton = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const [hasFocus, setHasFocus] = useState(false);
  const animationControl = useRef<{ stop: () => void } | null>(null);
  const [table, setTable] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);
  useIsomorphicLayoutEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarsePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const [scroll, setScroll] = useState({ x: 0, y: 0 });
  const id = useId();
  const reduced = useReducedMotion();
  const progress = useMotionValue(1);
  const model = useMemo(
    () =>
      computeWaterfallSeries(data, { label: x, value: y, type }, initialValue),
    [data, x, y, type, initialValue],
  );
  const palette = { ...DEFAULT_COLORS, ...colors };
  const validHeight = Number.isFinite(height) && height >= 180;
  const frameHeight = validHeight ? height : 300;
  const configError = !validHeight
    ? "height must be a finite number of at least 180px."
    : !["vertical", "horizontal"].includes(orientation)
      ? "orientation must be vertical or horizontal."
      : !["filled", "outline"].includes(variant)
        ? "variant must be filled or outline."
        : !Number.isFinite(borderRadius) ||
            borderRadius < 0 ||
            borderRadius > 24
          ? "borderRadius must be between 0 and 24px."
          : !Number.isFinite(barWidth) || barWidth < 0.2 || barWidth > 0.9
            ? "barWidth must be between 0.2 and 0.9."
            : Object.values(palette).some(
                  (color) => typeof color !== "string" || !color.trim(),
                )
              ? "Provide non-empty CSS colors."
              : null;
  const chartError = error ?? configError ?? model.error;
  const ready = !loading && !chartError && model.bars.length > 0 && width > 0;
  const vertical = orientation === "vertical";
  const skeleton = loading && (!model.bars.length || !!model.error);
  const series = useMemo(
    () =>
      skeleton
        ? computeWaterfallSeries(PLACEHOLDER, {
            label: "label",
            value: "value",
            type: "type",
          })
        : model,
    [skeleton, model],
  );
  const scale = useMemo(() => waterfallScale(series.domain), [series.domain]);
  const tickLabels = scale.ticks.map(valueFormatter);
  const footerHeight = 36;
  const legendHeight = showLegend ? 32 : 0;
  const viewportHeight = frameHeight - footerHeight - legendHeight;
  const left = vertical
    ? Math.min(
        100,
        Math.max(42, ...tickLabels.map((label) => label.length * 6.5 + 14)),
      )
    : Math.min(Math.max(72, width * 0.28), 170);
  const top = 26,
    bottom = 32,
    right = vertical
      ? 18
      : Math.min(
          100,
          Math.max(30, ...tickLabels.map((label) => label.length * 3.5 + 12)),
        );
  const svgWidth = Math.max(
    width,
    vertical ? left + right + series.bars.length * 48 : width,
  );
  const svgHeight = Math.max(
    viewportHeight,
    vertical
      ? viewportHeight
      : top + bottom + series.bars.length * (coarsePointer ? 48 : 28),
  );
  const plotWidth = Math.max(0, svgWidth - left - right),
    plotHeight = Math.max(0, svgHeight - top - bottom);
  const slot =
    (vertical ? plotWidth : plotHeight) / Math.max(1, series.bars.length);
  const thickness = slot * barWidth;
  const pixel = (value: number) =>
    vertical
      ? plotHeight * (1 - scale.ratio(value))
      : plotWidth * scale.ratio(value);
  const bars = series.bars.map((bar) => {
    const a = pixel(bar.start),
      b = pixel(bar.end),
      cross = slot * bar.index + (slot - thickness) / 2;
    const color =
      bar.type === "total" || bar.type === "sum"
        ? palette.total
        : bar.type === "subtotal"
          ? palette.subtotal
          : bar.value === 0
            ? palette.neutral
            : palette[bar.type];
    const rect = vertical
      ? {
          x: cross,
          y: Math.min(a, b),
          width: thickness,
          height: Math.abs(a - b),
        }
      : {
          x: Math.min(a, b),
          y: cross,
          width: Math.abs(a - b),
          height: thickness,
        };
    return { bar, color, a, b, cross, rect };
  });
  useIsomorphicLayoutEffect(() => {
    if (!ready || !animation || reduced) {
      progress.set(1);
      return;
    }
    progress.set(0);
    const controls = animate(progress, 1, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    });
    animationControl.current = controls;
    return () => {
      controls.stop();
      animationControl.current = null;
    };
  }, [ready, model, orientation, animation, reduced, progress]);
  useIsomorphicLayoutEffect(() => {
    setActive(null);
    setFocus((previous) =>
      Math.min(previous, Math.max(0, model.bars.length - 1)),
    );
    if (!ready) return;
    const focused = document.activeElement;
    if (
      hasFocus ||
      (focused instanceof SVGElement && rootRef.current?.contains(focused))
    ) {
      targets.current.get(Math.min(focus, model.bars.length - 1))?.focus();
    }
    // Focus index changes must not dismiss inspection during arrow navigation.
  }, [model, ready, orientation, rootRef]);
  const inspect = (index: number) => {
    animationControl.current?.stop();
    progress.set(1);
    setActive(index);
  };
  const select = (index: number) => {
    inspect(index);
    const bar = model.bars[index];
    if (bar) onBarClick?.(bar.data, bar.index);
  };
  const focusBar = (index: number) => {
    setFocus(index);
    const node = targets.current.get(index),
      view = viewport.current;
    if (node && view) {
      const bounds = node.getBoundingClientRect(),
        outer = view.getBoundingClientRect();
      if (bounds.left < outer.left)
        view.scrollLeft -= outer.left - bounds.left + 8;
      if (bounds.right > outer.right)
        view.scrollLeft += bounds.right - outer.right + 8;
      if (bounds.top < outer.top) view.scrollTop -= outer.top - bounds.top + 8;
      if (bounds.bottom > outer.bottom)
        view.scrollTop += bounds.bottom - outer.bottom + 8;
      node.focus({ preventScroll: true });
    }
  };
  const keyDown = (event: React.KeyboardEvent, index: number) => {
    const keys: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: model.bars.length - 1,
    };
    if (event.key in keys) {
      event.preventDefault();
      focusBar(Math.max(0, Math.min(model.bars.length - 1, keys[event.key]!)));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(index);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setActive(null);
    }
  };
  const selected = ready && active !== null ? bars[active] : null;
  const tipBar = selected && model.bars[selected.bar.index];
  const tipData: WaterfallChartTooltipData<T> | null =
    selected && tipBar
      ? {
          label: tipBar.label,
          type: tipBar.type,
          value: tipBar.value,
          previous: tipBar.previous,
          start: tipBar.start,
          end: tipBar.end,
          cumulative: tipBar.cumulative,
          color: selected.color,
          index: tipBar.index,
          data: tipBar.data,
          formattedValue: formatWaterfallDelta(tipBar, valueFormatter),
          formattedCumulative: valueFormatter(tipBar.cumulative),
        }
      : null;
  const legend = [
    {
      label: "Increase",
      color: palette.increase,
      present: model.bars.some(
        (bar) => bar.type === "increase" && bar.value !== 0,
      ),
    },
    {
      label: "Decrease",
      color: palette.decrease,
      present: model.bars.some(
        (bar) => bar.type === "decrease" && bar.value !== 0,
      ),
    },
    {
      label: "Total",
      color: palette.total,
      present: model.bars.some(
        (bar) => bar.type === "total" || bar.type === "sum",
      ),
    },
    {
      label: "Subtotal",
      color: palette.subtotal,
      present: model.bars.some((bar) => bar.type === "subtotal"),
    },
    {
      label: "No change",
      color: palette.neutral,
      present: model.bars.some(
        (bar) => ["increase", "decrease"].includes(bar.type) && bar.value === 0,
      ),
    },
  ].filter((item) => item.present);
  return (
    <div
      ref={rootRef}
      className={cn("relative w-full min-w-0", className)}
      style={{ height: frameHeight }}
      aria-busy={loading}
      data-waterfall-chart=""
    >
      <p id={`${id}-description`} className="sr-only">
        {description} Each step shows a change or balance. Use arrow keys to
        inspect steps, Enter or Space to select, and Escape to dismiss. View
        data lists every step.{" "}
        {initialValue !== 0 &&
          `Opening balance ${valueFormatter(initialValue)}.`}
      </p>
      <div
        ref={viewport}
        className="overflow-auto overscroll-contain"
        style={{ height: viewportHeight }}
        onScroll={(event) =>
          setScroll({
            x: event.currentTarget.scrollLeft,
            y: event.currentTarget.scrollTop,
          })
        }
      >
        {chartError && (!loading || !!configError) ? (
          <div
            role="alert"
            className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center"
          >
            <p className="font-medium">Chart Error</p>
            <p className="text-sm text-muted-foreground">{chartError}</p>
          </div>
        ) : !loading && !data.length ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <p>No Data</p>
            <p className="text-sm text-muted-foreground">
              There are no steps to display.
            </p>
          </div>
        ) : (
          width > 0 && (
            <svg
              width={svgWidth}
              height={svgHeight}
              role="group"
              aria-label={ariaLabel}
              aria-describedby={`${id}-description`}
              aria-hidden={loading || undefined}
              onMouseLeave={() => setActive(null)}
              onBlur={(event) => {
                if (
                  !event.currentTarget.contains(
                    event.relatedTarget as Node | null,
                  )
                )
                  setActive(null);
              }}
            >
              <g transform={`translate(${left} ${top})`}>
                <g aria-hidden="true">
                  {scale.ticks.map((tick, i) => {
                    const p = pixel(tick);
                    return (
                      <g key={i}>
                        {showGrid && (
                          <line
                            x1={vertical ? 0 : p}
                            y1={vertical ? p : 0}
                            x2={vertical ? plotWidth : p}
                            y2={vertical ? p : plotHeight}
                            stroke="currentColor"
                            opacity={0.09}
                            strokeDasharray={getGridDasharray(gridStyle)}
                          />
                        )}
                        <text
                          x={vertical ? -10 : p}
                          y={vertical ? p : plotHeight + 20}
                          textAnchor={vertical ? "end" : "middle"}
                          dominantBaseline={vertical ? "middle" : undefined}
                          fontSize={11}
                          className="fill-muted-foreground"
                        >
                          {truncateLabel(
                            tickLabels[i]!,
                            vertical ? left - 12 : 95,
                          )}
                        </text>
                      </g>
                    );
                  })}
                  <line
                    data-waterfall-zero=""
                    x1={vertical ? 0 : pixel(0)}
                    y1={vertical ? pixel(0) : 0}
                    x2={vertical ? plotWidth : pixel(0)}
                    y2={vertical ? pixel(0) : plotHeight}
                    stroke="currentColor"
                    opacity={0.22}
                  />
                  {showConnectors &&
                    bars.map((item, i) => {
                      const next = bars[i + 1];
                      if (!next?.bar.connectFromPrevious) return null;
                      const level = pixel(item.bar.cumulative),
                        cross = item.cross + thickness,
                        nextCross = next.cross;
                      return (
                        <line
                          key={i}
                          data-waterfall-connector={i}
                          x1={vertical ? cross : level}
                          y1={vertical ? level : cross}
                          x2={vertical ? nextCross : level}
                          y2={vertical ? level : nextCross}
                          stroke="currentColor"
                          opacity={0.3}
                          strokeDasharray={
                            connectorStyle === "dashed"
                              ? "3 3"
                              : connectorStyle === "dotted"
                                ? "1 3"
                                : undefined
                          }
                        />
                      );
                    })}
                </g>
                {bars.map(({ bar, color, a, b, cross, rect }) => {
                  const zero = bar.start === bar.end;
                  const label = formatWaterfallDelta(bar, valueFormatter);
                  const radius = Math.min(
                    borderRadius,
                    rect.width / 2,
                    rect.height / 2,
                  );
                  const target = vertical
                    ? {
                        x: bar.index * slot + 2,
                        y: Math.max(
                          0,
                          rect.y -
                            Math.max(
                              0,
                              (coarsePointer ? 44 : 24) - rect.height,
                            ) /
                              2,
                        ),
                        width: slot - 4,
                        height: Math.max(coarsePointer ? 44 : 24, rect.height),
                      }
                    : {
                        x: Math.max(
                          0,
                          rect.x -
                            Math.max(
                              0,
                              (coarsePointer ? 44 : 24) - rect.width,
                            ) /
                              2,
                        ),
                        y: bar.index * slot + 2,
                        width: Math.max(coarsePointer ? 44 : 24, rect.width),
                        height: slot - 4,
                      };
                  const labelFits = vertical
                    ? label.length * 6.5 <= slot - 4
                    : true;
                  const downward = b > a;
                  const labelX = vertical
                    ? cross + thickness / 2
                    : b + (downward ? 7 : -7);
                  const labelY = vertical
                    ? b + (downward ? 15 : -7)
                    : cross + thickness / 2;
                  const horizontalRoom = downward ? plotWidth - b : b;
                  const showLabel =
                    showValues &&
                    !loading &&
                    labelFits &&
                    (vertical || horizontalRoom >= label.length * 6.5 + 8);
                  return (
                    <g key={bar.index}>
                      <GrowingMark
                        progress={progress}
                        anchor={a}
                        vertical={vertical}
                        index={bar.index}
                        count={bars.length}
                      >
                        {zero ? (
                          <line
                            data-waterfall-mark={bar.index}
                            x1={vertical ? cross : a}
                            y1={vertical ? a : cross}
                            x2={vertical ? cross + thickness : a}
                            y2={vertical ? a : cross + thickness}
                            stroke={loading ? "currentColor" : color}
                            strokeWidth={2}
                            className={cn(loading && "text-muted")}
                          />
                        ) : (
                          <rect
                            data-waterfall-mark={bar.index}
                            {...rect}
                            rx={radius}
                            fill={
                              loading
                                ? "currentColor"
                                : variant === "outline"
                                  ? "none"
                                  : color
                            }
                            stroke={loading ? "currentColor" : color}
                            strokeWidth={variant === "outline" ? 1.5 : 0}
                            className={cn(
                              loading && "text-muted",
                              loading
                                ? "animate-pulse motion-reduce:animate-none"
                                : undefined,
                            )}
                          />
                        )}
                      </GrowingMark>
                      {showLabel && (
                        <text
                          aria-hidden="true"
                          data-waterfall-value={bar.index}
                          x={labelX}
                          y={labelY}
                          textAnchor={
                            vertical ? "middle" : downward ? "start" : "end"
                          }
                          dominantBaseline={vertical ? undefined : "middle"}
                          fontSize={11}
                          className="pointer-events-none fill-foreground font-medium tabular-nums"
                        >
                          {label}
                        </text>
                      )}
                      <text
                        aria-hidden="true"
                        x={vertical ? cross + thickness / 2 : -10}
                        y={vertical ? plotHeight + 20 : cross + thickness / 2}
                        textAnchor={vertical ? "middle" : "end"}
                        dominantBaseline={vertical ? undefined : "middle"}
                        fontSize={11}
                        className="pointer-events-none fill-muted-foreground"
                      >
                        <title>{bar.label}</title>
                        {truncateLabel(
                          bar.label,
                          vertical ? slot - 8 : left - 18,
                        )}
                      </text>
                      {ready && (
                        <rect
                          ref={(node) => {
                            if (node) targets.current.set(bar.index, node);
                            else targets.current.delete(bar.index);
                          }}
                          data-waterfall-target={bar.index}
                          {...target}
                          rx={Math.min(borderRadius + 2, 8)}
                          fill="transparent"
                          stroke={
                            active === bar.index ||
                            (hasFocus && focus === bar.index)
                              ? "currentColor"
                              : "transparent"
                          }
                          strokeWidth={1.5}
                          className="touch-manipulation outline-none text-foreground"
                          style={{ cursor: onBarClick ? "pointer" : "default" }}
                          tabIndex={focus === bar.index ? 0 : -1}
                          role="graphics-symbol"
                          aria-label={`${bar.label}: ${TYPE_LABELS[bar.type]}, ${label}, running total ${valueFormatter(bar.cumulative)}${!bar.connectFromPrevious && bar.index > 0 ? ", resets balance" : ""}`}
                          aria-describedby={
                            active === bar.index ? `${id}-tooltip` : undefined
                          }
                          onMouseEnter={() => inspect(bar.index)}
                          onFocus={() => {
                            setHasFocus(true);
                            setFocus(bar.index);
                            inspect(bar.index);
                          }}
                          onBlur={() => setHasFocus(false)}
                          onClick={() => select(bar.index)}
                          onKeyDown={(event) => keyDown(event, bar.index)}
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          )
        )}
      </div>
      {showLegend && (
        <div
          aria-label="Chart legend"
          className="flex items-center justify-center gap-3 overflow-x-auto text-[11px] text-muted-foreground"
          style={{ height: legendHeight }}
        >
          {legend.map((item) => (
            <span
              key={item.label}
              className="flex shrink-0 items-center gap-1.5"
            >
              <span
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
      <div
        className="flex items-center justify-between gap-2 px-2"
        style={{ height: footerHeight }}
      >
        <span className="truncate text-xs text-muted-foreground" role="status">
          {loading
            ? "Updating chart…"
            : ready
              ? `${model.bars.length} steps${svgWidth > width || svgHeight > viewportHeight ? " · Scroll for more" : ""}${initialValue !== 0 ? ` · Opening ${valueFormatter(initialValue)}` : ""}`
              : ""}
        </span>
        {ready && (
          <button
            ref={tableButton}
            type="button"
            className={buttonClass}
            aria-expanded={table}
            aria-controls={`${id}-table`}
            onFocus={() => setActive(null)}
            onClick={() => {
              setTable(!table);
              setActive(null);
            }}
          >
            {table ? "Hide data" : "View data"}
          </button>
        )}
      </div>
      {table && ready && (
        <div
          id={`${id}-table`}
          className="absolute inset-x-0 bottom-9 z-20 max-h-[75%] overflow-auto rounded-md border bg-popover p-3 shadow-lg"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setTable(false);
              setActive(null);
              tableButton.current?.focus();
            }
          }}
        >
          <table className="w-full text-left text-xs">
            <caption className="mb-3 text-left font-medium">
              {ariaLabel} · {model.bars.length} steps
            </caption>
            <thead className="text-muted-foreground">
              <tr>
                <th className="p-2">Step</th>
                <th className="p-2">Type</th>
                <th className="p-2 text-right">Value</th>
                <th className="p-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {model.bars.map((bar) => (
                <tr key={bar.index} className="border-t">
                  <td className="p-2">
                    <button
                      type="button"
                      className={cn(buttonClass, "text-left")}
                      onFocus={() => setActive(null)}
                      onClick={() => onBarClick?.(bar.data, bar.index)}
                    >
                      {bar.label}
                    </button>
                  </td>
                  <td className="p-2">{TYPE_LABELS[bar.type]}</td>
                  <td className="p-2 text-right tabular-nums">
                    {formatWaterfallDelta(bar, valueFormatter)}
                  </td>
                  <td className="p-2 text-right tabular-nums">
                    {valueFormatter(bar.cumulative)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selected && tipData && !table && (
        <InspectionTooltip
          id={`${id}-tooltip`}
          x={left + selected.rect.x + selected.rect.width / 2 - scroll.x}
          y={top + selected.rect.y + selected.rect.height / 2 - scroll.y}
          width={width}
          height={frameHeight}
        >
          {tooltipRenderer ? (
            tooltipRenderer(tipData)
          ) : (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{ backgroundColor: tipData.color }}
                />
                <span className="max-w-64 font-medium">{tipData.label}</span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-muted-foreground">
                  {TYPE_LABELS[tipData.type]}
                </span>
                <span className="font-semibold tabular-nums">
                  {tipData.formattedValue}
                </span>
              </div>
              {tipData.type === "subtotal" && (
                <div className="flex justify-between gap-6">
                  <span className="text-muted-foreground">Checkpoint</span>
                  <span>{valueFormatter(tipData.start)}</span>
                </div>
              )}
              <div className="flex justify-between gap-6 border-t pt-2">
                <span className="text-muted-foreground">Running balance</span>
                <span className="tabular-nums">
                  {tipData.formattedCumulative}
                </span>
              </div>
              {!selected.bar.connectFromPrevious && selected.bar.index > 0 && (
                <p className="text-muted-foreground">
                  Resets balance from {valueFormatter(tipData.previous)}.
                </p>
              )}
            </div>
          )}
        </InspectionTooltip>
      )}
    </div>
  );
}
export const WaterfallChart = memo(
  WaterfallChartComponent,
) as typeof WaterfallChartComponent;
export type { WaterfallChartProps, WaterfallColors };
export type { WaterfallBar, WaterfallType, WaterfallVariant } from "./utils";
export { DEFAULT_COLORS };
