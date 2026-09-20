import { waterfallScale } from "./utils";
it.each([
  { min: 0, max: 0 },
  { min: -100, max: 100 },
  { min: -1e308, max: 1e308 },
  { min: -1e-300, max: 1e-300 },
  { min: -40, max: 0 },
])(
  "maps finite domain %o without overflow and always includes zero",
  (domain) => {
    const scale = waterfallScale(domain);
    expect(scale.ticks.every(Number.isFinite)).toBe(true);
    expect(scale.ticks).toContain(0);
    expect(scale.ratio(domain.min)).toBeGreaterThanOrEqual(0);
    expect(scale.ratio(domain.max)).toBeLessThanOrEqual(1);
    expect(scale.ratio(domain.min)).toBeLessThanOrEqual(
      scale.ratio(domain.max),
    );
  },
);
