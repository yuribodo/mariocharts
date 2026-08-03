"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";
import { AGENT_READY_PROMPT } from "./agent-ready-content";

type CopyState = "idle" | "success" | "error";

interface AgentReadyPromptProps {
  className?: string;
}

export function AgentReadyPrompt({ className }: AgentReadyPromptProps) {
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
      await navigator.clipboard.writeText(AGENT_READY_PROMPT);
      setCopyState("success");
    } catch {
      setCopyState("error");
    }

    resetTimer.current = setTimeout(() => setCopyState("idle"), 2000);
  };

  const message =
    copyState === "success"
      ? "Prompt copied"
      : copyState === "error"
        ? "Unable to copy prompt"
        : "";

  return (
    <div className={cn("space-y-2", className)}>
      <span className="text-xs font-medium text-muted-foreground">
        Try this prompt
      </span>
      <div className="overflow-hidden rounded-md border bg-card">
        <div className="flex items-start gap-3 p-3 sm:p-4">
          <pre className="min-w-0 flex-1 whitespace-pre-wrap font-mono text-[13px] leading-6 text-foreground">
            {AGENT_READY_PROMPT}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="flex size-11 shrink-0 touch-manipulation items-center justify-center rounded-md text-muted-foreground transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)]:hover:bg-accent [@media(hover:hover)]:hover:text-foreground"
            aria-label="Copy prompt"
          >
            {copyState === "success" ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </div>
  );
}
