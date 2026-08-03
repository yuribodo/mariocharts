import { render, screen } from "@testing-library/react";

import { HeroPortrait } from "./hero-portrait";

jest.mock("./hero-ascii", () => ({
  HERO_ASCII_COLUMNS: 8,
  HERO_ASCII_DARK: "  ..::##\n  ..::##",
  HERO_ASCII_LIGHT: "##::..  \n##::..  ",
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

  it("renders the committed dark-theme art verbatim on the accessible copy", () => {
    render(<HeroPortrait />);

    expect(screen.getByRole("img").textContent).toBe("  ..::##\n  ..::##");
  });

  it("renders exactly one other <pre>, carrying the light-theme art and marked aria-hidden", () => {
    const { container } = render(<HeroPortrait />);
    const pres = container.querySelectorAll("pre");

    expect(pres).toHaveLength(2);

    const decorative = [...pres].find((pre) => pre !== screen.getByRole("img"));
    expect(decorative).toHaveAttribute("aria-hidden", "true");
    expect(decorative?.textContent).toBe("##::..  \n##::..  ");
  });

  it("does not paint over the field", () => {
    const { container } = render(<HeroPortrait />);
    const markup = container.innerHTML;

    expect(markup).not.toContain("backdrop-blur");
    expect(markup).not.toContain("shadow-lg");
    expect(markup).not.toContain("rounded-xl");
  });

  it("shrinks the wrapper to the art instead of stretching it, so the effect's canvas grid lines up with the text grid", () => {
    render(<HeroPortrait />);
    const wrapper = screen.getByRole("img").parentElement;

    expect(wrapper).toHaveClass("w-fit");
  });

  it("keeps the accessible copy in normal flow, so only the decorative copy is the absolutely-positioned overlay", () => {
    const { container } = render(<HeroPortrait />);
    const accessible = screen.getByRole("img");
    const decorative = [...container.querySelectorAll("pre")].find(
      (pre) => pre !== accessible,
    )!;

    expect(accessible.className).not.toMatch(/\babsolute\b/);
    expect(decorative.className).toMatch(/\babsolute\b/);
  });
});
