export { formatValue, getNumericValueOrNull as getNumericValue, calculateNiceTicks, getGridDasharray } from "../_shared";

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
