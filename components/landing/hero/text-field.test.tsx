import { render, screen } from "@testing-library/react";

import { TextField } from "./text-field";

const ART = "aaa\nbbb\nccc";

describe("TextField", () => {
  it("renders one element per row without altering the text", () => {
    const { container } = render(<TextField text={ART} label="Example" />);
    const field = screen.getByRole("img", { name: "Example" });

    expect(field.children).toHaveLength(3);
    expect(field.textContent).toBe(ART);
    expect(container.querySelectorAll("[tabindex]")).toHaveLength(0);
  });

  it("staggers the rows so the field resolves as a wave", () => {
    const { container } = render(
      <TextField text={ART} label="Example" rowDelayMs={20} />,
    );
    const rows = [...container.querySelectorAll<HTMLElement>("[data-row]")];

    expect(rows).toHaveLength(3);
    expect(rows.map((row) => row.style.animationDelay)).toEqual([
      "0ms",
      "20ms",
      "40ms",
    ]);
  });

  it("carries no accessible name when it is decoration", () => {
    const { container } = render(<TextField text={ART} />);

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("preserves rows that are empty or pure whitespace", () => {
    // The art's alignment is the whole point: a blank row is a real row of the
    // grid, and collapsing it would shift everything below it up by a line.
    const { container } = render(<TextField text={"aa\n\n  \nbb"} />);
    const rows = [...container.querySelectorAll<HTMLElement>("[data-row]")];

    expect(rows).toHaveLength(4);
    expect(rows.map((row) => row.textContent)).toEqual(["aa", "", "  ", "bb"]);
  });
});
