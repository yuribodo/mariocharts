"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TerminalLinkProps {
  href: string;
  children: string;
  external?: boolean;
  className?: string;
}

/**
 * Terminal-style link with typing effect on hover
 *
 * - Prefix: ./ for internal, @ for external
 * - Hover: character-by-character typing animation
 * - Blinking cursor at the end
 * - Fixed width to prevent layout shift
 */
export function TerminalLink({
  href,
  children,
  external = false,
  className,
}: TerminalLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [typedLength, setTypedLength] = useState(children.length);
  const [cursorVisible, setCursorVisible] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const prefix = external ? "@" : "./";
  const fullText = children;

  // Clear any running interval
  const clearTypingInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Typing animation
  useEffect(() => {
    clearTypingInterval();

    if (shouldReduceMotion) {
      setTypedLength(fullText.length);
      return undefined;
    }

    if (isHovered) {
      // Start typing from 0
      setTypedLength(0);

      let currentIndex = 0;
      intervalRef.current = setInterval(() => {
        currentIndex++;
        if (currentIndex <= fullText.length) {
          setTypedLength(currentIndex);
        } else {
          clearTypingInterval();
        }
      }, 35);

      return clearTypingInterval;
    }

    // Not hovered - show full text immediately
    setTypedLength(fullText.length);
    return undefined;
  }, [isHovered, fullText, shouldReduceMotion, clearTypingInterval]);

  // Cursor blink
  useEffect(() => {
    if (!isHovered) {
      setCursorVisible(true);
      return undefined;
    }

    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);

    return () => clearInterval(interval);
  }, [isHovered]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const content = (
    <span
      className={cn(
        "group inline-flex items-center font-mono text-sm transition-colors duration-150",
        isHovered ? "text-foreground" : "text-muted-foreground",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="text-muted-foreground/60 transition-colors duration-150">
        {prefix}
      </span>
      <span className="relative">
        {/* Invisible text to maintain width */}
        <span className="invisible">{fullText}</span>
        {/* Visible typed text overlay */}
        <span className="absolute inset-0">
          {fullText.slice(0, typedLength)}
        </span>
        {/* Cursor */}
        {isHovered && (
          <span
            className={cn(
              "inline-block w-[1.5px] h-[1.1em] bg-foreground align-middle transition-opacity duration-100",
              cursorVisible ? "opacity-80" : "opacity-0"
            )}
            style={{
              position: "absolute",
              left: `${typedLength}ch`,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
        )}
      </span>
    </span>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className="inline-block">
      {content}
    </Link>
  );
}
