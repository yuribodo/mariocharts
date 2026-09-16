import {
  computeWaterfallSeries,
  resolveWaterfallType,
  formatWaterfallDelta,
} from "./utils";

const KEYS = { label: "label", value: "value", type: "type" } as const;

describe("resolveWaterfallType", () => {
  it("honours an explicit type", () => {
    expect(resolveWaterfallType("total", 5)).toBe("total");
    expect(resolveWaterfallType("increase", -5)).toBe("increase");
    expect(resolveWaterfallType("decrease", 5)).toBe("decrease");
  });

  it("infers from the sign when the type is missing/invalid", () => {
    expect(resolveWaterfallType(undefined, 5)).toBe("increase");
    expect(resolveWaterfallType(undefined, -5)).toBe("decrease");
    expect(resolveWaterfallType("nonsense", -1)).toBe("decrease");
    expect(resolveWaterfallType(null, 0)).toBe("increase");
  });
});

describe("computeWaterfallSeries", () => {
  const data = [
    { label: "Starting", value: 100000, type: "total" },
    { label: "Sales", value: 45000, type: "increase" },
    { label: "Refunds", value: -12000, type: "decrease" },
    { label: "Expenses", value: -28000, type: "decrease" },
    { label: "Net", value: 105000, type: "total" },
  ];

  it("computes running totals across steps", () => {
    const { bars } = computeWaterfallSeries(data, KEYS);
    expect(bars.map((b) => b.cumulative)).toEqual([
      100000, 145000, 133000, 105000, 105000,
    ]);
  });

  it("anchors total bars to the baseline and floats increases/decreases", () => {
    const { bars } = computeWaterfallSeries(data, KEYS);
    // Starting total: 0 -> 100000
    expect(bars[0]).toMatchObject({ type: "total", start: 0, end: 100000 });
    // Sales increase floats from the running total
    expect(bars[1]).toMatchObject({
      type: "increase",
      start: 100000,
      end: 145000,
      value: 45000,
    });
    // Refunds decrease floats down
    expect(bars[2]).toMatchObject({
      type: "decrease",
      start: 145000,
      end: 133000,
      value: -12000,
    });
    // Net total re-anchors to 0
    expect(bars[4]).toMatchObject({ type: "total", start: 0, end: 105000 });
  });

  it("exposes display edges ready for a value scale", () => {
    const { bars } = computeWaterfallSeries(data, KEYS);
    expect(bars[2]).toMatchObject({ displayStart: 133000, displayEnd: 145000 });
  });

  it("returns a domain that always includes zero", () => {
    const { domain } = computeWaterfallSeries(data, KEYS);
    expect(domain).toEqual({ min: 0, max: 145000 });
  });

  it("supports running totals that dip below zero", () => {
    const { bars, domain } = computeWaterfallSeries(
      [
        { label: "A", value: 10, type: "total" },
        { label: "B", value: -30, type: "decrease" },
      ],
      KEYS,
    );
    expect(bars[1]).toMatchObject({
      start: 10,
      end: -20,
      displayStart: -20,
      displayEnd: 10,
    });
    expect(domain).toEqual({ min: -20, max: 10 });
  });

  it("infers types from the sign when omitted", () => {
    const { bars } = computeWaterfallSeries(
      [
        { label: "A", value: 40 },
        { label: "B", value: -15 },
      ],
      KEYS,
    );
    expect(bars[0]!.type).toBe("increase");
    expect(bars[1]!.type).toBe("decrease");
    expect(bars[1]!.cumulative).toBe(25);
  });

  it("normalises decrease magnitude regardless of the sign given", () => {
    const { bars } = computeWaterfallSeries(
      [
        { label: "A", value: 100, type: "total" },
        { label: "B", value: 30, type: "decrease" }, // positive value, decrease type
      ],
      KEYS,
    );
    expect(bars[1]).toMatchObject({ value: -30, end: 70 });
  });

  it("returns an empty series and zeroed domain for no data", () => {
    const { bars, domain } = computeWaterfallSeries([], KEYS);
    expect(bars).toEqual([]);
    expect(domain).toEqual({ min: 0, max: 0 });
  });
});

