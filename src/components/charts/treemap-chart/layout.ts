import { buildTreeModel, type TreeEntry } from "./model";
export interface TreeMapNode {
  readonly name: string;
  /** Leaves use this value; a group derives its total from children. */
  readonly value?: number;
  readonly children?: readonly TreeMapNode[];
  readonly color?: string;
}
export type TreeMapLayout = "squarified" | "binary" | "slice-dice";
export type TreeMapVariant = "nested" | "flat";
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface LayoutRect extends Rect {
  readonly node: TreeMapNode;
  readonly depth: number;
  readonly colorIndex: number;
  readonly path: readonly string[];
  readonly percentage: number;
}
/** Compatibility helper. Rendering validates the whole hierarchy with actionable errors. */
export function nodeValue(node: TreeMapNode): number {
  const model = buildTreeModel([node]);
  return model.error ? 0 : model.total;
}
/** Tile positive values without gutters. Rectangular area is exactly proportional to value. */
export function tileTree(
  values: readonly number[],
  box: Rect,
  layout: TreeMapLayout = "squarified",
  depth = 0,
  sort: "value" | "input" = "value",
): Rect[] {
  const result = values.map(() => ({
    x: box.x,
    y: box.y,
    width: 0,
    height: 0,
  }));
  const max = values.reduce((m, v) => Math.max(m, v), 0);
  if (
    !(max > 0) ||
    !Number.isFinite(max) ||
    !(box.width > 0) ||
    !(box.height > 0)
  )
    return result;
  const items = values
    .map((v, index) => ({ index, value: v / max }))
    .filter((i) => i.value > 0);
  if (sort === "value")
    items.sort((a, b) => b.value - a.value || a.index - b.index);
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (layout === "slice-dice") {
    let cursor = 0;
    const horizontal = depth % 2 === 0;
    items.forEach((item, i) => {
      const side = horizontal ? box.width : box.height;
      const length =
        i === items.length - 1 ? side - cursor : (item.value / total) * side;
      result[item.index] = horizontal
        ? { x: box.x + cursor, y: box.y, width: length, height: box.height }
        : { x: box.x, y: box.y + cursor, width: box.width, height: length };
      cursor += length;
    });
    return result;
  }
  if (layout === "binary") {
    const prefix = [0];
    items.forEach((item) =>
      prefix.push(prefix[prefix.length - 1]! + item.value),
    );
    const stack = [{ from: 0, to: items.length, box }];
    while (stack.length) {
      const task = stack.pop()!;
      if (task.to - task.from === 1) {
        result[items[task.from]!.index] = task.box;
        continue;
      }
      const sum = prefix[task.to]! - prefix[task.from]!,
        half = prefix[task.from]! + sum / 2;
      let low = task.from + 1,
        high = task.to - 1;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (prefix[mid]! < half) low = mid + 1;
        else high = mid;
      }
      let split = low;
      if (
        split > task.from + 1 &&
        Math.abs(prefix[split - 1]! - half) < Math.abs(prefix[split]! - half)
      )
        split--;
      const ratio = sum
        ? (prefix[split]! - prefix[task.from]!) / sum
        : (split - task.from) / (task.to - task.from);
      const b = task.box,
        horizontal = b.width >= b.height;
      const first = horizontal
        ? { ...b, width: b.width * ratio }
        : { ...b, height: b.height * ratio };
      const second = horizontal
        ? {
            ...b,
            x: b.x + first.width,
            width: Math.max(0, b.width - first.width),
          }
        : {
            ...b,
            y: b.y + first.height,
            height: Math.max(0, b.height - first.height),
          };
      stack.push(
        { from: split, to: task.to, box: second },
        { from: task.from, to: split, box: first },
      );
    }
    return result;
  }
  const areas = items.map((item) => ({
    index: item.index,
    area: (item.value / total) * box.width * box.height,
  }));
  let { x, y, width: w, height: h } = box;
  let cursor = 0;
  const worst = (sum: number, low: number, high: number, side: number) =>
    Math.max(
      (side * side * high) / (sum * sum),
      (sum * sum) / (side * side * low),
    );
  while (cursor < areas.length && w > 0 && h > 0) {
    const start = cursor,
      side = Math.min(w, h);
    let sum = areas[cursor]!.area,
      low = sum,
      high = sum;
    cursor++;
    while (cursor < areas.length) {
      const a = areas[cursor]!.area;
      if (
        worst(sum + a, Math.min(low, a), Math.max(high, a), side) >
        worst(sum, low, high, side)
      )
        break;
      sum += a;
      low = Math.min(low, a);
      high = Math.max(high, a);
      cursor++;
    }
    const vertical = w >= h;
    const thickness =
      cursor === areas.length
        ? vertical
          ? w
          : h
        : Math.min(vertical ? w : h, sum / side);
    let offset = 0;
    for (let i = start; i < cursor; i++) {
      const item = areas[i]!,
        length =
          i === cursor - 1
            ? Math.max(0, side - offset)
            : Math.min(Math.max(0, side - offset), (item.area / sum) * side);
      result[item.index] = vertical
        ? { x, y: y + offset, width: thickness, height: length }
        : { x: x + offset, y, width: length, height: thickness };
      offset += length;
    }
    if (vertical) {
      x += thickness;
      w = Math.max(0, w - thickness);
    } else {
      y += thickness;
      h = Math.max(0, h - thickness);
    }
  }
  return result;
}
export interface TreeTile extends Rect {
  entry: TreeEntry;
  group: boolean;
  expanded: boolean;
  headerHeight: number;
  allocation: Rect;
}
export function layoutTree(
  entries: readonly TreeEntry[],
  width: number,
  height: number,
  {
    layout = "squarified",
    variant = "nested",
    sort = "value",
    gap = 3,
    maxDepth = 2,
  }: {
    layout?: TreeMapLayout;
    variant?: TreeMapVariant;
    sort?: "value" | "input";
    gap?: number;
    maxDepth?: number;
  } = {},
) {
  const result: TreeTile[] = [];
  function place(items: readonly TreeEntry[], box: Rect, depth: number) {
    const boxes = tileTree(
      items.map((item) => item.value),
      box,
      layout,
      depth,
      sort,
    );
    items.forEach((entry, i) => {
      const allocation = boxes[i]!;
      if (allocation.width <= 0 || allocation.height <= 0) return;
      // Gutters are capped relative to a tile, but do not manufacture a minimum area.
      const inset = Math.min(
        gap / 2,
        allocation.width / 4,
        allocation.height / 4,
      );
      const rect = {
        x: allocation.x + inset,
        y: allocation.y + inset,
        width: Math.max(0, allocation.width - 2 * inset),
        height: Math.max(0, allocation.height - 2 * inset),
      };
      const group = entry.children.length > 0;
      const expanded =
        variant === "nested" &&
        group &&
        depth + 1 < maxDepth &&
        rect.width >= 90 &&
        rect.height >= 80;
      const headerHeight = expanded ? 28 : 0;
      result.push({
        ...rect,
        entry,
        group,
        expanded,
        headerHeight,
        allocation,
      });
      if (expanded)
        place(
          entry.children,
          {
            x: rect.x + 3,
            y: rect.y + headerHeight,
            width: Math.max(0, rect.width - 6),
            height: Math.max(0, rect.height - headerHeight - 3),
          },
          depth + 1,
        );
    });
  }
  const leaves = (items: readonly TreeEntry[]): TreeEntry[] =>
    items.flatMap((entry) =>
      entry.children.length ? leaves(entry.children) : [entry],
    );
  place(
    variant === "flat" ? leaves(entries) : entries,
    { x: 0, y: 0, width, height },
    0,
  );
  return result;
}
/** Compatibility layout helper: returns visible leaves, with original node/path metadata. */
export function computeTreeMapLayout(
  data: readonly TreeMapNode[],
  width: number,
  height: number,
): readonly LayoutRect[] {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  )
    return [];
  const model = buildTreeModel(data);
  if (model.error) return [];
  return layoutTree(model.roots, width, height, { maxDepth: 64 })
    .filter((tile) => !tile.expanded)
    .map((tile) => ({
      ...tile,
      node: tile.entry.node,
      depth: tile.entry.depth,
      colorIndex: tile.entry.colorIndex,
      path: tile.entry.path,
      percentage: tile.entry.percentage ?? 0,
    }));
}
