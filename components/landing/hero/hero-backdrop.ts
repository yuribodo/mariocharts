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

/** Sparse on purpose: the backdrop is texture, and must never fight the copy. */
const RAMP = " .:-=+";

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
      const value = (drift * 0.65 + grain * 0.35) ** 2.1;
      const open = value * (1 - clearance(x, y));
      line += RAMP[Math.min(RAMP.length - 1, Math.floor(open * RAMP.length))];
    }
    rows.push(line);
  }

  return rows.join("\n");
}

export const HERO_BACKDROP = buildBackdrop();
