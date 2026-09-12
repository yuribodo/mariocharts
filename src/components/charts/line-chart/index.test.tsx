import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { LineChart } from "./index";

const sampleData = [
  { month: "Jan", sales: 100, profit: 30 },
  { month: "Feb", sales: 150, profit: 45 },
  { month: "Mar", sales: 120, profit: 36 },
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

describe("LineChart", () => {
  it("renders SVG with minimal props", () => {
    const { container } = renderAndFlush(
      <LineChart data={sampleData} x="month" y="sales" />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("shows loading state when loading={true}", () => {
    const { container } = render(
      <LineChart data={sampleData} x="month" y="sales" loading={true} />,
    );
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0,
    );
  });

  it("shows error state with error message", () => {
    render(
      <LineChart
        data={sampleData}
        x="month"
        y="sales"
        error="Something went wrong"
      />,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("shows empty state when data={[]}", () => {
    render(<LineChart data={[]} x="month" y="sales" />);
    expect(screen.getByText("No Data")).toBeInTheDocument();
  });

  it('renders with multi-series y={["sales", "profit"]}', () => {
    const { container } = renderAndFlush(
      <LineChart data={sampleData} x="month" y={["sales", "profit"]} />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelectorAll("path").length).toBeGreaterThanOrEqual(2);
  });

  it("renders dots when showDots={true} (default)", () => {
    const { container } = renderAndFlush(
      <LineChart data={sampleData} x="month" y="sales" />,
    );
    const dots = container.querySelectorAll('[role="graphics-symbol"]');
    expect(dots.length).toBe(sampleData.length);
  });

  it("has correct aria-label on SVG", () => {
    const { container } = renderAndFlush(
      <LineChart data={sampleData} x="month" y="sales" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg!.getAttribute("aria-label")).toContain("Line chart");
  });

  it("renders with custom className", () => {
    const { container } = renderAndFlush(
      <LineChart
        data={sampleData}
        x="month"
        y="sales"
        className="my-custom-class"
      />,
    );
    expect(container.firstElementChild).toHaveClass("my-custom-class");
  });

  it("renders with showGrid={true}", () => {
    const { container } = renderAndFlush(
      <LineChart data={sampleData} x="month" y="sales" showGrid={true} />,
    );
    const gridLines = Array.from(container.querySelectorAll("line")).filter(
      (l) => l.getAttribute("opacity") === "0.1",
    );
    expect(gridLines.length).toBeGreaterThan(0);
  });

  it("renders with showLegend={true} and multi-series", () => {
    renderAndFlush(
      <LineChart
        data={sampleData}
        x="month"
        y={["sales", "profit"]}
        showLegend={true}
      />,
    );
    expect(screen.getByText("sales")).toBeInTheDocument();
    expect(screen.getByText("profit")).toBeInTheDocument();
  });

  it("renders with showArea={true}", () => {
    const { container } = renderAndFlush(
      <LineChart data={sampleData} x="month" y="sales" showArea={true} />,
    );
    const areaPaths = Array.from(container.querySelectorAll("path")).filter(
      (p) => {
        const fill = p.getAttribute("fill");
        return fill && fill.startsWith("url(#");
      },
    );
    expect(areaPaths.length).toBeGreaterThanOrEqual(1);
  });
});

it.each(["loading", "error", "empty"])(
  "keeps its measured frame and recovers from %s",
  (state) => {
    const { container, rerender } = renderAndFlush(
      <LineChart
        data={state === "empty" ? [] : sampleData}
        x="month"
        y="sales"
        height={420}
        loading={state === "loading"}
        error={state === "error" ? "Offline" : null}
      />,
    );
    const frame = container.firstElementChild;
    expect(frame).toHaveStyle({ height: "420px" });
    rerender(<LineChart data={sampleData} x="month" y="sales" height={420} />);
    expect(container.firstElementChild).toBe(frame);
    expect(screen.getAllByRole("graphics-symbol")).toHaveLength(3);
  },
);
it("preserves line and area geometry during refresh, including gaps and legend space", () => {
  const data = [
    { month: "A", sales: 10, profit: 5 },
    { month: "B", sales: null, profit: 6 },
    { month: "C", sales: 30, profit: 9 },
  ];
  const props = {
    data,
    x: "month",
    y: ["sales", "profit"],
    showArea: true,
    showLegend: true,
    animation: false,
  } as const;
  const { container, rerender } = renderAndFlush(<LineChart {...props} />);
  const paths = Array.from(
    container.querySelectorAll("[data-line-series], [data-line-area]"),
  ).map((p) => p.getAttribute("d"));
  const svgHeight = container.querySelector("svg")!.getAttribute("height");
  rerender(<LineChart {...props} loading />);
  expect(
    Array.from(
      container.querySelectorAll("[data-loading-line], [data-line-area]"),
    ).map((p) => p.getAttribute("d")),
  ).toEqual(paths);
  expect(container.querySelector("svg")).toHaveAttribute("height", svgHeight);
  expect(container.querySelector("[tabindex]")).toBeNull();
  expect(container.querySelector(".animate-pulse")).toBeNull();
});
it("keeps absent series indices, area targeting, and raw tooltip values independent", () => {
  const data = [{ name: "A", absent: null, sales: "$1,250", profit: "45%" }];
  const tooltip = jest.fn(() => <span>Custom</span>);
  const { container } = renderAndFlush(
    <LineChart
      data={data}
      x="name"
      y={["absent", "sales", "profit"]}
      showArea
      showAreaForSeries={[2]}
      tooltipRenderer={tooltip}
    />,
  );
  fireEvent.mouseEnter(screen.getByRole("graphics-symbol"));
  expect(tooltip).toHaveBeenLastCalledWith(
    expect.objectContaining({
      series: [
        expect.objectContaining({
          key: "sales",
          value: 1250,
          rawValue: "$1,250",
          color: "#10b981",
        }),
        expect.objectContaining({
          key: "profit",
          value: 45,
          rawValue: "45%",
          color: "#f59e0b",
        }),
      ],
    }),
  );
  expect(container.querySelectorAll("[data-line-area]")).toHaveLength(1);
  expect(container.querySelector("[data-line-area]")).toHaveAttribute(
    "data-line-area",
    "2",
  );
});
it("supports rows, series selection, activation, and dismissal without visible dots", () => {
  const onPointClick = jest.fn();
  const { container } = renderAndFlush(
    <LineChart
      data={sampleData}
      x="month"
      y={["sales", "profit"]}
      showDots={false}
      onPointClick={onPointClick}
    />,
  );
  expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  const targets = screen.getAllByRole("button");
  act(() => targets[0]!.focus());
  fireEvent.keyDown(targets[0]!, { key: "ArrowDown" });
  fireEvent.keyDown(targets[0]!, { key: "ArrowRight" });
  expect(targets[1]).toHaveFocus();
  fireEvent.keyDown(targets[1]!, { key: "Enter" });
  expect(onPointClick).toHaveBeenLastCalledWith(sampleData[1], 1, "profit");
  fireEvent.keyDown(targets[1]!, { key: "End" });
  expect(targets[2]).toHaveFocus();
  fireEvent.keyDown(targets[2]!, { key: "Home" });
  expect(targets[0]).toHaveFocus();
  fireEvent.keyDown(targets[0]!, { key: "Escape" });
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});
it("shows singleton observations without dots, and all-null data as empty", () => {
  const { container, rerender } = renderAndFlush(
    <LineChart
      data={[{ name: "A", value: 5 }]}
      x="name"
      y="value"
      showDots={false}
    />,
  );
  expect(container.querySelectorAll("[data-line-marker]")).toHaveLength(1);
  rerender(
    <LineChart data={[{ name: "A", value: null }]} x="name" y="value" />,
  );
  expect(screen.getByText("No Data")).toBeInTheDocument();
});
it("reports malformed data and clears stale inspection after a replacement", () => {
  const { rerender } = renderAndFlush(
    <LineChart data={sampleData} x="month" y="sales" />,
  );
  fireEvent.mouseEnter(screen.getAllByRole("graphics-symbol")[1]!);
  expect(screen.getByRole("tooltip")).toHaveTextContent("Feb");
  rerender(
    <LineChart data={[{ month: "New", sales: 8 }]} x="month" y="sales" />,
  );
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  rerender(
    <LineChart data={[{ month: "New", sales: "12abc" }]} x="month" y="sales" />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    '"sales" must contain a finite number or null',
  );
});
it("keeps gradient, clip, description, and tooltip IDs unique across charts", () => {
  const { container } = renderAndFlush(
    <>
      <LineChart data={sampleData} x="month" y="sales" showArea />
      <LineChart data={sampleData} x="month" y="sales" showArea />
    </>,
  );
  const ids = Array.from(container.querySelectorAll("[id]")).map(
    (node) => node.id,
  );
  expect(new Set(ids).size).toBe(ids.length);
});
it("respects reduced motion for the initial skeleton", () => {
  const motion =
    jest.requireMock<typeof import("framer-motion")>("framer-motion");
  jest.spyOn(motion, "useReducedMotion").mockReturnValue(true);
  const { container } = renderAndFlush(
    <LineChart data={[]} x="month" y="sales" loading />,
  );
  expect(screen.getByRole("status")).toHaveTextContent("Loading chart");
  expect(container.querySelector(".animate-pulse")).toBeNull();
  expect(container.querySelectorAll("[data-loading-line]")).toHaveLength(1);
});
