import { act, render, renderHook } from "@testing-library/react";

import { WORLD_ENTRANCE_SEEN_KEY } from "@/lib/world-entrance";

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

function mockNavigationType(type: PerformanceNavigationTiming["type"]) {
  Object.defineProperty(performance, "getEntriesByType", {
    configurable: true,
    writable: true,
    value: jest.fn().mockReturnValue([{ type } as PerformanceNavigationTiming]),
  });
}

describe("useHeroEntrance", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetHeroEntranceForTests();
    mockNavigationType("navigate");
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

  it("skips soft-nav Home after the entrance has completed", () => {
    setMedia({});
    const first = renderHook(() => useHeroEntrance());

    act(() => {
      jest.runAllTimers();
    });
    expect(first.result.current.status).toBe("done");
    first.unmount();

    const second = renderHook(() => useHeroEntrance());
    expect(second.result.current.status).toBe("skipped");
    expect(second.result.current.fieldActive).toBe(true);
  });

  it("plays again on reload even after a prior completion", () => {
    setMedia({});
    window.sessionStorage.setItem(WORLD_ENTRANCE_SEEN_KEY, "1");
    mockNavigationType("reload");

    const { result } = renderHook(() => useHeroEntrance());
    expect(result.current.status).toBe("welcome");
    expect(result.current.welcomeActive).toBe(true);
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
