import { render, screen } from "@testing-library/react";
import { SalesDashboardContent } from "./sales-dashboard-content";

jest.mock("@/src/components/charts/line-chart", () => ({
  LineChart: () => <div aria-label="Revenue trend chart" />,
}));
jest.mock("@/src/components/charts/bar-chart", () => ({
  BarChart: () => <div aria-label="Product revenue chart" />,
}));
jest.mock("@/src/components/charts/radar-chart", () => ({
  RadarChart: () => <div aria-label="Seller performance chart" />,
}));
jest.mock("@/src/components/charts/gauge-chart", () => ({
  GaugeChart: () => <div aria-label="Annual target chart" />,
}));

describe("SalesDashboardContent", () => {
  it("organizes sales decisions into connected analytical groups", () => {
    const { container } = render(<SalesDashboardContent />);

    expect(screen.getByRole("heading", { level: 1, name: "Sales & Revenue" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Executive metrics" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Target tracking charts" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Revenue source charts" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Team performance chart" })).toBeInTheDocument();

    ["Total Revenue", "Closed Sales", "Average Ticket", "Conversion Rate"].forEach((metric) => {
      expect(screen.getByText(metric)).toBeInTheDocument();
    });

    expect(container.querySelectorAll(".shadow-sm")).toHaveLength(0);
    expect(container.querySelectorAll(".rounded-xl")).toHaveLength(0);
  });
});
