export interface HeatRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
/** Iterative squarified strips. Zero weights receive zero area; no invented pixel minima. */
export function layoutHeatStock(
  weights: readonly number[],
  width: number,
  height: number,
): HeatRect[] {
  const result = weights.map(() => ({ x: 0, y: 0, width: 0, height: 0 }));
  let max = 0;
  for (const w of weights) max = Math.max(max, w);
  if (!max || width <= 0 || height <= 0) return result;
  const scaled = weights.map((w) => w / max),
    total = scaled.reduce((a, b) => a + b, 0);
  const items = scaled
    .map((value, index) => ({ index, area: (value / total) * width * height }))
    .filter((item) => item.area > 0)
    .sort((a, b) => b.area - a.area || a.index - b.index);
  let x = 0,
    y = 0,
    w = width,
    h = height,
    cursor = 0;
  const worst = (sum: number, low: number, high: number, side: number) =>
    Math.max(
      (side * side * high) / (sum * sum),
      (sum * sum) / (side * side * low),
    );
  while (cursor < items.length && w > 0 && h > 0) {
    const start = cursor,
      side = Math.min(w, h);
    let sum = items[cursor]!.area,
      low = sum,
      high = sum;
    cursor++;
    while (cursor < items.length) {
      const area = items[cursor]!.area;
      const next = sum + area;
      if (
        worst(next, Math.min(low, area), Math.max(high, area), side) >
        worst(sum, low, high, side)
      )
        break;
      sum = next;
      low = Math.min(low, area);
      high = Math.max(high, area);
      cursor++;
    }
    const vertical = w >= h;
    const thickness =
      cursor === items.length
        ? vertical
          ? w
          : h
        : Math.min(vertical ? w : h, sum / side);
    let offset = 0;
    for (let i = start; i < cursor; i++) {
      const item = items[i]!;
      const length =
        i === cursor - 1
          ? side - offset
          : Math.min(side - offset, (item.area / sum) * side);
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
export function insetHeatRect(rect: HeatRect, gap = 1) {
  const gx = Math.min(gap, rect.width / 4),
    gy = Math.min(gap, rect.height / 4);
  return {
    x: rect.x + gx,
    y: rect.y + gy,
    width: Math.max(0, rect.width - gx * 2),
    height: Math.max(0, rect.height - gy * 2),
  };
}
export function heatRectPath(rect: HeatRect, radius: number) {
  const { x, y, width: w, height: h } = rect;
  if (!w || !h) return "";
  const r = Math.min(radius, w / 2, h / 2);
  return `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
}
export function heatPolar(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}
/** Splitting each circular edge handles single-column full rings without epsilon holes. */
export function heatRingPath(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  start: number,
  end: number,
) {
  if (outer <= inner || inner <= 0 || end <= start) return "";
  const mid = (start + end) / 2;
  const a = heatPolar(cx, cy, outer, start),
    b = heatPolar(cx, cy, outer, mid),
    c = heatPolar(cx, cy, outer, end);
  const d = heatPolar(cx, cy, inner, end),
    e = heatPolar(cx, cy, inner, mid),
    f = heatPolar(cx, cy, inner, start);
  return `M ${a.x} ${a.y} A ${outer} ${outer} 0 0 1 ${b.x} ${b.y} A ${outer} ${outer} 0 0 1 ${c.x} ${c.y} L ${d.x} ${d.y} A ${inner} ${inner} 0 0 0 ${e.x} ${e.y} A ${inner} ${inner} 0 0 0 ${f.x} ${f.y} Z`;
}

/** Grow text with area, then fit both lines before dropping the secondary value. */
export function fitStockLabel(
  width: number,
  height: number,
  title: string,
  value: string,
  measure: (text: string, size: number, bold: boolean) => number,
) {
  const availableWidth = Math.max(0, width - 12);
  const availableHeight = Math.max(0, height - 10);
  const preferred = Math.min(
    30,
    Math.max(12, Math.floor(Math.sqrt(width * height) * 0.15)),
  );
  for (let titleSize = preferred; titleSize >= 10; titleSize--) {
    const valueSize = Math.max(10, Math.floor(titleSize * 0.75));
    if (
      (titleSize === 10 || measure(title, titleSize, true) <= availableWidth) &&
      measure(value, valueSize, false) <= availableWidth &&
      titleSize * 1.15 + valueSize * 1.2 + 2 <= availableHeight
    )
      return { titleSize, valueSize };
  }
  for (let titleSize = preferred; titleSize >= 10; titleSize--) {
    if (
      measure(title, titleSize, true) <= availableWidth &&
      titleSize * 1.15 <= availableHeight
    )
      return { titleSize, valueSize: 0 };
  }
  return { titleSize: 10, valueSize: 0 };
}

/** Black or white provides at least 4.5:1 against any opaque sRGB fill. */
export function stockTextColor(red: number, green: number, blue: number) {
  const linear = (channel: number) => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  const luminance =
    0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
  return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05)
    ? "#000000"
    : "#ffffff";
}
