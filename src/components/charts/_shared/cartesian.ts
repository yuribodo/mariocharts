export type CartesianCurve = "linear" | "monotone" | "natural" | "step";
export interface CartesianPoint {
  x: number;
  y: number;
  defined: boolean;
}

/** Missing values are gaps; malformed values must be reported separately. */
export function parseCartesianValue(value: unknown): number | null {
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

export function getCartesianDomain(values: readonly number[]) {
  let min = Infinity,
    max = -Infinity;
  for (const value of values) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  if (!values.length) return { min: 0, max: 100, ticks: [0, 25, 50, 75, 100] };
  if (min === max) {
    const padding = Math.abs(min) * 0.1 || 1;
    min = Number.isFinite(min - padding) ? min - padding : min;
    max = Number.isFinite(max + padding) ? max + padding : max;
  }
  const magnitude = Math.max(Math.abs(min), Math.abs(max)) || 1;
  const low = min / magnitude,
    high = max / magnitude;
  const rough = (high - low) / 4;
  const power = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / power;
  const step =
    (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * power;
  const niceMin = Math.floor(low / step) * step * magnitude;
  const niceMax = Math.ceil(high / step) * step * magnitude;
  if (
    Number.isFinite(niceMin) &&
    Number.isFinite(niceMax) &&
    niceMin < niceMax
  ) {
    min = niceMin;
    max = niceMax;
  }
  const ticks = Array.from({ length: 5 }, (_, index) =>
    Number((min * (1 - index / 4) + max * (index / 4)).toPrecision(12)),
  ).filter(Number.isFinite);
  return { min, max, ticks: [...new Set(ticks)] };
}

export function scaleCartesianValue(
  value: number,
  domain: { min: number; max: number },
  height: number,
) {
  const magnitude = Math.max(Math.abs(domain.min), Math.abs(domain.max)) || 1;
  return (
    height *
    (1 -
      (value / magnitude - domain.min / magnitude) /
        (domain.max / magnitude - domain.min / magnitude))
  );
}

export function getCartesianSegments<T extends CartesianPoint>(
  points: readonly T[],
  connectNulls: boolean,
) {
  const segments: T[][] = [];
  let segment: T[] = [];
  for (const point of points) {
    if (point.defined) segment.push(point);
    else if (!connectNulls && segment.length) {
      segments.push(segment);
      segment = [];
    }
  }
  if (segment.length) segments.push(segment);
  return segments;
}

export type CartesianControls = readonly [number, number];

/** Y coordinates of each cubic segment's controls; x coordinates lie at thirds. */
export function getCartesianControls(
  points: readonly CartesianPoint[],
  curve: CartesianCurve,
): CartesianControls[] {
  const slopes = points
    .slice(1)
    .map((point, i) => (point.y - points[i]!.y) / (point.x - points[i]!.x));
  const tangents = points.map((_, i) => {
    if (i === 0) return slopes[0] ?? 0;
    if (i === points.length - 1) return slopes[i - 1] ?? 0;
    const left = slopes[i - 1]!,
      right = slopes[i]!;
    if (left * right <= 0) return 0;
    const before = points[i]!.x - points[i - 1]!.x;
    const after = points[i + 1]!.x - points[i]!.x;
    // Weighted harmonic tangents preserve monotonicity, including uneven gaps.
    const w1 = 2 * after + before,
      w2 = after + 2 * before;
    return (w1 + w2) / (w1 / left + w2 / right);
  });
  const second = Array<number>(points.length).fill(0);
  if (curve === "natural" && points.length > 2) {
    // Natural cubic spline: solve the tridiagonal second-derivative system.
    const upper = Array<number>(points.length).fill(0);
    const rhs = Array<number>(points.length).fill(0);
    for (let i = 1; i < points.length - 1; i++) {
      const before = points[i]!.x - points[i - 1]!.x;
      const after = points[i + 1]!.x - points[i]!.x;
      const divisor = 2 * (before + after) - before * upper[i - 1]!;
      upper[i] = after / divisor;
      rhs[i] =
        (6 * (slopes[i]! - slopes[i - 1]!) - before * rhs[i - 1]!) / divisor;
    }
    for (let i = points.length - 2; i > 0; i--)
      second[i] = rhs[i]! - upper[i]! * second[i + 1]!;
  }
  return points.slice(1).map((b, index) => {
    const a = points[index]!;
    const dx = b.x - a.x;
    const startSlope =
      curve === "natural"
        ? slopes[index]! - (dx * (2 * second[index]! + second[index + 1]!)) / 6
        : tangents[index]!;
    const endSlope =
      curve === "natural"
        ? slopes[index]! + (dx * (second[index]! + 2 * second[index + 1]!)) / 6
        : tangents[index + 1]!;
    return [a.y + (dx * startSlope) / 3, b.y - (dx * endSlope) / 3];
  });
}

/** Interpolates one contiguous segment. Optional controls permit additive stacks. */
export function getCartesianPath(
  points: readonly CartesianPoint[],
  curve: CartesianCurve,
  suppliedControls?: readonly CartesianControls[],
): string {
  if (!points.length) return "";
  let path = `M ${points[0]!.x} ${points[0]!.y}`;
  const controls =
    suppliedControls ??
    (points.length > 2 && (curve === "monotone" || curve === "natural")
      ? getCartesianControls(points, curve)
      : []);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!,
      b = points[i]!;
    const dx = b.x - a.x;
    const control = controls[i - 1];
    if (curve === "step") path += ` H ${a.x + dx / 2} V ${b.y} H ${b.x}`;
    else if (curve === "linear" || !control) path += ` L ${b.x} ${b.y}`;
    else
      path += ` C ${a.x + dx / 3} ${control[0]}, ${b.x - dx / 3} ${control[1]}, ${b.x} ${b.y}`;
  }
  return path;
}

export function getCartesianArea(
  points: readonly CartesianPoint[],
  curve: CartesianCurve,
  baseline: number,
) {
  if (points.length < 2) return "";
  return `${getCartesianPath(points, curve)} L ${points[points.length - 1]!.x} ${baseline} L ${points[0]!.x} ${baseline} Z`;
}
