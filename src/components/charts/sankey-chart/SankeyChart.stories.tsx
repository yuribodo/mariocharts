import type { Meta, StoryObj } from "@storybook/react";
import { SankeyChart } from "./index";
const nodes = [
  { id: "start", label: "Sign up" },
  { id: "a", label: "Email" },
  { id: "b", label: "Single sign-on" },
  { id: "end", label: "Account created" },
];
const links = [
  { source: "start", target: "a", value: 620 },
  { source: "start", target: "b", value: 380 },
  { source: "a", target: "end", value: 620 },
  { source: "b", target: "end", value: 380 },
];
const meta = {
  title: "Charts/SankeyChart",
  component: SankeyChart,
  args: { nodes, links, height: 400 },
  parameters: { layout: "padded" },
} satisfies Meta<typeof SankeyChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SplitAndMerge: Story = {};
export const SourceColor: Story = { args: { linkColor: "source" } };
export const TargetColor: Story = { args: { linkColor: "target" } };
export const Straight: Story = { args: { curvature: 0 } };
export const EarliestDepth: Story = {
  args: {
    align: "start",
    nodes: [...nodes, { id: "left", label: "Abandoned" }],
    links: [...links, { source: "start", target: "left", value: 100 }],
  },
};
export const DirectPath: Story = {
  args: { links: [...links, { source: "start", target: "end", value: 200 }] },
};
export const Imbalanced: Story = {
  args: {
    links: links.map((l, i) => ({ ...l, value: i === 2 ? 450 : l.value })),
  },
};
export const AllZero: Story = {
  args: { links: links.map((l) => ({ ...l, value: 0 })) },
};
export const SmallBranch: Story = {
  args: { links: links.map((l, i) => ({ ...l, value: i % 2 ? 1 : 999 })) },
};
export const RepeatedLabels: Story = {
  args: { nodes: nodes.map((n) => ({ ...n, label: "Event" })) },
};
export const LongLabels: Story = {
  args: {
    nodes: nodes.map((n) => ({
      ...n,
      label: `${n.label} with a very long event description`,
    })),
  },
};
export const ManyBranches: Story = {
  args: {
    nodes: [
      nodes[0]!,
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `b${i}`,
        label: `Branch ${i + 1}`,
      })),
      nodes[3]!,
    ],
    links: Array.from({ length: 10 }, (_, i) => [
      { source: "start", target: `b${i}`, value: i + 1 },
      { source: `b${i}`, target: "end", value: i + 1 },
    ]).flat(),
  },
};
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};
export const NarrowDirectPath: Story = {
  ...Narrow,
  args: {
    nodes: ["a", "b", "c", "d"].map((id) => ({ id, label: id })),
    links: [
      { source: "a", target: "b", value: 10 },
      { source: "b", target: "c", value: 10 },
      { source: "c", target: "d", value: 10 },
      { source: "a", target: "d", value: 5 },
    ],
  },
};
export const CssColors: Story = { args: { colors: ["var(--primary)"] } };
export const InitialLoading: Story = {
  args: { nodes: [], links: [], loading: true },
};
export const Refreshing: Story = { args: { loading: true } };
export const Empty: Story = { args: { nodes: [], links: [] } };
export const Single: Story = { args: { nodes: [nodes[0]!], links: [] } };
export const Error: Story = {
  args: { error: "Unable to load paths. Try again." },
};
export const Cycle: Story = {
  args: { links: [...links, { source: "end", target: "start", value: 10 }] },
};
export const MissingEndpoint: Story = {
  args: { links: [{ source: "start", target: "missing", value: 10 }] },
};
export const NoAnimation: Story = { args: { animation: false } };
export const CustomInspection: Story = {
  args: {
    tooltipRenderer: (tip) => (
      <p>
        {tip.kind === "node"
          ? tip.data.label
          : `${tip.source.label} → ${tip.target.label}`}
        : {tip.value}
      </p>
    ),
  },
};
