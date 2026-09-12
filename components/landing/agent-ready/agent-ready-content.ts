export const AGENT_READY_EYEBROW = "Built for agents";

export const AGENT_READY_HEADLINE = "Give your agent a head start on charts.";

export const AGENT_READY_SUPPORT =
  "Install the Mario Charts skill to build dashboards, choose charts, and connect your data. Your agent works with React source it can read and edit.";

export const AGENT_READY_PROMPT =
  "Use https://mariocharts.com/docs/ai-agents.md to build a dashboard for my React website with revenue, traffic, and conversion charts using Mario Charts. Follow my project's styling and connect the available data.";

export const AGENT_READY_BULLETS = [
  {
    title: "Copy-paste, not a black box",
    body: "The chart ships as source in @/components, not behind an opaque npm package.",
  },
  {
    title: "Plain React + Tailwind",
    body: "No DSL, no magic config file — agents edit familiar code.",
  },
  {
    title: "Typed props",
    body: "Orientation, variant, showGrid, and the rest autocomplete without inventing an API.",
  },
] as const;
