"use client";

import { memo, useMemo, useState, useRef, useEffect, useId } from "react";
import { animate, useMotionValue, useReducedMotion } from "framer-motion";
import { useContainerDimensions, formatValue } from "../_shared";
import type { GaugeChartTooltipData, TooltipRenderer } from "../_shared";
import { InspectionTooltip } from "../_shared/inspection-tooltip";
import { cn } from "../../../../lib/utils";
import {
  buildGaugeModel,
  getGaugeGeometry,
  computeZoneArcs,
  polarToCartesian,
  describeArcPath,
  GAUGE_START_ANGLE,
  GAUGE_END_ANGLE,
  GAUGE_TOTAL_ANGLE,
} from "./utils";

export interface GaugeZone {
  /** Inclusive start. Shared boundaries belong to the zone starting there. */
  readonly from: number;
  /** Exclusive end, except at the gauge maximum. Gaps are allowed; overlaps are not. */
  readonly to: number;
  readonly color: string;
  readonly label?: string;
}
export interface GaugeChartProps {
  /** Actual finite measurement. Outside-range values remain visible; the arc keeps the boundary zone color and is clamped. */
  readonly value: number;
  /** Finite increasing bounds. @default 0 */
  readonly min?: number;
  /** @default 100 */
  readonly max?: number;
  /** Nonoverlapping zones inside the range; input order and colors need not be unique. */
  readonly zones: readonly GaugeZone[];
  readonly unit?: string;
  readonly label?: string;
  /** Requested stroke thickness, capped to fit small frames. @default 20 */
  readonly strokeWidth?: number;
  /** Progress/track end caps. Zone boundaries remain flat. @default "round" */
  readonly strokeLinecap?: "round" | "butt";
  /** Stable total height in every state. @default 300 */
  readonly height?: number;
  /** Retain value and zones during refresh for matching geometry. */
  readonly loading?: boolean;
  readonly error?: string | null;
  /** Sweep from minimum on entrance and retarget from the current arc on updates. */
  readonly animation?: boolean;
  readonly className?: string;
  /** Format actual measurement and inspection values; unit is appended separately. */
  readonly valueFormatter?: (value: number) => string;
  /** Compact endpoint labels. Defaults to valueFormatter. */
  readonly axisValueFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
  readonly tooltipRenderer?: TooltipRenderer<GaugeChartTooltipData>;
}
const PLACEHOLDER_ZONES = [
  { from: 0, to: 60, color: "currentColor" },
  { from: 60, to: 80, color: "currentColor" },
  { from: 80, to: 100, color: "currentColor" },
];
const PLACEHOLDER = buildGaugeModel(65, 0, 100, PLACEHOLDER_ZONES);

