import { act, render } from "@testing-library/react";

import { HeroFieldEffect } from "./hero-field-effect";

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
function mockCanvas({ width = 40, height = 20 }: { width?: number; height?: number } = {}) {
  const context = {
    clearRect: jest.fn(),
    fillText: jest.fn(),
    setTransform: jest.fn(),
    font: "",
    fillStyle: "",
    textBaseline: "",
    globalAlpha: 1,
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
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

const PROPS = { text: "..##\n..##", columns: 4 };

describe("HeroFieldEffect", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("mounts a canvas for a fine pointer without reduced motion", () => {
    setMedia({ "(hover: hover) and (pointer: fine)": true });
    const { container } = render(<HeroFieldEffect {...PROPS} />);

    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("renders nothing at all under reduced motion", () => {
    setMedia({
      "(hover: hover) and (pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": true,
    });
    const { container } = render(<HeroFieldEffect {...PROPS} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing on a coarse pointer", () => {
    setMedia({});
    const { container } = render(<HeroFieldEffect {...PROPS} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("keeps the canvas out of the accessibility tree and the tab order", () => {
    setMedia({ "(hover: hover) and (pointer: fine)": true });
    const { container } = render(<HeroFieldEffect {...PROPS} />);
    const canvas = container.querySelector("canvas")!;

    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas.tabIndex).toBeLessThan(0);
  });

  it("re-evaluates the media queries when their result changes, without a reload", () => {
    const media = setLiveMedia({
      "(hover: hover) and (pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": false,
    });
    const { container } = render(<HeroFieldEffect {...PROPS} />);
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

  it("bails out of the draw loop instead of hanging when the canvas measures zero", async () => {
    const context = mockCanvas({ width: 0, height: 0 });
    setMedia({ "(hover: hover) and (pointer: fine)": true });
    render(<HeroFieldEffect {...PROPS} />);

    await act(async () => {
      window.dispatchEvent(new MouseEvent("pointermove", { clientX: 10, clientY: 10 }));
    });
    await flushRaf();

    // A 0x0 canvas makes cursorRow/cursorColumn Infinity; unguarded, that
    // feeds a `for` loop that never terminates. Reaching this assertion at
    // all (inside Jest's default timeout) is part of what this test checks.
    expect(context.fillText).not.toHaveBeenCalled();
  });

  it("redraws when the pointer leaves the viewport (pointerout with a null relatedTarget)", async () => {
    const context = mockCanvas();
    setMedia({ "(hover: hover) and (pointer: fine)": true });
    render(<HeroFieldEffect {...PROPS} />);

    await act(async () => {
      window.dispatchEvent(new MouseEvent("pointermove", { clientX: 5, clientY: 5 }));
    });
    await flushRaf();
    context.clearRect.mockClear();

    // pointerleave does not bubble, so a listener on window never fires for
    // it. pointerout does bubble, and the browser sets relatedTarget to null
    // on the one that fires as the pointer leaves the document entirely.
    await act(async () => {
      window.dispatchEvent(new MouseEvent("pointerout", { relatedTarget: null }));
    });
    await flushRaf();

    expect(context.clearRect).toHaveBeenCalled();
  });

  it("ignores pointerout events that stay inside the document", async () => {
    const context = mockCanvas();
    const insideElement = document.createElement("div");
    setMedia({ "(hover: hover) and (pointer: fine)": true });
    render(<HeroFieldEffect {...PROPS} />);

    context.clearRect.mockClear();
    await act(async () => {
      window.dispatchEvent(new MouseEvent("pointerout", { relatedTarget: insideElement }));
    });
    await flushRaf();

    expect(context.clearRect).not.toHaveBeenCalled();
  });

  it("scales the backing store by devicePixelRatio so glyphs stay crisp on HiDPI screens", () => {
    mockCanvas({ width: 100, height: 50 });
    const originalRatio = window.devicePixelRatio;
    Object.defineProperty(window, "devicePixelRatio", { value: 2, configurable: true });
    setMedia({ "(hover: hover) and (pointer: fine)": true });
    const { container } = render(<HeroFieldEffect {...PROPS} />);
    const canvas = container.querySelector("canvas")!;

    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(100);

    Object.defineProperty(window, "devicePixelRatio", { value: originalRatio, configurable: true });
  });

  it("re-inks the field's own glyph at the cursor instead of substituting a denser one", async () => {
    const context = mockCanvas({ width: 40, height: 20 });
    setMedia({ "(hover: hover) and (pointer: fine)": true });
    render(<HeroFieldEffect {...PROPS} />);

    // cellWidth = 40/4 = 10, cellHeight = 20/2 = 10. This lands squarely in
    // the cell at column 2, row 0 — a '#' in "..##\n..##" — at distance 0.
    await act(async () => {
      window.dispatchEvent(new MouseEvent("pointermove", { clientX: 25, clientY: 5 }));
    });
    await flushRaf();

    const centreCall = context.fillText.mock.calls.find(
      ([, x, y]) => x === 20 && y === 0,
    );
    // The previous effect substituted '@' here, which smudged the picture
    // under the cursor and was rejected. A spotlight repeats the glyph.
    expect(centreCall?.[0]).toBe("#");
  });

  it("never brightens a cell to full opacity, so the spotlight stays a light rather than a repaint", async () => {
    const alphas: number[] = [];
    const context = mockCanvas({ width: 40, height: 20 });
    context.fillText.mockImplementation(() => {
      alphas.push(context.globalAlpha);
    });
    setMedia({ "(hover: hover) and (pointer: fine)": true });
    render(<HeroFieldEffect {...PROPS} />);

    await act(async () => {
      window.dispatchEvent(new MouseEvent("pointermove", { clientX: 25, clientY: 5 }));
    });
    await flushRaf();

    expect(alphas.length).toBeGreaterThan(0);
    for (const alpha of alphas) {
      expect(alpha).toBeGreaterThan(0);
      expect(alpha).toBeLessThan(1);
    }
  });
});
