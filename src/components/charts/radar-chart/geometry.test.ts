import {
  polarToCartesian,
  calculateAxisAngle,
  generatePolygonPath,
  generateCircularGridPath,
  generatePolygonGridPath,
  calculateLabelPosition,
  isPointInPolygon,
  calculatePolygonCentroid,
} from './geometry';

describe('polarToCartesian', () => {
  it('angle 0 places point at top (12 o\'clock)', () => {
    const p = polarToCartesian(100, 100, 50, 0);
    expect(p.x).toBeCloseTo(100);
    expect(p.y).toBeCloseTo(50); // 100 - 50 = above center
  });

  it('angle PI places point at bottom (6 o\'clock)', () => {
    const p = polarToCartesian(100, 100, 50, Math.PI);
    expect(p.x).toBeCloseTo(100);
    expect(p.y).toBeCloseTo(150); // 100 + 50 = below center
  });

  it('angle PI/2 places point to the right (3 o\'clock)', () => {
    const p = polarToCartesian(100, 100, 50, Math.PI / 2);
    expect(p.x).toBeCloseTo(150);
    expect(p.y).toBeCloseTo(100);
  });

  it('radius 0 returns center point', () => {
    const p = polarToCartesian(200, 300, 0, Math.PI);
    expect(p.x).toBeCloseTo(200);
    expect(p.y).toBeCloseTo(300);
  });
});

describe('calculateAxisAngle', () => {
  it('returns 0 for the first axis', () => {
    expect(calculateAxisAngle(0, 4)).toBe(0);
  });

  it('returns PI/2 for the second of 4 axes', () => {
    expect(calculateAxisAngle(1, 4)).toBeCloseTo(Math.PI / 2);
  });

  it('returns PI for the third of 4 axes', () => {
    expect(calculateAxisAngle(2, 4)).toBeCloseTo(Math.PI);
  });

  it('returns 3*PI/2 for the fourth of 4 axes', () => {
    expect(calculateAxisAngle(3, 4)).toBeCloseTo((3 * Math.PI) / 2);
  });

  it('returns 0 when totalAxes is 0', () => {
    expect(calculateAxisAngle(0, 0)).toBe(0);
  });

  it('returns 0 when totalAxes is negative', () => {
    expect(calculateAxisAngle(0, -1)).toBe(0);
  });
});

describe('generatePolygonPath', () => {
  it('returns empty string for empty array', () => {
    expect(generatePolygonPath([])).toBe('');
  });

  it('returns a small circle marker for a single point', () => {
    const path = generatePolygonPath([{ x: 10, y: 20 }]);
    expect(path).toContain('10.00');
    expect(path).toContain('20.00');
    expect(path).toContain('a 2 2 0 1 0'); // arc commands for circle marker
  });

  it('returns a line for two points', () => {
    const path = generatePolygonPath([
      { x: 0, y: 0 },
      { x: 10, y: 20 },
    ]);
    expect(path).toContain('M');
    expect(path).toContain('L');
    expect(path).not.toContain('Z');
  });

  it('returns a closed polygon path for 3+ points', () => {
    const path = generatePolygonPath([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 10 },
    ]);
    expect(path).toMatch(/^M/);
    expect(path).toContain('L');
    expect(path).toMatch(/Z$/);
  });

  it('includes all point coordinates for a pentagon', () => {
    const points = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 6 },
      { x: 7, y: 8 },
      { x: 9, y: 10 },
    ];
    const path = generatePolygonPath(points);
    expect(path).toContain('1.00');
    expect(path).toContain('9.00');
    expect(path).toContain('10.00');
    expect(path).toMatch(/Z$/);
  });
});

describe('generateCircularGridPath', () => {
  it('returns an arc path for radius > 0', () => {
    const path = generateCircularGridPath(100, 100, 50);
    expect(path).toContain('M');
    expect(path).toContain('A');
    expect(path).toContain('50'); // radius appears in arc commands
  });

  it('returns empty string for radius 0', () => {
    expect(generateCircularGridPath(100, 100, 0)).toBe('');
  });

  it('returns empty string for negative radius', () => {
    expect(generateCircularGridPath(100, 100, -10)).toBe('');
  });
});

