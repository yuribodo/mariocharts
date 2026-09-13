"use client";

import {
  memo,
  useMemo,
  useRef,
  useState,
  useEffect,
  useId,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { animate, useMotionValue, useReducedMotion } from "framer-motion";
import { cn } from "../../../../lib/utils";
import { useContainerDimensions } from "../_shared";
import type { ScatterPlotTooltipData } from "../_shared";
import { InspectionTooltip } from "../_shared/inspection-tooltip";
import type { ChartDataItem, ScatterPlotProps } from "./types";
import {
  buildScatterModel,
  bubbleRadius,
  getScatterDomain,
  scaleValue,
  calculateNiceTicks,
  formatValue,
  getGridDasharray,
} from "./scales";
import { calculateLinearRegression, getTrendSegment } from "./regression";

export type { ChartDataItem, ScatterPlotProps };
export { formatValue };
export const DEFAULT_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
] as const;
const SIZE_RANGE = [4, 40] as const;
const PLACEHOLDER = Array.from({ length: 8 }, (_, index) => ({
  x: 10 + index * 10,
  y: [25, 40, 30, 60, 45, 75, 65, 85][index]!,
  size: 6,
}));
const validDomain = (domain: readonly [number, number] | undefined) =>
  !domain ||
  (domain.length === 2 &&
    domain.every(Number.isFinite) &&
    domain[0] < domain[1]);
interface Dot {
  index: number;
  cx: number;
  cy: number;
  radius: number;
  color: string;
}

