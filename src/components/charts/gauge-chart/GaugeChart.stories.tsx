import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GaugeChart } from "./index";
const zones = [
  { from: 0, to: 60, color: "#22c55e", label: "Normal" },
  { from: 60, to: 80, color: "#f59e0b", label: "High" },
  { from: 80, to: 100, color: "#ef4444", label: "Critical" },
];
const meta = {
  title: "Charts/GaugeChart",
  component: GaugeChart,
  args: { value: 65, zones, unit: "%", label: "CPU utilization", height: 360 },
} satisfies Meta<typeof GaugeChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const FlatEnds: Story = { args: { strokeLinecap: "butt" } };
export const Thin: Story = { args: { strokeWidth: 8 } };
export const Thick: Story = { args: { strokeWidth: 40 } };
export const Minimum: Story = { args: { value: 0 } };
export const Maximum: Story = { args: { value: 100 } };
export const Boundary: Story = { args: { value: 60 } };
export const AboveRange: Story = { args: { value: 115 } };
export const BelowRange: Story = { args: { value: -15 } };
export const Signed: Story = {
  args: {
    min: -50,
    max: 50,
    value: 15,
    unit: "°C",
    label: "Temperature offset",
    zones: [
      { from: -50, to: 0, color: "#3b82f6", label: "Below reference" },
      { from: 0, to: 50, color: "#f59e0b", label: "Above reference" },
    ],
  },
};
export const NonzeroMinimum: Story = {
  args: {
    min: 20,
    max: 120,
    value: 70,
    unit: "kPa",
    label: "Operating pressure",
    zones: [{ from: 20, to: 120, color: "#3b82f6", label: "Operating range" }],
  },
};
export const ZoneGap: Story = { args: { zones: [zones[0]!, zones[2]!] } };
export const RepeatedColors: Story = {
  args: { zones: zones.map((zone) => ({ ...zone, color: "#3b82f6" })) },
};
export const UnorderedZones: Story = { args: { zones: [...zones].reverse() } };
export const LongLabels: Story = {
  args: {
    label:
      "CPU utilization across all enterprise production workloads in North America",
    zones: zones.map((zone) => ({
      ...zone,
      label: `${zone.label} operating range for enterprise workloads`,
    })),
  },
};
export const InitialLoading: Story = {
  args: { value: NaN, zones: [], loading: true },
};
export const Refreshing: Story = { args: { loading: true } };
export const Empty: Story = { args: { zones: [] } };
export const Error: Story = {
  args: { error: "Unable to load the measurement." },
};
export const InvalidValue: Story = { args: { value: NaN } };
export const InvalidRange: Story = { args: { min: 100, max: 0 } };
export const OverlappingZones: Story = {
  args: { zones: [zones[0]!, { ...zones[1]!, from: 50 }, zones[2]!] },
};
export const NoAnimation: Story = { args: { animation: false } };
export const CustomInspection: Story = {
  args: {
    tooltipRenderer: (item) => (
      <div>
        <p>
          Actual: {item.value}
          {item.unit}
        </p>
        <p>Arc: {item.clampedValue}</p>
        <p>Zone: {item.zone?.label ?? "Unclassified"}</p>
      </div>
    ),
  },
};
export const LiveUpdates: Story = { render: () => <Live /> };
function Live() {
  const [value, setValue] = useState(65);
  return (
    <>
      <label>
        Value{" "}
        <input
          type="range"
          min={-20}
          max={120}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </label>
      <GaugeChart
        value={value}
        zones={zones}
        unit="%"
        label="CPU utilization"
      />
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
      <GaugeChart
        value={65}
        zones={state === "empty" ? [] : zones}
        loading={state === "loading"}
        error={state === "error" ? "Offline" : null}
      />
    </>
  );
}
