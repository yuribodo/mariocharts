import { fireEvent, render, screen } from "@testing-library/react";

import { CodeDemoSection } from "./code-demo-section";

jest.mock("@/src/components/charts/bar-chart", () => ({
  BarChart: ({ orientation, variant }: { orientation?: string; variant?: string }) => (
    <div data-testid="bar-chart">
      {orientation}:{variant}
    </div>
  ),
}));

jest.mock("@/components/ui/code-block", () => ({
  CodeBlock: ({ code }: { code: string }) => <pre data-testid="source">{code}</pre>,
}));

describe("CodeDemoSection", () => {
  it("leads with the connection between code and chart", () => {
    render(<CodeDemoSection />);

    expect(
      screen.getByRole("heading", {
        name: "Adjust the props. The code updates with the chart.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("This is the component you install — same props, same output."),
    ).toBeInTheDocument();
  });

  it("moves the source and the chart together", () => {
    render(<CodeDemoSection />);

    expect(screen.getByTestId("source")).toHaveTextContent('orientation="vertical"');
    expect(screen.getByTestId("bar-chart")).toHaveTextContent("vertical:filled");

    fireEvent.click(screen.getByRole("button", { name: "Horizontal" }));

    expect(screen.getByTestId("source")).toHaveTextContent('orientation="horizontal"');
    expect(screen.getByTestId("bar-chart")).toHaveTextContent("horizontal:filled");
  });

  it("uses connected surfaces instead of floating cards", () => {
    const { container } = render(<CodeDemoSection />);
    const markup = container.innerHTML;

    expect(markup).not.toContain("rounded-xl");
    expect(markup).not.toContain("rounded-2xl");
    expect(markup).not.toContain("backdrop-blur");
    expect(markup).not.toContain("shadow-lg");
  });
});
