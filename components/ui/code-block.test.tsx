import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { CodeBlock } from "./code-block";

const dispose = jest.fn();
const codeToHtml = jest.fn(() => "<pre><code>const value = 1;</code></pre>");
let mockResolvedTheme = "dark";

jest.mock("shiki", () => ({
  createHighlighter: jest.fn(async () => ({ codeToHtml, dispose })),
}));

jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: mockResolvedTheme }),
}));

describe("CodeBlock", () => {
  beforeEach(() => {
    mockResolvedTheme = "dark";
    codeToHtml.mockClear();
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
        expect.objectContaining({ theme: "dracula" }),
      );
    });
    unmount();
    expect(dispose).toHaveBeenCalled();
  });

  it("uses explicit high-contrast surfaces with github-light tokens", async () => {
    mockResolvedTheme = "light";
    const { container } = render(
      <CodeBlock code="const value = 1;" language="typescript" />,
    );

    await waitFor(() => {
      expect(codeToHtml).toHaveBeenCalledWith(
        "const value = 1;",
        expect.objectContaining({ theme: "github-light" }),
      );
    });

    const frame = container.firstElementChild;
    expect(frame?.firstElementChild).toHaveClass("bg-[#eef1f4]");
    expect(frame?.querySelector("pre")?.parentElement).toHaveClass(
      "[&>pre]:bg-[#f6f8fa]",
    );
  });
});
