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
});
