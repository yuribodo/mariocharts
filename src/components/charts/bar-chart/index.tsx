"use client";

import {
  memo,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../../../lib/utils";
import {
  formatValue,
  getGridDasharray,
  useContainerDimensions,
} from "../_shared";
import type {
  ChartDataItem,
  BarChartTooltipData,
  TooltipRenderer,
} from "../_shared";
import {
  getBarDomain,
  getBarGeometry,
  parseBarValue,
  scaleBarValue,
} from "./utils";
import { BarTooltip } from "./tooltip";

interface BarChartProps<T extends ChartDataItem> {
  /** Rows with finite numeric values. Missing/invalid values display an error, not zero. */
  readonly data: readonly T[];
  /** Category key; categories retain input order. */
  readonly x: keyof T;
  /** Numeric key. Defaults to "value". Unambiguous numeric strings are supported. */
  readonly y?: keyof T;
  readonly colors?: readonly string[];
  readonly className?: string;
  /** Stable frame height in every state. Defaults to 300. */
  readonly height?: number;
  /** Shows a skeleton in the chart's geometry; retain data during refresh to preserve bar positions. */
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly variant?: "filled" | "outline";
  readonly orientation?: "vertical" | "horizontal";
  readonly showValues?: boolean;
  readonly showGrid?: boolean;
  readonly gridStyle?: "solid" | "dashed" | "dotted";
  readonly onBarClick?: (data: T, index: number) => void;
  readonly tooltipRenderer?: TooltipRenderer<BarChartTooltipData<T>>;
  /** Formats tooltips, value labels and accessible values; also ticks unless overridden. */
  readonly valueFormatter?: (value: number) => string;
  /** Optional compact tick formatter, independent of detailed inspection values. */
  readonly axisValueFormatter?: (value: number) => string;
  /** Accessible chart name. */
  readonly ariaLabel?: string;
  /** Optional context, units, or explanation announced with the chart. */
  readonly description?: string;
}

const DEFAULT_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
] as const;
const DEFAULT_HEIGHT = 300;
const ANIMATION_EASING = [0.4, 0, 0.2, 1] as const;

function shortenLabel(label: string, availableWidth: number) {
  const characters = Math.max(1, Math.floor(availableWidth / 6.5));
  return label.length > characters
    ? `${label.slice(0, Math.max(0, characters - 1))}…`
    : label;
}

