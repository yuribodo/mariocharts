import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { WaterfallChart } from "./index";

const sampleData = [
  { label: "Start", value: 100, type: "total" },
  { label: "Up", value: 40, type: "increase" },
  { label: "Down", value: -25, type: "decrease" },
  { label: "End", value: 115, type: "total" },
];

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    width: 800, height: 300, top: 0, left: 0, bottom: 300, right: 800, x: 0, y: 0, toJSON: () => {},
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

function renderAndFlush(ui: React.ReactElement) {
  let result: ReturnType<typeof render>;
  act(() => { result = render(ui); });
  act(() => { jest.runAllTimers(); });
  return result!;
}

describe("WaterfallChart", () => {
  it("renders an SVG using the default label/value/type keys", () => {
    const { container } = renderAndFlush(<WaterfallChart data={sampleData} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders one bar per data point", () => {
    const { container } = renderAndFlush(<WaterfallChart data={sampleData} />);
    expect(container.querySelectorAll("rect").length).toBe(sampleData.length);
  });

  it("colour-codes bars by type (increase/decrease/total)", () => {
    const { container } = renderAndFlush(<WaterfallChart data={sampleData} />);
    const fills = Array.from(container.querySelectorAll("rect")).map((r) => r.getAttribute("fill"));
    expect(fills).toContain("#3b82f6"); // total
    expect(fills).toContain("#10b981"); // increase
    expect(fills).toContain("#ef4444"); // decrease
  });

  it("applies custom colours", () => {
    const { container } = renderAndFlush(
      <WaterfallChart data={sampleData} colors={{ increase: "#123456" }} />
    );
    const fills = Array.from(container.querySelectorAll("rect")).map((r) => r.getAttribute("fill"));
    expect(fills).toContain("#123456");
    expect(fills).toContain("#ef4444"); // decrease still default
  });

  it("draws connector lines when showConnectors is on (default)", () => {
    const { container } = renderAndFlush(<WaterfallChart data={sampleData} />);
    const connectors = Array.from(container.querySelectorAll("line")).filter(
      (l) => l.getAttribute("stroke-dasharray") === "2 2"
    );
    expect(connectors.length).toBe(sampleData.length - 1);
  });

  it("hides connector lines when showConnectors={false}", () => {
    const { container } = renderAndFlush(
      <WaterfallChart data={sampleData} showConnectors={false} />
    );
    const connectors = Array.from(container.querySelectorAll("line")).filter(
      (l) => l.getAttribute("stroke-dasharray") === "2 2"
    );
    expect(connectors.length).toBe(0);
  });

  it("renders signed value labels when showValues is on", () => {
    const { container } = renderAndFlush(<WaterfallChart data={sampleData} showValues />);
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("+40");
    expect(texts).toContain("-25");
  });

  it("renders a legend when showLegend is on", () => {
    renderAndFlush(<WaterfallChart data={sampleData} showLegend />);
    expect(screen.getByText("Increase")).toBeInTheDocument();
    expect(screen.getByText("Decrease")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  it("calls onBarClick with the row data and index", () => {
    const handleClick = jest.fn();
    const { container } = renderAndFlush(
      <WaterfallChart data={sampleData} onBarClick={handleClick} />
    );
    const rects = container.querySelectorAll("rect");
    fireEvent.click(rects[1]!);
    expect(handleClick).toHaveBeenCalledWith(
      expect.objectContaining({ label: "Up", value: 40 }),
      1
    );
  });

  it("exposes each bar to assistive tech", () => {
    const { container } = renderAndFlush(<WaterfallChart data={sampleData} />);
    const bar = container.querySelector('rect[role="graphics-symbol"]');
    expect(bar).toBeInTheDocument();
    expect(bar!.getAttribute("tabindex")).toBe("0");
    expect(bar!.getAttribute("aria-label")).toContain("Start");
  });

  it("has a descriptive aria-label on the SVG", () => {
    const { container } = renderAndFlush(<WaterfallChart data={sampleData} />);
    expect(container.querySelector("svg")!.getAttribute("aria-label")).toContain("Waterfall chart");
  });

  it("supports horizontal orientation", () => {
    const { container } = renderAndFlush(
      <WaterfallChart data={sampleData} orientation="horizontal" />
    );
    expect(container.querySelector("svg")!.getAttribute("aria-label")).toContain("horizontal");
    expect(container.querySelectorAll("rect").length).toBe(sampleData.length);
  });

  it("renders grid lines when showGrid is on", () => {
    const { container } = renderAndFlush(<WaterfallChart data={sampleData} showGrid />);
    const gridLines = Array.from(container.querySelectorAll("line")).filter(
      (l) => l.getAttribute("opacity") === "0.1"
    );
    expect(gridLines.length).toBeGreaterThan(0);
  });

  it("applies a custom className to the root", () => {
    const { container } = renderAndFlush(
      <WaterfallChart data={sampleData} className="my-waterfall" />
    );
    expect(container.firstElementChild).toHaveClass("my-waterfall");
  });

  it("shows the loading state", () => {
    const { container } = render(<WaterfallChart data={sampleData} loading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows the error state", () => {
    render(<WaterfallChart data={sampleData} error="Boom" />);
    expect(screen.getByText("Boom")).toBeInTheDocument();
  });

  it("shows the empty state", () => {
    render(<WaterfallChart data={[]} />);
    expect(screen.getByText("No Data")).toBeInTheDocument();
  });

  it("uses a custom tooltip renderer on hover", () => {
    const { container } = renderAndFlush(
      <WaterfallChart
        data={sampleData}
        tooltipRenderer={(d) => <div>custom:{d.label}:{d.cumulative}</div>}
      />
    );
    const rects = container.querySelectorAll("rect");
    act(() => { fireEvent.mouseEnter(rects[1]!); });
    expect(screen.getByText("custom:Up:140")).toBeInTheDocument();
  });
});
