import {
  getLineArea,
  getLineDomain,
  getLinePath,
  getLineSegments,
  parseLineValue,
  scaleLineValue,
  type LinePoint,
} from "./utils";
const points = (values: (number | null)[]): LinePoint[] =>
  values.map((y, index) => ({ x: index * 10, y: y ?? 0, defined: y !== null }));

it("splits only at missing observations and bridges only when requested", () => {
  const data = points([null, 10, 20, null, 40, null]);
  expect(
    getLineSegments(data, false).map((segment) => segment.map((p) => p.x)),
  ).toEqual([[10, 20], [40]]);
  expect(
    getLineSegments(data, true).map((segment) => segment.map((p) => p.x)),
  ).toEqual([[10, 20, 40]]);
});
it("closes each area at its own endpoints without extending through gaps", () => {
  const segments = getLineSegments(
    points([null, 10, 20, null, 30, 40, null]),
    false,
  );
  const areas = segments.map((segment) => getLineArea(segment, "linear", 80));
  expect(areas).toEqual([
    "M 10 10 L 20 20 L 20 80 L 10 80 Z",
    "M 40 30 L 50 40 L 50 80 L 40 80 Z",
  ]);
  expect(getLineArea(points([12]), "monotone", 80)).toBe("");
});
it("draws steps halfway between observations", () => {
  expect(getLinePath(points([10, 20, 5]), "step")).toBe(
    "M 0 10 H 5 V 20 H 10 H 15 V 5 H 20",
  );
});
it.each([
  [0, 1, 100, 101],
  [10, 0, 30, 1],
  [0, 0, 12, 12],
])(
  "keeps monotone interpolation within each pair of observations: %j",
  (...values) => {
    const data = points(values);
    const path = getLinePath(data, "monotone");
    const curves = [...path.matchAll(/C ([^C]+)/g)].map((match) =>
      match[1]!.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g)!.map(Number),
    );
    curves.forEach((control, index) => {
      const from = data[index]!.y,
        to = data[index + 1]!.y;
      for (let step = 0; step <= 100; step++) {
        const t = step / 100;
        const value =
          (1 - t) ** 3 * from +
          3 * (1 - t) ** 2 * t * control[1]! +
          3 * (1 - t) * t * t * control[3]! +
          t ** 3 * to;
        expect(value).toBeGreaterThanOrEqual(Math.min(from, to) - 1e-9);
        expect(value).toBeLessThanOrEqual(Math.max(from, to) + 1e-9);
      }
    });
  },
);
it("natural interpolation passes through observations with zero endpoint curvature", () => {
  const data = points([0, 20, 5, 30]);
  const path = getLinePath(data, "natural");
  const controls = [...path.matchAll(/C ([^C]+)/g)].map((match) =>
    match[1]!.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g)!.map(Number),
  );
  expect(controls).toHaveLength(3);
  expect(controls[0]![3]! - 2 * controls[0]![1]! + data[0]!.y).toBeCloseTo(0);
  expect(data[3]!.y - 2 * controls[2]![3]! + controls[2]![1]!).toBeCloseTo(0);
  controls.forEach((control, i) =>
    expect(control.slice(4)).toEqual([data[i + 1]!.x, data[i + 1]!.y]),
  );
  expect(path).not.toBe(getLinePath(data, "linear"));
});
it.each([
  [0],
  [42],
  [-42],
  [-100, 0, 100],
  [Number.MAX_VALUE],
  [-Number.MAX_VALUE, Number.MAX_VALUE],
  [Number.MIN_VALUE],
])(
  "keeps finite measurements within a nondegenerate domain: %j",
  (...values) => {
    const domain = getLineDomain(values);
    expect(domain.min).toBeLessThan(domain.max);
    for (const value of values) {
      const position = scaleLineValue(value, domain, 240);
      expect(Number.isFinite(position)).toBe(true);
      expect(position).toBeGreaterThanOrEqual(-1e-9);
      expect(position).toBeLessThanOrEqual(240 + 1e-9);
    }
    expect(domain.ticks.every(Number.isFinite)).toBe(true);
  },
);
it.each([
  ["$1,250", 1250],
  ["-20.5", -20.5],
  ["12abc", null],
  ["1,5", null],
  [null, null],
  [Infinity, null],
])("parses %p without inventing a measurement", (input, expected) =>
  expect(parseLineValue(input)).toBe(expected),
);
