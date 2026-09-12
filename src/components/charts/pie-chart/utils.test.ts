import { buildPieModel, getPieLayout, getSlicePath, polarPoint } from "./utils";

it.each([0, 60, 99.9])(
  "keeps rounded corners finite and inside a sector with inner radius %p",
  (inner) => {
    for (const span of [0.000001, 1, 15, 180, 270, 359.999]) {
      const path = getSlicePath(150, 150, 100, inner, -90, -90 + span, 1000);
      expect(path).not.toMatch(/NaN|Infinity/);
      expect(path.endsWith("Z")).toBe(true);
      // Every endpoint stays inside the original ring even when rounding is capped.
      const commands = path.match(/[MLA] [^MLAZ]+/g)!;
      expect(commands.length).toBeGreaterThan(3);
      for (const command of commands) {
        const [x, y] = command.trim().split(/\s+/).slice(-2).map(Number);
        const distance = Math.hypot(x! - 150, y! - 150);
        expect(distance).toBeLessThanOrEqual(100.00001);
        expect(distance).toBeGreaterThanOrEqual(inner - 0.00001);
      }
    }
  },
);

it.each([0, 60])(
  "keeps a rounded full circle seamless at inner radius %p",
  (inner) => {
    expect(getSlicePath(150, 150, 100, inner, 0, 360, 1000)).toBe(
      getSlicePath(150, 150, 100, inner, 0, 360),
    );
  },
);

it.each(["pie", "donut", "semi"] as const)(
  "preserves proportions and closes the %s sweep exactly",
  (variant) => {
    const model = buildPieModel(
      [
        { name: "A", v: 10 },
        { name: "zero", v: 0 },
        { name: "B", v: 30 },
      ],
      "v",
      "name",
      variant,
    );
    expect(model.total).toBe(40);
    expect(model.slices.map((s) => [s.index, s.percentage])).toEqual([
      [0, 25],
      [2, 75],
    ]);
    expect(model.slices[0]!.start).toBe(variant === "semi" ? -90 : 0);
    expect(model.slices[1]!.end).toBe(variant === "semi" ? 90 : 360);
  },
);
it.each([Number.MIN_VALUE, 1e-300, 1e300, Number.MAX_VALUE])(
  "keeps a single finite value %p at 100 percent",
  (v) => {
    const model = buildPieModel([{ name: "A", v }], "v", "name", "donut");
    expect(model.error).toBeNull();
    expect(model.total).toBe(v);
    expect(model.slices[0]!.percentage).toBe(100);
  },
);
it("reports overflow rather than rendering invalid percentages or totals", () => {
  expect(
    buildPieModel(
      [
        { name: "A", v: Number.MAX_VALUE },
        { name: "B", v: Number.MAX_VALUE },
      ],
      "v",
      "name",
      "pie",
    ).error,
  ).toMatch(/Rescale/);
});
it.each([null, undefined, "", "12abc", "1,5", Infinity, NaN, -1])(
  "rejects %p instead of silently changing the total",
  (v) => {
    expect(
      buildPieModel([{ name: "A", v }], "v", "name", "pie").error,
    ).not.toBeNull();
  },
);
it("keeps zero as an explicit row without generating a segment", () => {
  const model = buildPieModel([{ name: "A", v: 0 }], "v", "name", "pie");
  expect(model.rows).toHaveLength(1);
  expect(model.slices).toEqual([]);
  expect(model.total).toBe(0);
});
it("requires the configured label and preserves parsed numeric strings", () => {
  expect(
    buildPieModel(
      [{ v: "$1,250" }] as Record<string, unknown>[],
      "v",
      "missing",
      "pie",
    ).error,
  ).toMatch(/label key/);
  expect(
    buildPieModel([{ name: "A", v: "$1,250" }], "v", "name", "pie").total,
  ).toBe(1250);
});
it.each([0, 60])(
  "draws a complete circle at inner radius %p without an epsilon seam",
  (inner) => {
    const path = getSlicePath(150, 150, 100, inner, 0, 360);
    expect(path.match(/ A /g)).toHaveLength(inner ? 4 : 2);
    expect(path).not.toMatch(/ L |NaN|Infinity/);
    expect(path.match(/M /g)).toHaveLength(inner ? 2 : 1);
    expect(getSlicePath(150, 150, 100, inner, 20, 20)).toBe("");
  },
);
it.each(["pie", "donut", "semi"] as const)(
  "fits %s geometry into narrow and wide frames",
  (variant) => {
    for (const width of [120, 390, 1440]) {
      const layout = getPieLayout(width, 300, variant, 0.6);
      const start = variant === "semi" ? -90 : 0,
        sweep = variant === "semi" ? 180 : 360;
      for (let a = start; a <= start + sweep; a += 5) {
        const p = polarPoint(layout.cx, layout.cy, layout.outer, a);
        expect(p.x).toBeGreaterThanOrEqual(19.99);
        expect(p.x).toBeLessThanOrEqual(width - 19.99);
        expect(p.y).toBeGreaterThanOrEqual(19.99);
        expect(p.y).toBeLessThanOrEqual(280.01);
      }
    }
  },
);
