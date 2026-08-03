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
const REVERSED_RAMP = [...RAMP].reverse().join("");
/** RAMP's darkest (blank) glyph — `.charAt` instead of `[0]` so this stays a plain `string` under noUncheckedIndexedAccess. */
const BLANK = RAMP.charAt(0);

const SOURCE = path.join(process.cwd(), "public/hero-portrait.jpg");
const OUTPUT = path.join(process.cwd(), "components/landing/hero/hero-ascii.ts");

const DEFAULT_COLUMNS = 120;
const DEFAULT_GAMMA = 1.15;

/** Monospaced cells are about twice as tall as they are wide. */
const CELL_ASPECT = 0.5;

/** How far the feather reaches in from the pasted image's edge, in pixels. */
const FEATHER = 32;

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
  left: 64,
  top: 0,
  width: 384,
  height: 460,
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
 * Builds an alpha mask that fades the source image out at its own edges. The
 * source has a blurred backdrop that would otherwise meet the black canvas at a
 * hard rectangular seam, which converts into a visible box around the subject.
 */
function feather(width: number, height: number): Buffer {
  const mask = Buffer.alloc(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const edge = Math.min(x, y, width - 1 - x, height - 1 - y);
      const t = Math.min(1, edge / FEATHER);
      // Smoothstep, so the falloff has no visible banding.
      mask[y * width + x] = Math.round(255 * t * t * (3 - 2 * t));
    }
  }

  return mask;
}

/**
 * Crops the source down to the subject (see CROP), boosts saturation to pull
 * the cap's luminance away from the backdrop's, then places the result on a
 * matte-black canvas the size of the crop itself, so the entire output width
 * is spent on the subject. The feather still fades the crop's own edges out,
 * so any backdrop sliver left inside the crop dissolves into the matte
 * instead of meeting it at a hard rectangular seam. Layout — positioning the
 * subject within the hero and reserving room for the headline — is the
 * caller's job, not this function's.
 */
export async function compose(image: Buffer): Promise<Buffer> {
  const cropped = await sharp(image).extract(CROP).toBuffer();
  const boosted = await sharp(cropped)
    .modulate({ saturation: SATURATION_BOOST })
    .toBuffer();

  const source = sharp(boosted);
  const { width = 0, height = 0 } = await source.metadata();

  const feathered = await source
    .ensureAlpha()
    .composite([
      {
        input: feather(width, height),
        raw: { width, height, channels: 1 },
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .composite([{ input: feathered, left: 0, top: 0 }])
    .png()
    .toBuffer();
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
 * Renders both theme variants from the same luminance grid: `dark` walks the
 * ramp light-to-dense (correct against a dark page, see the note on RAMP),
 * `light` walks it dense-to-light. Trailing space is trimmed once, from the
 * dark line, and the *same character count* is trimmed from the matching
 * light line — trimming each independently would let their line lengths
 * drift apart, which would break the position-for-position inverse
 * relationship between the two.
 */
export async function asciifyVariants(
  image: Buffer,
  options: AsciifyOptions = {},
): Promise<{ dark: string; light: string }> {
  const { grid } = await toLuminanceGrid(image, options);

  const darkLines: string[] = [];
  const lightLines: string[] = [];

  for (const row of grid) {
    const darkLine = mapRow(row, RAMP);
    const lightLine = mapRow(row, REVERSED_RAMP);
    const trim = trailingRun(darkLine, BLANK);

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
