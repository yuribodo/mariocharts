export type Orientation = "vertical" | "horizontal";
export type Variant = "filled" | "outline";

export interface WorkbenchState {
  orientation: Orientation;
  variant: Variant;
  animation: boolean;
}

export const monthlyRevenue = [
  { month: "Jan", revenue: 4500 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 5900 },
  { month: "Jun", revenue: 7200 },
] as const;

export const chartColors = [
  "var(--chart-blue)",
  "var(--chart-green)",
  "var(--chart-amber)",
  "var(--chart-coral)",
  "var(--chart-violet)",
  "var(--chart-cyan)",
];

/**
 * 1-based line numbers of each controllable prop in `buildWorkbenchCode`.
 *
 * Every prop keeps its own line in every state — `animation` renders as
 * `animation` or `animation={false}` rather than disappearing — so these
 * numbers stay fixed and the tinted line never points at the wrong prop.
 */
export const PROP_LINES = {
  orientation: 7,
  variant: 8,
  animation: 9,
} as const;

export function buildWorkbenchCode({
  orientation,
  variant,
  animation,
}: WorkbenchState): string {
  return `import { BarChart } from "@/components/charts/bar-chart";

<BarChart
  data={monthlyRevenue}
  x="month"
  y="revenue"
  orientation="${orientation}"
  variant="${variant}"
  animation${animation ? "" : "={false}"}
  showGrid
/>`;
}
