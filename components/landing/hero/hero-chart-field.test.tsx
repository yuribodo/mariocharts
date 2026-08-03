import { act, render, screen } from "@testing-library/react";

jest.mock("./hero-chart", () => ({
  HERO_CHART_COLUMNS: 8,
  HERO_CHART_FORMS: ["area-art", "bars-art", "line-art"],
}));

import { HeroChartField } from "./hero-chart-field";

function setReducedMotion(reduced: boolean) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: reduced && query.includes("reduce"),
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe("HeroChartField", () => {
  beforeEach(() => {
    setReducedMotion(false);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders a form of the chart as decoration", () => {
    const { container } = render(<HeroChartField />);

    // The chart sits beside a real heading. Announcing itself as a named image
    // would make a screen reader read the hero's claim twice.
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.textContent).toContain("area-art");
  });

  it("cycles forward one form at a time and wraps", () => {
    const { container } = render(<HeroChartField />);
    const advanceOneForm = () =>
      act(() => {
        jest.advanceTimersByTime(4_200);
      });

    advanceOneForm();
    expect(container.textContent).toContain("bars-art");
    expect(container.textContent).not.toContain("area-art");

    advanceOneForm();
    expect(container.textContent).toContain("line-art");

    // Wrapping matters: an index that ran off the end would render nothing.
    advanceOneForm();
    expect(container.textContent).toContain("area-art");
  });

  it("rests on the first form when motion is reduced", () => {
    setReducedMotion(true);
    const { container } = render(<HeroChartField />);

    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    expect(container.textContent).toContain("area-art");
    expect(container.textContent).not.toContain("bars-art");
  });

  it("stops cycling once unmounted", () => {
    const { unmount } = render(<HeroChartField />);
    unmount();

    // A timer still firing after unmount would set state on a dead component
    // and keep the hero's work alive for the life of the page.
    expect(jest.getTimerCount()).toBe(0);
  });
});
