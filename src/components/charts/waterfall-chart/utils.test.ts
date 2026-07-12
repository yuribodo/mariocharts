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
    expect(bars.map((b) => b.cumulative)).toEqual([100000, 145000, 133000, 105000, 105000]);
  });

  it("anchors total bars to the baseline and floats increases/decreases", () => {
    const { bars } = computeWaterfallSeries(data, KEYS);
    // Starting total: 0 -> 100000
    expect(bars[0]).toMatchObject({ type: "total", start: 0, end: 100000 });
    // Sales increase floats from the running total
    expect(bars[1]).toMatchObject({ type: "increase", start: 100000, end: 145000, value: 45000 });
    // Refunds decrease floats down
    expect(bars[2]).toMatchObject({ type: "decrease", start: 145000, end: 133000, value: -12000 });
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
      KEYS
    );
    expect(bars[1]).toMatchObject({ start: 10, end: -20, displayStart: -20, displayEnd: 10 });
    expect(domain).toEqual({ min: -20, max: 10 });
  });

  it("infers types from the sign when omitted", () => {
    const { bars } = computeWaterfallSeries(
      [
        { label: "A", value: 40 },
        { label: "B", value: -15 },
      ],
      KEYS
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
      KEYS
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
    expect(formatWaterfallDelta({ type: "total", value: 100000 }, fmt)).toBe("100000");
  });

  it("prefixes increases with +", () => {
    expect(formatWaterfallDelta({ type: "increase", value: 45000 }, fmt)).toBe("+45000");
  });

  it("keeps the negative sign for decreases", () => {
    expect(formatWaterfallDelta({ type: "decrease", value: -12000 }, fmt)).toBe("-12000");
  });
});
