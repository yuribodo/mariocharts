import { markdownAlternate } from "./markdown-alternate";

describe("markdownAlternate", () => {
  it("maps home to /index.md", () => {
    expect(markdownAlternate("/")).toEqual({
      canonical: "/",
      types: { "text/markdown": "/index.md" },
    });
  });

  it("appends .md to other paths", () => {
    expect(markdownAlternate("/docs/components/bar-chart")).toEqual({
      canonical: "/docs/components/bar-chart",
      types: { "text/markdown": "/docs/components/bar-chart.md" },
    });
  });
});
