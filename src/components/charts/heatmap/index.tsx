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
  useContainerDimensions,
  type ChartDataItem,
  type HeatmapChartTooltipData,
  type TooltipRenderer,
} from "../_shared";
import { InspectionTooltip } from "../_shared/inspection-tooltip";
import { StockLabel } from "./stock-label";
import { buildHeatmapModel } from "./model";
import {
  getHeatScale,
  getHeatPalette,
  getHeatColor,
  type ColorScheme,
} from "./colors";
import {
  layoutHeatStock,
  insetHeatRect,
  heatRectPath,
  heatPolar,
  heatRingPath,
} from "./geometry";
export type { ColorScheme };
export type HeatmapVariant = "grid" | "radial" | "stock";
export interface HeatmapChartProps<T extends ChartDataItem> {
  /** Rows in input order. Null/undefined/empty values are missing, not zero. */
  readonly data: readonly T[];
  readonly x: keyof T;
  /** Row/ring key; ignored by stock. */
  readonly y: keyof T;
  readonly value: keyof T;
  /** Nonnegative stock area weights. Omit for equal allocation. Zero has no area. */
  readonly weight?: keyof T;
  readonly variant?: HeatmapVariant;
  readonly colorScheme?: ColorScheme;
  /** Valid CSS colors, including inherited variables. Stock defaults to red/green. */
  readonly colorFrom?: string;
  readonly colorTo?: string;
  /** Fixed color bounds containing all measured values. Auto scales use the observed extent. */
  readonly domain?: readonly [number, number];
  /** Neutral value for diverging and stock scales. Defaults to zero. */
  readonly midpoint?: number;
  readonly showLabels?: boolean;
  readonly showLegend?: boolean;
  /** Grid/stock corner radius in pixels; radial cells keep circular edges. */
  readonly cellRadius?: number;
  readonly className?: string;
  /** Stable frame height including legends and notices. Defaults to 320. */
  readonly height?: number;
  /** Retain rows during refresh to preserve cell geometry. */
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  /** Measured value formatter. Stock defaults to signed percentages. */
  readonly valueFormatter?: (value: number) => string;
  readonly weightFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
  /** Original row only; absent matrix combinations cannot invoke an action. */
  readonly onClick?: (item: T, colLabel: string, rowLabel: string) => void;
  readonly tooltipRenderer?: TooltipRenderer<HeatmapChartTooltipData<T>>;
}
const PLACEHOLDER = Array.from({ length: 12 }, (_, i) => ({
  x: `C${i % 4}`,
  y: `R${Math.floor(i / 4)}`,
  value: i % 5,
  weight: 1 + (i % 3),
}));
const formatPercent = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
function GrowingCell({
  x,
  y,
  progress,
  children,
}: {
  x: number;
  y: number;
  progress: MotionValue<number>;
  children: ReactNode;
}) {
  const ref = useRef<SVGGElement>(null);
  const transform = (value: number) =>
    `translate(${x * (1 - value)} ${y * (1 - value)}) scale(${value})`;
  useEffect(() => {
    const update = (value: number) =>
      ref.current?.setAttribute(
        "transform",
        `translate(${x * (1 - value)} ${y * (1 - value)}) scale(${value})`,
      );
    update(progress.get());
    return progress.on("change", update);
  }, [x, y, progress]);
  return (
    <g ref={ref} data-heat-growth="" transform={transform(progress.get())}>
      {children}
    </g>
  );
}
function HeatmapChartComponent<T extends ChartDataItem>({
  data,
  x,
  y,
  value,
  weight,
  variant = "grid",
  colorScheme = "blue",
  colorFrom,
  colorTo,
  domain,
  midpoint = 0,
  showLabels = true,
  showLegend = false,
  cellRadius = 4,
  className,
  height = 320,
  loading = false,
  error = null,
  animation = true,
  valueFormatter,
  weightFormatter = formatValue,
  ariaLabel = "Heatmap chart",
  description,
  onClick,
  tooltipRenderer,
}: HeatmapChartProps<T>) {
  const [containerRef, width] = useContainerDimensions();
  const id = useId();
  const reduced = useReducedMotion();
  const shouldAnimate = animation && !reduced;
  const progress = useMotionValue(shouldAnimate ? 0 : 1);
  const stock = variant === "stock",
    radial = variant === "radial";
  const model = useMemo(
    () => buildHeatmapModel(data, x, y, value, stock, weight),
    [data, x, y, value, stock, weight],
  );
  const placeholder = useMemo(
    () => buildHeatmapModel(PLACEHOLDER, "x", "y", "value", stock, "weight"),
    [stock],
  );
  const initialLoading = loading && (!data.length || !!model.error);
  const source = initialLoading ? placeholder : model;
  const diverging = stock || colorScheme === "diverging";
  const scale = useMemo(
    () => getHeatScale(source.values, diverging, midpoint, domain),
    [source.values, diverging, midpoint, domain],
  );
  const palette = getHeatPalette(colorScheme, stock, colorFrom, colorTo);
  const validHeight = Number.isFinite(height) && height > 0,
    validRadius = Number.isFinite(cellRadius) && cellRadius >= 0;
  const chartError =
    error ||
    model.error ||
    scale.error ||
    (!validHeight
      ? "Heatmap height must be a positive, finite number."
      : null) ||
    (!validRadius
      ? "cellRadius must be a finite, nonnegative number."
      : null) ||
    (colorFrom?.trim() === "" || colorTo?.trim() === ""
      ? "Provide valid CSS colors for colorFrom and colorTo."
      : null);
  const frameHeight = validHeight ? height : 320;
  const areaWeights = useMemo(
    () => source.cells.map((cell) => cell.weight),
    [source.cells],
  );
  const ringOrderHeight = radial && showLabels ? 32 : 0;
  const legendHeight = showLegend ? 46 : 0;
  const stockLayout = useMemo(() => {
    let noticeHeight = source.missingCount > 0 ? 22 : 0;
    if (!stock) return { rects: [], omitted: 0, noticeHeight };
    const layout = () =>
      layoutHeatStock(
        areaWeights,
        Math.max(0, width - 16),
        Math.max(0, frameHeight - legendHeight - noticeHeight - 16),
      );
    let rects = layout();
    let omitted = rects.filter((rect) => !rect.width || !rect.height).length;
    if (omitted && !noticeHeight) {
      noticeHeight = 22;
      rects = layout();
      omitted = rects.filter((rect) => !rect.width || !rect.height).length;
    }
    return { rects, omitted, noticeHeight };
  }, [
    stock,
    areaWeights,
    source.missingCount,
    width,
    frameHeight,
    legendHeight,
  ]);
  const { rects: stockRects, omitted, noticeHeight } = stockLayout;
  const svgHeight = Math.max(
    0,
    frameHeight - noticeHeight - ringOrderHeight - legendHeight,
  );
  const left = !stock && !radial && showLabels ? Math.min(70, width * 0.24) : 8;
  const top = !stock && !radial && showLabels ? 28 : 8;
  const plotWidth = Math.max(0, width - left - 8),
    plotHeight = Math.max(0, svgHeight - top - 8);
  const cx = width / 2,
    cy = svgHeight / 2;
  const outer = Math.max(
    0,
    Math.min(
      width / 2 - (showLabels ? 50 : 8),
      svgHeight / 2 - (showLabels ? 26 : 8),
    ),
  );
  const inner = outer * 0.32;
  const ring = (outer - inner) / Math.max(1, source.rows.length);
  const angle = (Math.PI * 2) / Math.max(1, source.columns.length);
  const shapes = useMemo(
    () =>
      source.cells.map((cell, i) => {
        const rect = stock
          ? insetHeatRect({
              x: left + (stockRects[i]?.x ?? 0),
              y: top + (stockRects[i]?.y ?? 0),
              width: stockRects[i]?.width ?? 0,
              height: stockRects[i]?.height ?? 0,
            })
          : insetHeatRect({
              x: left + (cell.col * plotWidth) / source.columns.length,
              y: top + (cell.row * plotHeight) / source.rows.length,
              width: plotWidth / source.columns.length,
              height: plotHeight / source.rows.length,
            });
        const rOuter = outer - cell.row * ring,
          rInner = rOuter - ring + Math.min(1, ring / 4);
        const gap =
          source.columns.length === 1 ? 0 : Math.min(angle * 0.12, 0.018);
        const start = cell.col * angle - Math.PI / 2 + gap / 2,
          end = (cell.col + 1) * angle - Math.PI / 2 - gap / 2;
        const anchor = radial
          ? heatPolar(cx, cy, (rInner + rOuter) / 2, (start + end) / 2)
          : { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        return {
          cell,
          rect,
          anchor,
          path: radial
            ? heatRingPath(cx, cy, rInner, rOuter, start, end)
            : heatRectPath(rect, validRadius ? cellRadius : 0),
        };
      }),
    [
      source,
      stock,
      stockRects,
      left,
      top,
      plotWidth,
      plotHeight,
      outer,
      ring,
      angle,
      radial,
      cx,
      cy,
      validRadius,
      cellRadius,
    ],
  );
  const ready =
    !loading &&
    !chartError &&
    data.length > 0 &&
    plotWidth > 0 &&
    plotHeight > 0 &&
    (!radial || ring > 0);
  useEffect(() => {
    if (!ready || !shouldAnimate) {
      progress.jump(1);
      return;
    }
    progress.set(0);
    const controls = animate(progress, 1, {
      duration: 0.6,
      ease: [0.33, 0, 0.2, 1],
    });
    return () => controls.stop();
  }, [ready, shouldAnimate, progress, variant]);
  const [tabIndex, setTabIndex] = useState(0);
  const [inspection, setInspection] = useState<number | null>(null),
    [focus, setFocus] = useState<number | null>(null);
  const refs = useRef<(SVGPathElement | null)[]>([]);
  useEffect(() => {
    setInspection(null);
    setFocus(null);
  }, [data, x, y, value, weight, variant, loading, error]);
  const active = ready && inspection !== null ? shapes[inspection] : undefined;
  const navigation = shapes.flatMap((shape, index) =>
    shape.path ? [index] : [],
  );
  const selected = navigation.includes(tabIndex) ? tabIndex : navigation[0];
  const fmt = valueFormatter ?? (stock ? formatPercent : formatValue);
  function activate(index: number) {
    const cell = shapes[index]!.cell;
    if (cell.index !== null)
      onClick?.(data[cell.index]!, cell.xLabel, cell.yLabel);
  }
  function navigate(event: KeyboardEvent<SVGPathElement>, index: number) {
    const shape = shapes[index]!;
    let next = index;
    if (event.key === "Home") next = navigation[0]!;
    else if (event.key === "End") next = navigation[navigation.length - 1]!;
    else if (event.key === "Escape") {
      event.preventDefault();
      setInspection(null);
      return;
    } else if (
      (event.key === "Enter" || event.key === " ") &&
      onClick &&
      shape.cell.index !== null
    ) {
      event.preventDefault();
      activate(index);
      return;
    } else if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    ) {
      if (!stock) {
        const cols = source.columns.length,
          rows = source.rows.length;
        const col =
          (shape.cell.col +
            (event.key === "ArrowLeft"
              ? -1
              : event.key === "ArrowRight"
                ? 1
                : 0) +
            cols) %
          cols;
        const row =
          (shape.cell.row +
            (event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0) +
            rows) %
          rows;
        next = row * cols + col;
      } else {
        const horizontal =
            event.key === "ArrowLeft" || event.key === "ArrowRight",
          sign =
            event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
        let best = Infinity;
        for (const candidate of navigation) {
          const dx = shapes[candidate]!.anchor.x - shape.anchor.x,
            dy = shapes[candidate]!.anchor.y - shape.anchor.y;
          if ((horizontal ? dx : dy) * sign <= 0.001) continue;
          const distance = dx * dx + dy * dy;
          if (distance < best) {
            best = distance;
            next = candidate;
          }
        }
      }
    } else return;
    event.preventDefault();
    setTabIndex(next);
    refs.current[next]?.focus();
  }
  const normalized =
    active?.cell.value != null && !scale.error
      ? scale.normalize(active.cell.value)
      : null;
  // The root resolves flat and DEFAULT theme colors into the same CSS paint.
  const activeColor =
    normalized === null
      ? "var(--chart-missing-color)"
      : getHeatColor(normalized, palette, diverging);
  const tipData: HeatmapChartTooltipData<T> | null = active
    ? {
        data: active.cell.index === null ? null : data[active.cell.index]!,
        index: active.cell.index,
        xLabel: active.cell.xLabel,
        yLabel: active.cell.yLabel,
        value: active.cell.value,
        formattedValue:
          active.cell.value === null ? "No data" : fmt(active.cell.value),
        normalizedValue: normalized,
        color: activeColor,
        ...(stock ? { weightValue: active.cell.weight } : {}),
      }
    : null;
  const stateMessage =
    !loading && chartError
      ? chartError
      : !loading && !data.length
        ? "No Data"
        : !loading && !ready
          ? "Waiting for chart space"
          : null;
  const legendWidth = Math.min(240, Math.max(0, width - 48));
  const constant = scale.min === scale.max;
  const labelEvery = radial
    ? Math.max(
        1,
        Math.ceil(
          (44 * source.columns.length) /
            Math.max(1, 2 * Math.PI * (outer + 16)),
        ),
      )
    : Math.max(
        1,
        Math.ceil((40 * source.columns.length) / Math.max(1, plotWidth)),
      );
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full [--chart-missing-color:theme(colors.muted.DEFAULT,theme(colors.muted))]",
        className,
      )}
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
          Loading heatmap
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
              {description ? `${description} ` : ""}
              {stock
                ? "Area represents weight. Arrow keys inspect the nearest cell in that direction."
                : radial
                  ? "Columns run clockwise from the top; rows run from outer to inner rings. Left/Right changes column; Up/Down changes ring."
                  : "Left/Right changes column; Up/Down changes row."}{" "}
              Home/End jumps to the first/last cell. Escape dismisses
              inspection. Hatched cells have no data.{" "}
              {onClick ? "Enter or Space selects an existing observation." : ""}
            </desc>
            <defs>
              <pattern
                id={`${id}-missing`}
                patternUnits="userSpaceOnUse"
                width={6}
                height={6}
              >
                <rect width={6} height={6} className="fill-muted" />
                <path
                  d="M -1 1 L 1 -1 M 0 6 L 6 0 M 5 7 L 7 5"
                  strokeOpacity={0.4}
                  className="stroke-muted-foreground"
                />
              </pattern>
            </defs>
            {showLabels && !stock && (
              <g aria-hidden="true">
                {source.columns.map((label, col) => {
                  if (col % labelEvery) return null;
                  const point = radial
                    ? heatPolar(
                        cx,
                        cy,
                        outer + 16,
                        (col + 0.5) * angle - Math.PI / 2,
                      )
                    : {
                        x:
                          left +
                          ((col + 0.5) * plotWidth) / source.columns.length,
                        y: 12,
                      };
                  const side = radial
                    ? Math.cos((col + 0.5) * angle - Math.PI / 2)
                    : 0;
                  const align =
                    side > 0.3 ? "left" : side < -0.3 ? "right" : "center";
                  const boxWidth = radial
                    ? Math.max(
                        0,
                        Math.min(
                          64,
                          align === "left"
                            ? width - point.x
                            : align === "right"
                              ? point.x
                              : width,
                        ),
                      )
                    : plotWidth / source.columns.length;
                  const boxX =
                    align === "left"
                      ? point.x
                      : align === "right"
                        ? point.x - boxWidth
                        : point.x - boxWidth / 2;
                  return (
                    <foreignObject
                      key={col}
                      x={Math.max(0, Math.min(boxX, width - boxWidth))}
                      y={Math.max(0, Math.min(point.y - 9, svgHeight - 18))}
                      width={boxWidth}
                      height={18}
                    >
                      <div
                        className="truncate px-1 text-xs text-muted-foreground"
                        style={{ textAlign: align }}
                        title={loading ? undefined : label}
                      >
                        {loading ? (
                          <span className="inline-block h-2 w-5 rounded bg-muted" />
                        ) : (
                          label
                        )}
                      </div>
                    </foreignObject>
                  );
                })}
                {!radial &&
                  source.rows.map(
                    (label, row) =>
                      row %
                        Math.max(
                          1,
                          Math.ceil(
                            (20 * source.rows.length) / Math.max(1, plotHeight),
                          ),
                        ) ===
                        0 && (
                        <foreignObject
                          key={row}
                          x={0}
                          y={
                            top +
                            ((row + 0.5) * plotHeight) / source.rows.length -
                            9
                          }
                          width={Math.max(0, left - 6)}
                          height={18}
                        >
                          <div
                            className="truncate text-right text-xs text-muted-foreground"
                            title={loading ? undefined : label}
                          >
                            {loading ? (
                              <span className="inline-block h-2 w-8 rounded bg-muted" />
                            ) : (
                              label
                            )}
                          </div>
                        </foreignObject>
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
              {shapes.map((shape, index) => {
                if (!shape.path) return null;
                const t =
                  shape.cell.value !== null && !scale.error
                    ? scale.normalize(shape.cell.value)
                    : null;
                const fill = loading
                  ? "currentColor"
                  : t === null
                    ? `url(#${id}-missing)`
                    : getHeatColor(t, palette, diverging);
                return (
                  <GrowingCell
                    key={index}
                    x={shape.anchor.x}
                    y={shape.anchor.y}
                    progress={progress}
                  >
                    <path
                      data-heat-cell={loading ? undefined : index}
                      data-loading-cell={loading ? index : undefined}
                      d={shape.path}
                      fill={fill}
                      aria-hidden="true"
                    />
                    {stock &&
                      showLabels &&
                      !loading &&
                      shape.rect.width >= 28 &&
                      shape.rect.height >= 24 && (
                        <foreignObject
                          x={shape.rect.x}
                          y={shape.rect.y}
                          width={shape.rect.width}
                          height={shape.rect.height}
                          aria-hidden="true"
                          pointerEvents="none"
                        >
                          <StockLabel
                            width={shape.rect.width}
                            height={shape.rect.height}
                            title={shape.cell.xLabel}
                            value={
                              shape.cell.value === null
                                ? "No data"
                                : fmt(shape.cell.value)
                            }
                            fill={shape.cell.value === null ? null : fill}
                          />
                        </foreignObject>
                      )}
                  </GrowingCell>
                );
              })}
            </g>
            {ready &&
              shapes.map(
                (shape, index) =>
                  shape.path && (
                    <path
                      key={index}
                      ref={(el) => {
                        refs.current[index] = el;
                      }}
                      data-heat-target={index}
                      data-row-index={shape.cell.index ?? "missing"}
                      d={shape.path}
                      fill="transparent"
                      stroke={
                        inspection === index || focus === index
                          ? "currentColor"
                          : "transparent"
                      }
                      strokeWidth={2}
                      className={cn(
                        "text-foreground",
                        "outline-none touch-manipulation focus-visible:stroke-foreground",
                        onClick && shape.cell.index !== null
                          ? "cursor-pointer"
                          : "cursor-default",
                      )}
                      role={
                        onClick && shape.cell.index !== null
                          ? "button"
                          : "graphics-symbol"
                      }
                      tabIndex={index === selected ? 0 : -1}
                      aria-label={`${shape.cell.yLabel ? `${shape.cell.yLabel} / ` : ""}${shape.cell.xLabel}: ${shape.cell.value === null ? "No data" : fmt(shape.cell.value)}${stock && weight !== undefined ? `, weight ${weightFormatter(shape.cell.weight)}` : ""}`}
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
                        activate(index);
                      }}
                      onKeyDown={(event) => navigate(event, index)}
                    />
                  ),
              )}
            {ready && stock && !navigation.length && (
              <text
                role="status"
                x={cx}
                y={cy}
                textAnchor="middle"
                className="fill-muted-foreground text-sm"
              >
                No positive area weights
              </text>
            )}
          </svg>
          {ringOrderHeight > 0 && (
            <p
              aria-label="Ring order"
              aria-hidden={loading || undefined}
              className="overflow-auto px-3 text-center text-xs leading-4 text-muted-foreground"
              style={{ height: ringOrderHeight }}
            >
              {loading ? "" : `Outer → inner: ${source.rows.join(" · ")}`}
            </p>
          )}
          {noticeHeight > 0 && (
            <p
              className="truncate px-3 text-center text-xs text-muted-foreground"
              style={{ height: noticeHeight }}
            >
              {loading
                ? "Updating observations…"
                : [
                    source.missingCount
                      ? `${source.missingCount} cells without data`
                      : "",
                    omitted ? `${omitted} items have no visible area` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
            </p>
          )}
          {showLegend && (
            <svg
              width="100%"
              height={legendHeight}
              role={loading ? "presentation" : "img"}
              aria-hidden={loading || undefined}
              aria-label={
                loading
                  ? undefined
                  : source.values.length
                    ? `Color scale from ${fmt(scale.min)}${diverging ? ` through ${fmt(midpoint)}` : ""} to ${fmt(scale.max)}`
                    : "No numeric values"
              }
            >
              <defs>
                <linearGradient id={`${id}-legend`} colorInterpolation="sRGB">
                  <stop
                    offset="0%"
                    stopColor={
                      constant
                        ? getHeatColor(0.5, palette, diverging)
                        : palette.from
                    }
                  />
                  {diverging && (
                    <stop offset="50%" stopColor={palette.middle} />
                  )}
                  <stop
                    offset="100%"
                    stopColor={
                      constant
                        ? getHeatColor(0.5, palette, diverging)
                        : palette.to
                    }
                  />
                </linearGradient>
              </defs>
              {source.values.length ? (
                <>
                  <rect
                    x={(width - legendWidth) / 2}
                    y={5}
                    width={legendWidth}
                    height={8}
                    rx={3}
                    fill={loading ? "currentColor" : `url(#${id}-legend)`}
                    className="text-muted"
                  />
                  {(constant
                    ? [{ value: scale.min, position: 0.5 }]
                    : [
                        { value: scale.min, position: 0 },
                        ...(diverging
                          ? [{ value: midpoint, position: 0.5 }]
                          : []),
                        { value: scale.max, position: 1 },
                      ]
                  ).map((tick, index, list) => (
                    <foreignObject
                      key={index}
                      x={
                        (width - legendWidth) / 2 +
                        tick.position * (legendWidth - 64)
                      }
                      y={18}
                      width={64}
                      height={18}
                    >
                      <div
                        className="truncate text-xs text-muted-foreground"
                        style={{
                          textAlign:
                            list.length === 1
                              ? "center"
                              : index === 0
                                ? "left"
                                : index === list.length - 1
                                  ? "right"
                                  : "center",
                        }}
                        title={loading ? undefined : fmt(tick.value)}
                      >
                        {loading ? "" : fmt(tick.value)}
                      </div>
                    </foreignObject>
                  ))}
                </>
              ) : (
                <text
                  x={width / 2}
                  y={22}
                  textAnchor="middle"
                  className="fill-muted-foreground text-xs"
                >
                  {loading ? "" : "No numeric values"}
                </text>
              )}
            </svg>
          )}
          {ready && (
            <table className="sr-only">
              <caption>
                {ariaLabel} source observations, including missing values and
                zero-area items
              </caption>
              <thead>
                <tr>
                  <th scope="col">Row</th>
                  <th scope="col">Column</th>
                  <th scope="col">Value</th>
                  {stock && <th scope="col">Area weight</th>}
                </tr>
              </thead>
              <tbody>
                {model.cells.map((cell, index) => (
                  <tr key={index}>
                    <td>{cell.yLabel}</td>
                    <th scope="row">{cell.xLabel}</th>
                    <td>{cell.value === null ? "No data" : fmt(cell.value)}</td>
                    {stock && <td>{weightFormatter(cell.weight)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {active && tipData && (
            <InspectionTooltip
              id={`${id}-tooltip`}
              x={active.anchor.x}
              y={active.anchor.y}
              width={width}
              height={svgHeight}
            >
              {tooltipRenderer ? (
                tooltipRenderer(tipData)
              ) : (
                <>
                  <p className="mb-2 border-b border-border pb-2 text-xs font-medium text-muted-foreground">
                    {active.cell.yLabel ? `${active.cell.yLabel} / ` : ""}
                    {active.cell.xLabel}
                  </p>
                  <div className="flex items-center justify-between gap-6 text-sm font-semibold">
                    <span
                      className="size-2.5 shrink-0 rounded-sm"
                      style={{ background: activeColor }}
                    />
                    <span className="tabular-nums">
                      {tipData.formattedValue}
                    </span>
                  </div>
                  {stock && weight !== undefined && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {String(weight)}: {weightFormatter(active.cell.weight)}
                    </p>
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
export const HeatmapChart = memo(
  HeatmapChartComponent,
) as typeof HeatmapChartComponent;
