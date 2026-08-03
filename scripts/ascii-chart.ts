import { writeFile } from "node:fs/promises";
import path from "node:path";

import { HERO_CHART_VALUES } from "../components/landing/hero/hero-chart-data";

/**
 * Same vocabulary as scripts/ascii-portrait.ts's RAMP (dark to light, index 0
 * is the blank cell), so the chart field and the portrait field read as one
 * grid when placed side by side.
 */
const RAMP = " .:-=+*#%@";
/** RAMP's blank glyph — `.charAt` instead of `[0]` so this stays a plain `string` under noUncheckedIndexedAccess. */
const BLANK = RAMP.charAt(0);
/** RAMP's densest glyph, used for the single-row "line" trace. */
const INK = RAMP.charAt(RAMP.length - 1);

const OUTPUT = path.join(process.cwd(), "components/landing/hero/hero-chart.ts");

const DEFAULT_COLUMNS = 64;
const DEFAULT_ROWS = 16;

export type ChartForm = "area" | "bars" | "line";

export interface RenderChartOptions {
  columns: number;
  rows: number;
  form: ChartForm;
}

/**
 * Which dataset index column `x` of `columns` samples. Step interpolation
 * (not linear blending) so every column reads as belonging to one value,
 * which is what "bars" needs to group columns into discrete bars.
 */
function valueIndexForColumn(x: number, columns: number, length: number): number {
  const index = Math.floor((x * length) / columns);
  return Math.min(length - 1, Math.max(0, index));
}

/**
 * Row within [0, rows) that value `v` inks, given the dataset's [min, max].
 * Row 0 is the top of the chart: the maximum value must land on row 0, the
 * minimum on row (rows - 1), the baseline. Getting this backwards produces a
 * chart that is upside down.
 */
function rowForValue(v: number, min: number, max: number, rows: number): number {
  const range = max - min || 1;
  const t = (v - min) / range;
  return Math.round((1 - t) * (rows - 1));
}

/**
 * Glyph for a cell `depth` rows below the top of its column's fill (0 at the
 * value's own row, increasing toward the baseline). Denser glyphs sit lower,
 * which is what gives an area fill weight toward the baseline. Never returns
 * the blank glyph, so every filled cell shows visible ink.
 */
function glyphForDepth(depth: number, fillHeight: number): string {
  if (fillHeight <= 1) return INK;

  const usable = RAMP.length - 1;
  const t = depth / (fillHeight - 1);
  const index = 1 + Math.round(t * (usable - 1));
  return RAMP.charAt(Math.min(RAMP.length - 1, index));
}

/**
 * Maps `values` onto a `columns` x `rows` character grid and renders it as
 * one of three forms. Row 0 is the top; the baseline is row (rows - 1).
 *
 * - `area` fills every cell from the value's row down to the baseline.
 * - `bars` fills the same, but blanks the last column of every value's group
 *   (except the very last column overall) so bars read as discrete.
 * - `line` inks only the value's own row per column.
 *
 * Pure function of its inputs — no `Math.random`, no `Date` — so the output
 * never differs between server and client.
 */
export function renderChart(values: readonly number[], options: RenderChartOptions): string {
  const { columns, rows, form } = options;
  const min = Math.min(...values);
  const max = Math.max(...values);

  const grid: string[][] = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => BLANK),
  );

  for (let x = 0; x < columns; x += 1) {
    const index = valueIndexForColumn(x, columns, values.length);
    const value = values[index] ?? min;
    const dataRow = rowForValue(value, min, max, rows);

    if (form === "line") {
      // Ink the value's own row, and — when this column's value differs from
      // the previous column's — also ink the vertical run between the two
      // rows at this column. Without the connector, a line whose row jumps
      // between value groups (which it does at every group boundary, since
      // "line" shares its stepped per-column value with "area"/"bars") reads
      // as disconnected dashes rather than one trace.
      const prevIndex = x > 0 ? valueIndexForColumn(x - 1, columns, values.length) : index;
      const prevValue = values[prevIndex] ?? min;
      const prevRow = rowForValue(prevValue, min, max, rows);

      const top = Math.min(dataRow, prevRow);
      const bottom = Math.max(dataRow, prevRow);
      for (let r = top; r <= bottom; r += 1) {
        const row = grid[r];
        if (row) row[x] = INK;
      }
      continue;
    }

    const isGapColumn =
      form === "bars" &&
      x < columns - 1 &&
      valueIndexForColumn(x + 1, columns, values.length) !== index;

    if (isGapColumn) continue;

    const fillHeight = rows - dataRow;
    for (let r = dataRow; r < rows; r += 1) {
      const row = grid[r];
      if (row) row[x] = glyphForDepth(r - dataRow, fillHeight);
    }
  }

  return grid.map((row) => row.join("").replace(/\s+$/, "")).join("\n");
}

async function main(): Promise<void> {
  const options = { columns: DEFAULT_COLUMNS, rows: DEFAULT_ROWS } as const;

  const area = renderChart(HERO_CHART_VALUES, { ...options, form: "area" });
  const bars = renderChart(HERO_CHART_VALUES, { ...options, form: "bars" });
  const line = renderChart(HERO_CHART_VALUES, { ...options, form: "line" });

  const moduleSource = `// Generated by scripts/ascii-chart.ts from components/landing/hero/hero-chart-data.ts.
// Do not edit by hand — run \`npm run ascii:chart\`.

export const HERO_CHART_COLUMNS = ${DEFAULT_COLUMNS};

export const HERO_CHART_FORMS = [
  ${JSON.stringify(area)},
  ${JSON.stringify(bars)},
  ${JSON.stringify(line)},
] as const;
`;

  await writeFile(OUTPUT, moduleSource, "utf8");
  process.stdout.write(`Wrote ${OUTPUT}\n`);
}

if (process.argv[1] && process.argv[1].includes("ascii-chart")) {
  main().catch((error) => {
    process.stderr.write(String(error) + "\n");
    process.exitCode = 1;
  });
}
