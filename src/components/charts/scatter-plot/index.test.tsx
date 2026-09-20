import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ScatterPlot, type ScatterPlotProps } from "./index";

jest.mock("framer-motion", () => {
  const actual =
    jest.requireActual<typeof import("framer-motion")>("framer-motion");
  return {
    useMotionValue: actual.useMotionValue,
    useReducedMotion: jest.fn(() => false),
    animate: jest.fn((value, target) => {
      value.set(target);
      return { stop: jest.fn() };
    }),
  };
});
const data = [
  { name: "A", x: 8, y: 9, size: 400, group: "First" },
  { name: "B", x: 2, y: 3, size: 100, group: "First" },
  { name: "C", x: 5, y: 6, size: 225, group: "Second" },
  { name: "D", x: 5, y: 6, size: 0, group: "Second" },
];
const props = { data, x: "x", y: "y", label: "name", series: "group" } as const;
beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    width: 800,
    height: 400,
    top: 0,
    left: 0,
    bottom: 400,
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
  const result = render(ui);
  act(() => {
    jest.runAllTimers();
  });
  return result;
}
const point = (index: number) =>
  document.querySelector(`[data-scatter-point="${index}"]`)!;

it("renders labelled inspection targets without claiming button actions", () => {
  renderAndFlush(<ScatterPlot {...props} />);
  expect(
    screen.getByRole("group", { name: "Scatter plot with 4 visible points" }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("graphics-symbol")).toHaveLength(4);
  expect(screen.queryByRole("button")).toBeNull();
  expect(screen.getByRole("table")).toHaveAccessibleName(/observations/);
});
it.each(["loading", "empty", "error", "invalid"])(
  "recovers from %s in the same measured frame",
  (state) => {
    const { container, rerender } = renderAndFlush(
      <ScatterPlot
        {...props}
        data={state === "empty" ? [] : data}
        loading={state === "loading"}
        error={state === "error" ? "Offline" : null}
        xDomain={state === "invalid" ? [10, 0] : [0, 10]}
        height={420}
      />,
    );
    const frame = container.firstElementChild;
    rerender(<ScatterPlot {...props} height={420} />);
    expect(container.firstElementChild).toBe(frame);
    expect(frame).toHaveStyle({ height: "420px" });
    expect(screen.getByRole("group")).toBeInTheDocument();
  },
);
it.each([6, "size"] as const)(
  "retains positions, radii, trends and frame dimensions while refreshing size=%p",
  (size) => {
    const settings = {
      ...props,
      size,
      animation: false,
      showTrendLine: true,
      showLegend: true,
      showGrid: true,
      height: 420,
    } as const;
    const { container, rerender } = renderAndFlush(
      <ScatterPlot {...settings} />,
    );
    const geometry = (selector: string) =>
      [...container.querySelectorAll(selector)].map((el) => [
        el.getAttribute("cx"),
        el.getAttribute("cy"),
        el.getAttribute("r"),
      ]);
    const dots = geometry("[data-scatter-dot]");
    const trends = [...container.querySelectorAll("[data-scatter-trend]")].map(
      (el) => el.outerHTML,
    );
    const svgHeight = container.querySelector("svg")!.getAttribute("height");
    rerender(<ScatterPlot {...settings} loading />);
    expect(geometry("[data-loading-dot]")).toEqual(dots);
    expect(container.querySelector("svg")).toHaveAttribute("height", svgHeight);
    expect(container.querySelector("[tabindex]")).toBeNull();
    expect(container.querySelector(".animate-pulse")).toBeNull();
    expect(container.querySelectorAll("[data-scatter-trend]")).toHaveLength(
      trends.length,
    );
  },
);
it("uses a neutral initial skeleton without announcing fabricated values", () => {
  renderAndFlush(<ScatterPlot {...props} data={[]} loading />);
  expect(screen.getByRole("status")).toHaveTextContent("Loading chart");
  expect(screen.queryByRole("table")).toBeNull();
  expect(document.querySelectorAll("[data-loading-dot]")).toHaveLength(8);
});
it("reports invalid coordinates rather than silently discarding observations", () => {
  renderAndFlush(
    <ScatterPlot {...props} data={[...data, { ...data[0]!, x: null }]} />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent('Row 5: "x"');
  expect(document.querySelector("[data-scatter-point]")).toBeNull();
});
it("keeps clipped points out of the focus order while preserving original indices and colors", () => {
  const click = jest.fn();
  const { container } = renderAndFlush(
    <ScatterPlot
      {...props}
      xDomain={[4, 6]}
      yDomain={[4, 8]}
      onPointClick={click}
      showLegend
    />,
  );
  expect(container.querySelectorAll("[data-scatter-point]")).toHaveLength(2);
  expect(
    screen.getByText("2 of 4 points outside this range"),
  ).toBeInTheDocument();
  expect(container.querySelector('[data-scatter-dot="2"]')).toHaveAttribute(
    "fill",
    "#10b981",
  );
  fireEvent.click(point(2));
  expect(click).toHaveBeenLastCalledWith(data[2], 2, "Second");
  expect(container.querySelector("clipPath rect")).toBeInTheDocument();
});
it("keeps axes and a clear message for an empty viewport, then recovers", () => {
  const { rerender } = renderAndFlush(
    <ScatterPlot {...props} xDomain={[20, 30]} />,
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "No points in this range",
  );
  expect(document.querySelector("[data-scatter-axis]")).toBeInTheDocument();
  expect(document.querySelector("[data-scatter-point]")).toBeNull();
  rerender(<ScatterPlot {...props} />);
  expect(document.querySelectorAll("[data-scatter-point]")).toHaveLength(4);
});
it("navigates X order, overlapping points, zero bubbles and series from one Tab stop", () => {
  const click = jest.fn();
  renderAndFlush(<ScatterPlot {...props} size="size" onPointClick={click} />);
  expect(
    document.querySelectorAll('[data-scatter-point][tabindex="0"]'),
  ).toHaveLength(1);
  act(() => {
    (point(1) as SVGCircleElement).focus();
  });
  fireEvent.keyDown(point(1), { key: "ArrowRight" });
  expect(point(2)).toHaveFocus();
  fireEvent.keyDown(point(2), { key: "ArrowRight" });
  expect(point(3)).toHaveFocus();
  expect(screen.getByRole("tooltip")).toHaveTextContent("Size0");
  fireEvent.keyDown(point(3), { key: "ArrowDown" });
  expect(point(1)).toHaveFocus();
  fireEvent.keyDown(point(1), { key: "Home" });
  expect(point(1)).toHaveFocus();
  fireEvent.keyDown(point(1), { key: "End" });
  expect(point(0)).toHaveFocus();
  fireEvent.keyDown(point(0), { key: "Enter" });
  fireEvent.keyDown(point(0), { key: " " });
  expect(click).toHaveBeenCalledTimes(2);
  expect(click).toHaveBeenLastCalledWith(data[0], 0, "First");
  fireEvent.keyDown(point(0), { key: "Escape" });
  expect(screen.queryByRole("tooltip")).toBeNull();
});
it("keeps measured bubble radii fixed on hover and preserves data in the tooltip", () => {
  const tooltip = jest.fn(() => <span>Details</span>);
  const { container } = renderAndFlush(
    <ScatterPlot
      {...props}
      size="size"
      animation={false}
      tooltipRenderer={tooltip}
      xFormatter={(v) => `${v} units`}
    />,
  );
  const dot = container.querySelector('[data-scatter-dot="1"]')!;
  const radius = dot.getAttribute("r");
  fireEvent.pointerDown(point(1));
  expect(dot).toHaveAttribute("r", radius);
  expect(tooltip).toHaveBeenLastCalledWith(
    expect.objectContaining({
      data: data[1],
      index: 1,
      label: "B",
      formattedX: "2 units",
      sizeValue: 100,
    }),
  );
});
it("draws no artificial trend for vertical data or a single point", () => {
  const { rerender } = renderAndFlush(
    <ScatterPlot
      {...props}
      data={data.map((p) => ({ ...p, x: 5 }))}
      showTrendLine
    />,
  );
  expect(document.querySelector("[data-scatter-trend]")).toBeNull();
  rerender(<ScatterPlot {...props} data={data.slice(0, 1)} showTrendLine />);
  expect(document.querySelector("[data-scatter-trend]")).toBeNull();
});
it("clears stale inspection after data or domain changes", () => {
  const { rerender } = renderAndFlush(<ScatterPlot {...props} />);
  fireEvent.mouseEnter(point(0));
  rerender(<ScatterPlot {...props} xDomain={[0, 4]} />);
  expect(screen.queryByRole("tooltip")).toBeNull();
  rerender(<ScatterPlot {...props} />);
  fireEvent.mouseEnter(point(0));
  rerender(<ScatterPlot {...props} data={data.slice(1)} />);
  expect(screen.queryByRole("tooltip")).toBeNull();
});
it("does not replay entrance for hover, size mapping or resize", () => {
  const motion =
    jest.requireMock<typeof import("framer-motion")>("framer-motion");
  const { rerender } = renderAndFlush(<ScatterPlot {...props} size="size" />);
  const calls = jest.mocked(motion.animate).mock.calls.length;
  fireEvent.mouseEnter(point(0));
  rerender(
    <ScatterPlot {...props} size="size" sizeScale="radius" height={440} />,
  );
  expect(jest.mocked(motion.animate).mock.calls).toHaveLength(calls);
});
it("respects reduced motion and creates unique clip paths", () => {
  const motion =
    jest.requireMock<typeof import("framer-motion")>("framer-motion");
  jest.spyOn(motion, "useReducedMotion").mockReturnValue(true);
  const calls = jest.mocked(motion.animate).mock.calls.length;
  const { container } = renderAndFlush(
    <>
      <ScatterPlot {...props} />
      <ScatterPlot {...props} loading />
    </>,
  );
  expect(container.querySelector(".animate-pulse")).toBeNull();
  expect(jest.mocked(motion.animate).mock.calls).toHaveLength(calls);
  const ids = [...container.querySelectorAll("[id]")].map((el) => el.id);
  expect(new Set(ids).size).toBe(ids.length);
});
it.each([
  { height: -1 },
  { xDomain: [2, 1] },
  { yDomain: [0, Infinity] },
  { size: NaN },
  { size: -3 },
  { sizeRange: [10, 2] },
  { sizeRange: [-1, 10] },
] satisfies Partial<ScatterPlotProps<(typeof data)[number]>>[])(
  "reports invalid options %p",
  (settings) => {
    renderAndFlush(<ScatterPlot {...props} {...settings} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  },
);
