import {
  formatValue,
  getNumericValue,
  getNumericValueOrNull,
  calculateNiceTicks,
  getGridDasharray,
} from "./utils";

describe("formatValue", () => {
  it("formats numbers >= 1M with M suffix", () => {
    expect(formatValue(1_500_000)).toBe("1.5M");
    expect(formatValue(1_000_000)).toBe("1.0M");
    expect(formatValue(10_000_000)).toBe("10.0M");
  });

  it("formats numbers >= 1K with K suffix", () => {
    expect(formatValue(2_500)).toBe("2.5K");
    expect(formatValue(1_000)).toBe("1.0K");
    expect(formatValue(999_999)).toBe("1000.0K");
  });

  it("formats numbers < 1K using toLocaleString", () => {
    expect(formatValue(42)).toBe((42).toLocaleString());
    expect(formatValue(0)).toBe((0).toLocaleString());
    expect(formatValue(999)).toBe((999).toLocaleString());
  });

  it("formats negative numbers >= 1M in magnitude", () => {
    expect(formatValue(-1_500_000)).toBe("-1.5M");
    expect(formatValue(-5_000_000)).toBe("-5.0M");
  });

  it("formats negative numbers >= 1K in magnitude", () => {
    expect(formatValue(-2_500)).toBe("-2.5K");
  });

  it("formats negative numbers < 1K using toLocaleString", () => {
    expect(formatValue(-500)).toBe((-500).toLocaleString());
  });

  it("converts strings using String()", () => {
    expect(formatValue("hello")).toBe("hello");
    expect(formatValue("")).toBe("");
  });

  it("converts null and undefined using String()", () => {
    expect(formatValue(null)).toBe("null");
    expect(formatValue(undefined)).toBe("undefined");
  });
});

describe("getNumericValue", () => {
  it("returns the number when value is a valid finite number", () => {
    expect(getNumericValue({ amount: 42 }, "amount")).toBe(42);
    expect(getNumericValue({ amount: 0 }, "amount")).toBe(0);
    expect(getNumericValue({ amount: -10.5 }, "amount")).toBe(-10.5);
  });

  it("parses numeric strings with currency/formatting characters", () => {
    expect(getNumericValue({ price: "$1,234.56" }, "price")).toBe(1234.56);
    expect(getNumericValue({ rate: "50%" }, "rate")).toBe(50);
    expect(getNumericValue({ val: "1 000" }, "val")).toBe(1000);
  });

  it("returns 0 for non-numeric strings", () => {
    expect(getNumericValue({ name: "hello" }, "name")).toBe(0);
    expect(getNumericValue({ name: "" }, "name")).toBe(0);
  });

  it("returns 0 for undefined keys", () => {
    expect(getNumericValue({}, "missing")).toBe(0);
  });

  it("returns 0 for Infinity", () => {
    expect(getNumericValue({ val: Infinity }, "val")).toBe(0);
    expect(getNumericValue({ val: -Infinity }, "val")).toBe(0);
  });

  it("returns 0 for NaN", () => {
    expect(getNumericValue({ val: NaN }, "val")).toBe(0);
  });
});

describe("getNumericValueOrNull", () => {
  it("returns the number when value is a valid finite number", () => {
    expect(getNumericValueOrNull({ amount: 42 }, "amount")).toBe(42);
    expect(getNumericValueOrNull({ amount: 0 }, "amount")).toBe(0);
    expect(getNumericValueOrNull({ amount: -10.5 }, "amount")).toBe(-10.5);
  });

  it("parses numeric strings with currency/formatting characters", () => {
    expect(getNumericValueOrNull({ price: "$1,234.56" }, "price")).toBe(1234.56);
    expect(getNumericValueOrNull({ rate: "50%" }, "rate")).toBe(50);
  });

  it("returns null for non-numeric strings", () => {
    expect(getNumericValueOrNull({ name: "hello" }, "name")).toBeNull();
    expect(getNumericValueOrNull({ name: "" }, "name")).toBeNull();
  });

  it("returns null for undefined keys", () => {
    expect(getNumericValueOrNull({}, "missing")).toBeNull();
  });

  it("returns null for Infinity", () => {
    expect(getNumericValueOrNull({ val: Infinity }, "val")).toBeNull();
    expect(getNumericValueOrNull({ val: -Infinity }, "val")).toBeNull();
  });

  it("returns null for NaN", () => {
    expect(getNumericValueOrNull({ val: NaN }, "val")).toBeNull();
  });
});

describe("calculateNiceTicks", () => {
  it("produces ticks for a normal range (0 to 100)", () => {
    const ticks = calculateNiceTicks(0, 100, 5);
    expect(ticks[0]).toBeLessThanOrEqual(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(100);
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    // Ticks should be in ascending order
    for (let i = 1; i < ticks.length; i++) {
      expect(ticks[i]).toBeGreaterThan(ticks[i - 1]!);
    }
  });

  it("returns a single-element array when min equals max", () => {
    expect(calculateNiceTicks(50, 50)).toEqual([50]);
    expect(calculateNiceTicks(0, 0)).toEqual([0]);
  });

  it("handles large values", () => {
    const ticks = calculateNiceTicks(0, 1_000_000, 5);
    expect(ticks[0]).toBeLessThanOrEqual(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(1_000_000);
    for (let i = 1; i < ticks.length; i++) {
      expect(ticks[i]).toBeGreaterThan(ticks[i - 1]!);
    }
  });

  it("handles negative values", () => {
    const ticks = calculateNiceTicks(-100, 0, 5);
    expect(ticks[0]).toBeLessThanOrEqual(-100);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(0);
    for (let i = 1; i < ticks.length; i++) {
      expect(ticks[i]).toBeGreaterThan(ticks[i - 1]!);
    }
  });

  it("handles a range spanning negative to positive", () => {
    const ticks = calculateNiceTicks(-50, 50, 5);
    expect(ticks[0]).toBeLessThanOrEqual(-50);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(50);
    expect(ticks).toContain(0);
  });

  it("uses default count of 5 when count is omitted", () => {
    const ticks = calculateNiceTicks(0, 100);
    expect(ticks.length).toBeGreaterThanOrEqual(2);
  });
});

describe("getGridDasharray", () => {
  it('returns "none" for solid', () => {
    expect(getGridDasharray("solid")).toBe("none");
  });

  it('returns "4 4" for dashed', () => {
    expect(getGridDasharray("dashed")).toBe("4 4");
  });

  it('returns "2 4" for dotted', () => {
    expect(getGridDasharray("dotted")).toBe("2 4");
  });
});
