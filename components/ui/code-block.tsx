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
type CodeTheme = "github-light" | "dracula";

interface HighlightedCode {
  html: string;
  theme: CodeTheme;
}

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
  const [highlightedCode, setHighlightedCode] = useState<HighlightedCode | null>(null);
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

        const theme: CodeTheme = resolvedTheme === "dark" ? "dracula" : "github-light";
        const html = highlighter.codeToHtml(code, {
          lang: language,
          theme,
          transformers: [
            {
              pre(node) {
                node.properties.style = "";
                node.properties.class = "shiki-themed";
              },
            },
          ],
        });

        if (!cancelled) setHighlightedCode({ html, theme });
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
  const targetTheme: CodeTheme = resolvedTheme === "dark" ? "dracula" : "github-light";
  const displayTheme = highlightedCode?.theme ?? targetTheme;
  const isDarkCode = displayTheme === "dracula";

  return (
    <div
      className={cn(
        "my-6 overflow-hidden rounded-md border",
        isDarkCode ? "border-[#44475a]" : "border-[#d0d7de]",
        className,
      )}
    >
      <div className={cn(
        "flex min-h-11 items-center justify-between border-b px-3",
        isDarkCode ? "border-[#44475a] bg-[#21222c]" : "border-[#d0d7de] bg-[#eef1f4]",
      )}>
        <span className={cn(
          "font-mono text-xs font-medium",
          isDarkCode ? "text-[#bd93f9]" : "text-[#57606a]",
        )}>
          {languageLabels[language] ?? language}
        </span>
        <button
          type="button"
          onClick={copyToClipboard}
          className={cn(
            "flex size-9 items-center justify-center rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isDarkCode
              ? "text-[#f8f8f2] hover:bg-[#44475a]"
              : "text-[#57606a] hover:bg-white hover:text-[#24292f]",
          )}
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
          className={cn(
            "[&>pre]:m-0 [&>pre]:overflow-x-auto [&>pre]:border-none [&>pre]:p-5 [&>pre]:text-sm [&_code]:font-mono",
            isDarkCode ? "[&>pre]:bg-[#282a36]" : "[&>pre]:bg-[#f6f8fa]",
          )}
          dangerouslySetInnerHTML={{ __html: highlightedCode.html }}
        />
      ) : (
        <pre className={cn(
          "m-0 overflow-x-auto border-none p-5 text-sm",
          isDarkCode ? "bg-[#282a36]" : "bg-[#f6f8fa]",
        )}>
          <code className={cn(
            "font-mono",
            isDarkCode ? "text-[#f8f8f2]" : "text-[#24292f]",
          )}>{code}</code>
        </pre>
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}
