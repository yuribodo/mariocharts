import { fireEvent, render, screen } from "@testing-library/react";
import { ChartBar, ChartColumn } from "lucide-react";

import { SegmentedControl } from "./segmented-control";

const options = [
  { value: "vertical", label: "Vertical", icon: ChartColumn },
  { value: "horizontal", label: "Horizontal", icon: ChartBar },
] as const;

function renderControl(value: "vertical" | "horizontal", onChange = jest.fn()) {
  render(
    <SegmentedControl
      label="Orientation"
      description="Direction of comparison."
      value={value}
      options={options}
      onChange={onChange}
    />,
  );
  return onChange;
}

describe("SegmentedControl", () => {
  it("exposes the active option and its group name", () => {
    renderControl("vertical");

    expect(screen.getByRole("group", { name: "Orientation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vertical" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Horizontal" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      document.querySelector('[data-segmented-indicator="Orientation"]'),
    ).toHaveAttribute("data-position", "left");
  });

  it("moves the indicator when the value changes", () => {
    renderControl("horizontal");

    expect(
      document.querySelector('[data-segmented-indicator="Orientation"]'),
    ).toHaveAttribute("data-position", "right");
  });

  it("reports the clicked option", () => {
    const onChange = renderControl("vertical");

    fireEvent.click(screen.getByRole("button", { name: "Horizontal" }));

    expect(onChange).toHaveBeenCalledWith("horizontal");
  });

  it("wraps around with the arrow keys", () => {
    const onChange = renderControl("vertical");

    fireEvent.keyDown(screen.getByRole("button", { name: "Vertical" }), {
      key: "ArrowLeft",
    });

    expect(onChange).toHaveBeenCalledWith("horizontal");
  });

  it("keeps the description available to the user", () => {
    renderControl("vertical");

    expect(screen.getByText("Direction of comparison.")).toBeInTheDocument();
  });
});
