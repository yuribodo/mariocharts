import { scaleValue } from "./scales";

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  /** Null for constant Y, where total variance is zero. */
  r2: number | null;
  xMin: number;
  xMax: number;
  predict: (x: number) => number;
}

/** Center and scale before fitting to avoid cancellation around large offsets. */
export function calculateLinearRegression(
  points: readonly { x: number; y: number }[],
): LinearRegressionResult | null {
  if (
    points.length < 2 ||
    points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))
  )
    return null;
  const origin = points[0]!;
  let xScale = 0,
    yScale = 0,
    xMin = origin.x,
    xMax = origin.x;
  for (const p of points) {
    xScale = Math.max(xScale, Math.abs(p.x - origin.x));
    yScale = Math.max(yScale, Math.abs(p.y - origin.y));
    xMin = Math.min(xMin, p.x);
    xMax = Math.max(xMax, p.x);
  }
  if (!xScale) return null;
  if (!Number.isFinite(xScale)) xScale = Number.MAX_VALUE;
  if (!Number.isFinite(yScale)) yScale = Number.MAX_VALUE;
  yScale ||= 1;
  const relative = (value: number, base: number, scale: number) =>
    Number.isFinite(value - base)
      ? (value - base) / scale
      : value / scale - base / scale;
  const normalized = points.map((p) => ({
    x: relative(p.x, origin.x, xScale),
    y: relative(p.y, origin.y, yScale),
  }));
  const meanX = normalized.reduce((sum, p) => sum + p.x / points.length, 0);
  const meanY = normalized.reduce((sum, p) => sum + p.y / points.length, 0);
  let xx = 0,
    xy = 0,
    yy = 0;
  for (const p of normalized) {
    const dx = p.x - meanX,
      dy = p.y - meanY;
    xx += dx * dx;
    xy += dx * dy;
    yy += dy * dy;
  }
  if (xx === 0) return null;
  const normalizedSlope = xy / xx;
  const ratio = yScale / xScale;
  const slope =
    normalizedSlope === 0
      ? 0
      : Number.isFinite(ratio)
        ? normalizedSlope * ratio
        : (normalizedSlope * yScale) / xScale;
  const predict = (x: number) =>
    origin.y +
    yScale *
      (meanY + normalizedSlope * (relative(x, origin.x, xScale) - meanX));
  const intercept = predict(0);
  if (!Number.isFinite(slope) || !Number.isFinite(intercept)) return null;
  return {
    slope,
    intercept,
    r2: yy === 0 ? null : Math.max(0, Math.min(1, (xy * xy) / xx / yy)),
    xMin,
    xMax,
    predict,
  };
}

/** Clip a fit to both view domains, without extending it past observed X values. */
export function getTrendSegment(
  fit: LinearRegressionResult | null,
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
) {
  if (!fit) return null;
  const left = Math.max(xDomain[0], fit.xMin),
    right = Math.min(xDomain[1], fit.xMax);
  if (left >= right) return null;
  const x1 = scaleValue(left, xDomain, [0, 1]),
    x2 = scaleValue(right, xDomain, [0, 1]);
  const y1 = scaleValue(fit.predict(left), yDomain, [1, 0]),
    y2 = scaleValue(fit.predict(right), yDomain, [1, 0]);
  if (![x1, x2, y1, y2].every(Number.isFinite)) return null;
  const dy = y2 - y1;
  if (dy === 0) return y1 < 0 || y1 > 1 ? null : { x1, y1, x2, y2 };
  const a = -y1 / dy,
    b = (1 - y1) / dy;
  const start = Math.max(0, Math.min(a, b)),
    end = Math.min(1, Math.max(a, b));
  if (start > end) return null;
  return {
    x1: x1 + (x2 - x1) * start,
    y1: Math.max(0, Math.min(1, y1 + dy * start)),
    x2: x1 + (x2 - x1) * end,
    y2: Math.max(0, Math.min(1, y1 + dy * end)),
  };
}
