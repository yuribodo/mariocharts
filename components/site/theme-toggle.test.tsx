import { act, fireEvent, render, screen } from "@testing-library/react";

import { ThemeToggle } from "./theme-toggle";

const setTheme = jest.fn();
let mockResolvedTheme = "dark";

jest.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme,
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockResolvedTheme = "dark";
    setTheme.mockClear();
    document.documentElement.classList.add("dark");
    delete (document as { startViewTransition?: unknown }).startViewTransition;
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
    document
      .querySelectorAll("[data-theme-transition-lock]")
      .forEach((node) => node.remove());
  });

  it("switches to light without a view transition when the API is missing", async () => {
    render(<ThemeToggle />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /switch to light/i }));
    });

    expect(setTheme).toHaveBeenCalledWith("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("reveals the next theme from the click through startViewTransition", async () => {
    const animate = jest.fn();
    const ready = Promise.resolve();
    const finished = Promise.resolve();
    const startViewTransition = jest.fn((update: () => void) => {
      update();
      return { ready, finished };
    });

    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: startViewTransition,
    });
    Object.defineProperty(document.documentElement, "animate", {
      configurable: true,
      value: animate,
    });

    render(<ThemeToggle />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /switch to light/i }), {
        clientX: 80,
        clientY: 24,
        detail: 1,
      });
      await ready;
      await finished;
    });

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(setTheme).toHaveBeenCalledWith("light");
    expect(animate).toHaveBeenCalledWith(
      {
        clipPath: [
          "circle(0px at 80px 24px)",
          expect.stringMatching(/^circle\(.+px at 80px 24px\)$/),
        ],
      },
      expect.objectContaining({
        duration: 400,
        pseudoElement: "::view-transition-new(root)",
      }),
    );
  });

  it("ignores a second click while a view transition is in flight", async () => {
    let resolveFinished: () => void = () => {};
    const finished = new Promise<void>((resolve) => {
      resolveFinished = resolve;
    });
    const startViewTransition = jest.fn((update: () => void) => {
      update();
      return { ready: Promise.resolve(), finished };
    });

    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: startViewTransition,
    });
    Object.defineProperty(document.documentElement, "animate", {
      configurable: true,
      value: jest.fn(),
    });

    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /switch to light/i });

    await act(async () => {
      fireEvent.click(button, { clientX: 10, clientY: 10, detail: 1 });
    });
    await act(async () => {
      fireEvent.click(button, { clientX: 10, clientY: 10, detail: 1 });
    });

    expect(startViewTransition).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFinished();
      await finished;
    });
  });
});
