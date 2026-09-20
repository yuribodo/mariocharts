import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { animate, useReducedMotion } from "framer-motion";
import { HeatmapChart, type HeatmapVariant } from "./index";
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
  { day: "Mon", hour: "9am", v: 0, w: 3 },
  { day: "Tue", hour: "10am", v: 10, w: 1 },
  { day: "Mon", hour: "10am", v: 5, w: 2 },
  { day: "Tue", hour: "9am", v: -5, w: 0 },
];
const props = {
  data,
  x: "hour",
  y: "day",
  value: "v",
  animation: false,
} as const;
beforeEach(() => {
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    fillStyle: "",
    font: "",
    getImageData: () => ({ data: [0, 0, 0, 255] }),
    measureText: (text: string) => ({ width: text.length * 6 }),
  } as unknown as CanvasRenderingContext2D);
  jest.useFakeTimers();
  jest.mocked(animate).mockClear();
  jest.mocked(useReducedMotion).mockReturnValue(false);
  jest.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    width: 600,
    height: 360,
    top: 0,
    left: 0,
    bottom: 360,
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
  act(() => {
    jest.runAllTimers();
  });
  return result;
}
const target = (index: number) =>
  document.querySelector<SVGPathElement>(`[data-heat-target="${index}"]`)!;
const paths = (selector: string) =>
  [...document.querySelectorAll(selector)].map((node) =>
    node.getAttribute("d"),
  );
