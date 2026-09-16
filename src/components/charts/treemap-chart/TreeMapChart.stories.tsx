import type { Meta, StoryObj } from "@storybook/react";
import { TreeMapChart } from "./index";
const data = [
  {
    name: "Software",
    children: [
      { name: "Desktop", value: 300 },
      { name: "Mobile", value: 200 },
      { name: "API", value: 100 },
    ],
  },
  {
    name: "Hardware",
    children: [
      { name: "Devices", value: 150 },
      { name: "Accessories", value: 100 },
    ],
  },
  {
    name: "Services",
    children: [
      { name: "Training", value: 90 },
      { name: "Support", value: 60 },
    ],
  },
];
const meta = {
  title: "Charts/TreeMapChart",
  component: TreeMapChart,
  args: { data, height: 400 },
  parameters: { layout: "padded" },
} satisfies Meta<typeof TreeMapChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Nested: Story = {};
export const Flat: Story = {
  args: { variant: "flat", gap: 0, borderRadius: 0 },
};
export const Binary: Story = { args: { layout: "binary" } };
export const SliceAndDice: Story = { args: { layout: "slice-dice" } };
export const OneLevel: Story = { args: { maxDepth: 1 } };
export const Deep: Story = {
  args: { data: [{ name: "Company", children: data }], maxDepth: 3 },
};
export const InputOrder: Story = { args: { sort: "input" } };
export const Rounded: Story = { args: { borderRadius: 16, gap: 8 } };
export const Percentages: Story = { args: { showPercentages: true } };
export const NoNavigation: Story = { args: { drillDown: false } };
export const Single: Story = {
  args: { data: [{ name: "Category", value: 100 }] },
};
export const EmptyGroup: Story = {
  args: { data: [{ name: "Empty group", children: [] }, ...data] },
};
export const RepeatedNames: Story = {
  args: {
    data: [
      {
        name: "Group",
        children: [
          { name: "Other", value: 20 },
          { name: "Other", value: 10 },
        ],
      },
      { name: "Group", value: 20 },
    ],
  },
};
export const LongNames: Story = {
  args: {
    data: data.map((group) => ({
      ...group,
      name: `${group.name} and international operations`,
      children: group.children.map((n) => ({
        ...n,
        name: `${n.name} enterprise customer accounts`,
      })),
    })),
  },
};
export const TinyAndZero: Story = {
  args: {
    data: [
      { name: "Main", value: 9999 },
      { name: "Tiny", value: 1 },
      { name: "Zero", value: 0 },
    ],
  },
};
export const AllZero: Story = {
  args: {
    data: [
      { name: "A", value: 0 },
      { name: "B", value: 0 },
    ],
  },
};
export const Many: Story = {
  args: {
    data: Array.from({ length: 120 }, (_, i) => ({
      name: `Item ${i + 1}`,
      value: 121 - i,
    })),
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
export const CssColors: Story = {
  args: { colors: ["var(--primary)", "gold", "rebeccapurple"] },
};
export const TransparentColors: Story = {
  args: { colors: ["rgb(59 130 246 / .25)", "rgb(16 185 129 / .25)"] },
};
export const NodeColor: Story = {
  args: { data: [{ ...data[0]!, color: "rebeccapurple" }, data[1]!] },
};
export const InitialLoading: Story = { args: { data: [], loading: true } };
export const Refreshing: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
export const Error: Story = { args: { error: "Unable to load composition." } };
export const Missing: Story = { args: { data: [{ name: "Missing" }] } };
export const Negative: Story = {
  args: { data: [{ name: "Negative", value: -1 }] },
};
export const NoAnimation: Story = { args: { animation: false } };
export const CustomInspection: Story = {
  args: {
    tooltipRenderer: (tip) => (
      <p>
        {tip.path.join(" / ")}: {tip.value} (
        {tip.parentPercentage?.toFixed(1) ?? "—"}% of parent)
      </p>
    ),
  },
};
