import { act, render } from "@testing-library/react";

import { HeroChartEffect, HeroFieldEffect } from "./hero-field-effect";

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

/**
 * A matchMedia mock that keeps a live `matches` map and records the `change`
 * listeners each query was given, so a test can flip a query's result and
 * fire the listener itself — this is how MediaQueryListEvent works in real
 * browsers when the query result changes after a query was created.
 */
function setLiveMedia(initial: Record<string, boolean>) {
  const state = { ...initial };
  const listeners = new Map<string, Set<() => void>>();

  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    get matches() {
      return state[query] ?? false;
    },
    media: query,
    addEventListener: jest.fn((_event: string, cb: () => void) => {
      const set = listeners.get(query) ?? new Set();
      set.add(cb);
      listeners.set(query, set);
    }),
    removeEventListener: jest.fn((_event: string, cb: () => void) => {
      listeners.get(query)?.delete(cb);
    }),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })) as unknown as typeof window.matchMedia;

  return {
    set(query: string, matches: boolean) {
      state[query] = matches;
      listeners.get(query)?.forEach((cb) => cb());
    },
  };
}

/**
 * Stubs the canvas 2D context and layout rect that jsdom doesn't provide, so
 * the drawing branch of the effect (everything past the `!context` guard)
 * can run and be asserted on instead of silently no-oping.
 */
function mockCanvas({ width = 220, height = 90 }: { width?: number; height?: number } = {}) {
  const context = {
    clearRect: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn((text: string) => ({ width: String(text).length })),
    setTransform: jest.fn(),
    font: "",
    fillStyle: "",
    textBaseline: "",
    globalAlpha: 1,
    canvas: document.createElement("canvas"),
  };
  jest
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(context as unknown as CanvasRenderingContext2D);
  jest.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => {},
  } as DOMRect);
  return context;
}

async function flushRaf() {
  await act(async () => {
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined))),
    );
  });
}

describe("HeroFieldEffect", () => {
  beforeEach(() => {
    // jsdom has no canvas implementation; default to a quiet no-op so mount
    // tests don't flood the console. Draw tests replace this via mockCanvas.
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("mounts a canvas when motion is allowed, even without a fine pointer", () => {
    setMedia({});
    const { container } = render(<HeroFieldEffect />);

    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("stays unmounted while active is false so the intro warp owns the field", () => {
    setMedia({});
    const { container } = render(<HeroFieldEffect active={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing at all under reduced motion", () => {
    setMedia({
      "(hover: hover) and (pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": true,
    });
    const { container } = render(<HeroFieldEffect />);

    expect(container).toBeEmptyDOMElement();
  });

  it("keeps the canvas out of the accessibility tree and the tab order", () => {
    setMedia({});
    const { container } = render(<HeroFieldEffect />);
    const canvas = container.querySelector("canvas")!;

    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas.tabIndex).toBeLessThan(0);
  });

  it("re-evaluates the media queries when their result changes, without a reload", () => {
    const media = setLiveMedia({
      "(hover: hover) and (pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": false,
    });
    const { container } = render(<HeroFieldEffect />);
    expect(container.querySelector("canvas")).toBeInTheDocument();

    act(() => {
      media.set("(prefers-reduced-motion: reduce)", true);
    });
    expect(container.querySelector("canvas")).not.toBeInTheDocument();

    act(() => {
      media.set("(prefers-reduced-motion: reduce)", false);
    });
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("paints the field on its own and fires onReady after the first frame", async () => {
    const context = mockCanvas();
    const onReady = jest.fn();
    setMedia({});
    render(<HeroFieldEffect onReady={onReady} />);

    await flushRaf();

    expect(context.fillText).toHaveBeenCalled();
    expect(onReady).toHaveBeenCalled();
  });

  it("bails out of the draw loop instead of hanging when the canvas measures zero", async () => {
    const context = mockCanvas({ width: 0, height: 0 });
    setMedia({ "(hover: hover) and (pointer: fine)": true });
    render(<HeroFieldEffect />);

    await act(async () => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 10, clientY: 10 }));
    });
    await flushRaf();

    // A 0x0 canvas makes cursor cell math Infinity; unguarded, that feeds a
    // `for` loop that never terminates. Reaching this assertion at all
    // (inside Jest's default timeout) is part of what this test checks.
    expect(context.fillText).not.toHaveBeenCalled();
  });

  it("scales the backing store by devicePixelRatio so glyphs stay crisp on HiDPI screens", () => {
    mockCanvas({ width: 100, height: 50 });
    const originalRatio = window.devicePixelRatio;
    Object.defineProperty(window, "devicePixelRatio", { value: 2, configurable: true });
    setMedia({});
    const { container } = render(<HeroFieldEffect />);
    const canvas = container.querySelector("canvas")!;

    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(100);

    Object.defineProperty(window, "devicePixelRatio", { value: originalRatio, configurable: true });
  });

  it("enables the cursor spotlight for fine pointers", async () => {
    mockCanvas({ width: 220, height: 90 });
    setMedia({ "(hover: hover) and (pointer: fine)": true });
    const { container } = render(<HeroFieldEffect />);
    await flushRaf();

    expect(container.querySelector("canvas")).toHaveAttribute(
      "data-spotlight",
      "on",
    );
  });

  it("keeps the spotlight off when the pointer is coarse", async () => {
    mockCanvas({ width: 220, height: 90 });
    setMedia({});
    const { container } = render(<HeroFieldEffect />);
    await flushRaf();

    expect(container.querySelector("canvas")).toHaveAttribute(
      "data-spotlight",
      "off",
    );
  });
});

describe("HeroChartEffect", () => {
  beforeEach(() => {
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("mounts a canvas when motion is allowed", () => {
    setMedia({});
    const { container } = render(<HeroChartEffect />);
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("renders nothing under reduced motion", () => {
    setMedia({ "(prefers-reduced-motion: reduce)": true });
    const { container } = render(<HeroChartEffect />);
    expect(container).toBeEmptyDOMElement();
  });

  it("paints and fires onReady after the first frame", async () => {
    const context = mockCanvas({ width: 220, height: 24 });
    const onReady = jest.fn();
    setMedia({});
    render(<HeroChartEffect onReady={onReady} />);

    await flushRaf();

    expect(context.fillText).toHaveBeenCalled();
    expect(onReady).toHaveBeenCalled();
  });
});
