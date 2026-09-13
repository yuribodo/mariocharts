import { calculateLinearRegression, getTrendSegment } from "./regression";

it.each([
  { points: [] },
  { points: [{ x: 5, y: 42 }] },
  {
    points: [
      { x: 3, y: 1 },
      { x: 3, y: 9 },
    ],
  },
])("omits an unidentified fit for %p", ({ points }) => {
  expect(calculateLinearRegression(points)).toBeNull();
});
it.each([2, -2])(
  "fits a slope of %p without changing the observations",
  (slope) => {
    const points = [0, 1, 2, 3, 4].map((x) => ({ x, y: 7 + slope * x }));
    const fit = calculateLinearRegression(points)!;
    expect(fit.slope).toBeCloseTo(slope);
    expect(fit.intercept).toBeCloseTo(7);
    expect(fit.r2).toBeCloseTo(1);
    expect(fit.predict(2.5)).toBeCloseTo(7 + slope * 2.5);
  },
);
it("draws a horizontal fit without claiming R² when Y has no variance", () => {
  const fit = calculateLinearRegression([
    { x: 0, y: 5 },
    { x: 10, y: 5 },
  ])!;
  expect(fit.slope).toBe(0);
  expect(fit.predict(4)).toBe(5);
  expect(fit.r2).toBeNull();
});
it("centers large offsets before fitting small changes", () => {
  const fit = calculateLinearRegression(
    [0, 1, 2, 3].map((i) => ({ x: 1e12 + i, y: 3e12 + 2 * i })),
  )!;
  expect(fit.slope).toBeCloseTo(2, 10);
  expect(fit.predict(1e12 + 1.5)).toBe(3e12 + 3);
});
it.each([1e-200, 1e200])("fits finite values at scale %p", (scale) => {
  const fit = calculateLinearRegression(
    [1, 2, 3].map((n) => ({ x: n * scale, y: 2 * n * scale })),
  )!;
  expect(fit.slope).toBeCloseTo(2);
  expect(fit.r2).toBeCloseTo(1);
  expect(Number.isFinite(fit.predict(2 * scale))).toBe(true);
});
it("omits malformed regression input", () => {
  expect(
    calculateLinearRegression([
      { x: 1, y: 3 },
      { x: NaN, y: 4 },
    ]),
  ).toBeNull();
});
it("clips the trend to both viewport axes", () => {
  const fit = calculateLinearRegression([
    { x: 0, y: -10 },
    { x: 10, y: 30 },
  ]);
  const segment = getTrendSegment(fit, [0, 10], [0, 20])!;
  expect(segment.x1).toBeCloseTo(0.25);
  expect(segment.y1).toBe(1);
  expect(segment.x2).toBeCloseTo(0.75);
  expect(segment.y2).toBe(0);
});
it("does not extrapolate beyond observed X or draw a fit outside Y", () => {
  const fit = calculateLinearRegression([
    { x: 2, y: 5 },
    { x: 8, y: 5 },
  ]);
  expect(getTrendSegment(fit, [0, 10], [0, 10])).toEqual({
    x1: 0.2,
    y1: 0.5,
    x2: 0.8,
    y2: 0.5,
  });
  expect(getTrendSegment(fit, [0, 10], [10, 20])).toBeNull();
  expect(getTrendSegment(fit, [20, 30], [0, 10])).toBeNull();
});
