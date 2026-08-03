import type { DemoPoint, Glyph, GlyphTargetMap, PointTarget } from "./types";

export function splitHeadlineToGlyphs(headline: string): Glyph[] {
  return Array.from(headline).map((char, index) => ({
    id: `g-${index}`,
    char,
    index,
  }));
}

export function computeLineTargets(
  series: readonly DemoPoint[],
  viewBox: { width: number; height: number; padding: number }
): PointTarget[] {
  if (series.length === 0) return [];

  const values = series.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const { width, height, padding } = viewBox;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  return series.map((point, i) => {
    const x =
      series.length === 1
        ? padding + innerW / 2
        : padding + (i / (series.length - 1)) * innerW;
    const y = padding + (1 - (point.value - min) / range) * innerH;
    return {
      x,
      y,
      value: point.value,
      label: point.month,
    };
  });
}

export function mapGlyphsToTargets(
  glyphs: readonly Glyph[],
  targets: readonly PointTarget[]
): GlyphTargetMap[] {
  const sources = glyphs
    .map((g, glyphIndex) => ({ g, glyphIndex }))
    .filter(({ g }) => g.char.trim().length > 0);

  if (sources.length === 0) return [];

  return targets.map((target, targetIndex) => {
    const source = sources[targetIndex % sources.length]!;
    return {
      glyphIndex: source.glyphIndex,
      targetIndex,
      x: target.x,
      y: target.y,
    };
  });
}

export function buildLinePath(targets: readonly PointTarget[]): string {
  if (targets.length === 0) return "";
  return targets
    .map((t, i) => `${i === 0 ? "M" : "L"} ${t.x} ${t.y}`)
    .join(" ");
}
