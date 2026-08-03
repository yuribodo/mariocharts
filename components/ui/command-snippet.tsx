"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

interface CommandSnippetProps {
  command: string;
  label?: string;
  className?: string;
}

type CopyState = "idle" | "success" | "error";

export function CommandSnippet({
  command,
  label = "Install",
  className,
}: CommandSnippetProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const handleCopy = async () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);

    try {
      await navigator.clipboard.writeText(command);
      setCopyState("success");
    } catch {
      setCopyState("error");
    }

    resetTimer.current = setTimeout(() => setCopyState("idle"), 2000);
  };

  const message =
    copyState === "success"
      ? "Command copied"
      : copyState === "error"
        ? "Unable to copy command"
        : "";

  return (
    <div className={cn("space-y-2", className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex min-h-11 items-center gap-3 rounded-md border bg-card pl-3">
        <code className="min-w-0 flex-1 select-all overflow-x-auto whitespace-nowrap font-mono text-[13px] text-foreground">
          {command}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="flex size-11 shrink-0 touch-manipulation items-center justify-center border-l text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          aria-label="Copy command"
        >
          {copyState === "success" ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </div>
  );
}
