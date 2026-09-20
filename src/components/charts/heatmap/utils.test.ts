import { fitStockLabel, stockTextColor } from "./geometry";
import { buildHeatmapModel } from "./model";
import { getHeatScale, getHeatColor, getHeatPalette } from "./colors";
import { layoutHeatStock, heatRingPath, insetHeatRect } from "./geometry";
const rows = [
  { x: "B", y: "Tue", v: 0, w: 3 },
  { x: "A", y: "Mon", v: null, w: 1 },
];
it("preserves first appearance, original identity, zero, and absent combinations", () => {
  const model = buildHeatmapModel(rows, "x", "y", "v", false);
  expect(model.error).toBeNull();
  expect(model.columns).toEqual(["B", "A"]);
  expect(model.rows).toEqual(["Tue", "Mon"]);
  expect(model.cells[0]).toMatchObject({ data: rows[0], index: 0, value: 0 });
  expect(model.cells[1]).toMatchObject({
    data: null,
    index: null,
    value: null,
  });
  expect(model.cells[3]).toMatchObject({
    data: rows[1],
    index: 1,
    value: null,
  });
  expect(model.values).toEqual([0]);
  expect(model.missingCount).toBe(3);
});
it.each([null, undefined, "", "  "])("treats %s as missing", (v) => {
  expect(
    buildHeatmapModel([{ x: "x", y: "y", v }], "x", "y", "v", false).cells[0]!
      .value,
  ).toBeNull();
});
it.each([NaN, Infinity, -Infinity, "12px", true, {}, []])(
  "rejects malformed measurement %s",
  (v) => {
    expect(
      buildHeatmapModel([{ x: "x", y: "y", v }], "x", "y", "v", false).error,
    ).toMatch(/Row 1.*finite/);
  },
);
it("parses finite numeric strings", () => {
  expect(
    buildHeatmapModel([{ x: "x", y: "y", v: "-1.25e2" }], "x", "y", "v", false)
      .values,
  ).toEqual([-125]);
});
it("rejects duplicate coordinates with both row numbers", () => {
  expect(
    buildHeatmapModel([rows[0]!, rows[0]!], "x", "y", "v", false).error,
  ).toMatch(/Rows 1 and 2.*duplicate.*Aggregate/);
});
it("caps the expanded sparse matrix before allocating combinations", () => {
  const data = Array.from({ length: 101 }, (_, i) => ({ x: i, y: i, v: 1 }));
  const model = buildHeatmapModel(data, "x", "y", "v", false);
  expect(model.error).toMatch(/10,000/);
  expect(model.cells).toHaveLength(101);
});
it("stock allows repeated labels and defaults to equal areas independently of values", () => {
  const model = buildHeatmapModel(
    [rows[0]!, rows[0]!, rows[1]!],
    "x",
    "y",
    "v",
    true,
  );
  expect(model.error).toBeNull();
  expect(model.cells.map((c) => c.weight)).toEqual([1, 1, 1]);
});
it.each([-1, null, Infinity, "bad"])("rejects invalid stock weight %s", (w) => {
  expect(
    buildHeatmapModel([{ x: "x", y: "y", v: 1, w }], "x", "y", "v", true, "w")
      .error,
  ).toMatch(/nonnegative area weight/);
});
it("accepts zero stock weight", () => {
  const model = buildHeatmapModel(
    [{ x: "x", y: "y", v: 0, w: 0 }],
    "x",
    "y",
    "v",
    true,
    "w",
  );
  expect(model.error).toBeNull();
  expect(model.cells[0]!.weight).toBe(0);
});
it("centers divergent colors on zero, including one-sided measurements", () => {
  const scale = getHeatScale([2, 10], true, 0);
  expect([scale.min, scale.max]).toEqual([-10, 10]);
  expect([
    scale.normalize(-10),
    scale.normalize(0),
    scale.normalize(10),
  ]).toEqual([0, 0.5, 1]);
  expect(scale.normalize(2)).toBeCloseTo(0.6);
});
it("maps an asymmetric fixed domain with its neutral point at the legend center", () => {
  const scale = getHeatScale([-2, 8], true, 3, [-5, 9]);
  expect(scale.error).toBeNull();
  expect(scale.normalize(3)).toBe(0.5);
  expect(scale.normalize(-1)).toBe(0.25);
  expect(scale.normalize(6)).toBe(0.75);
});
it.each([
  [0, 0],
  [5, 1],
  [-Infinity, 5],
  [0, 2],
])("rejects invalid or excluding domain %s,%s", (min, max) => {
  expect(getHeatScale([1, 3], false, 0, [min, max]).error).not.toBeNull();
});
it("rejects a divergent domain without two sides", () => {
  expect(getHeatScale([1, 2], true, 0, [0, 3]).error).toMatch(
    /below and above/,
  );
});
it("uses a constant middle color for constant sequential values", () => {
  const scale = getHeatScale([7, 7], false, 0);
  expect([scale.min, scale.max, scale.normalize(7)]).toEqual([7, 7, 0.5]);
});
it("keeps extreme finite ranges and narrow offset ranges precise", () => {
  const huge = getHeatScale([-Number.MAX_VALUE, Number.MAX_VALUE], true, 0);
  expect(huge.error).toBeNull();
  expect(huge.normalize(0)).toBe(0.5);
  expect(huge.normalize(Number.MAX_VALUE)).toBe(1);
  expect(getHeatScale([1e15, 1e15 + 2], false, 0).normalize(1e15 + 1)).toBe(
    0.5,
  );
  expect(
    getHeatScale([Number.MAX_VALUE], true, Number.MAX_VALUE).error,
  ).not.toBeNull();
});
it("preserves CSS color syntax instead of parsing it as hex", () => {
  const palette = getHeatPalette("blue", false, "var(--low)", "rgb(20 40 80)");
  expect(getHeatColor(0, palette, false)).toBe("var(--low)");
  expect(getHeatColor(0.25, palette, false)).toContain("var(--low) 75%");
  expect(getHeatColor(1, palette, false)).toBe("rgb(20 40 80)");
  expect(getHeatColor(0.5, palette, true)).toBe(palette.middle);
});
it.each([
  [3, 1, 0],
  [1, 1, 1, 1],
  [1e300, 5e299, 2e299],
  [8, 4, 2, 1, 1, 1, 1],
])(
  "allocates proportional stock areas without overlap for %j",
  (...weights) => {
    const rects = layoutHeatStock(weights, 600, 300);
    const max = Math.max(...weights),
      total = weights.reduce((n, w) => n + w / max, 0);
    rects.forEach((rect, i) => {
      expect((rect.width * rect.height) / 180000).toBeCloseTo(
        weights[i]! / max / total,
        10,
      );
      expect(rect.x + rect.width).toBeLessThanOrEqual(600.000001);
      expect(rect.y + rect.height).toBeLessThanOrEqual(300.000001);
      rects.slice(i + 1).forEach((other) => {
        const overlapX =
          Math.min(rect.x + rect.width, other.x + other.width) -
          Math.max(rect.x, other.x);
        const overlapY =
          Math.min(rect.y + rect.height, other.y + other.height) -
          Math.max(rect.y, other.y);
        expect(Math.min(overlapX, overlapY)).toBeLessThanOrEqual(0.000001);
      });
    });
  },
);
it("does not invent area for zero weights or tiny cells", () => {
  expect(
    layoutHeatStock([0, 0], 600, 300).every((r) => r.width * r.height === 0),
  ).toBe(true);
  expect(
    insetHeatRect({ x: 0, y: 0, width: 0.2, height: 0.1 }).width,
  ).toBeLessThan(0.2);
});
it("draws a full single-column annulus with two arcs per edge", () => {
  const path = heatRingPath(100, 100, 40, 80, 0, 2 * Math.PI);
  expect(path.match(/ A /g)).toHaveLength(4);
  expect(path).not.toMatch(/NaN|Infinity/);
});

