import { render, screen } from "@testing-library/react";

import { HeroSection } from "./hero-section";

jest.mock("./morphing-chart", () => ({
  MorphingChart: () => <div aria-label="Animated chart preview" />,
}));

describe("HeroSection", () => {
  it("leads with the approved product promise and current CLI", () => {
    render(<HeroSection />);

    expect(
      screen.getByRole("heading", { name: "Beautiful data. Readable code." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("npx mario-charts@latest add bar-chart"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Animated chart preview")).toBeInTheDocument();
  });

  it("provides direct installation and component discovery paths", () => {
    render(<HeroSection />);

    expect(screen.getByRole("link", { name: /get started/i })).toHaveAttribute(
      "href",
      "/docs/installation",
    );
    expect(screen.getByRole("link", { name: /browse charts/i })).toHaveAttribute(
      "href",
      "/docs/components",
    );
  });
});
