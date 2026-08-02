import { render, screen } from "@testing-library/react";

import { HeroSection } from "./hero-section";

jest.mock("./hero-portrait", () => ({
  HeroPortrait: () => <pre role="img" aria-label="Mario, rendered in ASCII" />,
}));

describe("HeroSection", () => {
  it("states the offer without adjective claims", () => {
    render(<HeroSection />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toMatch(/every chart here/i);
    expect(heading.textContent).toMatch(/is yours/i);
    expect(heading.textContent).not.toMatch(/beautiful|modern|customizable/i);
  });

  it("offers the install command and nothing else to click", () => {
    render(<HeroSection />);

    expect(screen.getByText("npx mario-charts@latest init")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy command" })).toBeInTheDocument();
    // The two CTAs are gone: both destinations are in the site header and in
    // the chart index one screen below.
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("carries the portrait", () => {
    render(<HeroSection />);

    expect(screen.getByRole("img", { name: /ascii/i })).toBeInTheDocument();
  });

  it("drops the pre-design-system surfaces", () => {
    const { container } = render(<HeroSection />);
    const markup = container.innerHTML;

    expect(markup).not.toContain("backdrop-blur");
    expect(markup).not.toContain("shadow-lg");
    expect(markup).not.toContain("rounded-xl");
    expect(markup).not.toContain("transition-all");
  });

  // jsdom has no layout engine, so it cannot measure real pixel overlap
  // between the copy and the portrait -- a test that tried to read
  // getBoundingClientRect() here would get zeroed-out rects and pass no
  // matter what the CSS actually does. What jsdom *can* check is the
  // structural precondition that makes overlap impossible in the first
  // place: the copy and the portrait must be normal-flow siblings inside a
  // real grid, not two absolutely-positioned layers stacked on top of each
  // other. The previous layout wrapped the portrait in an
  // `absolute inset-0` div sized off viewport width, which is exactly what
  // let its ink render underneath the headline below ~1024px wide -- these
  // two tests fail against that layout and pass against this one.
  it("lays the copy and the portrait out as grid siblings, not overlaid layers", () => {
    const { container } = render(<HeroSection />);

    const grid = container.querySelector(".grid");
    expect(grid).not.toBeNull();
    expect(grid?.className).toMatch(/\bsm:grid-cols-2\b/);
  });

  it("keeps the portrait in normal flow instead of layered over the copy", () => {
    const { container } = render(<HeroSection />);
    const portrait = screen.getByRole("img", { name: /ascii/i });

    // Walk from the portrait up to the render root. If anything between
    // them is absolutely positioned, the portrait could be layered on top
    // of the copy instead of occupying its own grid cell, regardless of
    // how the grid itself is configured.
    let node: HTMLElement | null = portrait.parentElement;
    while (node && node !== container) {
      expect(node.className).not.toMatch(/\babsolute\b/);
      node = node.parentElement;
    }
  });
});