describe("stock text", () => {
  const measure = (text: string, size: number) => text.length * size * 0.6;
  it("uses larger type when more area is available", () => {
    expect(
      fitStockLabel(240, 150, "AAPL", "+2.40%", measure).titleSize,
    ).toBeGreaterThan(
      fitStockLabel(70, 70, "AAPL", "+2.40%", measure).titleSize,
    );
  });
  it("keeps the percentage on narrow mobile cells by fitting both lines", () => {
    const fit = fitStockLabel(64, 80, "GOOGL", "+0.80%", measure);
    expect(fit.valueSize).toBeGreaterThan(0);
    expect(measure("+0.80%", fit.valueSize)).toBeLessThanOrEqual(52);
  });
  it("omits a value only when it cannot fit at the minimum readable size", () => {
    expect(
      fitStockLabel(50, 35, "TSLA", "1234567890.00%", measure).valueSize,
    ).toBe(0);
  });
  it("fits both lines within the available height", () => {
    const fit = fitStockLabel(160, 48, "META", "+3.10%", measure);
    expect(fit.titleSize * 1.15 + fit.valueSize * 1.2 + 2).toBeLessThanOrEqual(
      38,
    );
  });
  it("chooses contrasting ink for pale and dark cell paints", () => {
    expect(stockTextColor(255, 255, 255)).toBe("#000000");
    expect(stockTextColor(65, 72, 84)).toBe("#ffffff");
    expect(stockTextColor(22, 132, 91)).toBe("#ffffff");
  });
  it("keeps the stock neutral distinct from missing values and the grid midpoint", () => {
    expect(getHeatPalette("blue", true).middle).toBe("#414854");
    expect(getHeatPalette("diverging", false).middle).toBe("#f5f5f5");
  });
});
