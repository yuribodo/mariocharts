"use client";
import {
  memo,
  useMemo,
  useState,
  useEffect,
  useRef,
  useId,
  type ReactNode,
  type KeyboardEvent,
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
  useContainerDimensions,
  type ChartDataItem,
  type FunnelChartTooltipData,
  type TooltipRenderer,
} from "../_shared";
import { InspectionTooltip } from "../_shared/inspection-tooltip";
import { buildFunnelModel, FUNNEL_COLORS } from "./model";
import { layoutFunnel, type FunnelVariant } from "./geometry";
export type { FunnelVariant };
export interface FunnelChartProps<T extends ChartDataItem> {
  /** Sequential stages in input order; values must be finite and nonnegative. */
  readonly data: readonly T[];
  readonly label: keyof T;
  readonly value: keyof T;
  /** Valid CSS colors; an empty palette uses the defaults. */
  readonly colors?: readonly string[];
  /** Tapered/smooth show transitions; straight/horizontal/columns compare measured extents. */
  readonly variant?: FunnelVariant;
  readonly showValues?: boolean;
  /** Percent of the first stage, not a sum of repeated stage counts. */
  readonly showPercentages?: boolean;
  readonly showConversionRates?: boolean;
  /** Signed change from the preceding stage: loss or increase. */
  readonly showDropOff?: boolean;
  readonly showConnectors?: boolean;
  /** Requested stage gap; rate annotations reserve at least 26px in row layouts. */
  readonly gap?: number;
  /** Corner radius for straight, horizontal and columns. */
  readonly borderRadius?: number;
  readonly className?: string;
  /** Stable frame height. Crowded stages scroll rather than overlap. */
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly valueFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
  readonly onClick?: (item: T, index: number) => void;
  readonly tooltipRenderer?: TooltipRenderer<FunnelChartTooltipData<T>>;
}
const PLACEHOLDER = [100, 72, 48, 28, 14].map((value, index) => ({
  label: `Stage ${index + 1}`,
  value,
}));
function Growth({
  progress,
  index,
  count,
  axis,
  x,
  y,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  count: number;
  axis: "x" | "y";
  x: number;
  y: number;
  children: ReactNode;
}) {
  const ref = useRef<SVGGElement>(null);
  const transform = (p: number) => {
    const delay = count > 1 ? (index / (count - 1)) * 0.22 : 0;
    const scale = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
    return axis === "x"
      ? `translate(${x * (1 - scale)} 0) scale(${scale} 1)`
      : `translate(0 ${y * (1 - scale)}) scale(1 ${scale})`;
  };
  useEffect(() => {
    const update = (p: number) => {
      const delay = count > 1 ? (index / (count - 1)) * 0.22 : 0;
      const scale = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
      ref.current?.setAttribute(
        "transform",
        axis === "x"
          ? `translate(${x * (1 - scale)} 0) scale(${scale} 1)`
          : `translate(0 ${y * (1 - scale)}) scale(1 ${scale})`,
      );
    };
    update(progress.get());
    return progress.on("change", update);
  }, [progress, index, count, axis, x, y]);
  return (
    <g ref={ref} data-funnel-growth="" transform={transform(progress.get())}>
      {children}
    </g>
  );
}
const rateText = (rate: number | null) =>
  rate === null ? "—" : `${rate.toFixed(1)}%`;
