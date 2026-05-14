import { calculateLinearRegression } from './regression';

describe('calculateLinearRegression', () => {
  it('returns perfect fit (r2 ≈ 1) for a perfect positive line', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 6 },
      { x: 4, y: 8 },
    ];
    const result = calculateLinearRegression(points);
    expect(result.slope).toBeCloseTo(2);
    expect(result.intercept).toBeCloseTo(0);
    expect(result.r2).toBeCloseTo(1);
  });

  it('returns slope=0, intercept=y, r2=0 for a single point', () => {
    const result = calculateLinearRegression([{ x: 5, y: 42 }]);
    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(42);
    expect(result.r2).toBe(0);
  });

  it('returns slope=0, intercept=0, r2=0 for empty array', () => {
    const result = calculateLinearRegression([]);
    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(0);
    expect(result.r2).toBe(0);
  });

  it('returns slope=0 for a horizontal line', () => {
    const points = [
      { x: 0, y: 5 },
      { x: 1, y: 5 },
      { x: 2, y: 5 },
      { x: 3, y: 5 },
    ];
    const result = calculateLinearRegression(points);
    expect(result.slope).toBeCloseTo(0);
    expect(result.intercept).toBeCloseTo(5);
    // All y-values identical: ssTotal=0 so r2=1 (perfect "fit" with constant)
    expect(result.r2).toBe(1);
  });

  it('handles vertical x values (all x the same, denom=0)', () => {
    const points = [
      { x: 3, y: 1 },
      { x: 3, y: 5 },
      { x: 3, y: 9 },
    ];
    const result = calculateLinearRegression(points);
    expect(result.slope).toBe(0);
    expect(result.intercept).toBeCloseTo(5); // average of y values
    expect(result.r2).toBe(0);
  });

  it('computes exact values for two points', () => {
    const points = [
      { x: 1, y: 3 },
      { x: 4, y: 9 },
    ];
    const result = calculateLinearRegression(points);
    expect(result.slope).toBeCloseTo(2);
    expect(result.intercept).toBeCloseTo(1);
    expect(result.r2).toBeCloseTo(1);
  });

  it('returns a negative slope for a descending line', () => {
    const points = [
      { x: 0, y: 10 },
      { x: 2, y: 6 },
      { x: 4, y: 2 },
    ];
    const result = calculateLinearRegression(points);
    expect(result.slope).toBeCloseTo(-2);
    expect(result.intercept).toBeCloseTo(10);
    expect(result.r2).toBeCloseTo(1);
  });
});