/** Animate radii only: positions and the meaning of coordinates never change. */
function PointCloud({
  points,
  enabled,
  loading,
  children,
}: {
  points: readonly Dot[];
  enabled: boolean;
  loading: boolean;
  children: ReactNode;
}) {
  const refs = useRef<(SVGCircleElement | null)[]>([]);
  const progress = useMotionValue(enabled ? 0 : 1);
  useEffect(
    () =>
      progress.on("change", (value) => {
        points.forEach((point, index) =>
          refs.current[index]?.setAttribute("r", String(point.radius * value)),
        );
      }),
    [points, progress],
  );
  useEffect(() => {
    if (!enabled) {
      progress.jump(1);
      return;
    }
    progress.set(0);
    const controls = animate(progress, 1, {
      duration: 0.65,
      ease: [0.33, 0, 0.2, 1],
    });
    return () => controls.stop();
  }, [enabled, progress]);
  return (
    <g onFocusCapture={() => progress.jump(1)}>
      {points.map((point, index) => (
        <circle
          key={point.index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          data-scatter-dot={loading ? undefined : point.index}
          data-loading-dot={loading ? point.index : undefined}
          cx={point.cx}
          cy={point.cy}
          r={point.radius * progress.get()}
          fill={loading ? "currentColor" : point.color}
          fillOpacity={loading ? 0.6 : 0.8}
          stroke="var(--background)"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ))}
      {children}
    </g>
  );
}

function ScatterPlotComponent<T extends ChartDataItem>({
  data,
  x,
  y,
  label,
  colors = DEFAULT_COLORS,
  className,
  height = 300,
  loading = false,
  error = null,
  animation = true,
  series,
  size,
  sizeRange = SIZE_RANGE,
  sizeScale = "area",
  showTrendLine = false,
  trendLineColor,
  showLegend = false,
  showGrid = false,
  gridStyle = "dashed",
  xDomain,
  yDomain,
  xLabel = "X",
  yLabel = "Y",
  sizeLabel = "Size",
  xFormatter = formatValue,
  yFormatter = formatValue,
  sizeFormatter = formatValue,
  ariaLabel,
  description,
  onPointClick,
  tooltipRenderer,
}: ScatterPlotProps<T>) {
  const [containerRef, width] = useContainerDimensions();
  const id = useId();
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animation && !reduceMotion;
  const refs = useRef<(SVGCircleElement | null)[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  type Selection = {
    data: typeof data;
    x: keyof T;
    y: keyof T;
    series: typeof series;
    size: typeof size;
    index: number;
  };
  const [inspection, setInspection] = useState<Selection | null>(null);
  const [focus, setFocus] = useState<Selection | null>(null);
  const xMin = xDomain?.[0];
  const xMax = xDomain?.[1];
  const yMin = yDomain?.[0];
  const yMax = yDomain?.[1];
  useEffect(() => {
    setInspection(null);
    setFocus(null);
  }, [data, x, y, label, series, size, loading, error, xMin, xMax, yMin, yMax]);
  const model = useMemo(
    () =>
      buildScatterModel(data, {
        x,
        y,
        ...(label !== undefined ? { label } : {}),
        ...(series !== undefined ? { series } : {}),
        ...(size !== undefined ? { size } : {}),
      }),
    [data, x, y, label, series, size],
  );
  const placeholder = useMemo(
    () => buildScatterModel(PLACEHOLDER, { x: "x", y: "y" }),
    [],
  );
  const initialLoading = loading && (!!model.error || !data.length);
  const source = initialLoading ? placeholder : model;
  const bubble = size !== undefined && typeof size !== "number";
  const validSize =
    typeof size !== "number" || (Number.isFinite(size) && size >= 0);
  const validSizeRange =
    sizeRange.length === 2 &&
    sizeRange.every(Number.isFinite) &&
    sizeRange[0] >= 0 &&
    sizeRange[1] > 0 &&
    sizeRange[0] <= sizeRange[1];
  const chartError =
    error ||
    model.error ||
    (!(Number.isFinite(height) && height > 0)
      ? "Chart height must be a positive, finite number."
      : null) ||
    (!validDomain(xDomain)
      ? "xDomain must contain two finite bounds with min < max."
      : null) ||
    (!validDomain(yDomain)
      ? "yDomain must contain two finite bounds with min < max."
      : null) ||
    (!validSize
      ? "Point radius must be a finite, nonnegative number."
      : null) ||
    (!validSizeRange
      ? "sizeRange must contain finite radii with 0 ≤ min ≤ max and max > 0."
      : null);
  const outsideCount = model.points.filter(
    (p) =>
      (xDomain && (p.x < xDomain[0] || p.x > xDomain[1])) ||
      (yDomain && (p.y < yDomain[0] || p.y > yDomain[1])),
  ).length;
  const frameHeight = Number.isFinite(height) && height > 0 ? height : 300;
  const legendHeight = showLegend ? Math.min(48, frameHeight / 5) : 0;
  const noticeHeight = outsideCount > 0 && !initialLoading ? 22 : 0;
  const svgHeight = frameHeight - legendHeight - noticeHeight;
  const plot = {
    left: Math.min(68, width / 4),
    top: 18,
    width: Math.max(0, width - Math.min(68, width / 4) - 18),
    height: Math.max(0, svgHeight - 70),
  };
  const range = validSizeRange ? sizeRange : SIZE_RANGE;
  const radius = initialLoading
    ? 6
    : bubble
      ? range[1]
      : typeof size === "number" && validSize
        ? size
        : 6;
  const domains = useMemo(
    () => ({
      x: getScatterDomain(
        source.points.map((p) => p.x),
        validDomain(xDomain) ? xDomain : undefined,
        radius,
        plot.width,
      ),
      y: getScatterDomain(
        source.points.map((p) => p.y),
        validDomain(yDomain) ? yDomain : undefined,
        radius,
        plot.height,
      ),
    }),
    [source.points, xDomain, yDomain, radius, plot.width, plot.height],
  );
  const points = useMemo(
    () =>
      source.points
        .filter(
          (p) =>
            p.x >= domains.x[0] &&
            p.x <= domains.x[1] &&
            p.y >= domains.y[0] &&
            p.y <= domains.y[1],
        )
        .map((p) => ({
          ...p,
          cx: plot.left + scaleValue(p.x, domains.x, [0, plot.width]),
          cy: plot.top + scaleValue(p.y, domains.y, [plot.height, 0]),
          radius:
            !initialLoading && bubble
              ? bubbleRadius(
                  p.size,
                  source.minSize,
                  source.maxSize,
                  range,
                  sizeScale,
                )
              : radius,
          color:
            colors[source.groups.indexOf(p.seriesKey) % colors.length] ??
            DEFAULT_COLORS[0],
        })),
    [
      source,
      domains,
      plot.left,
      plot.top,
      plot.width,
      plot.height,
      initialLoading,
      bubble,
      range,
      sizeScale,
      radius,
      colors,
    ],
  );
  const drawingOrder = useMemo(
    () => [...points].sort((a, b) => b.radius - a.radius || a.index - b.index),
    [points],
  );
  const navigation = useMemo(
    () =>
      [...points].sort((a, b) => a.x - b.x || a.y - b.y || a.index - b.index),
    [points],
  );
  const selectedIndex = navigation.some((p) => p.index === tabIndex)
    ? tabIndex
    : navigation[0]?.index;
  const fits = useMemo(() => {
    if (!showTrendLine || model.error) return [];
    const groups = new Map<string, { x: number; y: number }[]>();
    for (const point of model.points) {
      const group = groups.get(point.seriesKey) ?? [];
      group.push(point);
      groups.set(point.seriesKey, group);
    }
    return [...groups].map(([key, values]) => ({
      key,
      fit: calculateLinearRegression(values),
    }));
  }, [showTrendLine, model]);
  const trends = fits.flatMap(({ key, fit }) => {
    const segment = getTrendSegment(fit, domains.x, domains.y);
    return segment ? [{ ...segment, key }] : [];
  });
  const ready =
    !loading &&
    !chartError &&
    data.length > 0 &&
    plot.width > 0 &&
    plot.height > 0;
  const matches = (selection: Selection | null) =>
    selection?.data === data &&
    selection.x === x &&
    selection.y === y &&
    selection.series === series &&
    selection.size === size;
  const active =
    ready && matches(inspection)
      ? points.find((p) => p.index === inspection!.index)
      : undefined;
  const focused = ready && matches(focus) ? focus!.index : null;
  const tipData: ScatterPlotTooltipData<T> | null = active
    ? {
        data: data[active.index]!,
        index: active.index,
        label: active.label,
        xValue: active.x,
        yValue: active.y,
        formattedX: xFormatter(active.x),
        formattedY: yFormatter(active.y),
        seriesKey: active.seriesKey,
        sizeValue: active.size,
        color: active.color,
      }
    : null;
  function inspect(index: number) {
    setInspection({ data, x, y, series, size, index });
  }
  function navigate(event: KeyboardEvent<SVGCircleElement>, index: number) {
    const position = navigation.findIndex((p) => p.index === index);
    let next = position;
    if (event.key === "ArrowRight") next = (position + 1) % navigation.length;
    else if (event.key === "ArrowLeft")
      next = (position + navigation.length - 1) % navigation.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      const keys = source.groups.filter((key) =>
        navigation.some((p) => p.seriesKey === key),
      );
      const current = navigation[position]!;
      const offset = event.key === "ArrowDown" ? 1 : -1;
      if (keys.length <= 1)
        next = (position + navigation.length + offset) % navigation.length;
      else {
        const key =
          keys[
            (keys.indexOf(current.seriesKey) + keys.length + offset) %
              keys.length
          ];
        const candidates = navigation.filter((p) => p.seriesKey === key);
        const nearest = candidates.reduce((best, p) =>
          Math.abs(p.cx - current.cx) < Math.abs(best.cx - current.cx)
            ? p
            : best,
        );
        next = navigation.findIndex((p) => p.index === nearest.index);
      }
    } else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = navigation.length - 1;
    else if (event.key === "Escape") {
      event.preventDefault();
      setInspection(null);
      return;
    } else if ((event.key === "Enter" || event.key === " ") && onPointClick) {
      event.preventDefault();
      const p = navigation[position]!;
      onPointClick(data[p.index]!, p.index, p.seriesKey);
      return;
    } else return;
    event.preventDefault();
    const point = navigation[next]!;
    setTabIndex(point.index);
    refs.current[point.index]?.focus();
  }
  const xTicks = calculateNiceTicks(
    domains.x[0],
    domains.x[1],
    Math.min(6, Math.max(2, Math.floor(plot.width / 80))),
  );
  const yTicks = calculateNiceTicks(
    domains.y[0],
    domains.y[1],
    Math.min(5, Math.max(2, Math.floor(plot.height / 48))),
  );
  const xTickWidth = Math.max(
    0,
    Math.min(90, plot.width / Math.max(1, xTicks.length - 1)),
  );
  const stateMessage =
    !loading && chartError
      ? chartError
      : !loading && !data.length
        ? "No Data"
        : !loading && !ready
          ? "Waiting for chart space"
          : null;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height: frameHeight }}
      aria-busy={loading}
      onMouseLeave={() => setInspection(matches(focus) ? focus : null)}
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
      {stateMessage ? (
        <div
          role={chartError ? "alert" : "status"}
          className="flex h-full items-center justify-center p-6 text-center"
        >
          <div className="space-y-2">
            <p
              className={cn(
                "font-medium",
                chartError ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {chartError ? "Chart Error" : stateMessage}
            </p>
            <p className="text-sm text-muted-foreground">
              {chartError || (!data.length ? "There's no data to display" : "")}
            </p>
          </div>
        </div>
      ) : (
        <>
          <svg
            width="100%"
            height={svgHeight}
            role={loading ? "presentation" : "group"}
            aria-hidden={loading || undefined}
            aria-label={
              ariaLabel ?? `Scatter plot with ${points.length} visible points`
            }
            aria-describedby={`${id}-description`}
          >
            <desc id={`${id}-description`}>
              {description ? `${description} ` : ""}Left and Right inspect
              points in X order; Up and Down switch series. Home and End jump;
              Escape dismisses inspection.{" "}
              {onPointClick ? "Enter or Space selects the point. " : ""}
              {outsideCount > 0
                ? `${outsideCount} observations lie outside the displayed domains. `
                : ""}
              {showTrendLine
                ? "Trends use all observations in each series and are limited to observed X values."
                : ""}
            </desc>
            <defs>
              <clipPath id={`${id}-plot`}>
                <rect
                  x={plot.left}
                  y={plot.top}
                  width={plot.width}
                  height={plot.height}
                />
              </clipPath>
            </defs>
            <g aria-hidden="true">
              {showGrid && (
                <g
                  stroke="var(--border)"
                  strokeDasharray={getGridDasharray(gridStyle)}
                >
                  {xTicks.map((tick, index) => (
                    <line
                      key={`x-${index}`}
                      data-scatter-grid=""
                      x1={
                        plot.left + scaleValue(tick, domains.x, [0, plot.width])
                      }
                      x2={
                        plot.left + scaleValue(tick, domains.x, [0, plot.width])
                      }
                      y1={plot.top}
                      y2={plot.top + plot.height}
                    />
                  ))}
                  {yTicks.map((tick, index) => (
                    <line
                      key={`y-${index}`}
                      data-scatter-grid=""
                      x1={plot.left}
                      x2={plot.left + plot.width}
                      y1={
                        plot.top + scaleValue(tick, domains.y, [plot.height, 0])
                      }
                      y2={
                        plot.top + scaleValue(tick, domains.y, [plot.height, 0])
                      }
                    />
                  ))}
                </g>
              )}
              <path
                data-scatter-axis=""
                d={`M ${plot.left} ${plot.top} V ${plot.top + plot.height} H ${plot.left + plot.width}`}
                fill="none"
                stroke="var(--border)"
              />
              {xTicks.map((tick, index) => {
                const cx =
                  plot.left + scaleValue(tick, domains.x, [0, plot.width]);
                return (
                  <foreignObject
                    key={index}
                    x={Math.max(
                      plot.left,
                      Math.min(
                        cx - xTickWidth / 2,
                        plot.left + plot.width - xTickWidth,
                      ),
                    )}
                    y={plot.top + plot.height + 7}
                    width={xTickWidth}
                    height={18}
                  >
                    <div
                      className="truncate text-xs text-muted-foreground"
                      style={{
                        textAlign:
                          index === 0
                            ? "left"
                            : index === xTicks.length - 1
                              ? "right"
                              : "center",
                      }}
                      title={loading ? undefined : xFormatter(tick)}
                    >
                      {loading ? (
                        <span className="inline-block h-2 w-6 rounded bg-muted" />
                      ) : (
                        xFormatter(tick)
                      )}
                    </div>
                  </foreignObject>
                );
              })}
              {yTicks.map((tick, index) => (
                <foreignObject
                  key={index}
                  x={20}
                  y={
                    plot.top + scaleValue(tick, domains.y, [plot.height, 0]) - 9
                  }
                  width={Math.max(0, plot.left - 28)}
                  height={18}
                >
                  <div
                    className="truncate text-right text-xs text-muted-foreground"
                    title={loading ? undefined : yFormatter(tick)}
                  >
                    {loading ? (
                      <span className="inline-block h-2 w-6 rounded bg-muted" />
                    ) : (
                      yFormatter(tick)
                    )}
                  </div>
                </foreignObject>
              ))}
              {!loading && (
                <>
                  <foreignObject
                    x={plot.left}
                    y={svgHeight - 21}
                    width={plot.width}
                    height={18}
                  >
                    <div
                      className="truncate text-center text-xs text-muted-foreground"
                      title={xLabel}
                    >
                      {xLabel}
                    </div>
                  </foreignObject>
                  <text
                    x={12}
                    y={plot.top + plot.height / 2}
                    textAnchor="middle"
                    transform={`rotate(-90 12 ${plot.top + plot.height / 2})`}
                    className="fill-muted-foreground text-xs"
                  >
                    <title>{yLabel}</title>
                    {yLabel.length > Math.max(3, plot.height / 7)
                      ? `${yLabel.slice(0, Math.max(1, Math.floor(plot.height / 7) - 1))}…`
                      : yLabel}
                  </text>
                </>
              )}
            </g>
            <g
              clipPath={`url(#${id}-plot)`}
              className={cn(
                loading && "text-muted",
                loading &&
                  shouldAnimate &&
                  "animate-pulse motion-reduce:animate-none",
              )}
            >
              {!initialLoading &&
                trends.map((line) => (
                  <line
                    key={line.key}
                    data-scatter-trend=""
                    x1={plot.left + line.x1 * plot.width}
                    x2={plot.left + line.x2 * plot.width}
                    y1={plot.top + line.y1 * plot.height}
                    y2={plot.top + line.y2 * plot.height}
                    stroke={
                      loading
                        ? "currentColor"
                        : (trendLineColor ??
                          colors[
                            source.groups.indexOf(line.key) % colors.length
                          ] ??
                          DEFAULT_COLORS[0])
                    }
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    opacity={0.65}
                    aria-hidden="true"
                  />
                ))}
              <PointCloud
                key={loading ? "loading" : "ready"}
                points={drawingOrder}
                enabled={shouldAnimate && !loading}
                loading={loading}
              >
                {!loading &&
                  drawingOrder.map((point) => (
                    <circle
                      key={point.index}
                      data-scatter-point={point.index}
                      ref={(el) => {
                        refs.current[point.index] = el;
                      }}
                      cx={point.cx}
                      cy={point.cy}
                      r={Math.max(12, point.radius + 3)}
                      fill="transparent"
                      stroke={
                        active?.index === point.index || focused === point.index
                          ? "var(--foreground)"
                          : "transparent"
                      }
                      strokeWidth={1.5}
                      className={cn(
                        "outline-none touch-manipulation focus-visible:stroke-foreground",
                        onPointClick ? "cursor-pointer" : "cursor-default",
                      )}
                      role={onPointClick ? "button" : "graphics-symbol"}
                      tabIndex={point.index === selectedIndex ? 0 : -1}
                      aria-label={`${point.label}${series !== undefined ? `, ${point.seriesKey}` : ""}: ${xLabel} ${xFormatter(point.x)}, ${yLabel} ${yFormatter(point.y)}${bubble ? `, ${sizeLabel} ${sizeFormatter(point.size)}` : ""}`}
                      aria-describedby={
                        active?.index === point.index
                          ? `${id}-tooltip`
                          : undefined
                      }
                      onMouseEnter={() => inspect(point.index)}
                      onPointerDown={() => inspect(point.index)}
                      onFocus={() => {
                        setTabIndex(point.index);
                        setFocus({
                          data,
                          x,
                          y,
                          series,
                          size,
                          index: point.index,
                        });
                        inspect(point.index);
                      }}
                      onClick={() => {
                        inspect(point.index);
                        onPointClick?.(
                          data[point.index]!,
                          point.index,
                          point.seriesKey,
                        );
                      }}
                      onKeyDown={(event) => navigate(event, point.index)}
                    />
                  ))}
              </PointCloud>
            </g>
            {ready && !points.length && (
              <text
                role="status"
                x={plot.left + plot.width / 2}
                y={plot.top + plot.height / 2}
                textAnchor="middle"
                className="fill-muted-foreground text-sm"
              >
                No points in this range
              </text>
            )}
          </svg>
          {noticeHeight > 0 && (
            <p
              className="truncate px-3 text-center text-xs text-muted-foreground"
              style={{ height: noticeHeight }}
            >
              {loading
                ? "Updating observations…"
                : `${outsideCount} of ${data.length} points outside this range`}
            </p>
          )}
          {showLegend && (
            <ul
              aria-label={loading ? undefined : "Chart series"}
              aria-hidden={loading || undefined}
              className="flex flex-wrap content-start justify-center gap-x-5 gap-y-2 overflow-auto px-3 py-2 text-xs"
              style={{ height: legendHeight }}
            >
              {source.groups.map((key, index) => (
                <li
                  key={key}
                  className="flex min-w-0 max-w-full items-center gap-2"
                >
                  <span
                    className={cn(
                      "size-2.5 shrink-0 rounded-full",
                      loading && "bg-muted",
                    )}
                    style={
                      loading
                        ? undefined
                        : {
                            backgroundColor:
                              colors[index % colors.length] ??
                              DEFAULT_COLORS[0],
                          }
                    }
                  />
                  {loading ? (
                    <span className="h-2 w-16 rounded bg-muted" />
                  ) : (
                    <span className="truncate" title={key}>
                      {key === "default" && series === undefined
                        ? "Observations"
                        : key}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {ready && (
            <table className="sr-only">
              <caption>
                {ariaLabel ?? "Scatter plot"} observations, including points
                outside the view
              </caption>
              <thead>
                <tr>
                  <th scope="col">Point</th>
                  <th scope="col">Series</th>
                  <th scope="col">{xLabel}</th>
                  <th scope="col">{yLabel}</th>
                  {bubble && <th scope="col">{sizeLabel}</th>}
                  <th scope="col">View</th>
                </tr>
              </thead>
              <tbody>
                {model.points.map((point) => (
                  <tr key={point.index}>
                    <th scope="row">{point.label}</th>
                    <td>{point.seriesKey}</td>
                    <td>{xFormatter(point.x)}</td>
                    <td>{yFormatter(point.y)}</td>
                    {bubble && <td>{sizeFormatter(point.size)}</td>}
                    <td>
                      {point.x >= domains.x[0] &&
                      point.x <= domains.x[1] &&
                      point.y >= domains.y[0] &&
                      point.y <= domains.y[1]
                        ? "Inside"
                        : "Outside"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {active && tipData && (
            <InspectionTooltip
              id={`${id}-tooltip`}
              x={active.cx}
              y={active.cy}
              width={width}
              height={svgHeight}
            >
              {tooltipRenderer ? (
                tooltipRenderer(tipData)
              ) : (
                <>
                  <div className="mb-2 flex items-center gap-2 border-b border-border pb-2 text-xs font-medium text-muted-foreground">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: active.color }}
                    />
                    {active.label}
                  </div>
                  {series !== undefined && (
                    <p className="mb-2 text-xs text-muted-foreground">
                      {active.seriesKey}
                    </p>
                  )}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-6">
                      <span>{xLabel}</span>
                      <span className="font-semibold tabular-nums">
                        {tipData.formattedX}
                      </span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span>{yLabel}</span>
                      <span className="font-semibold tabular-nums">
                        {tipData.formattedY}
                      </span>
                    </div>
                    {bubble && (
                      <div className="flex justify-between gap-6">
                        <span>{sizeLabel}</span>
                        <span className="font-semibold tabular-nums">
                          {sizeFormatter(active.size)}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </InspectionTooltip>
          )}
        </>
      )}
    </div>
  );
}

export const ScatterPlot = memo(
  ScatterPlotComponent,
) as typeof ScatterPlotComponent;
