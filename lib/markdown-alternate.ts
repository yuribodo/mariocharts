import type { Metadata } from "next";

/**
 * Build Metadata.alternates so HTML pages advertise their markdown twin.
 * Home uses /index.md; every other path appends .md (Resend-style).
 */
export function markdownAlternate(
  htmlPath: string,
): NonNullable<Metadata["alternates"]> {
  const normalized = htmlPath === "" ? "/" : htmlPath;
  const mdPath = normalized === "/" ? "/index.md" : `${normalized}.md`;
  return {
    canonical: normalized,
    types: {
      "text/markdown": mdPath,
    },
  };
}
