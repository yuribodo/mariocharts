"use client";

import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

import { cn } from "@/lib/utils";
import { CommandSnippet } from "@/components/ui/command-snippet";

interface CTASectionProps {
  className?: string;
}

const CLI_COMMAND = "npx mario-charts@latest init";

export function CTASection({ className }: CTASectionProps) {
  return (
    <section
      aria-labelledby="cta-title"
      className={cn("border-t py-16 lg:py-24", className)}
    >
      <div className="mx-auto max-w-2xl px-6">
        <h2
          id="cta-title"
          className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl"
        >
          Install it and own the source.
        </h2>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          One command writes the components into your project. No runtime
          dependency on us, nothing to eject from later.
        </p>

        <div className="mt-8">
          <CommandSnippet command={CLI_COMMAND} />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/docs"
            className="group inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-[transform,opacity] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [@media(hover:hover)]:hover:opacity-90 motion-reduce:transition-none"
          >
            Read the Docs
            <ArrowRight
              className="size-4 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </Link>

          <a
            href="https://github.com/yuribodo/mariocharts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border px-5 text-sm font-medium text-foreground transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [@media(hover:hover)]:hover:bg-accent motion-reduce:transition-none"
          >
            <Github className="size-4" aria-hidden="true" />
            Star on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
