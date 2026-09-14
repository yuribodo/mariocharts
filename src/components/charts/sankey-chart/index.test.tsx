import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { animate, useReducedMotion } from "framer-motion";
import { SankeyChart } from "./index";
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
const nodes = ["start", "a", "b", "end"].map((id) => ({
  id,
  label: id,
  metadata: `original-${id}`,
}));
const links = [
  { source: "start", target: "a", value: 60, tag: "one" },
  { source: "start", target: "b", value: 40, tag: "two" },
  { source: "a", target: "end", value: 60, tag: "three" },
  { source: "b", target: "end", value: 40, tag: "four" },
];
const props = { nodes, links, animation: false } as const;
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
  const result = render(ui);
  act(() => jest.runAllTimers());
  return result;
}
const node = (i: number) =>
  document.querySelector<SVGPathElement>(`[data-sankey-node-target="${i}"]`)!;
const link = (i: number) =>
  document.querySelector<SVGPathElement>(`[data-sankey-link-target="${i}"]`)!;
it("navigates nodes and connections with one tab stop and activates original data", () => {
  const onNodeClick = jest.fn(),
    onLinkClick = jest.fn();
  mount(
    <SankeyChart
      {...props}
      onNodeClick={onNodeClick}
      onLinkClick={onLinkClick}
    />,
  );
  expect(document.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  act(() => node(0).focus());
  fireEvent.keyDown(node(0), { key: "ArrowRight" });
  expect(node(1)).toHaveFocus();
  fireEvent.keyDown(node(1), { key: "Enter" });
  expect(onNodeClick).toHaveBeenLastCalledWith(nodes[1], 1);
  fireEvent.keyDown(node(1), { key: "End" });
  expect(link(3)).toHaveFocus();
  fireEvent.keyDown(link(3), { key: " " });
  expect(onLinkClick).toHaveBeenLastCalledWith(links[3], 3);
  fireEvent.keyDown(link(3), { key: "ArrowRight" });
  expect(node(0)).toHaveFocus();
  fireEvent.keyDown(node(0), { key: "Escape" });
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});
it("highlights only the selected branch and exposes transition shares", () => {
  const inspect = jest.fn(() => <p>Custom</p>);
  mount(<SankeyChart {...props} tooltipRenderer={inspect} />);
  fireEvent.mouseEnter(link(0));
  expect(inspect).toHaveBeenLastCalledWith(
    expect.objectContaining({
      kind: "link",
      data: links[0],
      index: 0,
      source: nodes[0],
      target: nodes[1],
      sourcePercentage: 60,
      targetPercentage: 100,
    }),
  );
  expect(document.querySelector('[data-sankey-link="0"]')).toHaveAttribute(
    "fill-opacity",
    "0.65",
  );
  expect(document.querySelector('[data-sankey-link="1"]')).toHaveAttribute(
    "fill-opacity",
    "0.09",
  );
  fireEvent.mouseEnter(node(1));
  expect(inspect).toHaveBeenLastCalledWith(
    expect.objectContaining({
      kind: "node",
      data: nodes[1],
      index: 1,
      incoming: 60,
      outgoing: 60,
    }),
  );
});
it("keeps zero observations unpainted and selectable with null shares", () => {
  const zero = links.map((l) => ({ ...l, value: 0 })),
    onLinkClick = jest.fn();
  const inspect = jest.fn(() => <p>Zero</p>);
  mount(
    <SankeyChart
      {...props}
      links={zero}
      onLinkClick={onLinkClick}
      tooltipRenderer={inspect}
    />,
  );
  expect(document.querySelector('[data-sankey-link="0"]')).toHaveAttribute(
    "d",
    "",
  );
  expect(document.querySelector('[data-sankey-node="0"]')).toHaveAttribute(
    "height",
    "0",
  );
  fireEvent.click(link(0));
  expect(onLinkClick).toHaveBeenCalledWith(zero[0], 0);
  expect(inspect).toHaveBeenLastCalledWith(
    expect.objectContaining({
      sourcePercentage: null,
      targetPercentage: null,
      value: 0,
    }),
  );
});
it("retains frame and geometry during refresh and recovers after empty and invalid data", () => {
  const view = mount(<SankeyChart {...props} />),
    root = view.container.firstChild;
  const paths = [...view.container.querySelectorAll("[data-sankey-link]")].map(
    (n) => n.getAttribute("d"),
  );
  view.rerender(<SankeyChart {...props} loading />);
  expect(
    [...view.container.querySelectorAll("[data-loading-link]")].map((n) =>
      n.getAttribute("d"),
    ),
  ).toEqual(paths);
  expect(view.container.querySelector("[tabindex]")).toBeNull();
  view.rerender(<SankeyChart {...props} nodes={[]} links={[]} />);
  expect(screen.getByRole("status")).toHaveTextContent("No Data");
  view.rerender(
    <SankeyChart
      {...props}
      links={[
        ...links,
        { source: "end", target: "start", value: 1, tag: "cycle" },
      ]}
    />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("acyclic");
  view.rerender(<SankeyChart {...props} />);
  expect(view.container.firstChild).toBe(root);
  expect(node(0)).toBeInTheDocument();
});
it("has a branched initial skeleton with no interactive fabricated observations", () => {
  const view = mount(<SankeyChart nodes={[]} links={[]} loading />);
  expect(view.container.querySelectorAll("[data-loading-link]")).toHaveLength(
    4,
  );
  expect(view.container.querySelector("[tabindex]")).toBeNull();
  expect(screen.getByRole("status")).toHaveTextContent("Loading flow");
});
it("keeps gradients and descriptions unique across instances", () => {
  const view = mount(
    <>
      <SankeyChart {...props} />
      <SankeyChart {...props} />
    </>,
  );
  const ids = [...view.container.querySelectorAll("[id]")].map((n) => n.id);
  expect(new Set(ids).size).toBe(ids.length);
});
it.each([true, false])("respects motion opt-outs (%s)", (reduced) => {
  jest.mocked(useReducedMotion).mockReturnValue(reduced);
  mount(<SankeyChart {...props} animation={reduced} />);
  expect(animate).not.toHaveBeenCalled();
  expect(document.querySelector("clipPath rect")).toHaveAttribute(
    "width",
    "800",
  );
});
it("does not replay the reveal on hover or palette changes", () => {
  const view = mount(<SankeyChart {...props} animation />);
  const calls = jest.mocked(animate).mock.calls.length;
  fireEvent.mouseEnter(node(1));
  view.rerender(<SankeyChart {...props} animation colors={["red"]} />);
  expect(animate).toHaveBeenCalledTimes(calls);
});
it("preserves keyboard inspection when fresh volumes replace the data", () => {
  const view = mount(<SankeyChart {...props} />);
  act(() => node(1).focus());
  view.rerender(
    <SankeyChart
      {...props}
      links={links.map((l, i) => ({ ...l, value: i === 0 ? 42 : l.value }))}
    />,
  );
  expect(node(1)).toHaveFocus();
  expect(screen.getByRole("tooltip")).toHaveTextContent("42 incoming");
  fireEvent.keyDown(node(1), { key: "ArrowRight" });
  expect(node(2)).toHaveFocus();
});
