import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { animate, useReducedMotion } from "framer-motion";
import { WaterfallChart } from "./index";

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
  { label: "Opening", value: 100, type: "total", id: "a" },
  { label: "Sales", value: 40, id: "b" },
  { label: "Costs", value: -25, id: "c" },
  { label: "Period", type: "subtotal", id: "d" },
  { label: "Closing", type: "sum", id: "e" },
];
beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(animate).mockClear();
  jest.mocked(useReducedMotion).mockReturnValue(false);
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
function mount(ui: React.ReactElement) {
  const view = render(ui);
  act(() => jest.runAllTimers());
  return view;
}
const target = (i: number) =>
  document.querySelector<SVGRectElement>(`[data-waterfall-target="${i}"]`)!;
const mark = (i: number) =>
  document.querySelector<SVGElement>(`[data-waterfall-mark="${i}"]`)!;

it.each(["vertical", "horizontal"] as const)(
  "%s supports one tab stop, arrow navigation, selection and dismissal",
  (orientation) => {
    const click = jest.fn();
    mount(
      <WaterfallChart
        data={data}
        orientation={orientation}
        onBarClick={click}
      />,
    );
    expect(
      document.querySelectorAll('[data-waterfall-target][tabindex="0"]'),
    ).toHaveLength(1);
    act(() => target(0).focus());
    fireEvent.keyDown(target(0), { key: "ArrowRight" });
    expect(target(1)).toHaveFocus();
    fireEvent.keyDown(target(1), { key: "Enter" });
    expect(click).toHaveBeenLastCalledWith(data[1], 1);
    fireEvent.keyDown(target(1), { key: "End" });
    expect(target(4)).toHaveFocus();
    fireEvent.keyDown(target(4), { key: " " });
    expect(click).toHaveBeenLastCalledWith(data[4], 4);
    fireEvent.keyDown(target(4), { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(target(4)).toHaveAttribute("stroke", "currentColor");
    expect(target(4)).toHaveClass("text-foreground");
    fireEvent.keyDown(target(4), { key: "Home" });
    expect(target(0)).toHaveFocus();
  },
);
it("returns the original object plus computed metadata with custom keys", () => {
  const original = [
    { name: "Same", amount: 40 },
    { name: "Same", kind: "sum" },
  ] as const;
  const tip = jest.fn((value) => <span>Balance {value.cumulative}</span>);
  mount(
    <WaterfallChart
      data={original}
      x="name"
      y="amount"
      type="kind"
      tooltipRenderer={tip}
    />,
  );
  fireEvent.mouseEnter(target(1));
  expect(tip).toHaveBeenLastCalledWith(
    expect.objectContaining({
      data: original[1],
      index: 1,
      value: 40,
      previous: 40,
      start: 0,
      end: 40,
      cumulative: 40,
      type: "sum",
    }),
  );
  expect(screen.getByRole("tooltip")).toHaveTextContent("Balance 40");
});
it("keeps zero and tiny values inspectable without inventing bar height", () => {
  mount(
    <WaterfallChart
      data={[
        { label: "Opening", value: 1e6, type: "total" },
        { label: "Zero", value: 0 },
        { label: "Tiny", value: 0.001 },
      ]}
    />,
  );
  expect(mark(1).tagName).toBe("line");
  expect(Number(mark(2).getAttribute("height"))).toBeLessThan(0.01);
  expect(Number(target(2).getAttribute("height"))).toBeGreaterThanOrEqual(24);
  act(() => target(1).focus());
  expect(screen.getByRole("tooltip")).toHaveTextContent("Zero");
});
it("provides the full original sequence in View data, including repeated labels and zeros", () => {
  const click = jest.fn();
  mount(
    <WaterfallChart
      data={[
        { label: "Same", value: 0 },
        { label: "Same", value: 1 },
      ]}
      onBarClick={click}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "View data" }));
  const buttons = screen.getAllByRole("button", { name: "Same" });
  fireEvent.click(buttons[1]!);
  expect(click).toHaveBeenLastCalledWith({ label: "Same", value: 1 }, 1);
  fireEvent.keyDown(buttons[1]!, { key: "Escape" });
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "View data" })).toHaveFocus();
});
it("breaks a connector at an absolute reset and explains why", () => {
  mount(
    <WaterfallChart
      data={[
        { label: "Start", value: 100 },
        { label: "Reset", value: 40, type: "total" },
        { label: "Next", value: 10 },
      ]}
    />,
  );
  expect(document.querySelector('[data-waterfall-connector="0"]')).toBeNull();
  expect(
    document.querySelector('[data-waterfall-connector="1"]'),
  ).not.toBeNull();
  fireEvent.mouseEnter(target(1));
  expect(screen.getByRole("tooltip")).toHaveTextContent(
    "Resets balance from 100",
  );
});
it("formats the same signed values in labels, tooltip and data table", () => {
  mount(
    <WaterfallChart
      data={data}
      showValues
      valueFormatter={(value) => `$${value}`}
    />,
  );
  expect(
    document.querySelector('[data-waterfall-value="1"]'),
  ).toHaveTextContent("+$40");
  fireEvent.mouseEnter(target(1));
  expect(screen.getByRole("tooltip")).toHaveTextContent("+$40");
  fireEvent.click(screen.getByRole("button", { name: "View data" }));
  expect(screen.getByRole("table")).toHaveTextContent("+$40");
});
it.each(["filled", "outline"] as const)(
  "%s supports CSS colors and flat/rounded borders",
  (variant) => {
    const view = mount(
      <WaterfallChart
        data={data}
        variant={variant}
        borderRadius={0}
        colors={{ increase: "var(--primary)" }}
      />,
    );
    expect(mark(1)).toHaveAttribute(
      "fill",
      variant === "outline" ? "none" : "var(--primary)",
    );
    expect(mark(1)).toHaveAttribute("rx", "0");
    view.rerender(
      <WaterfallChart data={data} variant={variant} borderRadius={16} />,
    );
    expect(Number(mark(1).getAttribute("rx"))).toBeGreaterThan(0);
  },
);
it.each(["loading", "empty", "error"])(
  "recovers from initial %s with the same root",
  (state) => {
    const view = mount(
      <WaterfallChart
        data={state === "empty" || state === "loading" ? [] : data}
        loading={state === "loading"}
        error={state === "error" ? "Unavailable" : null}
        height={400}
        className="owned"
      />,
    );
    const root = view.container.firstElementChild;
    expect(root).toHaveStyle({ height: "400px" });
    expect(root).toHaveClass("owned");
    view.rerender(<WaterfallChart data={data} height={400} />);
    act(() => jest.runAllTimers());
    expect(view.container.firstElementChild).toBe(root);
    expect(target(4)).toBeInTheDocument();
  },
);
it("refreshing preserves floating geometry and removes inspection", () => {
  const view = mount(<WaterfallChart data={data} />);
  const height = mark(1).getAttribute("height"),
    y = mark(1).getAttribute("y");
  view.rerender(<WaterfallChart data={data} loading />);
  expect(mark(1)).toHaveAttribute("height", height!);
  expect(mark(1)).toHaveAttribute("y", y!);
  expect(target(1)).toBeNull();
});
it("fails visibly for invalid values and recovers", () => {
  const view = mount(
    <WaterfallChart data={[{ label: "Unknown", value: null }]} />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("finite numeric value");
  view.rerender(<WaterfallChart data={data} />);
  expect(target(0)).toBeInTheDocument();
});
it.each([
  { height: -5 },
  { borderRadius: NaN },
  { barWidth: 2 },
  { initialValue: Infinity },
])("reports invalid configuration %o", (config) => {
  mount(<WaterfallChart data={data} {...config} />);
  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(target(0)).toBeNull();
});
it("grows bars from their actual start and avoids replay on hover or styles", () => {
  const view = mount(<WaterfallChart data={data} />);
  const calls = jest.mocked(animate).mock.calls.length;
  const transform = document
    .querySelectorAll("[data-waterfall-growth]")[2]!
    .getAttribute("transform");
  expect(transform).toMatch(/translate\(0 .+\) scale\(1 1\) translate/);
  fireEvent.mouseEnter(target(1));
  expect(
    jest.mocked(animate).mock.results.at(-1)?.value.stop,
  ).toHaveBeenCalled();
  view.rerender(<WaterfallChart data={data} showGrid borderRadius={12} />);
  expect(animate).toHaveBeenCalledTimes(calls);
});
it.each(["disabled", "reduced"])(
  "renders final geometry when motion is %s",
  (mode) => {
    jest.mocked(useReducedMotion).mockReturnValue(mode === "reduced");
    mount(<WaterfallChart data={data} animation={mode !== "disabled"} />);
    expect(animate).not.toHaveBeenCalled();
    expect(document.querySelector("[data-waterfall-growth]")).toHaveAttribute(
      "transform",
      expect.stringContaining("scale(1 1)"),
    );
  },
);
it("keeps long sequences in an internal viewport", () => {
  mount(
    <WaterfallChart
      data={Array.from({ length: 100 }, (_, i) => ({
        label: `Step ${i}`,
        value: 1,
      }))}
    />,
  );
  expect(
    Number(
      document
        .querySelector("[data-waterfall-chart] svg")!
        .getAttribute("width"),
    ),
  ).toBeGreaterThan(4800);
  expect(document.querySelector("[data-waterfall-chart] > div")).toHaveClass(
    "overflow-auto",
  );
  expect(target(99)).toBeInTheDocument();
});
it("recovers focus after the focused observation is removed", () => {
  const view = mount(<WaterfallChart data={data} />);
  act(() => target(4).focus());
  view.rerender(<WaterfallChart data={data.slice(0, 2)} />);
  expect(target(1)).toHaveFocus();
  expect(screen.getByRole("tooltip")).toHaveTextContent("Sales");
});
it("does not replay its entrance when a formatter changes", () => {
  const view = mount(<WaterfallChart data={data} />);
  const calls = jest.mocked(animate).mock.calls.length;
  view.rerender(
    <WaterfallChart data={data} valueFormatter={(value) => `$${value}`} />,
  );
  expect(animate).toHaveBeenCalledTimes(calls);
});
