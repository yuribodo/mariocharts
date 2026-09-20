export type ColorScheme = "blue" | "green" | "amber" | "purple" | "diverging";
export const SCHEME_COLORS: Record<ColorScheme, readonly [string, string]> = {
  blue: ["#dbeafe", "#1d4ed8"],
  green: ["#dcfce7", "#166534"],
  amber: ["#fef9c3", "#92400e"],
  purple: ["#f3e8ff", "#6b21a8"],
  diverging: ["#1d4ed8", "#991b1b"],
};
function fraction(value: number, min: number, max: number) {
  if (min === max) return 0.5;
  const span = max - min;
  const scale = Math.max(Math.abs(min), Math.abs(max)) || 1;
  return Number.isFinite(span)
    ? (value - min) / span
    : (value / scale - min / scale) / (max / scale - min / scale);
}
export function getHeatScale(
  values: readonly number[],
  diverging: boolean,
  midpoint: number,
  requested?: readonly [number, number],
) {
  let min = Infinity,
    max = -Infinity;
  for (const value of values) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  let error: string | null = Number.isFinite(midpoint)
    ? null
    : "midpoint must be a finite number.";
  if (!values.length) {
    min = 0;
    max = 1;
  }
  if (requested) {
    if (
      requested.length !== 2 ||
      !requested.every(Number.isFinite) ||
      requested[0] >= requested[1]
    )
      error = "domain must contain finite increasing bounds.";
    else if (values.length && (min < requested[0] || max > requested[1]))
      error =
        "The color domain must contain every measured value. Expand domain or correct the observations.";
    min = requested[0];
    max = requested[1];
  } else if (diverging && !error) {
    const magnitude =
      Math.max(Math.abs(min), Math.abs(max), Math.abs(midpoint)) || 1;
    const center = midpoint / magnitude;
    const extent =
      Math.max(
        Math.abs(min / magnitude - center),
        Math.abs(max / magnitude - center),
      ) || 1;
    min = Math.max(-Number.MAX_VALUE, (center - extent) * magnitude);
    max = Math.min(Number.MAX_VALUE, (center + extent) * magnitude);
    if (min === midpoint) min = midpoint - (Math.abs(midpoint) * 0.1 || 1);
    if (max === midpoint) max = midpoint + (Math.abs(midpoint) * 0.1 || 1);
  }
  if (
    diverging &&
    (!Number.isFinite(min) ||
      !Number.isFinite(max) ||
      !(min < midpoint && midpoint < max))
  )
    error ??= "A diverging domain must extend below and above midpoint.";
  return {
    min,
    max,
    midpoint,
    diverging,
    error,
    normalize: (value: number) =>
      diverging
        ? value <= midpoint
          ? fraction(value, min, midpoint) / 2
          : 0.5 + fraction(value, midpoint, max) / 2
        : fraction(value, min, max),
  };
}
export function getHeatPalette(
  scheme: ColorScheme,
  stock: boolean,
  from?: string,
  to?: string,
) {
  const defaults = stock
    ? (["#c93648", "#16845b"] as const)
    : SCHEME_COLORS[scheme];
  return {
    from: from ?? defaults[0],
    to: to ?? defaults[1],
    middle: stock ? "#414854" : "#f5f5f5",
  };
}
/** CSS interpolation preserves named colors, rgb/oklch, alpha, and inherited variables. */
function mix(from: string, to: string, t: number) {
  const bounded = Math.max(0, Math.min(1, t));
  if (bounded === 0) return from;
  if (bounded === 1) return to;
  return `color-mix(in srgb, ${from} ${(1 - bounded) * 100}%, ${to})`;
}
export function getHeatColor(
  t: number,
  palette: ReturnType<typeof getHeatPalette>,
  diverging: boolean,
) {
  return diverging
    ? t <= 0.5
      ? mix(palette.from, palette.middle, t * 2)
      : mix(palette.middle, palette.to, (t - 0.5) * 2)
    : mix(palette.from, palette.to, t);
}
