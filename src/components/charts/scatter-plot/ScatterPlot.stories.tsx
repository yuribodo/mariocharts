import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ScatterPlot } from "./index";

const data = [
  { name: "Launch", channel: "Search", spend: 2, revenue: 8, leads: 100 },
  { name: "Always on", channel: "Search", spend: 5, revenue: 16, leads: 250 },
  { name: "Spring", channel: "Search", spend: 8, revenue: 25, leads: 400 },
  { name: "Discovery", channel: "Social", spend: 3, revenue: 7, leads: 75 },
  { name: "Community", channel: "Social", spend: 7, revenue: 14, leads: 150 },
  {
    name: "Retargeting",
    channel: "Social",
    spend: 10,
    revenue: 22,
    leads: 300,
  },
];
const meta = {
  title: "Charts/ScatterPlot",
  component: ScatterPlot,
  args: {
    data,
    x: "spend",
    y: "revenue",
    label: "name",
    series: "channel",
    height: 400,
    showGrid: true,
    showLegend: true,
    xLabel: "Spend ($k)",
    yLabel: "Revenue ($k)",
    sizeLabel: "Leads",
  },
} satisfies Meta<typeof ScatterPlot>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Scatter: Story = {};
export const Bubbles: Story = { args: { size: "leads", sizeRange: [4, 24] } };
export const LinearRadius: Story = {
  args: { ...Bubbles.args, sizeScale: "radius" },
};
export const TrendLines: Story = { args: { showTrendLine: true } };
export const ZeroSize: Story = {
  args: {
    ...Bubbles.args,
    data: data.map((p, i) => ({ ...p, leads: i === 1 ? 0 : p.leads })),
  },
};
export const EqualSize: Story = {
  args: { ...Bubbles.args, data: data.map((p) => ({ ...p, leads: 100 })) },
};
export const SinglePoint: Story = {
  args: { data: data.slice(0, 1), showTrendLine: true },
};
export const Overlapping: Story = {
  args: {
    ...Bubbles.args,
    data: data.map((p) => ({ ...p, spend: 5, revenue: 12 })),
  },
};
export const SameX: Story = {
  args: { data: data.map((p) => ({ ...p, spend: 5 })), showTrendLine: true },
};
export const SameY: Story = {
  args: { data: data.map((p) => ({ ...p, revenue: 15 })), showTrendLine: true },
};
export const Signed: Story = {
  args: {
    data: data.map((p) => ({
      ...p,
      spend: p.spend - 5,
      revenue: p.revenue - 15,
    })),
  },
};
export const Clipped: Story = {
  args: {
    ...Bubbles.args,
    xDomain: [2, 8],
    yDomain: [5, 20],
    showTrendLine: true,
  },
};
export const OutsideViewport: Story = {
  args: { xDomain: [40, 50], yDomain: [40, 50] },
};
export const InitialLoading: Story = { args: { data: [], loading: true } };
export const Refreshing: Story = {
  args: { ...Bubbles.args, loading: true, showTrendLine: true },
};
export const Empty: Story = { args: { data: [] } };
export const Error: Story = {
  args: { error: "Unable to load campaign performance." },
};
export const InvalidCoordinate: Story = {
  args: { data: [{ ...data[0]!, spend: NaN }] },
};
export const NegativeSize: Story = {
  args: { ...Bubbles.args, data: [{ ...data[0]!, leads: -1 }] },
};
export const LongLabels: Story = {
  args: {
    xLabel:
      "Total campaign spend across all territories in thousands of dollars",
    data: data.map((p) => ({
      ...p,
      name: `${p.name} campaign for enterprise customers across all territories`,
      channel: `${p.channel} acquisition channel for enterprise accounts`,
    })),
  },
};
export const NoAnimation: Story = { args: { animation: false } };
export const KeyboardActions: Story = { render: () => <Actions /> };
function Actions() {
  const [selection, setSelection] = useState("");
  return (
    <>
      <ScatterPlot
        data={data}
        x="spend"
        y="revenue"
        label="name"
        series="channel"
        size="leads"
        showLegend
        onPointClick={(point, index) => setSelection(`${index}: ${point.name}`)}
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
          {["loading", "ready", "empty", "error"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <ScatterPlot
        data={state === "empty" ? [] : data}
        x="spend"
        y="revenue"
        series="channel"
        size="leads"
        loading={state === "loading"}
        error={state === "error" ? "Offline" : null}
        showLegend
      />
    </>
  );
}
