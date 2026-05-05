import type { ChartDataItem } from "./types";

export function formatValue(value: unknown): string {
  if (typeof value === "number") {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toLocaleString();
  }
  return String(value);
}

export function getNumericValue(
  data: ChartDataItem,
  key: keyof ChartDataItem
): number {
  const value = data[key];
  if (typeof value === "number" && isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace(/[,$%\s]/g, ""));
    if (isFinite(parsed)) return parsed;
  }
  return 0;
}

export function getNumericValueOrNull(
  data: ChartDataItem,
  key: keyof ChartDataItem
): number | null {
  const value = data[key];
  if (typeof value === "number" && isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace(/[,$%\s]/g, ""));
    if (isFinite(parsed)) return parsed;
  }
  return null;
}

export function calculateNiceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const range = max - min;
  const roughStep = range / (count - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalizedStep = roughStep / magnitude;
  let niceStep: number;
  if (normalizedStep <= 1) niceStep = magnitude;
  else if (normalizedStep <= 2) niceStep = 2 * magnitude;
  else if (normalizedStep <= 5) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;
  const niceMin = Math.floor(min / niceStep) * niceStep;
  const niceMax = Math.ceil(max / niceStep) * niceStep;
  const ticks: number[] = [];
  for (let tick = niceMin; tick <= niceMax; tick += niceStep) {
    ticks.push(tick);
  }
  return ticks;
}

export function getGridDasharray(gridStyle: "solid" | "dashed" | "dotted"): string {
  switch (gridStyle) {
    case "solid": return "none";
    case "dotted": return "2 4";
    case "dashed":
    default: return "4 4";
  }
}
