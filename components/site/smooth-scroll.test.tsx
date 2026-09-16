import { useEffect, useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { SmoothScroll } from "./smooth-scroll";

jest.mock("lenis/dist/lenis.css", () => ({}));
jest.mock("lenis/react", () => ({ ReactLenis: () => null }));

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
  jest.restoreAllMocks();
});
