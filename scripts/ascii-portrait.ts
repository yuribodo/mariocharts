import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

/**
 * Dark to light. Index 0 is the darkest cell.
 *
 * This ramp only reads correctly against a dark page background, where more
 * ink (a denser glyph) means more of the light foreground colour is on
 * screen, which reads as *brighter*. Against a light page the same glyph
 * reads as *darker* ink, so the light-theme variant below walks this same
 * ramp backwards instead of reusing it directly — see `asciifyVariants`.
 */
const RAMP = " .:-=+*#%@";
/** RAMP's darkest (blank) glyph — `.charAt` instead of `[0]` so this stays a plain `string` under noUncheckedIndexedAccess. */
const BLANK = RAMP.charAt(0);

const SOURCE = path.join(process.cwd(), "public/hero-portrait.jpg");
const OUTPUT = path.join(process.cwd(), "components/landing/hero/hero-ascii.ts");

const DEFAULT_COLUMNS = 120;
const DEFAULT_GAMMA = 1.15;

/** Monospaced cells are about twice as tall as they are wide. */
const CELL_ASPECT = 0.5;

/**
 * The source (474x568) is a tight head shot already, but its four corners
 * and right edge still show slivers of the blurred brown backdrop, and the
 * bottom quarter is the blue overalls, which sit at nearly the same
 * luminance as the red cap once converted to greyscale. Sampling the source
 * (see legibility-report.md) shows the cap and face solidly fill roughly
 * x64-448 of the 474px width at every row that matters, and the backdrop
 * only wins outside that band or below the chin (y460+, where the overalls'
 * blue takes over). Cropping to that box spends the frame on the cap, the
 * eyes and the face instead of the backdrop, which is the main thing that
 * was making the render unreadable.
 */
export const CROP = {
  left: 48,
  top: 0,
  width: 410,
  height: 520,
};

/**
 * Saturation boost applied before the greyscale conversion. The cap and the
 * backdrop are both "brownish-red" in raw luminance, which is exactly why
 * they were landing on the same glyphs. Pushing saturation up first moves
 * the cap's already-saturated red further from grey — greyscale conversion
 * weights green heavily (see the standard luminance formula), and boosting
 * saturation on a red hue *lowers* its green channel, which lowers its
 * computed luminance — while the backdrop, already closer to neutral, moves
 * much less. That widens the gap between "cap" and "backdrop" in the one
 * channel (luminance) the ASCII ramp actually has to work with.
 */
const SATURATION_BOOST = 1.9;

/**
 * The vignette's geometry, in fractions of the crop. Centred on the face,
 * which sits a little above the crop's middle; full opacity inside INNER,
 * fully dissolved past OUTER.
 */
/**
 * Face stays solid; the mid-density photo backdrop (the bright ==== halo)
 * must die before the crop edge. A wide ellipse + eased power keeps the
 * figure and kills the rectangular plate without a hard circular crop.
 */
const VIGNETTE = { cx: 0.5, cy: 0.4, rx: 0.7, ry: 0.68, inner: 0.48, outer: 0.98 };

/** Pulls peak ink down so the portrait densifies the field instead of blowing out. */
const INK_GAIN = 0.78;

/**
 * Light-theme ink. Higher than dark: paper needs denser glyphs to read, and a
 * pure luminance invert hollows the bright face into empty cells while the
 * mid-tone photo backdrop becomes a plate of `====`. The light curve keeps a
 * highlight floor, lifts shadow contrast, and falls off the vignette harder.
 */
const LIGHT_INK_GAIN = 0.95;
/** Minimum ink in the brightest cells so skin does not disappear on paper. */
const LIGHT_HIGHLIGHT_FLOOR = 0.2;
/** Power on the vignette for light only — kills the inverted backdrop plate. */
const LIGHT_VIGNETTE_POWER = 1.45;
/** Power on inverted luminance — <1 expands shadows/mustache/eyes. */
const LIGHT_SHADOW_POWER = 0.72;

/**
 * Builds an alpha mask that dissolves the image radially around the face.
 *
 * An edge feather is not enough here: it fades the crop's four borders but
 * leaves the interior backdrop — a mid-brown blur that converts to mid-density
 * glyphs — filling the whole rectangle, so the portrait rendered as a visible
 * block sitting on the page. The hero's field runs underneath the portrait
 * now, and the portrait has to read as the field condensing into a figure, not
 * as a picture pasted over it. A radial falloff has no straight edges to
 * betray the crop, so the glyphs thin out organically into the field.
 */
function vignetteAt(x: number, y: number, width: number, height: number): number {
  const dx = (x / width - VIGNETTE.cx) / VIGNETTE.rx;
  const dy = (y / height - VIGNETTE.cy) / VIGNETTE.ry;
  const radius = Math.sqrt(dx * dx + dy * dy);
  const t = Math.min(
    1,
    Math.max(0, (VIGNETTE.outer - radius) / (VIGNETTE.outer - VIGNETTE.inner)),
  );
  // Smoothstep, then a gentle power so the halo falls off faster than a
  // linear feather without punching a hard hole in the face.
  const smooth = t * t * (3 - 2 * t);
  return smooth * smooth;
}

/**
 * Crops the source down to the subject (see CROP) and boosts saturation to
 * pull the cap's luminance away from the backdrop's. Layout — positioning the
 * subject within the hero — is the caller's job, and the dissolve into the
 * field happens per variant in ink space (see asciifyVariants), not here.
 */
