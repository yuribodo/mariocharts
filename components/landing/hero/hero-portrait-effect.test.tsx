import { render } from "@testing-library/react";

import { HeroPortraitEffect } from "./hero-portrait-effect";

function setMedia(matches: Record<string, boolean>) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: matches[query] ?? false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })) as unknown as typeof window.matchMedia;
}

const PROPS = { text: "..##\n..##", columns: 4 };

describe("HeroPortraitEffect", () => {
  it("mounts a canvas for a fine pointer without reduced motion", () => {
    setMedia({ "(hover: hover) and (pointer: fine)": true });
    const { container } = render(<HeroPortraitEffect {...PROPS} />);

    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("renders nothing at all under reduced motion", () => {
    setMedia({
      "(hover: hover) and (pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": true,
    });
    const { container } = render(<HeroPortraitEffect {...PROPS} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing on a coarse pointer", () => {
    setMedia({});
    const { container } = render(<HeroPortraitEffect {...PROPS} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("keeps the canvas out of the accessibility tree and the tab order", () => {
    setMedia({ "(hover: hover) and (pointer: fine)": true });
    const { container } = render(<HeroPortraitEffect {...PROPS} />);
    const canvas = container.querySelector("canvas")!;

    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas.tabIndex).toBeLessThan(0);
  });
});
