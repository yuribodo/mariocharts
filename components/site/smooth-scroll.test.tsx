import { useEffect, useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { SmoothScroll } from "./smooth-scroll";

let mockPathname = "/docs/components/bar-chart";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

jest.mock("lenis/dist/lenis.css", () => ({}));
jest.mock("lenis/react", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Jest mock factory
  const React = require("react") as typeof import("react");
  const ReactLenis = React.forwardRef(() => null);
  ReactLenis.displayName = "ReactLenisMock";
  return { ReactLenis };
});

function mockMatchMedia(matches: boolean) {
  let updatePreference: () => void = () => {};
  jest.spyOn(window, "matchMedia").mockImplementation(
    () =>
      ({
        get matches() {
          return matches;
        },
        addEventListener: (_event: string, listener: () => void) => {
          updatePreference = listener;
        },
        removeEventListener: jest.fn(),
      }) as unknown as MediaQueryList,
  );
  return () => updatePreference();
}

beforeEach(() => {
  mockPathname = "/docs/components/bar-chart";
});

afterEach(() => {
  jest.restoreAllMocks();
});

it("preserves page state and DOM when enabling or disabling smooth scrolling", () => {
  let reduceMotion = false;
  let updatePreference: () => void = () => {};
  const removeListener = jest.fn();
  jest.spyOn(window, "matchMedia").mockImplementation(
    () =>
      ({
        get matches() {
          return reduceMotion;
        },
        addEventListener: (_event: string, listener: () => void) => {
          updatePreference = listener;
        },
        removeEventListener: removeListener,
      }) as unknown as MediaQueryList,
  );
  const mount = jest.fn();
  const cleanup = jest.fn();
  function Page() {
    const [count, setCount] = useState(0);
    useEffect(() => {
      mount();
      return cleanup;
    }, []);
    return <button onClick={() => setCount(count + 1)}>Count {count}</button>;
  }

  const { unmount } = render(
    <SmoothScroll>
      <Page />
    </SmoothScroll>,
  );
  expect(mount).toHaveBeenCalledTimes(1);
  const button = screen.getByRole("button");
  fireEvent.click(button);
  for (const preference of [true, false]) {
    act(() => {
      reduceMotion = preference;
      updatePreference();
    });
    expect(screen.getByRole("button")).toBe(button);
    expect(button).toHaveTextContent("Count 1");
    expect(cleanup).not.toHaveBeenCalled();
  }
  unmount();
  expect(cleanup).toHaveBeenCalledTimes(1);
  expect(removeListener).toHaveBeenCalled();
});

it("snaps instantly to the top when the route changes", () => {
  mockMatchMedia(false);
  const scrollTo = jest.fn();
  Object.defineProperty(window, "scrollTo", {
    configurable: true,
    writable: true,
    value: scrollTo,
  });

  const { rerender } = render(
    <SmoothScroll>
      <div>page</div>
    </SmoothScroll>,
  );
  // First paint never snaps — only transitions between routes do.
  expect(scrollTo).not.toHaveBeenCalled();

  mockPathname = "/docs/components/scatter-plot";
  rerender(
    <SmoothScroll>
      <div>page</div>
    </SmoothScroll>,
  );
  expect(scrollTo).toHaveBeenCalledWith(0, 0);
});
