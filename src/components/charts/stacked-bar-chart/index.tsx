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
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { cn } from "../../../../lib/utils";
import {
  formatValue,
  getGridDasharray,
  useContainerDimensions,
  type ChartDataItem,
  type StackedBarChartTooltipData,
  type TooltipRenderer,
} from "../_shared";
import { InspectionTooltip } from "../_shared/inspection-tooltip";
import {
  buildStackModel,
  getStackGeometry,
  getStackPath,
  scaleStackValue,
} from "./utils";

export interface StackedBarChartProps<T extends ChartDataItem> {
  /** Finite segment values; missing/malformed values show a row/key error. */
  readonly data: readonly T[];
  /** Category key. Rows retain input order, including duplicate labels. */
  readonly x: keyof T;
  /** Unique numeric keys in stack and legend order. */
  readonly y: readonly (keyof T)[];
  readonly colors?: readonly string[];
  readonly className?: string;
  /** Total frame height, including the optional legend. Defaults to 300. */
  readonly height?: number;
  /** Retain data during refresh to preserve exact segment geometry. */
  readonly loading?: boolean;
  readonly error?: string | null;
  /** Grow entire stacks from zero, preserving segment joins. Respects reduced motion. */
  readonly animation?: boolean;
  readonly variant?: "filled" | "outline";
  readonly orientation?: "vertical" | "horizontal";
  /** Radius in pixels at the outer ends of each signed stack. Internal joins stay flat. Defaults to 2. */
  readonly cornerRadius?: number;
  readonly showLegend?: boolean;
  readonly showGrid?: boolean;
  readonly gridStyle?: "solid" | "dashed" | "dotted";
  /** Format segment values and signed totals. */
  readonly valueFormatter?: (value: number) => string;
  /** Format numeric ticks; defaults to valueFormatter. */
  readonly axisValueFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
  /** Original row, selected stack key, and original row index. Enter/Space also activate. */
  readonly onSegmentClick?: (data: T, stackKey: string, index: number) => void;
  readonly tooltipRenderer?: TooltipRenderer<StackedBarChartTooltipData<T>>;
}

// Retained type exports for consumers that describe custom stacked-bar geometry.
export interface StackSegment {
  readonly key: string;
  readonly value: number;
  readonly formattedValue: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly color: string;
  readonly stackIndex: number;
}
export interface ProcessedBar<T> {
  readonly data: T;
  readonly barIndex: number;
  readonly label: string;
  readonly segments: readonly StackSegment[];
  readonly totalValue: number;
  readonly formattedTotal: string;
}
export type { ChartDataItem };
export { formatValue };
export const DEFAULT_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
] as const;
const PLACEHOLDER = [
  { label: "", a: 30, b: 20, c: 15 },
  { label: "", a: 40, b: 25, c: 20 },
  { label: "", a: 20, b: 30, c: 20 },
  { label: "", a: 40, b: 30, c: 25 },
];
const PLACEHOLDER_MODEL = buildStackModel(PLACEHOLDER, "label", [
  "a",
  "b",
  "c",
]);

function StackGrowth({
  progress,
  zero,
  vertical,
  children,
}: {
  progress: MotionValue<number>;
  zero: number;
  vertical: boolean;
  children: ReactNode;
}) {
  const ref = useRef<SVGGElement>(null);
  const transform = (value: number) =>
    vertical
      ? `translate(0 ${zero * (1 - value)}) scale(1 ${value})`
      : `translate(${zero * (1 - value)} 0) scale(${value} 1)`;
  useEffect(() => {
    const update = (value: number) =>
      ref.current?.setAttribute(
        "transform",
        vertical
          ? `translate(0 ${zero * (1 - value)}) scale(1 ${value})`
          : `translate(${zero * (1 - value)} 0) scale(${value} 1)`,
      );
    update(progress.get());
    return progress.on("change", update);
  }, [progress, zero, vertical]);
  return (
    <g ref={ref} data-stack-growth="" transform={transform(progress.get())}>
      {children}
    </g>
  );
}

