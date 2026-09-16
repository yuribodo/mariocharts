import type { TreeMapNode } from "./layout";
export const DEFAULT_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
] as const;
export interface TreeEntry {
  node: TreeMapNode;
  key: string;
  path: readonly string[];
  indexPath: readonly number[];
  value: number;
  depth: number;
  colorIndex: number;
  color: string;
  children: TreeEntry[];
  percentage: number | null;
  parentPercentage: number | null;
}
export function buildTreeModel(
  data: readonly TreeMapNode[],
  colors: readonly string[] = DEFAULT_COLORS,
) {
  let error: string | null = null;
  const entries: TreeEntry[] = [];
  const ancestry = new Set<TreeMapNode>();
  const palette = colors.length ? colors : DEFAULT_COLORS;
  if (palette.some((c) => typeof c !== "string" || !c.trim()))
    error = "colors must contain nonempty CSS colors.";
  function visit(
    node: TreeMapNode,
    indexPath: number[],
    path: string[],
    colorIndex: number,
    inherited: string,
  ): TreeEntry | null {
    const location = `Node ${indexPath.map((i) => i + 1).join(".")}`;
    if (!node || typeof node !== "object") {
      error ??= `${location}: provide a node object.`;
      return null;
    }
    if (ancestry.has(node)) {
      error ??= `${location}: a node cannot contain itself. Remove the hierarchy cycle.`;
      return null;
    }
    if (indexPath.length > 64) {
      error ??= `${location}: hierarchy exceeds 64 levels. Provide a shallower view.`;
      return null;
    }
    if (typeof node.name !== "string" || !node.name.trim())
      error ??= `${location}: provide a nonempty name.`;
    if (node.children !== undefined && !Array.isArray(node.children)) {
      error ??= `${location}: children must be an array.`;
      return null;
    }
    if (
      node.color !== undefined &&
      (typeof node.color !== "string" || !node.color.trim())
    )
      error ??= `${location}: color must be a nonempty CSS color.`;
    const color = node.color ?? inherited;
    const entry: TreeEntry = {
      node,
      key: indexPath.join("."),
      indexPath,
      path: [...path, node.name],
      depth: indexPath.length - 1,
      colorIndex,
      color,
      value: 0,
      children: [],
      percentage: null,
      parentPercentage: null,
    };
    entries.push(entry);
    ancestry.add(node);
    entry.children = (node.children ?? [])
      .map((child, index) =>
        visit(
          child,
          [...indexPath, index],
          entry.path as string[],
          colorIndex,
          color,
        ),
      )
      .filter((item): item is TreeEntry => item !== null);
    ancestry.delete(node);
    if (entry.children.length)
      entry.value = entry.children.reduce((sum, child) => sum + child.value, 0);
    else if (node.value === undefined && node.children?.length === 0)
      entry.value = 0;
    else if (
      typeof node.value !== "number" ||
      !Number.isFinite(node.value) ||
      node.value < 0
    )
      error ??= `${location} (${node.name}): value must be a finite nonnegative number. Supply the missing count or correct it.`;
    else entry.value = node.value;
    if (!Number.isFinite(entry.value))
      error ??= `${location}: total exceeds the numeric range. Rescale all values to a consistent unit.`;
    return entry;
  }
  const roots = data
    .map((node, i) => visit(node, [i], [], i, palette[i % palette.length]!))
    .filter((item): item is TreeEntry => item !== null);
  const total = roots.reduce((sum, node) => sum + node.value, 0);
  if (!Number.isFinite(total))
    error ??=
      "Hierarchy total exceeds the numeric range. Rescale all values to a consistent unit.";
  const byKey = new Map(entries.map((entry) => [entry.key, entry]));
  for (const entry of entries) {
    entry.percentage =
      total > 0 && Number.isFinite(total) ? (entry.value / total) * 100 : null;
    const parent =
      entry.indexPath.length > 1
        ? byKey.get(entry.indexPath.slice(0, -1).join("."))!.value
        : total;
    entry.parentPercentage =
      parent > 0 && Number.isFinite(parent)
        ? (entry.value / parent) * 100
        : null;
  }
  return { roots, entries, byKey, total, error };
}
