import {
  calculateAxisBounds,
  normalizeValue,
  generateTicks,
  calculatePercentage,
} from './scales';
import type { RadarAxis, RadarSeries } from './types';

type TestData = Record<string, number>;

describe('calculateAxisBounds', () => {
  const axis: RadarAxis = { key: 'speed', label: 'Speed' };

  it('uses manual min and max when both are specified', () => {
    const manualAxis: RadarAxis = { key: 'speed', label: 'Speed', min: 10, max: 200 };
    const series: RadarSeries<TestData>[] = [
      { id: '1', name: 'A', data: { speed: 999 } },
    ];
    const bounds = calculateAxisBounds(manualAxis, series);
    expect(bounds.min).toBe(10);
    expect(bounds.max).toBe(200);
  });

  it('auto-calculates bounds from series data', () => {
    const series: RadarSeries<TestData>[] = [
      { id: '1', name: 'A', data: { speed: 30 } },
      { id: '2', name: 'B', data: { speed: 80 } },
    ];
    const bounds = calculateAxisBounds(axis, series);
    expect(bounds.min).toBe(0);
    expect(bounds.max).toBeGreaterThan(80);
  });

  it('returns defaults for empty series', () => {
    const bounds = calculateAxisBounds(axis, []);
    expect(bounds.min).toBe(0);
    expect(bounds.max).toBe(1);
  });

  it('uses specified min with auto max', () => {
    const partialAxis: RadarAxis = { key: 'speed', label: 'Speed', min: 5 };
    const series: RadarSeries<TestData>[] = [
      { id: '1', name: 'A', data: { speed: 50 } },
    ];
    const bounds = calculateAxisBounds(partialAxis, series);
    expect(bounds.min).toBe(5);
    expect(bounds.max).toBeGreaterThan(50);
  });

  it('uses specified max with auto min', () => {
    const partialAxis: RadarAxis = { key: 'speed', label: 'Speed', max: 100 };
    const series: RadarSeries<TestData>[] = [
      { id: '1', name: 'A', data: { speed: 50 } },
    ];
    const bounds = calculateAxisBounds(partialAxis, series);
    expect(bounds.min).toBe(0);
    expect(bounds.max).toBe(100);
  });

  it('ensures max > min', () => {
    const narrowAxis: RadarAxis = { key: 'speed', label: 'Speed' };
    const series: RadarSeries<TestData>[] = [
      { id: '1', name: 'A', data: { speed: 0 } },
    ];
    const bounds = calculateAxisBounds(narrowAxis, series);
    expect(bounds.max).toBeGreaterThan(bounds.min);
  });

  it('returns specified min for empty series when min is provided', () => {
    const axisWithMin: RadarAxis = { key: 'speed', label: 'Speed', min: 10 };
    const bounds = calculateAxisBounds(axisWithMin, []);
    expect(bounds.min).toBe(10);
    expect(bounds.max).toBe(1); // default max
  });
});

describe('normalizeValue', () => {
  it('normalizes a value within range', () => {
    expect(normalizeValue(50, 0, 100)).toBeCloseTo(0.5);
  });

  it('returns 0 for min value', () => {
    expect(normalizeValue(0, 0, 100)).toBe(0);
  });

  it('returns 1 for max value', () => {
    expect(normalizeValue(100, 0, 100)).toBe(1);
  });

  it('returns 0.5 when min equals max', () => {
    expect(normalizeValue(5, 5, 5)).toBe(0.5);
  });

  it('clamps below-min values to 0', () => {
    expect(normalizeValue(-10, 0, 100)).toBe(0);
  });

  it('clamps above-max values to 1', () => {
    expect(normalizeValue(200, 0, 100)).toBe(1);
  });

  it('handles negative ranges', () => {
    expect(normalizeValue(-50, -100, 0)).toBeCloseTo(0.5);
  });
});

describe('generateTicks', () => {
  it('generates evenly spaced ticks', () => {
    const ticks = generateTicks(0, 100, 5);
    expect(ticks).toHaveLength(5);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBe(100);
  });

  it('returns [min, max] when count < 2', () => {
    const ticks = generateTicks(0, 100, 1);
    expect(ticks).toEqual([0, 100]);
  });

  it('returns [min, max] when count is 0', () => {
    const ticks = generateTicks(10, 50, 0);
    expect(ticks).toEqual([10, 50]);
  });

  it('defaults to 5 ticks when count is not specified', () => {
    const ticks = generateTicks(0, 100);
    expect(ticks).toHaveLength(5);
  });

  it('generates correct intermediate values', () => {
    const ticks = generateTicks(0, 10, 3);
    expect(ticks).toEqual([0, 5, 10]);
  });

  it('handles negative range', () => {
    const ticks = generateTicks(-100, 0, 3);
    expect(ticks[0]).toBe(-100);
    expect(ticks[ticks.length - 1]).toBe(0);
  });
});

describe('calculatePercentage', () => {
  it('returns percentage string for a midpoint value', () => {
    expect(calculatePercentage(50, 0, 100)).toBe('50%');
  });

  it('returns 0% for min value', () => {
    expect(calculatePercentage(0, 0, 100)).toBe('0%');
  });

  it('returns 100% for max value', () => {
    expect(calculatePercentage(100, 0, 100)).toBe('100%');
  });

  it('clamps and returns 0% for below-min value', () => {
    expect(calculatePercentage(-10, 0, 100)).toBe('0%');
  });

  it('clamps and returns 100% for above-max value', () => {
    expect(calculatePercentage(150, 0, 100)).toBe('100%');
  });

  it('returns 50% when min equals max', () => {
    expect(calculatePercentage(5, 5, 5)).toBe('50%');
  });
});
