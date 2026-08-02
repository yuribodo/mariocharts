import { render, screen } from "@testing-library/react";

import { HeroPortrait } from "./hero-portrait";

jest.mock("./hero-ascii", () => ({
  HERO_ASCII: "  ..::##\n  ..::##",
  HERO_ASCII_COLUMNS: 8,
}));

jest.mock("./hero-portrait-effect", () => ({ HeroPortraitEffect: () => null }));

describe("HeroPortrait", () => {
  it("exposes one short name instead of the whole field", () => {
    render(<HeroPortrait />);

    const portrait = screen.getByRole("img");
    expect(portrait).toHaveAccessibleName("Mario, rendered in ASCII");
    expect(portrait.tagName).toBe("PRE");
  });

  it("adds nothing to the tab order", () => {
    const { container } = render(<HeroPortrait />);

    expect(
      container.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'),
    ).toHaveLength(0);
  });

  it("renders the committed art verbatim", () => {
    render(<HeroPortrait />);

    expect(screen.getByRole("img").textContent).toBe("  ..::##\n  ..::##");
  });

  it("does not paint over the field", () => {
    const { container } = render(<HeroPortrait />);
    const markup = container.innerHTML;

    expect(markup).not.toContain("backdrop-blur");
    expect(markup).not.toContain("shadow-lg");
    expect(markup).not.toContain("rounded-xl");
  });
});
