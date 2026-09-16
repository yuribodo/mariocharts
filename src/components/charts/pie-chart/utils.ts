import { parseCartesianValue } from "../_shared/cartesian";

export type PieVariant = "pie" | "donut" | "semi";

export function polarPoint(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

/** A complete circle needs two arcs. Zero shares must not leave radial seams. */
export function getSlicePath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  start: number,
  end: number,
  cornerRadius = 0,
) {
  if (outer <= 0 || end <= start) return "";
  const a = polarPoint(cx, cy, outer, start);
  const b = polarPoint(cx, cy, outer, end);
  const c = polarPoint(cx, cy, inner, end);
  const d = polarPoint(cx, cy, inner, start);
  const full = end - start >= 360;
  const large = end - start > 180 ? 1 : 0;
  if (full) {
    const opposite = polarPoint(cx, cy, outer, start + 180);
    const innerOpposite = polarPoint(cx, cy, inner, start + 180);
    return inner > 0
      ? `M ${a.x} ${a.y} A ${outer} ${outer} 0 0 1 ${opposite.x} ${opposite.y} A ${outer} ${outer} 0 0 1 ${a.x} ${a.y} Z M ${d.x} ${d.y} A ${inner} ${inner} 0 0 0 ${innerOpposite.x} ${innerOpposite.y} A ${inner} ${inner} 0 0 0 ${d.x} ${d.y} Z`
      : `M ${a.x} ${a.y} A ${outer} ${outer} 0 0 1 ${opposite.x} ${opposite.y} A ${outer} ${outer} 0 0 1 ${a.x} ${a.y} Z`;
  }
  // Tangent circles round each radial edge without changing the slice angles.
  // Narrow sectors and thin rings limit the radius before corners can overlap.
  const sinHalf = Math.sin((Math.min(end - start, 180) * Math.PI) / 360);
  const radius = Math.min(
    Math.max(0, cornerRadius),
    (outer - inner) / 2,
    (outer * sinHalf) / (1 + sinHalf),
    inner > 0 && sinHalf < 1 ? (inner * sinHalf) / (1 - sinHalf) : Infinity,
  );
  if (radius > 0) {
    const outerOffset = (Math.asin(radius / (outer - radius)) * 180) / Math.PI;
    const outerTangent = Math.sqrt(outer * (outer - 2 * radius));
    const radialStart = polarPoint(cx, cy, outerTangent, start);
    const outerStart = polarPoint(cx, cy, outer, start + outerOffset);
    const outerEnd = polarPoint(cx, cy, outer, end - outerOffset);
    const radialEnd = polarPoint(cx, cy, outerTangent, end);
    const roundedOuter = `M ${radialStart.x} ${radialStart.y} A ${radius} ${radius} 0 0 1 ${outerStart.x} ${outerStart.y} A ${outer} ${outer} 0 ${end - start - 2 * outerOffset > 180 ? 1 : 0} 1 ${outerEnd.x} ${outerEnd.y} A ${radius} ${radius} 0 0 1 ${radialEnd.x} ${radialEnd.y}`;
    if (inner <= 0) return `${roundedOuter} L ${cx} ${cy} Z`;
    const innerOffset = (Math.asin(radius / (inner + radius)) * 180) / Math.PI;
    const innerTangent = Math.sqrt(inner * (inner + 2 * radius));
    const innerRadialEnd = polarPoint(cx, cy, innerTangent, end);
    const innerEnd = polarPoint(cx, cy, inner, end - innerOffset);
    const innerStart = polarPoint(cx, cy, inner, start + innerOffset);
    const innerRadialStart = polarPoint(cx, cy, innerTangent, start);
    return `${roundedOuter} L ${innerRadialEnd.x} ${innerRadialEnd.y} A ${radius} ${radius} 0 0 1 ${innerEnd.x} ${innerEnd.y} A ${inner} ${inner} 0 ${end - start - 2 * innerOffset > 180 ? 1 : 0} 0 ${innerStart.x} ${innerStart.y} A ${radius} ${radius} 0 0 1 ${innerRadialStart.x} ${innerRadialStart.y} Z`;
  }
  return inner > 0
    ? `M ${a.x} ${a.y} A ${outer} ${outer} 0 ${large} 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${inner} ${inner} 0 ${large} 0 ${d.x} ${d.y} Z`
    : `M ${cx} ${cy} L ${a.x} ${a.y} A ${outer} ${outer} 0 ${large} 1 ${b.x} ${b.y} Z`;
}

export function getPieLayout(
  width: number,
  height: number,
  variant: PieVariant,
  innerRadius: number,
) {
  const semi = variant === "semi";
  const outer = Math.max(
    0,
    Math.min((width - 40) / 2, semi ? height - 40 : (height - 40) / 2),
  );
  return {
    cx: width / 2,
    cy: semi ? (height + outer) / 2 : height / 2,
    outer,
    inner: variant === "pie" ? 0 : outer * innerRadius,
  };
}

export function buildPieModel<T extends Record<string, unknown>>(
  data: readonly T[],
  valueKey: keyof T,
  labelKey: keyof T,
  variant: PieVariant,
) {
  let error: string | null = null;
  let largest = 0;
  const rows = data.map((row, index) => {
    const value = parseCartesianValue(row[valueKey]);
    if (value === null)
      error ??= `Row ${index + 1}: "${String(valueKey)}" must contain a finite, nonnegative number. Normalize missing or malformed values before rendering.`;
    else if (value < 0)
      error ??=
        "Pie charts cannot display negative values. Use a bar chart for signed values.";
    if (row[labelKey] === null || row[labelKey] === undefined)
      error ??= `Row ${index + 1}: category "${String(labelKey)}" is missing. Check the label key.`;
    largest = Math.max(largest, value ?? 0);
    return {
      data: row,
      index,
      value: value ?? 0,
      label: String(row[labelKey] ?? ""),
    };
  });
  // Normalize before summing so small finite observations remain meaningful.
  const normalizedTotal =
    largest > 0 ? rows.reduce((sum, row) => sum + row.value / largest, 0) : 0;
  const total = normalizedTotal * largest;
  if (!Number.isFinite(total))
    error ??=
      "The total exceeds the numeric range. Rescale the values before rendering.";
  const sweep = variant === "semi" ? 180 : 360;
  const offset = variant === "semi" ? -90 : 0;
  let angle = offset;
  const positive = rows.filter((row) => row.value > 0);
  const slices = positive.map((row, position) => {
    const fraction = row.value / largest / normalizedTotal;
    const start = angle;
    angle =
      position === positive.length - 1
        ? offset + sweep
        : angle + fraction * sweep;
    return {
      ...row,
      percentage: fraction * 100,
      start,
      end: angle,
      mid: (start + angle) / 2,
    };
  });
  return { rows, slices, total, error };
}
