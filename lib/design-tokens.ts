export const chartSeries = {
  blue: "var(--chart-blue)",
  green: "var(--chart-green)",
  amber: "var(--chart-amber)",
  coral: "var(--chart-coral)",
  violet: "var(--chart-violet)",
  cyan: "var(--chart-cyan)",
} as const;

export type ChartSeriesName = keyof typeof chartSeries;
