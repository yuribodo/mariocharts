"use client";

import { Braces, Code2, FileCode2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  AGENT_READY_BULLETS,
  AGENT_READY_EYEBROW,
  AGENT_READY_HEADLINE,
  AGENT_READY_SUPPORT,
} from "./agent-ready-content";
import { AgentReadyPrompt } from "./agent-ready-prompt";

interface AgentReadySectionProps {
  className?: string;
}

const BULLET_ICONS = [FileCode2, Code2, Braces] as const;

/**
 * Agent-ready landing section.
 *
 * Quiet proof that Mario Charts is easy for AI coding agents because the
 * source lives in the user's project — checklist + copyable prompt, no demo chart.
 */
export function AgentReadySection({ className }: AgentReadySectionProps) {
  return (
    <section
      aria-labelledby="agent-ready-title"
      className={cn("border-b py-16 lg:py-24", className)}
    >
      <div className="mx-auto max-w-2xl px-6">
        <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          {AGENT_READY_EYEBROW}
        </p>
        <h2
          id="agent-ready-title"
          className="mt-3 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl"
        >
          {AGENT_READY_HEADLINE}
        </h2>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {AGENT_READY_SUPPORT}
        </p>

        <ul className="mt-10 space-y-6">
          {AGENT_READY_BULLETS.map((bullet, index) => {
            const Icon = BULLET_ICONS[index] ?? FileCode2;

            return (
              <li key={bullet.title} className="flex gap-4">
                <span
                  className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border text-muted-foreground"
                  aria-hidden="true"
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {bullet.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {bullet.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-10">
          <AgentReadyPrompt />
        </div>
      </div>
    </section>
  );
}
