import type { Meta, StoryObj } from "@storybook/react";
import { WaterfallChart } from "./index";
const data = [
  { label: "Opening", value: 100000, type: "total" },
  { label: "Sales", value: 45000 },
  { label: "Services", value: 22000 },
  { label: "Refunds", value: -12000 },
  { label: "Costs", value: -28000 },
  { label: "Taxes", value: -9000 },
  { label: "Closing", type: "sum" },
];
const meta = {
  title: "Charts/WaterfallChart",
  component: WaterfallChart,
  args: {
    data,
    height: 400,
    showValues: true,
    showLegend: true,
    showGrid: true,
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof WaterfallChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CashFlow: Story = {};
export const Horizontal: Story = { args: { orientation: "horizontal" } };
export const Outline: Story = { args: { variant: "outline" } };
export const FlatEdges: Story = { args: { borderRadius: 0 } };
export const Rounded: Story = { args: { borderRadius: 16 } };
export const SolidConnectors: Story = { args: { connectorStyle: "solid" } };
export const DottedConnectors: Story = { args: { connectorStyle: "dotted" } };
export const Minimal: Story = {
  args: {
    showGrid: false,
    showConnectors: false,
    showValues: false,
    showLegend: false,
  },
};
export const PeriodSubtotals: Story = {
  args: {
    data: [
      { label: "Opening", value: 100, type: "total" },
      { label: "Jan", value: 40 },
      { label: "Feb", value: -10 },
      { label: "Q1 change", type: "subtotal" },
      { label: "Apr", value: -20 },
      { label: "Q2 change", type: "subtotal" },
      { label: "Closing", type: "sum" },
    ],
  },
};
export const ProfitAndLoss: Story = {
  args: {
    orientation: "horizontal",
    data: [
      { label: "Revenue", value: 180000, type: "total" },
      { label: "Cost of sales", value: -62000 },
      { label: "Gross profit", type: "sum" },
      { label: "Payroll", value: -42000 },
      { label: "Marketing", value: -18000 },
      { label: "Operating profit", type: "sum" },
      { label: "Taxes", value: -12000 },
      { label: "Net profit", type: "sum" },
    ],
  },
};
export const CrossingZero: Story = {
  args: {
    data: [
      { label: "Opening", value: 40, type: "total" },
      { label: "Costs", value: -70 },
      { label: "Recovery", value: 15 },
      { label: "Closing", type: "sum" },
    ],
  },
};
export const AbsoluteReset: Story = {
  args: {
    data: [
      { label: "Opening", value: 100, type: "total" },
      { label: "Growth", value: 20 },
      { label: "Reset", value: 90, type: "total" },
      { label: "Next", value: 10 },
      { label: "Closing", type: "sum" },
    ],
  },
};
export const OpeningBalance: Story = {
  args: {
    initialValue: 100,
    data: [
      { label: "Sales", value: 20 },
      { label: "Costs", value: -10 },
      { label: "Closing", type: "sum" },
    ],
  },
};
export const AllZero: Story = {
  args: {
    data: [
      { label: "Zero", value: 0 },
      { label: "Balance", type: "sum" },
    ],
  },
};
export const Tiny: Story = {
  args: {
    data: [
      { label: "Opening", value: 1e6, type: "total" },
      { label: "Tiny", value: 1 },
      { label: "Zero", value: 0 },
      { label: "Closing", type: "sum" },
    ],
  },
};
export const SingleNegativeTotal: Story = {
  args: { data: [{ label: "Balance", value: -40, type: "total" }] },
};
export const RepeatedLabels: Story = {
  args: {
    data: [
      { label: "Other", value: 20 },
      { label: "Other", value: -10 },
    ],
  },
};
export const LongLabels: Story = {
  args: {
    data: data.map((row) => ({
      ...row,
      label: `${row.label} from international operations`,
    })),
  },
};
export const ManySteps: Story = {
  args: {
    data: Array.from({ length: 100 }, (_, i) => ({
      label: `Step ${i + 1}`,
      value: i % 3 ? 10 : -5,
    })),
  },
};
export const Narrow: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};
export const CssColors: Story = {
  args: {
    colors: {
      increase: "mediumseagreen",
      decrease: "coral",
      total: "var(--primary)",
    },
  },
};
export const BlueOrange: Story = {
  args: {
    colors: { increase: "#3b82f6", decrease: "#f97316", total: "#64748b" },
  },
};
export const Formatting: Story = {
  args: { valueFormatter: (value) => `$${value.toLocaleString("en-US")}` },
};
export const InitialLoading: Story = { args: { data: [], loading: true } };
export const Refreshing: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
export const Error: Story = { args: { error: "Unable to load this period." } };
export const InvalidValue: Story = {
  args: { data: [{ label: "Unknown", value: null }] },
};
export const NoAnimation: Story = { args: { animation: false } };
export const CustomInspection: Story = {
  args: {
    tooltipRenderer: (tip) => (
      <div>
        {tip.label}: {tip.formattedValue} · Balance {tip.formattedCumulative}
      </div>
    ),
  },
};
