/**
 * The full-bleed character field the hero sits on.
 *
 * The hero used to be a centred container with ASCII blocks inside it, which
 * left the page reading as a conventional layout with decoration dropped in —
 * and left the background genuinely empty, because nothing was drawing it.
 * Here the field *is* the background: it covers the viewport edge to edge and
 * every cell is a character, so there is no empty region left to notice.
 *
 * Built by a pure function at module load, never at render. Server and client
 * run the same arithmetic and get the same characters, so this cannot become a
 * hydration mismatch — the failure this project has already spent three rounds
 * removing. No `Math.random`, no `Date`.
 */

import { HERO_CHART_VALUES } from "./hero-chart-data";

/** Sparse on purpose: the backdrop is texture, and must never fight the copy. */
const RAMP = " .:-=+";

/**
 * The chart silhouette gets a denser vocabulary than the noise: it is the one
 * region of the field that is data rather than texture, and it has to read as
 * such at a glance.
 */
const CHART_RAMP = " .:=*#";

export const BACKDROP_COLUMNS = 220;
export const BACKDROP_ROWS = 90;

/**
 * A cheap integer hash. Its only job is to look unstructured to the eye while
 * being exactly reproducible — a value-noise field, not randomness.
 */
function noise(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/**
 * The clearing the copy sits in, in field coordinates.
 *
 * The type has to be legible over the field, and there are only two ways to do
 * that: carve real emptiness into the field, or lay a plate behind the type.
 * A plate is a scrim — the thing this design forbids — and it reads as a patch
 * with a hard rectangular edge. So the field clears itself here instead, and
 * the copy genuinely sits on nothing.
 */
const CLEARING = { left: 0, right: 0.46, top: 0.2, bottom: 0.78, feather: 0.13 };

/** 1 inside the clearing, 0 outside, with a soft edge so there is no seam. */
function clearance(x: number, y: number): number {
  const u = x / BACKDROP_COLUMNS;
  const v = y / BACKDROP_ROWS;

  const inset = Math.min(
    u - CLEARING.left,
    CLEARING.right - u,
    v - CLEARING.top,
    CLEARING.bottom - v,
  );

  if (inset <= 0) return 0;
  const t = Math.min(1, inset / CLEARING.feather);
  return t * t * (3 - 2 * t);
}

function buildBackdrop(): string {
  const rows: string[] = [];

  for (let y = 0; y < BACKDROP_ROWS; y += 1) {
    let line = "";
    for (let x = 0; x < BACKDROP_COLUMNS; x += 1) {
      // Two octaves so the texture drifts in bands rather than looking like
      // uniform static, and a bias toward the sparse end of the ramp so the
      // field stays a surface rather than becoming a wall.
      const drift = noise(Math.floor(x / 9), Math.floor(y / 5));
      const grain = noise(x, y);
      const value = (drift * 0.65 + grain * 0.35) ** 1.75;
      const open = value * (1 - clearance(x, y));
      line += RAMP[Math.min(RAMP.length - 1, Math.floor(open * RAMP.length))];
    }
    rows.push(line);
  }

  return rows.join("\n");
}

/** The chart strip's own grid: full field width, a band of rows of its own. */
export const CHART_ROWS = 24;

/** Rows of air above the tallest peak, so the curve never touches the strip's edge. */
const CHART_HEADROOM = 2;

/**
 * The value of the chart's curve at a horizontal position in [0, 1], linearly
 * interpolated between the committed samples and normalised to [0, 1].
 */
function chartHeight(u: number): number {
  const max = Math.max(...HERO_CHART_VALUES);
  const position = u * (HERO_CHART_VALUES.length - 1);
  const index = Math.min(HERO_CHART_VALUES.length - 2, Math.floor(position));
  const fraction = position - index;

  const a = HERO_CHART_VALUES[index] ?? 0;
  const b = HERO_CHART_VALUES[index + 1] ?? a;
  return (a * (1 - fraction) + b * fraction) / max;
}

/**
 * A strip of real data drawn across the field's full width: an area chart from
 * the committed dataset. It is what makes the hero of a chart library actually
 * contain a chart — the earlier attempt, a small separate block in the copy
 * column, read as a smudge and was rejected.
 *
 * The strip has its own row count and is pinned to the *section's* bottom by
 * the layout rather than living inside the 90-row field. The field's height
 * tracks the viewport's width, so on most screens its lower rows fall below
 * the fold — a chart baked into those rows was invisible, which defeated its
 * entire reason to exist.
 */
function buildChartLayer(): string {
  const rows: string[] = [];
  const baseline = CHART_ROWS - 1;

  for (let y = 0; y < CHART_ROWS; y += 1) {
    let line = "";
    for (let x = 0; x < BACKDROP_COLUMNS; x += 1) {
      const height = chartHeight(x / (BACKDROP_COLUMNS - 1));
      const surface =
        CHART_HEADROOM + (1 - height) * (baseline - CHART_HEADROOM);

      let ink = 0;
      if (y >= surface) {
        // Densest at the surface line so the curve itself reads, easing off
        // toward the baseline so the fill stays a wash rather than a slab.
        const depth = (y - surface) / Math.max(1, baseline - surface);
        ink = 0.95 - depth * 0.55;
      }

      line += CHART_RAMP[Math.min(CHART_RAMP.length - 1, Math.floor(ink * CHART_RAMP.length))];
    }
    rows.push(line.replace(/\s+$/, ""));
  }

  return rows.join("\n");
}

export const HERO_BACKDROP = buildBackdrop();
export const HERO_BACKDROP_CHART = buildChartLayer();
