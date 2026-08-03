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
const CLEARING = { left: 0, right: 0.48, top: 0.18, bottom: 0.8, feather: 0.13 };

/**
 * Soft well under the portrait. Unlike CLEARING it never goes fully empty —
 * it only thins the field so the vignette's edge meets sparse glyphs instead
 * of a dense wall, which is what made Mario read as a sticker on the page.
 */
const PORTRAIT_WELL = {
  left: 0.58,
  right: 1,
  top: 0.22,
  bottom: 0.92,
  feather: 0.22,
  /** Peak density cut at the well's centre (0 = untouched, 1 = empty). */
  depth: 0.55,
};

/** Soft rectangular falloff: 1 at the centre, 0 outside, smoothstep edges. */
function softRect(
  x: number,
  y: number,
  region: { left: number; right: number; top: number; bottom: number; feather: number },
): number {
  const u = x / BACKDROP_COLUMNS;
  const v = y / BACKDROP_ROWS;

  const inset = Math.min(
    u - region.left,
    region.right - u,
    v - region.top,
    region.bottom - v,
  );

  if (inset <= 0) return 0;
  const t = Math.min(1, inset / region.feather);
  return t * t * (3 - 2 * t);
}

/** 1 inside the clearing, 0 outside, with a soft edge so there is no seam. */
function clearance(x: number, y: number): number {
  return softRect(x, y, CLEARING);
}