describe('generatePolygonGridPath', () => {
  it('returns a closed polygon path for valid sides and radius', () => {
    const path = generatePolygonGridPath(100, 100, 50, 6);
    expect(path).toContain('M');
    expect(path).toContain('L');
    expect(path).toMatch(/Z$/);
  });

  it('returns empty string for fewer than 3 sides', () => {
    expect(generatePolygonGridPath(100, 100, 50, 2)).toBe('');
    expect(generatePolygonGridPath(100, 100, 50, 1)).toBe('');
    expect(generatePolygonGridPath(100, 100, 50, 0)).toBe('');
  });

  it('returns empty string for zero or negative radius', () => {
    expect(generatePolygonGridPath(100, 100, 0, 5)).toBe('');
    expect(generatePolygonGridPath(100, 100, -10, 5)).toBe('');
  });

  it('generates a triangle for 3 sides', () => {
    const path = generatePolygonGridPath(0, 0, 10, 3);
    expect(path).toContain('M');
    expect(path).toMatch(/Z$/);
    // Should have M + 2 L commands + Z for a triangle
    const lCount = (path.match(/L /g) || []).length;
    expect(lCount).toBe(2);
  });
});

describe('calculateLabelPosition', () => {
  it('returns x and y coordinates based on angle and offset', () => {
    const pos = calculateLabelPosition(0, 100, 100, 50, 10);
    // angle=0 is top: x should be near center, y should be above
    expect(pos.x).toBeCloseTo(100);
    expect(pos.y).toBeCloseTo(40); // 100 - (50+10) = 40
  });

  it('returns textAnchor and dominantBaseline properties', () => {
    const pos = calculateLabelPosition(0, 100, 100, 50, 10);
    expect(pos).toHaveProperty('textAnchor');
    expect(pos).toHaveProperty('dominantBaseline');
    expect(['start', 'middle', 'end']).toContain(pos.textAnchor);
    expect(['auto', 'middle', 'hanging']).toContain(pos.dominantBaseline);
  });

  it('sets textAnchor to "start" for right-side angles', () => {
    // angle PI/2 is the right side of the chart
    const pos = calculateLabelPosition(Math.PI / 2, 100, 100, 50, 10);
    expect(pos.textAnchor).toBe('start');
  });

  it('sets textAnchor to "end" for left-side angles', () => {
    // angle 3*PI/2 is the left side of the chart
    const pos = calculateLabelPosition((3 * Math.PI) / 2, 100, 100, 50, 10);
    expect(pos.textAnchor).toBe('end');
  });

  it('sets textAnchor to "middle" for top angle', () => {
    const pos = calculateLabelPosition(0, 100, 100, 50, 10);
    expect(pos.textAnchor).toBe('middle');
  });
});

describe('isPointInPolygon', () => {
  const square = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ];

  it('returns true for a point inside the polygon', () => {
    expect(isPointInPolygon({ x: 5, y: 5 }, square)).toBe(true);
  });

  it('returns false for a point outside the polygon', () => {
    expect(isPointInPolygon({ x: 15, y: 5 }, square)).toBe(false);
    expect(isPointInPolygon({ x: -1, y: -1 }, square)).toBe(false);
  });

  it('returns false for fewer than 3 sides', () => {
    expect(isPointInPolygon({ x: 5, y: 5 }, [])).toBe(false);
    expect(isPointInPolygon({ x: 5, y: 5 }, [{ x: 0, y: 0 }])).toBe(false);
    expect(
      isPointInPolygon({ x: 5, y: 5 }, [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ])
    ).toBe(false);
  });

  it('returns true for a point inside a triangle', () => {
    const triangle = [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 10, y: 20 },
    ];
    expect(isPointInPolygon({ x: 10, y: 5 }, triangle)).toBe(true);
  });

  it('returns false for a point outside a triangle', () => {
    const triangle = [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 10, y: 20 },
    ];
    expect(isPointInPolygon({ x: 0, y: 20 }, triangle)).toBe(false);
  });
});

describe('calculatePolygonCentroid', () => {
  it('returns {0, 0} for empty array', () => {
    const centroid = calculatePolygonCentroid([]);
    expect(centroid.x).toBe(0);
    expect(centroid.y).toBe(0);
  });

  it('returns the point itself for a single point', () => {
    const centroid = calculatePolygonCentroid([{ x: 10, y: 20 }]);
    expect(centroid.x).toBe(10);
    expect(centroid.y).toBe(20);
  });

  it('returns the average for a triangle', () => {
    const centroid = calculatePolygonCentroid([
      { x: 0, y: 0 },
      { x: 6, y: 0 },
      { x: 3, y: 9 },
    ]);
    expect(centroid.x).toBeCloseTo(3);
    expect(centroid.y).toBeCloseTo(3);
  });

  it('returns center of a symmetric square', () => {
    const centroid = calculatePolygonCentroid([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ]);
    expect(centroid.x).toBeCloseTo(5);
    expect(centroid.y).toBeCloseTo(5);
  });
});
