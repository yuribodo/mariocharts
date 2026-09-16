import {
  buildStackModel,
  getStackDomain,
  getStackGeometry,
  getStackPath,
  scaleStackValue,
} from "./utils";

it("accumulates signed segments independently without losing cancellation", () => {
  const model = buildStackModel(
    [{ label: "A", a: 100, b: -70, c: 50, d: -80, e: 0 }],
    "label",
    ["a", "b", "c", "d", "e"],
  );
  expect(model.error).toBeNull();
  expect(model.bars[0]).toMatchObject({
    positive: 150,
    negative: -150,
    total: 0,
  });
  expect(
    model.bars[0]!.segments.map((p) => [p.start, p.end, p.terminal]),
  ).toEqual([
    [0, 100, false],
    [0, -70, false],
    [100, 150, true],
    [-70, -150, true],
    [150, 150, false],
  ]);
  expect(model.domain.min).toBeLessThanOrEqual(-150);
  expect(model.domain.max).toBeGreaterThanOrEqual(150);
});
it.each([true, false])(
  "keeps both signed stacks proportional and within bounds, vertical=%p",
  (vertical) => {
    const domain = getStackDomain(-100, 100);
    const positive = getStackGeometry(0, 100, 0, 1, 400, 200, domain, vertical);
    const negative = getStackGeometry(
      0,
      -100,
      0,
      1,
      400,
      200,
      domain,
      vertical,
    );
    expect(positive.width).toBe(negative.width);
    expect(positive.height).toBe(negative.height);
    for (const box of [positive, negative]) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(400);
      expect(box.y + box.height).toBeLessThanOrEqual(200);
    }
    expect(
      vertical ? positive.y + positive.height : negative.x + negative.width,
    ).toBe(vertical ? negative.y : positive.x);
  },
);
it.each([true, false])(
  "keeps consecutive segment joins flush in orientation %p",
  (vertical) => {
    const domain = getStackDomain(-50, 200);
    const first = getStackGeometry(0, 80, 0, 2, 400, 300, domain, vertical);
    const next = getStackGeometry(80, 200, 0, 2, 400, 300, domain, vertical);
    expect(vertical ? next.y + next.height : first.x + first.width).toBeCloseTo(
      vertical ? first.y : next.x,
    );
    expect(
      (vertical ? next.height : next.width) /
        (vertical ? first.height : first.width),
    ).toBeCloseTo(1.5);
  },
);
it.each([null, undefined, "", "12oops", NaN, Infinity])(
  "reports invalid observation %p with its original row and key",
  (value) => {
    const model = buildStackModel(
      [
        { label: "A", a: 20 },
        { label: "B", a: value },
      ],
      "label",
      ["a"],
    );
    expect(model.error).toMatch(/Row 2.*"a".*finite number/);
    expect(model.bars).toHaveLength(2);
  },
);
it("preserves duplicate labels, numeric strings, and original rows", () => {
  const data = [
    { label: "A", a: "$1,200", b: "-250" },
    { label: "A", a: "0", b: "40%" },
  ];
  const model = buildStackModel(data, "label", ["a", "b"]);
  expect(model.error).toBeNull();
  expect(model.bars[0]!.data).toBe(data[0]);
  expect(model.bars[1]!.index).toBe(1);
  expect(model.bars[0]!.total).toBe(950);
  expect(model.bars[1]!.segments[0]!.value).toBe(0);
});
it("rejects missing categories and empty/duplicate keys", () => {
  expect(
    buildStackModel([{ label: null, a: 1 }], "label", ["a"]).error,
  ).toMatch(/category/);
  expect(buildStackModel([{ label: "A", a: 1 }], "label", []).error).toMatch(
    /at least one/,
  );
  expect(
    buildStackModel([{ label: "A", a: 1 }], "label", ["a", "a"]).error,
  ).toMatch(/unique/);
});
it.each([1, -1])("reports overflowing signed totals (%p)", (sign) => {
  expect(
    buildStackModel(
      [{ label: "A", a: sign * Number.MAX_VALUE, b: sign * Number.MAX_VALUE }],
      "label",
      ["a", "b"],
    ).error,
  ).toMatch(/total exceeds/);
});
it.each([Number.MIN_VALUE, 1e-200, 1e200, Number.MAX_VALUE])(
  "handles finite signed extremes of %p",
  (magnitude) => {
    const model = buildStackModel(
      [{ label: "A", a: magnitude, b: -magnitude }],
      "label",
      ["a", "b"],
    );
    expect(model.error).toBeNull();
    expect(model.bars[0]!.total).toBe(0);
    const domain = model.domain;
    expect(
      [domain.min, domain.max, ...domain.ticks].every(Number.isFinite),
    ).toBe(true);
    expect(domain.ticks.length).toBeLessThanOrEqual(20);
    expect(domain.ticks).toContain(0);
    expect(scaleStackValue(0, domain, 400)).toBeCloseTo(200);
    for (const segment of model.bars[0]!.segments) {
      const geometry = getStackGeometry(
        segment.start,
        segment.end,
        0,
        1,
        400,
        200,
        domain,
        true,
      );
      expect(Object.values(geometry).every(Number.isFinite)).toBe(true);
    }
  },
);
it("includes zero for positive, negative, and all-zero data", () => {
  expect(getStackDomain(0, 100).min).toBe(0);
  expect(getStackDomain(-100, 0).max).toBe(0);
  expect(getStackDomain(0, 0)).toEqual({ min: 0, max: 1, ticks: [0] });
  expect(
    getStackPath({ x: 10, y: 50, width: 20, height: 0 }, true, false, 2),
  ).toBe("");
});
it.each([
  [true, false],
  [true, true],
  [false, false],
  [false, true],
])(
  "rounds only the outer end vertical=%p negative=%p",
  (vertical, negative) => {
    const rect = { x: 10, y: 20, width: 40, height: 60 };
    const path = getStackPath(rect, vertical!, negative!, 8);
    const quadratics = [
      ...path.matchAll(/Q ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)/g),
    ].map((match) => match.slice(1).map(Number));
    const curved = quadratics.filter(
      ([cx, cy, ex, ey]) => cx !== ex || cy !== ey,
    );
    expect(curved).toHaveLength(2);
    if (vertical)
      expect(curved.every(([, cy]) => cy === (negative ? 80 : 20))).toBe(true);
    else expect(curved.every(([cx]) => cx === (negative ? 10 : 50))).toBe(true);
    const flat = getStackPath(rect, vertical!, negative!, 0);
    expect(flat).not.toBe(path);
    expect(getStackPath(rect, vertical!, negative!, 1000)).toBe(
      getStackPath(rect, vertical!, negative!, 20),
    );
  },
);
