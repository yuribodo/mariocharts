import type { Meta, StoryObj } from "@storybook/react";
import { FunnelChart } from "./index";
const data = [
  { stage: "Visitors", count: 50000 },
  { stage: "Product views", count: 28000 },
  { stage: "Added to cart", count: 12000 },
  { stage: "Checkout", count: 5500 },
  { stage: "Purchase", count: 2800 },
];
const meta = {
  title: "Charts/FunnelChart",
  component: FunnelChart,
  args: {
    data,
    label: "stage",
    value: "count",
    height: 400,
    showConversionRates: true,
  },
} satisfies Meta<typeof FunnelChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Tapered: Story = {};
export const Straight: Story = { args: { variant: "straight" } };
export const Smooth: Story = { args: { variant: "smooth" } };
export const Horizontal: Story = { args: { variant: "horizontal" } };
export const Columns: Story = { args: { variant: "columns" } };
export const DropOff: Story = { args: { showDropOff: true } };
export const Disconnected: Story = { args: { showConnectors: false } };
export const Flat: Story = {
  args: {
    variant: "straight",
    borderRadius: 0,
    gap: 0,
    showConversionRates: false,
  },
};
export const Rounded: Story = {
  args: { variant: "horizontal", borderRadius: 16 },
};
export const SingleColor: Story = { args: { colors: ["#3b82f6"] } };
export const CssColors: Story = {
  args: { colors: ["var(--primary)", "rgb(99 102 241)"] },
};
export const ZeroEnd: Story = {
  args: {
    data: data.map((row, i) => ({ ...row, count: i > 2 ? 0 : row.count })),
  },
};
export const AllZero: Story = {
  args: { data: data.map((row) => ({ ...row, count: 0 })) },
};
export const ZeroFirst: Story = {
  args: {
    data: data.map((row, i) => ({ ...row, count: i === 0 ? 0 : row.count })),
  },
};
export const Increase: Story = {
  args: {
    data: [100, 160, 120, 60].map((count, i) => ({
      stage: `Stage ${i + 1}`,
      count,
    })),
    showDropOff: true,
  },
};
export const Tiny: Story = {
  args: {
    data: [10000, 1000, 100, 10, 1].map((count, i) => ({
      stage: `Stage ${i + 1}`,
      count,
    })),
  },
};
export const Equal: Story = {
  args: { data: data.map((row) => ({ ...row, count: 100 })) },
};
export const Single: Story = { args: { data: [data[0]!] } };
export const RepeatedLabels: Story = {
  args: { data: data.map((row) => ({ ...row, stage: "Stage" })) },
};
export const LongLabels: Story = {
  args: {
    data: data.map((row) => ({
      ...row,
      stage: `${row.stage} · North America enterprise acquisition`,
    })),
  },
};
export const ManyStages: Story = {
  args: {
    data: Array.from({ length: 14 }, (_, i) => ({
      stage: `Stage ${i + 1}`,
      count: 10000 - i * 600,
    })),
  },
};
export const NarrowColumns: Story = {
  args: { variant: "columns" },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};
export const InitialLoading: Story = { args: { loading: true, data: [] } };
export const Refreshing: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
export const Error: Story = { args: { error: "Unable to load the journey." } };
export const Negative: Story = {
  args: { data: [{ stage: "Invalid", count: -1 }] },
};
export const Missing: Story = {
  args: { data: [{ stage: "Missing", count: null }] },
};
export const Malformed: Story = {
  args: { data: [{ stage: "Malformed", count: "12px" }] },
};
export const NoAnimation: Story = { args: { animation: false } };
export const CustomInspection: Story = {
  args: {
    tooltipRenderer: (item) => (
      <div>
        <p>
          {item.index + 1}. {item.label}
        </p>
        <p>{item.formattedValue}</p>
        <p>
          From previous:{" "}
          {item.conversionRate === null
            ? "Undefined"
            : `${item.conversionRate.toFixed(1)}%`}
        </p>
      </div>
    ),
  },
};