it.each<HeatmapVariant>(["grid", "radial", "stock"])(
  "%s supports focus, inspection, activation and one tab stop",
  (variant) => {
    const onClick = jest.fn();
    mount(
      <HeatmapChart
        {...props}
        variant={variant}
        onClick={onClick}
        ariaLabel="Activity"
      />,
    );
    expect(screen.getByRole("group", { name: "Activity" })).toBeInTheDocument();
    expect(
      document.querySelectorAll('[data-heat-target][tabindex="0"]'),
    ).toHaveLength(1);
    act(() => target(0).focus());
    expect(screen.getByRole("tooltip")).toHaveTextContent("9am");
    fireEvent.keyDown(target(0), { key: "End" });
    const last = document.activeElement!;
    fireEvent.keyDown(last, { key: "Enter" });
    expect(onClick).toHaveBeenCalledWith(
      variant === "stock" ? data[3] : data[1],
      variant === "stock" ? "9am" : "10am",
      variant === "stock" ? "" : "Tue",
    );
    fireEvent.keyDown(last, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
  },
);
it.each<HeatmapVariant>(["grid", "radial"])(
  "%s maps row/column navigation and original row metadata correctly",
  (variant) => {
    const tooltipRenderer = jest.fn((item) => (
      <span>
        {item.yLabel}/{item.xLabel}
      </span>
    ));
    mount(
      <HeatmapChart
        {...props}
        variant={variant}
        tooltipRenderer={tooltipRenderer}
      />,
    );
    act(() => target(0).focus());
    fireEvent.keyDown(target(0), { key: "ArrowDown" });
    expect(document.activeElement).toBe(target(2));
    expect(tooltipRenderer.mock.lastCall![0]).toMatchObject({
      data: data[3],
      index: 3,
      value: -5,
      yLabel: "Tue",
      xLabel: "9am",
      normalizedValue: 0,
    });
    fireEvent.keyDown(target(2), { key: "ArrowRight" });
    expect(document.activeElement).toBe(target(3));
    expect(tooltipRenderer.mock.lastCall![0]).toMatchObject({
      data: data[1],
      index: 1,
      value: 10,
      normalizedValue: 1,
    });
  },
);
it("distinguishes absent cells, explicit missing rows, and real zero", () => {
  const sparse = [data[0]!, { ...data[1]!, v: null }];
  const click = jest.fn(),
    tip = jest.fn((item) => <span>{item.formattedValue}</span>);
  mount(
    <HeatmapChart
      {...props}
      data={sparse}
      onClick={click}
      tooltipRenderer={tip}
    />,
  );
  fireEvent.mouseEnter(target(1));
  expect(tip.mock.lastCall![0]).toMatchObject({
    data: null,
    index: null,
    value: null,
    normalizedValue: null,
  });
  fireEvent.click(target(1));
  expect(click).not.toHaveBeenCalled();
  fireEvent.click(target(3));
  expect(click).toHaveBeenCalledWith(sparse[1], "10am", "Tue");
  expect(tip.mock.lastCall![0]).toMatchObject({
    data: sparse[1],
    index: 1,
    value: null,
  });
  fireEvent.mouseEnter(target(0));
  expect(tip.mock.lastCall![0].value).toBe(0);
  expect(
    document.querySelector('[data-heat-cell="0"]')!.getAttribute("fill"),
  ).not.toContain("url(");
  expect(
    document.querySelector('[data-heat-cell="1"]')!.getAttribute("fill"),
  ).toContain("url(");
});
it("keeps measured colors unchanged during hover", () => {
  mount(<HeatmapChart {...props} />);
  const fills = [...document.querySelectorAll("[data-heat-cell]")].map((el) =>
    el.getAttribute("fill"),
  );
  fireEvent.mouseEnter(target(0));
  expect(
    [...document.querySelectorAll("[data-heat-cell]")].map((el) =>
      el.getAttribute("fill"),
    ),
  ).toEqual(fills);
  expect(document.querySelector("[data-heat-cell]")).not.toHaveAttribute(
    "opacity",
  );
});
it("stock omits zero-area targets but retains their observations in its table", () => {
  const tip = jest.fn((item) => <span>{item.formattedValue}</span>);
  mount(
    <HeatmapChart
      {...props}
      variant="stock"
      weight="w"
      tooltipRenderer={tip}
    />,
  );
  expect(target(3)).toBeNull();
  expect(screen.getByRole("table")).toHaveTextContent("-5.00%");
  fireEvent.mouseEnter(target(1));
  expect(tip.mock.lastCall![0]).toMatchObject({
    data: data[1],
    index: 1,
    normalizedValue: 1,
    weightValue: 1,
  });
});
it("reports an all-zero weight dataset without equal-area fallback", () => {
  mount(
    <HeatmapChart
      {...props}
      data={data.map((row) => ({ ...row, w: 0 }))}
      variant="stock"
      weight="w"
    />,
  );
  expect(screen.getByText("No positive area weights")).toBeInTheDocument();
  expect(document.querySelectorAll("[data-heat-target]")).toHaveLength(0);
  expect(screen.getByRole("table")).toBeInTheDocument();
});
it.each<HeatmapVariant>(["grid", "radial", "stock"])(
  "%s retains loading geometry and recovers in the same frame",
  (variant) => {
    const { container, rerender } = mount(
      <HeatmapChart {...props} variant={variant} height={360} showLegend />,
    );
    const frame = container.firstElementChild,
      readyPaths = paths("[data-heat-cell]");
    rerender(
      <HeatmapChart
        {...props}
        variant={variant}
        height={360}
        showLegend
        loading
      />,
    );
    expect(paths("[data-loading-cell]")).toEqual(readyPaths);
    expect(document.querySelectorAll("[data-heat-target]")).toHaveLength(0);
    rerender(
      <HeatmapChart {...props} variant={variant} height={360} showLegend />,
    );
    expect(container.firstElementChild).toBe(frame);
    expect(frame).toHaveStyle({ height: "360px" });
    expect(paths("[data-heat-cell]")).toEqual(readyPaths);
  },
);
it.each(["empty", "error", "invalid", "initial-loading"])(
  "recovers from %s without replacing the measured root",
  (state) => {
    const { container, rerender } = mount(
      <HeatmapChart
        {...props}
        data={state === "empty" || state === "initial-loading" ? [] : data}
        error={state === "error" ? "Offline" : null}
        height={state === "invalid" ? -1 : 320}
        loading={state === "initial-loading"}
      />,
    );
    const frame = container.firstElementChild;
    rerender(<HeatmapChart {...props} />);
    expect(container.firstElementChild).toBe(frame);
    expect(target(0)).toBeInTheDocument();
  },
);
it("gives separate charts unique pattern and gradient IDs", () => {
  mount(
    <>
      <HeatmapChart {...props} showLegend />
      <HeatmapChart {...props} showLegend />
    </>,
  );
  const ids = [...document.querySelectorAll("pattern,linearGradient")].map(
    (el) => el.id,
  );
  expect(new Set(ids).size).toBe(4);
});
it("uses the actual symmetric color domain in the legend", () => {
  mount(<HeatmapChart {...props} colorScheme="diverging" showLegend />);
  expect(
    screen.getByRole("img", { name: "Color scale from -10 through 0 to 10" }),
  ).toBeInTheDocument();
});
it.each(["disabled", "reduced"])("skips entrance animation when %s", (mode) => {
  jest.mocked(useReducedMotion).mockReturnValue(mode === "reduced");
  mount(<HeatmapChart {...props} animation={mode !== "disabled"} />);
  expect(animate).not.toHaveBeenCalled();
});
it("animates geometry on entrance but does not replay on hover", () => {
  mount(<HeatmapChart {...props} animation />);
  expect(animate).toHaveBeenCalledTimes(1);
  fireEvent.mouseEnter(target(0));
  expect(animate).toHaveBeenCalledTimes(1);
});
it("keeps touch inspection after the contact leaves, but dismisses mouse inspection", () => {
  const { container } = mount(<HeatmapChart {...props} />);
  fireEvent.pointerDown(target(0), { pointerType: "touch" });
  const touchOut = new Event("pointerout", { bubbles: true });
  Object.defineProperty(touchOut, "pointerType", { value: "touch" });
  fireEvent(container.firstElementChild!, touchOut);
  expect(screen.getByRole("tooltip")).toBeInTheDocument();
  const mouseOut = new Event("pointerout", { bubbles: true });
  Object.defineProperty(mouseOut, "pointerType", { value: "mouse" });
  fireEvent(container.firstElementChild!, mouseOut);
  expect(screen.queryByRole("tooltip")).toBeNull();
});
