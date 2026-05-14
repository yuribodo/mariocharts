import { scaleValue } from './scales';

describe('scaleValue', () => {
  it('maps a value linearly from domain to range', () => {
    // 50 is halfway in [0,100] → halfway in [0,500] → 250
    expect(scaleValue(50, [0, 100], [0, 500])).toBe(250);
  });

  it('maps domain min to range min', () => {
    expect(scaleValue(0, [0, 100], [100, 400])).toBe(100);
  });

  it('maps domain max to range max', () => {
    expect(scaleValue(100, [0, 100], [100, 400])).toBe(400);
  });

  it('handles an inverted range', () => {
    // domain [0,100], range [500,0]: value 0 → 500, value 100 → 0
    expect(scaleValue(0, [0, 100], [500, 0])).toBe(500);
    expect(scaleValue(100, [0, 100], [500, 0])).toBe(0);
    expect(scaleValue(50, [0, 100], [500, 0])).toBe(250);
  });

  it('returns midpoint of range when domain min equals domain max', () => {
    expect(scaleValue(5, [5, 5], [0, 200])).toBe(100);
    expect(scaleValue(5, [5, 5], [100, 300])).toBe(200);
  });

  it('handles value outside domain (extrapolation)', () => {
    // 200 in [0,100] → proportionally 2x in [0,500] → 1000
    expect(scaleValue(200, [0, 100], [0, 500])).toBe(1000);
  });

  it('handles negative domain and range', () => {
    expect(scaleValue(-50, [-100, 0], [0, 100])).toBe(50);
  });

  it('handles non-zero-based domain', () => {
    // 15 in [10,20] is 50% → [0,100] → 50
    expect(scaleValue(15, [10, 20], [0, 100])).toBe(50);
  });
});
