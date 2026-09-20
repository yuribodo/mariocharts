import { parseCartesianValue } from "../_shared/cartesian";
import type { ChartDataItem } from "../_shared";

/** Stack positive and negative values independently in data space. */
export function buildStackModel<T extends ChartDataItem>(
  data: readonly T[],
  x: keyof T,
  keys: readonly (keyof T)[],
) {
  let error: string | null = keys.length
    ? null
    : "Provide at least one numeric key in y.";
  if (new Set(keys).size !== keys.length)
    error = "Stack keys in y must be unique. Remove duplicate keys.";
  let min = 0,
    max = 0;
  const bars = data.map((row, index) => {
    if (row[x] === null || row[x] === undefined)
      error ??= `Row ${index + 1}: category "${String(x)}" is missing.`;
    let positive = 0,
      negative = 0;
    const segments = keys.map((key, stackIndex) => {
      const parsed = parseCartesianValue(row[key]);
      if (parsed === null)
        error ??= `Row ${index + 1}: "${String(key)}" must contain a finite number. Supply a value or remove this row; missing values are not zero.`;
      const value = parsed ?? 0;
      const start = value < 0 ? negative : positive;
      const end = start + value;
      if (!Number.isFinite(end))
        error ??= `Row ${index + 1}: the ${value < 0 ? "negative" : "positive"} stack total exceeds the finite numeric range. Rescale the values before rendering.`;
      if (value < 0) negative = end;
      else positive = end;
      return {
        key: String(key),
        value,
        rawValue: row[key],
        start,
        end,
        stackIndex,
      };
    });
    min = Math.min(min, negative);
    max = Math.max(max, positive);
    let positiveEnd = -1,
      negativeEnd = -1;
    for (const segment of segments) {
      if (segment.value > 0) positiveEnd = segment.stackIndex;
      if (segment.value < 0) negativeEnd = segment.stackIndex;
    }
    return {
      data: row,
      index,
      label: String(row[x] ?? ""),
      positive,
      negative,
      total: positive + negative,
      segments: segments.map((segment) => ({
        ...segment,
        terminal:
          segment.stackIndex === positiveEnd ||
          segment.stackIndex === negativeEnd,
      })),
    };
  });
  return { bars, error, domain: getStackDomain(min, max) };
}

/** Zero-inclusive bounds with finite ticks, including very small and large stacks. */
export function getStackDomain(min: number, max: number) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max)
    return { min: 0, max: 1, ticks: [0] };
  const magnitude = Math.max(Math.abs(min), Math.abs(max));
  const rough = ((max / magnitude - min / magnitude) / 4) * magnitude;
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
  const low = Math.floor(min / step) * step,
    high = Math.ceil(max / step) * step;
  const count = Math.round((high - low) / step) + 1;
  if (
    !(step > 0) ||
    !Number.isFinite(low) ||
    !Number.isFinite(high) ||
    !Number.isFinite(count) ||
    count > 20
  ) {
    return { min, max, ticks: [...new Set([min, 0, max])] };
  }
  return {
    min: low,
    max: high,
    ticks: Array.from({ length: count }, (_, index) =>
      Number((low + index * step).toPrecision(12)),
    ),
  };
}

export function scaleStackValue(
  value: number,
  domain: { min: number; max: number },
  length: number,
) {
  const magnitude = Math.max(Math.abs(domain.min), Math.abs(domain.max));
  return (
    ((value / magnitude - domain.min / magnitude) /
      (domain.max / magnitude - domain.min / magnitude)) *
    length
  );
}

export function getStackGeometry(
  start: number,
  end: number,
  index: number,
  count: number,
  width: number,
  height: number,
  domain: { min: number; max: number },
  vertical: boolean,
) {
  const band = (vertical ? width : height) / count;
  const a = scaleStackValue(start, domain, vertical ? height : width);
  const b = scaleStackValue(end, domain, vertical ? height : width);
  return vertical
    ? {
        x: index * band + band * 0.1,
        y: height - Math.max(a, b),
        width: band * 0.8,
        height: Math.abs(b - a),
      }
    : {
        x: Math.min(a, b),
        y: index * band + band * 0.1,
        width: Math.abs(b - a),
        height: band * 0.8,
      };
}

/** Round only the outside end of each signed stack; internal joins stay flush. */
export function getStackPath(
  rect: { x: number; y: number; width: number; height: number },
  vertical: boolean,
  negative: boolean,
  radius: number,
) {
  const { x, y, width: w, height: h } = rect;
  if (!w || !h) return "";
  const r = Math.min(radius, w / 2, h / 2),
    right = x + w,
    bottom = y + h;
  const tl = r && ((vertical && !negative) || (!vertical && negative)) ? r : 0;
  const tr = r && !negative ? r : 0;
  const br = r && ((vertical && negative) || (!vertical && !negative)) ? r : 0;
  const bl = r && negative ? r : 0;
  return `M ${x + tl} ${y} H ${right - tr} Q ${right} ${y} ${right} ${y + tr} V ${bottom - br} Q ${right} ${bottom} ${right - br} ${bottom} H ${x + bl} Q ${x} ${bottom} ${x} ${bottom - bl} V ${y + tl} Q ${x} ${y} ${x + tl} ${y} Z`;
}
