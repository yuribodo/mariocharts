/** Angles run clockwise from the right; the 270° sweep leaves a gap below. */
export const GAUGE_START_ANGLE = 135;
export const GAUGE_TOTAL_ANGLE = 270;
export const GAUGE_END_ANGLE = GAUGE_START_ANGLE + GAUGE_TOTAL_ANGLE;
export function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Normalize finite extremes without overflowing the range subtraction. */
export function gaugeFraction(value: number, min: number, max: number) {
  if (![value, min, max].every(Number.isFinite) || min >= max)
    throw new RangeError(
      "Gauge values and bounds must be finite, with min < max.",
    );
  const bounded = clampValue(value, min, max);
  const span = max - min;
  const magnitude = Math.max(Math.abs(min), Math.abs(max)) || 1;
  return Number.isFinite(span)
    ? (bounded - min) / span
    : (bounded / magnitude - min / magnitude) /
        (max / magnitude - min / magnitude);
}
export function valueToAngle(value: number, min: number, max: number) {
  return GAUGE_START_ANGLE + gaugeFraction(value, min, max) * GAUGE_TOTAL_ANGLE;
}
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDegrees: number,
) {
  const rad = (angleDegrees * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}
export interface ZoneArc {
  readonly startAngle: number;
  readonly endAngle: number;
  readonly color: string;
  readonly label?: string | undefined;
}
export interface GaugeZoneInput {
  readonly from: number;
  readonly to: number;
  readonly color: string;
  readonly label?: string | undefined;
}
export function computeZoneArcs(
  zones: readonly GaugeZoneInput[],
  min: number,
  max: number,
): ZoneArc[] {
  return zones.map((zone) => ({
    startAngle: valueToAngle(zone.from, min, max),
    endAngle: valueToAngle(zone.to, min, max),
    color: zone.color,
    ...(zone.label !== undefined ? { label: zone.label } : {}),
  }));
}

/** Zero-length arcs paint nothing; full circles use two arcs instead of an epsilon. */
export function describeArcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  if (
    ![cx, cy, radius, startAngle, endAngle].every(Number.isFinite) ||
    radius <= 0 ||
    endAngle <= startAngle
  )
    return "";
  const sweep = Math.min(360, endAngle - startAngle);
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle + sweep);
  if (sweep === 360) {
    const middle = polarToCartesian(cx, cy, radius, startAngle + 180);
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${middle.x} ${middle.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
  }
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${end.x} ${end.y}`;
}

/** Sort zones by their bounds while preserving original identity and leaving gaps unclassified. */
export function buildGaugeModel(
  value: number,
  min: number,
  max: number,
  zones: readonly GaugeZoneInput[],
) {
  let error: string | null = null;
  if (![min, max].every(Number.isFinite) || min >= max)
    error = "Gauge min and max must be finite numbers with min < max.";
  else if (!Number.isFinite(value))
    error =
      "Gauge value must be a finite number. Provide a measured value before rendering.";
  const sorted = zones
    .map((zone, index) => ({ ...zone, index }))
    .sort((a, b) => a.from - b.from || a.index - b.index);
  for (let i = 0; i < sorted.length; i++) {
    const zone = sorted[i]!;
    if (![zone.from, zone.to].every(Number.isFinite) || zone.from >= zone.to)
      error ??= `Zone ${zone.index + 1}: from and to must be finite numbers with from < to.`;
    else if (zone.from < min || zone.to > max)
      error ??= `Zone ${zone.index + 1}: bounds must stay inside the gauge range.`;
    else if (i && zone.from < sorted[i - 1]!.to)
      error ??= `Zone ${zone.index + 1}: zones must not overlap. Adjacent zones may share a boundary.`;
    if (typeof zone.color !== "string" || !zone.color.trim())
      error ??= `Zone ${zone.index + 1}: provide a CSS color.`;
  }
  const fraction = error ? 0 : gaugeFraction(value, min, max);
  const activeZone = error
    ? undefined
    : sorted.find(
        (zone) =>
          value >= zone.from &&
          (value < zone.to || (value === max && zone.to === max)),
      );
  return {
    error,
    zones: sorted,
    fraction,
    clampedValue: error ? 0 : clampValue(value, min, max),
    activeZone,
    rangeStatus: (value < min ? "below" : value > max ? "above" : "within") as
      | "below"
      | "above"
      | "within",
  };
}

/** Fit the full stroked sweep plus endpoint labels inside a stable frame. */
export function getGaugeGeometry(
  width: number,
  height: number,
  strokeWidth: number,
) {
  const outerRadius = Math.max(
    0,
    Math.min((width - 48) / 2, (height - 64) / (1 + Math.SQRT1_2)),
  );
  const stroke = Math.min(strokeWidth, outerRadius * 0.35);
  const radius = Math.max(0, outerRadius - stroke / 2);
  const cx = width / 2;
  const cy = (height - 32) / 2 + ((1 - Math.SQRT1_2) * outerRadius) / 2;
  return { cx, cy, radius, stroke };
}
