import { getNumericValue } from "../_shared";
import type { ChartDataItem } from "../_shared";

export type WaterfallType = "increase" | "decrease" | "total";

/**
 * A single resolved waterfall bar in value-space (not yet mapped to pixels).
 *
 * `start`/`end` are the running total before/after this step. For "total" bars
 * the bar is anchored to the baseline (start = 0). `displayStart`/`displayEnd`
 * are the low/high edges of the floating bar, ready for a value→pixel scale.
 */
export interface WaterfallBar<T extends ChartDataItem> {
  readonly data: T;
  readonly index: number;
  readonly label: string;
  readonly type: WaterfallType;
  /** Signed delta for increase/decrease bars; the absolute value for totals. */
  readonly value: number;
  /** Running total before this step (value-space). */
  readonly start: number;
  /** Running total after this step (value-space); equals `cumulative`. */
  readonly end: number;
  /** Low edge of the floating bar: min(start, end). */
  readonly displayStart: number;
  /** High edge of the floating bar: max(start, end). */
  readonly displayEnd: number;
  /** Running total after this step (alias of `end`, used by connectors/tooltip). */
  readonly cumulative: number;
}

export interface WaterfallSeries<T extends ChartDataItem> {
  readonly bars: readonly WaterfallBar<T>[];
  /** Value-space domain that always includes 0 (the baseline). */
  readonly domain: { readonly min: number; readonly max: number };
}

/**
 * Resolve the bar type. An explicit `"increase" | "decrease" | "total"` wins;
 * otherwise the type is inferred from the sign of the value (negative →
 * decrease, non-negative → increase).
 */
export function resolveWaterfallType(rawType: unknown, value: number): WaterfallType {
  if (rawType === "total" || rawType === "increase" || rawType === "decrease") {
    return rawType;
  }
  return value < 0 ? "decrease" : "increase";
}

/**
 * Turn raw data rows into cumulative waterfall bars.
 *
 * - `total` bars assert an absolute baseline: they draw from 0 to their value
 *   and reset the running total to that value.
 * - `increase`/`decrease` bars float from the current running total by their
 *   (sign-normalised) magnitude.
 */
export function computeWaterfallSeries<T extends ChartDataItem>(
  data: readonly T[],
  keys: { readonly label: keyof T; readonly value: keyof T; readonly type: PropertyKey }
): WaterfallSeries<T> {
  let running = 0;
  let min = 0;
  let max = 0;

  const bars = data.map((item, index): WaterfallBar<T> => {
    const rawValue = getNumericValue(item as ChartDataItem, keys.value as string);
    const type = resolveWaterfallType((item as ChartDataItem)[keys.type as string], rawValue);

    let start: number;
    let end: number;
    let value: number;

    if (type === "total") {
      value = rawValue;
      start = 0;
      end = rawValue;
      running = rawValue;
    } else if (type === "increase") {
      value = Math.abs(rawValue);
      start = running;
      end = running + value;
      running = end;
    } else {
      value = -Math.abs(rawValue);
      start = running;
      end = running + value;
      running = end;
    }

    const displayStart = Math.min(start, end);
    const displayEnd = Math.max(start, end);
    min = Math.min(min, displayStart);
    max = Math.max(max, displayEnd);

    return {
      data: item,
      index,
      label: String(item[keys.label] ?? ""),
      type,
      value,
      start,
      end,
      displayStart,
      displayEnd,
      cumulative: end,
    };
  });

  return { bars, domain: { min, max } };
}

/**
 * Format the delta shown on a bar: totals show their absolute value, while
 * increases/decreases carry an explicit sign (e.g. `+45.0K`, `-12.0K`).
 */
export function formatWaterfallDelta(
  bar: Pick<WaterfallBar<ChartDataItem>, "type" | "value">,
  format: (value: unknown) => string
): string {
  if (bar.type === "total") return format(bar.value);
  return bar.value > 0 ? `+${format(bar.value)}` : format(bar.value);
}
