import type { Meta, StoryObj } from "@storybook/react";
import { HeatmapChart } from "./index";
const data = [
  { day: "Mon", hour: "9am", v: 0, w: 3 },
  { day: "Mon", hour: "12pm", v: 12, w: 2 },
  { day: "Tue", hour: "9am", v: -4, w: 1 },
  { day: "Tue", hour: "12pm", v: 6, w: 0 },
];
const meta = {
  title: "Charts/HeatmapChart",
  component: HeatmapChart,
  args: {
    data,
    x: "hour",
    y: "day",
    value: "v",
    showLegend: true,
    height: 360,
  },
} satisfies Meta<typeof HeatmapChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Grid: Story = {};
export const Radial: Story = { args: { variant: "radial" } };
export const Stock: Story = { args: { variant: "stock", weight: "w" } };
export const EqualStockAreas: Story = { args: { variant: "stock" } };
export const ZeroWeights: Story = {
  args: {
    variant: "stock",
    weight: "w",
    data: data.map((row) => ({ ...row, w: 0 })),
  },
};
export const SingleColumn: Story = {
  args: { variant: "radial", data: data.filter((row) => row.hour === "9am") },
};
export const MissingObservations: Story = {
  args: { data: [data[0]!, { ...data[3]!, v: null }] },
};
export const AllZero: Story = {
  args: { data: data.map((row) => ({ ...row, v: 0 })) },
};
export const Diverging: Story = { args: { colorScheme: "diverging" } };
export const FixedDomain: Story = {
  args: { colorScheme: "diverging", domain: [-10, 20], midpoint: 5 },
};
export const CssColors: Story = {
  args: { colorFrom: "rgb(224 231 255)", colorTo: "oklch(45% 0.2 280)" },
};
export const FlatCorners: Story = { args: { cellRadius: 0 } };
export const RoundedCorners: Story = { args: { cellRadius: 12 } };
export const LongLabels: Story = {
  args: {
    data: data.map((row) => ({
      ...row,
      day: `${row.day} · North America production workload`,
      hour: `${row.hour} · enterprise traffic`,
    })),
  },
};
export const InitialLoading: Story = { args: { loading: true, data: [] } };
export const Refreshing: Story = { args: { loading: true } };
export const RadialLoading: Story = {
  args: { loading: true, variant: "radial" },
};
export const StockLoading: Story = {
  args: { loading: true, variant: "stock", weight: "w" },
};
export const Empty: Story = { args: { data: [] } };
export const Error: Story = { args: { error: "Unable to load observations." } };
export const InvalidMeasurement: Story = {
  args: { data: [{ ...data[0]!, v: "12px" }] },
};
export const DuplicateCoordinates: Story = {
  args: { data: [data[0]!, data[0]!] },
};
export const InvalidDomain: Story = { args: { domain: [0, 10] } };
export const NoAnimation: Story = { args: { animation: false } };
export const CustomInspection: Story = {
  args: {
    tooltipRenderer: (item) => (
      <div>
        <p>
          {item.yLabel} / {item.xLabel}
        </p>
        <p>{item.formattedValue}</p>
        <p>Source row: {item.index ?? "absent"}</p>
      </div>
    ),
  },
};

export const DenseStock: Story = {
  args: {
    variant: "stock",
    weight: "w",
    data: Array.from({ length: 24 }, (_, index) => ({
      day: "",
      hour: `ASSET${index + 1}`,
      v: (index % 9) - 4,
      w: 25 - index,
    })),
  },
};
export const NarrowStock: Story = {
  args: { variant: "stock", weight: "w", height: 360 },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};
export const PaleStockColors: Story = {
  args: {
    variant: "stock",
    weight: "w",
    colorFrom: "#fef3c7",
    colorTo: "#dbeafe",
  },
};
