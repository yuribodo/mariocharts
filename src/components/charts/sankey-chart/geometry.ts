import type { FlowModel } from "./model";
export interface NodeGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
  labelX: number;
  labelY: number;
  labelWidth: number;
  last: boolean;
}
export interface LinkGeometry {
  path: string;
  centerPath: string;
  width: number;
  x: number;
  y: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}
export function layoutSankey<N, L>(
  model: FlowModel<N, L>,
  width: number,
  height: number,
  nodeWidth: number,
  gap: number,
  curvature: number,
  align: "justify" | "start",
) {
  const layers = model.nodes.map((n) =>
    align === "justify" && !n.targets.length && n.sources.length
      ? model.depth
      : n.depth,
  );
  const columns: number[][] = Array.from({ length: model.depth + 1 }, () => []);
  model.nodes.forEach((n, i) => columns[layers[i]!]!.push(n.index));
  const maxValue = model.nodes.reduce(
    (max, node) => Math.max(max, node.value),
    0,
  );
  // Normalize before summing columns to keep very large input values finite.
  const ratios = model.nodes.map((n) => (maxValue ? n.value / maxValue : 0));
  const long = model.links.filter(
    (l) => layers[l.target]! - layers[l.source]! > 1 && l.value > 0,
  );
  const longTotal = long.reduce((sum, l) => sum + l.value / maxValue, 0);
  const maxCount = columns.reduce((max, c) => Math.max(max, c.length), 1);
  const w = Math.max(
    width,
    nodeWidth + 178,
    model.depth * (260 + nodeWidth) + nodeWidth + 48,
  );
  const h = Math.max(height, 48 + maxCount * (48 + gap) + long.length * 12);
  const reserved = maxCount * 40 + Math.max(0, maxCount - 1) * gap;
  const available = Math.max(0, h - 48 - reserved - long.length * 12);
  const totals = columns.map((c) => c.reduce((sum, i) => sum + ratios[i]!, 0));
  const largest = totals.reduce((max, n) => Math.max(max, n), 0);
  const scale = largest + longTotal ? available / (largest + longTotal) : 0;
  const laneHeight = longTotal * scale + long.length * 12;
  const plotBottom = h - 24 - laneHeight;
  const nodes: NodeGeometry[] = Array(model.nodes.length);
  for (const [layer, column] of columns.entries()) {
    const used =
      totals[layer]! * scale +
      column.length * 40 +
      Math.max(0, column.length - 1) * gap;
    let y = 24 + (plotBottom - 24 - used) / 2;
    for (const index of column) {
      const nodeHeight = ratios[index]! * scale;
      const x = model.depth
        ? 24 + (layer * (w - 48 - nodeWidth)) / model.depth
        : 24;
      const last = model.depth > 0 && layer === model.depth;
      nodes[index] = {
        x,
        y: y + 20,
        width: nodeWidth,
        height: nodeHeight,
        layer,
        last,
        labelX: last ? x - 130 : x + nodeWidth + 10,
        labelY: y + 20 + nodeHeight / 2 - 19,
        labelWidth: 120,
      };
      y += nodeHeight + 40 + gap;
    }
  }
  const outgoing = new Map<number, number>(),
    incoming = new Map<number, number>();
  // Order attachment bands by the opposite node position, so a simple split/merge cannot cross itself.
  for (const node of model.nodes) {
    const g = nodes[node.index]!;
    for (const [indices, map, isSource, total] of [
      [node.targets, outgoing, true, node.outgoing],
      [node.sources, incoming, false, node.incoming],
    ] as const) {
      let offset =
        g.y + (g.height - (maxValue ? (total / maxValue) * scale : 0)) / 2;
      for (const index of [...indices].sort((a, b) => {
        const left = model.links[a]!,
          right = model.links[b]!;
        return (
          nodes[isSource ? left.target : left.source]!.y -
            nodes[isSource ? right.target : right.source]!.y || a - b
        );
      })) {
        map.set(index, offset);
        offset += maxValue ? (model.links[index]!.value / maxValue) * scale : 0;
      }
    }
  }
  let lane = plotBottom + 12;
  const links = model.links.map((edge): LinkGeometry => {
    const source = nodes[edge.source]!,
      target = nodes[edge.target]!;
    const thickness = maxValue ? (edge.value / maxValue) * scale : 0;
    const x0 = source.x + nodeWidth,
      x1 = target.x;
    const y0 = outgoing.get(edge.index)!,
      y1 = incoming.get(edge.index)!;
    const skip = target.layer - source.layer > 1 && thickness > 0;
    const laneY = lane;
    if (skip) lane += thickness + 12;
    const line = (offset: number, reverse = false) => {
      const a = y0 + offset,
        b = y1 + offset;
      if (skip) {
        const bend = Math.min(64, (x1 - x0) / 4),
          low = laneY + offset;
        return reverse
          ? `L ${x1} ${b} C ${x1 - bend} ${b} ${x1 - bend} ${low} ${x1 - bend * 2} ${low} H ${x0 + bend * 2} C ${x0 + bend} ${low} ${x0 + bend} ${a} ${x0} ${a}`
          : `M ${x0} ${a} C ${x0 + bend} ${a} ${x0 + bend} ${low} ${x0 + bend * 2} ${low} H ${x1 - bend * 2} C ${x1 - bend} ${low} ${x1 - bend} ${b} ${x1} ${b}`;
      }
      const bend = ((x1 - x0) * curvature) / 2;
      return reverse
        ? `L ${x1} ${b} C ${x1 - bend} ${b} ${x0 + bend} ${a} ${x0} ${a}`
        : `M ${x0} ${a} C ${x0 + bend} ${a} ${x1 - bend} ${b} ${x1} ${b}`;
    };
    return {
      path: thickness ? `${line(0)} ${line(thickness, true)} Z` : "",
      centerPath: line(thickness / 2),
      width: thickness,
      x: (x0 + x1) / 2,
      y: skip ? laneY + thickness / 2 : (y0 + y1 + thickness) / 2,
      x0,
      x1,
      y0,
      y1,
    };
  });
  return { nodes, links, width: w, height: h };
}
