import { act, fireEvent, render, screen } from "@testing-library/react";

import { WorkbenchCode } from "./workbench-code";

let mockReducedMotion = false;

jest.mock("framer-motion", () => ({
  useReducedMotion: () => mockReducedMotion,
}));

jest.mock("@/components/ui/code-block", () => ({
  CodeBlock: ({
    code,
    highlightedLines,
  }: {
    code: string;
    highlightedLines?: readonly number[];
  }) => (
    <div>
      <pre>{code}</pre>
      <span data-testid="highlighted">{(highlightedLines ?? []).join(",")}</span>
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
    mockReducedMotion = false;
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

  it("tints every changed line when multiple props change in one rerender", () => {
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

    rerender(
      <WorkbenchCode
        orientation="horizontal"
        variant="outline"
        animation
        onOrientationChange={jest.fn()}
        onVariantChange={jest.fn()}
        onAnimationChange={jest.fn()}
        onReplay={jest.fn()}
      />,
    );

    expect(screen.getByTestId("highlighted")).toHaveTextContent("7,8");
  });

  it("clears the tint after TINT_DURATION_MS elapses", () => {
    jest.useFakeTimers();

    try {
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

      rerender(
        <WorkbenchCode
          orientation="horizontal"
          variant="filled"
          animation
          onOrientationChange={jest.fn()}
          onVariantChange={jest.fn()}
          onAnimationChange={jest.fn()}
          onReplay={jest.fn()}
        />,
      );

      expect(screen.getByTestId("highlighted")).toHaveTextContent("7");

      act(() => {
        jest.advanceTimersByTime(700);
      });

      expect(screen.getByTestId("highlighted")).toHaveTextContent("");
    } finally {
      jest.useRealTimers();
    }
  });

  it("clears an in-flight tint when reduced motion turns on", () => {
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

    rerender(
      <WorkbenchCode
        orientation="horizontal"
        variant="filled"
        animation
        onOrientationChange={jest.fn()}
        onVariantChange={jest.fn()}
        onAnimationChange={jest.fn()}
        onReplay={jest.fn()}
      />,
    );

    expect(screen.getByTestId("highlighted")).toHaveTextContent("7");

    mockReducedMotion = true;

    rerender(
      <WorkbenchCode
        orientation="horizontal"
        variant="outline"
        animation
        onOrientationChange={jest.fn()}
        onVariantChange={jest.fn()}
        onAnimationChange={jest.fn()}
        onReplay={jest.fn()}
      />,
    );

    expect(screen.getByTestId("highlighted")).toHaveTextContent("");
  });

  it("disables replay while the animation is off", () => {
    renderCode({ animation: false });

    expect(screen.getByRole("button", { name: "Replay animation" })).toBeDisabled();
  });
});
