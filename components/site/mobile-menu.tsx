"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, List } from "@phosphor-icons/react";
import { useState, useEffect } from "react";

import { cn } from "../../lib/utils";
import { LogoAnimated } from "./logo-animated";
import { ThemeToggle } from "./theme-toggle";
import { GitHubStars } from "./github-stars";

interface MobileMenuProps {
  navigation: ReadonlyArray<{ name: string; href: string }>;
}

export function MobileMenu({ navigation }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const menuVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.15,
      },
    },
    open: {
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.15,
      },
    },
  };

  const logoVariants = {
    closed: {
      scale: 0,
      opacity: 0,
    },
    open: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.2,
        delay: shouldReduceMotion ? 0 : 0.1,
        ease: [0.76, 0, 0.24, 1],
      },
    },
  };

  const linkVariants = {
    closed: {
      y: 20,
      opacity: 0,
    },
    open: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.2,
        delay: shouldReduceMotion ? 0 : 0.15 + i * 0.08,
        ease: [0.76, 0, 0.24, 1],
      },
    }),
  };

  const footerVariants = {
    closed: {
      y: 20,
      opacity: 0,
    },
    open: {
      y: 0,
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.2,
        delay: shouldReduceMotion ? 0 : 0.15 + navigation.length * 0.08 + 0.1,
        ease: [0.76, 0, 0.24, 1],
      },
    },
  };

  return (
    <>
      {/* Menu trigger button */}
      <motion.button
        className={cn(
          "inline-flex items-center justify-center rounded-md p-2.5",
          "min-h-11 min-w-11 text-sm font-medium",
          "transition-colors hover:bg-foreground/5",
          "touch-manipulation active:bg-foreground/10",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "md:hidden"
        )}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} aria-hidden="true" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <List size={24} aria-hidden="true" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Fullscreen menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-background md:hidden"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
              <motion.button
                className={cn(
                  "inline-flex items-center justify-center rounded-md p-2.5",
                  "min-h-11 min-w-11 text-sm font-medium",
                  "transition-colors hover:bg-foreground/5",
                  "touch-manipulation active:bg-foreground/10"
                )}
                onClick={() => setIsOpen(false)}
                whileTap={{ scale: 0.95 }}
                aria-label="Close menu"
              >
                <X size={24} aria-hidden="true" />
              </motion.button>

              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2"
              >
                <span className="font-medium">Mario Charts</span>
              </Link>

              <div className="w-11" /> {/* Spacer for centering */}
            </div>

            {/* Content */}
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
              {/* Animated logo */}
              <motion.div
                variants={logoVariants}
                initial="closed"
                animate="open"
                className="mb-12"
              >
                <LogoAnimated size={64} />
              </motion.div>

              {/* Navigation links */}
              <nav className="flex flex-col items-center gap-8">
                {navigation.map((item, index) => {
                  const isActive = pathname?.startsWith(item.href);

                  return (
                    <motion.div
                      key={item.href}
                      custom={index}
                      variants={linkVariants}
                      initial="closed"
                      animate="open"
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-3xl font-medium tracking-tight",
                          "transition-all duration-200",
                          "hover:tracking-wide",
                          "active:scale-[0.98]",
                          isActive
                            ? "text-foreground"
                            : "text-foreground/60 hover:text-foreground"
                        )}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* GitHub link in menu */}
                <motion.div
                  custom={navigation.length}
                  variants={linkVariants}
                  initial="closed"
                  animate="open"
                >
                  <GitHubStars className="text-3xl" />
                </motion.div>
              </nav>
            </div>

            {/* Footer with theme toggle */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 flex items-center justify-center p-6 border-t border-border/50"
              variants={footerVariants}
              initial="closed"
              animate="open"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm text-foreground/60">Theme</span>
                <ThemeToggle />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
