import { render } from "@testing-library/react";
import DocsLayout from "./layout";

jest.mock("../../components/site/docs-sidebar-nav", () => ({
  DocsSidebarNav: () => <nav>Documentation</nav>,
}));

jest.mock("../../components/site/docs-right-sidebar", () => ({
  DocsRightSidebar: () => <nav>On this page</nav>,
}));

jest.mock("../../components/site/mobile-toc-fab", () => ({
  MobileTocFab: () => null,
}));

describe("DocsLayout", () => {
  it("gives interactive documentation a wider desktop canvas", () => {
    const { container } = render(<DocsLayout><div>Content</div></DocsLayout>);
    const shell = container.querySelector(".md\\:grid");
    const main = container.querySelector("main");
    const content = main?.firstElementChild;

    expect(shell).toHaveClass("xl:max-w-[1600px]");
    expect(main).toHaveClass("xl:px-10");
    expect(content).toHaveClass("max-w-[960px]");
  });
});
