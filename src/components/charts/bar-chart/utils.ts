/** Numbers and unambiguous English-formatted numeric strings remain supported. */
export function parseBarValue(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const text = value
    .trim()
    .replace(/^([+-]?)\$\s*/, "$1")
    .replace(/%$/, "");
  if (
    !/^[+-]?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(
      text,
    )
  )
    return null;
  const parsed = Number(text.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

/** A zero-inclusive domain shared by bars, ticks, and the baseline. */
export function getBarDomain(values: readonly number[]) {
  let min = 0;
  let max = 0;
  for (const value of values) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  if (min === max) return { min: 0, max: 1, ticks: [0] };
  const roughStep = (max - min) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const fraction = roughStep / magnitude;
  const step =
    (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) *
    magnitude;
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  // Extreme finite values can overflow/underflow tick calculations.
  if (!(step > 0) || !Number.isFinite(niceMin) || !Number.isFinite(niceMax)) {
    return { min, max, ticks: min < 0 && max > 0 ? [min, 0, max] : [min, max] };
  }
  const count = Math.round((niceMax - niceMin) / step) + 1;
  if (!Number.isFinite(count) || count > 20)
    return { min, max, ticks: [min, 0, max] };
  const ticks = Array.from({ length: count }, (_, index) =>
    Number((niceMin + index * step).toPrecision(12)),
  );
  return { min: niceMin, max: niceMax, ticks };
}

export function scaleBarValue(
  value: number,
  min: number,
  max: number,
  length: number,
) {
  const magnitude = Math.max(Math.abs(min), Math.abs(max)) || 1;
  return (
    ((value / magnitude - min / magnitude) /
      (max / magnitude - min / magnitude)) *
    length
  );
}

/** Value-space semantics stay independent of SVG, React, and animation. */
export function getBarGeometry(
  value: number,
  index: number,
  count: number,
  width: number,
  height: number,
  domain: { min: number; max: number },
  orientation: "vertical" | "horizontal",
) {
  const vertical = orientation === "vertical";
  const length = vertical ? height : width;
  const band = (vertical ? width : height) / count;
  const zero = scaleBarValue(0, domain.min, domain.max, length);
  const end = scaleBarValue(value, domain.min, domain.max, length);
  return vertical
    ? {
        x: index * band + band * 0.1,
        y: height - Math.max(zero, end),
        width: band * 0.8,
        height: Math.abs(end - zero),
        zero: height - zero,
      }
    : {
        x: Math.min(zero, end),
        y: index * band + band * 0.1,
        width: Math.abs(end - zero),
        height: band * 0.8,
        zero,
      };
}
