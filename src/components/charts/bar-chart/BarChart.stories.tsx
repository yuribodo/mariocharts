import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BarChart } from "./index";

const signed = [
  { month: "Jan", value: 100 },
  { month: "Feb", value: -100 },
  { month: "Mar", value: 0 },
];
const meta = {
  title: "Charts/BarChart",
  component: BarChart,
  args: { data: signed, x: "month", height: 320, showGrid: true },
} satisfies Meta<typeof BarChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SignedValues: Story = {};
export const HorizontalOutline: Story = {
  args: { orientation: "horizontal", variant: "outline" },
};
export const ZeroValues: Story = {
  args: { data: signed.map((row) => ({ ...row, value: 0 })) },
};
export const MissingValue: Story = {
  args: { data: [{ month: "Jan", value: null }] },
};
export const NoAnimation: Story = { args: { animation: false } };
export const Currency: Story = {
  args: {
    valueFormatter: (value) => `$${value.toFixed(2)}`,
    ariaLabel: "Net revenue",
    description: "Monthly net revenue in USD.",
  },
};

function AsyncExample() {
  const [state, setState] = useState("loading");
  return (
    <>
      <label>
        Chart state{" "}
        <select
          value={state}
          onChange={(event) => setState(event.target.value)}
        >
          <option value="loading">Loading</option>
          <option value="ready">Ready</option>
          <option value="error">Error</option>
          <option value="empty">Empty</option>
        </select>
      </label>
      <BarChart
        data={state === "empty" ? [] : signed}
        x="month"
        loading={state === "loading"}
        error={state === "error" ? "Could not load data." : null}
        height={320}
      />
    </>
  );
}
export const StateTransitions: Story = { render: () => <AsyncExample /> };

export const InitialLoading: Story = { args: { data: [], loading: true } };
export const LoadingSigned: Story = { args: { loading: true } };
export const LoadingHorizontalOutline: Story = {
  args: { loading: true, orientation: "horizontal", variant: "outline" },
};
