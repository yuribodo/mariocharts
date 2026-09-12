"use client";

import {
  memo,
  useId,
  useMemo,
  useRef,
  useState,
  useEffect,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  animate as animateValue,
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { cn } from "../../../../lib/utils";
import { formatValue, useContainerDimensions } from "../_shared";
import type {
  ChartDataItem,
  PieChartTooltipData,
  TooltipRenderer,
} from "../_shared";
import { InspectionTooltip } from "../_shared/inspection-tooltip";
import { buildPieModel, getPieLayout, getSlicePath, polarPoint } from "./utils";

interface PieChartProps<T extends ChartDataItem> {
  /** Finite, nonnegative observations. Zero shares have no slice. */
  readonly data: readonly T[];
  readonly value: keyof T;
  readonly label: keyof T;
  readonly colors?: readonly string[];
  readonly className?: string;
  /** Total frame height, including an optional legend, in every variant and state. */
  readonly height?: number;
  /** Retain data during refresh to preserve the exact slice geometry. */
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly variant?: "pie" | "donut" | "semi";
  /** Fraction of the outer radius, from 0 inclusive to 1 exclusive. Ignored for pie. */
  readonly innerRadius?: number;
  /** Slice corner radius in pixels. Zero gives flat edges; constrained to fit each slice. */
  readonly cornerRadius?: number;
  readonly centerContent?:
    | ReactNode
    | ((data: { total: number; items: readonly T[] }) => ReactNode);
  readonly showLegend?: boolean;
  readonly onSliceClick?: (data: T, index: number) => void;
  /** rawValue contains the source value field; value is its parsed numeric value. */
  readonly tooltipRenderer?: TooltipRenderer<PieChartTooltipData<T>>;
  readonly valueFormatter?: (value: number) => string;
  /** Receives a percentage from 0 to 100. */
  readonly percentageFormatter?: (percentage: number) => string;
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
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#6366f1",
] as const;
const DEFAULT_HEIGHT = 300;
const PLACEHOLDER = [
  { label: "", value: 40 },
  { label: "", value: 30 },
  { label: "", value: 20 },
  { label: "", value: 10 },
] as const;
const defaultPercentage = (percentage: number) => {
  if (percentage > 0 && percentage < 0.1) return `<${(0.1).toLocaleString()}%`;
  if (percentage > 99.9 && percentage < 100)
    return `>${(99.9).toLocaleString()}%`;
  return `${percentage.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
};

/** Reveal the circumference with one animated mask, keeping all final geometry stable. */
function SliceReveal({
  id,
  layout,
  semi,
  enabled,
  children,
}: {
  id: string;
  layout: ReturnType<typeof getPieLayout>;
  semi: boolean;
  enabled: boolean;
  children: ReactNode;
}) {
  const progress = useMotionValue(enabled ? 0 : 1);
  const path = useTransform(progress, (fraction) => {
    const start = fraction >= 1 ? 0 : semi ? -90 : 0;
    return getSlicePath(
      layout.cx,
      layout.cy,
      layout.outer + 4,
      0,
      start,
      fraction >= 1 ? 360 : start + (semi ? 180 : 360) * fraction,
    );
  });
  useEffect(() => {
    if (!enabled) {
      progress.jump(1);
      return;
    }
    progress.set(0);
    const controls = animateValue(progress, 1, {
      duration: 0.85,
      ease: [0.33, 0, 0.2, 1],
    });
    return () => controls.stop();
  }, [enabled, progress]);
  return (
    <>
      {enabled && (
        <defs>
          <clipPath id={id}>
            <motion.path d={path} />
          </clipPath>
        </defs>
      )}
      <g
        clipPath={enabled ? `url(#${id})` : undefined}
        onFocusCapture={() => progress.jump(1)}
      >
        {children}
      </g>
    </>
  );
}

function PieChartComponent<T extends ChartDataItem>({
  data,
  value,
  label,
  colors = DEFAULT_COLORS,
  className,
  height = DEFAULT_HEIGHT,
  loading = false,
  error = null,
  animation = true,
  variant = "donut",
  innerRadius = 0.6,
  cornerRadius = 0,
  centerContent,
  showLegend = false,
  onSliceClick,
  tooltipRenderer,
  valueFormatter = formatValue,
  percentageFormatter = defaultPercentage,
  ariaLabel,
  description,
}: PieChartProps<T>) {
  const [containerRef, width] = useContainerDimensions();
  const id = useId();
  const reduceMotion = useReducedMotion();
  const animate = animation && !reduceMotion;
  const refs = useRef<(SVGPathElement | null)[]>([]);
  const [tabPosition, setTabPosition] = useState(0);
  type Selection = {
    data: readonly T[];
    valueKey: keyof T;
    labelKey: keyof T;
    index: number;
  };
  const [inspection, setInspection] = useState<Selection | null>(null);
  const [focus, setFocus] = useState<Selection | null>(null);
  useEffect(() => {
    setInspection(null);
    setFocus(null);
  }, [data, value, label, loading, error, variant]);
  const model = useMemo(
    () => buildPieModel(data, value, label, variant),
    [data, value, label, variant],
  );
  const placeholder = useMemo(
    () => buildPieModel(PLACEHOLDER, "value", "label", variant),
    [variant],
  );
  const initialLoading = loading && (!!model.error || model.total <= 0);
  const frameHeight =
    Number.isFinite(height) && height > 0 ? height : DEFAULT_HEIGHT;
  const legendHeight = showLegend ? Math.min(80, frameHeight / 4) : 0;
  const svgHeight = frameHeight - legendHeight;
  const validRadius =
    variant === "pie" ||
    (Number.isFinite(innerRadius) && innerRadius >= 0 && innerRadius < 1);
  const layout = getPieLayout(
    width,
    svgHeight,
    variant,
    validRadius ? innerRadius : 0.6,
  );
  const chartError =
    error ||
    model.error ||
    (!(Number.isFinite(height) && height > 0)
      ? "Chart height must be a positive, finite number."
      : null) ||
    (!validRadius
      ? "innerRadius must be a finite fraction from 0 (inclusive) to 1 (exclusive)."
      : null) ||
    (!(Number.isFinite(cornerRadius) && cornerRadius >= 0)
      ? "cornerRadius must be a finite, nonnegative number of pixels."
      : null);
  const drawable = (initialLoading ? placeholder.slices : model.slices).map(
    (slice) => ({
      ...slice,
      color: colors[slice.index % colors.length] ?? DEFAULT_COLORS[0],
      path: getSlicePath(
        layout.cx,
        layout.cy,
        layout.outer,
        layout.inner,
        slice.start,
        slice.end,
        Number.isFinite(cornerRadius) ? cornerRadius : 0,
      ),
    }),
  );
  const ready = !loading && !chartError && model.total > 0 && layout.outer > 0;
  const matches = (selection: Selection | null) =>
    selection?.data === data &&
    selection.valueKey === value &&
    selection.labelKey === label;
  const active =
    ready && matches(inspection)
      ? drawable.find((slice) => slice.index === inspection!.index)
      : undefined;
  const focused = ready && matches(focus) ? focus!.index : null;
  const selectedPosition = Math.min(
    tabPosition,
    Math.max(0, drawable.length - 1),
  );
  const tipPoint = active
    ? polarPoint(
        layout.cx,
        layout.cy,
        (layout.outer + layout.inner) / 2,
        active.mid,
      )
    : null;
  const tipData: PieChartTooltipData<T> | null = active
    ? {
        label: active.label,
        value: active.value,
        rawValue: data[active.index]![value],
        percentage: active.percentage,
        color: active.color,
        index: active.index,
      }
    : null;
  function inspect(index: number) {
    setInspection({ data, valueKey: value, labelKey: label, index });
  }
  function dismissHover() {
    setInspection(matches(focus) ? focus : null);
  }
  function navigate(event: KeyboardEvent<SVGPathElement>, position: number) {
    let next = position;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (position + 1) % drawable.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (position + drawable.length - 1) % drawable.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = drawable.length - 1;
    else if (event.key === "Escape") {
      event.preventDefault();
      setInspection(null);
      return;
    } else if ((event.key === "Enter" || event.key === " ") && onSliceClick) {
      event.preventDefault();
      const slice = drawable[position]!;
      onSliceClick(data[slice.index]!, slice.index);
      return;
    } else return;
    event.preventDefault();
    setTabPosition(next);
    refs.current[next]?.focus();
  }
  // Rectangles fit inside the circular hole, including the semicircle's top half.
  const centerWidth = layout.inner * 1.35;
  const centerHeight = variant === "semi" ? layout.inner * 0.55 : centerWidth;
  const centerTop =
    variant === "semi"
      ? layout.cy - layout.inner * 0.7
      : layout.cy - centerHeight / 2;
  const stateMessage =
    !loading && chartError
      ? chartError
      : !loading && model.total <= 0
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
            {chartError && (
              <p className="text-sm text-muted-foreground">{chartError}</p>
            )}
            {!chartError && model.total <= 0 && (
              <p className="text-sm text-muted-foreground">
                {data.length
                  ? "All values are zero. There are no proportions to display."
                  : "There's no data to display"}
              </p>
            )}
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
              `${variant === "pie" ? "Pie" : variant === "semi" ? "Semi-circle" : "Donut"} chart with ${model.slices.length} segments`
            }
            aria-describedby={`${id}-description`}
          >
            <desc id={`${id}-description`}>
              {description ? `${description} ` : ""}Use arrow keys to inspect
              slices, Home and End to jump, and Escape to dismiss the tooltip.{" "}
              {onSliceClick ? "Press Enter or Space to select a slice. " : ""}
              Zero values have no slice.
            </desc>
            <SliceReveal
              key={`${variant}-${loading ? "loading" : "ready"}`}
              id={`${id}-reveal`}
              layout={layout}
              semi={variant === "semi"}
              enabled={animate && !loading}
            >
              <g
                className={cn(
                  loading && "text-muted",
                  loading &&
                    animate &&
                    "animate-pulse motion-reduce:animate-none",
                )}
              >
                {drawable.map((slice, position) => (
                  <motion.path
                    key={`${loading ? "loading" : "ready"}-${slice.index}`}
                    data-pie-slice={loading ? undefined : slice.index}
                    data-loading-slice={loading ? slice.index : undefined}
                    ref={(element) => {
                      refs.current[position] = element;
                    }}
                    d={slice.path}
                    fill={loading ? "currentColor" : slice.color}
                    stroke={
                      focused === slice.index
                        ? "var(--foreground)"
                        : "var(--background)"
                    }
                    strokeWidth={focused === slice.index ? 3 : 2}
                    strokeLinejoin="round"
                    className={cn(
                      "outline-none touch-manipulation",
                      !loading &&
                        (onSliceClick ? "cursor-pointer" : "cursor-default"),
                    )}
                    initial={false}
                    animate={{
                      opacity: active && active.index !== slice.index ? 0.5 : 1,
                    }}
                    transition={{ duration: animate ? 0.25 : 0 }}
                    role={
                      loading
                        ? undefined
                        : onSliceClick
                          ? "button"
                          : "graphics-symbol"
                    }
                    tabIndex={
                      loading
                        ? undefined
                        : position === selectedPosition
                          ? 0
                          : -1
                    }
                    aria-label={
                      loading
                        ? undefined
                        : `${slice.label}: ${valueFormatter(slice.value)} (${percentageFormatter(slice.percentage)})`
                    }
                    aria-describedby={
                      active?.index === slice.index
                        ? `${id}-tooltip`
                        : undefined
                    }
                    onMouseEnter={
                      loading ? undefined : () => inspect(slice.index)
                    }
                    onPointerDown={
                      loading ? undefined : () => inspect(slice.index)
                    }
                    onFocus={
                      loading
                        ? undefined
                        : () => {
                            setTabPosition(position);
                            setFocus({
                              data,
                              valueKey: value,
                              labelKey: label,
                              index: slice.index,
                            });
                            inspect(slice.index);
                          }
                    }
                    onClick={
                      loading
                        ? undefined
                        : () => {
                            inspect(slice.index);
                            onSliceClick?.(data[slice.index]!, slice.index);
                          }
                    }
                    onKeyDown={
                      loading ? undefined : (event) => navigate(event, position)
                    }
                  />
                ))}
              </g>
            </SliceReveal>
            {layout.inner > 0 &&
              centerContent !== null &&
              centerContent !== undefined && (
                <foreignObject
                  x={layout.cx - centerWidth / 2}
                  y={centerTop}
                  width={centerWidth}
                  height={centerHeight}
                  className="pointer-events-none overflow-hidden"
                >
                  <div className="flex h-full w-full items-center justify-center overflow-hidden break-words text-center">
                    {loading ? (
                      <span
                        aria-hidden="true"
                        className="h-4 w-12 max-w-full rounded bg-muted"
                      />
                    ) : typeof centerContent === "function" ? (
                      centerContent({ total: model.total, items: data })
                    ) : (
                      centerContent
                    )}
                  </div>
                </foreignObject>
              )}
          </svg>
          {showLegend && (
            <ul
              aria-label={loading ? undefined : "Chart values"}
              aria-hidden={loading || undefined}
              className="flex flex-wrap content-start justify-center gap-x-5 gap-y-2 overflow-auto px-3 py-2 text-xs"
              style={{ height: legendHeight }}
            >
              {(initialLoading ? placeholder.rows : model.rows).map((row) => (
                <li
                  key={row.index}
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
                              colors[row.index % colors.length] ??
                              DEFAULT_COLORS[0],
                          }
                    }
                  />
                  {loading ? (
                    <span className="h-2 w-16 rounded bg-muted" />
                  ) : (
                    <>
                      <span className="truncate" title={row.label}>
                        {row.label}
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {valueFormatter(row.value)}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
          {tipData && tipPoint && (
            <InspectionTooltip
              id={`${id}-tooltip`}
              x={tipPoint.x}
              y={tipPoint.y}
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
                      style={{ backgroundColor: tipData.color }}
                    />
                    {tipData.label}
                  </div>
                  <div className="flex items-baseline justify-between gap-6">
                    <span className="text-sm font-semibold tabular-nums">
                      {valueFormatter(tipData.value)}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {percentageFormatter(tipData.percentage)}
                    </span>
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

export const PieChart = memo(PieChartComponent) as typeof PieChartComponent;
export type { ChartDataItem, PieChartProps };
export { DEFAULT_COLORS, formatValue };
