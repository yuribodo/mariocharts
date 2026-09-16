import {
  buildRadarModel,
  calculateAxisBounds,
  normalizeValue,
  generateTicks,
  calculatePercentage,
} from "./scales";
import type { RadarAxis, RadarSeries } from "./types";

type TestData = Record<string, number>;

describe("calculateAxisBounds", () => {
  const axis: RadarAxis = { key: "speed", label: "Speed" };

  it("uses manual min and max when both are specified", () => {
    const manualAxis: RadarAxis = {
      key: "speed",
      label: "Speed",
      min: 10,
      max: 200,
    };
    const series: RadarSeries<TestData>[] = [
      { id: "1", name: "A", data: { speed: 999 } },
    ];
    const bounds = calculateAxisBounds(manualAxis, series);
    expect(bounds.min).toBe(10);
    expect(bounds.max).toBe(200);
  });

  it("auto-calculates bounds from series data", () => {
    const series: RadarSeries<TestData>[] = [
      { id: "1", name: "A", data: { speed: 30 } },
      { id: "2", name: "B", data: { speed: 80 } },
    ];
    const bounds = calculateAxisBounds(axis, series);
    expect(bounds.min).toBe(0);
    expect(bounds.max).toBeGreaterThan(80);
  });

  it("returns defaults for empty series", () => {
    const bounds = calculateAxisBounds(axis, []);
    expect(bounds.min).toBe(0);
    expect(bounds.max).toBe(1);
  });

  it("uses specified min with auto max", () => {
    const partialAxis: RadarAxis = { key: "speed", label: "Speed", min: 5 };
    const series: RadarSeries<TestData>[] = [
      { id: "1", name: "A", data: { speed: 50 } },
    ];
    const bounds = calculateAxisBounds(partialAxis, series);
    expect(bounds.min).toBe(5);
    expect(bounds.max).toBeGreaterThan(50);
  });

  it("uses specified max with auto min", () => {
    const partialAxis: RadarAxis = { key: "speed", label: "Speed", max: 100 };
    const series: RadarSeries<TestData>[] = [
      { id: "1", name: "A", data: { speed: 50 } },
    ];
    const bounds = calculateAxisBounds(partialAxis, series);
    expect(bounds.min).toBe(0);
    expect(bounds.max).toBe(100);
  });

  it("ensures max > min", () => {
    const narrowAxis: RadarAxis = { key: "speed", label: "Speed" };
    const series: RadarSeries<TestData>[] = [
      { id: "1", name: "A", data: { speed: 0 } },
    ];
    const bounds = calculateAxisBounds(narrowAxis, series);
    expect(bounds.max).toBeGreaterThan(bounds.min);
  });

  it("returns specified min for empty series when min is provided", () => {
    const axisWithMin: RadarAxis = { key: "speed", label: "Speed", min: 10 };
    const bounds = calculateAxisBounds(axisWithMin, []);
    expect(bounds.min).toBe(10);
    expect(bounds.max).toBe(11); // Expand the unspecified maximum above the minimum.
  });
});

describe("normalizeValue", () => {
  it("normalizes a value within range", () => {
    expect(normalizeValue(50, 0, 100)).toBeCloseTo(0.5);
  });

  it("returns 0 for min value", () => {
    expect(normalizeValue(0, 0, 100)).toBe(0);
  });

  it("returns 1 for max value", () => {
    expect(normalizeValue(100, 0, 100)).toBe(1);
  });

  it("returns 0.5 when min equals max", () => {
    expect(normalizeValue(5, 5, 5)).toBe(0.5);
  });

  it("clamps below-min values to 0", () => {
    expect(normalizeValue(-10, 0, 100)).toBe(0);
  });

  it("clamps above-max values to 1", () => {
    expect(normalizeValue(200, 0, 100)).toBe(1);
  });

  it("handles negative ranges", () => {
    expect(normalizeValue(-50, -100, 0)).toBeCloseTo(0.5);
  });
});

describe("generateTicks", () => {
  it("generates evenly spaced ticks", () => {
    const ticks = generateTicks(0, 100, 5);
    expect(ticks).toHaveLength(5);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBe(100);
  });

  it("returns [min, max] when count < 2", () => {
    const ticks = generateTicks(0, 100, 1);
    expect(ticks).toEqual([0, 100]);
  });

  it("returns [min, max] when count is 0", () => {
    const ticks = generateTicks(10, 50, 0);
    expect(ticks).toEqual([10, 50]);
  });

  it("defaults to 5 ticks when count is not specified", () => {
    const ticks = generateTicks(0, 100);
    expect(ticks).toHaveLength(5);
  });

  it("generates correct intermediate values", () => {
    const ticks = generateTicks(0, 10, 3);
    expect(ticks).toEqual([0, 5, 10]);
  });

  it("handles negative range", () => {
    const ticks = generateTicks(-100, 0, 3);
    expect(ticks[0]).toBe(-100);
    expect(ticks[ticks.length - 1]).toBe(0);
  });
});

