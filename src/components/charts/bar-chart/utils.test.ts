import {
  getBarDomain,
  getBarGeometry,
  parseBarValue,
  scaleBarValue,
} from "./utils";

describe("bar values and geometry", () => {
  it.each([
    ["$1,250.50", 1250.5],
    ["-$1,250", -1250],
    ["15%", 15],
    ["-2.5e2", -250],
    [" .5 ", 0.5],
    [0, 0],
  ])("parses %s as %s", (input, expected) => {
    expect(parseBarValue(input)).toBe(expected);
  });
  it.each([
    [10, 20],
    [-10, -20],
    [-100, 100],
    [0, 0],
    [1e-320, 2e-320],
    [-1e308, 1e308],
  ])("contains all values and zero for %j", (...values) => {
    const domain = getBarDomain(values);
    expect(domain.min).toBeLessThanOrEqual(Math.min(0, ...values));
    expect(domain.max).toBeGreaterThanOrEqual(Math.max(0, ...values));
    expect(domain.ticks.every(Number.isFinite)).toBe(true);
    for (const value of values) {
      expect(
        Number.isFinite(scaleBarValue(value, domain.min, domain.max, 300)),
      ).toBe(true);
    }
  });
  it.each(["vertical", "horizontal"] as const)(
    "renders all-negative values with proportional lengths (%s)",
    (orientation) => {
      const domain = getBarDomain([-10, -20]);
      const first = getBarGeometry(-10, 0, 2, 400, 200, domain, orientation);
      const second = getBarGeometry(-20, 1, 2, 400, 200, domain, orientation);
      const dimension = orientation === "vertical" ? "height" : "width";
      expect(second[dimension]).toBeCloseTo(first[dimension] * 2);
      expect(first.zero).toBe(orientation === "vertical" ? 0 : 400);
    },
  );
});
