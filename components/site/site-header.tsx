"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { cn } from "../../lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { LogoAnimated } from "./logo-animated";
import { MobileDocsDrawer } from "./mobile-docs-drawer";
import { MobileMenu } from "./mobile-menu";
import { ProgressDots } from "./progress-dots";
import { GitHubStars } from "./github-stars";

const navigation = [
  { name: "Docs", href: "/docs" },
  { name: "Components", href: "/docs/components" },
  { name: "Examples", href: "/examples" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const isDocsPage = pathname?.startsWith("/docs");
  const isHomePage = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-background/80 backdrop-blur-xl",
        "border-b border-border/40"
      )}
    >
      <div className="container mx-auto max-w-7xl flex h-14 items-center px-4">
        {/* Left section: Logo + Nav (desktop) */}
        <div className="mr-4 hidden md:flex items-center">
          <Link href="/" className="mr-8 flex items-center gap-2.5">
            <LogoAnimated size={28} />
            <span className="font-semibold text-foreground">Mario Charts</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navigation.map((item) => {
              const isActive =
                item.href === "/docs"
                  ? pathname === "/docs" || pathname === "/docs/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3 py-1.5 text-sm font-medium rounded-md",
                    "transition-colors duration-150",
                    isActive
                      ? "text-foreground bg-foreground/5"
                      : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile: Menu trigger + Logo */}
        <div className="flex md:hidden items-center gap-2">
          {isDocsPage ? (
            <MobileDocsDrawer />
          ) : (
            <MobileMenu navigation={navigation} />
          )}

          <Link href="/" className="flex items-center gap-2">
            <LogoAnimated size={24} />
            <span className="font-semibold">Mario Charts</span>
          </Link>
        </div>

        {/* Right section: Progress dots, Theme, GitHub */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Progress dots - only on homepage, hidden on mobile */}
          {isHomePage && (
            <div className="hidden lg:flex items-center mr-2">
              <ProgressDots
                segments={4}
                labels={["Hero", "Features", "Charts", "Footer"]}
              />
            </div>
          )}

          {/* Theme toggle */}
          <ThemeToggle />

          {/* GitHub stars - full on desktop, icon only on mobile */}
          <div className="hidden sm:block">
            <GitHubStars />
          </div>

          {/* Mobile: just GitHub icon */}
          <motion.a
            href="https://github.com/yuribodo/mariocharts"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "sm:hidden inline-flex items-center justify-center",
              "h-10 w-10 rounded-full",
              "text-foreground/70 hover:text-foreground",
              "hover:bg-foreground/5 active:bg-foreground/10",
              "transition-colors duration-200"
            )}
            whileTap={{ scale: 0.92 }}
          >
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="sr-only">GitHub</span>
          </motion.a>
        </div>
      </div>
    </header>
  );
}
