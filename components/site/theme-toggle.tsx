"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

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
    const next = isDark ? "light" : "dark";
    const root = document.documentElement;

    const apply = () => {
      root.classList.toggle("dark", next === "dark");
      setTheme(next);
    };

    if (prefersReducedMotion() || !document.startViewTransition) {
      apply();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    root.style.setProperty(
      "--theme-x",
      `${rect.left + rect.width / 2}px`,
    );
    root.style.setProperty(
      "--theme-y",
      `${rect.top + rect.height / 2}px`,
    );

    document.startViewTransition(apply);
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex size-9 items-center justify-center",
        "rounded-full text-muted-foreground",
        "transition-colors duration-200 ease-out",
        "hover:bg-foreground/5 hover:text-foreground",
        "active:bg-foreground/10",
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
