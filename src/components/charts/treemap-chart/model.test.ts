import { buildTreeModel } from "./model";
import {
  tileTree,
  layoutTree,
  type TreeMapLayout,
  type TreeMapNode,
} from "./layout";
it.each<TreeMapLayout>(["squarified", "binary", "slice-dice"])(
  "%s preserves exact allocated areas, containment and nonoverlap",
  (layout) => {
    const values = [60, 30, 9, 1, 0],
      box = { x: 13, y: 21, width: 600, height: 340 };
    const rectangles = tileTree(values, box, layout);
    rectangles.forEach((r, i) => {
      expect(r.width * r.height).toBeCloseTo(
        (values[i]! / 100) * box.width * box.height,
        6,
      );
      expect(r.x).toBeGreaterThanOrEqual(box.x);
      expect(r.y).toBeGreaterThanOrEqual(box.y);
      expect(r.x + r.width).toBeLessThanOrEqual(box.x + box.width + 1e-8);
      expect(r.y + r.height).toBeLessThanOrEqual(box.y + box.height + 1e-8);
      for (let j = 0; j < i; j++) {
        const other = rectangles[j]!;
        const overlap =
          Math.max(
            0,
            Math.min(r.x + r.width, other.x + other.width) -
              Math.max(r.x, other.x),
          ) *
          Math.max(
            0,
            Math.min(r.y + r.height, other.y + other.height) -
              Math.max(r.y, other.y),
          );
        expect(overlap).toBeCloseTo(0, 6);
      }
    });
    expect(
      tileTree(
        values.map((v) => v * 1e200),
        box,
        layout,
      ),
    ).toEqual(rectangles);
  },
);
it("squarifies equal weights into squares rather than skinny strips", () => {
  const rects = tileTree([1, 1, 1, 1], { x: 0, y: 0, width: 400, height: 400 });
  rects.forEach((r) => {
    expect(r.width).toBeCloseTo(200);
    expect(r.height).toBeCloseTo(200);
  });
});
it("validates leaves, cycles, empty groups and overflowing totals", () => {
  for (const value of [-1, NaN, Infinity, undefined])
    expect(
      buildTreeModel([{ name: "Bad", value } as TreeMapNode]).error,
    ).toMatch(/finite nonnegative/);
  expect(buildTreeModel([{ name: "Empty", children: [] }]).error).toBeNull();
  const cycle: { name: string; children: TreeMapNode[] } = {
    name: "Cycle",
    children: [],
  };
  cycle.children.push(cycle);
  expect(buildTreeModel([cycle]).error).toMatch(/hierarchy cycle/);
  expect(
    buildTreeModel([
      { name: "A", value: Number.MAX_VALUE },
      { name: "B", value: Number.MAX_VALUE },
    ]).error,
  ).toMatch(/Rescale/);
});
it("preserves original nodes and duplicate paths while deriving parent totals", () => {
  const data = [
    {
      name: "Group",
      value: 999,
      children: [
        { name: "Other", value: 30 },
        { name: "Other", value: 10 },
      ],
    },
    { name: "Group", value: 60 },
  ];
  const model = buildTreeModel(data);
  expect(model.total).toBe(100);
  expect(model.roots[0]!.value).toBe(40);
  expect(model.byKey.get("0.0")).toMatchObject({
    value: 30,
    percentage: 30,
    parentPercentage: 75,
    indexPath: [0, 0],
  });
  expect(model.byKey.get("0.0")!.node).toBe(data[0]!.children![0]);
  expect(model.byKey.get("0.1")!.path).toEqual(model.byKey.get("0.0")!.path);
  expect(model.byKey.get("0.1")!.key).not.toBe(model.byKey.get("0.0")!.key);
});
it("keeps stable branch colors and applies node overrides to descendants", () => {
  const model = buildTreeModel(
    [
      { name: "A", color: "gold", children: [{ name: "AA", value: 1 }] },
      { name: "B", children: [{ name: "BB", value: 2 }] },
    ],
    ["blue", "purple"],
  );
  expect(model.byKey.get("0.0")!.color).toBe("gold");
  expect(model.byKey.get("1.0")!.color).toBe("purple");
});
it("uses global leaf allocations in flat mode and reserves headers in nested mode", () => {
  const model = buildTreeModel([
    {
      name: "A",
      children: [
        { name: "AA", value: 60 },
        { name: "AB", value: 20 },
      ],
    },
    { name: "B", value: 20 },
  ]);
  const flat = layoutTree(model.roots, 500, 300, { variant: "flat", gap: 0 });
  expect(flat).toHaveLength(3);
  expect(
    flat.find((t) => t.entry.key === "0.0")!.width *
      flat.find((t) => t.entry.key === "0.0")!.height,
  ).toBeCloseTo(90000);
  const nested = layoutTree(model.roots, 500, 300);
  const parent = nested.find((t) => t.entry.key === "0")!,
    child = nested.find((t) => t.entry.key === "0.0")!;
  expect(parent.expanded).toBe(true);
  expect(child.y).toBeGreaterThanOrEqual(parent.y + parent.headerHeight);
  expect(layoutTree(model.roots, 500, 300, { maxDepth: 1 })).toHaveLength(2);
});
it("retains zero observations in the model without allocating any tiles", () => {
  const model = buildTreeModel([
    { name: "A", value: 0 },
    { name: "B", value: 0 },
  ]);
  expect(model.entries).toHaveLength(2);
  expect(model.entries[0]!.percentage).toBeNull();
  expect(layoutTree(model.roots, 500, 300)).toEqual([]);
});
