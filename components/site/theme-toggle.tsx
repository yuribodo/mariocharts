"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants for icon transitions
const iconVariants = {
  initial: {
    scale: 0,
    rotate: -180,
    opacity: 0,
  },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    scale: 0,
    rotate: 180,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
  hover: {
    scale: 1.1,
    rotate: 15,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div 
        className={cn(
          "h-9 w-9 rounded-md border border-input bg-background shadow-sm",
          className
        )}
      />
    );
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    // Use View Transitions API - CSS will handle the animation
    document.startViewTransition(() => {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      setTheme(newTheme);
    });
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={cn(
        "relative hover:cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      type="button"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <motion.div
            key="sun"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            whileHover="hover"
            className="absolute theme-toggle-icon"
          >
            <Sun className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            whileHover="hover"
            className="absolute theme-toggle-icon"
          >
            <Moon className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </motion.button>
  );
}