"use client";

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
] as const;

/**
 * Landing Page Footer
 *
 * Terminal-style links over a clean, minimal layout. The two link groups are
 * separate navigation landmarks, each named after its visible heading.
 */
export function LandingFooter({ className }: LandingFooterProps) {
  return (
    <footer className={cn("relative border-t bg-background", className)}>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Mario Charts</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Copy-paste chart components. You own every line.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Navigation
            </h4>
            <nav aria-label="Navigation" className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <TerminalLink key={link.href} href={link.href}>
                  {link.label}
                </TerminalLink>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Connect
            </h4>
            <nav aria-label="Connect" className="flex flex-col gap-2">
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
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t pt-6">
          <p className="text-center font-mono text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Mario Charts
          </p>
        </div>
      </div>
    </footer>
  );
}
