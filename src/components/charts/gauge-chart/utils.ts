// src/components/charts/gauge-chart/utils.ts

/** Starting angle of the gauge arc in degrees (clockwise from right). */
export const GAUGE_START_ANGLE = 135;

/** Total sweep of the gauge arc in degrees. */
export const GAUGE_TOTAL_ANGLE = 270;

/** Ending angle of the gauge arc in degrees. */
export const GAUGE_END_ANGLE = GAUGE_START_ANGLE + GAUGE_TOTAL_ANGLE;

/**
 * Clamps a value to the given [min, max] range.
 * @param value - The value to clamp.
 * @param min - The lower bound.
 * @param max - The upper bound.
 * @returns The clamped value.
 */
export function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Converts a data value to a gauge angle in degrees.
 * @param value - The data value to convert; clamped to [min, max] internally.
 * @param min - The minimum of the data range.
 * @param max - The maximum of the data range.
 * @returns The angle in degrees along the gauge arc.
 * @throws {RangeError} If `min >= max`.
 */
export function valueToAngle(value: number, min: number, max: number): number {
  if (min >= max) {
    throw new RangeError(`valueToAngle: min (${min}) must be less than max (${max})`);
  }
  const clamped = clampValue(value, min, max);
  const fraction = (clamped - min) / (max - min);
  return GAUGE_START_ANGLE + fraction * GAUGE_TOTAL_ANGLE;
}

/**
 * Converts polar coordinates to Cartesian (x, y).
 * @param cx - Center x of the circle.
 * @param cy - Center y of the circle.
 * @param radius - Radius of the circle.
 * @param angleDegrees - Angle in degrees (0 = right, clockwise).
 * @returns The {x, y} Cartesian coordinates.
 */
export function polarToCartesian(cx: number, cy: number, radius: number, angleDegrees: number): { x: number; y: number } {
  const rad = angleDegrees * (Math.PI / 180);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/**
 * Describes a single colored arc zone on the gauge.
 */
export interface ZoneArc {
  /** Start angle of the arc in degrees. */
  readonly startAngle: number;
  /** End angle of the arc in degrees. */
  readonly endAngle: number;
  /** CSS color string for the arc. */
  readonly color: string;
  /** Optional human-readable label for the zone. */
  readonly label?: string | undefined;
}

/**
 * Converts an array of data-range zones into angle-based arc descriptors.
 * @param zones - Zone definitions with `from`, `to`, `color`, and optional `label`.
 * @param min - The minimum of the data range.
 * @param max - The maximum of the data range.
 * @returns Array of {@link ZoneArc} objects with angle-based bounds.
 */
export function computeZoneArcs(
  zones: readonly { from: number; to: number; color: string; label?: string | undefined }[],
  min: number,
  max: number
): ZoneArc[] {
  return zones.map((zone) => {
    const arc: ZoneArc = {
      startAngle: valueToAngle(zone.from, min, max),
      endAngle: valueToAngle(zone.to, min, max),
      color: zone.color,
      ...(zone.label !== undefined ? { label: zone.label } : {}),
    };
    return arc;
  });
}

/**
 * Builds an SVG arc path string from center, radius, and angle bounds.
 *
 * @note Spans of exactly 360° cause start and end points to coincide, making
 *   the arc invisible. Spans exceeding 359.999° are clamped automatically.
 * @param cx - Center x of the circle.
 * @param cy - Center y of the circle.
 * @param radius - Radius of the arc.
 * @param startAngle - Arc start angle in degrees.
 * @param endAngle - Arc end angle in degrees.
 * @returns SVG `d` attribute string for a circular arc path.
 */
export function describeArcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  const clampedEnd = startAngle + Math.min(endAngle - startAngle, 359.999);
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, clampedEnd);
  const largeArc = clampedEnd - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}
