import { renderChart } from "./ascii-chart";
import { HERO_CHART_VALUES } from "../components/landing/hero/hero-chart-data";

const OPTIONS = { columns: 64, rows: 16 } as const;

describe("renderChart", () => {
  it("fills the requested grid exactly", () => {
    const art = renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "area" });
    const lines = art.split("\n");

    expect(lines).toHaveLength(OPTIONS.rows);
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(OPTIONS.columns);
    }
  });

  it("puts high values higher up the field than low ones", () => {
    // The dataset rises overall, so the last column must have ink further up
    // than the first. This is the assertion that fails if the y axis is
    // inverted — the single most likely way to get a plausible-looking but
    // wrong chart.
    const lines = renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "bars" })
      .split("\n");
    const topmostInk = (column: number) =>
      lines.findIndex((line) => (line[column] ?? " ") !== " ");

    const first = topmostInk(0);
    const last = topmostInk(OPTIONS.columns - 1);

    expect(first).toBeGreaterThan(-1);
    expect(last).toBeGreaterThan(-1);
    expect(last).toBeLessThan(first);
  });

  it("draws each form differently", () => {
    const area = renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "area" });
    const bars = renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "bars" });
    const line = renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "line" });

    expect(new Set([area, bars, line]).size).toBe(3);
  });

  it("draws less ink for a line than for an area", () => {
    const ink = (art: string) => art.replace(/[\s\n]/g, "").length;

    expect(ink(renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "line" })))
      .toBeLessThan(
        ink(renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "area" })),
      );
  });

  it("is deterministic", () => {
    const once = renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "area" });
    const twice = renderChart(HERO_CHART_VALUES, { ...OPTIONS, form: "area" });

    expect(once).toBe(twice);
  });

  it("matches the committed art", async () => {
    const { HERO_CHART_FORMS, HERO_CHART_COLUMNS } = await import(
      "../components/landing/hero/hero-chart"
    );

    expect(HERO_CHART_FORMS).toHaveLength(3);
    expect(HERO_CHART_FORMS[0]).toBe(
      renderChart(HERO_CHART_VALUES, {
        columns: HERO_CHART_COLUMNS,
        rows: HERO_CHART_FORMS[0]!.split("\n").length,
        form: "area",
      }),
    );
  });
});
