import { render, screen } from "@testing-library/react";

import { ComponentsContent } from "./components-content";

describe("ComponentsContent", () => {
  it("organizes every shipped chart by analytical purpose", () => {
    render(<ComponentsContent />);

    expect(screen.getByRole("heading", { level: 1, name: "Charts" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Compare values" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Track change" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Understand composition" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Find relationships" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Monitor progress" })).toBeInTheDocument();

    expect(screen.getAllByRole("link")).toHaveLength(11);
  });

  it("links previews to their documentation", () => {
    render(<ComponentsContent />);

    expect(screen.getByRole("link", { name: /^bar chart$/i })).toHaveAttribute(
      "href",
      "/docs/components/bar-chart",
    );
    expect(screen.getByRole("link", { name: /area chart/i })).toHaveAttribute(
      "href",
      "/docs/components/area-chart",
    );
    expect(screen.getByRole("link", { name: /treemap/i })).toHaveAttribute(
      "href",
      "/docs/components/treemap",
    );
  });
});
