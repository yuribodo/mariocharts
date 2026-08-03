"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TerminalLinkProps {
  href: string;
  children: string;
  external?: boolean;
  className?: string;
}

/** ms per glyph while the hover retype runs. */
const TYPE_MS = 28;

/**
 * Terminal-style link.
 *
 * Hover retypes the label without wiping it first — a ghost of the full word
 * stays put so the row never collapses, and the bright glyphs paint over it.
 * A caret tracks the bright edge; an underline draws in underneath.
 */
export function TerminalLink({
  href,
  children,
  external = false,
  className,
}: TerminalLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [typedLength, setTypedLength] = useState(children.length);
  const shouldReduceMotion = useReducedMotion();
  const frameRef = useRef(0);
  const startedRef = useRef(0);

  const prefix = external ? "@" : "./";
  const fullText = children;

  useEffect(() => {
    cancelAnimationFrame(frameRef.current);

    if (shouldReduceMotion) {
      setTypedLength(fullText.length);
      return undefined;
    }

    if (!isHovered) {
      setTypedLength(fullText.length);
      return undefined;
    }

    setTypedLength(0);
    startedRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startedRef.current;
      const next = Math.min(fullText.length, Math.floor(elapsed / TYPE_MS) + 1);
      setTypedLength(next);
      if (next < fullText.length) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isHovered, fullText, shouldReduceMotion]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const bright = fullText.slice(0, typedLength);
  const dim = fullText.slice(typedLength);
  const showCaret = isHovered && !shouldReduceMotion;

  const content = (
    <span
      className={cn(
        "group relative inline-flex items-baseline font-mono text-sm",
        "text-muted-foreground transition-colors duration-200 ease-out",
        "hover:text-foreground",
        "focus-visible:text-foreground focus-visible:outline-none",
        className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="sr-only">{fullText}</span>

      <span
        aria-hidden="true"
        className={cn(
          "mr-0.5 text-muted-foreground transition-opacity duration-200 ease-out",
          isHovered ? "opacity-60" : "opacity-70",
        )}
      >
        {prefix}
      </span>

      <span aria-hidden="true" className="relative inline-flex items-baseline">
        {/*
          Ghost keeps the full measure while the bright run types over it —
          that is what stopped the old hover from collapsing to zero width.
        */}
        <span className="text-muted-foreground opacity-35">{fullText}</span>
        <span className="absolute inset-0 flex items-baseline text-foreground">
          <span>{bright}</span>
          {showCaret ? (
            <span
              className="terminal-link-caret ml-px inline-block h-[1em] w-[2px] translate-y-[0.08em] bg-foreground"
              style={{ opacity: typedLength < fullText.length ? 1 : undefined }}
            />
          ) : null}
          <span className="text-transparent">{dim}</span>
        </span>
      </span>

      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -bottom-0.5 left-0 h-px origin-left bg-foreground opacity-70",
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isHovered ? "scale-x-100" : "scale-x-0",
        )}
        style={{ width: "100%" }}
      />
    </span>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {content}
    </Link>
  );
}
