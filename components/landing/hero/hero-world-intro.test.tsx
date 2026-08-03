import { render, renderHook } from "@testing-library/react";

import {
  HeroWorldIntro,
  resetHeroEntranceForTests,
  useHeroEntrance,
} from "./hero-world-intro";

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

describe("useHeroEntrance", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetHeroEntranceForTests();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    resetHeroEntranceForTests();
  });

  it("stays settled under reduced motion — no warp, everything revealed", () => {
    setMedia({ "(prefers-reduced-motion: reduce)": true });
    const { result } = renderHook(() => useHeroEntrance());

    expect(result.current).toEqual({
      status: "skipped",
      welcomeActive: false,
      welcomeFading: false,
      warpActive: false,
      shellOpaque: false,
      fieldActive: true,
      fieldReveal: true,
      copyReveal: true,
      portraitReveal: true,
    });
  });

  it("starts on the welcome line before the portal", () => {
    setMedia({});
    const { result } = renderHook(() => useHeroEntrance());

    expect(result.current.status).toBe("welcome");
    expect(result.current.welcomeActive).toBe(true);
    expect(result.current.warpActive).toBe(false);
    expect(result.current.fieldActive).toBe(false);
  });

  it("skips a second mount in the same document (soft-nav Home)", () => {
    setMedia({});
    const first = renderHook(() => useHeroEntrance());
    expect(first.result.current.status).toBe("welcome");
    first.unmount();

    const second = renderHook(() => useHeroEntrance());
    expect(second.result.current.status).toBe("skipped");
    expect(second.result.current.fieldActive).toBe(true);
  });
});

describe("HeroWorldIntro", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders nothing when inactive", () => {
    const { container } = render(
      <HeroWorldIntro
        warpActive={false}
        welcomeActive={false}
        welcomeFading={false}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
