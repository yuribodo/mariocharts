import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RadarChart } from "./index";
const axes = [
  { key: "speed", label: "Speed", min: 0, max: 100 },
  { key: "quality", label: "Quality", min: 0, max: 100 },
  { key: "reliability", label: "Reliability", min: 0, max: 100 },
  { key: "support", label: "Support", min: 0, max: 100 },
  { key: "features", label: "Features", min: 0, max: 100 },
] as const;
const series = [
  {
    id: "atlas",
    name: "Atlas",
    data: {
      speed: 90,
      quality: 70,
      reliability: 80,
      support: 60,
      features: 85,
    },
  },
  {
    id: "nova",
    name: "Nova",
    data: {
      speed: 65,
      quality: 85,
      reliability: 60,
      support: 90,
      features: 70,
    },
  },
];
const meta = {
  title: "Charts/RadarChart",
  component: RadarChart,
  args: { axes, series, height: 400 },
} satisfies Meta<typeof RadarChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Polygon: Story = {};
export const Circular: Story = { args: { gridType: "circular" } };
export const HiddenDots: Story = { args: { showDots: false } };
export const SingleSeries: Story = { args: { series: series.slice(0, 1) } };
export const InitialLoading: Story = { args: { series: [], loading: true } };
export const Refreshing: Story = { args: { loading: true } };
export const Empty: Story = { args: { series: [] } };
export const InvalidValue: Story = {
  args: {
    series: [{ ...series[0]!, data: { ...series[0]!.data, speed: NaN } }],
  },
};
export const OutsideRange: Story = {
  args: {
    series: [{ ...series[0]!, data: { ...series[0]!.data, speed: 120 } }],
  },
};
export const SignedValues: Story = {
  args: {
    axes: axes.map((axis) => ({ ...axis, min: -100 })),
    series: [
      {
        ...series[0]!,
        data: { ...series[0]!.data, speed: -50, reliability: -80 },
      },
    ],
  },
};
export const AllZero: Story = {
  args: {
    series: [
      {
        id: "zero",
        name: "Zero",
        data: { speed: 0, quality: 0, reliability: 0, support: 0, features: 0 },
      },
    ],
  },
};
export const LongLabels: Story = {
  args: {
    axes: axes.map((axis) => ({
      ...axis,
      label: `${axis.label} of enterprise product delivery`,
    })),
  },
};
export const NoAnimation: Story = { args: { animation: false } };
export const KeyboardActions: Story = { render: () => <Actions /> };
function Actions() {
  const [selection, setSelection] = useState("");
  return (
    <>
      <RadarChart
        axes={axes}
        series={series}
        showDots={false}
        onSeriesClick={(item) => setSelection(item.name)}
        onAxisClick={(axis) => setSelection(axis.label)}
      />
      <p role="status">{selection}</p>
    </>
  );
}
export const StateTransitions: Story = { render: () => <States /> };
function States() {
  const [state, setState] = useState("loading");
  return (
    <>
      <label>
        State{" "}
        <select value={state} onChange={(e) => setState(e.target.value)}>
          <option value="loading">Loading</option>
          <option value="ready">Ready</option>
          <option value="empty">Empty</option>
          <option value="error">Error</option>
        </select>
      </label>
      <RadarChart
        axes={axes}
        series={state === "empty" ? [] : series}
        loading={state === "loading"}
        error={state === "error" ? "Offline" : null}
        showLegend
      />
    </>
  );
}
