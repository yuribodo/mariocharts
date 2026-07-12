import { render, screen } from "@testing-library/react";

import { SiteHeader } from "./site-header";

const mockUsePathname = jest.fn(() => "/docs/components/bar-chart");

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock("./theme-toggle", () => ({ ThemeToggle: () => <button>Theme</button> }));
jest.mock("./logo-animated", () => ({
  LogoAnimated: () => <span data-testid="current-logo">Logo</span>,
}));
jest.mock("./mobile-docs-drawer", () => ({
  MobileDocsDrawer: () => <button>Docs menu</button>,
}));
jest.mock("./mobile-menu", () => ({
  MobileMenu: () => <button>Menu</button>,
}));
jest.mock("./progress-dots", () => ({ ProgressDots: () => null }));
jest.mock("./github-stars", () => ({ GitHubStars: () => <span>Stars</span> }));

describe("SiteHeader", () => {
  it("preserves the current logo and presents ecosystem navigation", () => {
    render(<SiteHeader />);

    expect(screen.getAllByTestId("current-logo")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Charts" })).toHaveAttribute(
      "href",
      "/docs/components",
    );
    expect(screen.getByRole("link", { name: "Examples" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Docs" })).toBeInTheDocument();
  });

  it("marks the current ecosystem section", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "Charts" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
