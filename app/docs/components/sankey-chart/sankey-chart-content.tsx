"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import {
  SankeyChart,
  type SankeyNode,
  type SankeyLink,
} from "@/src/components/charts/sankey-chart";
import { APIReference } from "@/components/ui/api-reference";
import { CodeBlock } from "@/components/ui/code-block";
import { CommandSnippet } from "@/components/ui/command-snippet";
const baseNodes: SankeyNode[] = [
  { id: "start", label: "Sign up", color: "#3b82f6" },
  { id: "email", label: "Email", color: "#8b5cf6" },
  { id: "sso", label: "Single sign-on", color: "#06b6d4" },
  { id: "complete", label: "Account created", color: "#10b981" },
];
const baseLinks: SankeyLink[] = [
  { source: "start", target: "email", value: 620 },
  { source: "start", target: "sso", value: 380 },
  { source: "email", target: "complete", value: 620 },
  { source: "sso", target: "complete", value: 380 },
];
function fixture(name: string): { nodes: SankeyNode[]; links: SankeyLink[] } {
  if (name === "loss")
    return {
      nodes: [
        ...baseNodes,
        { id: "left", label: "Abandoned", color: "#f59e0b" },
      ],
      links: [
        baseLinks[0]!,
        baseLinks[1]!,
        { source: "email", target: "complete", value: 450 },
        { source: "sso", target: "complete", value: 360 },
        { source: "email", target: "left", value: 170 },
        { source: "sso", target: "left", value: 20 },
      ],
    };
  if (name === "skip")
    return {
      nodes: baseNodes,
      links: [
        ...baseLinks,
        { source: "start", target: "complete", value: 200 },
      ],
    };
  if (name === "repeated")
    return {
      nodes: [
        ...baseNodes,
        { id: "again", label: "Sign up", color: "#f59e0b" },
      ],
      links: [
        ...baseLinks,
        { source: "complete", target: "again", value: 100 },
      ],
    };
  if (name === "many")
    return {
      nodes: [
        baseNodes[0]!,
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `branch-${i}`,
          label: `Channel ${i + 1}`,
        })),
        baseNodes[3]!,
      ],
      links: Array.from({ length: 10 }, (_, i) => [
        { source: "start", target: `branch-${i}`, value: (10 - i) * 10 },
        { source: `branch-${i}`, target: "complete", value: (10 - i) * 10 },
      ]).flat(),
    };
  if (name === "long")
    return {
      nodes: baseNodes.map((n) => ({
        ...n,
        label: `${n.label} — enterprise onboarding experience`,
      })),
      links: baseLinks,
    };
  if (name === "zero")
    return {
      nodes: baseNodes,
      links: baseLinks.map((l) => ({ ...l, value: 0 })),
    };
  if (name === "tiny")
    return {
      nodes: baseNodes,
      links: baseLinks.map((l, i) => ({ ...l, value: i % 2 ? 1 : 999 })),
    };
  if (name === "cycle")
    return {
      nodes: baseNodes,
      links: [...baseLinks, { source: "complete", target: "start", value: 10 }],
    };
  if (name === "missing")
    return {
      nodes: baseNodes,
      links: [...baseLinks, { source: "start", target: "absent", value: 10 }],
    };
  if (name === "negative")
    return {
      nodes: baseNodes,
      links: [{ source: "start", target: "email", value: -10 }],
    };
  if (name === "single") return { nodes: [baseNodes[0]!], links: [] };
  return { nodes: baseNodes, links: baseLinks };
}
const example = `import { SankeyChart } from "@/components/charts/sankey-chart";

const nodes = [
  { id: "start", label: "Sign up" },
  { id: "email", label: "Email" },
  { id: "sso", label: "Single sign-on" },
  { id: "done", label: "Account created" },
];
const links = [
  { source: "start", target: "email", value: 620 },
  { source: "start", target: "sso", value: 380 },
  { source: "email", target: "done", value: 620 },
  { source: "sso", target: "done", value: 380 },
];

export function SignupPaths() {
  return <SankeyChart nodes={nodes} links={links}
    height={400} ariaLabel="Signup paths" />;
}`;
const props = [
  {
    name: "nodes",
    type: "readonly N[]",
    required: true,
    description:
      "Each node has a unique string id, label and optional CSS color. Extra fields retain their inferred types in callbacks. Input order orders nodes within a column.",
  },
  {
    name: "links",
    type: "readonly L[]",
    required: true,
    description:
      "Each connection has source/target node IDs and a finite nonnegative numeric value. Supply aggregated transition volumes in consistent units. Duplicate connections remain separate observations.",
  },
  {
    name: "align",
    type: "'justify' | 'start'",
    default: "'justify'",
    description:
      "Place terminal nodes in the final column, or at their earliest depth. Connections spanning columns route below intermediate nodes.",
  },
  {
    name: "linkColor",
    type: "'gradient' | 'source' | 'target'",
    default: "'gradient'",
    description:
      "A gradient follows source and destination colors. Solid options color each ribbon by one endpoint.",
  },
  {
    name: "curvature",
    type: "number",
    default: "0.5",
    description:
      "0–1 curve tension; 0 produces straight connections between adjacent columns. Connections skipping columns keep a curved route around intervening nodes.",
  },
  {
    name: "colors",
    type: "readonly string[]",
    description:
      "Palette for nodes without a color. CSS variables work; empty arrays fall back to the defaults.",
  },
  {
    name: "nodeWidth / nodeGap",
    type: "number",
    default: "18 / 24",
    description:
      "Node width (1–80px) and vertical gap (0–200px). Label space and internal scrolling prevent overlaps without inflating small values.",
  },
  {
    name: "showValues",
    type: "boolean",
    default: "true",
    description:
      "Show each node's flow volume: max(incoming total, outgoing total). Incoming and outgoing totals stay available on inspection.",
  },
  {
    name: "height / className",
    type: "number / string",
    default: "400",
    description:
      "Stable frame height and root styling. Dense or narrow views scroll within the frame.",
  },
  {
    name: "animation",
    type: "boolean",
    default: "true",
    description:
      "Reveal connections from left to right. Reduced motion and keyboard focus complete the reveal immediately.",
  },
  {
    name: "loading / error",
    type: "boolean / string | null",
    description:
      "Loading retains available geometry; initial loading uses a branched skeleton. Errors and empty states keep the same frame.",
  },
  {
    name: "valueFormatter",
    type: "(value: number) => string",
    description:
      "Format labels, inspection values, the accessible table in your unit.",
  },
  {
    name: "ariaLabel / description",
    type: "string",
    description:
      "Accessible chart name and optional explanation of the supplied data.",
  },
  {
    name: "onNodeClick / onLinkClick",
    type: "(item, index) => void",
    description:
      "Original node or connection and input index, including zero-valued observations. Works with pointer, touch, Enter and Space.",
  },
  {
    name: "tooltipRenderer",
    type: "(inspection: SankeyInspection<N, L>) => ReactNode",
    description:
      "A discriminated node/link payload with original data. Node inspection includes incoming/outgoing totals. Link inspection includes endpoints and its shares of source outgoing/target incoming; a zero denominator returns null.",
  },
];
export function SankeyChartContent() {
  const [dataset, setDataset] = useState("split");
  const [state, setState] = useState("ready");
  const [align, setAlign] = useState<"justify" | "start">("justify");
  const [color, setColor] = useState<"gradient" | "source" | "target">(
    "gradient",
  );
  const [curvature, setCurvature] = useState(0.5);
  const [gap, setGap] = useState(24);
  const [values, setValues] = useState(true);
  const [animation, setAnimation] = useState(true);
  const [replay, setReplay] = useState(0);
  const [selection, setSelection] = useState(
    "Select a node or connection to inspect its original observation.",
  );
  const data = useMemo(() => fixture(dataset), [dataset]);
  const empty = state === "empty" || state === "initial-loading";
  const selectClass =
    "h-9 w-full rounded-md border bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <div className="min-w-0 space-y-10">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Sankey Chart
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          One journey, multiple paths. Follow branches from a shared entry to a
          common destination, with ribbons sized to the volume moving between
          steps.
        </p>
        <CommandSnippet command="npx mario-charts@latest add sankey-chart" />
      </div>
      <section aria-labelledby="sankey-playground" className="space-y-5">
        <div>
          <h2
            id="sankey-playground"
            className="text-xl font-semibold tracking-tight"
          >
            Playground
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            620 choose email. 380 choose single sign-on. Both reach the same
            destination.
          </p>
        </div>
        <div className="overflow-hidden rounded-md border bg-card">
          <div className="grid grid-cols-2 gap-4 border-b p-4 md:grid-cols-4">
            <label className="grid gap-2 text-xs">
              Dataset
              <select
                aria-label="Dataset"
                className={selectClass}
                value={dataset}
                onChange={(e) => {
                  setDataset(e.target.value);
                  setSelection(
                    "Select a node or connection to inspect its original observation.",
                  );
                }}
              >
                {[
                  ["split", "Split and merge"],
                  ["loss", "Explicit abandonment"],
                  ["skip", "Direct path"],
                  ["repeated", "Repeated event"],
                  ["many", "Ten channels"],
                  ["long", "Long labels"],
                  ["tiny", "Small branch"],
                  ["zero", "All zero"],
                  ["single", "Single node"],
                  ["cycle", "Invalid cycle"],
                  ["missing", "Missing endpoint"],
                  ["negative", "Negative volume"],
                ].map(([value, name]) => (
                  <option key={value} value={value}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-xs">
              Connection color
              <select
                aria-label="Connection color"
                className={selectClass}
                value={color}
                onChange={(e) => setColor(e.target.value as typeof color)}
              >
                <option value="gradient">Source → destination</option>
                <option value="source">Source</option>
                <option value="target">Destination</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs">
              Alignment
              <select
                aria-label="Alignment"
                className={selectClass}
                value={align}
                onChange={(e) => setAlign(e.target.value as typeof align)}
              >
                <option value="justify">Align destinations</option>
                <option value="start">Earliest step</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs">
              State
              <select
                aria-label="State"
                className={selectClass}
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                {[
                  ["ready", "Ready"],
                  ["loading", "Refreshing"],
                  ["initial-loading", "Initial loading"],
                  ["empty", "Empty"],
                  ["error", "Error"],
                ].map(([value, name]) => (
                  <option key={value} value={value}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-b px-4 py-3 text-xs">
            <label className="flex items-center gap-2">
              Curve
              <input
                aria-label="Curve"
                className="w-24"
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={curvature}
                onChange={(e) => setCurvature(Number(e.target.value))}
              />
            </label>
            <label className="flex items-center gap-2">
              Gap
              <input
                aria-label="Gap"
                className="w-24"
                type="range"
                min={0}
                max={64}
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={values}
                onChange={(e) => setValues(e.target.checked)}
              />
              Values
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={animation}
                onChange={(e) => setAnimation(e.target.checked)}
              />
              Animation
            </label>
            <button
              type="button"
              className="flex items-center gap-2 rounded border px-3 py-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setReplay((v) => v + 1)}
            >
              <RotateCcw size={12} />
              Replay
            </button>
          </div>
          <div className="min-w-0 bg-background p-2 sm:p-5">
            <SankeyChart
              key={replay}
              nodes={empty ? [] : data.nodes}
              links={empty ? [] : data.links}
              align={align}
              linkColor={color}
              curvature={curvature}
              nodeGap={gap}
              showValues={values}
              animation={animation}
              loading={state === "loading" || state === "initial-loading"}
              error={
                state === "error" ? "Unable to load paths. Try again." : null
              }
              ariaLabel="Signup paths"
              onNodeClick={(node, i) =>
                setSelection(`Node ${i}: ${node.label} (${node.id})`)
              }
              onLinkClick={(link, i) =>
                setSelection(
                  `Connection ${i}: ${link.source} → ${link.target}, volume ${link.value}`,
                )
              }
            />
          </div>
          <p
            role="status"
            className="border-t px-4 py-3 text-xs text-muted-foreground"
          >
            {selection}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Hover or focus to trace connected branches. Use arrow keys to inspect
          nodes, then connections; Enter selects. On narrow screens, scroll
          horizontally to follow the journey.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Usage</h2>
        <CodeBlock code={example} language="tsx" />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Reading a flow</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Each ribbon represents one supplied transition. The email branch
          carries 620 of the 1,000 outgoing transitions, so its share is 62%.
          The destination receives 620 + 380 = 1,000. The chart does not
          deduplicate people or infer transitions from stage totals.
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          A node uses the larger of its incoming and outgoing totals for its
          height. An imbalance stays visible in inspection. To show abandonment,
          supply an explicit destination and its measured connections. A zero
          volume has no painted area, but remains inspectable.
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          Connections must form an acyclic graph. For a return visit, give the
          repeated event a new ID at a later step. Highlighting shows reachable
          connections; aggregated volumes cannot recover an individual
          user&apos;s complete route through a merge.
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          For conversion through one ordered sequence, use the{" "}
          <Link
            href="/docs/components/funnel-chart"
            className="text-foreground underline underline-offset-4"
          >
            Funnel Chart
          </Link>
          .
        </p>
      </section>
      <APIReference props={props} />
    </div>
  );
}
