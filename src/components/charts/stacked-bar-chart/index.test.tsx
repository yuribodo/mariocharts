import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { animate, useReducedMotion } from "framer-motion";
import { StackedBarChart, type StackedBarChartProps } from "./index";
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
  { label: "A", a: 100, b: -50, c: 20 },
  { label: "B", a: -30, b: 80, c: 0 },
];
const props = { data, x: "label", y: ["a", "b", "c"] } as const;
beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(animate).mockClear();
  jest.mocked(useReducedMotion).mockReturnValue(false);
  jest
    .spyOn(Element.prototype, "getBoundingClientRect")
    .mockReturnValue({
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
const target = (row: number, stack: number) =>
  document.querySelector(`[data-stack-target="${row}-${stack}"]`)!;
const paths = () =>
  [...document.querySelectorAll("[data-stack-segment]")].map((node) =>
    node.getAttribute("d"),
  );
it("exposes one Tab stop, inspection symbols and an accessible source table", () => {
  renderAndFlush(<StackedBarChart {...props} />);
  expect(
    screen.getByRole("group", { name: "Stacked bar chart" }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("graphics-symbol")).toHaveLength(6);
  expect(
    document.querySelectorAll('[data-stack-target][tabindex="0"]'),
  ).toHaveLength(1);
  expect(screen.queryByRole("button")).toBeNull();
  expect(screen.getByRole("table")).toHaveAccessibleName(/source values/);
});
it.each(["loading", "empty", "error", "invalid"])(
  "recovers from %s without replacing its measured frame",
  (state) => {
    const { container, rerender } = renderAndFlush(
      <StackedBarChart
        {...props}
        height={400}
        loading={state === "loading"}
        error={state === "error" ? "Offline" : null}
        data={
          state === "empty"
            ? []
            : state === "invalid"
              ? [{ ...data[0]!, a: NaN }]
              : data
        }
      />,
    );
    const frame = container.firstElementChild;
    rerender(<StackedBarChart {...props} height={400} />);
    act(() => {
      jest.runAllTimers();
    });
    expect(container.firstElementChild).toBe(frame);
    expect(frame).toHaveStyle({ height: "400px" });
    expect(paths()).toHaveLength(6);
  },
);
it.each(["vertical", "horizontal"] as const)(
  "preserves exact loading paths and grid in %s",
  (orientation) => {
    const { container, rerender } = renderAndFlush(
      <StackedBarChart
        {...props}
        orientation={orientation}
        height={400}
        showLegend
        showGrid
        cornerRadius={8}
      />,
    );
    const ready = paths();
    const grid = [...container.querySelectorAll("[data-stack-grid]")].map(
      (node) => node.outerHTML,
    );
    rerender(
      <StackedBarChart
        {...props}
        orientation={orientation}
        height={400}
        showLegend
        showGrid
        cornerRadius={8}
        loading
      />,
    );
    expect(
      [...container.querySelectorAll("[data-loading-segment]")].map((node) =>
        node.getAttribute("d"),
      ),
    ).toEqual(ready);
    expect(
      [...container.querySelectorAll("[data-stack-grid]")].map(
        (node) => node.outerHTML,
      ),
    ).toEqual(grid);
    expect(container.firstElementChild).toHaveStyle({ height: "400px" });
    expect(screen.queryByRole("graphics-symbol")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Loading chart");
  },
);
it("renders a neutral initial skeleton without data", () => {
  renderAndFlush(<StackedBarChart {...props} data={[]} loading />);
  expect(document.querySelectorAll("[data-loading-segment]")).toHaveLength(12);
});
it.each(["filled", "outline"] as const)(
  "selects the actual segment in %s mode, including zero values",
  (variant) => {
    const callback = jest.fn();
    renderAndFlush(
      <StackedBarChart
        {...props}
        variant={variant}
        onSegmentClick={callback}
      />,
    );
    fireEvent.click(target(0, 1));
    expect(callback).toHaveBeenLastCalledWith(data[0], "b", 0);
    act(() => {
      (target(1, 2) as SVGRectElement).focus();
    });
    fireEvent.keyDown(target(1, 2), { key: " " });
    expect(callback).toHaveBeenLastCalledWith(data[1], "c", 1);
    expect(target(1, 2)).toHaveAccessibleName("B, c: 0");
    expect(
      document.querySelector('[data-stack-segment="1-2"]'),
    ).toHaveAttribute("d", "");
  },
);
it.each(["vertical", "horizontal"] as const)(
  "navigates categories and segments in %s orientation",
  (orientation) => {
    renderAndFlush(<StackedBarChart {...props} orientation={orientation} />);
    act(() => {
      (target(0, 0) as SVGRectElement).focus();
    });
    fireEvent.keyDown(target(0, 0), {
      key: orientation === "vertical" ? "ArrowRight" : "ArrowDown",
    });
    expect(target(1, 0)).toHaveFocus();
    fireEvent.keyDown(target(1, 0), {
      key: orientation === "vertical" ? "ArrowUp" : "ArrowRight",
    });
    expect(target(1, 1)).toHaveFocus();
    fireEvent.keyDown(target(1, 1), { key: "End" });
    expect(target(1, 2)).toHaveFocus();
    fireEvent.keyDown(target(1, 2), { key: "Home" });
    expect(target(0, 0)).toHaveFocus();
    fireEvent.keyDown(target(0, 0), { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
  },
);
it("reports signed subtotals and a net total without cancelling the drawing", () => {
  renderAndFlush(
    <StackedBarChart
      {...props}
      data={[{ label: "Balance", a: 100, b: -100, c: 0 }]}
    />,
  );
  fireEvent.mouseEnter(target(0, 0));
  const tip = screen.getByRole("tooltip");
  expect(tip).toHaveTextContent("Positive total100");
  expect(tip).toHaveTextContent("Negative total-100");
  expect(tip).toHaveTextContent("Net total0");
  expect(paths().filter(Boolean)).toHaveLength(2);
});
it("provides original-row and active-segment tooltip metadata", () => {
  const renderer = jest.fn((item) => <span>{item.activeKey}</span>);
  renderAndFlush(<StackedBarChart {...props} tooltipRenderer={renderer} />);
  fireEvent.pointerDown(target(1, 2));
  expect(renderer).toHaveBeenLastCalledWith(
    expect.objectContaining({
      data: data[1],
      index: 1,
      activeKey: "c",
      activeIndex: 2,
      total: 50,
      positiveTotal: 80,
      negativeTotal: -30,
    }),
  );
});
it("formats inspection, accessible values, and ticks independently", () => {
  renderAndFlush(
    <StackedBarChart
      {...props}
      valueFormatter={(v) => `$${v}`}
      axisValueFormatter={(v) => `${v} units`}
    />,
  );
  expect(target(0, 0)).toHaveAccessibleName("A, a: $100");
  fireEvent.mouseEnter(target(0, 0));
  expect(screen.getByRole("tooltip")).toHaveTextContent("$100");
  expect(document.querySelector("svg")).toHaveTextContent("0 units");
});
it("clears stale inspection when rows or stack keys change", () => {
  const { rerender } = renderAndFlush(<StackedBarChart {...props} />);
  fireEvent.mouseEnter(target(0, 0));
  expect(screen.getByRole("tooltip")).toBeInTheDocument();
  rerender(
    <StackedBarChart {...props} data={[{ ...data[0]!, label: "New" }]} />,
  );
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.mouseEnter(target(0, 0));
  rerender(<StackedBarChart {...props} y={["c", "b", "a"]} />);
  expect(screen.queryByRole("tooltip")).toBeNull();
});
it("retains focused inspection when pointer leaves and dismisses on outside blur", () => {
  const { container } = renderAndFlush(
    <>
      <StackedBarChart {...props} />
      <button>Outside</button>
    </>,
  );
  act(() => {
    (target(0, 0) as SVGRectElement).focus();
  });
  fireEvent.mouseEnter(target(1, 1));
  fireEvent.mouseLeave(container.firstElementChild!);
  expect(screen.getByRole("tooltip")).toHaveTextContent("A");
  act(() => screen.getByRole("button", { name: "Outside" }).focus());
  expect(screen.queryByRole("tooltip")).toBeNull();
});
it.each([null, "12oops", Infinity])(
  "reports malformed values (%p), preserving zero as valid",
  (value) => {
    renderAndFlush(
      <StackedBarChart
        data={[{ label: "A", value }]}
        x="label"
        y={["value"]}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      /Row 1.*value.*finite number/,
    );
  },
);
it.each([
  { height: -1 },
  { height: NaN },
  { cornerRadius: -1 },
  { cornerRadius: Infinity },
  { y: [] },
  { y: ["a", "a"] },
])("validates options %p", (overrides) => {
  renderAndFlush(
    <StackedBarChart
      {...props}
      {...(overrides as Partial<StackedBarChartProps<(typeof data)[number]>>)}
    />,
  );
  expect(screen.getByRole("alert")).toBeInTheDocument();
});
it("uses unique clip IDs for separate charts and preserves CSS color tokens", () => {
  renderAndFlush(
    <>
      <StackedBarChart {...props} colors={["var(--custom)"]} />
      <StackedBarChart {...props} />
    </>,
  );
  const ids = [...document.querySelectorAll("clipPath")].map((node) => node.id);
  expect(new Set(ids).size).toBe(2);
  expect(document.querySelector("[data-stack-segment]")).toHaveAttribute(
    "fill",
    "var(--custom)",
  );
});
it("does not restart entrance on inspection or resize", () => {
  const { rerender } = renderAndFlush(<StackedBarChart {...props} />);
  const calls = jest.mocked(animate).mock.calls.length;
  fireEvent.mouseEnter(target(0, 0));
  rerender(<StackedBarChart {...props} height={500} />);
  expect(jest.mocked(animate).mock.calls).toHaveLength(calls);
});
it.each(["disabled", "reduced"])(
  "renders final geometry with %s motion",
  (mode) => {
    jest.mocked(useReducedMotion).mockReturnValue(mode === "reduced");
    renderAndFlush(
      <StackedBarChart {...props} animation={mode !== "disabled"} />,
    );
    expect(animate).not.toHaveBeenCalled();
    expect(document.querySelector("[data-stack-growth]")).toHaveAttribute(
      "transform",
      expect.stringContaining("scale(1 1)"),
    );
  },
);
