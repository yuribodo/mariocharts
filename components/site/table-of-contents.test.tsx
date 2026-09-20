import { render, screen } from "@testing-library/react";
import { TableOfContents } from "./table-of-contents";

let mockPathname = "/docs/components/bar-chart";
jest.mock("next/navigation", () => ({ usePathname: () => mockPathname }));

it("replaces the index synchronously with the route and observes headings after assigning IDs", () => {
  const observedIds: string[] = [];
  const disconnect = jest.fn();
  const original = global.IntersectionObserver;
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: (heading: HTMLElement) => observedIds.push(heading.id),
    disconnect,
  }));
  try {
    const { rerender, unmount } = render(
      <>
        <h2>Bar usage</h2>
        <TableOfContents />
      </>,
    );
    expect(screen.getByRole("link", { name: "Bar usage" })).toHaveAttribute(
      "href",
      "#bar-usage",
    );
    expect(observedIds).toContain("bar-usage");

    mockPathname = "/docs/components/line-chart";
    rerender(
      <>
        <h2 key="line">Line usage</h2>
        <TableOfContents />
      </>,
    );
    expect(
      screen.queryByRole("link", { name: "Bar usage" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Line usage" })).toHaveAttribute(
      "href",
      "#line-usage",
    );
    expect(observedIds).toContain("line-usage");
    expect(disconnect).toHaveBeenCalledTimes(1);
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(2);
  } finally {
    global.IntersectionObserver = original;
  }
});
