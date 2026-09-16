import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { RadarChart, type RadarChartProps } from "./index";

// Real DOM focus and Motion values; the browser suite verifies intermediate animation frames.
jest.mock("framer-motion", () => {
  const actual =
    jest.requireActual<typeof import("framer-motion")>("framer-motion");
  return {
    useMotionValue: actual.useMotionValue,
    useTransform: actual.useTransform,
    useReducedMotion: jest.fn(() => false),
    animate: jest.fn((value, target) => {
      value.set(target);
      return { stop: jest.fn() };
    }),
  };
});
const axes = [
  { key: "speed", label: "Speed", min: 0, max: 100 },
  { key: "power", label: "Power", min: 0, max: 100 },
  { key: "defense", label: "Defense", min: 0, max: 100 },
] as const;
const series = [
  { id: "a", name: "Player A", data: { speed: 80, power: 60, defense: 90 } },
  { id: "b", name: "Player B", data: { speed: 50, power: 80, defense: 70 } },
];
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
const point = (s: number, axis: number) =>
  document.querySelector(`[data-radar-point="${s}-${axis}"]`)!;

it("renders a labelled chart and an accessible data table with each axis range", () => {
  renderAndFlush(<RadarChart axes={axes} series={series} />);
  expect(
    screen.getByRole("group", { name: "Radar chart with 2 series and 3 axes" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("table")).toHaveAccessibleName(
    /data and axis ranges/,
  );
  expect(
    screen.getByRole("columnheader", { name: "Speed (0 to 100)" }),
  ).toBeInTheDocument();
  expect(document.querySelectorAll("[data-radar-series]")).toHaveLength(2);
});

it.each(["loading", "empty", "error", "invalid"])(
  "recovers from %s with the same measured frame",
  (state) => {
    const { container, rerender } = renderAndFlush(
      <RadarChart
        axes={axes}
        series={state === "empty" ? [] : series}
        loading={state === "loading"}
        error={state === "error" ? "Offline" : null}
        gridLevels={state === "invalid" ? 0 : 5}
        height={420}
      />,
    );
    const frame = container.firstElementChild;
    rerender(<RadarChart axes={axes} series={series} height={420} />);
    expect(container.firstElementChild).toBe(frame);
    expect(frame).toHaveStyle({ height: "420px" });
    expect(screen.getByRole("group")).toBeInTheDocument();
  },
);

it.each(["polygon", "circular"] as const)(
  "retains exact %s paths and dimensions during refresh",
  (gridType) => {
    const props = {
      axes,
      series,
      gridType,
      showLegend: true,
      animation: false,
      height: 440,
    } as const;
    const { container, rerender } = renderAndFlush(<RadarChart {...props} />);
    const paths = Array.from(
      container.querySelectorAll("[data-radar-series]"),
    ).map((el) => el.getAttribute("d"));
    const grids = Array.from(
      container.querySelectorAll("[data-radar-grid]"),
    ).map((el) => el.getAttribute("d"));
    const height = container.querySelector("svg")!.getAttribute("height");
    rerender(<RadarChart {...props} loading />);
    expect(
      Array.from(container.querySelectorAll("[data-loading-series]")).map(
        (el) => el.getAttribute("d"),
      ),
    ).toEqual(paths);
    expect(
      Array.from(container.querySelectorAll("[data-radar-grid]")).map((el) =>
        el.getAttribute("d"),
      ),
    ).toEqual(grids);
    expect(container.querySelector("svg")).toHaveAttribute("height", height);
    expect(container.querySelector("[tabindex]")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Loading chart");
    expect(container.querySelector(".animate-pulse")).toBeNull();
  },
);

it("uses neutral initial loading without exposing invented observations", () => {
  renderAndFlush(<RadarChart axes={axes} series={[]} loading />);
  expect(document.querySelectorAll("[data-loading-series]")).toHaveLength(1);
  expect(document.querySelectorAll("[data-radar-axis]")).toHaveLength(3);
  expect(screen.queryByRole("table")).toBeNull();
  expect(screen.queryByRole("graphics-symbol")).toBeNull();
});

it("announces empty, malformed, and too-few-axis input", () => {
  const { rerender } = renderAndFlush(<RadarChart axes={axes} series={[]} />);
  expect(screen.getByRole("status")).toHaveTextContent("No Data");
  rerender(<RadarChart axes={axes.slice(0, 2)} series={series} />);
  expect(screen.getByRole("alert")).toHaveTextContent("at least 3 axes");
  rerender(
    <RadarChart
      axes={axes}
      series={[{ ...series[0]!, data: { ...series[0]!.data, speed: null } }]}
    />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    '"speed" must contain a finite number',
  );
});

it.each([true, false])(
  "navigates every axis and series when showDots=%p",
  (showDots) => {
    const click = jest.fn();
    renderAndFlush(
      <RadarChart
        axes={axes}
        series={series}
        showDots={showDots}
        onSeriesClick={click}
      />,
    );
    expect(
      document.querySelectorAll('[data-radar-point][tabindex="0"]'),
    ).toHaveLength(1);
    act(() => {
      (point(0, 0) as SVGCircleElement).focus();
    });
    fireEvent.keyDown(point(0, 0), { key: "ArrowLeft" });
    expect(point(0, 2)).toHaveFocus();
    fireEvent.keyDown(point(0, 2), { key: "ArrowDown" });
    expect(point(1, 2)).toHaveFocus();
    fireEvent.keyDown(point(1, 2), { key: "ArrowRight" });
    expect(point(1, 0)).toHaveFocus();
    fireEvent.keyDown(point(1, 0), { key: "ArrowUp" });
    expect(point(0, 0)).toHaveFocus();
    fireEvent.keyDown(point(0, 0), { key: "End" });
    expect(point(0, 2)).toHaveFocus();
    fireEvent.keyDown(point(0, 2), { key: "Home" });
    expect(point(0, 0)).toHaveFocus();
    expect(screen.getByRole("tooltip")).toHaveTextContent("Range 0–100");
    fireEvent.keyDown(point(0, 0), { key: "Enter" });
    fireEvent.keyDown(point(0, 0), { key: " " });
    expect(click).toHaveBeenCalledTimes(2);
    expect(click).toHaveBeenLastCalledWith(series[0], 0);
    fireEvent.keyDown(point(0, 0), { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
  },
);

it("inspects zero observations even when every point coincides", () => {
  renderAndFlush(
    <RadarChart
      axes={axes}
      series={[
        { id: "zero", name: "Zero", data: { speed: 0, power: 0, defense: 0 } },
      ]}
      showDots={false}
    />,
  );
  act(() => {
    (point(0, 0) as SVGCircleElement).focus();
  });
  fireEvent.keyDown(point(0, 0), { key: "End" });
  expect(point(0, 2)).toHaveFocus();
  expect(point(0, 2)).toHaveAccessibleName("Zero, Defense: 0");
  expect(screen.getByRole("tooltip")).toHaveTextContent("Defense");
});

it.each([true, false])(
  "allows keyboard axis actions with labels=%p",
  (showAxisLabels) => {
    const click = jest.fn();
    renderAndFlush(
      <RadarChart
        axes={axes}
        series={series}
        onAxisClick={click}
        showAxisLabels={showAxisLabels}
        showAxisLines={false}
      />,
    );
    const axis = screen.getByRole("button", { name: "Select axis Power" });
    fireEvent.keyDown(axis, { key: "Enter" });
    fireEvent.keyDown(axis, { key: " " });
    expect(click).toHaveBeenCalledTimes(2);
    expect(click).toHaveBeenLastCalledWith(axes[1], 1);
  },
);

it("preserves the original series index when highlighting a different series", () => {
  const click = jest.fn();
  renderAndFlush(
    <RadarChart axes={axes} series={series} onSeriesClick={click} />,
  );
  fireEvent.mouseEnter(point(0, 0));
  fireEvent.click(point(1, 1));
  expect(click).toHaveBeenLastCalledWith(series[1], 1);
  fireEvent.click(
    screen.getByRole("button", { name: "Select series Player A" }),
  );
  expect(click).toHaveBeenLastCalledWith(series[0], 0);
});

it("provides point metadata and the original data to a custom tooltip for touch and focus", () => {
  const tooltip = jest.fn(() => <span>Custom details</span>);
  renderAndFlush(
    <RadarChart
      axes={axes}
      series={series}
      tooltipRenderer={tooltip}
      valueFormatter={(v, axis) => `${v} ${axis.key}`}
    />,
  );
  fireEvent.pointerDown(point(1, 2));
  expect(tooltip).toHaveBeenLastCalledWith(
    expect.objectContaining({
      type: "point",
      axisLabel: "Defense",
      value: 70,
      formattedValue: "70 defense",
      data: series[1]!.data,
    }),
  );
  expect(screen.getByRole("tooltip")).toHaveTextContent("Custom details");
});

it("supports legend inspection without claiming a series selection callback", () => {
  renderAndFlush(<RadarChart axes={axes} series={series} />);
  const legend = screen.getByRole("button", {
    name: "Inspect series Player B",
  });
  act(() => legend.focus());
  expect(screen.getByRole("tooltip")).toHaveTextContent("Player B");
  fireEvent.keyDown(legend, { key: "Escape" });
  expect(screen.queryByRole("tooltip")).toBeNull();
});

it("clears stale tooltips after data replacement and loading", () => {
  const { rerender } = renderAndFlush(
    <RadarChart axes={axes} series={series} />,
  );
  fireEvent.mouseEnter(point(1, 1));
  rerender(<RadarChart axes={axes} series={series.slice(0, 1)} />);
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.mouseEnter(point(0, 1));
  rerender(<RadarChart axes={axes} series={series} loading />);
  rerender(<RadarChart axes={axes} series={series} />);
  expect(screen.queryByRole("tooltip")).toBeNull();
});

it("does not replay the entrance for inspection, grid changes, or resizing", () => {
  const motion =
    jest.requireMock<typeof import("framer-motion")>("framer-motion");
  const { rerender } = renderAndFlush(
    <RadarChart axes={axes} series={series} />,
  );
  const calls = jest.mocked(motion.animate).mock.calls.length;
  fireEvent.mouseEnter(point(0, 0));
  rerender(
    <RadarChart axes={axes} series={series} height={460} gridType="circular" />,
  );
  expect(jest.mocked(motion.animate).mock.calls).toHaveLength(calls);
});

it("respects reduced motion and retains unique descriptions for multiple instances", () => {
  const motion =
    jest.requireMock<typeof import("framer-motion")>("framer-motion");
  jest.spyOn(motion, "useReducedMotion").mockReturnValue(true);
  const calls = jest.mocked(motion.animate).mock.calls.length;
  const { container } = renderAndFlush(
    <>
      <RadarChart axes={axes} series={series} loading />
      <RadarChart axes={axes} series={series} />
    </>,
  );
  expect(container.querySelector(".animate-pulse")).toBeNull();
  expect(jest.mocked(motion.animate).mock.calls).toHaveLength(calls);
  const ids = Array.from(container.querySelectorAll("[id]")).map((el) => el.id);
  expect(new Set(ids).size).toBe(ids.length);
});

it.each([
  { height: -10 },
  { gridLevels: Infinity },
  { gridLevels: 2.5 },
  { gridLevels: 100 },
  { labelOffset: NaN },
  { fillOpacity: 2 },
  { strokeWidth: -2 },
] satisfies Partial<RadarChartProps<(typeof series)[number]["data"]>>[])(
  "reports invalid layout options %p",
  (props) => {
    renderAndFlush(<RadarChart axes={axes} series={series} {...props} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  },
);

it("clears point focus and inspection when focus moves to an axis action", () => {
  renderAndFlush(
    <RadarChart axes={axes} series={series} onAxisClick={() => {}} />,
  );
  act(() => {
    (point(0, 0) as SVGCircleElement).focus();
  });
  expect(screen.getByRole("tooltip")).toBeInTheDocument();
  act(() => screen.getByRole("button", { name: "Select axis Power" }).focus());
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(point(0, 0)).toHaveAttribute("stroke", "transparent");
});
