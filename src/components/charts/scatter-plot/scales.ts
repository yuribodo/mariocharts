import { parseCartesianValue, getCartesianDomain } from "../_shared/cartesian";
import type { ChartDataItem, ScatterPlotProps } from "./types";
export { formatValue, getGridDasharray } from "../_shared";

export function getNumericValue<T extends ChartDataItem>(
  data: T,
  key: keyof T,
) {
  return parseCartesianValue(data[key]);
}

/** Normalize before subtracting so signed finite extremes do not overflow. */
export function scaleValue(
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number],
) {
  if (domain[0] === domain[1]) return range[0] / 2 + range[1] / 2;
  const magnitude = Math.max(Math.abs(domain[0]), Math.abs(domain[1])) || 1;
  const span = domain[1] - domain[0],
    delta = value - domain[0];
  const t =
    Number.isFinite(span) && Number.isFinite(delta)
      ? delta / span
      : (value / magnitude - domain[0] / magnitude) /
        (domain[1] / magnitude - domain[0] / magnitude);
  return range[0] * (1 - t) + range[1] * t;
}

function niceStep(min: number, max: number, count: number) {
  const magnitude = Math.max(Math.abs(min), Math.abs(max)) || 1;
  const rough = ((max / magnitude - min / magnitude) / (count - 1)) * magnitude;
  const power = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / power;
  const step =
    (fraction <= 1
      ? 1
      : fraction <= 2
        ? 2
        : fraction <= 2.5
          ? 2.5
          : fraction <= 5
            ? 5
            : 10) * power;
  return Number.isFinite(step) && step > 0 ? step : null;
}

/** Ticks stay inside the viewport; bounded iteration avoids tiny-step loops. */
export function calculateNiceTicks(min: number, max: number, count = 5) {
  if (min === max) return [min];
  const length = Number.isFinite(count)
    ? Math.max(2, Math.min(20, Math.floor(count)))
    : 5;
  const step = niceStep(min, max, length);
  if (step) {
    const start = Math.ceil(min / step) * step;
    const ticks = [
      ...new Set(
        Array.from({ length: length + 1 }, (_, i) => start + step * i),
      ),
    ].filter((tick) => Number.isFinite(tick) && tick >= min && tick <= max);
    if (ticks.length >= 2) return ticks;
  }
  return [
    ...new Set(
      Array.from(
        { length },
        (_, i) => min * (1 - i / (length - 1)) + max * (i / (length - 1)),
      ),
    ),
  ];
}

/** Add enough automatic-domain space for marker radii; explicit viewports stay exact. */
export function getScatterDomain(
  values: readonly number[],
  requested: readonly [number, number] | undefined,
  radius: number,
  pixels: number,
): readonly [number, number] {
  if (requested) return requested;
  const base = getCartesianDomain(values);
  const magnitude = Math.max(Math.abs(base.min), Math.abs(base.max)) || 1;
  const low = base.min / magnitude,
    high = base.max / magnitude;
  const fraction = Math.min(
    0.4,
    Math.max(0.05, (radius + 2) / Math.max(1, pixels)),
  );
  const padding = ((high - low) * fraction) / (1 - 2 * fraction);
  const min = (low - padding) * magnitude,
    max = (high + padding) * magnitude;
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max)
    return [base.min, base.max];
  const step = niceStep(min, max, 5);
  if (step) {
    const niceMin = Math.floor(min / step) * step,
      niceMax = Math.ceil(max / step) * step;
    if (
      Number.isFinite(niceMin) &&
      Number.isFinite(niceMax) &&
      niceMin < niceMax
    )
      return [niceMin, niceMax];
  }
  return [min, max];
}

export function bubbleRadius(
  value: number,
  min: number,
  max: number,
  range: readonly [number, number],
  scale: "area" | "radius",
) {
  if (value === 0 || max <= 0) return 0;
  if (scale === "area")
    return Math.max(range[0], range[1] * Math.sqrt(value / max));
  return scaleValue(value, [min, max], range);
}

export function buildScatterModel<T extends ChartDataItem>(
  data: readonly T[],
  options: Pick<ScatterPlotProps<T>, "x" | "y" | "label" | "series" | "size">,
) {
  let error: string | null = null;
  const groups: string[] = [];
  const seenGroups = new Set<string>();
  const sizeKey = typeof options.size !== "number" ? options.size : undefined;
  let minSize = Infinity,
    maxSize = 0;
  const points = data.map((row, index) => {
    const x = getNumericValue(row, options.x),
      y = getNumericValue(row, options.y);
    for (const [value, key] of [
      [x, options.x],
      [y, options.y],
    ] as const) {
      if (value === null)
        error ??= `Row ${index + 1}: "${String(key)}" must contain a finite number. Normalize missing or malformed coordinates before rendering.`;
    }
    const size =
      sizeKey !== undefined
        ? getNumericValue(row, sizeKey)
        : typeof options.size === "number"
          ? options.size
          : 6;
    if (size === null || size < 0)
      error ??= `Row ${index + 1}: bubble size must contain a finite, nonnegative number.`;
    const seriesKey =
      options.series !== undefined
        ? String(row[options.series] ?? "")
        : "default";
    if (
      options.series !== undefined &&
      (row[options.series] === undefined || row[options.series] === null)
    )
      error ??= `Row ${index + 1}: series key "${String(options.series)}" is missing.`;
    if (
      options.label !== undefined &&
      (row[options.label] === undefined || row[options.label] === null)
    )
      error ??= `Row ${index + 1}: label key "${String(options.label)}" is missing.`;
    const label =
      options.label !== undefined
        ? String(row[options.label] ?? "")
        : `Point ${index + 1}`;
    if (!seenGroups.has(seriesKey)) {
      seenGroups.add(seriesKey);
      groups.push(seriesKey);
    }
    minSize = Math.min(minSize, size ?? 0);
    maxSize = Math.max(maxSize, size ?? 0);
    return {
      data: row,
      index,
      x: x ?? 0,
      y: y ?? 0,
      size: size ?? 0,
      seriesKey,
      label,
    };
  });
  return {
    points,
    groups,
    minSize: Number.isFinite(minSize) ? minSize : 0,
    maxSize,
    error,
  };
}
