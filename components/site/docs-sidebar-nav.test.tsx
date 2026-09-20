import { fireEvent, render, screen } from "@testing-library/react";

import { DocsSidebarNav } from "./docs-sidebar-nav";

const mockUsePathname = jest.fn(() => "/docs/components/bar-chart");

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("DocsSidebarNav", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/docs/components/bar-chart");
  });

  it("labels search and filters component links", () => {
    render(<DocsSidebarNav />);

    const search = screen.getByRole("searchbox", {
      name: "Search documentation",
    });
    fireEvent.change(search, { target: { value: "heatmap" } });

    expect(screen.getByRole("link", { name: "Heatmap" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Bar Chart" }),
    ).not.toBeInTheDocument();
  });

  it("exposes active and disclosure states", () => {
    render(<DocsSidebarNav />);

    expect(screen.getByRole("link", { name: "Bar Chart" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("button", { name: "Components" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("marks the clicked chart as busy until navigation commits", () => {
    render(<DocsSidebarNav />);

    fireEvent.click(screen.getByRole("link", { name: "Scatter Plot" }));

    expect(screen.getByRole("link", { name: "Scatter Plot" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("link", { name: "Bar Chart" })).not.toHaveAttribute(
      "aria-busy",
    );
  });
});
