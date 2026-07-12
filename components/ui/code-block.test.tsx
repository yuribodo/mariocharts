import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { CodeBlock } from "./code-block";

const dispose = jest.fn();
const codeToHtml = jest.fn(() => "<pre><code>const value = 1;</code></pre>");

jest.mock("shiki", () => ({
  createHighlighter: jest.fn(async () => ({ codeToHtml, dispose })),
}));

jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "dark" }),
}));

describe("CodeBlock", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  it("keeps the copy action visible and announces success", async () => {
    render(<CodeBlock code="const value = 1;" language="typescript" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "const value = 1;",
      );
    });
    expect(screen.getByRole("status")).toHaveTextContent("Code copied");
  });

  it("highlights with the resolved theme and disposes the highlighter", async () => {
    const { unmount } = render(
      <CodeBlock code="const value = 1;" language="typescript" />,
    );

    await waitFor(() => {
      expect(codeToHtml).toHaveBeenCalledWith(
        "const value = 1;",
        expect.objectContaining({ theme: "github-dark" }),
      );
    });
    unmount();
    expect(dispose).toHaveBeenCalled();
  });
});
