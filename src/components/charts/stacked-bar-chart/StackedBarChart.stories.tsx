import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { StackedBarChart } from "./index";
const data = [
  { quarter: "Q1", desktop: 120, mobile: 80, tablet: 30 },
  { quarter: "Q2", desktop: 150, mobile: 95, tablet: 40 },
  { quarter: "Q3", desktop: 130, mobile: 110, tablet: 35 },
  { quarter: "Q4", desktop: 170, mobile: 125, tablet: 45 },
];
const keys = ["desktop", "mobile", "tablet"] as const;
const signed = data.map((row, index) => ({
  ...row,
  desktop: index % 2 ? -60 : 120,
  mobile: index % 2 ? 90 : -45,
  tablet: index % 2 ? -25 : 30,
}));
const meta = {
  title: "Charts/StackedBarChart",
  component: StackedBarChart,
  args: {
    data,
    x: "quarter",
    y: keys,
    height: 400,
    showLegend: true,
    showGrid: true,
  },
} satisfies Meta<typeof StackedBarChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Vertical: Story = {};
export const Horizontal: Story = { args: { orientation: "horizontal" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Signed: Story = { args: { data: signed } };
export const SignedHorizontal: Story = {
  args: { data: signed, orientation: "horizontal" },
};
export const SignedOutline: Story = {
  args: { data: signed, variant: "outline" },
};
export const Negative: Story = {
  args: {
    data: data.map((row) => ({
      ...row,
      desktop: -row.desktop,
      mobile: -row.mobile,
      tablet: -row.tablet,
    })),
  },
};
export const Cancellation: Story = {
  args: {
    data: [{ quarter: "Balanced", desktop: 100, mobile: -100, tablet: 0 }],
  },
};
export const AllZero: Story = {
  args: {
    data: data.map((row) => ({ ...row, desktop: 0, mobile: 0, tablet: 0 })),
  },
};
export const ZeroSegments: Story = {
  args: { data: data.map((row) => ({ ...row, mobile: 0, tablet: 0 })) },
};
export const SingleCategory: Story = { args: { data: data.slice(0, 1) } };
export const Flat: Story = { args: { cornerRadius: 0 } };
export const Rounded: Story = { args: { cornerRadius: 12 } };
export const InitialLoading: Story = { args: { data: [], loading: true } };
export const Refreshing: Story = { args: { data: signed, loading: true } };
export const Empty: Story = { args: { data: [] } };
export const Error: Story = { args: { error: "Unable to load device data." } };
export const MalformedValue: Story = {
  args: { data: [{ ...data[0]!, mobile: NaN }] },
};
export const Overflow: Story = {
  args: {
    data: [
      { ...data[0]!, desktop: Number.MAX_VALUE, mobile: Number.MAX_VALUE },
    ],
  },
};
export const LongLabels: Story = {
  args: {
    data: data.map((row) => ({
      ...row,
      quarter: `${row.quarter} · enterprise accounts in North America`,
    })),
    orientation: "horizontal",
  },
};
export const Dense: Story = {
  args: {
    data: Array.from({ length: 24 }, (_, i) => ({
      ...data[i % 4]!,
      quarter: `Week ${i + 1}`,
    })),
  },
};
export const NoAnimation: Story = { args: { animation: false } };
export const KeyboardActions: Story = { render: () => <Actions /> };
function Actions() {
  const [selection, setSelection] = useState("");
  return (
    <>
      <StackedBarChart
        data={signed}
        x="quarter"
        y={keys}
        variant="outline"
        showLegend
        onSegmentClick={(row, key) => setSelection(`${row.quarter}: ${key}`)}
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
      <StackedBarChart
        data={state === "empty" ? [] : signed}
        x="quarter"
        y={keys}
        loading={state === "loading"}
        error={state === "error" ? "Offline" : null}
        showLegend
      />
    </>
  );
}