function BarChartComponent<T extends ChartDataItem>({
  data,
  x,
  y = "value" as keyof T,
  colors = DEFAULT_COLORS,
  className,
  height = DEFAULT_HEIGHT,
  loading = false,
  error = null,
  animation = true,
  variant = "filled",
  orientation = "vertical",
  showValues = false,
  showGrid = false,
  gridStyle = "dashed",
  onBarClick,
  tooltipRenderer,
  valueFormatter = formatValue,
  axisValueFormatter = valueFormatter,
  ariaLabel,
  description,
}: BarChartProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const id = useId();
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animation && !reduceMotion;
  const barRefs = useRef<(SVGRectElement | null)[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  // Replacing input invalidates inspection instead of selecting a different row by accident.
  const [inspection, setInspection] = useState<{
    data: readonly T[];
    index: number;
  } | null>(null);
  const [focus, setFocus] = useState<{
    data: readonly T[];
    index: number;
  } | null>(null);
  const activeIndex = inspection?.data === data ? inspection.index : null;
  const focusIndex = focus?.data === data ? focus.index : null;
  const vertical = orientation === "vertical";
  const validHeight = Number.isFinite(height) && height > 0;
  const frameHeight = validHeight ? height : DEFAULT_HEIGHT;

  const model = useMemo(() => {
    const values: number[] = [];
    let validationError: string | null = null;
    for (let index = 0; index < data.length; index++) {
      const item = data[index]!;
      const value = parseBarValue(item[y]);
      if (value === null) {
        validationError = `Row ${index + 1}: "${String(y)}" must contain a finite number. Supply a value or remove this row; missing values are not zero.`;
        break;
      }
      if (item[x] === null || item[x] === undefined) {
        validationError = `Row ${index + 1}: category "${String(x)}" is missing. Check the x key or provide a label.`;
        break;
      }
      values.push(value);
    }
    return { values, validationError };
  }, [data, x, y]);
  // Use known geometry during refresh; initial loading has neutral placeholders.
  const layoutValues = useMemo(
    () =>
      loading && (!data.length || model.validationError)
        ? Array.from(
            { length: data.length || 6 },
            (_, index) => [40, 65, 50, 85, 70, 55][index % 6]!,
          )
        : model.values,
    [loading, data.length, model],
  );
  const domain = useMemo(() => getBarDomain(layoutValues), [layoutValues]);
  const tickLabels = useMemo(
    () => domain.ticks.map(axisValueFormatter),
    [domain.ticks, axisValueFormatter],
  );
  const labels = useMemo(
    () => data.map((item) => String(item[x] ?? "")),
    [data, x],
  );
  const leftLabelWidth = (vertical ? tickLabels : labels).reduce(
    (width, label) => Math.max(width, label.length * 6.5 + 16),
    50,
  );
  const margin = {
    top: 20,
    right: 20,
    bottom: 40,
    left: Math.min(leftLabelWidth, Math.max(50, containerWidth * 0.35)),
  };
  const plotWidth = Math.max(0, containerWidth - margin.left - margin.right);
  const plotHeight = Math.max(0, frameHeight - margin.top - margin.bottom);
  const bars = useMemo(
    () =>
      layoutValues.map((value, index) => ({
        ...getBarGeometry(
          value,
          index,
          layoutValues.length,
          plotWidth,
          plotHeight,
          domain,
          orientation,
        ),
        value,
        index,
        data: data[index]!,
        label: labels[index] ?? "",
        color: colors[index % colors.length] ?? DEFAULT_COLORS[0],
        formattedValue: loading ? "" : valueFormatter(value),
      })),
    [
      layoutValues,
      domain,
      loading,
      data,
      plotWidth,
      plotHeight,
      orientation,
      labels,
      colors,
      valueFormatter,
    ],
  );
  const chartError =
    error ||
    (!validHeight
      ? "Chart height must be a positive, finite number."
      : model.validationError);
  const ready =
    !loading &&
    !chartError &&
    data.length > 0 &&
    plotWidth > 0 &&
    plotHeight > 0;
  const activeBar =
    ready && activeIndex !== null ? bars[activeIndex] : undefined;
  const selectedTabIndex = Math.min(tabIndex, Math.max(0, bars.length - 1));
  const zero = vertical
    ? plotHeight - scaleBarValue(0, domain.min, domain.max, plotHeight)
    : scaleBarValue(0, domain.min, domain.max, plotWidth);
  const categoryStep = Math.max(
    1,
    Math.ceil(
      (vertical ? 36 : 20) /
        ((vertical ? plotWidth : plotHeight) / Math.max(1, bars.length)),
    ),
  );

  function inspect(index: number) {
    setInspection({ data, index });
  }
  function handleKeyDown(event: KeyboardEvent<SVGRectElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = Math.min(bars.length - 1, index + 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = Math.max(0, index - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = bars.length - 1;
    else if (event.key === "Escape") {
      setInspection(null);
      event.preventDefault();
      return;
    } else if ((event.key === "Enter" || event.key === " ") && onBarClick) {
      event.preventDefault();
      onBarClick(data[index]!, index);
      return;
    } else return;
    event.preventDefault();
    setTabIndex(next);
    setFocus({ data, index: next });
    inspect(next);
    barRefs.current[next]?.focus();
  }
  const tooltipData: BarChartTooltipData<T> | null = activeBar
    ? {
        label: activeBar.label,
        value: activeBar.value,
        rawValue: activeBar.data[y],
        color: activeBar.color,
        index: activeBar.index,
        data: activeBar.data,
      }
    : null;

  // This node stays mounted in every state so measurement never loses its target.
  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height: frameHeight }}
      aria-busy={loading}
      onMouseLeave={() => setInspection(focus?.data === data ? focus : null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocus(null);
          setInspection(null);
        }
      }}
    >
      {loading && (
        <span role="status" className="sr-only">
          Loading chart
        </span>
      )}
      {!loading && chartError ? (
        <div
          role="alert"
          className="flex h-full items-center justify-center p-6 text-center"
        >
          <div className="space-y-2">
            <p className="font-medium text-destructive">Chart Error</p>
            <p className="text-sm text-muted-foreground">{chartError}</p>
          </div>
        </div>
      ) : !loading && !data.length ? (
        <div
          role="status"
          className="flex h-full items-center justify-center p-6 text-center"
        >
          <div className="space-y-2">
            <p className="text-muted-foreground">No Data</p>
            <p className="text-sm text-muted-foreground">
              There&apos;s no data to display
            </p>
          </div>
        </div>
      ) : !loading && !ready ? (
        <div
          role="status"
          className="flex h-full items-center justify-center text-sm text-muted-foreground"
        >
          Waiting for chart space
        </div>
      ) : (
        <>
          <svg
            width="100%"
            height={frameHeight}
            role={loading ? "presentation" : "group"}
            aria-hidden={loading || undefined}
            aria-label={
              ariaLabel ??
              `Bar chart with ${data.length} bars in ${orientation} orientation`
            }
            aria-describedby={`${id}-description`}
          >
            <desc id={`${id}-description`}>
              {description ? `${description} ` : ""}Use arrow keys to inspect
              bars, Home or End to jump, and Escape to dismiss the tooltip.
              {onBarClick ? " Press Enter or Space to select a bar." : ""}
            </desc>
            <g
              transform={`translate(${margin.left}, ${margin.top})`}
              onMouseLeave={() =>
                setInspection(focus?.data === data ? focus : null)
              }
            >
              {domain.ticks.map((tick, index) => {
                const coordinate = scaleBarValue(
                  tick,
                  domain.min,
                  domain.max,
                  vertical ? plotHeight : plotWidth,
                );
                const position = vertical
                  ? plotHeight - coordinate
                  : coordinate;
                return (
                  <g key={tick} aria-hidden="true">
                    {showGrid && tick !== 0 && (
                      <line
                        x1={vertical ? 0 : position}
                        x2={vertical ? plotWidth : position}
                        y1={vertical ? position : 0}
                        y2={vertical ? position : plotHeight}
                        stroke="currentColor"
                        opacity={0.1}
                        strokeDasharray={getGridDasharray(gridStyle)}
                      />
                    )}
                    {loading ? (
                      <rect
                        x={vertical ? -36 : position - 12}
                        y={vertical ? position - 4 : plotHeight + 10}
                        width={24}
                        height={8}
                        rx={3}
                        className="fill-muted"
                      />
                    ) : (
                      <text
                        x={vertical ? -8 : position}
                        y={vertical ? position : plotHeight + 18}
                        textAnchor={vertical ? "end" : "middle"}
                        dominantBaseline={vertical ? "middle" : "auto"}
                        fontSize={11}
                        className="fill-muted-foreground"
                      >
                        {shortenLabel(
                          tickLabels[index]!,
                          vertical
                            ? margin.left - 12
                            : Math.max(24, plotWidth / domain.ticks.length),
                        )}
                      </text>
                    )}
                  </g>
                );
              })}
              <g aria-hidden="true">
                <line
                  x1={0}
                  x2={vertical ? 0 : plotWidth}
                  y1={vertical ? 0 : plotHeight}
                  y2={plotHeight}
                  stroke="currentColor"
                  opacity={0.2}
                />
                {vertical && zero !== plotHeight && (
                  <line
                    x1={0}
                    x2={plotWidth}
                    y1={plotHeight}
                    y2={plotHeight}
                    stroke="currentColor"
                    opacity={0.2}
                  />
                )}
                <line
                  data-zero-baseline=""
                  x1={vertical ? 0 : zero}
                  x2={vertical ? plotWidth : zero}
                  y1={vertical ? zero : 0}
                  y2={vertical ? zero : plotHeight}
                  stroke="currentColor"
                  opacity={0.4}
                  strokeWidth={1.5}
                />
              </g>
              {bars.map((bar) => {
                if (loading)
                  return (
                    <g key={bar.index} aria-hidden="true">
                      <rect
                        data-loading-bar={bar.index}
                        x={bar.x}
                        y={bar.y}
                        width={bar.width}
                        height={bar.height}
                        rx={4}
                        fill={variant === "filled" ? "currentColor" : "none"}
                        stroke={variant === "outline" ? "currentColor" : "none"}
                        strokeWidth={variant === "outline" ? 2 : 0}
                        className={cn(
                          "text-muted",
                          shouldAnimate &&
                            "animate-pulse motion-reduce:animate-none",
                        )}
                      />
                      {bar.value === 0 && (
                        <line
                          x1={vertical ? bar.x : zero}
                          x2={vertical ? bar.x + bar.width : zero}
                          y1={vertical ? zero : bar.y}
                          y2={vertical ? zero : bar.y + bar.height}
                          stroke="currentColor"
                          strokeWidth={2}
                          className="text-muted"
                        />
                      )}
                      {bar.index % categoryStep === 0 && (
                        <rect
                          x={
                            vertical
                              ? bar.x +
                                bar.width / 2 -
                                Math.min(24, bar.width) / 2
                              : -36
                          }
                          y={
                            vertical
                              ? plotHeight + 10
                              : bar.y + bar.height / 2 - 4
                          }
                          width={vertical ? Math.min(24, bar.width) : 24}
                          height={8}
                          rx={3}
                          className="fill-muted"
                        />
                      )}
                    </g>
                  );
                const hit = {
                  x: vertical
                    ? bar.x
                    : Math.max(
                        0,
                        Math.min(
                          bar.x - Math.max(0, 12 - bar.width) / 2,
                          plotWidth - 12,
                        ),
                      ),
                  y: vertical
                    ? Math.max(
                        0,
                        Math.min(
                          bar.y - Math.max(0, 12 - bar.height) / 2,
                          plotHeight - 12,
                        ),
                      )
                    : bar.y,
                  width: vertical
                    ? bar.width
                    : Math.min(plotWidth, Math.max(12, bar.width)),
                  height: vertical
                    ? Math.min(plotHeight, Math.max(12, bar.height))
                    : bar.height,
                };
                return (
                  <g key={bar.index}>
                    <rect
                      data-inspection-band={bar.index}
                      aria-hidden="true"
                      x={vertical ? (bar.index * plotWidth) / bars.length : 0}
                      y={vertical ? 0 : (bar.index * plotHeight) / bars.length}
                      width={vertical ? plotWidth / bars.length : plotWidth}
                      height={vertical ? plotHeight : plotHeight / bars.length}
                      fill="currentColor"
                      opacity={activeIndex === bar.index ? 0.04 : 0}
                      onMouseEnter={() => inspect(bar.index)}
                      onPointerDown={() => inspect(bar.index)}
                    />
                    <motion.rect
                      data-bar-index={bar.index}
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={bar.height}
                      fill={variant === "filled" ? bar.color : "none"}
                      stroke={variant === "outline" ? bar.color : "none"}
                      strokeWidth={variant === "outline" ? 2 : 0}
                      rx={4}
                      aria-hidden="true"
                      className="pointer-events-none"
                      style={{
                        // Motion calculates SVG transformOrigin from these values.
                        originX: vertical ? 0.5 : `${zero}px`,
                        originY: vertical ? `${zero}px` : 0.5,
                      }}
                      initial={
                        shouldAnimate
                          ? vertical
                            ? { scaleY: 0, scaleX: 1 }
                            : { scaleX: 0, scaleY: 1 }
                          : false
                      }
                      animate={{ scaleX: 1, scaleY: 1 }}
                      transition={{
                        duration: shouldAnimate ? 0.6 : 0,
                        delay: shouldAnimate
                          ? Math.min(bar.index * 0.04, 0.4)
                          : 0,
                        ease: ANIMATION_EASING,
                      }}
                    />
                    {bar.value === 0 && (
                      <line
                        aria-hidden="true"
                        x1={vertical ? bar.x : zero}
                        x2={vertical ? bar.x + bar.width : zero}
                        y1={vertical ? zero : bar.y}
                        y2={vertical ? zero : bar.y + bar.height}
                        stroke={bar.color}
                        strokeWidth={2}
                      />
                    )}
                    <rect
                      {...hit}
                      ref={(element) => {
                        barRefs.current[bar.index] = element;
                      }}
                      fill="transparent"
                      role={onBarClick ? "button" : "graphics-symbol"}
                      tabIndex={bar.index === selectedTabIndex ? 0 : -1}
                      aria-label={`${bar.label}: ${bar.formattedValue}`}
                      aria-describedby={
                        activeIndex === bar.index ? `${id}-tooltip` : undefined
                      }
                      className={cn(
                        "touch-manipulation outline-none",
                        onBarClick ? "cursor-pointer" : "cursor-default",
                      )}
                      onMouseEnter={() => inspect(bar.index)}
                      onPointerDown={() => inspect(bar.index)}
                      onFocus={() => {
                        setFocus({ data, index: bar.index });
                        setTabIndex(bar.index);
                        inspect(bar.index);
                      }}
                      onClick={() => {
                        inspect(bar.index);
                        onBarClick?.(bar.data, bar.index);
                      }}
                      onKeyDown={(event) => handleKeyDown(event, bar.index)}
                    />
                    {(focusIndex === bar.index ||
                      activeIndex === bar.index) && (
                      <rect
                        {...hit}
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={focusIndex === bar.index ? 2 : 1}
                        rx={4}
                        className="pointer-events-none text-foreground"
                      />
                    )}
                    {showValues && (
                      <text
                        aria-hidden="true"
                        x={
                          vertical
                            ? bar.x + bar.width / 2
                            : bar.value < 0
                              ? bar.x + 6
                              : bar.x + bar.width - 6
                        }
                        y={
                          vertical
                            ? bar.value < 0
                              ? Math.min(
                                  plotHeight - 6,
                                  bar.y + bar.height + 14,
                                )
                              : bar.y - 6
                            : bar.y + bar.height / 2
                        }
                        textAnchor={
                          vertical ? "middle" : bar.value < 0 ? "start" : "end"
                        }
                        dominantBaseline={vertical ? "auto" : "middle"}
                        fontSize={11}
                        className="pointer-events-none fill-foreground font-medium"
                      >
                        {shortenLabel(
                          bar.formattedValue,
                          vertical ? bar.width : Math.max(24, bar.width - 12),
                        )}
                      </text>
                    )}
                    {bar.index % categoryStep === 0 && (
                      <text
                        aria-hidden="true"
                        x={vertical ? bar.x + bar.width / 2 : -8}
                        y={vertical ? plotHeight + 18 : bar.y + bar.height / 2}
                        textAnchor={vertical ? "middle" : "end"}
                        dominantBaseline={vertical ? "auto" : "middle"}
                        fontSize={11}
                        className="pointer-events-none fill-muted-foreground"
                      >
                        {shortenLabel(
                          bar.label,
                          vertical
                            ? (plotWidth / bars.length) * categoryStep - 4
                            : margin.left - 12,
                        )}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
          {activeBar && tooltipData && (
            <BarTooltip
              id={`${id}-tooltip`}
              x={
                margin.left +
                activeBar.x +
                (vertical
                  ? activeBar.width / 2
                  : activeBar.value < 0
                    ? 0
                    : activeBar.width)
              }
              y={
                margin.top + activeBar.y + (vertical ? 0 : activeBar.height / 2)
              }
              width={containerWidth}
              height={frameHeight}
            >
              {tooltipRenderer ? (
                tooltipRenderer(tooltipData)
              ) : (
                <>
                  <div className="mb-2 border-b border-border pb-2 text-xs font-medium text-muted-foreground">
                    {activeBar.label}
                  </div>
                  <div className="flex min-w-24 items-center justify-between gap-6">
                    <span
                      className="size-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: activeBar.color }}
                    />
                    <span className="text-sm font-semibold tabular-nums">
                      {activeBar.formattedValue}
                    </span>
                  </div>
                </>
              )}
            </BarTooltip>
          )}
        </>
      )}
    </div>
  );
}

// React.memo otherwise erases the relationship between data, keys and callbacks.
export const BarChart = memo(BarChartComponent) as typeof BarChartComponent;
export type { ChartDataItem, BarChartProps };
export { DEFAULT_COLORS, formatValue };
