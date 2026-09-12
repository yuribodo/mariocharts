"use client";

import {
  memo,
  useId,
  useMemo,
  useRef,
  useState,
  useEffect,
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
  LineChartTooltipData,
  TooltipRenderer,
} from "../_shared";
import {
  getLineArea,
  getLineDomain,
  getLinePath,
  getLineSegments,
  parseLineValue,
  scaleLineValue,
} from "./utils";
import { LineTooltip } from "./tooltip";

interface LineChartProps<T extends ChartDataItem> {
  /** Rows in display order. Null/undefined values are gaps; malformed numbers display an error. */
  readonly data: readonly T[];
  /** Equally spaced category labels, including date strings; not a continuous time scale. */
  readonly x: keyof T;
  readonly y: keyof T | readonly (keyof T)[];
  readonly colors?: readonly string[];
  readonly className?: string;
  /** Total frame height, including the legend, in every state. */
  readonly height?: number;
  /** Retain data during refresh to preserve the exact line geometry in the skeleton. */
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly strokeWidth?: number;
  /** Monotone avoids spurious extrema; natural splines may overshoot between observations. */
  readonly curve?: "linear" | "monotone" | "natural" | "step";
  readonly showDots?: boolean;
  readonly showArea?: boolean;
  /** Original indices in y; empty series never shift this mapping. */
  readonly showAreaForSeries?: readonly number[];
  readonly showGrid?: boolean;
  readonly gridStyle?: "solid" | "dashed" | "dotted";
  readonly showLegend?: boolean;
  /** Opt in to bridging missing observations. Defaults to false. */
  readonly connectNulls?: boolean;
  readonly onPointClick?: (data: T, index: number, series?: string) => void;
  readonly tooltipRenderer?: TooltipRenderer<LineChartTooltipData<T>>;
  readonly valueFormatter?: (value: number) => string;
  readonly axisValueFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
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
const LEGEND_HEIGHT = 40;
const EASING = [0.4, 0, 0.2, 1] as const;

function shorten(label: string, width: number) {
  const count = Math.max(1, Math.floor(width / 6.5));
  return label.length > count
    ? `${label.slice(0, Math.max(0, count - 1))}…`
    : label;
}

function LineChartComponent<T extends ChartDataItem>({
  data,
  x,
  y,
  colors = DEFAULT_COLORS,
  className,
  height = DEFAULT_HEIGHT,
  loading = false,
  error = null,
  animation = true,
  strokeWidth = 2,
  curve = "monotone",
  showDots = true,
  showArea = false,
  showAreaForSeries,
  showGrid = false,
  gridStyle = "dashed",
  showLegend = false,
  connectNulls = false,
  onPointClick,
  tooltipRenderer,
  valueFormatter = formatValue,
  axisValueFormatter = valueFormatter,
  ariaLabel,
  description,
}: LineChartProps<T>) {
  const [containerRef, containerWidth] = useContainerDimensions();
  const id = useId();
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animation && !reduceMotion;
  const refs = useRef<(SVGRectElement | null)[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [inspection, setInspection] = useState<{
    data: readonly T[];
    index: number;
  } | null>(null);
  const [focus, setFocus] = useState<{
    data: readonly T[];
    index: number;
    seriesIndex: number;
  } | null>(null);
  useEffect(() => {
    setInspection(null);
    setFocus(null);
  }, [loading, error, data, x]);
  const keys = useMemo<readonly (keyof T)[]>(
    () => (Array.isArray(y) ? y : [y as keyof T]),
    [y],
  );
  const model = useMemo(() => {
    let validationError: string | null = keys.length
      ? null
      : "Supply at least one numeric key in y.";
    if (new Set(keys).size !== keys.length)
      validationError =
        "Each key in y must be unique. Remove duplicate series keys.";
    const labels = data.map((row, index) => {
      if (row[x] === null || row[x] === undefined)
        validationError ??= `Row ${index + 1}: category "${String(x)}" is missing. Check the x key.`;
      return String(row[x] ?? "");
    });
    const values = keys.map((key) =>
      data.map((row, index) => {
        const raw = row[key];
        const value = parseLineValue(raw);
        if (raw !== null && raw !== undefined && value === null)
          validationError ??= `Row ${index + 1}: "${String(key)}" must contain a finite number or null for a gap.`;
        return value;
      }),
    );
    return { labels, values, validationError };
  }, [data, x, keys]);
  const knownValues = useMemo(
    () =>
      model.values.flat().filter((value): value is number => value !== null),
    [model],
  );
  const placeholder =
    loading && (!knownValues.length || !!model.validationError);
  const count = placeholder ? data.length || 6 : data.length;
  const values = useMemo(
    () =>
      placeholder
        ? keys.map((_, seriesIndex) =>
            Array.from(
              { length: count },
              (_, index) =>
                [40, 60, 48, 78, 65, 85][(index + seriesIndex) % 6]!,
            ),
          )
        : model.values,
    [placeholder, count, keys, model],
  );
  const domain = useMemo(
    () =>
      getLineDomain(
        placeholder
          ? values.flat().filter((value): value is number => value !== null)
          : knownValues,
      ),
    [placeholder, values, knownValues],
  );
  const tickLabels = useMemo(
    () => domain.ticks.map(axisValueFormatter),
    [domain, axisValueFormatter],
  );
  const validHeight = Number.isFinite(height) && height > 0;
  const frameHeight = validHeight ? height : DEFAULT_HEIGHT;
  const hasLegend = showLegend && keys.length > 1;
  const svgHeight = Math.max(0, frameHeight - (hasLegend ? LEGEND_HEIGHT : 0));
  const margin = {
    top: 20,
    right: 20,
    bottom: 40,
    left: Math.min(
      tickLabels.reduce(
        (width, label) => Math.max(width, label.length * 6.5 + 16),
        50,
      ),
      Math.max(50, containerWidth * 0.35),
    ),
  };
  const plotWidth = Math.max(0, containerWidth - margin.left - margin.right);
  const plotHeight = Math.max(0, svgHeight - margin.top - margin.bottom);
  const xPosition = (index: number) =>
    count > 1 ? (index / (count - 1)) * plotWidth : plotWidth / 2;
  const baseline = Math.max(
    0,
    Math.min(plotHeight, scaleLineValue(0, domain, plotHeight)),
  );
  const series = useMemo(
    () =>
      keys.map((key, seriesIndex) => {
        const points = values[seriesIndex]!.map((value, index) => ({
          x: count > 1 ? (index / (count - 1)) * plotWidth : plotWidth / 2,
          y: value === null ? 0 : scaleLineValue(value, domain, plotHeight),
          defined: value !== null,
          value,
          index,
        }));
        const segments = getLineSegments(points, connectNulls);
        return {
          key,
          seriesIndex,
          points,
          segments,
          isolatedX: new Set(
            segments
              .filter((segment) => segment.length === 1)
              .map((segment) => segment[0]!.x),
          ),
          color: colors[seriesIndex % colors.length] ?? DEFAULT_COLORS[0],
          line: segments
            .map((segment) => getLinePath(segment, curve))
            .join(" "),
          area: segments
            .map((segment) => getLineArea(segment, curve, baseline))
            .join(" "),
        };
      }),
    [
      keys,
      values,
      count,
      plotWidth,
      plotHeight,
      domain,
      connectNulls,
      colors,
      curve,
      baseline,
    ],
  );
  const chartError =
    error ||
    model.validationError ||
    (!validHeight ? "Chart height must be a positive, finite number." : null) ||
    (!(strokeWidth > 0) || !Number.isFinite(strokeWidth)
      ? "strokeWidth must be a positive, finite number."
      : null);
  const ready =
    !loading &&
    !chartError &&
    knownValues.length > 0 &&
    plotWidth > 0 &&
    plotHeight > 0;
  const activeIndex =
    ready && inspection?.data === data ? inspection.index : null;
  const focusIndex = ready && focus?.data === data ? focus.index : null;
  const activeItems =
    activeIndex === null
      ? []
      : series.filter((item) => item.points[activeIndex]?.defined);
  const selectedTab = Math.min(tabIndex, Math.max(0, data.length - 1));
  const categoryStep = Math.max(
    1,
    Math.ceil(48 / (plotWidth / Math.max(1, count - 1))),
  );
  const tooltipData: LineChartTooltipData<T> | null =
    activeIndex === null
      ? null
      : {
          label: model.labels[activeIndex]!,
          index: activeIndex,
          series: activeItems.map((item) => ({
            key: String(item.key),
            value: item.points[activeIndex]!.value!,
            rawValue: data[activeIndex]![item.key],
            color: item.color,
          })),
        };
  function inspect(index: number) {
    setInspection({ data, index });
  }
  function available(index: number) {
    return series.filter((item) => item.points[index]?.defined);
  }
  function handleKeyDown(event: KeyboardEvent<SVGRectElement>, index: number) {
    const options = available(index);
    const selected =
      options.find((item) => item.seriesIndex === focus?.seriesIndex) ??
      options[0];
    let next = index;
    if (event.key === "ArrowLeft") next = Math.max(0, index - 1);
    else if (event.key === "ArrowRight")
      next = Math.min(data.length - 1, index + 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = data.length - 1;
    else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const position = selected ? options.indexOf(selected) : 0;
      const nextSeries =
        options[
          Math.max(
            0,
            Math.min(
              options.length - 1,
              position + (event.key === "ArrowDown" ? 1 : -1),
            ),
          )
        ];
      setFocus({ data, index, seriesIndex: nextSeries?.seriesIndex ?? 0 });
      inspect(index);
      return;
    } else if (event.key === "Escape") {
      event.preventDefault();
      setInspection(null);
      return;
    } else if (
      (event.key === "Enter" || event.key === " ") &&
      onPointClick &&
      selected
    ) {
      event.preventDefault();
      onPointClick(data[index]!, index, String(selected.key));
      return;
    } else return;
    event.preventDefault();
    const nextOptions = available(next);
    const nextSeries =
      nextOptions.find((item) => item.seriesIndex === selected?.seriesIndex) ??
      nextOptions[0];
    setTabIndex(next);
    refs.current[next]?.focus();
    setFocus({ data, index: next, seriesIndex: nextSeries?.seriesIndex ?? 0 });
    inspect(next);
  }
  function dismissHover() {
    setInspection(focus?.data === data ? { data, index: focus.index } : null);
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height: frameHeight }}
      aria-busy={loading}
      onMouseLeave={dismissHover}
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
      ) : !loading && !knownValues.length ? (
        <div
          role="status"
          className="flex h-full items-center justify-center p-6 text-center"
        >
          <div className="space-y-2">
            <p className="text-muted-foreground">No Data</p>
            <p className="text-sm text-muted-foreground">
              {data.length
                ? "There are no measured values in these series."
                : "There's no data to display"}
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
            height={svgHeight}
            role={loading ? "presentation" : "group"}
            aria-hidden={loading || undefined}
            aria-label={
              ariaLabel ??
              `Line chart with ${keys.length} series and ${data.length} data points`
            }
            aria-describedby={`${id}-description`}
          >
            <desc id={`${id}-description`}>
              {description ? `${description} ` : ""}Use Left and Right to
              inspect categories, Up and Down to choose a series, Home and End
              to jump, and Escape to dismiss the tooltip.
              {onPointClick ? " Press Enter or Space to select a point." : ""}
            </desc>
            <defs>
              {series.map((item) => (
                <linearGradient
                  key={String(item.key)}
                  id={`${id}-area-${item.seriesIndex}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor={loading ? "currentColor" : item.color}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={loading ? "currentColor" : item.color}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              ))}
              <clipPath id={`${id}-reveal`} clipPathUnits="userSpaceOnUse">
                <motion.rect
                  key={loading ? "loading" : "ready"}
                  data-line-reveal=""
                  x={-10}
                  y={-10}
                  width={plotWidth + 20}
                  height={plotHeight + 20}
                  style={{ originX: 0 }}
                  initial={shouldAnimate && !loading ? { scaleX: 0 } : false}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: shouldAnimate && !loading ? 0.65 : 0,
                    ease: EASING,
                  }}
                />
              </clipPath>
              <clipPath id={`${id}-plot`}>
                <rect
                  x={-10}
                  y={-10}
                  width={plotWidth + 20}
                  height={plotHeight + 20}
                />
              </clipPath>
            </defs>
            <g
              transform={`translate(${margin.left}, ${margin.top})`}
              onMouseLeave={dismissHover}
            >
              {domain.ticks.map((tick, index) => {
                const tickY = scaleLineValue(tick, domain, plotHeight);
                return (
                  <g key={tick} aria-hidden="true">
                    {showGrid && (
                      <line
                        x1={0}
                        x2={plotWidth}
                        y1={tickY}
                        y2={tickY}
                        stroke="currentColor"
                        opacity={0.1}
                        strokeDasharray={getGridDasharray(gridStyle)}
                      />
                    )}
                    {loading ? (
                      <rect
                        x={-36}
                        y={tickY - 4}
                        width={24}
                        height={8}
                        rx={3}
                        className="fill-muted"
                      />
                    ) : (
                      <text
                        x={-8}
                        y={tickY}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fontSize={11}
                        className="fill-muted-foreground"
                      >
                        {shorten(tickLabels[index]!, margin.left - 12)}
                      </text>
                    )}
                  </g>
                );
              })}
              <g aria-hidden="true" stroke="currentColor" opacity={0.3}>
                <line x1={0} x2={0} y1={0} y2={plotHeight} />
                <line x1={0} x2={plotWidth} y1={plotHeight} y2={plotHeight} />
              </g>
              {domain.min < 0 && domain.max > 0 && (
                <line
                  data-zero-baseline=""
                  aria-hidden="true"
                  x1={0}
                  x2={plotWidth}
                  y1={baseline}
                  y2={baseline}
                  stroke="currentColor"
                  opacity={0.3}
                />
              )}
              <g clipPath={`url(#${id}-plot)`}>
                <g
                  clipPath={`url(#${id}-reveal)`}
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none",
                    loading && "text-muted",
                    loading &&
                      shouldAnimate &&
                      "animate-pulse motion-reduce:animate-none",
                  )}
                >
                  {series.map((item) => (
                    <g key={String(item.key)}>
                      {showArea &&
                        (!showAreaForSeries ||
                          showAreaForSeries.includes(item.seriesIndex)) && (
                          <path
                            data-line-area={item.seriesIndex}
                            d={item.area}
                            fill={`url(#${id}-area-${item.seriesIndex})`}
                          />
                        )}
                      <path
                        data-line-series={
                          loading ? undefined : item.seriesIndex
                        }
                        data-loading-line={
                          loading ? item.seriesIndex : undefined
                        }
                        d={item.line}
                        fill="none"
                        stroke={loading ? "currentColor" : item.color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {item.points
                        .filter(
                          (point) =>
                            point.defined &&
                            (showDots || item.isolatedX.has(point.x)),
                        )
                        .map((point) => (
                          <path
                            key={point.index}
                            data-line-marker={`${item.seriesIndex}-${point.index}`}
                            d={`M ${point.x} ${point.y - 6} L ${point.x - 5.196} ${point.y + 3} L ${point.x + 5.196} ${point.y + 3} Z`}
                            fill={loading ? "currentColor" : item.color}
                            stroke="var(--background)"
                            strokeWidth={2}
                          />
                        ))}
                    </g>
                  ))}
                </g>
              </g>
              {activeIndex !== null && (
                <g aria-hidden="true" className="pointer-events-none">
                  <line
                    data-line-crosshair=""
                    x1={xPosition(activeIndex)}
                    x2={xPosition(activeIndex)}
                    y1={0}
                    y2={plotHeight}
                    stroke="currentColor"
                    opacity={0.3}
                    strokeDasharray="4 4"
                  />
                  {activeItems.map((item) => (
                    <circle
                      key={String(item.key)}
                      cx={item.points[activeIndex]!.x}
                      cy={item.points[activeIndex]!.y}
                      r={
                        focusIndex === activeIndex &&
                        focus?.seriesIndex === item.seriesIndex
                          ? 7
                          : 5
                      }
                      fill={item.color}
                      stroke="var(--background)"
                      strokeWidth={2}
                    />
                  ))}
                </g>
              )}
              {Array.from({ length: count }, (_, index) => {
                const position = xPosition(index);
                const left =
                  index === 0 ? 0 : (xPosition(index - 1) + position) / 2;
                const right =
                  index === count - 1
                    ? plotWidth
                    : (position + xPosition(index + 1)) / 2;
                return (
                  <g key={index}>
                    {!loading && (
                      <rect
                        data-line-band={index}
                        x={left}
                        y={0}
                        width={right - left}
                        height={plotHeight}
                        fill="transparent"
                        ref={(element) => {
                          refs.current[index] = element;
                        }}
                        tabIndex={index === selectedTab ? 0 : -1}
                        role={
                          onPointClick && available(index).length
                            ? "button"
                            : "graphics-symbol"
                        }
                        aria-label={`${model.labels[index]}: ${series.map((item) => `${String(item.key)} ${item.points[index]!.defined ? valueFormatter(item.points[index]!.value!) : "No value"}`).join(", ")}`}
                        aria-describedby={
                          activeIndex === index ? `${id}-tooltip` : undefined
                        }
                        className={cn(
                          "touch-manipulation outline-none",
                          onPointClick ? "cursor-pointer" : "cursor-default",
                        )}
                        onMouseEnter={() => inspect(index)}
                        onPointerDown={() => inspect(index)}
                        onFocus={() => {
                          setTabIndex(index);
                          setFocus({
                            data,
                            index,
                            seriesIndex: available(index)[0]?.seriesIndex ?? 0,
                          });
                          inspect(index);
                        }}
                        onClick={(event) => {
                          inspect(index);
                          const pointerY =
                            event.clientY -
                            event.currentTarget.ownerSVGElement!.getBoundingClientRect()
                              .top -
                            margin.top;
                          const nearest = available(index).reduce<
                            (typeof series)[number] | undefined
                          >(
                            (best, item) =>
                              !best ||
                              Math.abs(item.points[index]!.y - pointerY) <
                                Math.abs(best.points[index]!.y - pointerY)
                                ? item
                                : best,
                            undefined,
                          );
                          if (nearest)
                            onPointClick?.(
                              data[index]!,
                              index,
                              String(nearest.key),
                            );
                        }}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                      />
                    )}
                    {focusIndex === index && (
                      <rect
                        aria-hidden="true"
                        x={left + 1}
                        y={1}
                        width={Math.max(0, right - left - 2)}
                        height={Math.max(0, plotHeight - 2)}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        className="pointer-events-none"
                      />
                    )}
                    {(index % categoryStep === 0 || index === count - 1) &&
                      (loading ? (
                        <rect
                          aria-hidden="true"
                          x={position - 12}
                          y={plotHeight + 10}
                          width={24}
                          height={8}
                          rx={3}
                          className="fill-muted"
                        />
                      ) : (
                        <text
                          aria-hidden="true"
                          x={position}
                          y={plotHeight + 18}
                          textAnchor={
                            index === 0
                              ? "start"
                              : index === count - 1
                                ? "end"
                                : "middle"
                          }
                          fontSize={11}
                          className="pointer-events-none fill-muted-foreground"
                        >
                          {shorten(
                            model.labels[index]!,
                            Math.max(
                              20,
                              (plotWidth / Math.max(1, count - 1)) *
                                categoryStep -
                                8,
                            ),
                          )}
                        </text>
                      ))}
                  </g>
                );
              })}
            </g>
          </svg>
          {hasLegend && (
            <div
              aria-hidden={loading || undefined}
              className="flex overflow-x-auto px-4"
              style={{ height: LEGEND_HEIGHT }}
            >
              <div className="m-auto flex min-w-max items-center gap-4">
                {series.map((item) => (
                  <div
                    key={String(item.key)}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span
                      className={cn(
                        "size-2.5 shrink-0 rounded-full",
                        loading && "bg-muted",
                      )}
                      style={
                        loading ? undefined : { backgroundColor: item.color }
                      }
                    />
                    {loading ? (
                      <span className="h-2 w-12 rounded bg-muted" />
                    ) : (
                      String(item.key)
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {tooltipData && (
            <LineTooltip
              id={`${id}-tooltip`}
              x={margin.left + xPosition(tooltipData.index)}
              y={
                margin.top +
                (activeItems[0]?.points[tooltipData.index]?.y ?? plotHeight / 2)
              }
              width={containerWidth}
              height={svgHeight}
            >
              {tooltipRenderer ? (
                tooltipRenderer(tooltipData)
              ) : (
                <>
                  <div className="mb-2 border-b border-border pb-2 text-xs font-medium text-muted-foreground">
                    {tooltipData.label}
                  </div>
                  {tooltipData.series.length ? (
                    tooltipData.series.map((item) => (
                      <div
                        key={item.key}
                        className="flex min-w-24 items-center justify-between gap-6 py-0.5"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2.5 shrink-0 rounded-sm"
                            style={{ backgroundColor: item.color }}
                          />
                          {keys.length > 1 && (
                            <span className="text-xs text-muted-foreground">
                              {item.key}
                            </span>
                          )}
                        </span>
                        <span className="text-sm font-semibold tabular-nums">
                          {valueFormatter(item.value)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No measured value
                    </span>
                  )}
                </>
              )}
            </LineTooltip>
          )}
        </>
      )}
    </div>
  );
}

export const LineChart = memo(LineChartComponent) as typeof LineChartComponent;
export type { ChartDataItem, LineChartProps };
export { DEFAULT_COLORS, formatValue };
