import { readFile } from "node:fs/promises";
import path from "node:path";

import { CROP, asciify, asciifyVariants, compose } from "./ascii-portrait";

const SOURCE = path.join(process.cwd(), "public/hero-portrait.jpg");

/** Index 0 is the darkest cell — mirrors the private RAMP in ascii-portrait.ts. */
const RAMP = " .:-=+*#%@";

describe("ascii-portrait", () => {
  it("composes onto a canvas the size of the crop, not a padded one", async () => {
    const source = await readFile(SOURCE);
    const composed = await compose(source);
    const sharp = (await import("sharp")).default;
    const { width, height } = await sharp(composed).metadata();

    // The whole point of the tight composition is that no canvas padding is
    // added: every pixel of output width holds the subject, not the source's
    // own full frame (which still had backdrop in its corners — see CROP's
    // doc comment for how that box was chosen).
    expect(width).toBe(CROP.width);
    expect(height).toBe(CROP.height);
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
    const { HERO_ASCII_COLUMNS, HERO_ASCII_DARK, HERO_ASCII_LIGHT } = await import(
      "../components/landing/hero/hero-ascii"
    );
    const regenerated = await asciifyVariants(await readFile(SOURCE), {
      columns: HERO_ASCII_COLUMNS,
    });

    // If this fails, the source image or the conversion changed without the
    // committed art being regenerated. Run `npm run ascii:portrait`.
    expect(regenerated.dark).toBe(HERO_ASCII_DARK);
    expect(regenerated.light).toBe(HERO_ASCII_LIGHT);
  });

  it("renders the light-theme variant as a real second image, not a copy of the dark one", async () => {
    const { dark, light } = await asciifyVariants(await readFile(SOURCE), { columns: 100 });

    // Not vacuous: dark and light both come from a 100-column render of a
    // real photo, so this is comparing two large non-empty strings.
    expect(dark.length).toBeGreaterThan(0);
    expect(light.length).toBeGreaterThan(0);
    expect(light).not.toBe(dark);
  });

  it("opposes the variants tonally in the core and dissolves both at the edges", async () => {
    const { dark, light } = await asciifyVariants(await readFile(SOURCE), { columns: 100 });
    const darkRows = dark.split("\n");
    const lightRows = light.split("\n");

    // Guards against a vacuous pass: an empty grid would make every
    // assertion below trivially true, so require real content first.
    expect(darkRows.length).toBeGreaterThan(0);
    expect(darkRows.join("").trim().length).toBeGreaterThan(0);
    expect(darkRows.length).toBe(lightRows.length);

    // The variants are no longer a strict cell-for-cell inverse: the vignette
    // multiplies *ink* toward zero in both, because zero ink is the page and
    // the page is what the portrait dissolves into in either theme. So the
    // relationship splits by region.

    // At the far corners the vignette has fully won: both variants are blank.
    const corner = (rows: string[]) => (rows[0] ?? "").charAt(0) || " ";
    expect(corner(darkRows)).toBe(" ");
    expect(corner(lightRows)).toBe(" ");

    // In the vignette's core the two still pull against each other: sample the
    // central band and require a strong negative correlation between the ink
    // indexes, which fails if the light variant degrades into a copy of the
    // dark one or into noise.
    const midY = Math.floor(darkRows.length / 2);
    let sumDark = 0;
    let sumLight = 0;
    let sumDarkLight = 0;
    let sumDarkSq = 0;
    let sumLightSq = 0;
    let n = 0;

    for (let y = midY - 3; y <= midY + 3; y += 1) {
      const darkRow = darkRows[y] ?? "";
      const lightRow = lightRows[y] ?? "";
      const width = Math.min(darkRow.length, lightRow.length);

      for (let x = Math.floor(width * 0.3); x < Math.floor(width * 0.7); x += 1) {
        const darkIndex = RAMP.indexOf(darkRow.charAt(x));
        const lightIndex = RAMP.indexOf(lightRow.charAt(x));
        expect(darkIndex).toBeGreaterThanOrEqual(0);
        expect(lightIndex).toBeGreaterThanOrEqual(0);

        sumDark += darkIndex;
        sumLight += lightIndex;
        sumDarkLight += darkIndex * lightIndex;
        sumDarkSq += darkIndex * darkIndex;
        sumLightSq += lightIndex * lightIndex;
        n += 1;
      }
    }

    expect(n).toBeGreaterThan(100);
    const covariance = sumDarkLight / n - (sumDark / n) * (sumLight / n);
    const darkVar = sumDarkSq / n - (sumDark / n) ** 2;
    const lightVar = sumLightSq / n - (sumLight / n) ** 2;
    const correlation = covariance / Math.sqrt(darkVar * lightVar);

    expect(correlation).toBeLessThan(-0.8);
  });
});
