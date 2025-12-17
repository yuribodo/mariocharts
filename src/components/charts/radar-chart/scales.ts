/**
 * Scale and normalization utilities for radar chart
 * Handles value extraction, bounds calculation, and formatting
 */

import type { ChartDataItem, RadarAxis, RadarSeries } from './types';

/**
 * Safely extract a numeric value from a data object
 * Handles numbers, numeric strings, and invalid values
 *
 * @param data - Data object to extract from
 * @param key - Key to look up in the data object
 * @returns Numeric value or 0 if invalid
 */
export function getNumericValue(
  data: ChartDataItem,
  key: string
): number {
  const value = data[key];

  // Direct number
  if (typeof value === 'number') {
    if (!isFinite(value)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[RadarChart] Invalid numeric value for key "${key}": ${value}. Using 0.`
        );
      }
      return 0;
    }
    return value;
  }

  // String that might be numeric
  if (typeof value === 'string') {
    // Remove common formatting characters
    const cleaned = value.replace(/[,$%\s]/g, '');
    const parsed = parseFloat(cleaned);

    if (!isFinite(parsed)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[RadarChart] Could not parse value for key "${key}": "${value}". Using 0.`
        );
      }
      return 0;
    }
    return parsed;
  }

  // Unsupported type
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `[RadarChart] Unexpected value type for key "${key}": ${typeof value}. Using 0.`
    );
  }
  return 0;
}

/**
 * Calculate the min and max bounds for an axis across all series
 *
 * @param axis - Axis configuration with optional manual bounds
 * @param series - All data series
 * @returns Calculated or configured bounds {min, max}
 */
export function calculateAxisBounds<T extends ChartDataItem>(
  axis: RadarAxis,
  series: readonly RadarSeries<T>[]
): { min: number; max: number } {
  // If both bounds are manually specified, use them
  if (axis.min !== undefined && axis.max !== undefined) {
    return { min: axis.min, max: axis.max };
  }

  // Handle empty series - return sensible defaults
  if (series.length === 0) {
    return {
      min: axis.min ?? 0,
      max: axis.max ?? 1,
    };
  }

  // Calculate bounds from data
  const values = series.map(s => getNumericValue(s.data, axis.key));
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);

  // Default min to 0 for most use cases (stats typically start at 0)
  // Use specified min if provided, otherwise 0 (or dataMin if it's negative)
  const min = axis.min ?? Math.min(0, dataMin);

  // Add 10% padding to max if auto-calculated, round up nicely
  let max: number;
  if (axis.max !== undefined) {
    max = axis.max;
  } else {
    const paddedMax = dataMax * 1.1;
    // Round to a nice number
    max = roundToNiceNumber(paddedMax);
  }

  // Ensure max > min
  if (max <= min) {
    max = min + 1;
  }

  return { min, max };
}

/**
 * Round a number up to a "nice" value for axis labels
 * E.g., 94 -> 100, 156 -> 160, 1234 -> 1300
 *
 * @param value - Value to round
 * @returns Nice rounded value
 */
function roundToNiceNumber(value: number): number {
  if (value === 0) return 0;
  if (value < 0) return -roundToNiceNumber(-value);

  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;

  let niceNormalized: number;
  if (normalized <= 1) niceNormalized = 1;
  else if (normalized <= 2) niceNormalized = 2;
  else if (normalized <= 5) niceNormalized = 5;
  else niceNormalized = 10;

  return niceNormalized * magnitude;
}

/**
 * Normalize a value to a 0-1 scale based on axis bounds
 *
 * @param value - Raw value to normalize
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @returns Normalized value between 0 and 1
 */
export function normalizeValue(
  value: number,
  min: number,
  max: number
): number {
  if (max === min) return 0.5; // Avoid division by zero
  const normalized = (value - min) / (max - min);
  // Clamp to 0-1 range
  return Math.max(0, Math.min(1, normalized));
}

/**
 * Format a numeric value for display with K/M notation
 *
 * @param value - Value to format
 * @returns Formatted string
 */
export function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    if (!isFinite(value)) return '—';

    // Large numbers with K/M suffix
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }

    // For typical radar stats (0-100), show integers
    if (Number.isInteger(value)) {
      return value.toLocaleString();
    }

    // Decimal values
    if (Math.abs(value) < 10) {
      return value.toFixed(2);
    }
    return value.toFixed(1);
  }

  return String(value ?? '—');
}

/**
 * Generate tick values for axis scale display
 *
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @param count - Desired number of ticks
 * @returns Array of tick values
 */
export function generateTicks(
  min: number,
  max: number,
  count: number = 5
): number[] {
  if (count < 2) return [min, max];

  const ticks: number[] = [];
  const step = (max - min) / (count - 1);

  for (let i = 0; i < count; i++) {
    const value = min + step * i;
    // Round to avoid floating point artifacts
    ticks.push(Math.round(value * 1000) / 1000);
  }

  return ticks;
}

/**
 * Calculate percentage of a value relative to axis bounds
 *
 * @param value - Value to calculate percentage for
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @returns Percentage string (e.g., "75%")
 */
export function calculatePercentage(
  value: number,
  min: number,
  max: number
): string {
  const normalized = normalizeValue(value, min, max);
  return `${Math.round(normalized * 100)}%`;
}
