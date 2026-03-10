/**
 * Squarified treemap layout algorithm.
 * Based on Bruls, Huizing, van Wijk (2000).
 * Pure functions — no side effects, fully testable.
 */

export interface TreeMapNode {
  readonly name: string;
  readonly value?: number;
  readonly children?: readonly TreeMapNode[];
}

export interface LayoutRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly node: TreeMapNode;
  readonly depth: number;
  readonly colorIndex: number;
  readonly path: readonly string[];
  readonly percentage: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Compute the total value of a node (leaf value or sum of children).
 */
export function nodeValue(node: TreeMapNode): number {
  if (node.children && node.children.length > 0) {
    return node.children.reduce((sum, child) => sum + nodeValue(child), 0);
  }
  return typeof node.value === 'number' && isFinite(node.value) && node.value > 0
    ? node.value
    : 0;
}

/**
 * Compute the aspect ratio of a rectangle.
 * Closer to 1 = more square-like = better.
 */
function aspectRatio(width: number, height: number): number {
  if (width === 0 || height === 0) return Infinity;
  return Math.max(width / height, height / width);
}

/**
 * Worst aspect ratio in a row of items laid out along the short side.
 */
function worstRatio(row: number[], sideLength: number, totalArea: number): number {
  if (row.length === 0 || sideLength <= 0) return Infinity;

  const rowSum = row.reduce((a, b) => a + b, 0);
  if (rowSum <= 0) return Infinity;

  const rowWidth = (rowSum / totalArea) * sideLength;
  let worst = 0;

  for (const area of row) {
    const itemHeight = area / rowWidth;
    const ratio = aspectRatio(rowWidth, itemHeight);
    if (ratio > worst) worst = ratio;
  }

  return worst;
}

/**
 * Layout a single row of items within the remaining rect.
 * Returns the rectangles for each item and the remaining rect.
 */
function layoutRow(
  row: { area: number; index: number }[],
  rect: Rect,
  totalArea: number
): { rects: { x: number; y: number; width: number; height: number; index: number }[]; remaining: Rect } {
  const rowSum = row.reduce((sum, item) => sum + item.area, 0);
  const isHorizontal = rect.width >= rect.height;

  const rects: { x: number; y: number; width: number; height: number; index: number }[] = [];

  if (isHorizontal) {
    const rowWidth = totalArea > 0 ? (rowSum / totalArea) * rect.width : 0;
    let y = rect.y;

    for (const item of row) {
      const itemHeight = rowSum > 0 ? (item.area / rowSum) * rect.height : 0;
      rects.push({ x: rect.x, y, width: rowWidth, height: itemHeight, index: item.index });
      y += itemHeight;
    }

    return {
      rects,
      remaining: {
        x: rect.x + rowWidth,
        y: rect.y,
        width: rect.width - rowWidth,
        height: rect.height,
      },
    };
  } else {
    const rowHeight = totalArea > 0 ? (rowSum / totalArea) * rect.height : 0;
    let x = rect.x;

    for (const item of row) {
      const itemWidth = rowSum > 0 ? (item.area / rowSum) * rect.width : 0;
      rects.push({ x, y: rect.y, width: itemWidth, height: rowHeight, index: item.index });
      x += itemWidth;
    }

    return {
      rects,
      remaining: {
        x: rect.x,
        y: rect.y + rowHeight,
        width: rect.width,
        height: rect.height - rowHeight,
      },
    };
  }
}

/**
 * Squarified treemap: lay out items to minimize worst aspect ratio.
 */
function squarify(
  items: { area: number; index: number }[],
  rect: Rect,
  totalArea: number
): { x: number; y: number; width: number; height: number; index: number }[] {
  if (items.length === 0 || totalArea <= 0) return [];
  if (items.length === 1) {
    const first = items[0]!;
    return [{ x: rect.x, y: rect.y, width: rect.width, height: rect.height, index: first.index }];
  }

  const sideLength = Math.min(rect.width, rect.height);
  const result: { x: number; y: number; width: number; height: number; index: number }[] = [];

  let currentRow: { area: number; index: number }[] = [];
  let remaining = items.slice();

  while (remaining.length > 0) {
    const item = remaining[0]!;
    const testRow = [...currentRow, item];

    const currentWorst = worstRatio(
      currentRow.map(r => r.area),
      sideLength,
      totalArea
    );
    const testWorst = worstRatio(
      testRow.map(r => r.area),
      sideLength,
      totalArea
    );

    if (currentRow.length === 0 || testWorst <= currentWorst) {
      currentRow.push(item);
      remaining = remaining.slice(1);
    } else {
      const { rects, remaining: newRect } = layoutRow(currentRow, rect, totalArea);
      result.push(...rects);

      const remainingArea = remaining.reduce((sum, r) => sum + r.area, 0);
      const innerRects = squarify(remaining, newRect, remainingArea);
      result.push(...innerRects);
      return result;
    }
  }

  if (currentRow.length > 0) {
    const { rects } = layoutRow(currentRow, rect, totalArea);
    result.push(...rects);
  }

  return result;
}

const GAP = 1.5;

/**
 * Compute the full treemap layout from hierarchical data.
 */
export function computeTreeMapLayout(
  data: readonly TreeMapNode[],
  width: number,
  height: number,
): readonly LayoutRect[] {
  if (!data.length || width <= 0 || height <= 0) return [];

  const grandTotal = data.reduce((sum, node) => sum + nodeValue(node), 0);
  if (grandTotal <= 0) return [];

  const result: LayoutRect[] = [];

  function layoutChildren(
    nodes: readonly TreeMapNode[],
    rect: Rect,
    depth: number,
    parentColorIndex: number,
    parentPath: readonly string[],
  ): void {
    const values = nodes.map(node => nodeValue(node));
    const total = values.reduce((a, b) => a + b, 0);
    if (total <= 0) return;

    // Sort descending for better squarification
    const indexed: { node: TreeMapNode; value: number; originalIndex: number }[] = nodes.map((node, i) => ({
      node,
      value: values[i] ?? 0,
      originalIndex: i,
    }));
    indexed.sort((a, b) => b.value - a.value);

    const items: { area: number; index: number }[] = indexed.map((entry, i) => ({
      area: entry.value,
      index: i,
    }));

    const rects = squarify(items, rect, total);

    for (const r of rects) {
      const entry = indexed[r.index]!;
      const colorIdx = depth === 0 ? entry.originalIndex : parentColorIndex;
      const path = [...parentPath, entry.node.name];

      // Apply gap
      const gx = Math.min(GAP, r.width / 4);
      const gy = Math.min(GAP, r.height / 4);
      const gappedRect = {
        x: r.x + gx,
        y: r.y + gy,
        width: Math.max(0, r.width - gx * 2),
        height: Math.max(0, r.height - gy * 2),
      };

      if (entry.node.children && entry.node.children.length > 0 && gappedRect.width > 10 && gappedRect.height > 10) {
        layoutChildren(entry.node.children, gappedRect, depth + 1, colorIdx, path);
      } else {
        result.push({
          ...gappedRect,
          node: entry.node,
          depth,
          colorIndex: colorIdx,
          path,
          percentage: (entry.value / grandTotal) * 100,
        });
      }
    }
  }

  layoutChildren(data, { x: 0, y: 0, width, height }, 0, 0, []);
  return result;
}
