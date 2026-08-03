import { render, screen } from "@testing-library/react";

import { CTASection } from "./cta-section";

describe("CTASection", () => {
  it("offers the install command through the accessible snippet", () => {
    render(<CTASection />);

    expect(screen.getByText("npx mario-charts@latest init")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy command" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("routes to the docs and the repository", () => {
    render(<CTASection />);

    expect(screen.getByRole("link", { name: /read the docs/i })).toHaveAttribute(
      "href",
      "/docs",
    );
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/yuribodo/mariocharts",
    );
  });

  it("states the offer without adjective claims", () => {
    render(<CTASection />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).not.toMatch(/beautiful|modern|customizable/i);
    expect(heading.className).not.toMatch(/text-(4|5|6|7)xl/);
    expect(heading.className).not.toContain("font-bold");
  });

  it("drops the pre-design-system surfaces", () => {
    const { container } = render(<CTASection />);
    const markup = container.innerHTML;

    expect(markup).not.toContain("rounded-xl");
    expect(markup).not.toContain("backdrop-blur");
    expect(markup).not.toContain("shadow-lg");
    expect(markup).not.toContain("transition-all");
  });
});
