import path from "path";
import { resolveMarkdownFile } from "./resolve-markdown-file";

describe("resolveMarkdownFile", () => {
  it("maps empty path to public/index.md", () => {
    const resolved = resolveMarkdownFile(undefined);
    expect(resolved).toBe(path.join(process.cwd(), "public", "index.md"));
  });

  it("maps segments to a .md file under public/", () => {
    const resolved = resolveMarkdownFile(["docs", "components", "bar-chart"]);
    expect(resolved).toBe(
      path.join(process.cwd(), "public", "docs", "components", "bar-chart.md"),
    );
  });

  it("rejects path traversal", () => {
    expect(resolveMarkdownFile(["..", "package.json"])).toBeNull();
    expect(resolveMarkdownFile(["docs", "..", "..", "package.json"])).toBeNull();
  });
});
