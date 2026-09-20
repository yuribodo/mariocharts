import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PieChart } from "./index";
const data = [
  { name: "Starter", amount: 18 },
  { name: "Pro", amount: 42 },
  { name: "Team", amount: 32 },
  { name: "Enterprise", amount: 28 },
];
const meta = {
  title: "Charts/PieChart",
  component: PieChart,
  args: { data, label: "name", value: "amount", height: 340, showLegend: true },
} satisfies Meta<typeof PieChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Donut: Story = {};
export const Rounded: Story = { args: { cornerRadius: 8 } };
export const FullyRounded: Story = { args: { cornerRadius: 1000 } };
export const RoundedPie: Story = { args: { variant: "pie", cornerRadius: 8 } };
export const RoundedSemicircle: Story = {
  args: { variant: "semi", cornerRadius: 8 },
};
export const Pie: Story = { args: { variant: "pie" } };
export const Semicircle: Story = { args: { variant: "semi" } };
export const SingleCategory: Story = { args: { data: data.slice(0, 1) } };
export const ZeroRows: Story = {
  args: { data: [{ name: "Free", amount: 0 }, ...data] },
};
export const AllZero: Story = {
  args: { data: data.map((row) => ({ ...row, amount: 0 })) },
};
export const SmallShares: Story = {
  args: {
    data: [
      { name: "Large", amount: 999 },
      { name: "Small", amount: 0.5 },
      { name: "Smaller", amount: 0.5 },
    ],
  },
};
export const InvalidNumber: Story = {
  args: { data: [{ name: "Invalid", amount: NaN }] },
};
export const InvalidRadius: Story = { args: { innerRadius: 1 } };
export const LongLabels: Story = {
  args: {
    data: data.map((row) => ({
      ...row,
      name: `${row.name} annual subscription revenue`,
    })),
  },
};
export const InitialLoading: Story = { args: { data: [], loading: true } };
export const Refreshing: Story = { args: { loading: true } };
export const NoAnimation: Story = { args: { animation: false } };
export const CenterTotal: Story = {
  args: { centerContent: ({ total }) => <span>{total}</span> },
};
export const MultipleInstances: Story = {
  render: () => (
    <>
      <PieChart data={data} value="amount" label="name" />
      <PieChart data={data} value="amount" label="name" variant="semi" />
    </>
  ),
};
function States() {
  const [state, setState] = useState("loading");
  return (
    <>
      <label>
        Chart state{" "}
        <select value={state} onChange={(e) => setState(e.target.value)}>
          <option value="loading">Loading</option>
          <option value="ready">Ready</option>
          <option value="empty">Empty</option>
          <option value="error">Error</option>
        </select>
      </label>
      <PieChart
        data={state === "empty" ? [] : data}
        value="amount"
        label="name"
        loading={state === "loading"}
        error={state === "error" ? "Offline" : null}
        showLegend
      />
    </>
  );
}
export const StateTransitions: Story = { render: () => <States /> };
