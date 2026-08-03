import { render, screen } from "@testing-library/react";

import { LandingFooter } from "./landing-footer";

describe("LandingFooter", () => {
  it("links to the documentation surfaces", () => {
    render(<LandingFooter />);

    expect(screen.getByRole("link", { name: /^docs$/i })).toHaveAttribute("href", "/docs");
    expect(screen.getByRole("link", { name: /components/i })).toHaveAttribute(
      "href",
      "/docs/components",
    );
    expect(screen.getByRole("link", { name: /installation/i })).toHaveAttribute(
      "href",
      "/docs/installation",
    );
  });

  it("names its navigation groups for assistive technology", () => {
    render(<LandingFooter />);

    expect(screen.getByRole("navigation", { name: /navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /connect/i })).toBeInTheDocument();
  });

  it("connects only through github", () => {
    render(<LandingFooter />);

    expect(screen.getByRole("link", { name: /^github$/i })).toHaveAttribute(
      "href",
      "https://github.com/yuribodo/mariocharts",
    );
    expect(screen.queryByRole("link", { name: /twitter/i })).not.toBeInTheDocument();
  });

  it("describes the product without adjective claims", () => {
    const { container } = render(<LandingFooter />);

    expect(container.textContent).not.toMatch(/beautiful|modern|customizable/i);
  });

  it("uses plain semantic tokens for dividers and muted text", () => {
    const { container } = render(<LandingFooter />);
    const markup = container.innerHTML;

    expect(markup).not.toContain("border-border/");
    expect(markup).not.toContain("text-muted-foreground/");
  });
});
