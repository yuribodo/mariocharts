import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { animate, useReducedMotion } from "framer-motion";
import { GaugeChart, type GaugeChartProps } from "./index";
import type { GaugeChartTooltipData } from "../_shared";
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
const zones = [
  { from: 0, to: 60, color: "#22c55e", label: "Normal" },
  { from: 60, to: 80, color: "#f59e0b", label: "High" },
  { from: 80, to: 100, color: "#ef4444", label: "Critical" },
];
const props = { value: 65, zones, unit: "%", label: "CPU utilization" };
beforeEach(() => {
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
function renderAndFlush(ui: React.ReactElement) {
  const result = render(ui);
  act(() => {
    jest.runAllTimers();
  });
  return result;
}
const progress = () => document.querySelector("[data-gauge-progress]")!;
it("exposes a named read-only meter with a complete range and value text", () => {
  renderAndFlush(
    <GaugeChart
      {...props}
      ariaLabel="CPU utilization"
      description="Production workload"
    />,
  );
  const meter = screen.getByRole("meter", { name: "CPU utilization" });
  expect(meter).toHaveAttribute("aria-valuenow", "65");
  expect(meter).toHaveAttribute("aria-valuemin", "0");
  expect(meter).toHaveAttribute("aria-valuemax", "100");
  expect(meter).toHaveAttribute("aria-valuetext", "65 %; range 0–100 %; High");
  expect(meter).toHaveAttribute("tabindex", "0");
  expect(screen.queryByRole("slider")).toBeNull();
  expect(meter).toHaveAccessibleDescription(
    expect.stringContaining("Production workload"),
  );
});
it.each(["loading", "empty", "error", "invalid"])(
  "recovers from %s in the same measured frame",
  (state) => {
    const { container, rerender } = renderAndFlush(
      <GaugeChart
        {...props}
        height={360}
        loading={state === "loading"}
        error={state === "error" ? "Offline" : null}
        zones={state === "empty" ? [] : zones}
        value={state === "invalid" ? NaN : 65}
      />,
    );
    const frame = container.firstElementChild;
    rerender(<GaugeChart {...props} height={360} />);
    act(() => {
      jest.runAllTimers();
    });
    expect(container.firstElementChild).toBe(frame);
    expect(frame).toHaveStyle({ height: "360px" });
    expect(screen.getByRole("meter")).toBeInTheDocument();
    expect(progress().getAttribute("d")).not.toBe("");
  },
);
it("retains exact loading track, zones, and progress geometry", () => {
  const { rerender, container } = renderAndFlush(
    <GaugeChart {...props} height={360} />,
  );
  const readyProgress = progress().getAttribute("d"),
    track = document.querySelector("[data-gauge-track]")!.getAttribute("d"),
    zonePaths = [...document.querySelectorAll("[data-gauge-zone]")].map(
      (node) => node.getAttribute("d"),
    );
  rerender(<GaugeChart {...props} height={360} loading />);
  expect(document.querySelector("[data-loading-progress]")).toHaveAttribute(
    "d",
    readyProgress,
  );
  expect(document.querySelector("[data-gauge-track]")).toHaveAttribute(
    "d",
    track,
  );
  expect(
    [...document.querySelectorAll("[data-loading-zone]")].map((node) =>
      node.getAttribute("d"),
    ),
  ).toEqual(zonePaths);
  expect(screen.queryByRole("meter")).toBeNull();
  expect(screen.getByRole("status")).toHaveTextContent("Loading gauge");
  expect(container.firstElementChild).toHaveStyle({ height: "360px" });
});
it("shows an initial placeholder without throwing on unavailable values", () => {
  renderAndFlush(<GaugeChart {...props} value={NaN} zones={[]} loading />);
  expect(document.querySelectorAll("[data-loading-zone]")).toHaveLength(3);
  expect(
    document.querySelector("[data-loading-progress]")!.getAttribute("d"),
  ).not.toMatch(/NaN|Infinity/);
});
it.each([
  [115, 100, "Above range"],
  [-15, 0, "Below range"],
])(
  "keeps actual value %p visible while bounding the meter",
  (value, bounded, status) => {
    renderAndFlush(<GaugeChart {...props} value={value as number} />);
    const meter = screen.getByRole("meter");
    expect(meter).toHaveAttribute("aria-valuenow", String(bounded));
    expect(progress()).toHaveAttribute(
      "stroke",
      value === 115 ? zones[2]!.color : zones[0]!.color,
    );
    expect(meter).toHaveAttribute(
      "aria-valuetext",
      expect.stringContaining(`${value} %`),
    );
    expect(document.querySelector("[data-gauge-value]")).toHaveTextContent(
      String(value),
    );
    expect(document.querySelector("[data-gauge-status]")).toHaveTextContent(
      String(status),
    );
    fireEvent.mouseEnter(meter);
    expect(screen.getByRole("tooltip")).toHaveTextContent(String(status));
  },
);
it("does not paint a progress dot at the minimum, but paints the full arc at maximum", () => {
  const { rerender } = renderAndFlush(<GaugeChart {...props} value={0} />);
  expect(progress()).toHaveAttribute("d", "");
  rerender(<GaugeChart {...props} value={100} />);
  expect(progress().getAttribute("d")).toBe(
    document.querySelector("[data-gauge-track]")!.getAttribute("d"),
  );
  expect(document.querySelector("[data-gauge-status]")).toHaveTextContent(
    "Critical",
  );
});
it("leaves gaps unclassified instead of extending the previous zone", () => {
  renderAndFlush(<GaugeChart {...props} zones={[zones[0]!, zones[2]!]} />);
  expect(document.querySelector("[data-gauge-status]")).toHaveTextContent(
    "Unzoned",
  );
  expect(progress()).toHaveAttribute("stroke", "var(--muted-foreground)");
});
it("keeps repeated-color zone identity in custom inspection", () => {
  const renderer = jest.fn((item: GaugeChartTooltipData) => (
    <span>{item.zone?.label}</span>
  ));
  renderAndFlush(
    <GaugeChart
      {...props}
      zones={[...zones]
        .reverse()
        .map((zone) => ({ ...zone, color: "var(--custom)" }))}
      tooltipRenderer={renderer}
    />,
  );
  fireEvent.pointerDown(screen.getByRole("meter"));
  expect(renderer).toHaveBeenLastCalledWith(
    expect.objectContaining({
      value: 65,
      clampedValue: 65,
      rangeStatus: "within",
      percentage: 65,
      zone: { ...zones[1], color: "var(--custom)", index: 1 },
    }),
  );
  expect(progress()).toHaveAttribute("stroke", "var(--custom)");
});
it("inspects through focus, Escape, Enter, Space, touch, and hover without adjusting the value", () => {
  renderAndFlush(
    <>
      <GaugeChart {...props} />
      <button>Outside</button>
    </>,
  );
  const meter = screen.getByRole("meter");
  act(() => meter.focus());
  expect(screen.getByRole("tooltip")).toHaveTextContent("65 %");
  fireEvent.keyDown(meter, { key: "ArrowRight" });
  expect(meter).toHaveAttribute("aria-valuenow", "65");
  fireEvent.keyDown(meter, { key: "Escape" });
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.keyDown(meter, { key: "Enter" });
  expect(screen.getByRole("tooltip")).toBeInTheDocument();
  fireEvent.keyDown(meter, { key: "Escape" });
  fireEvent.keyDown(meter, { key: " " });
  expect(screen.getByRole("tooltip")).toBeInTheDocument();
  fireEvent.mouseLeave(meter);
  expect(screen.getByRole("tooltip")).toBeInTheDocument();
  act(() => screen.getByRole("button").focus());
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.pointerDown(meter);
  expect(screen.getByRole("tooltip")).toBeInTheDocument();
  fireEvent.mouseLeave(meter);
  expect(screen.queryByRole("tooltip")).toBeNull();
});
it("updates focused inspection without resetting focus when zone objects are replaced", () => {
  const { rerender } = renderAndFlush(<GaugeChart {...props} />);
  const meter = screen.getByRole("meter");
  act(() => meter.focus());
  const calls = jest.mocked(animate).mock.calls.length;
  rerender(
    <GaugeChart
      {...props}
      value={85}
      zones={zones.map((zone) => ({ ...zone }))}
    />,
  );
  expect(meter).toHaveFocus();
  expect(screen.getByRole("tooltip")).toHaveTextContent("85 %");
  expect(screen.getByRole("tooltip")).toHaveTextContent("Critical");
  expect(jest.mocked(animate).mock.calls).toHaveLength(calls);
});
it("formats endpoint labels independently and calculates position from the minimum", () => {
  renderAndFlush(
    <GaugeChart
      value={70}
      min={20}
      max={120}
      zones={[{ from: 20, to: 120, color: "blue" }]}
      unit="kPa"
      valueFormatter={(v) => `${v}.0`}
      axisValueFormatter={(v) => `${v}u`}
    />,
  );
  const meter = screen.getByRole("meter");
  expect(meter).toHaveAttribute(
    "aria-valuetext",
    expect.stringContaining("70.0 kPa"),
  );
  expect(meter).toHaveTextContent("20u");
  fireEvent.mouseEnter(meter);
  expect(screen.getByRole("tooltip")).toHaveTextContent("Range position50%");
});
it.each([
  { value: NaN },
  { value: Infinity },
  { min: 100, max: 100 },
  { min: 200 },
  { max: Infinity },
  { height: -1 },
  { strokeWidth: 0 },
  { strokeWidth: NaN },
  { zones: [{ from: 0, to: 110, color: "blue" }] },
  { zones: [zones[0]!, { ...zones[1]!, from: 50 }] },
])("shows actionable errors for options %p", (overrides) => {
  renderAndFlush(
    <GaugeChart {...props} {...(overrides as Partial<GaugeChartProps>)} />,
  );
  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(screen.queryByRole("meter")).toBeNull();
});
it("never sends malformed input to custom formatters", () => {
  const formatter = jest.fn((value: number) => {
    if (!Number.isFinite(value)) throw Error("invalid");
    return String(value);
  });
  renderAndFlush(
    <GaugeChart {...props} value={NaN} valueFormatter={formatter} />,
  );
  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(formatter).not.toHaveBeenCalled();
});
it("retargets updates without replaying entrance and does not restart on hover/resize", () => {
  const { rerender } = renderAndFlush(<GaugeChart {...props} />);
  const before = jest.mocked(animate).mock.calls.length;
  fireEvent.mouseEnter(screen.getByRole("meter"));
  rerender(<GaugeChart {...props} height={400} />);
  expect(jest.mocked(animate).mock.calls).toHaveLength(before);
  rerender(<GaugeChart {...props} height={400} value={85} />);
  expect(jest.mocked(animate).mock.calls).toHaveLength(before + 1);
  expect(jest.mocked(animate)).toHaveBeenLastCalledWith(
    expect.anything(),
    0.85,
    expect.objectContaining({ duration: 0.45 }),
  );
});
it.each(["disabled", "reduced"])(
  "renders complete geometry with %s motion",
  (mode) => {
    jest.mocked(useReducedMotion).mockReturnValue(mode === "reduced");
    renderAndFlush(<GaugeChart {...props} animation={mode !== "disabled"} />);
    expect(animate).not.toHaveBeenCalled();
    expect(progress().getAttribute("d")).not.toBe("");
  },
);
it("supports flat end caps without rounding zone boundaries", () => {
  renderAndFlush(<GaugeChart {...props} strokeLinecap="butt" />);
  expect(progress()).toHaveAttribute("stroke-linecap", "butt");
  expect(
    [...document.querySelectorAll("[data-gauge-zone]")].every(
      (node) => node.getAttribute("stroke-linecap") === "butt",
    ),
  ).toBe(true);
});
it("uses unique description IDs across instances", () => {
  renderAndFlush(
    <>
      <GaugeChart {...props} />
      <GaugeChart {...props} />
    </>,
  );
  const ids = screen
    .getAllByRole("meter")
    .map((meter) => meter.getAttribute("aria-describedby"));
  expect(new Set(ids).size).toBe(2);
});

it("uses the descriptive label as its default accessible name", () => {
  renderAndFlush(<GaugeChart {...props} />);
  expect(
    screen.getByRole("meter", { name: "CPU utilization" }),
  ).toBeInTheDocument();
});
