import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { animate, useReducedMotion } from "framer-motion";
import { FunnelChart, type FunnelVariant } from "./index";
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
  { stage: "Visitors", count: 1000 },
  { stage: "Signups", count: 400 },
  { stage: "Signups", count: 200 },
  { stage: "Customers", count: 0 },
];
const props = {
  data,
  label: "stage",
  value: "count",
  animation: false,
} as const;
beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(animate).mockClear();
  jest.mocked(useReducedMotion).mockReturnValue(false);
  jest.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    width: 600,
    height: 400,
    top: 0,
    left: 0,
    bottom: 400,
    right: 600,
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
const target = (index: number) =>
  document.querySelector<SVGRectElement>(`[data-funnel-target="${index}"]`)!;
it.each<FunnelVariant>([
  "tapered",
  "straight",
  "smooth",
  "horizontal",
  "columns",
])(
  "%s keeps zero stages inspectable and supports roving keyboard selection",
  (variant) => {
    const onClick = jest.fn();
    mount(<FunnelChart {...props} variant={variant} onClick={onClick} />);
    expect(
      screen.getByRole("group", { name: "Funnel chart with 4 stages" }),
    ).toBeInTheDocument();
    expect(
      document.querySelectorAll('[data-funnel-target][tabindex="0"]'),
    ).toHaveLength(1);
    act(() => target(0).focus());
    fireEvent.keyDown(target(0), { key: "ArrowRight" });
    expect(target(1)).toHaveFocus();
    fireEvent.keyDown(target(1), { key: "ArrowDown" });
    fireEvent.keyDown(target(2), { key: "Enter" });
    expect(onClick).toHaveBeenLastCalledWith(data[2], 2);
    fireEvent.keyDown(target(2), { key: "End" });
    expect(target(3)).toHaveFocus();
    expect(document.querySelector('[data-funnel-stage="3"]')).toHaveAttribute(
      "d",
      "",
    );
    fireEvent.keyDown(target(3), { key: " " });
    expect(onClick).toHaveBeenLastCalledWith(data[3], 3);
    fireEvent.keyDown(target(3), { key: "Home" });
    expect(target(0)).toHaveFocus();
    fireEvent.keyDown(target(0), { key: "ArrowLeft" });
    expect(target(3)).toHaveFocus();
    fireEvent.keyDown(target(3), { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  },
);
it("exposes original observations, numeric strings, first-stage and previous-stage rates", () => {
  const rows = [
    { stage: "Start", count: "100" },
    { stage: "End", count: "40" },
  ];
  const inspect = jest.fn(() => <span>Custom inspection</span>);
  mount(<FunnelChart {...props} data={rows} tooltipRenderer={inspect} />);
  fireEvent.mouseEnter(target(1));
  expect(inspect).toHaveBeenLastCalledWith(
    expect.objectContaining({
      data: rows[1],
      index: 1,
      value: 40,
      rawValue: "40",
      percentage: 40,
      conversionRate: 40,
      previousValue: 100,
      change: -60,
    }),
  );
  expect(target(1)).toHaveAccessibleName(/40.0% of first; 40.0% from previous/);
});
it("shows undefined rates for a zero baseline and retains increases", () => {
  mount(
    <FunnelChart
      {...props}
      data={[
        { stage: "Start", count: 0 },
        { stage: "Next", count: 5 },
      ]}
    />,
  );
  fireEvent.mouseEnter(target(1));
  expect(
    screen.getByText("First stage is zero; percentage undefined"),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Previous stage is zero; rate undefined"),
  ).toBeInTheDocument();
  expect(target(1)).toHaveAccessibleName(/5 gained/);
});
it.each<FunnelVariant>([
  "tapered",
  "straight",
  "smooth",
  "horizontal",
  "columns",
])(
  "%s preserves geometry and the frame during refresh, then recovers from empty/error",
  (variant) => {
    const view = mount(<FunnelChart {...props} variant={variant} />);
    const root = view.container.firstChild;
    const before = [
      ...view.container.querySelectorAll("[data-funnel-stage]"),
    ].map((n) => n.getAttribute("d"));
    view.rerender(<FunnelChart {...props} variant={variant} loading />);
    expect(view.container.firstChild).toBe(root);
    expect(
      [...view.container.querySelectorAll("[data-loading-stage]")].map((n) =>
        n.getAttribute("d"),
      ),
    ).toEqual(before);
    expect(view.container.querySelector("[data-funnel-target]")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Loading funnel");
    view.rerender(<FunnelChart {...props} variant={variant} data={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent("No Data");
    view.rerender(
      <FunnelChart {...props} variant={variant} error="Retry the request" />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Retry the request");
    view.rerender(<FunnelChart {...props} variant={variant} />);
    expect(view.container.firstChild).toBe(root);
    expect(target(3)).toBeInTheDocument();
  },
);
it("provides a skeleton on first load without invented data labels", () => {
  const view = mount(<FunnelChart {...props} data={[]} loading />);
  expect(view.container.querySelectorAll("[data-loading-stage]")).toHaveLength(
    5,
  );
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});
it("does not replay entrance or recolor stage fills on inspection", () => {
  mount(<FunnelChart {...props} animation />);
  const calls = jest.mocked(animate).mock.calls.length;
  const fill = document
    .querySelector('[data-funnel-stage="1"]')!
    .getAttribute("fill");
  fireEvent.mouseEnter(target(1));
  expect(animate).toHaveBeenCalledTimes(calls);
  expect(document.querySelector('[data-funnel-stage="1"]')).toHaveAttribute(
    "fill",
    fill,
  );
});
it.each([true, false])(
  "respects reduced motion and animation=false (%s)",
  (reduced) => {
    jest.mocked(useReducedMotion).mockReturnValue(reduced);
    mount(<FunnelChart {...props} animation={reduced} />);
    expect(animate).not.toHaveBeenCalled();
    expect(document.querySelector("[data-funnel-growth]")).toHaveAttribute(
      "transform",
      "translate(0 0) scale(1 1)",
    );
  },
);
it("fails with an actionable observation error", () => {
  mount(<FunnelChart {...props} data={[{ stage: "Broken", count: -1 }]} />);
  expect(screen.getByRole("alert")).toHaveTextContent(
    'Row 1: "count" must be a finite, nonnegative number',
  );
});
it("uses independent description IDs for multiple charts", () => {
  mount(
    <>
      <FunnelChart {...props} />
      <FunnelChart {...props} />
    </>,
  );
  const groups = screen.getAllByRole("group");
  expect(groups[0]!.getAttribute("aria-describedby")).not.toBe(
    groups[1]!.getAttribute("aria-describedby"),
  );
});
it("preserves keyboard inspection when fresh counts replace the data", () => {
  const view = mount(<FunnelChart {...props} />);
  act(() => target(1).focus());
  view.rerender(
    <FunnelChart
      {...props}
      data={data.map((d, i) => ({ ...d, count: i === 1 ? 250 : d.count }))}
    />,
  );
  expect(target(1)).toHaveFocus();
  expect(screen.getByRole("tooltip")).toHaveTextContent("25.0% of first stage");
  fireEvent.keyDown(target(1), { key: "ArrowRight" });
  expect(target(2)).toHaveFocus();
});
