import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { resolveMarkdownFile } from "@/lib/resolve-markdown-file";

export const dynamic = "force-static";

const MARKDOWN_HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
  Vary: "Accept",
  "Cache-Control": "public, max-age=60, stale-while-revalidate=86400",
} as const;

export async function GET(
  _request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path: segments } = await context.params;
  const filePath = resolveMarkdownFile(segments);
  if (!filePath) {
    return new NextResponse("Not Found\n", {
      status: 404,
      headers: MARKDOWN_HEADERS,
    });
  }

  try {
    const body = await readFile(filePath, "utf8");
    return new NextResponse(body, { status: 200, headers: MARKDOWN_HEADERS });
  } catch {
    return new NextResponse("Not Found\n", {
      status: 404,
      headers: MARKDOWN_HEADERS,
    });
  }
}
