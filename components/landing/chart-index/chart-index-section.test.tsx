import { render, screen } from "@testing-library/react";

import { ChartIndexSection } from "./chart-index-section";
import { CHART_INDEX } from "./chart-index-data";

jest.mock("@/src/components/charts/bar-chart", () => ({ BarChart: () => <div /> }));
jest.mock("@/src/components/charts/line-chart", () => ({ LineChart: () => <div /> }));
jest.mock("@/src/components/charts/area-chart", () => ({ AreaChart: () => <div /> }));
jest.mock("@/src/components/charts/pie-chart", () => ({ PieChart: () => <div /> }));
jest.mock("@/src/components/charts/radar-chart", () => ({ RadarChart: () => <div /> }));
jest.mock("@/src/components/charts/treemap-chart", () => ({ TreeMapChart: () => <div /> }));

describe("ChartIndexSection", () => {
  it("presents every indexed chart as a link to its documentation", () => {
    render(<ChartIndexSection />);

    expect(CHART_INDEX.length).toBe(6);
    for (const entry of CHART_INDEX) {
      expect(screen.getByRole("link", { name: new RegExp(entry.name, "i") })).toHaveAttribute(
        "href",
        entry.href,
      );
    }
  });

  it("offers a path to the complete component index", () => {
    render(<ChartIndexSection />);

    expect(
      screen.getByRole("link", { name: /browse all components/i }),
    ).toHaveAttribute("href", "/docs/components");
  });

  it("does not hijack scroll with a tall spacer", () => {
    const { container } = render(<ChartIndexSection />);
    const markup = container.innerHTML;

    expect(markup).not.toContain("500vh");
    expect(markup).not.toContain("sticky");
  });

  it("uses connected surfaces instead of floating cards", () => {
    const { container } = render(<ChartIndexSection />);
    const markup = container.innerHTML;

    expect(markup).not.toContain("rounded-xl");
    expect(markup).not.toContain("rounded-2xl");
    expect(markup).not.toContain("backdrop-blur");
    expect(markup).not.toContain("shadow-lg");
  });

  it("takes the decorative previews out of the tab order", () => {
    const { container } = render(<ChartIndexSection />);

    // Charts make their own marks focusable. Inside a link they are
    // decoration, and a focusable element inside an aria-hidden subtree is
    // exactly what ARIA forbids.
    const previews = [...container.querySelectorAll("a")]
      .map((link) => link.firstElementChild)
      .filter(
        (el): el is Element =>
          el?.tagName === "DIV" && el.getAttribute("aria-hidden") === "true",
      );

    expect(previews).toHaveLength(CHART_INDEX.length);
    for (const preview of previews) {
      expect(preview.hasAttribute("inert")).toBe(true);
    }
  });

  it("keeps the heading out of hero display sizing", () => {
    render(<ChartIndexSection />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.className).not.toMatch(/text-(4|5|6|7)xl/);
    expect(heading.className).not.toContain("font-bold");
  });
});
