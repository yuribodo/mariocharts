// src/components/charts/gauge-chart/utils.ts
export const GAUGE_START_ANGLE = 135;
export const GAUGE_TOTAL_ANGLE = 270;
export const GAUGE_END_ANGLE = GAUGE_START_ANGLE + GAUGE_TOTAL_ANGLE;

export function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function valueToAngle(value: number, min: number, max: number): number {
  const fraction = (value - min) / (max - min || 1);
  return GAUGE_START_ANGLE + fraction * GAUGE_TOTAL_ANGLE;
}

export function polarToCartesian(cx: number, cy: number, radius: number, angleDegrees: number): { x: number; y: number } {
  const rad = angleDegrees * (Math.PI / 180);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

export interface ZoneArc {
  startAngle: number;
  endAngle: number;
  color: string;
  label?: string;
}

export function computeZoneArcs(
  zones: readonly { from: number; to: number; color: string; label?: string }[],
  min: number,
  max: number
): ZoneArc[] {
  return zones.map((zone) => ({
    startAngle: valueToAngle(zone.from, min, max),
    endAngle: valueToAngle(zone.to, min, max),
    color: zone.color,
    label: zone.label,
  }));
}

export function describeArcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}
