import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BarChart } from "./index";

const sampleData = [
  { category: "A", value: 10 },
  { category: "B", value: 25 },
  { category: "C", value: 15 },
];

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    width: 800,
    height: 300,
    top: 0,
    left: 0,
    bottom: 300,
    right: 800,
    x: 0,
    y: 0,
    toJSON: () => {},
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

function renderAndFlush(ui: React.ReactElement) {
  let result: ReturnType<typeof render>;
  act(() => {
    result = render(ui);
  });
  act(() => {
    jest.runAllTimers();
  });
  return result!;
}

describe("BarChart", () => {
  it("renders SVG with minimal props", () => {
    const { container } = renderAndFlush(
      <BarChart data={sampleData} x="category" y="value" />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders correct number of rect elements (bars)", () => {
    const { container } = renderAndFlush(
      <BarChart data={sampleData} x="category" y="value" />,
    );
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBeGreaterThanOrEqual(sampleData.length);
  });

  it("shows loading state when loading={true}", () => {
    const { container } = render(
      <BarChart data={sampleData} x="category" y="value" loading={true} />,
    );
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0,
    );
  });

  it("shows error state with error message", () => {
    render(
      <BarChart
        data={sampleData}
        x="category"
        y="value"
        error="Something went wrong"
      />,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("shows empty state when data={[]}", () => {
    render(<BarChart data={[]} x="category" y="value" />);
    expect(screen.getByText("No Data")).toBeInTheDocument();
  });

  it("calls onBarClick when bar is clicked", () => {
    const handleClick = jest.fn();
    const { container } = renderAndFlush(
      <BarChart
        data={sampleData}
        x="category"
        y="value"
        onBarClick={handleClick}
      />,
    );
    const clickableRect = container.querySelector("[role=button]");
    expect(clickableRect).not.toBeNull();
    fireEvent.click(clickableRect!);
    expect(handleClick).toHaveBeenCalledWith(
      expect.objectContaining({
        category: expect.any(String),
        value: expect.any(Number),
      }),
      expect.any(Number),
    );
  });

  it('renders with variant="outline"', () => {
    const { container } = renderAndFlush(
      <BarChart data={sampleData} x="category" y="value" variant="outline" />,
    );
    const rects = container.querySelectorAll("rect");
    const outlineBar = Array.from(rects).find(
      (r) => r.getAttribute("fill") === "none" && r.getAttribute("stroke"),
    );
    expect(outlineBar).toBeDefined();
  });

  it('renders with orientation="horizontal"', () => {
    const { container } = renderAndFlush(
      <BarChart
        data={sampleData}
        x="category"
        y="value"
        orientation="horizontal"
      />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg!.getAttribute("aria-label")).toContain("horizontal");
  });

  it("has correct aria-label on SVG", () => {
    const { container } = renderAndFlush(
      <BarChart data={sampleData} x="category" y="value" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg!.getAttribute("aria-label")).toContain("Bar chart");
  });

  it("renders with custom className", () => {
    const { container } = renderAndFlush(
      <BarChart
        data={sampleData}
        x="category"
        y="value"
        className="my-custom-class"
      />,
    );
    expect(container.firstElementChild).toHaveClass("my-custom-class");
  });

  it("renders with showGrid={true}", () => {
    const { container } = renderAndFlush(
      <BarChart data={sampleData} x="category" y="value" showGrid={true} />,
    );
    const gridLines = Array.from(container.querySelectorAll("line")).filter(
      (l) => l.getAttribute("opacity") === "0.1",
    );
    expect(gridLines.length).toBeGreaterThan(0);
  });

  it("renders with showValues={true}", () => {
    const { container } = renderAndFlush(
      <BarChart data={sampleData} x="category" y="value" showValues={true} />,
    );
    const valueTexts = Array.from(container.querySelectorAll("text")).map(
      (t) => t.textContent,
    );
    expect(valueTexts.some((t) => t === "10" || t === "25" || t === "15")).toBe(
      true,
    );
  });
});

describe("BarChart behavior contracts", () => {
  it.each(["loading", "error", "empty"])(
    "recovers from %s without replacing its measured frame",
    (state) => {
      const { container, rerender } = render(
        <BarChart
          data={state === "empty" ? [] : sampleData}
          x="category"
          loading={state === "loading"}
          error={state === "error" ? "Offline" : null}
          height={420}
          className="chart-frame"
        />,
      );
      const frame = container.firstElementChild;
      expect(frame).toHaveStyle({ height: "420px" });
      expect(frame).toHaveClass("chart-frame");
      rerender(
        <BarChart
          data={sampleData}
          x="category"
          height={420}
          className="chart-frame"
        />,
      );
      expect(container.firstElementChild).toBe(frame);
      expect(screen.getAllByRole("graphics-symbol")).toHaveLength(3);
      rerender(
        <BarChart
          data={sampleData}
          x="category"
          loading
          height={420}
          className="chart-frame"
        />,
      );
      rerender(
        <BarChart
          data={sampleData}
          x="category"
          height={420}
          className="chart-frame"
        />,
      );
      expect(screen.getAllByRole("graphics-symbol")).toHaveLength(3);
    },
  );

  it.each(["vertical", "horizontal"] as const)(
    "preserves both signs relative to zero in %s orientation",
    (orientation) => {
      const { container } = render(
        <BarChart
          data={[
            { label: "Gain", value: 100 },
            { label: "Loss", value: -100 },
          ]}
          x="label"
          orientation={orientation}
          animation={false}
        />,
      );
      const positive = container.querySelector('[data-bar-index="0"]')!;
      const negative = container.querySelector('[data-bar-index="1"]')!;
      const baseline = container.querySelector("[data-zero-baseline]")!;
      const length = orientation === "vertical" ? "height" : "width";
      expect(Number(positive.getAttribute(length))).toBeGreaterThan(0);
      expect(negative.getAttribute(length)).toBe(positive.getAttribute(length));
      if (orientation === "vertical") {
        expect(
          Number(positive.getAttribute("y")) +
            Number(positive.getAttribute("height")),
        ).toBe(Number(baseline.getAttribute("y1")));
        expect(negative.getAttribute("y")).toBe(baseline.getAttribute("y1"));
      } else {
        expect(positive.getAttribute("x")).toBe(baseline.getAttribute("x1"));
        expect(
          Number(negative.getAttribute("x")) +
            Number(negative.getAttribute("width")),
        ).toBe(Number(baseline.getAttribute("x1")));
      }
    },
  );

  it.each(["filled", "outline"] as const)(
    "offers one tab stop, arrows, activation, and Escape in %s mode",
    (variant) => {
      const onBarClick = jest.fn();
      const { container } = render(
        <BarChart
          data={sampleData}
          x="category"
          variant={variant}
          onBarClick={onBarClick}
        />,
      );
      const targets = screen.getAllByRole("button");
      expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
      act(() => targets[0]!.focus());
      expect(screen.getByRole("tooltip")).toHaveTextContent("A");
      fireEvent.keyDown(targets[0]!, { key: "ArrowRight" });
      expect(targets[1]).toHaveFocus();
      fireEvent.keyDown(targets[1]!, { key: "Enter" });
      expect(onBarClick).toHaveBeenLastCalledWith(sampleData[1], 1);
      fireEvent.keyDown(targets[1]!, { key: "End" });
      expect(targets[2]).toHaveFocus();
      fireEvent.keyDown(targets[2]!, { key: " " });
      expect(onBarClick).toHaveBeenLastCalledWith(sampleData[2], 2);
      fireEvent.keyDown(targets[2]!, { key: "Home" });
      expect(targets[0]).toHaveFocus();
      fireEvent.keyDown(targets[0]!, { key: "Escape" });
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      expect(targets[0]).toHaveFocus();
    },
  );

  it("keeps zero inspectable without drawing a nonzero bar", () => {
    const { container } = render(
      <BarChart data={[{ name: "Zero", value: 0 }]} x="name" />,
    );
    expect(container.querySelector("[data-bar-index]")).toHaveAttribute(
      "height",
      "0",
    );
    const zero = screen.getByRole("graphics-symbol", { name: "Zero: 0" });
    expect(Number(zero.getAttribute("height"))).toBeGreaterThan(0);
    fireEvent.pointerDown(zero, { pointerType: "touch" });
    expect(screen.getByRole("tooltip")).toHaveTextContent("Zero");
  });

  it.each([null, undefined, NaN, Infinity, "12abc", "1,5", ""])(
    "rejects invalid input %s instead of inventing zero",
    (value) => {
      render(<BarChart data={[{ name: "A", value }]} x="name" />);
      expect(screen.getByRole("alert")).toHaveTextContent(
        'Row 1: "value" must contain a finite number',
      );
      expect(screen.queryByRole("graphics-symbol")).not.toBeInTheDocument();
    },
  );

  it("preserves numeric and source values for custom tooltips while formatting other surfaces", () => {
    const source = [{ name: "A", value: "$1,250" }];
    const tooltip = jest.fn((payload) => <span>Raw {payload.rawValue}</span>);
    const { container } = render(
      <BarChart
        data={source}
        x="name"
        valueFormatter={(value) => `USD ${value}`}
        axisValueFormatter={(value) => `${value / 1000}k`}
        tooltipRenderer={tooltip}
        showValues
      />,
    );
    const target = screen.getByRole("graphics-symbol", { name: "A: USD 1250" });
    fireEvent.mouseEnter(target);
    expect(tooltip).toHaveBeenLastCalledWith(
      expect.objectContaining({
        value: 1250,
        rawValue: "$1,250",
        data: source[0],
        index: 0,
      }),
    );
    expect(container.querySelector("text")).toHaveTextContent("0k");
    expect(screen.getByText("USD 1250")).toBeInTheDocument();
  });

  it("clears stale inspection when the data is replaced", () => {
    const { rerender } = render(<BarChart data={sampleData} x="category" />);
    fireEvent.mouseEnter(screen.getAllByRole("graphics-symbol")[2]!);
    expect(screen.getByRole("tooltip")).toHaveTextContent("C");
    rerender(<BarChart data={[{ category: "New", value: 5 }]} x="category" />);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(screen.getByRole("graphics-symbol")).toHaveAttribute(
      "tabindex",
      "0",
    );
  });

  it("uses distinct description IDs and preserves supplied accessible context", () => {
    render(
      <>
        <BarChart
          data={sampleData}
          x="category"
          ariaLabel="Revenue"
          description="USD for the current quarter."
        />
        <BarChart data={sampleData} x="category" ariaLabel="Costs" />
      </>,
    );
    const revenue = screen.getByRole("group", { name: "Revenue" });
    const costs = screen.getByRole("group", { name: "Costs" });
    expect(revenue).toHaveAccessibleDescription(
      expect.stringContaining("USD for the current quarter."),
    );
    expect(revenue.getAttribute("aria-describedby")).not.toBe(
      costs.getAttribute("aria-describedby"),
    );
  });

  it("disables skeleton motion and renders values when animation is false", () => {
    const { container, rerender } = render(
      <BarChart data={sampleData} x="category" loading animation={false} />,
    );
    expect(container.querySelector(".animate-pulse")).toBeNull();
    rerender(<BarChart data={sampleData} x="category" animation={false} />);
    expect(screen.getAllByRole("graphics-symbol")).toHaveLength(3);
  });
});

it("respects reduced motion while loading", () => {
  const motion =
    jest.requireMock<typeof import("framer-motion")>("framer-motion");
  jest.spyOn(motion, "useReducedMotion").mockReturnValue(true);
  const { container } = render(
    <BarChart data={sampleData} x="category" loading />,
  );
  expect(screen.getByRole("status")).toHaveTextContent("Loading chart");
  expect(container.querySelector(".animate-pulse")).toBeNull();
});

describe("BarChart loading geometry", () => {
  it.each(["vertical", "horizontal"] as const)(
    "preserves every bar and the baseline through loading in %s orientation",
    (orientation) => {
      const data = [
        { name: "Gain", value: 100 },
        { name: "Loss", value: -50 },
        { name: "Zero", value: 0 },
      ];
      const { container, rerender } = renderAndFlush(
        <BarChart
          data={data}
          x="name"
          orientation={orientation}
          animation={false}
        />,
      );
      const geometry = (selector: string) =>
        Array.from(container.querySelectorAll(selector)).map((element) =>
          ["x", "y", "width", "height"].map((attribute) =>
            element.getAttribute(attribute),
          ),
        );
      const before = geometry("[data-bar-index]");
      const baseline = container.querySelector(
        "[data-zero-baseline]",
      )!.outerHTML;
      rerender(
        <BarChart
          data={data}
          x="name"
          orientation={orientation}
          animation={false}
          loading
        />,
      );
      expect(geometry("[data-loading-bar]")).toEqual(before);
      expect(container.querySelector("[data-zero-baseline]")!.outerHTML).toBe(
        baseline,
      );
      expect(screen.queryByRole("graphics-symbol")).not.toBeInTheDocument();
      expect(container.querySelector("[tabindex]")).toBeNull();
      expect(screen.getByRole("status")).toHaveTextContent("Loading chart");
      rerender(
        <BarChart
          data={data}
          x="name"
          orientation={orientation}
          animation={false}
        />,
      );
      expect(geometry("[data-bar-index]")).toEqual(before);
    },
  );

  it("renders noninteractive placeholders before the first data arrives", () => {
    const { container, rerender } = renderAndFlush(
      <BarChart data={[]} x="name" loading />,
    );
    expect(container.querySelectorAll("[data-loading-bar]")).toHaveLength(6);
    expect(screen.queryByText("No Data")).not.toBeInTheDocument();
    expect(container.querySelector("[tabindex]")).toBeNull();
    rerender(<BarChart data={[{ name: "First", value: 12 }]} x="name" />);
    expect(
      screen.getByRole("graphics-symbol", { name: "First: 12" }),
    ).toBeInTheDocument();
  });
});

it("inspects a zero value from its whole category band and clears on leaving the plot", () => {
  const { container } = renderAndFlush(
    <BarChart data={[{ name: "Zero", value: 0 }]} x="name" />,
  );
  const band = container.querySelector("[data-inspection-band]")!;
  expect(Number(band.getAttribute("height"))).toBe(240);
  fireEvent.mouseEnter(band);
  expect(screen.getByRole("tooltip")).toHaveTextContent("Zero");
  fireEvent.mouseLeave(band.closest("svg")!.querySelector("g")!);
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});
