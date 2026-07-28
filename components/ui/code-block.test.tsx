import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { CodeBlock } from "./code-block";

const dispose = jest.fn();
const codeToHtml = jest.fn(
  (_code: string, _options: { transformers?: Array<{ line?: unknown }> }) =>
    "<pre><code>const value = 1;</code></pre>",
);
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
    dispose.mockClear();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  it("clears the cached highlighter promise after a rejection so a later call retries", async () => {
    const { createHighlighter } = jest.requireMock("shiki");
    const callsBefore = createHighlighter.mock.calls.length;

    createHighlighter.mockImplementationOnce(async () => {
      throw new Error("wasm load failed");
    });

    const { unmount } = render(
      <CodeBlock code="const c = 3;" language="typescript" />,
    );

    await waitFor(() => {
      expect(screen.getByText("const c = 3;")).toBeInTheDocument();
    });
    expect(createHighlighter.mock.calls.length).toBe(callsBefore + 1);
    unmount();

    render(<CodeBlock code="const d = 4;" language="typescript" />);

    await waitFor(() => {
      expect(codeToHtml).toHaveBeenCalledWith(
        "const d = 4;",
        expect.objectContaining({ theme: "dracula" }),
      );
    });
    expect(createHighlighter.mock.calls.length).toBe(callsBefore + 2);
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

  it("reuses one highlighter across instances", async () => {
    const { createHighlighter } = jest.requireMock("shiki");

    render(<CodeBlock code="const a = 1;" language="typescript" />);
    await waitFor(() => {
      expect(codeToHtml).toHaveBeenCalledWith(
        "const a = 1;",
        expect.objectContaining({ theme: "dracula" }),
      );
    });
    const callsAfterFirst = createHighlighter.mock.calls.length;

    render(<CodeBlock code="const b = 2;" language="typescript" />);
    await waitFor(() => {
      expect(codeToHtml).toHaveBeenCalledWith(
        "const b = 2;",
        expect.objectContaining({ theme: "dracula" }),
      );
    });

    expect(createHighlighter.mock.calls.length).toBe(callsAfterFirst);
  });

  it("keeps the shared highlighter alive after an instance unmounts", async () => {
    const { unmount } = render(
      <CodeBlock code="const value = 1;" language="typescript" />,
    );

    await waitFor(() => expect(codeToHtml).toHaveBeenCalled());
    unmount();

    expect(dispose).not.toHaveBeenCalled();
  });

  it("marks the requested lines through a shiki transformer", async () => {
    render(
      <CodeBlock
        code={"const a = 1;\nconst b = 2;"}
        language="typescript"
        highlightedLines={[2]}
      />,
    );

    await waitFor(() => expect(codeToHtml).toHaveBeenCalled());

    const options = codeToHtml.mock.calls.at(-1)?.[1];
    const lineTransformer = options?.transformers?.find(
      (transformer: { line?: unknown }) => typeof transformer.line === "function",
    );
    expect(lineTransformer).toBeDefined();

    const first = { properties: {} as Record<string, unknown> };
    const second = { properties: {} as Record<string, unknown> };
    const line = lineTransformer?.line as (
      node: { properties: Record<string, unknown> },
      line: number,
    ) => void;
    line(first, 1);
    line(second, 2);

    expect(first.properties["data-highlighted"]).toBeUndefined();
    expect(second.properties["data-highlighted"]).toBe("true");
  });

  it("reports a successful copy to its caller", async () => {
    const onCopy = jest.fn();
    render(
      <CodeBlock code="const value = 1;" language="typescript" onCopy={onCopy} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

    await waitFor(() => expect(onCopy).toHaveBeenCalledTimes(1));
  });

  it("does not report a copy that failed", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: jest.fn().mockRejectedValue(new Error("denied")) },
    });
    const onCopy = jest.fn();
    render(
      <CodeBlock code="const value = 1;" language="typescript" onCopy={onCopy} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Unable to copy code");
    });
    expect(onCopy).not.toHaveBeenCalled();
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
