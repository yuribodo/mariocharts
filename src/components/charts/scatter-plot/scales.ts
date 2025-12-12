import type { ChartDataItem } from "./types";

/**
 * Scale value from data domain to screen range
 */
export function scaleValue(
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number]
): number {
  const [domainMin, domainMax] = domain;
  const [rangeMin, rangeMax] = range;
  if (domainMax === domainMin) return (rangeMin + rangeMax) / 2;
  return rangeMin + ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin);
}

/**
 * Calculate nice axis ticks for better readability
 */
export function calculateNiceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];

  const range = max - min;
  const roughStep = range / (count - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalizedStep = roughStep / magnitude;

  let niceStep: number;
  if (normalizedStep <= 1) niceStep = magnitude;
  else if (normalizedStep <= 2) niceStep = 2 * magnitude;
  else if (normalizedStep <= 5) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  const niceMin = Math.floor(min / niceStep) * niceStep;
  const niceMax = Math.ceil(max / niceStep) * niceStep;

  const ticks: number[] = [];
  for (let tick = niceMin; tick <= niceMax; tick += niceStep) {
    ticks.push(tick);
  }

  return ticks;
}

/**
 * Extract numeric value from data item with type coercion
 * Logs warning in development mode for unparseable values
 */
export function getNumericValue(
  data: ChartDataItem,
  key: keyof ChartDataItem
): number | null {
  const value = data[key];

  if (typeof value === 'number' && isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[,$%\s]/g, ''));
    if (isFinite(parsed)) {
      return parsed;
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `ScatterPlot: Could not parse value "${value}" for key "${String(key)}". ` +
        `Expected a number or numeric string.`
      );
    }
  }

  if (process.env.NODE_ENV === 'development' && value !== null && value !== undefined) {
    console.warn(
      `ScatterPlot: Invalid value type for key "${String(key)}". ` +
      `Got ${typeof value}, expected number or numeric string.`
    );
  }

  return null;
}

/**
 * Format numeric value for display (K, M suffixes)
 */
export function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  }
  return String(value);
}

/**
 * Get grid dasharray based on style
 */
export function getGridDasharray(gridStyle: 'solid' | 'dashed' | 'dotted'): string {
  switch (gridStyle) {
    case 'solid': return 'none';
    case 'dotted': return '2 4';
    case 'dashed':
    default: return '4 4';
  }
}
