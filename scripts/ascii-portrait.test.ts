import { readFile } from "node:fs/promises";
import path from "node:path";

import { asciify, compose } from "./ascii-portrait";

const SOURCE = path.join(process.cwd(), "public/hero-portrait.jpg");

describe("ascii-portrait", () => {
  it("composes onto a canvas the size of the source, not a padded one", async () => {
    const source = await readFile(SOURCE);
    const composed = await compose(source);
    const sharp = (await import("sharp")).default;
    const [{ width: sourceWidth, height: sourceHeight }, { width, height }] =
      await Promise.all([
        sharp(source).metadata(),
        sharp(composed).metadata(),
      ]);

    // The whole point of the tight composition is that no canvas padding is
    // added: every pixel of output width holds the subject. A regression
    // back to a padded canvas (e.g. 16:9) would change these dimensions.
    expect(width).toBe(sourceWidth);
    expect(height).toBe(sourceHeight);
  });

  it("uses a real spread of the character ramp rather than collapsing into a few glyphs", async () => {
    const art = await asciify(await readFile(SOURCE), { columns: 100 });

    // A legible portrait needs real tonal range. Counting distinct non-space
    // glyphs catches a collapse into two or three characters — which is
    // exactly what an unreadable, low-contrast portrait looks like — without
    // being so strict that harmless resampling differences fail the test.
    // This isn't vacuous on empty output: a blank art string has zero
    // distinct glyphs, which fails the assertion rather than passing it.
    const glyphs = new Set(art.replace(/\n/g, "").split(""));
    glyphs.delete(" ");

    expect(glyphs.size).toBeGreaterThanOrEqual(6);
  });

  it("is deterministic", async () => {
    const source = await readFile(SOURCE);
    const [a, b] = await Promise.all([asciify(source), asciify(source)]);

    expect(a).toBe(b);
  });

  it("matches the committed art", async () => {
    const { HERO_ASCII, HERO_ASCII_COLUMNS } = await import(
      "../components/landing/hero/hero-ascii"
    );
    const regenerated = await asciify(await readFile(SOURCE), {
      columns: HERO_ASCII_COLUMNS,
    });

    // If this fails, the source image or the conversion changed without the
    // committed art being regenerated. Run `npm run ascii:portrait`.
    expect(regenerated).toBe(HERO_ASCII);
  });
});
