import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { LineChart } from "./index";
const data = [
  { month: "Jan", revenue: 100, costs: 60 },
  { month: "Feb", revenue: 160, costs: 80 },
  { month: "Mar", revenue: null, costs: 90 },
  { month: "Apr", revenue: 120, costs: 70 },
  { month: "May", revenue: 180, costs: 100 },
];
const keys = ["revenue", "costs"] as const;
const meta = {
  title: "Charts/LineChart",
  component: LineChart,
  args: {
    data,
    x: "month",
    y: keys,
    height: 320,
    showGrid: true,
    showLegend: true,
  },
} satisfies Meta<typeof LineChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const MissingObservations: Story = {};
export const ConnectedGaps: Story = { args: { connectNulls: true } };
export const Step: Story = { args: { curve: "step" } };
export const Natural: Story = { args: { curve: "natural" } };
export const AreasWithGaps: Story = { args: { showArea: true } };
export const KeyboardWithoutDots: Story = { args: { showDots: false } };
export const Constant: Story = {
  args: { data: data.map((row) => ({ ...row, revenue: 100, costs: 100 })) },
};
export const SingleObservation: Story = {
  args: { data: data.slice(0, 1), showDots: false },
};
export const AllMissing: Story = {
  args: { data: data.map((row) => ({ ...row, revenue: null, costs: null })) },
};
export const InitialLoading: Story = { args: { data: [], loading: true } };
export const Refreshing: Story = { args: { loading: true, showArea: true } };
export const NoAnimation: Story = { args: { animation: false } };
export const MultipleInstances: Story = {
  render: () => (
    <>
      <LineChart data={data} x="month" y={keys} showArea />
      <LineChart
        data={data}
        x="month"
        y={keys}
        showArea
        colors={["#f59e0b", "#8b5cf6"]}
      />
    </>
  ),
};
function States() {
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
          <option value="empty">Empty</option>
          <option value="error">Error</option>
        </select>
      </label>
      <LineChart
        data={state === "empty" ? [] : data}
        x="month"
        y={keys}
        loading={state === "loading"}
        error={state === "error" ? "Offline" : null}
        showLegend
      />
    </>
  );
}
export const StateTransitions: Story = { render: () => <States /> };
