"use client";

import {
  memo,
  useMemo,
  useState,
  useRef,
  useEffect,
  useId,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  animate,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { cn } from "../../../../lib/utils";
import { useContainerDimensions, formatValue } from "../_shared";
import type { RadarChartTooltipData } from "../_shared";
import { InspectionTooltip } from "../_shared/inspection-tooltip";
import type {
  ChartDataItem,
  RadarChartProps,
  RadarAxis,
  RadarSeries,
} from "./types";
import {
  polarToCartesian,
  calculateAxisAngle,
  generatePolygonPath,
  generateCircularGridPath,
  generatePolygonGridPath,
  getRadarLayout,
  getAxisLabelBox,
} from "./geometry";
import { buildRadarModel, normalizeValue } from "./scales";

export type { ChartDataItem, RadarChartProps, RadarSeries, RadarAxis };
export { formatValue };
export const DEFAULT_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
] as const;
const DEFAULT_HEIGHT = 400;
const PLACEHOLDER_AXES = Array.from({ length: 6 }, (_, index) => ({
  key: `axis${index}`,
  label: `Axis ${index + 1}`,
  min: 0,
  max: 100,
}));

/** One transform grows polygons and their points together, with a fixed SVG origin. */
function RadarGrowth({
  cx,
  cy,
  enabled,
  children,
}: {
  cx: number;
  cy: number;
  enabled: boolean;
  children: ReactNode;
}) {
  const ref = useRef<SVGGElement>(null);
  const progress = useMotionValue(enabled ? 0 : 1);
  const transform = useTransform(
    progress,
    (value) =>
      `translate(${cx} ${cy}) scale(${value}) translate(${-cx} ${-cy})`,
  );
  // Keep the origin in SVG coordinates, independent of a measured bounding box.
  useEffect(
    () =>
      transform.on("change", (value) => {
        ref.current?.setAttribute("transform", value);
      }),
    [transform],
  );
  useEffect(() => {
    if (!enabled) {
      progress.jump(1);
      return;
    }
    progress.set(0);
    const controls = animate(progress, 1, {
      duration: 0.75,
      ease: [0.33, 0, 0.2, 1],
    });
    return () => controls.stop();
  }, [enabled, progress]);
  return (
    <g
      ref={ref}
      data-radar-growth=""
      transform={transform.get()}
      onFocusCapture={() => progress.jump(1)}
    >
      {children}
    </g>
  );
}

