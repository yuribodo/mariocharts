import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PieChart } from "./index";

// Unlike the workspace's generic Motion stub, preserve SVG refs for real focus navigation.
jest.mock("framer-motion", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const actual =
    jest.requireActual<typeof import("framer-motion")>("framer-motion");
  const Path = React.forwardRef<SVGPathElement, React.SVGProps<SVGPathElement>>(
    function Path(props, ref) {
      const attributes = { ...props } as Record<string, unknown>;
      delete attributes.initial;
      delete attributes.animate;
      delete attributes.transition;
      if (actual.isMotionValue(attributes.d)) attributes.d = attributes.d.get();
      return React.createElement("path", { ...attributes, ref });
    },
  );
  return {
    motion: { path: Path },
    useReducedMotion: () => false,
    useMotionValue: actual.useMotionValue,
    useTransform: actual.useTransform,
    animate: jest.fn((value, target) => {
      value.set(target);
      return { stop: jest.fn() };
    }),
  };
});

const sampleData = [
  { name: "A", amount: 40 },
  { name: "B", amount: 30 },
  { name: "C", amount: 20 },
  { name: "D", amount: 10 },
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

describe("PieChart", () => {
  it("renders SVG with minimal props", () => {
    const { container } = renderAndFlush(
      <PieChart data={sampleData} value="amount" label="name" />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders correct number of path elements (slices)", () => {
    const { container } = renderAndFlush(
      <PieChart data={sampleData} value="amount" label="name" />,
    );
    expect(container.querySelectorAll("[data-pie-slice]")).toHaveLength(
      sampleData.length,
    );
  });

  it("shows loading state", () => {
    render(
      <PieChart data={sampleData} value="amount" label="name" loading={true} />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows error state", () => {
    render(
      <PieChart
        data={sampleData}
        value="amount"
        label="name"
        error="Something went wrong"
      />,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("shows empty state when data={[]}", () => {
    render(<PieChart data={[]} value="amount" label="name" />);
    expect(screen.getByText("No Data")).toBeInTheDocument();
  });

  it("shows error for negative values", () => {
    const negativeData = [
      { name: "A", amount: 40 },
      { name: "B", amount: -10 },
    ];
    render(<PieChart data={negativeData} value="amount" label="name" />);
    expect(
      screen.getByText(/Pie charts cannot display negative values/),
    ).toBeInTheDocument();
  });

  it("calls onSliceClick when slice is clicked", () => {
    const handleClick = jest.fn();
    const { container } = renderAndFlush(
      <PieChart
        data={sampleData}
        value="amount"
        label="name"
        onSliceClick={handleClick}
      />,
    );
    const paths = container.querySelectorAll("[data-pie-slice]");
    expect(paths.length).toBeGreaterThan(0);
    fireEvent.click(paths[0]!);
    expect(handleClick).toHaveBeenCalledWith(sampleData[0], 0);
  });

  it('renders with variant="pie"', () => {
    const { container } = renderAndFlush(
      <PieChart data={sampleData} value="amount" label="name" variant="pie" />,
    );
    expect(
      container.querySelectorAll("[data-pie-slice]").length,
    ).toBeGreaterThan(0);
  });

  it('renders with variant="donut" (default)', () => {
    const { container } = renderAndFlush(
      <PieChart
        data={sampleData}
        value="amount"
        label="name"
        variant="donut"
      />,
    );
    expect(
      container.querySelectorAll("[data-pie-slice]").length,
    ).toBeGreaterThan(0);
  });

  it('renders with variant="semi"', () => {
    const { container } = renderAndFlush(
      <PieChart data={sampleData} value="amount" label="name" variant="semi" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg!.getAttribute("aria-label")).toContain("Semi-circle");
  });

  it("has correct aria-label on SVG", () => {
    const { container } = renderAndFlush(
      <PieChart data={sampleData} value="amount" label="name" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg!.getAttribute("aria-label")).toContain(
      `${sampleData.length} segments`,
    );
  });
});

it.each(["loading", "empty", "error", "zero"])(
  "recovers from initial %s in the same measured frame",
  (state) => {
    const { container, rerender } = renderAndFlush(
      <PieChart
        data={
          state === "empty"
            ? []
            : state === "zero"
              ? [{ name: "zero", amount: 0 }]
              : sampleData
        }
        value="amount"
        label="name"
        loading={state === "loading"}
        error={state === "error" ? "Offline" : null}
        height={420}
      />,
    );
    const frame = container.firstElementChild;
    rerender(
      <PieChart data={sampleData} value="amount" label="name" height={420} />,
    );
    expect(container.firstElementChild).toBe(frame);
    expect(frame).toHaveStyle({ height: "420px" });
    expect(screen.getByRole("group")).toBeInTheDocument();
  },
);
it.each(["pie", "donut", "semi"] as const)(
  "preserves %s slice geometry and frame height during refresh",
  (variant) => {
    const props = {
      data: sampleData,
      value: "amount",
      label: "name",
      variant,
      height: 420,
      innerRadius: 0.7,
      cornerRadius: 8,
      showLegend: true,
      animation: false,
    } as const;
    const { container, rerender } = renderAndFlush(<PieChart {...props} />);
    const paths = Array.from(
      container.querySelectorAll("[data-pie-slice]"),
    ).map((p) => p.getAttribute("d"));
    const svgHeight = container.querySelector("svg")!.getAttribute("height");
    rerender(<PieChart {...props} loading />);
    expect(
      Array.from(container.querySelectorAll("[data-loading-slice]")).map((p) =>
        p.getAttribute("d"),
      ),
    ).toEqual(paths);
    expect(container.querySelector("svg")).toHaveAttribute("height", svgHeight);
    expect(container.querySelector("[tabindex]")).toBeNull();
    expect(container.querySelector(".animate-pulse")).toBeNull();
  },
);
it("skips zero slices while retaining original callback indices and palette positions", () => {
  const onSliceClick = jest.fn();
  const data = [{ name: "Zero", amount: 0 }, ...sampleData];
  const { container } = renderAndFlush(
    <PieChart
      data={data}
      value="amount"
      label="name"
      onSliceClick={onSliceClick}
      showLegend
    />,
  );
  const slices = screen.getAllByRole("button");
  expect(slices).toHaveLength(4);
  expect(slices[0]).toHaveAttribute("fill", "#10b981");
  expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  fireEvent.click(slices[0]!);
  expect(onSliceClick).toHaveBeenCalledWith(data[1], 1);
  expect(screen.getByRole("list", { name: "Chart values" })).toHaveTextContent(
    "Zero",
  );
});
it("supports roving arrow navigation, wrapping, activation and Escape", () => {
  const onSliceClick = jest.fn();
  renderAndFlush(
    <PieChart
      data={sampleData}
      value="amount"
      label="name"
      onSliceClick={onSliceClick}
    />,
  );
  const targets = screen.getAllByRole("button");
  act(() => targets[0]!.focus());
  expect(screen.getByRole("tooltip")).toHaveTextContent("40");
  fireEvent.keyDown(targets[0]!, { key: "ArrowLeft" });
  expect(targets[3]).toHaveFocus();
  fireEvent.keyDown(targets[3]!, { key: "Home" });
  expect(targets[0]).toHaveFocus();
  fireEvent.keyDown(targets[0]!, { key: "ArrowDown" });
  fireEvent.keyDown(targets[1]!, { key: "Enter" });
  expect(onSliceClick).toHaveBeenCalledWith(sampleData[1], 1);
  fireEvent.keyDown(targets[1]!, { key: "Escape" });
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(targets[1]).toHaveClass("stroke-foreground");
});
it("provides the original value field to custom tooltips and formats accessible labels", () => {
  const tooltip = jest.fn(() => <span>Custom</span>);
  renderAndFlush(
    <PieChart
      data={[{ name: "Paid", amount: "$1,250" }]}
      value="amount"
      label="name"
      valueFormatter={(v) => `USD ${v}`}
      tooltipRenderer={tooltip}
    />,
  );
  fireEvent.mouseEnter(screen.getByRole("graphics-symbol"));
  expect(screen.getByRole("graphics-symbol")).toHaveAccessibleName(
    "Paid: USD 1250 (100%)",
  );
  expect(tooltip).toHaveBeenLastCalledWith(
    expect.objectContaining({
      label: "Paid",
      value: 1250,
      rawValue: "$1,250",
      percentage: 100,
      index: 0,
    }),
  );
});
it.each([-1, 1, 2, NaN, Infinity])(
  "reports invalid donut radius %p",
  (innerRadius) => {
    renderAndFlush(
      <PieChart
        data={sampleData}
        value="amount"
        label="name"
        innerRadius={innerRadius}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("innerRadius");
  },
);
it("ignores the unused inner radius for solid pies", () => {
  renderAndFlush(
    <PieChart
      data={sampleData}
      value="amount"
      label="name"
      variant="pie"
      innerRadius={NaN}
    />,
  );
  expect(screen.queryByRole("alert")).toBeNull();
});
it("keeps center content within the donut hole and sends the source rows and total", () => {
  const center = jest.fn(() => <span>Center</span>);
  const { container } = renderAndFlush(
    <PieChart
      data={sampleData}
      value="amount"
      label="name"
      centerContent={center}
    />,
  );
  expect(center).toHaveBeenLastCalledWith({ total: 100, items: sampleData });
  const foreign = container.querySelector("foreignObject")!;
  const width = Number(foreign.getAttribute("width"));
  const height = Number(foreign.getAttribute("height"));
  expect(Math.hypot(width / 2, height / 2)).toBeLessThan(130 * 0.6);
});
it("clears stale inspection after replacement or a loading cycle", () => {
  const { rerender } = renderAndFlush(
    <PieChart data={sampleData} value="amount" label="name" />,
  );
  fireEvent.mouseEnter(screen.getAllByRole("graphics-symbol")[1]!);
  rerender(<PieChart data={sampleData} value="amount" label="name" loading />);
  rerender(<PieChart data={sampleData} value="amount" label="name" />);
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.mouseEnter(screen.getAllByRole("graphics-symbol")[1]!);
  rerender(
    <PieChart
      data={[{ name: "New", amount: 9 }]}
      value="amount"
      label="name"
    />,
  );
  expect(screen.queryByRole("tooltip")).toBeNull();
});
it("respects reduced motion for skeletons and creates unique descriptions", () => {
  const motion =
    jest.requireMock<typeof import("framer-motion")>("framer-motion");
  jest.spyOn(motion, "useReducedMotion").mockReturnValue(true);
  const { container } = renderAndFlush(
    <>
      <PieChart data={[]} value="amount" label="name" loading />
      <PieChart data={sampleData} value="amount" label="name" />
    </>,
  );
  expect(container.querySelector(".animate-pulse")).toBeNull();
  const ids = Array.from(container.querySelectorAll("[id]")).map((el) => el.id);
  expect(new Set(ids).size).toBe(ids.length);
});

it("does not round a positive share to zero or an incomplete share to 100 percent", () => {
  renderAndFlush(
    <PieChart
      data={[
        { name: "Large", amount: 9999 },
        { name: "Small", amount: 1 },
      ]}
      value="amount"
      label="name"
    />,
  );
  const slices = screen.getAllByRole("graphics-symbol");
  expect(slices[0]).toHaveAccessibleName("Large: 10.0K (>99.9%)");
  expect(slices[1]).toHaveAccessibleName("Small: 1 (<0.1%)");
});

it.each([-1, NaN, Infinity])(
  "rejects invalid corner radius %p",
  (cornerRadius) => {
    renderAndFlush(
      <PieChart
        data={sampleData}
        value="amount"
        label="name"
        cornerRadius={cornerRadius}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("cornerRadius");
  },
);

it.each([false, true])(
  "shows the complete chart without a reveal when reduced motion is %p",
  (reduced) => {
    const motion =
      jest.requireMock<typeof import("framer-motion")>("framer-motion");
    jest.spyOn(motion, "useReducedMotion").mockReturnValue(reduced);
    const { container } = renderAndFlush(
      <PieChart
        data={sampleData}
        value="amount"
        label="name"
        animation={reduced}
      />,
    );
    expect(container.querySelector("clipPath")).toBeNull();
    expect(screen.getAllByRole("graphics-symbol")).toHaveLength(4);
  },
);

it("does not restart the entrance when inspecting or resizing rounded slices", () => {
  const motion =
    jest.requireMock<typeof import("framer-motion")>("framer-motion");
  const { rerender } = renderAndFlush(
    <PieChart data={sampleData} value="amount" label="name" cornerRadius={8} />,
  );
  const calls = jest.mocked(motion.animate).mock.calls.length;
  fireEvent.mouseEnter(screen.getAllByRole("graphics-symbol")[1]!);
  rerender(
    <PieChart
      data={sampleData}
      value="amount"
      label="name"
      cornerRadius={8}
      height={400}
    />,
  );
  expect(jest.mocked(motion.animate).mock.calls).toHaveLength(calls);
});
