"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const THEME_REVEAL_MS = 400;
const THEME_REVEAL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function revealOrigin(event: React.MouseEvent<HTMLButtonElement>) {
  if (event.detail === 0 || (event.clientX === 0 && event.clientY === 0)) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  return { x: event.clientX, y: event.clientY };
}

function farthestCornerRadius(x: number, y: number) {
  return Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
}

function lockColorTransitions() {
  const style = document.createElement("style");
  style.setAttribute("data-theme-transition-lock", "");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(style);
  return () => style.remove();
}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isTransitioning = React.useRef(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn("size-9 shrink-0 rounded-full", className)}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isTransitioning.current) return;

    const next = isDark ? "light" : "dark";
    const root = document.documentElement;
    const unlock = lockColorTransitions();

    const apply = () => {
      root.classList.toggle("dark", next === "dark");
      setTheme(next);
    };

    if (prefersReducedMotion() || !document.startViewTransition) {
      apply();
      unlock();
      return;
    }

    const { x, y } = revealOrigin(event);
    const endRadius = farthestCornerRadius(x, y);

    isTransitioning.current = true;

    try {
      const transition = document.startViewTransition(apply);

      transition.ready
        .then(() => {
          root.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: THEME_REVEAL_MS,
              easing: THEME_REVEAL_EASE,
              pseudoElement: "::view-transition-new(root)",
            },
          );
        })
        .catch(() => {
          // View transition was skipped (rapid re-entry, hidden document).
        });

      transition.finished.finally(() => {
        unlock();
        isTransitioning.current = false;
      });
    } catch {
      unlock();
      isTransitioning.current = false;
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex size-9 items-center justify-center",
        "rounded-full text-muted-foreground",
        "transition-colors duration-200 ease-out",
        "hover:bg-foreground/5 hover:text-foreground",
        "active:bg-foreground/10 active:scale-[0.96]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      {shouldReduceMotion ? (
        isDark ? (
          <Moon className="size-4" strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Sun className="size-4" strokeWidth={1.5} aria-hidden="true" />
        )
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ opacity: 0, rotate: -50, scale: 0.75 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 50, scale: 0.75 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex"
            >
              <Moon className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ opacity: 0, rotate: 50, scale: 0.75 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -50, scale: 0.75 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex"
            >
              <Sun className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
