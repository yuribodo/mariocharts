export interface ChartIndexEntry {
  readonly name: string;
  readonly href: string;
  readonly summary: string;
}

export const CHART_INDEX: readonly ChartIndexEntry[] = [
  { name: "Bar Chart", href: "/docs/components/bar-chart", summary: "Compare values across categories." },
  { name: "Line Chart", href: "/docs/components/line-chart", summary: "Follow a value over time." },
  { name: "Area Chart", href: "/docs/components/area-chart", summary: "Show volume beneath a trend." },
  { name: "Pie Chart", href: "/docs/components/pie-chart", summary: "Read parts against a whole." },
  { name: "Radar Chart", href: "/docs/components/radar-chart", summary: "Weigh several dimensions at once." },
  { name: "Treemap", href: "/docs/components/treemap", summary: "Rank nested shares by area." },
] as const;
