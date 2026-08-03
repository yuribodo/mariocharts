import { chartSeries } from "./design-tokens";

describe("chartSeries", () => {
  it("provides six named series in a stable order", () => {
    expect(Object.keys(chartSeries)).toEqual([
      "blue",
      "green",
      "amber",
      "coral",
      "violet",
      "cyan",
    ]);
  });

  it("uses unique CSS variable references", () => {
    const values = Object.values(chartSeries);

    expect(new Set(values).size).toBe(values.length);
    expect(values.every((value) => value.startsWith("var(--chart-"))).toBe(
      true,
    );
  });
});
