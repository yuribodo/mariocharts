import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { animate, useReducedMotion } from "framer-motion";
import { TreeMapChart, type TreeMapLayout } from "./index";
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
  {
    name: "Group",
    children: [
      { name: "A", value: 60 },
      { name: "B", value: 20 },
      { name: "Zero", value: 0 },
    ],
  },
  { name: "Group", children: [{ name: "A", value: 20 }] },
];
const props = { data, animation: false } as const;
beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(animate).mockClear();
  jest.mocked(useReducedMotion).mockReturnValue(false);
  jest
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue({
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      fillStyle: "",
      getImageData: () => ({ data: [250, 250, 250, 255] }),
    } as unknown as CanvasRenderingContext2D);
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
function mount(ui: React.ReactElement) {
  const view = render(ui);
  act(() => jest.runAllTimers());
  return view;
}
const target = (key: string) =>
  document.querySelector<SVGRectElement>(`[data-tree-target="${key}"]`)!;
it.each<TreeMapLayout>(["squarified", "binary", "slice-dice"])(
  "%s supports keyboard drill-down, breadcrumbs and original observation callbacks",
  (layout) => {
    const onClick = jest.fn();
    mount(<TreeMapChart {...props} layout={layout} onClick={onClick} />);
    expect(
      document.querySelectorAll('[data-tree-target][tabindex="0"]'),
    ).toHaveLength(1);
    act(() => target("0").focus());
    fireEvent.keyDown(target("0"), { key: "Enter" });
    expect(onClick).toHaveBeenLastCalledWith(data[0], ["Group"]);
    expect(target("0.0")).toHaveFocus();
    expect(screen.getByRole("navigation")).toHaveTextContent(
      "All groups/Group",
    );
    fireEvent.keyDown(target("0.0"), { key: "ArrowRight" });
    expect(target("0.1")).toHaveFocus();
    fireEvent.keyDown(target("0.1"), { key: " " });
    expect(onClick).toHaveBeenLastCalledWith(data[0]!.children[1], [
      "Group",
      "B",
    ]);
    fireEvent.keyDown(target("0.1"), { key: "Backspace" });
    expect(target("0")).toHaveFocus();
    fireEvent.keyDown(target("0"), { key: "End" });
    expect(target("1.0")).toHaveFocus();
    fireEvent.keyDown(target("1.0"), { key: "Home" });
    expect(target("0")).toHaveFocus();
    fireEvent.keyDown(target("0"), { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  },
);
it("provides global, parent and current-view shares without losing repeated-name identity", () => {
  const inspect = jest.fn(() => <p>Custom inspection</p>);
  mount(<TreeMapChart {...props} tooltipRenderer={inspect} />);
  fireEvent.mouseEnter(target("1.0"));
  expect(inspect).toHaveBeenLastCalledWith(
    expect.objectContaining({
      node: data[1]!.children[0],
      indexPath: [1, 0],
      percentage: 20,
      parentPercentage: 100,
      viewPercentage: 20,
    }),
  );
  fireEvent.click(target("0"));
  fireEvent.mouseEnter(target("0.0"));
  expect(inspect).toHaveBeenLastCalledWith(
    expect.objectContaining({
      percentage: 60,
      parentPercentage: 75,
      viewPercentage: 75,
    }),
  );
});
it("uses only leaves in flat mode and keeps parent colors after drilling", () => {
  const view = mount(<TreeMapChart {...props} />);
  const color = document
    .querySelector('[data-tree-tile="0.0"]')!
    .getAttribute("fill");
  fireEvent.click(target("0"));
  expect(document.querySelector('[data-tree-tile="0.0"]')).toHaveAttribute(
    "fill",
    color,
  );
  view.rerender(<TreeMapChart {...props} variant="flat" />);
  expect(document.querySelector("[data-tree-group]")).toBeNull();
  expect(target("0.0")).toBeInTheDocument();
});
it("exposes zero nodes via View data without painted or invented area", () => {
  const onClick = jest.fn();
  mount(<TreeMapChart {...props} onClick={onClick} />);
  expect(target("0.2")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "View data" }));
  fireEvent.click(screen.getByRole("button", { name: "Group / Zero" }));
  expect(onClick).toHaveBeenLastCalledWith(data[0]!.children[2], [
    "Group",
    "Zero",
  ]);
  expect(screen.getByRole("tooltip")).toHaveTextContent("0.0% of total");
  fireEvent.keyDown(screen.getByRole("table"), { key: "Escape" });
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "View data" })).toHaveFocus();
});
it("distinguishes empty data from all-zero observations", () => {
  const view = mount(<TreeMapChart data={[]} />);
  expect(screen.getByRole("status")).toHaveTextContent("No Data");
  view.rerender(<TreeMapChart data={[{ name: "Zero", value: 0 }]} />);
  expect(screen.getByRole("status")).toHaveTextContent("No positive values");
  fireEvent.click(screen.getByRole("button", { name: "View data" }));
  expect(screen.getByRole("table")).toHaveTextContent("Zero");
});
it("retains the measured frame and tile geometry during refresh and recovers from errors", () => {
  const view = mount(<TreeMapChart {...props} />),
    root = view.container.firstChild;
  const dimensions = (selector: string) =>
    [...view.container.querySelectorAll(selector)].map((n) =>
      ["x", "y", "width", "height"].map((a) => n.getAttribute(a)),
    );
  const before = dimensions("[data-tree-tile]");
  view.rerender(<TreeMapChart {...props} loading />);
  expect(dimensions("[data-loading-tile]")).toEqual(before);
  expect(target("0")).toBeNull();
  view.rerender(<TreeMapChart {...props} error="Try again" />);
  expect(screen.getByRole("alert")).toHaveTextContent("Try again");
  view.rerender(<TreeMapChart {...props} />);
  expect(view.container.firstChild).toBe(root);
  expect(target("0")).toBeInTheDocument();
});
it("resets scope on fresh data and preserves keyboard inspection when a focused tile remains", () => {
  const view = mount(<TreeMapChart {...props} />);
  fireEvent.click(target("0"));
  view.rerender(
    <TreeMapChart {...props} data={[{ name: "New", value: 10 }]} />,
  );
  expect(target("0")).toHaveAccessibleName(/New/);
  act(() => target("0").focus());
  view.rerender(
    <TreeMapChart {...props} data={[{ name: "New", value: 20 }]} />,
  );
  expect(target("0")).toHaveFocus();
  expect(screen.getByRole("tooltip")).toHaveTextContent("20");
});
it.each([true, false])(
  "respects reduced motion / disabled animation (%s)",
  (reduced) => {
    jest.mocked(useReducedMotion).mockReturnValue(reduced);
    mount(<TreeMapChart {...props} animation={reduced} />);
    expect(animate).not.toHaveBeenCalled();
  },
);
it("does not replay or recolor tiles on hover", () => {
  mount(<TreeMapChart {...props} animation />);
  const calls = jest.mocked(animate).mock.calls.length;
  fireEvent.mouseEnter(target("0.0"));
  expect(animate).toHaveBeenCalledTimes(calls);
  expect(document.querySelector('[data-tree-tile="0.0"]')).toHaveAttribute(
    "fill",
    "#3b82f6",
  );
});
it("supports CSS colors without concatenating hexadecimal alpha suffixes", () => {
  mount(<TreeMapChart {...props} colors={["var(--primary)"]} />);
  expect(document.querySelector('[data-tree-tile="0.0"]')).toHaveAttribute(
    "fill",
    "var(--primary)",
  );
  expect(document.querySelector("[data-tree-label]")).toHaveStyle({
    color: "#000000",
  });
});
it("fails with an actionable leaf error and uses a grouped initial skeleton", () => {
  const view = mount(<TreeMapChart data={[{ name: "Missing" }]} />);
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Supply the missing count",
  );
  view.rerender(<TreeMapChart data={[]} loading />);
  expect(screen.getByRole("status")).toHaveTextContent("Loading treemap");
  expect(
    view.container.querySelectorAll("[data-loading-tile]").length,
  ).toBeGreaterThan(1);
});
