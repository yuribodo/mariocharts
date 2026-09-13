import type { ChartDataItem } from "../_shared";
import { parseCartesianValue } from "../_shared/cartesian";
import type { RadarAxis, RadarSeries } from "./types";

export { formatValue } from "../_shared";

/** Invalid and missing observations stay distinguishable from a measured zero. */
export function getNumericValue<T extends ChartDataItem>(data: T, key: string) {
  return parseCartesianValue(data[key]);
}

export function calculateAxisBounds<T extends ChartDataItem>(
  axis: RadarAxis<T>,
  series: readonly RadarSeries<T>[],
): { min: number; max: number } {
  let low = 0,
    high = 0;
  for (const item of series) {
    const value = getNumericValue(item.data, axis.key);
    if (value !== null) {
      low = Math.min(low, value);
      high = Math.max(high, value);
    }
  }
  const min = axis.min ?? low;
  const padded = high * 1.1;
  let max = axis.max ?? niceCeiling(Number.isFinite(padded) ? padded : high);
  if (axis.max === undefined && max <= min) {
    const expanded = min + (Math.abs(min) * 0.1 || 1);
    max = Number.isFinite(expanded) ? expanded : min;
  }
  return { min, max };
}

function niceCeiling(value: number) {
  if (value <= 0) return 0;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  if (!magnitude) return value;
  const normalized = value / magnitude;
  const nice =
    (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) *
    magnitude;
  return Number.isFinite(nice) ? nice : value;
}

/** Normalize before subtracting to avoid overflow for signed, finite extremes. */
export function normalizeValue(value: number, min: number, max: number) {
  if (max === min) return 0.5;
  const magnitude = Math.max(Math.abs(min), Math.abs(max)) || 1;
  const normalized =
    (value / magnitude - min / magnitude) / (max / magnitude - min / magnitude);
  return Math.max(0, Math.min(1, normalized));
}

export function generateTicks(min: number, max: number, count = 5): number[] {
  if (count < 2) return [min, max];
  return Array.from(
    { length: count },
    (_, i) => min * (1 - i / (count - 1)) + max * (i / (count - 1)),
  );
}

export function calculatePercentage(value: number, min: number, max: number) {
  return `${Math.round(normalizeValue(value, min, max) * 100)}%`;
}

/** Validate every observation before drawing; explicit domains must contain the data. */
export function buildRadarModel<T extends ChartDataItem>(
  axes: readonly RadarAxis<T>[],
  series: readonly RadarSeries<T>[],
) {
  let error: string | null =
    axes.length > 0 && axes.length < 3
      ? "Radar chart requires at least 3 axes."
      : null;
  const keys = new Set<string>();
  const ids = new Set<string>();
  for (const item of series) {
    if (!item.id || ids.has(item.id))
      error ??= "Each radar series needs a unique, nonempty id.";
    ids.add(item.id);
  }
  const dimensions = axes.map((axis, index) => {
    if (!axis.key || keys.has(axis.key))
      error ??= "Each radar axis needs a unique, nonempty data key.";
    keys.add(axis.key);
    if (!axis.label?.trim())
      error ??= `Axis ${index + 1} needs a readable label.`;
    const bounds = calculateAxisBounds(axis, series);
    if (
      !Number.isFinite(bounds.min) ||
      !Number.isFinite(bounds.max) ||
      bounds.min >= bounds.max
    )
      error ??= `Axis "${axis.label}": min and max must be finite, with min < max. Rescale values if the range exceeds numeric limits.`;
    return { ...axis, index, ...bounds };
  });
  const observations = series.map((item, index) => ({
    ...item,
    index,
    values: dimensions.map((axis) => {
      const value = getNumericValue(item.data, axis.key);
      if (value === null)
        error ??= `Series "${item.name}", axis "${axis.label}": "${axis.key}" must contain a finite number. Normalize missing or malformed values before rendering.`;
      else if (value < axis.min || value > axis.max)
        error ??= `Series "${item.name}", axis "${axis.label}": ${value} is outside [${axis.min}, ${axis.max}]. Adjust the axis bounds or correct the data.`;
      return value ?? 0;
    }),
  }));
  return { axes: dimensions, series: observations, error };
}
