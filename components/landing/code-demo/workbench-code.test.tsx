import { fireEvent, render, screen } from "@testing-library/react";

import { WorkbenchCode } from "./workbench-code";

const unlock = jest.fn();

jest.mock("@/hooks", () => ({
  useBadges: () => ({ unlock }),
}));

jest.mock("@/components/ui/code-block", () => ({
  CodeBlock: ({
    code,
    highlightedLines,
    onCopy,
  }: {
    code: string;
    highlightedLines?: readonly number[];
    onCopy?: () => void;
  }) => (
    <div>
      <pre>{code}</pre>
      <span data-testid="highlighted">{(highlightedLines ?? []).join(",")}</span>
      <button type="button" onClick={onCopy}>
        Copy code
      </button>
    </div>
  ),
}));

function renderCode(overrides: Partial<Parameters<typeof WorkbenchCode>[0]> = {}) {
  const props = {
    orientation: "vertical" as const,
    variant: "filled" as const,
    animation: true,
    onOrientationChange: jest.fn(),
    onVariantChange: jest.fn(),
    onAnimationChange: jest.fn(),
    onReplay: jest.fn(),
    ...overrides,
  };
  render(<WorkbenchCode {...props} />);
  return props;
}

describe("WorkbenchCode", () => {
  beforeEach(() => {
    unlock.mockClear();
  });

  it("renders source that matches the current state", () => {
    renderCode({ orientation: "horizontal", variant: "outline", animation: false });

    const source = screen.getByText(/import \{ BarChart \}/);
    expect(source).toHaveTextContent('orientation="horizontal"');
    expect(source).toHaveTextContent('variant="outline"');
    expect(source).toHaveTextContent("animation={false}");
  });

  it("reports control changes to its parent", () => {
    const props = renderCode();

    fireEvent.click(screen.getByRole("button", { name: "Horizontal" }));
    expect(props.onOrientationChange).toHaveBeenCalledWith("horizontal");

    fireEvent.click(screen.getByRole("button", { name: "Outline" }));
    expect(props.onVariantChange).toHaveBeenCalledWith("outline");

    fireEvent.click(screen.getByRole("checkbox", { name: "Animate" }));
    expect(props.onAnimationChange).toHaveBeenCalledWith(false);
  });

  it("tints the source line belonging to the control that changed", () => {
    const { rerender } = render(
      <WorkbenchCode
        orientation="vertical"
        variant="filled"
        animation
        onOrientationChange={jest.fn()}
        onVariantChange={jest.fn()}
        onAnimationChange={jest.fn()}
        onReplay={jest.fn()}
      />,
    );

    expect(screen.getByTestId("highlighted")).toHaveTextContent("");

    rerender(
      <WorkbenchCode
        orientation="vertical"
        variant="outline"
        animation
        onOrientationChange={jest.fn()}
        onVariantChange={jest.fn()}
        onAnimationChange={jest.fn()}
        onReplay={jest.fn()}
      />,
    );

    expect(screen.getByTestId("highlighted")).toHaveTextContent("8");
  });

  it("unlocks the first-copy badge without any celebration", () => {
    renderCode();

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

    expect(unlock).toHaveBeenCalledWith("first-copy");
  });

  it("disables replay while the animation is off", () => {
    renderCode({ animation: false });

    expect(screen.getByRole("button", { name: "Replay animation" })).toBeDisabled();
  });
});