function RadarChartComponent<T extends ChartDataItem>({
  series,
  axes,
  colors = DEFAULT_COLORS,
  className,
  height = DEFAULT_HEIGHT,
  loading = false,
  error = null,
  animation = true,
  gridType = "polygon",
  gridLevels = 5,
  showAxisLabels = true,
  showAxisLines = true,
  showGridLines = true,
  showDots = true,
  fillOpacity = 0.25,
  strokeWidth = 2,
  labelOffset = 30,
  showLegend = series.length > 1,
  onSeriesClick,
  onAxisClick,
  tooltipRenderer,
  valueFormatter = formatValue,
  ariaLabel,
  description,
}: RadarChartProps<T>) {
  const [containerRef, width] = useContainerDimensions();
  const id = useId();
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animation && !reduceMotion;
  const refs = useRef<(SVGCircleElement | null)[]>([]);
  const [tabPosition, setTabPosition] = useState(0);
  type Selection = {
    series: typeof series;
    axes: typeof axes;
    seriesIndex: number;
    axisIndex?: number;
  };
  const [inspection, setInspection] = useState<Selection | null>(null);
  const [focus, setFocus] = useState<Selection | null>(null);
  useEffect(() => {
    setInspection(null);
    setFocus(null);
  }, [series, axes, loading, error]);
  const model = useMemo(() => buildRadarModel(axes, series), [axes, series]);
  const placeholder = useMemo(() => {
    const dimensions = (
      axes.length >= 3 &&
      new Set(axes.map((axis) => axis.key)).size === axes.length
        ? axes
        : PLACEHOLDER_AXES
    ).map((axis) => ({ ...axis, min: 0, max: 100 }));
    return buildRadarModel<Record<string, number>>(dimensions, [
      {
        id: "placeholder",
        name: "",
        data: Object.fromEntries(
          dimensions.map((axis, index) => [
            axis.key,
            [60, 80, 50, 70, 45, 75][index % 6]!,
          ]),
        ),
      },
    ]);
  }, [axes]);
  const initialLoading =
    loading && (!!model.error || !model.series.length || !model.axes.length);
  const source = initialLoading ? placeholder : model;
  const frameHeight =
    Number.isFinite(height) && height > 0 ? height : DEFAULT_HEIGHT;
  const legendHeight = showLegend ? Math.min(64, frameHeight / 4) : 0;
  const svgHeight = frameHeight - legendHeight;
  const validGridLevels =
    Number.isInteger(gridLevels) && gridLevels >= 1 && gridLevels <= 20;
  const safeGridLevels = validGridLevels ? gridLevels : 5;
  const safeStrokeWidth =
    Number.isFinite(strokeWidth) && strokeWidth >= 0 ? strokeWidth : 2;
  const validOffset = Number.isFinite(labelOffset) && labelOffset >= 0;
  const layout = useMemo(
    () =>
      getRadarLayout(
        width,
        svgHeight,
        showAxisLabels,
        validOffset ? labelOffset : 30,
      ),
    [width, svgHeight, showAxisLabels, validOffset, labelOffset],
  );
  const { cx, cy, radius } = layout;
  const chartError =
    error ||
    model.error ||
    (!(Number.isFinite(height) && height > 0)
      ? "Chart height must be a positive, finite number."
      : null) ||
    (!validGridLevels ? "gridLevels must be an integer from 1 to 20." : null) ||
    (!validOffset
      ? "labelOffset must be a finite, nonnegative number."
      : null) ||
    (!(Number.isFinite(fillOpacity) && fillOpacity >= 0 && fillOpacity <= 1)
      ? "fillOpacity must be a finite number from 0 to 1."
      : null) ||
    (!(Number.isFinite(strokeWidth) && strokeWidth >= 0)
      ? "strokeWidth must be a finite, nonnegative number."
      : null);
  const ready =
    !loading &&
    !chartError &&
    !!model.series.length &&
    !!model.axes.length &&
    radius > 0;
  const dimensions = useMemo(
    () =>
      source.axes.map((axis) => {
        const angle = calculateAxisAngle(axis.index, source.axes.length);
        return {
          ...axis,
          angle,
          ...polarToCartesian(cx, cy, radius, angle),
          box: getAxisLabelBox(angle, layout, width),
        };
      }),
    [source.axes, cx, cy, radius, layout, width],
  );
  const drawable = useMemo(
    () =>
      source.series.map((item) => {
        const points = dimensions.map((axis) => ({
          axisIndex: axis.index,
          value: item.values[axis.index]!,
          ...polarToCartesian(
            cx,
            cy,
            radius *
              normalizeValue(item.values[axis.index]!, axis.min, axis.max),
            axis.angle,
          ),
        }));
        return {
          ...item,
          color:
            item.color ??
            colors[item.index % colors.length] ??
            DEFAULT_COLORS[0],
          points,
          path: generatePolygonPath(points),
        };
      }),
    [source.series, dimensions, cx, cy, radius, colors],
  );
  const matches = (selection: Selection | null) =>
    selection?.series === series && selection.axes === axes;
  const active = ready && matches(inspection) ? inspection : null;
  const focused = ready && matches(focus) ? focus : null;
  const activeSeries = active ? drawable[active.seriesIndex] : undefined;
  const activeAxis =
    active?.axisIndex !== undefined ? dimensions[active.axisIndex] : undefined;
  const activePoint =
    active?.axisIndex !== undefined
      ? activeSeries?.points[active.axisIndex]
      : undefined;
  const selectedPosition = Math.min(
    tabPosition,
    Math.max(0, drawable.length * dimensions.length - 1),
  );
  const tipData: RadarChartTooltipData<T> | null =
    activeSeries && active
      ? {
          type: activeAxis ? "point" : "series",
          seriesName: activeSeries.name,
          ...(activeAxis && activePoint
            ? {
                axisLabel: activeAxis.label,
                value: activePoint.value,
                formattedValue: valueFormatter(
                  activePoint.value,
                  axes[activeAxis.index]!,
                ),
              }
            : {}),
          color: activeSeries.color,
          data: series[active.seriesIndex]!.data,
        }
      : null;
  function inspect(seriesIndex: number, axisIndex?: number) {
    setInspection({
      series,
      axes,
      seriesIndex,
      ...(axisIndex !== undefined ? { axisIndex } : {}),
    });
  }
  function navigate(
    event: KeyboardEvent<SVGCircleElement>,
    seriesIndex: number,
    axisIndex: number,
  ) {
    let nextSeries = seriesIndex,
      nextAxis = axisIndex;
    if (event.key === "ArrowRight")
      nextAxis = (axisIndex + 1) % dimensions.length;
    else if (event.key === "ArrowLeft")
      nextAxis = (axisIndex + dimensions.length - 1) % dimensions.length;
    else if (event.key === "ArrowDown")
      nextSeries = (seriesIndex + 1) % drawable.length;
    else if (event.key === "ArrowUp")
      nextSeries = (seriesIndex + drawable.length - 1) % drawable.length;
    else if (event.key === "Home") nextAxis = 0;
    else if (event.key === "End") nextAxis = dimensions.length - 1;
    else if (event.key === "Escape") {
      event.preventDefault();
      setInspection(null);
      return;
    } else if ((event.key === "Enter" || event.key === " ") && onSeriesClick) {
      event.preventDefault();
      onSeriesClick(series[seriesIndex]!, seriesIndex);
      return;
    } else return;
    event.preventDefault();
    const position = nextSeries * dimensions.length + nextAxis;
    setTabPosition(position);
    refs.current[position]?.focus();
  }
  const stateMessage =
    !loading && chartError
      ? chartError
      : !loading && (!series.length || !axes.length)
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
              {chartError ||
                (!series.length || !axes.length
                  ? "There's no data to display"
                  : "")}
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
              ariaLabel ??
              `Radar chart with ${series.length} series and ${axes.length} axes`
            }
            aria-describedby={`${id}-description`}
          >
            <desc id={`${id}-description`}>
              {description ? `${description} ` : ""}Left and Right inspect axes;
              Up and Down switch series. Home and End jump to the first and last
              axis. Escape dismisses the tooltip.{" "}
              {onSeriesClick ? "Enter or Space selects the series. " : ""}Each
              axis has its own range; inspect values and ranges before comparing
              shapes.
            </desc>
            <g aria-hidden="true" className="text-border">
              {showGridLines &&
                Array.from({ length: safeGridLevels }, (_, index) => (
                  <path
                    key={index}
                    data-radar-grid=""
                    d={
                      gridType === "circular"
                        ? generateCircularGridPath(
                            cx,
                            cy,
                            (radius * (index + 1)) / safeGridLevels,
                          )
                        : generatePolygonGridPath(
                            cx,
                            cy,
                            (radius * (index + 1)) / safeGridLevels,
                            dimensions.length,
                          )
                    }
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1}
                  />
                ))}
            </g>
            {dimensions.map((axis) => (
              <g
                key={axis.key}
                role={!loading && onAxisClick ? "button" : undefined}
                tabIndex={!loading && onAxisClick ? 0 : undefined}
                aria-label={
                  !loading && onAxisClick
                    ? `Select axis ${axis.label}`
                    : undefined
                }
                className={cn(
                  "group outline-none",
                  !loading && onAxisClick && "cursor-pointer",
                )}
                onFocus={
                  loading || !onAxisClick
                    ? undefined
                    : () => {
                        setFocus(null);
                        setInspection(null);
                      }
                }
                onClick={
                  loading || !onAxisClick
                    ? undefined
                    : () => onAxisClick(axes[axis.index]!, axis.index)
                }
                onKeyDown={
                  loading || !onAxisClick
                    ? undefined
                    : (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onAxisClick(axes[axis.index]!, axis.index);
                        }
                      }
                }
              >
                {showAxisLines && (
                  <line
                    data-radar-axis=""
                    x1={cx}
                    y1={cy}
                    x2={axis.x}
                    y2={axis.y}
                    stroke="var(--border)"
                  />
                )}
                {!loading && onAxisClick && (
                  <circle
                    cx={axis.x}
                    cy={axis.y}
                    r={12}
                    fill="transparent"
                    stroke="transparent"
                    className="group-focus-visible:stroke-foreground"
                    strokeWidth={2}
                  />
                )}
                {showAxisLabels && (
                  <foreignObject
                    x={axis.box.x}
                    y={axis.box.y}
                    width={axis.box.width}
                    height={axis.box.height}
                    className="overflow-hidden"
                  >
                    <div
                      title={loading ? undefined : axis.label}
                      className="flex h-full items-center text-xs font-medium text-muted-foreground"
                      style={{
                        justifyContent:
                          axis.box.align === "left"
                            ? "flex-start"
                            : axis.box.align === "right"
                              ? "flex-end"
                              : "center",
                        textAlign: axis.box.align,
                      }}
                    >
                      {loading ? (
                        <span className="h-2 w-10 max-w-full rounded bg-muted" />
                      ) : (
                        <span className="line-clamp-2 break-words">
                          {axis.label}
                        </span>
                      )}
                    </div>
                  </foreignObject>
                )}
              </g>
            ))}
            <RadarGrowth
              key={loading ? "loading" : "ready"}
              cx={cx}
              cy={cy}
              enabled={shouldAnimate && !loading}
            >
              <g
                className={cn(
                  loading && "text-muted",
                  loading &&
                    shouldAnimate &&
                    "animate-pulse motion-reduce:animate-none",
                )}
              >
                {drawable.map((item) => (
                  <path
                    key={item.id}
                    data-radar-series={loading ? undefined : item.index}
                    data-loading-series={loading ? item.index : undefined}
                    d={item.path}
                    fill={loading ? "currentColor" : item.color}
                    fillOpacity={loading ? 0.4 : fillOpacity}
                    stroke={loading ? "currentColor" : item.color}
                    strokeWidth={safeStrokeWidth}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    aria-hidden="true"
                    style={{
                      opacity:
                        active && active.seriesIndex !== item.index ? 0.25 : 1,
                      transition: shouldAnimate
                        ? "opacity 160ms ease-out"
                        : "none",
                    }}
                    className={cn(
                      !loading && onSeriesClick && "cursor-pointer",
                    )}
                    onMouseEnter={
                      loading ? undefined : () => inspect(item.index)
                    }
                    onPointerDown={
                      loading ? undefined : () => inspect(item.index)
                    }
                    onClick={
                      loading
                        ? undefined
                        : () => {
                            inspect(item.index);
                            onSeriesClick?.(series[item.index]!, item.index);
                          }
                    }
                  />
                ))}
                {drawable.flatMap((item) =>
                  item.points.map((point) => {
                    const position =
                      item.index * dimensions.length + point.axisIndex;
                    const isActive =
                      active?.seriesIndex === item.index &&
                      active.axisIndex === point.axisIndex;
                    const isFocused =
                      focused?.seriesIndex === item.index &&
                      focused.axisIndex === point.axisIndex;
                    const axis = axes[point.axisIndex];
                    return (
                      <g key={`${item.id}-${point.axisIndex}`}>
                        {(showDots || isActive || isFocused) && (
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r={isActive || isFocused ? 5 : 3.5}
                            fill={loading ? "currentColor" : item.color}
                            stroke="var(--background)"
                            strokeWidth={2}
                            className="pointer-events-none"
                            aria-hidden="true"
                          />
                        )}
                        {!loading && (
                          <circle
                            data-radar-point={`${item.index}-${point.axisIndex}`}
                            ref={(el) => {
                              refs.current[position] = el;
                            }}
                            cx={point.x}
                            cy={point.y}
                            r={12}
                            fill="transparent"
                            stroke={
                              isFocused ? "var(--foreground)" : "transparent"
                            }
                            strokeWidth={2}
                            vectorEffect="non-scaling-stroke"
                            className={cn(
                            "outline-none touch-manipulation focus-visible:stroke-foreground",
                              onSeriesClick
                                ? "cursor-pointer"
                                : "cursor-default",
                            )}
                            role={onSeriesClick ? "button" : "graphics-symbol"}
                            tabIndex={position === selectedPosition ? 0 : -1}
                            aria-label={`${item.name}, ${axis!.label}: ${valueFormatter(point.value, axis!)}`}
                            aria-describedby={
                              isActive ? `${id}-tooltip` : undefined
                            }
                            onMouseEnter={() =>
                              inspect(item.index, point.axisIndex)
                            }
                            onPointerDown={() =>
                              inspect(item.index, point.axisIndex)
                            }
                            onFocus={() => {
                              setTabPosition(position);
                              setFocus({
                                series,
                                axes,
                                seriesIndex: item.index,
                                axisIndex: point.axisIndex,
                              });
                              inspect(item.index, point.axisIndex);
                            }}
                            onClick={() => {
                              inspect(item.index, point.axisIndex);
                              onSeriesClick?.(series[item.index]!, item.index);
                            }}
                            onKeyDown={(event) =>
                              navigate(event, item.index, point.axisIndex)
                            }
                          />
                        )}
                      </g>
                    );
                  }),
                )}
              </g>
            </RadarGrowth>
          </svg>
          {showLegend && (
            <ul
              aria-label={loading ? undefined : "Chart series"}
              aria-hidden={loading || undefined}
              className="flex flex-wrap content-start justify-center gap-x-3 gap-y-1 overflow-auto px-2 py-2"
              style={{ height: legendHeight }}
            >
              {drawable.map((item) => (
                <li key={item.id} className="min-w-0 max-w-full">
                  {loading ? (
                    <span className="block h-3 w-20 rounded bg-muted" />
                  ) : (
                    <button
                      type="button"
                      className="flex max-w-full items-center gap-2 rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                      aria-label={`${onSeriesClick ? "Select" : "Inspect"} series ${item.name}`}
                      onMouseEnter={() => inspect(item.index)}
                      onFocus={() => {
                        setFocus({ series, axes, seriesIndex: item.index });
                        inspect(item.index);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          event.preventDefault();
                          setInspection(null);
                        }
                      }}
                      onClick={() => {
                        inspect(item.index);
                        onSeriesClick?.(series[item.index]!, item.index);
                      }}
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate" title={item.name}>
                        {item.name}
                      </span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {ready && (
            <table className="sr-only">
              <caption>
                {ariaLabel ?? "Radar chart"} data and axis ranges
              </caption>
              <thead>
                <tr>
                  <th scope="col">Series</th>
                  {model.axes.map((axis) => (
                    <th key={axis.key} scope="col">
                      {axis.label} (
                      {valueFormatter(axis.min, axes[axis.index]!)} to{" "}
                      {valueFormatter(axis.max, axes[axis.index]!)})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {model.series.map((item) => (
                  <tr key={item.id}>
                    <th scope="row">{item.name}</th>
                    {item.values.map((value, index) => (
                      <td key={axes[index]!.key}>
                        {valueFormatter(value, axes[index]!)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tipData && activeSeries && (
            <InspectionTooltip
              id={`${id}-tooltip`}
              x={activePoint?.x ?? cx}
              y={activePoint?.y ?? cy}
              width={width}
              height={svgHeight}
            >
              {tooltipRenderer ? (
                tooltipRenderer(tipData)
              ) : (
                <>
                  <div className="mb-2 flex items-center gap-2 border-b border-border pb-2 text-xs font-medium text-muted-foreground">
                    <span
                      className="size-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: activeSeries.color }}
                    />
                    {activeSeries.name}
                  </div>
                  <div className="space-y-2">
                    {(activeAxis ? [activeAxis] : dimensions).map((axis) => (
                      <div key={axis.key}>
                        <div className="flex items-baseline justify-between gap-6 text-xs">
                          <span>{axis.label}</span>
                          <span className="font-semibold tabular-nums">
                            {valueFormatter(
                              activeSeries.values[axis.index]!,
                              axes[axis.index]!,
                            )}
                          </span>
                        </div>
                        {activeAxis && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Range {valueFormatter(axis.min, axes[axis.index]!)}–
                            {valueFormatter(axis.max, axes[axis.index]!)}
                          </p>
                        )}
                      </div>
                    ))}
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

export const RadarChart = memo(
  RadarChartComponent,
) as typeof RadarChartComponent;
