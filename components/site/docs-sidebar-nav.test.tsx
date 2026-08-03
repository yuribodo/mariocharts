import { fireEvent, render, screen } from "@testing-library/react";

import { DocsSidebarNav } from "./docs-sidebar-nav";

jest.mock("next/navigation", () => ({
  usePathname: () => "/docs/components/bar-chart",
}));

describe("DocsSidebarNav", () => {
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
});
