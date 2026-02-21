import { clampValue, valueToAngle, polarToCartesian, computeZoneArcs } from './utils';

describe('clampValue', () => {
  it('returns value when within range', () => { expect(clampValue(50, 0, 100)).toBe(50); });
  it('clamps to min', () => { expect(clampValue(-10, 0, 100)).toBe(0); });
  it('clamps to max', () => { expect(clampValue(150, 0, 100)).toBe(100); });
});

describe('valueToAngle', () => {
  it('maps min to start angle (135)', () => { expect(valueToAngle(0, 0, 100)).toBeCloseTo(135); });
  it('maps max to end angle (405)', () => { expect(valueToAngle(100, 0, 100)).toBeCloseTo(405); });
  it('maps midpoint to 270', () => { expect(valueToAngle(50, 0, 100)).toBeCloseTo(270); });
});

describe('polarToCartesian', () => {
  it('maps -90° to top of circle', () => {
    const p = polarToCartesian(0, 0, 100, -90);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(-100);
  });
  it('maps 0° to right of circle', () => {
    const p = polarToCartesian(0, 0, 100, 0);
    expect(p.x).toBeCloseTo(100);
    expect(p.y).toBeCloseTo(0);
  });
});

describe('computeZoneArcs', () => {
  const zones = [
    { from: 0, to: 60, color: '#22c55e' },
    { from: 60, to: 80, color: '#f59e0b' },
    { from: 80, to: 100, color: '#ef4444' },
  ];
  const arcs = computeZoneArcs(zones, 0, 100);
  it('returns one arc per zone', () => { expect(arcs).toHaveLength(3); });
  it('first zone starts at 135', () => {
    const first = arcs[0];
    expect(first).toBeDefined();
    expect(first!.startAngle).toBeCloseTo(135);
  });
  it('last zone ends at 405', () => {
    const last = arcs[2];
    expect(last).toBeDefined();
    expect(last!.endAngle).toBeCloseTo(405);
  });
});
