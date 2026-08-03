import { render, screen } from "@testing-library/react";

import { buildWorkbenchCode, PROP_LINES } from "./workbench-data";
import { WorkbenchPreview } from "./workbench-preview";

jest.mock("@/src/components/charts/bar-chart", () => ({
  BarChart: ({
    orientation,
    variant,
    animation,
  }: {
    orientation?: string;
    variant?: string;
    animation?: boolean;
  }) => (
    <div data-testid="bar-chart">
      {orientation}:{variant}:{String(animation)}
    </div>
  ),
}));

describe("WorkbenchPreview", () => {
  it("passes the workbench state straight through to the chart", () => {
    render(
      <WorkbenchPreview
        orientation="horizontal"
        variant="outline"
        animation={false}
        chartKey={0}
      />,
    );

    expect(screen.getByTestId("bar-chart")).toHaveTextContent(
      "horizontal:outline:false",
    );
  });

  it("names the preview region for assistive technology", () => {
    render(
      <WorkbenchPreview
        orientation="vertical"
        variant="filled"
        animation
        chartKey={0}
      />,
    );

    expect(
      screen.getByRole("figure", { name: "Monthly revenue bar chart" }),
    ).toBeInTheDocument();
  });
});

describe("PROP_LINES", () => {
  it("points at the orientation, variant, and animation lines when animation is enabled", () => {
    const lines = buildWorkbenchCode({
      orientation: "vertical",
      variant: "filled",
      animation: true,
    }).split("\n");

    expect(lines[PROP_LINES.orientation - 1]).toContain("orientation=");
    expect(lines[PROP_LINES.variant - 1]).toContain("variant=");
    expect(lines[PROP_LINES.animation - 1]).toContain("animation");
    expect(lines[PROP_LINES.animation - 1]).not.toContain("={false}");
  });

  it("keeps the same line numbers when animation is disabled", () => {
    const lines = buildWorkbenchCode({
      orientation: "horizontal",
      variant: "outline",
      animation: false,
    }).split("\n");

    expect(lines[PROP_LINES.orientation - 1]).toContain("orientation=");
    expect(lines[PROP_LINES.variant - 1]).toContain("variant=");
    expect(lines[PROP_LINES.animation - 1]).toContain("animation={false}");
  });
});
