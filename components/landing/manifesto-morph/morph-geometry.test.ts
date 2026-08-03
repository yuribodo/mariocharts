import {
  splitHeadlineToGlyphs,
  computeLineTargets,
  mapGlyphsToTargets,
} from "./morph-geometry";
import { DEMO_SERIES, MORPH_VIEWBOX } from "./types";

describe("splitHeadlineToGlyphs", () => {
  it("keeps spaces as glyphs and preserves order", () => {
    const glyphs = splitHeadlineToGlyphs("Own the pixels.");
    expect(glyphs.map((g) => g.char)).toEqual([
      "O", "w", "n", " ", "t", "h", "e", " ", "p", "i", "x", "e", "l", "s", ".",
    ]);
    expect(glyphs[0]?.id).toBe("g-0");
  });
});

describe("computeLineTargets", () => {
  it("returns one target per demo point inside the viewBox", () => {
    const targets = computeLineTargets(DEMO_SERIES, MORPH_VIEWBOX);
    expect(targets).toHaveLength(DEMO_SERIES.length);
    for (const t of targets) {
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.x).toBeLessThanOrEqual(MORPH_VIEWBOX.width);
      expect(t.y).toBeGreaterThanOrEqual(0);
      expect(t.y).toBeLessThanOrEqual(MORPH_VIEWBOX.height);
    }
  });

  it("places higher values higher on screen (smaller y)", () => {
    const targets = computeLineTargets(
      [
        { month: "A", value: 100 },
        { month: "B", value: 900 },
      ],
      { width: 400, height: 200, padding: 20 }
    );
    expect(targets[1]!.y).toBeLessThan(targets[0]!.y);
  });
});

describe("mapGlyphsToTargets", () => {
  it("maps each target to a source glyph index (round-robin over non-space glyphs)", () => {
    const glyphs = splitHeadlineToGlyphs("Own the pixels.");
    const targets = computeLineTargets(DEMO_SERIES, MORPH_VIEWBOX);
    const mapping = mapGlyphsToTargets(glyphs, targets);
    expect(mapping).toHaveLength(targets.length);
    for (const m of mapping) {
      expect(glyphs[m.glyphIndex]?.char.trim().length).toBeGreaterThan(0);
    }
  });
});
