import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

/**
 * Map Accept-negotiation path segments to a file under public/.
 * Empty segments → public/index.md. Rejects traversal outside public/.
 */
export function resolveMarkdownFile(
  segments: string[] | undefined,
): string | null {
  const relative =
    !segments || segments.length === 0 ? "index.md" : `${segments.join("/")}.md`;

  if (relative.includes("\0") || path.isAbsolute(relative)) return null;

  const resolved = path.resolve(PUBLIC_DIR, relative);
  const relativeToPublic = path.relative(PUBLIC_DIR, resolved);
  if (
    relativeToPublic.startsWith("..") ||
    path.isAbsolute(relativeToPublic) ||
    !relativeToPublic.endsWith(".md")
  ) {
    return null;
  }

  return resolved;
}