function GaugeChartComponent({
  value,
  min = 0,
  max = 100,
  zones,
  unit,
  label,
  strokeWidth = 20,
  strokeLinecap = "round",
  height = 300,
  loading = false,
  error = null,
  animation = true,
  className,
  valueFormatter = formatValue,
  axisValueFormatter = valueFormatter,
  ariaLabel,
  description,
  tooltipRenderer,
}: GaugeChartProps) {
  const [containerRef, width] = useContainerDimensions();
  const id = useId();
  const reduced = useReducedMotion();
  const shouldAnimate = animation && !reduced;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const model = useMemo(
    () => buildGaugeModel(value, min, max, zones),
    [value, min, max, zones],
  );
  const validHeight = Number.isFinite(height) && height > 0;
  const validStroke = Number.isFinite(strokeWidth) && strokeWidth > 0;
  const chartError =
    error ||
    model.error ||
    (!validHeight ? "Gauge height must be a positive, finite number." : null) ||
    (!validStroke ? "strokeWidth must be a positive, finite number." : null);
  const frameHeight = validHeight ? height : 300;
  const initialLoading = loading && (!!model.error || !zones.length);
  const source = initialLoading ? PLACEHOLDER : model;
  const geometry = getGaugeGeometry(
    width,
    frameHeight,
    validStroke ? strokeWidth : 20,
  );
  const { cx, cy, radius, stroke } = geometry;
  const ready = !loading && !chartError && zones.length > 0 && radius > 0;
  const fraction = source.fraction;
  const motionFraction = useMotionValue(shouldAnimate ? 0 : fraction);
  const pathRef = useRef<SVGPathElement>(null);
  const wasReady = useRef(false);
  const hasFocus = useRef(false);
  useEffect(() => {
    const update = (current: number) =>
      pathRef.current?.setAttribute(
        "d",
        describeArcPath(
          cx,
          cy,
          radius,
          GAUGE_START_ANGLE,
          GAUGE_START_ANGLE + current * GAUGE_TOTAL_ANGLE,
        ),
      );
    update(motionFraction.get());
    return motionFraction.on("change", update);
  }, [motionFraction, cx, cy, radius]);
  useEffect(() => {
    const entering = ready && !wasReady.current;
    wasReady.current = ready;
    if (!ready || !shouldAnimate || hasFocus.current) {
      motionFraction.jump(fraction);
      return;
    }
    if (entering) motionFraction.set(0);
    const controls = animate(motionFraction, fraction, {
      duration: entering ? 0.8 : 0.45,
      ease: [0.33, 0, 0.2, 1],
    });
    return () => controls.stop();
  }, [ready, shouldAnimate, fraction, motionFraction]);
  useEffect(() => {
    if (!ready) {
      setHovered(false);
      setFocused(false);
      hasFocus.current = false;
    }
  }, [ready]);
  const accessibleName = ariaLabel ?? label ?? "Gauge";
  const activeZone = model.activeZone;
  const boundaryZone =
    model.rangeStatus === "above"
      ? model.zones.find((zone) => zone.to === max)
      : model.rangeStatus === "below"
        ? model.zones.find((zone) => zone.from === min)
        : undefined;
  const indicatorColor = (activeZone ?? boundaryZone)?.color;
  const statusText =
    model.rangeStatus === "above"
      ? "Above range"
      : model.rangeStatus === "below"
        ? "Below range"
        : (activeZone?.label ?? (activeZone ? "" : "Unzoned"));
  const measurement = model.error
    ? ""
    : `${valueFormatter(value)}${unit ? ` ${unit}` : ""}`;
  const rangeText = model.error
    ? ""
    : `${valueFormatter(min)}–${valueFormatter(max)}${unit ? ` ${unit}` : ""}`;
  const arcs = useMemo(
    () =>
      source.error
        ? []
        : computeZoneArcs(
            source.zones,
            initialLoading ? 0 : min,
            initialLoading ? 100 : max,
          ),
    [source, initialLoading, min, max],
  );
  const trackPath = describeArcPath(
    cx,
    cy,
    radius,
    GAUGE_START_ANGLE,
    GAUGE_END_ANGLE,
  );
  const progressPath = describeArcPath(
    cx,
    cy,
    radius,
    GAUGE_START_ANGLE,
    GAUGE_START_ANGLE + motionFraction.get() * GAUGE_TOTAL_ANGLE,
  );
  const start = polarToCartesian(cx, cy, radius, GAUGE_START_ANGLE),
    end = polarToCartesian(cx, cy, radius, GAUGE_END_ANGLE);
  const endpointWidth = Math.max(0, Math.min(100, width / 3));
  const centerWidth = Math.max(
    0,
    Math.min(width - 16, (radius - stroke / 2) * 1.45),
  );
  const valueFontSize = Math.min(
    36,
    Math.max(14, (centerWidth / Math.max(3, measurement.length)) * 1.45),
  );
  const inspecting = ready && hovered;
  const tipData: GaugeChartTooltipData = {
    value,
    min,
    max,
    clampedValue: model.clampedValue,
    rangeStatus: model.rangeStatus,
    percentage: model.fraction * 100,
    ...(unit !== undefined ? { unit } : {}),
    ...(label !== undefined ? { label } : {}),
    ...(activeZone
      ? {
          zone: {
            from: activeZone.from,
            to: activeZone.to,
            color: activeZone.color,
            index: activeZone.index,
            ...(activeZone.label !== undefined
              ? { label: activeZone.label }
              : {}),
          },
        }
      : {}),
  };
  const stateMessage =
    !loading && chartError
      ? chartError
      : !loading && !zones.length
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
    >
      {loading && (
        <span role="status" className="sr-only">
          Loading gauge
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
                (!zones.length ? "Configure zones to display the gauge" : "")}
            </p>
          </div>
        </div>
      ) : (
        <>
          <svg
            width="100%"
            height={frameHeight}
            role={loading ? "presentation" : "meter"}
            aria-hidden={loading || undefined}
            aria-label={accessibleName}
            aria-valuemin={ready ? min : undefined}
            aria-valuemax={ready ? max : undefined}
            aria-valuenow={ready ? model.clampedValue : undefined}
            aria-valuetext={
              ready
                ? `${measurement}; range ${rangeText}${statusText ? `; ${statusText}` : ""}`
                : undefined
            }
            aria-describedby={
              inspecting
                ? `${id}-description ${id}-tooltip`
                : `${id}-description`
            }
            tabIndex={ready ? 0 : undefined}
            className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onMouseEnter={() => ready && setHovered(true)}
            onMouseLeave={() => setHovered(focused)}
            onPointerDown={() => ready && setHovered(true)}
            onFocus={() => {
              if (ready) {
                hasFocus.current = true;
                motionFraction.jump(fraction);
                setFocused(true);
                setHovered(true);
              }
            }}
            onBlur={() => {
              hasFocus.current = false;
              setFocused(false);
              setHovered(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                setHovered(false);
              } else if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setHovered(true);
              }
            }}
          >
            <desc id={`${id}-description`}>
              {description ? `${description} ` : ""}Read-only measurement within
              a configured range. Focus, hover, or tap to inspect; Escape
              dismisses inspection. Gaps between zones are unclassified. The
              displayed value stays exact when the arc reaches a limit.
            </desc>
            <g
              aria-hidden="true"
              className={cn(
                loading && "text-muted",
                loading &&
                  shouldAnimate &&
                  "animate-pulse motion-reduce:animate-none",
              )}
            >
              <path
                data-gauge-track=""
                d={trackPath}
                fill="none"
                stroke="currentColor"
                strokeWidth={stroke}
                strokeLinecap={strokeLinecap}
                className="text-muted"
              />
              {arcs.map((zone, index) => (
                <path
                  key={source.zones[index]!.index}
                  data-gauge-zone={
                    loading ? undefined : source.zones[index]!.index
                  }
                  data-loading-zone={
                    loading ? source.zones[index]!.index : undefined
                  }
                  d={describeArcPath(
                    cx,
                    cy,
                    radius,
                    zone.startAngle,
                    zone.endAngle,
                  )}
                  fill="none"
                  stroke={loading ? "currentColor" : zone.color}
                  strokeWidth={stroke}
                  strokeLinecap="butt"
                  opacity={0.25}
                />
              ))}
              <path
                ref={pathRef}
                data-gauge-progress={loading ? undefined : ""}
                data-loading-progress={loading ? "" : undefined}
                d={progressPath}
                fill="none"
                stroke={
                  loading ? "currentColor" : (indicatorColor ?? "currentColor")
                }
                className={cn(
                  !loading && !indicatorColor && "text-muted-foreground",
                )}
                strokeWidth={stroke}
                strokeLinecap={strokeLinecap}
              />
            </g>
            <g aria-hidden="true">
              {[start, end].map((point, index) => (
                <foreignObject
                  key={index}
                  x={Math.max(
                    0,
                    Math.min(
                      point.x - endpointWidth / 2,
                      width - endpointWidth,
                    ),
                  )}
                  y={Math.min(frameHeight - 20, point.y + stroke / 2 + 12)}
                  width={endpointWidth}
                  height={18}
                >
                  <div
                    className="truncate text-center text-xs text-muted-foreground"
                    title={
                      loading
                        ? undefined
                        : axisValueFormatter(index === 0 ? min : max)
                    }
                  >
                    {loading ? (
                      <span className="inline-block h-2 w-8 rounded bg-muted" />
                    ) : (
                      axisValueFormatter(index === 0 ? min : max)
                    )}
                  </div>
                </foreignObject>
              ))}
              <foreignObject
                x={cx - centerWidth / 2}
                y={cy - 36}
                width={centerWidth}
                height={94}
              >
                <div className="text-center">
                  {loading ? (
                    <>
                      <div className="mx-auto mt-3 h-7 w-20 max-w-full rounded bg-muted" />
                      <div className="mx-auto mt-3 h-2 w-24 max-w-full rounded bg-muted" />
                    </>
                  ) : (
                    <>
                      <div
                        data-gauge-value=""
                        className="truncate font-semibold leading-10 tracking-tight text-foreground tabular-nums"
                        style={{ fontSize: valueFontSize }}
                        title={measurement}
                      >
                        {valueFormatter(value)}
                        {unit && (
                          <span className="ml-1 text-base font-normal text-muted-foreground">
                            {unit}
                          </span>
                        )}
                      </div>
                      {label && (
                        <p
                          className="mt-1 truncate text-xs text-muted-foreground"
                          title={label}
                        >
                          {label}
                        </p>
                      )}
                      {statusText && (
                        <p
                          data-gauge-status=""
                          className="mt-1 truncate text-xs font-medium text-muted-foreground"
                          style={{
                            color: indicatorColor,
                          }}
                          title={statusText}
                        >
                          {statusText}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </foreignObject>
            </g>
          </svg>
          {inspecting && (
            <InspectionTooltip
              id={`${id}-tooltip`}
              x={cx}
              y={cy}
              width={width}
              height={frameHeight}
            >
              {tooltipRenderer ? (
                tooltipRenderer(tipData)
              ) : (
                <>
                  <p className="mb-2 border-b border-border pb-2 text-xs font-medium text-muted-foreground">
                    {label ?? accessibleName}
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between gap-6">
                      <span>Value</span>
                      <span className="font-semibold tabular-nums">
                        {measurement}
                      </span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span>Range</span>
                      <span className="tabular-nums">{rangeText}</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span>Range position</span>
                      <span className="tabular-nums">
                        {formatValue(model.fraction * 100)}%
                      </span>
                    </div>
                    {activeZone ? (
                      <div className="border-t border-border pt-2">
                        <p className="flex items-center gap-2">
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: activeZone.color }}
                          />
                          {activeZone.label ?? "Current zone"}
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          {valueFormatter(activeZone.from)}–
                          {valueFormatter(activeZone.to)}
                          {unit ? ` ${unit}` : ""}
                        </p>
                      </div>
                    ) : (
                      <p className="border-t border-border pt-2 text-muted-foreground">
                        {statusText}
                      </p>
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
export const GaugeChart = memo(GaugeChartComponent);
