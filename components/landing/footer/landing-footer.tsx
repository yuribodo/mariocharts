"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TerminalLink } from "./terminal-link";

interface LandingFooterProps {
  className?: string;
}

const NAV_LINKS = [
  { href: "/docs", label: "docs" },
  { href: "/docs/components", label: "components" },
  { href: "/docs/installation", label: "installation" },
] as const;

const SOCIAL_LINKS = [
  { href: "https://github.com/yuribodo/mariocharts", label: "github", external: true },
  { href: "https://twitter.com", label: "twitter", external: true },
] as const;

/**
 * Landing Page Footer
 *
 * Creative footer with:
 * - Terminal-style links with typing effect
 * - Clean, minimal layout
 */
export function LandingFooter({ className }: LandingFooterProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <footer
      className={cn(
        "relative border-t border-border/50 bg-background",
        className
      )}
    >
      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Mario Charts</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Beautiful charts,
              <br />
              zero config.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
              Navigation
            </h4>
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <TerminalLink key={link.href} href={link.href}>
                  {link.label}
                </TerminalLink>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
              Connect
            </h4>
            <nav className="flex flex-col gap-2">
              {SOCIAL_LINKS.map((link) => (
                <TerminalLink
                  key={link.href}
                  href={link.href}
                  external={link.external}
                >
                  {link.label}
                </TerminalLink>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          className="mt-12 pt-6 border-t border-border/30"
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-center text-xs text-muted-foreground/60 font-mono">
            &copy; {new Date().getFullYear()} Mario Charts
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