function StackedBarChartComponent<T extends ChartDataItem>({
  data,
  x,
  y,
  colors = DEFAULT_COLORS,
  className,
  height = 300,
  loading = false,
  error = null,
  animation = true,
  variant = "filled",
  orientation = "vertical",
  cornerRadius = 2,
  showLegend = false,
  showGrid = false,
  gridStyle = "dashed",
  valueFormatter = formatValue,
  axisValueFormatter = valueFormatter,
  ariaLabel = "Stacked bar chart",
  description,
  onSegmentClick,
  tooltipRenderer,
}: StackedBarChartProps<T>) {
  const [containerRef, width] = useContainerDimensions();
  const id = useId();
  const reduced = useReducedMotion();
  const shouldAnimate = animation && !reduced;
  const progress = useMotionValue(shouldAnimate ? 0 : 1);
  const refs = useRef<(SVGRectElement | null)[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  type Selection = {
    data: typeof data;
    x: keyof T;
    keys: string;
    row: number;
    stack: number;
  };
  const keys = y.map(String).join("\u0000");
  const [inspection, setInspection] = useState<Selection | null>(null);
  const [focus, setFocus] = useState<Selection | null>(null);
  useEffect(() => {
    setInspection(null);
    setFocus(null);
  }, [data, x, keys, loading, error, orientation]);
  const model = useMemo(() => buildStackModel(data, x, y), [data, x, y]);
  const initialLoading = loading && (!data.length || !!model.error);
  const source = initialLoading ? PLACEHOLDER_MODEL : model;
  const validHeight = Number.isFinite(height) && height > 0;
  const validRadius = Number.isFinite(cornerRadius) && cornerRadius >= 0;
  const chartError =
    error ||
    model.error ||
    (!validHeight ? "Chart height must be a positive, finite number." : null) ||
    (!validRadius
      ? "cornerRadius must be a finite, nonnegative number of pixels."
      : null);
  const frameHeight = validHeight ? height : 300;
  const legendHeight = showLegend ? Math.min(48, frameHeight / 5) : 0;
  const svgHeight = frameHeight - legendHeight;
  const vertical = orientation === "vertical";
  const left = vertical ? Math.min(56, width / 4) : Math.min(112, width * 0.32);
  const plot = {
    left,
    top: 16,
    width: Math.max(0, width - left - 16),
    height: Math.max(0, svgHeight - 52),
  };
  const { domain } = source;
  const zero = vertical
    ? plot.height - scaleStackValue(0, domain, plot.height)
    : scaleStackValue(0, domain, plot.width);
  const bars = useMemo(
    () =>
      source.bars.map((bar) => ({
        ...bar,
        segments: bar.segments.map((segment) => {
          const rect = getStackGeometry(
            segment.start,
            segment.end,
            bar.index,
            source.bars.length,
            plot.width,
            plot.height,
            domain,
            vertical,
          );
          return {
            ...segment,
            ...rect,
            color:
              colors[segment.stackIndex % colors.length] ?? DEFAULT_COLORS[0],
            path: getStackPath(
              rect,
              vertical,
              segment.value < 0,
              segment.terminal && validRadius ? cornerRadius : 0,
            ),
          };
        }),
      })),
    [
      source.bars,
      plot.width,
      plot.height,
      domain,
      vertical,
      colors,
      validRadius,
      cornerRadius,
    ],
  );
  const ready =
    !loading &&
    !chartError &&
    data.length > 0 &&
    plot.width > 0 &&
    plot.height > 0;
  useEffect(() => {
    if (!ready || !shouldAnimate) {
      progress.jump(1);
      return;
    }
    progress.set(0);
    const controls = animate(progress, 1, {
      duration: 0.7,
      ease: [0.33, 0, 0.2, 1],
    });
    return () => controls.stop();
  }, [ready, shouldAnimate, progress]);
  const matches = (selection: Selection | null) =>
    selection?.data === data && selection.x === x && selection.keys === keys;
  const activeBar =
    ready && matches(inspection) ? bars[inspection!.row] : undefined;
  const activeSegment = activeBar?.segments[inspection!.stack];
  const focused = ready && matches(focus) ? focus : null;
  const count = bars.length * y.length;
  const selected = tabIndex < count ? tabIndex : 0;
  function inspect(row: number, stack: number) {
    setInspection({ data, x, keys, row, stack });
  }
  function navigate(
    event: KeyboardEvent<SVGRectElement>,
    row: number,
    stack: number,
  ) {
    let nextRow = row,
      nextStack = stack;
    const categoryForward = vertical ? "ArrowRight" : "ArrowDown";
    const categoryBack = vertical ? "ArrowLeft" : "ArrowUp";
    const stackForward = vertical ? "ArrowUp" : "ArrowRight";
    const stackBack = vertical ? "ArrowDown" : "ArrowLeft";
    if (event.key === categoryForward) nextRow = (row + 1) % bars.length;
    else if (event.key === categoryBack)
      nextRow = (row + bars.length - 1) % bars.length;
    else if (event.key === stackForward) nextStack = (stack + 1) % y.length;
    else if (event.key === stackBack)
      nextStack = (stack + y.length - 1) % y.length;
    else if (event.key === "Home") {
      nextRow = 0;
      nextStack = 0;
    } else if (event.key === "End") {
      nextRow = bars.length - 1;
      nextStack = y.length - 1;
    } else if (event.key === "Escape") {
      event.preventDefault();
      setInspection(null);
      return;
    } else if ((event.key === "Enter" || event.key === " ") && onSegmentClick) {
      event.preventDefault();
      onSegmentClick(data[row]!, String(y[stack]), row);
      return;
    } else return;
    event.preventDefault();
    const next = nextRow * y.length + nextStack;
    setTabIndex(next);
    refs.current[next]?.focus();
  }
  const tipData: StackedBarChartTooltipData<T> | null =
    activeBar && activeSegment
      ? {
          data: data[activeBar.index]!,
          label: activeBar.label,
          index: activeBar.index,
          segments: activeBar.segments.map((segment) => ({
            key: segment.key,
            value: segment.value,
            color: segment.color,
          })),
          total: activeBar.total,
          positiveTotal: activeBar.positive,
          negativeTotal: activeBar.negative,
          activeKey: activeSegment.key,
          activeIndex: activeSegment.stackIndex,
        }
      : null;
  const ticks = domain.ticks.filter(
    (_, index, list) =>
      vertical ||
      plot.width >= 300 ||
      index === 0 ||
      index === list.length - 1 ||
      domain.ticks[index] === 0,
  );
  const band = (vertical ? plot.width : plot.height) / Math.max(1, bars.length);
  const categoryEvery = Math.max(
    1,
    Math.ceil((vertical ? 48 : 20) / Math.max(1, band)),
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
            aria-label={ariaLabel}
            aria-describedby={`${id}-description`}
            onFocusCapture={() => progress.jump(1)}
          >
            <desc id={`${id}-description`}>
              {description ? `${description} ` : ""}Positive and negative values
              stack independently from zero.{" "}
              {vertical
                ? "Left/Right changes category; Up/Down changes segment in key order."
                : "Up/Down changes category; Right/Left changes segment in key order."}{" "}
              Home/End jumps to the first/last segment. Escape dismisses
              inspection.{" "}
              {onSegmentClick ? "Enter or Space selects a segment." : ""}
            </desc>
            <defs>
              <clipPath id={`${id}-plot`}>
                <rect width={plot.width} height={plot.height} />
              </clipPath>
            </defs>
            <g transform={`translate(${left} ${plot.top})`}>
              <g aria-hidden="true">
                {showGrid &&
                  ticks.map((tick, index) => {
                    const pixel = scaleStackValue(
                      tick,
                      domain,
                      vertical ? plot.height : plot.width,
                    );
                    return (
                      <line
                        key={index}
                        data-stack-grid=""
                        x1={vertical ? 0 : pixel}
                        x2={vertical ? plot.width : pixel}
                        y1={vertical ? plot.height - pixel : 0}
                        y2={vertical ? plot.height - pixel : plot.height}
                        strokeDasharray={getGridDasharray(gridStyle)}
                        className="stroke-border"
                      />
                    );
                  })}
                <path
                  d={`M 0 0 V ${plot.height} H ${plot.width}`}
                  fill="none"
                  className="stroke-border"
                />
                <line
                  data-stack-baseline=""
                  x1={vertical ? 0 : zero}
                  x2={vertical ? plot.width : zero}
                  y1={vertical ? zero : 0}
                  y2={vertical ? zero : plot.height}
                  strokeOpacity={0.6}
                  className="stroke-muted-foreground"
                />
                {ticks.map((tick, index) => {
                  const pixel = scaleStackValue(
                    tick,
                    domain,
                    vertical ? plot.height : plot.width,
                  );
                  const tickWidth = Math.min(
                    80,
                    plot.width / Math.max(1, ticks.length - 1),
                  );
                  return (
                    <foreignObject
                      key={index}
                      x={
                        vertical
                          ? -left
                          : Math.max(
                              0,
                              Math.min(
                                pixel - tickWidth / 2,
                                plot.width - tickWidth,
                              ),
                            )
                      }
                      y={vertical ? plot.height - pixel - 9 : plot.height + 8}
                      width={vertical ? Math.max(0, left - 8) : tickWidth}
                      height={18}
                    >
                      <div
                        className={cn(
                          "truncate text-xs text-muted-foreground",
                          vertical && "text-right",
                        )}
                        style={
                          vertical
                            ? undefined
                            : {
                                textAlign:
                                  index === 0
                                    ? "left"
                                    : index === ticks.length - 1
                                      ? "right"
                                      : "center",
                              }
                        }
                        title={loading ? undefined : axisValueFormatter(tick)}
                      >
                        {loading ? (
                          <span className="inline-block h-2 w-6 rounded bg-muted" />
                        ) : (
                          axisValueFormatter(tick)
                        )}
                      </div>
                    </foreignObject>
                  );
                })}
                {bars.map(
                  (bar, index) =>
                    index % categoryEvery === 0 && (
                      <foreignObject
                        key={index}
                        x={vertical ? index * band : -left}
                        y={
                          vertical
                            ? plot.height + 8
                            : index * band + band / 2 - 9
                        }
                        width={vertical ? band : Math.max(0, left - 8)}
                        height={18}
                      >
                        <div
                          className={cn(
                            "truncate text-xs text-muted-foreground",
                            vertical ? "px-1 text-center" : "text-right",
                          )}
                          title={loading ? undefined : bar.label}
                        >
                          {loading ? (
                            <span className="inline-block h-2 w-8 rounded bg-muted" />
                          ) : (
                            bar.label
                          )}
                        </div>
                      </foreignObject>
                    ),
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
                <StackGrowth
                  progress={progress}
                  zero={zero}
                  vertical={vertical}
                >
                  {bars.flatMap((bar) =>
                    bar.segments.map((segment) => (
                      <path
                        key={`${bar.index}-${segment.stackIndex}`}
                        data-stack-segment={
                          loading
                            ? undefined
                            : `${bar.index}-${segment.stackIndex}`
                        }
                        data-loading-segment={
                          loading
                            ? `${bar.index}-${segment.stackIndex}`
                            : undefined
                        }
                        d={segment.path}
                        fill={
                          variant === "filled"
                            ? loading
                              ? "currentColor"
                              : segment.color
                            : "none"
                        }
                        stroke={
                          variant === "outline"
                            ? loading
                              ? "currentColor"
                              : segment.color
                            : "none"
                        }
                        strokeWidth={1.5}
                        vectorEffect="non-scaling-stroke"
                        aria-hidden="true"
                      />
                    )),
                  )}
                </StackGrowth>
                {ready &&
                  bars.flatMap((bar) =>
                    bar.segments.map((segment) => {
                      const targetWidth = vertical
                        ? segment.width
                        : Math.min(plot.width, Math.max(12, segment.width));
                      const targetHeight = vertical
                        ? Math.min(plot.height, Math.max(12, segment.height))
                        : segment.height;
                      const targetX = Math.max(
                        0,
                        Math.min(
                          segment.x + segment.width / 2 - targetWidth / 2,
                          plot.width - targetWidth,
                        ),
                      );
                      const targetY = Math.max(
                        0,
                        Math.min(
                          segment.y + segment.height / 2 - targetHeight / 2,
                          plot.height - targetHeight,
                        ),
                      );
                      const focusedHere =
                        focused?.row === bar.index &&
                        focused.stack === segment.stackIndex;
                      const activeHere =
                        activeBar?.index === bar.index &&
                        activeSegment?.stackIndex === segment.stackIndex;
                      return (
                        <rect
                          key={`${bar.index}-${segment.stackIndex}`}
                          ref={(el) => {
                            refs.current[
                              bar.index * y.length + segment.stackIndex
                            ] = el;
                          }}
                          data-stack-target={`${bar.index}-${segment.stackIndex}`}
                          x={targetX}
                          y={targetY}
                          width={targetWidth}
                          height={targetHeight}
                          fill="transparent"
                          stroke={
                            activeHere || focusedHere
                              ? "currentColor"
                              : "transparent"
                          }
                          strokeWidth={1.5}
                          className={cn(
                            "text-foreground",
                            "outline-none touch-manipulation focus-visible:stroke-foreground",
                            onSegmentClick
                              ? "cursor-pointer"
                              : "cursor-default",
                          )}
                          role={onSegmentClick ? "button" : "graphics-symbol"}
                          tabIndex={
                            bar.index * y.length + segment.stackIndex ===
                            selected
                              ? 0
                              : -1
                          }
                          aria-label={`${bar.label}, ${segment.key}: ${valueFormatter(segment.value)}`}
                          aria-describedby={
                            activeHere ? `${id}-tooltip` : undefined
                          }
                          onMouseEnter={() =>
                            inspect(bar.index, segment.stackIndex)
                          }
                          onPointerDown={() =>
                            inspect(bar.index, segment.stackIndex)
                          }
                          onFocus={() => {
                            setTabIndex(
                              bar.index * y.length + segment.stackIndex,
                            );
                            setFocus({
                              data,
                              x,
                              keys,
                              row: bar.index,
                              stack: segment.stackIndex,
                            });
                            inspect(bar.index, segment.stackIndex);
                          }}
                          onClick={() => {
                            inspect(bar.index, segment.stackIndex);
                            onSegmentClick?.(
                              data[bar.index]!,
                              segment.key,
                              bar.index,
                            );
                          }}
                          onKeyDown={(event) =>
                            navigate(event, bar.index, segment.stackIndex)
                          }
                        />
                      );
                    }),
                  )}
              </g>
            </g>
          </svg>
          {showLegend && (
            <ul
              aria-label={loading ? undefined : "Chart series"}
              aria-hidden={loading || undefined}
              className="flex flex-wrap content-start justify-center gap-x-5 gap-y-2 overflow-auto px-3 py-2 text-xs"
              style={{ height: legendHeight }}
            >
              {(initialLoading ? ["a", "b", "c"] : y).map((key, index) => (
                <li
                  key={String(key)}
                  className="flex min-w-0 max-w-full items-center gap-2"
                >
                  <span
                    className={cn(
                      "size-2.5 shrink-0 rounded-sm",
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
                    <span className="h-2 w-12 rounded bg-muted" />
                  ) : (
                    <span className="truncate" title={String(key)}>
                      {String(key)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {ready && (
            <table className="sr-only">
              <caption>{ariaLabel} source values and signed totals</caption>
              <thead>
                <tr>
                  <th scope="col">Category</th>
                  {y.map((key) => (
                    <th scope="col" key={String(key)}>
                      {String(key)}
                    </th>
                  ))}
                  <th scope="col">Positive total</th>
                  <th scope="col">Negative total</th>
                  <th scope="col">Net total</th>
                </tr>
              </thead>
              <tbody>
                {model.bars.map((bar) => (
                  <tr key={bar.index}>
                    <th scope="row">{bar.label}</th>
                    {bar.segments.map((segment) => (
                      <td key={segment.key}>{valueFormatter(segment.value)}</td>
                    ))}
                    <td>{valueFormatter(bar.positive)}</td>
                    <td>{valueFormatter(bar.negative)}</td>
                    <td>{valueFormatter(bar.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeBar && activeSegment && tipData && (
            <InspectionTooltip
              id={`${id}-tooltip`}
              x={left + activeSegment.x + activeSegment.width / 2}
              y={plot.top + activeSegment.y + activeSegment.height / 2}
              width={width}
              height={svgHeight}
            >
              {tooltipRenderer ? (
                tooltipRenderer(tipData)
              ) : (
                <>
                  <p className="mb-2 border-b border-border pb-2 text-xs font-medium text-muted-foreground">
                    {activeBar.label}
                  </p>
                  <div className="space-y-1.5 text-xs">
                    {activeBar.segments.map((segment) => (
                      <div
                        key={segment.key}
                        className={cn(
                          "flex items-center gap-2",
                          segment.stackIndex === activeSegment.stackIndex
                            ? "font-semibold"
                            : "text-muted-foreground",
                        )}
                      >
                        <span
                          className="size-2 shrink-0 rounded-sm"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="min-w-0 flex-1">{segment.key}</span>
                        <span className="ml-4 tabular-nums">
                          {valueFormatter(segment.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 space-y-1 border-t border-border pt-2 text-xs">
                    {activeBar.negative < 0 && (
                      <>
                        <div className="flex justify-between gap-6">
                          <span>Positive total</span>
                          <span className="tabular-nums">
                            {valueFormatter(activeBar.positive)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-6">
                          <span>Negative total</span>
                          <span className="tabular-nums">
                            {valueFormatter(activeBar.negative)}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between gap-6 font-semibold">
                      <span>
                        {activeBar.negative < 0 ? "Net total" : "Total"}
                      </span>
                      <span className="tabular-nums">
                        {valueFormatter(activeBar.total)}
                      </span>
                    </div>
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
export const StackedBarChart = memo(
  StackedBarChartComponent,
) as typeof StackedBarChartComponent;
