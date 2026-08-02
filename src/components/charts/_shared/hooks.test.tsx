import { render, screen } from "@testing-library/react";

import { useContainerDimensions } from "./hooks";

function Probe() {
  const [ref, width] = useContainerDimensions();
  return (
    <div ref={ref}>
      <span data-testid="width">{width}</span>
    </div>
  );
}

describe("useContainerDimensions", () => {
  beforeAll(() => {
    // jsdom reports every element as 0x0, and the global ResizeObserver mock
    // never invokes its callback — so a width can only arrive here from the
    // measurement the hook takes itself when it attaches.
    Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ width: 320, height: 160, top: 0, left: 0, right: 320, bottom: 160 }),
    });
  });

  it("reports the width by the time the mounted tree is committed", () => {
    render(<Probe />);

    // Charts render a "Loading..." placeholder until this width is non-zero.
    // Deferring the first measurement to an animation frame strands every
    // chart whose container never resizes again after mount, because the
    // ResizeObserver only fires on later changes.
    expect(screen.getByTestId("width")).toHaveTextContent("320");
  });
});
