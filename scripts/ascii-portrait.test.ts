import { readFile } from "node:fs/promises";
import path from "node:path";

import { asciify, compose } from "./ascii-portrait";

const SOURCE = path.join(process.cwd(), "public/hero-portrait.jpg");

describe("ascii-portrait", () => {
  it("composes onto a 16:9 canvas with the subject on the right", async () => {
    const composed = await compose(await readFile(SOURCE));
    const sharp = (await import("sharp")).default;
    const { width, height } = await sharp(composed).metadata();

    expect(width! / height!).toBeCloseTo(16 / 9, 2);
  });

  it("leaves the left half of the field empty for the headline", async () => {
    const art = await asciify(await readFile(SOURCE), { columns: 100 });
    const lines = art.split("\n");

    // Every line's ink must start past the midpoint. Anything drawn on the
    // left would sit underneath the headline, and the design forbids the
    // overlay that would be needed to keep the text readable.
    const inkStarts = lines
      .filter((line) => line.trim().length > 0)
      .map((line) => line.search(/\S/));

    // The source is pasted onto a 16:9 canvas at its own width, so it covers
    // roughly the right half. 45 leaves margin for rounding without letting
    // ink creep into the headline's field.
    expect(Math.min(...inkStarts)).toBeGreaterThanOrEqual(45);
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
