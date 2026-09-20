import { parseCartesianValue } from "../_shared/cartesian";
import type { ChartDataItem } from "../_shared";
export const FUNNEL_COLORS = [
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#c084fc",
] as const;
export interface FunnelStage<T> {
  data: T;
  index: number;
  label: string;
  value: number;
  rawValue: unknown;
  ratio: number;
  percentage: number | null;
  conversionRate: number | null;
  previousValue: number | null;
  change: number | null;
  color: string;
}
export function funnelPercentage(
  value: number,
  baseline: number,
): number | null {
  if (!baseline) return null;
  const result = (value / baseline) * 100;
  return Number.isFinite(result) ? result : null;
}
export function buildFunnelModel<T extends ChartDataItem>(
  data: readonly T[],
  label: keyof T,
  value: keyof T,
  colors: readonly string[],
) {
  let error: string | null = null;
  const values = data.map((item, index) => {
    const number = parseCartesianValue(item[value]);
    if (number === null || number < 0)
      error ??= `Row ${index + 1}: "${String(value)}" must be a finite, nonnegative number. Supply the missing count or correct the observation.`;
    if (item[label] == null || String(item[label]).trim() === "")
      error ??= `Row ${index + 1}: provide a stage label in "${String(label)}".`;
    return number !== null && number >= 0 ? number : 0;
  });
  if (colors.some((color) => typeof color !== "string" || !color.trim()))
    error ??= "colors must contain nonempty CSS colors.";
  const palette = colors.length ? colors : FUNNEL_COLORS;
  const max = values.reduce((maximum, item) => Math.max(maximum, item), 0);
  const baseline = values[0] ?? 0;
  const stages: FunnelStage<T>[] = data.map((item, index) => {
    const current = values[index]!;
    const previousValue = index ? values[index - 1]! : null;
    return {
      data: item,
      index,
      label: String(item[label] ?? ""),
      rawValue: item[value],
      value: current,
      ratio: max ? current / max : 0,
      percentage: funnelPercentage(current, baseline),
      previousValue,
      conversionRate:
        previousValue === null
          ? null
          : funnelPercentage(current, previousValue),
      change: previousValue === null ? null : current - previousValue,
      color: palette[index % palette.length]!,
    };
  });
  return {
    stages,
    error,
    baseline,
    max,
    hasIncreases: stages.some(
      (stage) => stage.change !== null && stage.change > 0,
    ),
  };
}
