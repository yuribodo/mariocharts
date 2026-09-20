import type { SankeyNode, SankeyLink } from "./types";
export const SANKEY_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
] as const;
export interface FlowNode<N> {
  data: N;
  index: number;
  label: string;
  color: string;
  incoming: number;
  outgoing: number;
  value: number;
  depth: number;
  sources: number[];
  targets: number[];
}
export interface FlowLink<L> {
  data: L;
  index: number;
  source: number;
  target: number;
  value: number;
}
export interface FlowModel<N, L> {
  nodes: FlowNode<N>[];
  links: FlowLink<L>[];
  depth: number;
  error: string | null;
}
export function buildSankey<N extends SankeyNode, L extends SankeyLink>(
  nodes: readonly N[],
  links: readonly L[],
  colors: readonly string[] = SANKEY_COLORS,
): FlowModel<N, L> {
  const fail = (error: string): FlowModel<N, L> => ({
    nodes: [],
    links: [],
    depth: 0,
    error,
  });
  if (colors.some((c) => typeof c !== "string" || !c.trim()))
    return fail("colors must contain nonempty CSS colors.");
  const palette = colors.length ? colors : SANKEY_COLORS;
  const ids = new Map<string, number>();
  for (const [index, node] of nodes.entries()) {
    if (typeof node.id !== "string" || !node.id.trim())
      return fail(`Node ${index + 1}: provide a nonempty string id.`);
    if (ids.has(node.id))
      return fail(
        `Duplicate node id "${node.id}". Give each occurrence its own ID.`,
      );
    if (typeof node.label !== "string" || !node.label.trim())
      return fail(`Node "${node.id}": provide a nonempty label.`);
    if (
      node.color !== undefined &&
      (typeof node.color !== "string" || !node.color.trim())
    )
      return fail(`Node "${node.id}": color must be a nonempty CSS color.`);
    ids.set(node.id, index);
  }
  const result: FlowNode<N>[] = nodes.map((node, index) => ({
    data: node,
    index,
    label: node.label,
    color: node.color ?? palette[index % palette.length]!,
    incoming: 0,
    outgoing: 0,
    value: 0,
    depth: 0,
    sources: [],
    targets: [],
  }));
  const edges: FlowLink<L>[] = [];
  for (const [index, link] of links.entries()) {
    const source = ids.get(link.source),
      target = ids.get(link.target);
    if (source === undefined || target === undefined)
      return fail(
        `Link ${index + 1}: source "${link.source}" and target "${link.target}" must reference existing node IDs.`,
      );
    if (
      typeof link.value !== "number" ||
      !Number.isFinite(link.value) ||
      link.value < 0
    )
      return fail(
        `Link ${index + 1}: value must be a finite nonnegative number.`,
      );
    if (source === target)
      return fail(
        `Link ${index + 1}: self-links are cycles. Use separate IDs for repeated steps.`,
      );
    result[source]!.outgoing += link.value;
    result[target]!.incoming += link.value;
    if (
      !Number.isFinite(result[source]!.outgoing) ||
      !Number.isFinite(result[target]!.incoming)
    )
      return fail(
        `Link ${index + 1}: node totals exceed the numeric range. Rescale all link values to a consistent unit.`,
      );
    result[source]!.targets.push(index);
    result[target]!.sources.push(index);
    edges.push({ data: link, index, source, target, value: link.value });
  }
  const pending = result.map((n) => n.sources.length);
  const queue = result.filter((n) => !n.sources.length).map((n) => n.index);
  let depth = 0;
  for (let head = 0; head < queue.length; head++) {
    const node = result[queue[head]!]!;
    for (const edge of node.targets) {
      const target = result[edges[edge]!.target]!;
      target.depth = Math.max(target.depth, node.depth + 1);
      depth = Math.max(depth, target.depth);
      pending[target.index]!--;
      if (!pending[target.index]) queue.push(target.index);
    }
  }
  if (queue.length !== nodes.length)
    return fail(
      "Sankey requires an acyclic graph. Represent a return visit with a new node ID at a later step.",
    );
  for (const node of result)
    node.value = Math.max(node.incoming, node.outgoing);
  return { nodes: result, links: edges, depth, error: null };
}
/** Ancestors and descendants, without inventing individual journeys through merges. */
export function connectedFlow<N, L>(
  model: FlowModel<N, L>,
  kind: "node" | "link",
  index: number,
) {
  const nodes = new Set<number>(),
    links = new Set<number>();
  const edge = kind === "link" ? model.links[index] : undefined;
  const walk = (start: number, upstream: boolean) => {
    const seen = new Set<number>(),
      queue = [start];
    for (let head = 0; head < queue.length; head++) {
      const at = queue[head]!;
      if (seen.has(at)) continue;
      seen.add(at);
      nodes.add(at);
      for (const i of upstream
        ? model.nodes[at]!.sources
        : model.nodes[at]!.targets) {
        const link = model.links[i]!;
        if (!link.value) continue;
        links.add(i);
        queue.push(upstream ? link.source : link.target);
      }
    }
  };
  if (edge) {
    links.add(index);
    walk(edge.source, true);
    walk(edge.target, false);
  } else if (model.nodes[index]) {
    walk(index, true);
    walk(index, false);
  }
  return { nodes, links };
}