describe("calculatePercentage", () => {
  it("returns percentage string for a midpoint value", () => {
    expect(calculatePercentage(50, 0, 100)).toBe("50%");
  });

  it("returns 0% for min value", () => {
    expect(calculatePercentage(0, 0, 100)).toBe("0%");
  });

  it("returns 100% for max value", () => {
    expect(calculatePercentage(100, 0, 100)).toBe("100%");
  });

  it("clamps and returns 0% for below-min value", () => {
    expect(calculatePercentage(-10, 0, 100)).toBe("0%");
  });

  it("clamps and returns 100% for above-max value", () => {
    expect(calculatePercentage(150, 0, 100)).toBe("100%");
  });

  it("returns 50% when min equals max", () => {
    expect(calculatePercentage(5, 5, 5)).toBe("50%");
  });
});

// These exercise the component's data contract before any pixels are calculated.
describe("buildRadarModel", () => {
  const axes = (["a", "b", "c"] as const).map((key) => ({
    key,
    label: key,
    min: 0,
    max: 100,
  }));
  const makeSeries = (a: unknown) => [
    { id: "sample", name: "Sample", data: { a, b: 50, c: 75 } },
  ];
  it.each([null, undefined, "", "10oops", "1,5", NaN, Infinity])(
    "rejects malformed or missing observation %p",
    (value) => {
      const model = buildRadarModel(axes, makeSeries(value));
      expect(model.error).toMatch(/"a" must contain a finite number/);
    },
  );
  it("accepts zero and supported numeric strings without changing their meaning", () => {
    expect(buildRadarModel(axes, makeSeries(0)).error).toBeNull();
    expect(buildRadarModel(axes, makeSeries("85%")).series[0]!.values[0]).toBe(
      85,
    );
  });
  it.each([
    { min: 5, max: 5 },
    { min: 10, max: 5 },
    { min: NaN, max: 100 },
    { min: 0, max: Infinity },
  ])("rejects invalid explicit bounds %p", (bounds) => {
    expect(
      buildRadarModel(
        axes.map((axis) => ({ ...axis, ...bounds })),
        makeSeries(50),
      ).error,
    ).toMatch(/min < max/);
  });
  it.each([-10, 110])(
    "rejects %p outside explicit bounds instead of silently clamping",
    (value) => {
      expect(buildRadarModel(axes, makeSeries(value)).error).toMatch(
        /outside.*Adjust the axis bounds/,
      );
    },
  );
  it("rejects duplicate axis keys and series ids", () => {
    expect(
      buildRadarModel([axes[0]!, axes[0]!, axes[2]!], makeSeries(30)).error,
    ).toMatch(/unique.*data key/);
    expect(
      buildRadarModel(axes, [...makeSeries(30), ...makeSeries(60)]).error,
    ).toMatch(/unique.*id/);
  });
  it("keeps observed zero values distinct from empty series", () => {
    const model = buildRadarModel(
      axes.map(({ key, label }) => ({ key, label })),
      [{ id: "zero", name: "Zero", data: { a: 0, b: 0, c: 0 } }],
    );
    expect(model.error).toBeNull();
    expect(model.series[0]!.values).toEqual([0, 0, 0]);
    expect(model.axes.map((axis) => [axis.min, axis.max])).toEqual([
      [0, 1],
      [0, 1],
      [0, 1],
    ]);
  });
  it("includes the zero baseline above negative-only observations", () => {
    const autoAxes = axes.map(({ key, label }) => ({ key, label }));
    const model = buildRadarModel(autoAxes, [
      { id: "negative", name: "Negative", data: { a: -10, b: -30, c: -50 } },
    ]);
    expect(model.error).toBeNull();
    expect(model.axes.map((axis) => axis.max)).toEqual([0, 0, 0]);
  });
  it.each([Number.MIN_VALUE, 1e-300, 1e300, Number.MAX_VALUE])(
    "keeps finite extreme %p in finite bounds",
    (value) => {
      const model = buildRadarModel(
        axes.map(({ key, label }) => ({ key, label })),
        makeSeries(value),
      );
      expect(model.error).toBeNull();
      const axis = model.axes[0]!;
      const fraction = normalizeValue(value, axis.min, axis.max);
      expect(Number.isFinite(fraction)).toBe(true);
      expect(fraction).toBeGreaterThan(0);
      expect(fraction).toBeLessThanOrEqual(1);
    },
  );
  it("normalizes signed extremes without overflowing their span", () => {
    expect(normalizeValue(0, -Number.MAX_VALUE, Number.MAX_VALUE)).toBe(0.5);
    expect(
      normalizeValue(Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE),
    ).toBe(1);
    expect(
      generateTicks(-Number.MAX_VALUE, Number.MAX_VALUE).every(Number.isFinite),
    ).toBe(true);
  });
});
