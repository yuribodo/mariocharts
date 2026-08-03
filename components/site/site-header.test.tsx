import { render, screen } from "@testing-library/react";

import { SiteHeader } from "./site-header";

const mockUsePathname = jest.fn(() => "/docs/components/bar-chart");

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock("framer-motion", () => {
  const React = require("react");
  const passthrough =
    (Tag: "span" | "div" | "header" | "svg") =>
    ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLElement> & {
      variants?: unknown;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
      layoutId?: unknown;
      whileHover?: unknown;
    }) => {
      const {
        variants: _v,
        initial: _i,
        animate: _a,
        transition: _t,
        layoutId: _l,
        whileHover: _h,
        ...rest
      } = props;
      return React.createElement(Tag, rest, children);
    };

  return {
    motion: {
      span: passthrough("span"),
      div: passthrough("div"),
      header: passthrough("header"),
      svg: passthrough("svg"),
    },
    LayoutGroup: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    useReducedMotion: () => true,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

jest.mock("./theme-toggle", () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));
jest.mock("./logo-animated", () => ({
  LogoAnimated: () => <span data-testid="current-logo">Logo</span>,
}));
jest.mock("./mobile-docs-drawer", () => ({
  MobileDocsDrawer: () => <button type="button">Docs menu</button>,
}));
jest.mock("./mobile-menu", () => ({
  MobileMenu: () => <button type="button">Menu</button>,
}));
jest.mock("./github-stars", () => ({
  GitHubStars: () => <span>Stars</span>,
}));
jest.mock("./mario-star", () => ({
  MarioStar: () => <span data-testid="mario-star">★</span>,
}));

describe("SiteHeader", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/docs/components/bar-chart");
    document.documentElement.removeAttribute("data-world-entering");
  });

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
    expect(screen.getByRole("link", { name: "Docs" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("treats Docs as active only on the docs index", () => {
    mockUsePathname.mockReturnValue("/docs");
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Charts" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
