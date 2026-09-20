import { calculateNiceTicks } from "../_shared";
import type { ChartDataItem } from "../_shared";

export type WaterfallDataKey<T> = [T] extends [never]
  ? string
  : T extends unknown
    ? keyof T
    : never;

export type WaterfallType =
  | "increase"
  | "decrease"
  | "total"
  | "sum"
  | "subtotal";
export type WaterfallVariant = "filled" | "outline";

/** Resolved values retain the original observation and its input index. */
export interface WaterfallBar<T extends ChartDataItem> {
  readonly data: T;
  readonly index: number;
  readonly label: string;
  readonly type: WaterfallType;
  /** Signed change, absolute total, or computed subtotal/sum. */
  readonly value: number;
  /** Geometric anchor. Totals and sums start at zero; subtotals at the last checkpoint. */
  readonly start: number;
  readonly end: number;
  readonly displayStart: number;
  readonly displayEnd: number;
  readonly cumulative: number;
  readonly previous: number;
  /** False when an absolute total resets the balance to a different value. */
  readonly connectFromPrevious: boolean;
}
export interface WaterfallSeries<T extends ChartDataItem> {
  readonly bars: readonly WaterfallBar<T>[];
  readonly domain: { readonly min: number; readonly max: number };
  readonly error: string | null;
}
export function resolveWaterfallType(
  rawType: unknown,
  value: number,
): WaterfallType {
  if (
    ["increase", "decrease", "total", "sum", "subtotal"].includes(
      String(rawType),
    )
  )
    return rawType as WaterfallType;
  return value < 0 ? "decrease" : "increase";
}

/**
 * `total` sets an absolute balance (legacy behavior). `sum` displays the current
 * balance from zero. `subtotal` displays the change since the previous total,
 * sum or subtotal. Computed steps omit value and never add their result twice.
 */
export function computeWaterfallSeries<T extends ChartDataItem>(
  data: readonly T[],
  keys: {
    readonly label: WaterfallDataKey<T>;
    readonly value: WaterfallDataKey<T>;
    readonly type: PropertyKey;
  },
  initialValue = 0,
): WaterfallSeries<T> {
  const invalid = (error: string): WaterfallSeries<T> => ({
    bars: [],
    domain: { min: 0, max: 0 },
    error,
  });
  if (!Number.isFinite(initialValue))
    return invalid("initialValue must be a finite number.");
  let running = initialValue,
    checkpoint = initialValue,
    min = Math.min(0, initialValue),
    max = Math.max(0, initialValue);
  const bars: WaterfallBar<T>[] = [];
  for (const [index, item] of data.entries()) {
    const label = String(item[keys.label] ?? "").trim();
    if (!label)
      return invalid(
        `Step ${index + 1}: provide a non-empty label using the x key.`,
      );
    const rawType = item[keys.type as keyof T];
    if (
      rawType != null &&
      !["increase", "decrease", "total", "sum", "subtotal"].includes(
        String(rawType),
      )
    )
      return invalid(
        `${label}: unknown step type. Use increase, decrease, total, sum or subtotal.`,
      );
    const raw = item[keys.value];
    const computed = rawType === "sum" || rawType === "subtotal";
    if (!computed && (typeof raw !== "number" || !Number.isFinite(raw)))
      return invalid(
        `${label}: provide a finite numeric value. Use type "sum" for a calculated balance.`,
      );
    if (computed && raw != null)
      return invalid(`${label}: omit value for a computed ${String(rawType)}.`);
    const type = resolveWaterfallType(
      rawType,
      typeof raw === "number" ? raw : 0,
    );
    const previous = running;
    let start: number, end: number, value: number;
    if (type === "total") {
      start = 0;
      end = raw as number;
      value = end;
      running = end;
      checkpoint = running;
    } else if (type === "sum") {
      start = 0;
      end = running;
      value = running;
      checkpoint = running;
    } else if (type === "subtotal") {
      start = checkpoint;
      end = running;
      value = end - start;
      checkpoint = running;
    } else {
      start = running;
      value =
        type === "increase"
          ? Math.abs(raw as number)
          : -Math.abs(raw as number);
      end = running + value;
      running = end;
    }
    if (!Number.isFinite(end) || !Number.isFinite(value))
      return invalid(
        `${label}: accumulated values exceed the numeric range. Rescale the data before plotting.`,
      );
    const displayStart = Math.min(start, end),
      displayEnd = Math.max(start, end);
    min = Math.min(min, displayStart);
    max = Math.max(max, displayEnd);
    bars.push({
      data: item,
      index,
      label,
      type,
      value,
      start,
      end,
      displayStart,
      displayEnd,
      cumulative: running,
      previous,
      connectFromPrevious: type !== "total" || running === previous,
    });
  }
  return { bars, domain: { min, max }, error: null };
}
export function formatWaterfallDelta(
  bar: Pick<WaterfallBar<ChartDataItem>, "type" | "value">,
  format: (value: number) => string,
): string {
  if (bar.type === "total" || bar.type === "sum") return format(bar.value);
  return bar.value > 0 ? `+${format(bar.value)}` : format(bar.value);
}

/** Normalize before tick calculation/subtraction so very large/small finite values work. */
export function waterfallScale(domain: { min: number; max: number }) {
  const magnitude = Math.max(Math.abs(domain.min), Math.abs(domain.max)) || 1;
  const unit = Math.pow(10, Math.floor(Math.log10(magnitude))) || magnitude;
  const low = domain.min / unit,
    high = domain.max / unit;
  const padding = (high - low || 1) * 0.12;
  const ticks = calculateNiceTicks(
    low < 0 ? low - padding : 0,
    high > 0 ? high + padding : high === 0 && low === 0 ? 1 : 0,
    5,
  );
  const min = ticks[0] ?? 0,
    max = ticks[ticks.length - 1] ?? 1;
  return {
    ticks: ticks.map((tick) => tick * unit).filter(Number.isFinite),
    ratio: (value: number) => (value / unit - min) / (max - min || 1),
  };
}
export function truncateLabel(label: string, pixels: number): string {
  const count = Math.max(1, Math.floor(pixels / 6.5));
  return label.length > count
    ? `${label.slice(0, count - 1).trimEnd()}…`
    : label;
}
