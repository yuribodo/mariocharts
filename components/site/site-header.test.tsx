import { renderToString } from "react-dom/server.node";
import { hydrateRoot } from "react-dom/client";
import { act, render, screen } from "@testing-library/react";

import { SiteHeader } from "./site-header";

let mockReduceMotion = true;
const mockUsePathname = jest.fn(() => "/docs/components/bar-chart");

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock("framer-motion", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Jest mock factory
  const React = require("react") as typeof import("react");

  function passthrough(Tag: "span" | "div" | "header" | "svg") {
    function MotionPassthrough({
      children,
      ...props
    }: React.HTMLAttributes<HTMLElement> & {
      variants?: unknown;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
      layoutId?: unknown;
      whileHover?: unknown;
    }) {
      const {
        variants: _variants,
        initial: _initial,
        animate: _animate,
        transition: _transition,
        layoutId: _layoutId,
        whileHover: _whileHover,
        ...rest
      } = props;
      return React.createElement(Tag, rest, children);
    }
    MotionPassthrough.displayName = `MotionPassthrough(${Tag})`;
    return MotionPassthrough;
  }

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
    useReducedMotion: () => mockReduceMotion,
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

it("hydrates without a mismatch when reduced motion is only known in the browser", async () => {
  mockReduceMotion = false;
  const container = document.createElement("div");
  container.innerHTML = renderToString(<SiteHeader />);
  document.body.append(container);
  mockReduceMotion = true;
  const errors = jest.spyOn(console, "error").mockImplementation(() => {});
  let root: ReturnType<typeof hydrateRoot>;
  try {
    await act(async () => { root = hydrateRoot(container, <SiteHeader />); });
    expect(errors).not.toHaveBeenCalled();
    expect(container.querySelector("header")).toHaveAttribute("data-revealed");
  } finally {
    act(() => root!.unmount());
    container.remove();
    errors.mockRestore();
  }
});