/** How much to keep of the field under the portrait (1 = full, ~0.18 at centre). */
function portraitKeep(x: number, y: number): number {
  return 1 - softRect(x, y, PORTRAIT_WELL) * PORTRAIT_WELL.depth;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Value-noise sampled with a continuous phase so the grain breathes instead of
 * hard-swapping every integer tick (which read as a low-fps slideshow).
 */
function continuousNoise(x: number, y: number, phase: number, sx: number, sy: number): number {
  const i = Math.floor(phase);
  const f = phase - i;
  return lerp(noise(x + i * sx, y + i * sy), noise(x + (i + 1) * sx, y + (i + 1) * sy), f);
}

/**
 * Vanishing point of the entrance warp — centre of the copy clearing, so the
 * tunnel aims at where the headline will land.
 */
export const WARP_VANISH = {
  u: (CLEARING.left + CLEARING.right) / 2,
  v: (CLEARING.top + CLEARING.bottom) / 2,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * One cell of the field. `clearanceMix` lets the entrance hold a solid tunnel
 * wall (0) and then open the copy clearing (1) without a second generator.
 */
export function sampleBackdropGlyph(
  x: number,
  y: number,
  t: number,
  clearanceMix = 1,
): string {
  const driftPhase = t * 0.55;
  const grainPhase = t * 0.28;
  const bandX = x / 9 + driftPhase;
  const cellY = Math.floor(y / 5);
  const drift = lerp(
    noise(Math.floor(bandX), cellY),
    noise(Math.floor(bandX) + 1, cellY),
    bandX - Math.floor(bandX),
  );
  const grain = continuousNoise(x, y, grainPhase, 7919, 104729);
  const value = (drift * 0.7 + grain * 0.3) ** 1.75;
  const open =
    value * (1 - clearance(x, y) * clearanceMix) * portraitKeep(x, y);
  return RAMP[Math.min(RAMP.length - 1, Math.floor(open * RAMP.length))] ?? " ";
}

/**
 * One frame of the field at time `t`. A pure function of its inputs — no
 * `Date`, no `Math.random` — so the server's frame 0 and the client's frame 0
 * are the same characters, and the loop cannot become a hydration mismatch.
 *
 * `t` is continuous (fractional ticks). Drift bands glide sideways; grain
 * interpolates between successive noise cells so the surface breathes rather
 * than re-rolling in steps.
 */
export function backdropFrame(t: number): string {
  const rows: string[] = [];

  for (let y = 0; y < BACKDROP_ROWS; y += 1) {
    let line = "";
    for (let x = 0; x < BACKDROP_COLUMNS; x += 1) {
      line += sampleBackdropGlyph(x, y, t, 1);
    }
    rows.push(line);
  }

  return rows.join("\n");
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Entrance warp frame. `progress` in [0, 1] is a full portal arc:
 * deep tunnel mouth → radial rush with motion streaks → zoom settle into
 * the ordinary field with the copy clearing open. Progress 1 matches
 * {@link backdropFrame} exactly so the handoff can be invisible.
 */
export function warpBackdropFrame(progress: number, t: number): string {
  const p = clamp(progress, 0, 1);
  // Ease-out land: long settle so the world feels arrived, not cut.
  const ease = 1 - (1 - p) ** 2.6;
  const zoom = lerp(5.2, 1, ease);
  const clearanceMix = clamp((p - 0.48) / 0.4, 0, 1);
  // Tunnel mouth + wall intensity — strong early, gone when we emerge.
  const tunnel = 1 - smoothstep(0.22, 0.9, p);
  // Glyphs streak along rays toward the camera while diving.
  const streak = (1 - ease) * 0.28;
  const warpT = t + (1 - ease) * 16;

  const rows: string[] = [];
  for (let y = 0; y < BACKDROP_ROWS; y += 1) {
    let line = "";
    for (let x = 0; x < BACKDROP_COLUMNS; x += 1) {
      const u = (x + 0.5) / BACKDROP_COLUMNS;
      const v = (y + 0.5) / BACKDROP_ROWS;
      const du = u - WARP_VANISH.u;
      const dv = v - WARP_VANISH.v;
      // Aspect-correct radius for a round mouth on a wide grid.
      const radius = Math.hypot(du, dv * (BACKDROP_ROWS / BACKDROP_COLUMNS));

      let su = WARP_VANISH.u + du * zoom;
      let sv = WARP_VANISH.v + dv * zoom;

      if (streak > 0.001) {
        const flicker = noise(x + Math.floor(warpT * 4), y);
        su += du * streak * (0.45 + flicker);
        sv += dv * streak * (0.45 + flicker);
      }

      const sx = clamp(Math.floor(su * BACKDROP_COLUMNS), 0, BACKDROP_COLUMNS - 1);
      const sy = clamp(Math.floor(sv * BACKDROP_ROWS), 0, BACKDROP_ROWS - 1);

      // Hollow centre early (true portal mouth); walls denser on the ring.
      const mouth = tunnel * (1 - smoothstep(0.015, lerp(0.1, 0.38, ease), radius));
      if (mouth > 0.72) {
        line += " ";
        continue;
      }

      let glyph = sampleBackdropGlyph(sx, sy, warpT, clearanceMix);
      const ring =
        tunnel *
        smoothstep(0.04, 0.18, radius) *
        (1 - smoothstep(0.42, 0.9, radius));
      if (ring > 0.35 && glyph !== " ") {
        const idx = RAMP.indexOf(glyph);
        if (idx >= 0) {
          const boosted = Math.min(RAMP.length - 1, idx + Math.floor(ring * 2.2));
          glyph = RAMP[boosted] ?? glyph;
        }
      }
      // Soften the mouth fringe so it isn't a hard circle of voids.
      if (mouth > 0.35 && noise(x * 3, y * 3) < mouth) {
        glyph = " ";
      }

      line += glyph;
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
export function chartFrame(t: number): string {
  const rows: string[] = [];
  const baseline = CHART_ROWS - 1;
  const flickerPhase = t * 0.28;

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
        // The wash breathes gently with time — the surface line does not, so
        // the data's shape holds still while its interior feels live.
        const depth = (y - surface) / Math.max(1, baseline - surface);
        const flicker =
          depth < 0.12
            ? 0
            : (continuousNoise(x, y, flickerPhase, 4093, 1) - 0.5) * 0.28;
        ink = Math.max(0, Math.min(1, 0.95 - depth * 0.55 + flicker));
      }

      line += CHART_RAMP[Math.min(CHART_RAMP.length - 1, Math.floor(ink * CHART_RAMP.length))];
    }
    rows.push(line.replace(/\s+$/, ""));
  }

  return rows.join("\n");
}

export const HERO_BACKDROP = backdropFrame(0);
export const HERO_BACKDROP_CHART = chartFrame(0);
