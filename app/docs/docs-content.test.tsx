import { render, screen } from "@testing-library/react";

import { DocsContent } from "./docs-content";

jest.mock("../../components/ui/animated-faq", () => ({
  AnimatedFAQ: () => <div>FAQ</div>,
}));

describe("DocsContent", () => {
  it("starts with ownership and a one-minute quickstart", () => {
    render(<DocsContent />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Mario Charts" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Start in one minute" }),
    ).toBeInTheDocument();
    expect(screen.getByText("npx mario-charts@latest init")).toBeInTheDocument();
    expect(screen.queryByText(/not just a chart library/i)).not.toBeInTheDocument();
  });

  it("links directly to charts and installation guidance", () => {
    render(<DocsContent />);

    expect(screen.getByRole("link", { name: "Browse charts" })).toHaveAttribute(
      "href",
      "/docs/components",
    );
    expect(
      screen.getByRole("link", { name: "Read installation guide" }),
    ).toHaveAttribute("href", "/docs/installation");
  });
});
