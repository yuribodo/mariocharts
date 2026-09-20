import {
  scaleValue,
  calculateNiceTicks,
  bubbleRadius,
  buildScatterModel,
  getScatterDomain,
} from "./scales";

describe("scaleValue", () => {
  it("maps a value linearly from domain to range", () => {
    // 50 is halfway in [0,100] → halfway in [0,500] → 250
    expect(scaleValue(50, [0, 100], [0, 500])).toBe(250);
  });

  it("maps domain min to range min", () => {
    expect(scaleValue(0, [0, 100], [100, 400])).toBe(100);
  });

  it("maps domain max to range max", () => {
    expect(scaleValue(100, [0, 100], [100, 400])).toBe(400);
  });

  it("handles an inverted range", () => {
    // domain [0,100], range [500,0]: value 0 → 500, value 100 → 0
    expect(scaleValue(0, [0, 100], [500, 0])).toBe(500);
    expect(scaleValue(100, [0, 100], [500, 0])).toBe(0);
    expect(scaleValue(50, [0, 100], [500, 0])).toBe(250);
  });

  it("returns midpoint of range when domain min equals domain max", () => {
    expect(scaleValue(5, [5, 5], [0, 200])).toBe(100);
    expect(scaleValue(5, [5, 5], [100, 300])).toBe(200);
  });

  it("handles value outside domain (extrapolation)", () => {
    // 200 in [0,100] → proportionally 2x in [0,500] → 1000
    expect(scaleValue(200, [0, 100], [0, 500])).toBe(1000);
  });

  it("handles negative domain and range", () => {
    expect(scaleValue(-50, [-100, 0], [0, 100])).toBe(50);
  });

  it("handles non-zero-based domain", () => {
    // 15 in [10,20] is 50% → [0,100] → 50
    expect(scaleValue(15, [10, 20], [0, 100])).toBe(50);
  });
});

it("normalizes signed extremes and narrow ranges around large offsets", () => {
  expect(scaleValue(0, [-Number.MAX_VALUE, Number.MAX_VALUE], [0, 400])).toBe(
    200,
  );
  expect(scaleValue(1e12 + 0.5, [1e12, 1e12 + 1], [0, 400])).toBe(200);
});
it.each([
  [0, 10],
  [-10, 3],
  [1e12, 1e12 + 1],
  [-Number.MAX_VALUE, Number.MAX_VALUE],
  [0, Number.MIN_VALUE],
] as const)("keeps ticks finite and within [%p,%p]", (min, max) => {
  const ticks = calculateNiceTicks(min, max);
  expect(ticks.length).toBeLessThanOrEqual(6);
  expect(
    ticks.every((tick) => Number.isFinite(tick) && tick >= min && tick <= max),
  ).toBe(true);
  expect(new Set(ticks).size).toBe(ticks.length);
});
it("makes bubble area proportional above the visible-radius floor", () => {
  const a = bubbleRadius(100, 100, 400, [4, 40], "area");
  const b = bubbleRadius(400, 100, 400, [4, 40], "area");
  expect(b / a).toBe(2);
  expect((b * b) / (a * a)).toBe(4);
  expect(bubbleRadius(0, 0, 400, [4, 40], "area")).toBe(0);
  expect(bubbleRadius(0.001, 0, 400, [4, 40], "area")).toBe(4);
});
it("keeps equal sizes consistent and offers the legacy radius mapping", () => {
  expect(bubbleRadius(100, 100, 100, [4, 40], "area")).toBe(40);
  expect(bubbleRadius(100, 100, 100, [4, 40], "radius")).toBe(22);
  expect(bubbleRadius(250, 100, 400, [4, 40], "radius")).toBe(22);
});
it.each([null, undefined, "", "10oops", "1,5", NaN, Infinity])(
  "reports invalid coordinate %p instead of dropping the row",
  (value) => {
    const model = buildScatterModel([{ x: value, y: 10 }], { x: "x", y: "y" });
    expect(model.error).toMatch(/Row 1.*"x" must contain a finite number/);
  },
);
it.each([null, NaN, -1])("rejects invalid bubble size %p", (size) => {
  expect(
    buildScatterModel([{ x: 1, y: 10, size }], { x: "x", y: "y", size: "size" })
      .error,
  ).toMatch(/bubble size/);
});
it("keeps numeric strings, signed values, zero sizes, labels and source indices", () => {
  const rows = [
    { x: "$1,250", y: -5, size: 0, group: "B", label: "A" },
    { x: 3, y: 0, size: 40, group: "A", label: "B" },
  ];
  const model = buildScatterModel(rows, {
    x: "x",
    y: "y",
    size: "size",
    series: "group",
    label: "label",
  });
  expect(model.error).toBeNull();
  expect(model.groups).toEqual(["B", "A"]);
  expect(model.points[0]).toMatchObject({
    x: 1250,
    y: -5,
    size: 0,
    index: 0,
    data: rows[0],
  });
});
it("reports missing series and label keys", () => {
  expect(
    buildScatterModel([{ x: 1, y: 2, group: null }], {
      x: "x",
      y: "y",
      series: "group",
    }).error,
  ).toMatch(/series key/);
  expect(
    buildScatterModel([{ x: 1, y: 2, label: null }], {
      x: "x",
      y: "y",
      label: "label",
    }).error,
  ).toMatch(/label key/);
});
it.each([Number.MIN_VALUE, 1e300, Number.MAX_VALUE])(
  "creates finite automatic domains for constant %p",
  (value) => {
    const domain = getScatterDomain([value, value], undefined, 6, 300);
    expect(domain.every(Number.isFinite)).toBe(true);
    expect(domain[0]).toBeLessThan(domain[1]);
    expect(value).toBeGreaterThanOrEqual(domain[0]);
    expect(value).toBeLessThanOrEqual(domain[1]);
    expect(Number.isFinite(scaleValue(value, domain, [0, 300]))).toBe(true);
  },
);
it("pads automatic bounds enough for the largest bubble and retains explicit bounds", () => {
  const domain = getScatterDomain([0, 100], undefined, 40, 300);
  expect(scaleValue(0, domain, [0, 300])).toBeGreaterThanOrEqual(40);
  expect(scaleValue(100, domain, [0, 300])).toBeLessThanOrEqual(260);
  expect(getScatterDomain([0, 100], [20, 40], 40, 300)).toEqual([20, 40]);
});
