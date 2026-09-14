import { buildFunnelModel, funnelPercentage, FUNNEL_COLORS } from "./model";
import { layoutFunnel, funnelSlice, type FunnelVariant } from "./geometry";
const model = (values: readonly unknown[]) =>
  buildFunnelModel(
    values.map((v, i) => ({ name: `Step ${i}`, v })),
    "name",
    "v",
    [],
  );
it("preserves order, maximum-relative geometry, and first/previous conversion denominators", () => {
  const result = model([100, 200, 50]);
  expect(result.stages.map((s) => s.ratio)).toEqual([0.5, 1, 0.25]);
  expect(result.stages.map((s) => s.percentage)).toEqual([100, 200, 50]);
  expect(result.stages.map((s) => s.conversionRate)).toEqual([null, 200, 25]);
  expect(result.stages.map((s) => s.change)).toEqual([null, 100, -150]);
  expect(result.hasIncreases).toBe(true);
});
it.each([null, undefined, "", " ", "2px", -1, Infinity, NaN, true])(
  "rejects invalid count %s",
  (value) => {
    expect(model([1, value]).error).toMatch(/Row 2.*finite, nonnegative/);
  },
);
it("accepts numeric strings without losing the original observation", () => {
  const data = [{ name: "A", v: "42" }];
  const stage = buildFunnelModel(data, "name", "v", []).stages[0]!;
  expect(stage.data).toBe(data[0]);
  expect(stage.rawValue).toBe("42");
  expect(stage.value).toBe(42);
  expect(stage.color).toBe(FUNNEL_COLORS[0]);
});
it("handles all zero, empty, and unrepresentable percentages without NaN", () => {
  expect(
    model([0, 0]).stages.map((s) => [s.ratio, s.percentage, s.conversionRate]),
  ).toEqual([
    [0, null, null],
    [0, null, null],
  ]);
  expect(model([]).stages).toEqual([]);
  expect(funnelPercentage(Number.MAX_VALUE, Number.MIN_VALUE)).toBeNull();
});
it("rejects missing labels and empty palette entries", () => {
  expect(buildFunnelModel([{ name: "", v: 2 }], "name", "v", []).error).toMatch(
    /stage label/,
  );
  expect(
    buildFunnelModel([{ name: "A", v: 2 }], "name", "v", [""]).error,
  ).toMatch(/CSS colors/);
});
it.each<FunnelVariant>([
  "tapered",
  "straight",
  "smooth",
  "horizontal",
  "columns",
])("%s keeps zero unpainted and tiny values below 15%%", (variant) => {
  const result = layoutFunnel(
    [1, 0.01, 0],
    600,
    400,
    variant,
    12,
    0,
    false,
    true,
  );
  expect(result.stages[2]!.path).toBe("");
  expect(result.stages[1]!.path).not.toBe("");
  expect(result.stages[1]!.connector).toBe("");
  expect(result.stages.every((s) => !/NaN|Infinity/.test(s.path))).toBe(true);
  if (variant === "columns") {
    const stage = result.stages[1]!;
    expect(stage.origin.y - stage.anchor.y).toBeLessThan(2);
  }
});
it("uses stage entry width and next-stage exit width, with smooth or straight transitions", () => {
  expect(funnelSlice(50, 100, 40, 0, 20, false)).toBe(
    "M 0 0 H 100 L 70 20 H 30 Z",
  );
  expect(funnelSlice(50, 100, 40, 0, 20, true)).toContain(" C ");
  expect(funnelSlice(50, 0, 40, 0, 20, true)).toBe("");
});
it("places previous-stage rates above the current row and reserves space for crowded data", () => {
  const rows = layoutFunnel(
    Array(14).fill(0.5),
    300,
    400,
    "tapered",
    0,
    0,
    true,
    true,
  );
  expect(rows.height).toBeGreaterThan(400);
  expect(rows.stages[0]!.rate).toBeNull();
  expect(rows.stages[1]!.rate!.y).toBeLessThan(rows.stages[1]!.hit.y);
  expect(
    layoutFunnel(
      [1, 0.7, 0.5, 0.3, 0.2],
      300,
      400,
      "columns",
      12,
      4,
      true,
      true,
    ).width,
  ).toBeGreaterThan(300);
});
