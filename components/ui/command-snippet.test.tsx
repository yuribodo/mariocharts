import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { CommandSnippet } from "./command-snippet";

describe("CommandSnippet", () => {
  const writeText = jest.fn<Promise<void>, [string]>();

  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  it("copies the complete command and announces success", async () => {
    render(<CommandSnippet command="npx mario-charts@latest init" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy command" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("npx mario-charts@latest init");
    });
    expect(screen.getByRole("status")).toHaveTextContent("Command copied");
  });

  it("keeps the command selectable when copying fails", async () => {
    writeText.mockRejectedValueOnce(new Error("Clipboard unavailable"));
    render(<CommandSnippet command="npm run dev" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy command" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Unable to copy command",
    );
    expect(screen.getByText("npm run dev").tagName).toBe("CODE");
  });
});
