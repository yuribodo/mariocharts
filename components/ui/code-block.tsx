"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { createHighlighter } from "shiki";

import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

type CopyState = "idle" | "success" | "error";

const languageLabels: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
};

export function CodeBlock({
  code,
  language = "bash",
  className,
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    let highlighter: Awaited<ReturnType<typeof createHighlighter>> | null = null;

    const highlight = async () => {
      try {
        highlighter = await createHighlighter({
          themes: ["github-light", "dracula"],
          langs: [
            "javascript",
            "typescript",
            "jsx",
            "tsx",
            "bash",
            "json",
            "css",
            "html",
          ],
        });

        const html = highlighter.codeToHtml(code, {
          lang: language,
          theme: resolvedTheme === "dark" ? "dracula" : "github-light",
          transformers: [
            {
              pre(node) {
                node.properties.style = "";
                node.properties.class = "shiki-themed";
              },
            },
          ],
        });

        if (!cancelled) setHighlightedCode(html);
      } catch {
        if (!cancelled) setHighlightedCode(null);
      }
    };

    void highlight();

    return () => {
      cancelled = true;
      highlighter?.dispose();
    };
  }, [code, language, resolvedTheme]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const copyToClipboard = async () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);

    try {
      await navigator.clipboard.writeText(code);
      setCopyState("success");
    } catch {
      setCopyState("error");
    }

    resetTimer.current = setTimeout(() => setCopyState("idle"), 2000);
  };

  const status =
    copyState === "success"
      ? "Code copied"
      : copyState === "error"
        ? "Unable to copy code"
        : "";

  return (
    <div
      className={cn(
        "my-6 overflow-hidden rounded-md border dark:border-[#44475a]",
        className,
      )}
    >
      <div className="flex min-h-11 items-center justify-between border-b bg-muted px-3 dark:border-[#44475a] dark:bg-[#21222c]">
        <span className="font-mono text-xs font-medium text-muted-foreground dark:text-[#bd93f9]">
          {languageLabels[language] ?? language}
        </span>
        <button
          type="button"
          onClick={copyToClipboard}
          className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-[#f8f8f2] dark:hover:bg-[#44475a]"
          aria-label="Copy code"
        >
          {copyState === "success" ? (
            <Check size={15} aria-hidden="true" />
          ) : (
            <Copy size={15} aria-hidden="true" />
          )}
        </button>
      </div>
      {highlightedCode ? (
        <div
          className="[&>pre]:m-0 [&>pre]:overflow-x-auto [&>pre]:border-none [&>pre]:bg-card [&>pre]:p-5 [&>pre]:text-sm [&_code]:font-mono dark:[&>pre]:bg-[#282a36]"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      ) : (
        <pre className="m-0 overflow-x-auto border-none bg-card p-5 text-sm dark:bg-[#282a36]">
          <code className="font-mono text-foreground dark:text-[#f8f8f2]">{code}</code>
        </pre>
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}