export async function compose(image: Buffer): Promise<Buffer> {
  const cropped = await sharp(image).extract(CROP).toBuffer();
  const boosted = await sharp(cropped)
    .modulate({ saturation: SATURATION_BOOST })
    .toBuffer();

  // No vignette here, deliberately. Fading the *pixels* toward black would
  // read correctly only in the dark variant: the light variant inverts the
  // ramp, so black maps to its densest glyph and the fade would render as a
  // dark ring. The vignette is applied per variant in ink space instead — see
  // asciifyVariants. (The previous edge feather composited a 1-channel mask
  // with `dest-in`, which reads a raw single-channel buffer as greyscale with
  // full alpha — it had silently never applied at all.)
  return sharp(boosted).png().toBuffer();
}

export interface AsciifyOptions {
  columns?: number;
  gamma?: number;
}

/**
 * Composes and resamples the source down to a `columns`-wide grid of gamma-
 * adjusted luminance values in [0, 1]. Both ramp directions map the exact
 * same grid, just walked in opposite orders (see `asciifyVariants`), so
 * this is the single source of truth for "how bright is this cell."
 */
async function toLuminanceGrid(
  image: Buffer,
  options: AsciifyOptions = {},
): Promise<{ grid: number[][]; columns: number }> {
  const columns = options.columns ?? DEFAULT_COLUMNS;
  const gamma = options.gamma ?? DEFAULT_GAMMA;

  const composed = await compose(image);
  const { width = 0, height = 0 } = await sharp(composed).metadata();
  const rows = Math.max(1, Math.round((columns * height * CELL_ASPECT) / width));

  const { data } = await sharp(composed)
    .greyscale()
    .normalise()
    .resize(columns, rows, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const grid: number[][] = [];
  for (let y = 0; y < rows; y += 1) {
    const row: number[] = [];
    for (let x = 0; x < columns; x += 1) {
      row.push(((data[y * columns + x] ?? 0) / 255) ** gamma);
    }
    grid.push(row);
  }

  return { grid, columns };
}

function mapRow(row: number[], ramp: string): string {
  let line = "";
  for (const value of row) {
    line += ramp[Math.min(ramp.length - 1, Math.floor(value * ramp.length))];
  }
  return line;
}

/** How many of `line`'s trailing characters equal `ch`. */
function trailingRun(line: string, ch: string): number {
  let count = 0;
  while (count < line.length && line[line.length - 1 - count] === ch) {
    count += 1;
  }
  return count;
}

export async function asciify(image: Buffer, options: AsciifyOptions = {}): Promise<string> {
  const { dark } = await asciifyVariants(image, options);
  return dark;
}

/**
 * Renders both theme variants from the same luminance grid.
 *
 * Each variant maps *ink density*, not luminance: on a dark page the bright
 * face carries the ink (`v`), on a light page the shadows do (`1 - v`). The
 * vignette then multiplies ink toward zero in both — and zero ink is a space,
 * which is the page itself. That is what lets the portrait dissolve into the
 * field in either theme instead of fading to a colour that only one theme
 * treats as empty.
 *
 * Trailing space is trimmed by the *shorter* of the two runs, and the same
 * count from both lines — trimming each independently would let their line
 * lengths drift apart and break the position-for-position pairing.
 */
export async function asciifyVariants(
  image: Buffer,
  options: AsciifyOptions = {},
): Promise<{ dark: string; light: string }> {
  const { grid } = await toLuminanceGrid(image, options);
  const rows = grid.length;

  const darkLines: string[] = [];
  const lightLines: string[] = [];

  for (let y = 0; y < rows; y += 1) {
    const row = grid[y] ?? [];
    const columns = row.length;

    const darkInk = row.map(
      (value, x) => value * vignetteAt(x, y, columns, rows) * INK_GAIN,
    );
    const lightInk = row.map((value, x) => {
      const vignette = vignetteAt(x, y, columns, rows);
      // Shadows carry most of the ink, but bright face cells keep a floor so
      // the figure does not read as a hollow silhouette on paper.
      const shadow = (1 - value) ** LIGHT_SHADOW_POWER;
      const ink =
        LIGHT_HIGHLIGHT_FLOOR + shadow * (1 - LIGHT_HIGHLIGHT_FLOOR);
      return ink * vignette ** LIGHT_VIGNETTE_POWER * LIGHT_INK_GAIN;
    });

    const darkLine = mapRow(darkInk, RAMP);
    const lightLine = mapRow(lightInk, RAMP);
    const trim = Math.min(
      trailingRun(darkLine, BLANK),
      trailingRun(lightLine, BLANK),
    );

    darkLines.push(trim > 0 ? darkLine.slice(0, -trim) : darkLine);
    lightLines.push(trim > 0 ? lightLine.slice(0, -trim) : lightLine);
  }

  return { dark: darkLines.join("\n"), light: lightLines.join("\n") };
}

async function main(): Promise<void> {
  const { dark, light } = await asciifyVariants(await readFile(SOURCE), {
    columns: DEFAULT_COLUMNS,
  });

  const moduleSource = `// Generated by scripts/ascii-portrait.ts from public/hero-portrait.jpg.
// Do not edit by hand — run \`npm run ascii:portrait\`.

export const HERO_ASCII_COLUMNS = ${DEFAULT_COLUMNS};

// Correct against a dark page background — see the note on RAMP in
// scripts/ascii-portrait.ts for why the two variants aren't the same string.
export const HERO_ASCII_DARK = ${JSON.stringify(dark)};

// The tonal inverse of HERO_ASCII_DARK, correct against a light page
// background.
export const HERO_ASCII_LIGHT = ${JSON.stringify(light)};
`;

  await writeFile(OUTPUT, moduleSource, "utf8");
  process.stdout.write(`Wrote ${OUTPUT}\n`);
}

if (process.argv[1] && process.argv[1].includes("ascii-portrait")) {
  main().catch((error) => {
    process.stderr.write(String(error) + "\n");
    process.exitCode = 1;
  });
}