describe("formatWaterfallDelta", () => {
  const fmt = (v: unknown) => String(v);

  it("shows totals as their absolute value", () => {
    expect(formatWaterfallDelta({ type: "total", value: 100000 }, fmt)).toBe(
      "100000",
    );
  });

  it("prefixes increases with +", () => {
    expect(formatWaterfallDelta({ type: "increase", value: 45000 }, fmt)).toBe(
      "+45000",
    );
  });

  it("keeps the negative sign for decreases", () => {
    expect(formatWaterfallDelta({ type: "decrease", value: -12000 }, fmt)).toBe(
      "-12000",
    );
  });
});

describe("computed checkpoints and validation", () => {
  it("computes period movements and balances without double counting", () => {
    const result = computeWaterfallSeries(
      [
        { label: "Start", value: 100, type: "total" },
        { label: "A", value: 40 },
        { label: "B", value: -10 },
        { label: "Q1", type: "subtotal" },
        { label: "C", value: -20 },
        { label: "Q2", type: "subtotal" },
        { label: "End", type: "sum" },
      ],
      KEYS,
    );
    expect(result.error).toBeNull();
    expect(result.bars.map((bar) => bar.cumulative)).toEqual([
      100, 140, 130, 130, 110, 110, 110,
    ]);
    expect(result.bars[3]).toMatchObject({ start: 100, end: 130, value: 30 });
    expect(result.bars[5]).toMatchObject({ start: 130, end: 110, value: -20 });
    expect(result.bars[6]).toMatchObject({ start: 0, end: 110, value: 110 });
  });
  it("starts a new checkpoint after a running sum", () => {
    const { bars } = computeWaterfallSeries(
      [
        { label: "A", value: 40 },
        { label: "Balance", type: "sum" },
        { label: "B", value: -10 },
        { label: "Period", type: "subtotal" },
      ],
      KEYS,
      100,
    );
    expect(bars[0]).toMatchObject({ start: 100, end: 140 });
    expect(bars[3]).toMatchObject({ start: 140, value: -10, cumulative: 130 });
  });
  it("detects absolute discontinuities without breaking computed summaries", () => {
    const { bars } = computeWaterfallSeries(
      [
        { label: "A", value: 40 },
        { label: "Reset", value: 20, type: "total" },
        { label: "Same", value: 20, type: "total" },
        { label: "Sum", type: "sum" },
      ],
      KEYS,
    );
    expect(bars.map((bar) => bar.connectFromPrevious)).toEqual([
      true,
      false,
      true,
      true,
    ]);
  });
  it.each([null, undefined, NaN, Infinity, "20", "20oops"])(
    "rejects invalid change %p without silently making it zero",
    (value) => {
      const result = computeWaterfallSeries(
        [
          { label: "A", value: 20 },
          { label: "B", value },
        ],
        KEYS,
      );
      expect(result.error).toMatch(/finite numeric/);
      expect(result.bars).toEqual([]);
    },
  );
  it.each(["sum", "subtotal"])("requires %s values to be omitted", (type) => {
    expect(
      computeWaterfallSeries([{ label: "A", type, value: 20 }], KEYS).error,
    ).toMatch(/omit value/);
    expect(
      computeWaterfallSeries([{ label: "A", type, value: null }], KEYS).error,
    ).toBeNull();
  });
  it("rejects unknown types, empty labels and overflowing accumulation", () => {
    expect(
      computeWaterfallSeries([{ label: "A", value: 1, type: "typo" }], KEYS)
        .error,
    ).toMatch(/unknown step type/);
    expect(
      computeWaterfallSeries([{ label: " ", value: 1 }], KEYS).error,
    ).toMatch(/label/);
    expect(
      computeWaterfallSeries(
        [
          { label: "A", value: 1e308 },
          { label: "B", value: 1e308 },
        ],
        KEYS,
      ).error,
    ).toMatch(/Rescale/);
  });
  it("preserves original rows and repeated labels", () => {
    const rows = [
      { label: "Same", value: 1 },
      { label: "Same", value: -1 },
    ];
    const { bars } = computeWaterfallSeries(rows, KEYS);
    expect(bars[1]!.data).toBe(rows[1]);
    expect(bars[1]!.index).toBe(1);
  });
});
