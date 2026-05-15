import { nodeValue, computeTreeMapLayout } from './layout';
import type { TreeMapNode } from './layout';

describe('nodeValue', () => {
  it('returns the value of a leaf node', () => {
    expect(nodeValue({ name: 'A', value: 42 })).toBe(42);
  });

  it('returns 0 for a leaf with value 0', () => {
    expect(nodeValue({ name: 'A', value: 0 })).toBe(0);
  });

  it('returns 0 for a leaf with negative value', () => {
    expect(nodeValue({ name: 'A', value: -5 })).toBe(0);
  });

  it('returns 0 for a leaf with undefined value', () => {
    expect(nodeValue({ name: 'A' })).toBe(0);
  });

  it('returns 0 for a leaf with NaN value', () => {
    expect(nodeValue({ name: 'A', value: NaN })).toBe(0);
  });

  it('returns 0 for a leaf with Infinity value', () => {
    expect(nodeValue({ name: 'A', value: Infinity })).toBe(0);
  });

  it('sums children values for a parent node', () => {
    const node: TreeMapNode = {
      name: 'Parent',
      children: [
        { name: 'A', value: 10 },
        { name: 'B', value: 20 },
        { name: 'C', value: 30 },
      ],
    };
    expect(nodeValue(node)).toBe(60);
  });

  it('recursively sums nested children', () => {
    const node: TreeMapNode = {
      name: 'Root',
      children: [
        {
          name: 'Group1',
          children: [
            { name: 'A', value: 5 },
            { name: 'B', value: 15 },
          ],
        },
        { name: 'C', value: 10 },
      ],
    };
    expect(nodeValue(node)).toBe(30);
  });

  it('returns 0 for a parent with empty children array', () => {
    expect(nodeValue({ name: 'Empty', children: [] })).toBe(0);
  });
});

describe('computeTreeMapLayout', () => {
  it('returns empty array for empty data', () => {
    expect(computeTreeMapLayout([], 500, 400)).toEqual([]);
  });

  it('returns empty array for zero width', () => {
    const data: TreeMapNode[] = [{ name: 'A', value: 100 }];
    expect(computeTreeMapLayout(data, 0, 400)).toEqual([]);
  });

  it('returns empty array for zero height', () => {
    const data: TreeMapNode[] = [{ name: 'A', value: 100 }];
    expect(computeTreeMapLayout(data, 500, 0)).toEqual([]);
  });

  it('returns empty array for negative dimensions', () => {
    const data: TreeMapNode[] = [{ name: 'A', value: 100 }];
    expect(computeTreeMapLayout(data, -100, 400)).toEqual([]);
    expect(computeTreeMapLayout(data, 500, -200)).toEqual([]);
  });

  it('lays out a single node filling the area', () => {
    const data: TreeMapNode[] = [{ name: 'A', value: 100 }];
    const rects = computeTreeMapLayout(data, 500, 400);
    expect(rects).toHaveLength(1);
    const rect = rects[0]!;
    expect(rect.node.name).toBe('A');
    expect(rect.percentage).toBeCloseTo(100);
    // Should fill most of the area (minus gap)
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.y).toBeGreaterThanOrEqual(0);
  });

  it('lays out multiple nodes summing to the full area', () => {
    const data: TreeMapNode[] = [
      { name: 'A', value: 60 },
      { name: 'B', value: 30 },
      { name: 'C', value: 10 },
    ];
    const rects = computeTreeMapLayout(data, 500, 400);
    expect(rects).toHaveLength(3);

    // All rects should have positive dimensions
    for (const rect of rects) {
      expect(rect.width).toBeGreaterThanOrEqual(0);
      expect(rect.height).toBeGreaterThanOrEqual(0);
    }

    // Percentages should sum to ~100
    const totalPercentage = rects.reduce((sum, r) => sum + r.percentage, 0);
    expect(totalPercentage).toBeCloseTo(100, 0);
  });

  it('includes depth, colorIndex, and path in each rect', () => {
    const data: TreeMapNode[] = [{ name: 'A', value: 100 }];
    const rects = computeTreeMapLayout(data, 500, 400);
    const rect = rects[0]!;
    expect(rect).toHaveProperty('depth');
    expect(rect).toHaveProperty('colorIndex');
    expect(rect).toHaveProperty('path');
    expect(Array.isArray(rect.path)).toBe(true);
    expect(rect.path).toContain('A');
  });

  it('handles nested children', () => {
    const data: TreeMapNode[] = [
      {
        name: 'Group',
        children: [
          { name: 'A', value: 50 },
          { name: 'B', value: 50 },
        ],
      },
    ];
    const rects = computeTreeMapLayout(data, 500, 400);
    expect(rects.length).toBeGreaterThanOrEqual(2);

    const names = rects.map(r => r.node.name);
    expect(names).toContain('A');
    expect(names).toContain('B');
  });

  it('skips nodes with zero value', () => {
    const data: TreeMapNode[] = [
      { name: 'A', value: 100 },
      { name: 'B', value: 0 },
    ];
    const rects = computeTreeMapLayout(data, 500, 400);
    // B has no area so only A should appear
    const names = rects.map(r => r.node.name);
    expect(names).toContain('A');
  });

  it('returns empty array when all values are zero', () => {
    const data: TreeMapNode[] = [
      { name: 'A', value: 0 },
      { name: 'B', value: 0 },
    ];
    expect(computeTreeMapLayout(data, 500, 400)).toEqual([]);
  });

  it('assigns correct percentage proportional to value', () => {
    const data: TreeMapNode[] = [
      { name: 'A', value: 75 },
      { name: 'B', value: 25 },
    ];
    const rects = computeTreeMapLayout(data, 500, 400);
    const rectA = rects.find(r => r.node.name === 'A')!;
    const rectB = rects.find(r => r.node.name === 'B')!;
    expect(rectA.percentage).toBeCloseTo(75);
    expect(rectB.percentage).toBeCloseTo(25);
  });
});