function FunnelChartComponent<T extends ChartDataItem>({
  data,
  label,
  value,
  colors = FUNNEL_COLORS,
  variant = "tapered",
  showValues = true,
  showPercentages = true,
  showConversionRates = false,
  showDropOff = false,
  showConnectors = true,
  gap = 12,
  borderRadius = 4,
  className,
  height = 400,
  loading = false,
  error = null,
  animation = true,
  valueFormatter = formatValue,
  ariaLabel = "Funnel chart",
  description,
  onClick,
  tooltipRenderer,
}: FunnelChartProps<T>) {
  const [containerRef, width] = useContainerDimensions();
  const id = useId(),
    reduced = useReducedMotion();
  const shouldAnimate = animation && !reduced;
  const progress = useMotionValue(shouldAnimate ? 0 : 1);
  const viewport = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({ x: 0, y: 0 });
  const model = useMemo(
    () => buildFunnelModel(data, label, value, colors),
    [data, label, value, colors],
  );
  const placeholder = useMemo(
    () => buildFunnelModel(PLACEHOLDER, "label", "value", FUNNEL_COLORS),
    [],
  );
  const source = loading && (!data.length || model.error) ? placeholder : model;
  const validHeight = Number.isFinite(height) && height > 0;
  const frameHeight = validHeight ? height : 400;
  const validGap = Number.isFinite(gap) && gap >= 0,
    validRadius = Number.isFinite(borderRadius) && borderRadius >= 0;
  const validVariant = [
    "tapered",
    "straight",
    "smooth",
    "horizontal",
    "columns",
  ].includes(variant);
  const chartError =
    error ||
    model.error ||
    (!validHeight
      ? "height must be a positive finite number."
      : !validGap
        ? "gap must be a finite nonnegative number."
        : !validRadius
          ? "borderRadius must be a finite nonnegative number."
          : !validVariant
            ? "Choose tapered, straight, smooth, horizontal or columns."
            : null);
  const geometry = useMemo(
    () =>
      layoutFunnel(
        source.stages.map((stage) => stage.ratio),
        width,
        frameHeight,
        validVariant ? variant : "tapered",
        validGap ? gap : 12,
        validRadius ? borderRadius : 4,
        showConversionRates || showDropOff,
        showValues || showPercentages,
      ),
    [
      source.stages,
      width,
      frameHeight,
      variant,
      validVariant,
      validGap,
      gap,
      validRadius,
      borderRadius,
      showConversionRates,
      showDropOff,
      showValues,
      showPercentages,
    ],
  );
  const ready = !loading && !chartError && data.length > 0 && width > 0;
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
  }, [ready, shouldAnimate, variant, progress]);
  const [inspection, setInspection] = useState<number | null>(null),
    [focus, setFocus] = useState<number | null>(null),
    [tabIndex, setTabIndex] = useState(0);
  const refs = useRef<(SVGRectElement | null)[]>([]);
  useEffect(() => {
    const focused = refs.current.findIndex(
      (element) => element !== null && element === document.activeElement,
    );
    setInspection(focused < 0 ? null : focused);
    setFocus(focused < 0 ? null : focused);
    if (focused >= 0) progress.jump(1);
  }, [data, label, value, variant, loading, error, progress]);
  const selected = Math.min(tabIndex, Math.max(0, source.stages.length - 1));
  const active =
    ready && inspection !== null ? model.stages[inspection] : undefined;
  const activeGeometry = active ? geometry.stages[active.index] : undefined;
  const tipX = activeGeometry ? activeGeometry.anchor.x - scroll.x : 0,
    tipY = activeGeometry ? activeGeometry.anchor.y - scroll.y : 0;
  const tip: FunnelChartTooltipData<T> | null = active
    ? { ...active, formattedValue: valueFormatter(active.value) }
    : null;
  const changeText = (change: number | null) =>
    change === null
      ? "—"
      : change > 0
        ? `+${valueFormatter(change)} gained`
        : change < 0
          ? `−${valueFormatter(-change)} lost`
          : "No change";
  function navigate(event: KeyboardEvent<SVGRectElement>, index: number) {
    let next = index;
    if (event.key === "Escape") {
      event.preventDefault();
      setInspection(null);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setInspection(index);
      onClick?.(data[index]!, index);
      return;
    }
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = data.length - 1;
    else if (["ArrowDown", "ArrowRight"].includes(event.key))
      next = (index + 1) % data.length;
    else if (["ArrowUp", "ArrowLeft"].includes(event.key))
      next = (index - 1 + data.length) % data.length;
    else return;
    event.preventDefault();
    setTabIndex(next);
    refs.current[next]?.focus();
  }
  const message =
    !loading && chartError
      ? chartError
      : !loading && !data.length
        ? "No Data"
        : !loading && !width
          ? "Waiting for chart space"
          : null;
  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height: frameHeight }}
      aria-busy={loading}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch") setInspection(focus);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocus(null);
          setInspection(null);
        }
      }}
    >
      {loading && (
        <span role="status" className="sr-only">
          Loading funnel
        </span>
      )}
      {message ? (
        <div
          role={chartError ? "alert" : "status"}
          className="flex h-full items-center justify-center p-6 text-center"
        >
          <div>
            <p
              className={cn(
                "font-medium",
                chartError ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {chartError ? "Chart Error" : message}
            </p>
            {chartError && (
              <p className="mt-2 text-sm text-muted-foreground">{chartError}</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div
            ref={viewport}
            className="h-full overflow-auto"
            onScroll={(event) =>
              setScroll({
                x: event.currentTarget.scrollLeft,
                y: event.currentTarget.scrollTop,
              })
            }
          >
            <svg
              width={geometry.width}
              height={geometry.height}
              role={loading ? "presentation" : "group"}
              aria-hidden={loading || undefined}
              aria-label={`${ariaLabel} with ${source.stages.length} stages`}
              aria-describedby={`${id}-description`}
              onFocusCapture={() => progress.jump(1)}
            >
              <desc id={`${id}-description`}>
                {description ? `${description} ` : ""}Stages follow input order.
                Width{variant === "columns" ? " is fixed; height" : ""}{" "}
                represents value relative to the largest stage.{" "}
                {variant === "tapered" || variant === "smooth"
                  ? "Each stage enters at its own width and transitions to the next stage; area is not a value encoding. "
                  : ""}
                Percentages use the first stage; rates use the preceding stage.
                A zero denominator has no defined rate. Arrow keys inspect
                stages, Home/End jump, Escape dismisses. Enter or Space selects
                a stage when an action is provided. Crowded stages scroll.
              </desc>
              {showConnectors && (
                <g aria-hidden="true">
                  {geometry.stages.map(
                    (shape, index) =>
                      shape.connector && (
                        <path
                          key={index}
                          data-funnel-connector={index}
                          d={shape.connector}
                          fill={
                            loading
                              ? "var(--muted)"
                              : source.stages[index]!.color
                          }
                          fillOpacity={0.14}
                        />
                      ),
                  )}
                </g>
              )}
              <g
                className={cn(
                  loading && "text-muted",
                  loading &&
                    shouldAnimate &&
                    "animate-pulse motion-reduce:animate-none",
                )}
              >
                {source.stages.map((stage, index) => {
                  const shape = geometry.stages[index]!;
                  const metrics = [
                    showValues
                      ? loading
                        ? ""
                        : valueFormatter(stage.value)
                      : "",
                    showPercentages ? rateText(stage.percentage) : "",
                  ].filter(Boolean);
                  return (
                    <g key={index}>
                      <Growth
                        progress={progress}
                        index={index}
                        count={source.stages.length}
                        axis={shape.axis}
                        x={shape.origin.x}
                        y={shape.origin.y}
                      >
                        <path
                          data-funnel-stage={loading ? undefined : index}
                          data-loading-stage={loading ? index : undefined}
                          d={shape.path}
                          fill={loading ? "currentColor" : stage.color}
                          aria-hidden="true"
                        />
                      </Growth>
                      <foreignObject
                        {...shape.label}
                        aria-hidden="true"
                        pointerEvents="none"
                      >
                        <div
                          className={cn(
                            "truncate px-1 text-xs font-medium text-foreground sm:text-sm",
                            variant === "columns" && "text-center",
                          )}
                          title={loading ? undefined : stage.label}
                        >
                          {loading ? (
                            <span className="inline-block h-2 w-16 rounded bg-muted" />
                          ) : (
                            stage.label
                          )}
                        </div>
                      </foreignObject>
                      {(showValues || showPercentages) && (
                        <foreignObject
                          {...shape.metrics}
                          aria-hidden="true"
                          pointerEvents="none"
                        >
                          <div
                            className={cn(
                              "px-1 text-xs tabular-nums text-muted-foreground",
                              variant === "columns"
                                ? "text-center"
                                : variant === "horizontal"
                                  ? "text-right"
                                  : "text-left",
                            )}
                            title={loading ? undefined : metrics.join(" · ")}
                          >
                            {loading ? (
                              <span className="inline-block h-2 w-12 rounded bg-muted" />
                            ) : variant === "columns" ||
                              (variant === "horizontal" &&
                                !geometry.compact) ? (
                              metrics.map((text, i) => (
                                <p
                                  key={i}
                                  className={cn(
                                    "truncate",
                                    showValues &&
                                      i === 0 &&
                                      "font-semibold text-foreground",
                                  )}
                                >
                                  {text}
                                </p>
                              ))
                            ) : (
                              <p className="truncate">{metrics.join(" · ")}</p>
                            )}
                          </div>
                        </foreignObject>
                      )}
                      {shape.rate && (
                        <foreignObject
                          {...shape.rate}
                          aria-hidden="true"
                          pointerEvents="none"
                        >
                          <div
                            className="truncate px-1 text-center text-[11px] tabular-nums text-muted-foreground"
                            title={
                              loading
                                ? undefined
                                : `${stage.previousValue === 0 ? "Previous stage is zero; rate undefined" : `${rateText(stage.conversionRate)} from previous`}; ${changeText(stage.change)}`
                            }
                          >
                            {!loading &&
                              [
                                showConversionRates
                                  ? `${stage.change !== null && stage.change > 0 ? "↑" : "↓"} ${rateText(stage.conversionRate)}`
                                  : "",
                                showDropOff ? changeText(stage.change) : "",
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                          </div>
                        </foreignObject>
                      )}
                      {ready && (
                        <rect
                          ref={(node) => {
                            refs.current[index] = node;
                          }}
                          {...shape.hit}
                          data-funnel-target={index}
                          fill="transparent"
                          rx={4}
                          stroke={
                            inspection === index || focus === index
                              ? "var(--foreground)"
                              : "transparent"
                          }
                          strokeWidth={1.5}
                          className={cn(
                            "outline-none touch-manipulation focus-visible:stroke-foreground",
                            onClick ? "cursor-pointer" : "cursor-default",
                          )}
                          role={onClick ? "button" : "graphics-symbol"}
                          tabIndex={index === selected ? 0 : -1}
                          aria-label={`${stage.label}: ${valueFormatter(stage.value)}; ${rateText(stage.percentage)} of first${index ? `; ${rateText(stage.conversionRate)} from previous; ${changeText(stage.change)}` : ""}`}
                          aria-describedby={
                            inspection === index ? `${id}-tooltip` : undefined
                          }
                          onMouseEnter={() => setInspection(index)}
                          onPointerDown={() => setInspection(index)}
                          onFocus={() => {
                            setTabIndex(index);
                            setFocus(index);
                            setInspection(index);
                          }}
                          onClick={() => {
                            setInspection(index);
                            onClick?.(data[index]!, index);
                          }}
                          onKeyDown={(event) => navigate(event, index)}
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
          {ready && (
            <table className="sr-only">
              <caption>{ariaLabel} source stages</caption>
              <thead>
                <tr>
                  <th scope="col">Stage</th>
                  <th scope="col">Value</th>
                  <th scope="col">Of first</th>
                  <th scope="col">From previous</th>
                  <th scope="col">Change</th>
                </tr>
              </thead>
              <tbody>
                {model.stages.map((stage) => (
                  <tr key={stage.index}>
                    <th scope="row">{stage.label}</th>
                    <td>{valueFormatter(stage.value)}</td>
                    <td>{rateText(stage.percentage)}</td>
                    <td>{rateText(stage.conversionRate)}</td>
                    <td>{changeText(stage.change)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tip &&
            activeGeometry &&
            tipX >= 0 &&
            tipX <= width &&
            tipY >= 0 &&
            tipY <= frameHeight && (
              <InspectionTooltip
                id={`${id}-tooltip`}
                x={tipX}
                y={tipY}
                width={width}
                height={frameHeight}
              >
                {tooltipRenderer ? (
                  tooltipRenderer(tip)
                ) : (
                  <>
                    <p className="mb-2 border-b border-border pb-2 text-xs font-medium text-muted-foreground">
                      {tip.label}
                    </p>
                    <div className="flex items-center justify-between gap-6 text-sm font-semibold">
                      <span
                        className="size-2.5 rounded-sm"
                        style={{ background: tip.color }}
                      />
                      <span>{tip.formattedValue}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {model.baseline === 0
                        ? "First stage is zero; percentage undefined"
                        : `${rateText(tip.percentage)} of first stage`}
                    </p>
                    {tip.index > 0 && (
                      <>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {tip.previousValue === 0
                            ? "Previous stage is zero; rate undefined"
                            : `${rateText(tip.conversionRate)} from previous stage`}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {changeText(tip.change)}
                        </p>
                      </>
                    )}
                  </>
                )}
              </InspectionTooltip>
            )}
        </>
      )}
    </div>
  );
}
export const FunnelChart = memo(
  FunnelChartComponent,
) as typeof FunnelChartComponent;
