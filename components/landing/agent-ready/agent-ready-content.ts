export const AGENT_READY_EYEBROW = "Built for agents";

export const AGENT_READY_HEADLINE = "Your AI already knows how to edit this.";

export const AGENT_READY_SUPPORT =
  "The component lives in your repo — Cursor, Claude, Copilot, and friends just open the file.";

export const AGENT_READY_PROMPT =
  "Add a Mario Charts BarChart for monthly revenue. Vertical, filled, showGrid. Put it in components/charts.";

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
