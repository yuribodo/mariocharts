import {
  clampValue,
  valueToAngle,
  polarToCartesian,
  computeZoneArcs,
  describeArcPath,
  buildGaugeModel,
  gaugeFraction,
  getGaugeGeometry,
} from "./utils";
const zones = [
  { from: 0, to: 60, color: "green", label: "Normal" },
  { from: 60, to: 80, color: "orange", label: "High" },
  { from: 80, to: 100, color: "red", label: "Critical" },
];
it.each([
  [-10, 0],
  [50, 50],
  [150, 100],
])("clamps only geometry (%p)", (value, expected) =>
  expect(clampValue(value!, 0, 100)).toBe(expected),
);
it.each([
  [0, 135],
  [50, 270],
  [100, 405],
])("maps %p to the expected gauge angle", (value, expected) =>
  expect(valueToAngle(value!, 0, 100)).toBe(expected),
);
it.each([
  [0, 100, 0],
  [-90, 0, -100],
])("maps polar angle %p", (angle, x, y) => {
  const p = polarToCartesian(0, 0, 100, angle!);
  expect(p.x).toBeCloseTo(x!);
  expect(p.y).toBeCloseTo(y!);
});
it("computes exact zone boundaries without epsilon offsets", () => {
  const arcs = computeZoneArcs(zones, 0, 100);
  expect(arcs).toHaveLength(3);
  expect(arcs[0]!.startAngle).toBe(135);
  expect(arcs[2]!.endAngle).toBe(405);
  expect(arcs[0]!.endAngle).toBe(arcs[1]!.startAngle);
});
it.each([Number.MIN_VALUE, 1e-200, 1e200, Number.MAX_VALUE])(
  "normalizes signed finite extremes %p",
  (size) => {
    expect(gaugeFraction(0, -size, size)).toBe(0.5);
    expect(valueToAngle(size, -size, size)).toBe(405);
    expect(valueToAngle(-size, -size, size)).toBe(135);
  },
);
it("retains accuracy on a narrow range at a large offset", () =>
  expect(gaugeFraction(1e12 + 0.5, 1e12, 1e12 + 1)).toBe(0.5));
it.each([
  [NaN, 0, 100],
  [Infinity, 0, 100],
  [1, 0, 0],
  [1, 2, 0],
  [1, 0, Infinity],
])("rejects invalid scale input %p", (value, min, max) =>
  expect(() => gaugeFraction(value!, min!, max!)).toThrow(RangeError),
);
it.each([
  [0, 0],
  [60, 1],
  [80, 2],
  [100, 2],
])("assigns shared boundary %p to the starting zone", (value, index) =>
  expect(buildGaugeModel(value!, 0, 100, zones).activeZone?.index).toBe(index),
);
it("does not extend zones into gaps or beyond their exclusive end", () => {
  const withGap = [zones[0]!, zones[2]!];
  for (const value of [60, 65, 79])
    expect(buildGaugeModel(value, 0, 100, withGap).activeZone).toBeUndefined();
  expect(buildGaugeModel(80, 0, 100, withGap).activeZone?.label).toBe(
    "Critical",
  );
});
it("sorts boundaries without mutating inputs and identifies zones by original index, not color", () => {
  const unordered = Object.freeze([
    Object.freeze({ ...zones[2]!, color: "blue" }),
    Object.freeze({ ...zones[0]!, color: "blue" }),
    Object.freeze({ ...zones[1]!, color: "blue" }),
  ]);
  const model = buildGaugeModel(65, 0, 100, unordered);
  expect(model.error).toBeNull();
  expect(model.activeZone).toMatchObject({
    index: 2,
    from: 60,
    to: 80,
    label: "High",
  });
  expect(model.zones.map((zone) => zone.index)).toEqual([1, 2, 0]);
});
it.each([
  [-15, 0, "below"],
  [115, 1, "above"],
])(
  "keeps outside value %p separate from arc position",
  (value, fraction, status) => {
    const model = buildGaugeModel(value as number, 0, 100, zones);
    expect(model.error).toBeNull();
    expect(model.fraction).toBe(fraction);
    expect(model.rangeStatus).toBe(status);
    expect(model.activeZone).toBeUndefined();
  },
);
it.each(
  [
    [
      { from: 0, to: 70, color: "blue" },
      { from: 60, to: 100, color: "red" },
    ],
    [{ from: 60, to: 60, color: "blue" }],
    [{ from: -10, to: 60, color: "blue" }],
    [{ from: 0, to: 110, color: "blue" }],
    [{ from: NaN, to: 60, color: "blue" }],
    [{ from: 0, to: Infinity, color: "blue" }],
    [{ from: 0, to: 60, color: "" }],
  ].map((zones) => ({ zones })),
)("reports invalid zones %p", ({ zones }) =>
  expect(buildGaugeModel(50, 0, 100, zones).error).toMatch(/Zone/),
);
it("omits zero/invalid arcs and represents full circles with two arcs", () => {
  expect(describeArcPath(100, 100, 80, 135, 135)).toBe("");
  expect(describeArcPath(100, 100, -1, 135, 405)).toBe("");
  expect(describeArcPath(0, 0, 50, 135, NaN)).toBe("");
  expect(describeArcPath(100, 100, 80, 0, 360).match(/ A /g)).toHaveLength(2);
  expect(describeArcPath(100, 100, 80, 135, 405).match(/ A /g)).toHaveLength(1);
});
it.each([
  [300, 360, 20],
  [590, 300, 20],
  [180, 160, 80],
  [120, 100, 40],
])("fits stroke and arc in frame %p", (width, height, stroke) => {
  const g = getGaugeGeometry(width!, height!, stroke!);
  expect(g.radius).toBeGreaterThan(0);
  expect(g.stroke).toBeLessThanOrEqual(stroke!);
  for (let angle = 135; angle <= 405; angle += 5) {
    const p = polarToCartesian(g.cx, g.cy, g.radius, angle);
    expect(p.x - g.stroke / 2).toBeGreaterThanOrEqual(0);
    expect(p.x + g.stroke / 2).toBeLessThanOrEqual(width!);
    expect(p.y - g.stroke / 2).toBeGreaterThanOrEqual(0);
    expect(p.y + g.stroke / 2).toBeLessThanOrEqual(height!);
  }
});
