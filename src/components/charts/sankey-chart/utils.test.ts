import { buildSankey, connectedFlow } from "./model";
import { layoutSankey } from "./geometry";
const nodes = ["start", "a", "b", "end"].map((id) => ({ id, label: id }));
const links = [
  { source: "start", target: "a", value: 60 },
  { source: "start", target: "b", value: 40 },
  { source: "a", target: "end", value: 60 },
  { source: "b", target: "end", value: 40 },
];
const layout = (model = buildSankey(nodes, links)) =>
  layoutSankey(model, 800, 400, 18, 24, 0.5, "justify");
it("splits and merges while preserving original identities and input order", () => {
  const model = buildSankey(nodes, links);
  expect(model.error).toBeNull();
  expect(model.nodes.map((n) => n.depth)).toEqual([0, 1, 1, 2]);
  expect(model.nodes.map((n) => n.value)).toEqual([100, 60, 40, 100]);
  expect(model.nodes[3]!.incoming).toBe(100);
  expect(model.nodes[0]!.data).toBe(nodes[0]);
  expect(model.links[2]!.data).toBe(links[2]);
});
it("keeps imbalances observable without silently adding drop-off", () => {
  const model = buildSankey(
    nodes,
    links.map((l, i) => ({ ...l, value: i === 2 ? 45 : l.value })),
  );
  expect(model.nodes[1]).toMatchObject({
    incoming: 60,
    outgoing: 45,
    value: 60,
  });
  expect(model.links).toHaveLength(4);
});
it("uses a single proportional thickness scale across splits and merges", () => {
  const g = layout();
  expect(g.links[0]!.width / g.links[1]!.width).toBeCloseTo(1.5);
  expect(g.links[0]!.width).toBeCloseTo(g.links[2]!.width);
  expect(g.links[0]!.width + g.links[1]!.width).toBeCloseTo(g.nodes[0]!.height);
  expect(g.links[2]!.width + g.links[3]!.width).toBeCloseTo(g.nodes[3]!.height);
  expect(g.links[0]!.y0 + g.links[0]!.width).toBeCloseTo(g.links[1]!.y0);
  expect(g.links[2]!.y1 + g.links[2]!.width).toBeCloseTo(g.links[3]!.y1);
});
it("traces a selected branch without falsely including its sibling", () => {
  const model = buildSankey(nodes, links);
  expect([...connectedFlow(model, "node", 1).links].sort()).toEqual([0, 2]);
  expect([...connectedFlow(model, "link", 0).links].sort()).toEqual([0, 2]);
  expect([...connectedFlow(model, "node", 3).links].sort()).toEqual([
    0, 1, 2, 3,
  ]);
});
it.each([-1, NaN, Infinity])("rejects invalid volume %s", (value) => {
  expect(buildSankey(nodes, [{ ...links[0]!, value }]).error).toMatch(
    /finite nonnegative/,
  );
});
it("rejects dangling endpoints, duplicates, cycles including zero links, and overflow", () => {
  expect(
    buildSankey(nodes, [{ source: "start", target: "missing", value: 1 }])
      .error,
  ).toMatch(/existing node IDs/);
  expect(buildSankey([...nodes, nodes[0]!], links).error).toMatch(
    /Duplicate node id/,
  );
  expect(
    buildSankey(nodes, [...links, { source: "end", target: "start", value: 0 }])
      .error,
  ).toMatch(/acyclic/);
  expect(
    buildSankey(nodes, [{ source: "a", target: "a", value: 1 }]).error,
  ).toMatch(/self-links/);
  expect(
    buildSankey(
      nodes,
      [links[0]!, links[1]!].map((l) => ({ ...l, value: Number.MAX_VALUE })),
    ).error,
  ).toMatch(/Rescale/);
});
it("supports repeated labels with distinct occurrence IDs and parallel observations", () => {
  const result = buildSankey(
    nodes.map((n) => ({ ...n, label: "Page view" })),
    [...links, links[0]!],
  );
  expect(result.error).toBeNull();
  expect(result.links).toHaveLength(5);
});
it("does not inflate zero or tiny volumes", () => {
  const zero = layout(
    buildSankey(
      nodes,
      links.map((l) => ({ ...l, value: 0 })),
    ),
  );
  expect(zero.nodes.every((n) => n.height === 0)).toBe(true);
  expect(zero.links.every((l) => l.path === "" && l.width === 0)).toBe(true);
  const tiny = layout(
    buildSankey(
      nodes,
      links.map((l, i) => ({ ...l, value: i % 2 ? 1 : 999 })),
    ),
  );
  expect(tiny.links[1]!.width / tiny.links[0]!.width).toBeCloseTo(1 / 999);
});
it("routes a direct link below intervening nodes without hiding its volume", () => {
  const g = layout(
    buildSankey(nodes, [
      ...links,
      { source: "start", target: "end", value: 20 },
    ]),
  );
  const direct = g.links[4]!;
  expect(direct.y - direct.width / 2).toBeGreaterThan(
    Math.max(...g.nodes.map((n) => n.y + n.height)),
  );
  expect(direct.width / g.links[0]!.width).toBeCloseTo(1 / 3);
  expect(direct.y + direct.width / 2).toBeLessThan(g.height);
});
it("reserves scrollable width and label space instead of overlapping nodes", () => {
  const model = buildSankey(nodes, links);
  const g = layoutSankey(model, 300, 100, 18, 24, 0, "start");
  expect(g.width).toBeGreaterThan(300);
  expect(g.height).toBeGreaterThan(100);
  expect(g.nodes[2]!.y).toBeGreaterThan(
    g.nodes[1]!.y + g.nodes[1]!.height + 30,
  );
});
it("normalizes extreme finite numbers before computing pixel dimensions", () => {
  const g = layout(
    buildSankey(
      nodes,
      links.map((l) => ({ ...l, value: l.value * 1e304 })),
    ),
  );
  for (const l of g.links) expect(l.path).not.toMatch(/NaN|Infinity/);
});
