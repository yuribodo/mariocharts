import { fireEvent, render, screen } from "@testing-library/react";
import { BarChartContent } from "./bar-chart-content";

jest.mock("@/src/components/charts/bar-chart", () => ({
  BarChart: ({ orientation, variant }: { orientation?: string; variant?: string }) => (
    <div data-testid="bar-chart">{orientation}:{variant}</div>
  ),
}));

jest.mock("../../../../components/ui/code-block", () => ({
  CodeBlock: ({ code }: { code: string }) => <pre>{code}</pre>,
}));

describe("BarChartContent", () => {
  it("presents the component as a concise implementation guide", () => {
    render(<BarChartContent />);

    expect(screen.getByRole("heading", { level: 1, name: "Bar Chart" })).toBeInTheDocument();
    expect(screen.getByText("npx mario-charts@latest add bar-chart")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Playground" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Production states" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "API Reference" })).toBeInTheDocument();
  });

  it("updates the representative preview from native controls", () => {
    render(<BarChartContent />);

    fireEvent.change(screen.getByLabelText("Orientation"), { target: { value: "horizontal" } });
    fireEvent.change(screen.getByLabelText("Variant"), { target: { value: "outline" } });

    expect(screen.getAllByTestId("bar-chart")[0]).toHaveTextContent("horizontal:outline");
  });
});
