"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  LayoutGroup,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { cn } from "../../lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { LogoAnimated } from "./logo-animated";
import { MobileDocsDrawer } from "./mobile-docs-drawer";
import { MobileMenu } from "./mobile-menu";
import { GitHubStars } from "./github-stars";
import { MarioStar } from "./mario-star";

const navigation = [
  { name: "Charts", href: "/docs/components" },
  { name: "Examples", href: "/examples" },
  { name: "Docs", href: "/docs" },
] as const;

const ENTER_EASE = [0.16, 1, 0.3, 1] as const;

const headerVariants: Variants = {
  hidden: {},
  shown: {
    transition: { staggerChildren: 0.06, delayChildren: 0.02 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: ENTER_EASE },
  },
};

function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/docs") return pathname === "/docs" || pathname === "/docs/";
  return pathname.startsWith(href);
}

/**
 * Wait for the world entrance to release the document (or conclude it will
 * never claim it) before the header plays its enter motion. The header lives
 * in the root layout — above the landing provider — so it watches the html
 * attribute instead of reading entrance context.
 */
function useHeaderEntrance(pathname: string | null, reduceMotion: boolean) {
  const [shown, setShown] = useState(reduceMotion);

  useLayoutEffect(() => {
    if (reduceMotion) {
      setShown(true);
      return;
    }

    const root = document.documentElement;
    let observer: MutationObserver | null = null;
    let frame = 0;
    let cancelled = false;

    const reveal = () => {
      if (!cancelled) setShown(true);
    };

    const watchUntilReleased = () => {
      if (!root.hasAttribute("data-world-entering")) {
        reveal();
        return;
      }
      setShown(false);
      observer = new MutationObserver(() => {
        if (!root.hasAttribute("data-world-entering")) {
          reveal();
          observer?.disconnect();
        }
      });
      observer.observe(root, {
        attributes: true,
        attributeFilter: ["data-world-entering"],
      });
    };

    if (pathname === "/") {
      // Landing may set data-world-entering in a later layout effect this frame.
      frame = requestAnimationFrame(watchUntilReleased);
    } else {
      watchUntilReleased();
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [pathname, reduceMotion]);

  return shown;
}

export function SiteHeader() {
  const pathname = usePathname();
  const isDocsPage = pathname?.startsWith("/docs");
  const shouldReduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const shown = useHeaderEntrance(pathname, Boolean(shouldReduceMotion));

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <motion.header
      data-site-header
      {...(scrolled ? { "data-scrolled": "" } : {})}
      {...(shown ? { "data-revealed": "" } : {})}
      {...(shouldReduceMotion ? {} : { variants: headerVariants })}
      initial={shouldReduceMotion ? false : "hidden"}
      animate={shown ? "shown" : "hidden"}
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-transparent bg-background/70 backdrop-blur-xl",
        "transition-[background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        scrolled &&
          "border-border/80 bg-background/85 shadow-[0_1px_0_0_oklch(0_0_0/0.04)]",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <motion.div
          {...(shouldReduceMotion ? {} : { variants: itemVariants })}
          className="hidden items-center md:flex"
        >
          <Link
            href="/"
            className="mr-8 flex items-center gap-2.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogoAnimated size={26} />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Mario Charts
            </span>
          </Link>

          <LayoutGroup id="site-nav">
            <nav
              aria-label="Primary navigation"
              className="flex items-center gap-0.5"
            >
              {navigation.map((item) => {
                const active = isNavActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "site-nav-link relative px-3 py-2 text-sm font-medium",
                      "transition-colors duration-200 ease-out",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.name}
                    {active ? (
                      shouldReduceMotion ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-3 -bottom-px h-[1.5px] rounded-full bg-foreground"
                        />
                      ) : (
                        <motion.span
                          layoutId="site-nav-indicator"
                          aria-hidden="true"
                          className="absolute inset-x-3 -bottom-px h-[1.5px] rounded-full bg-foreground"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 34,
                            mass: 0.7,
                          }}
                        />
                      )
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </LayoutGroup>
        </motion.div>

        <motion.div
          {...(shouldReduceMotion ? {} : { variants: itemVariants })}
          className="flex min-w-0 items-center gap-2 md:hidden"
        >
          {isDocsPage ? (
            <MobileDocsDrawer />
          ) : (
            <MobileMenu navigation={navigation} />
          )}

          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogoAnimated size={22} />
            <span className="truncate text-sm font-semibold tracking-tight">
              Mario Charts
            </span>
          </Link>
        </motion.div>

        <motion.div
          {...(shouldReduceMotion ? {} : { variants: itemVariants })}
          className="ml-auto flex items-center gap-0.5 sm:gap-1"
        >
          <ThemeToggle />
          <div className="hidden sm:block">
            <GitHubStars />
          </div>
          <a
            href="https://github.com/yuribodo/mariocharts"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "inline-flex size-9 items-center justify-center sm:hidden",
              "rounded-full",
              "transition-colors duration-200 hover:bg-foreground/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "touch-manipulation",
            )}
          >
            <MarioStar size={20} />
            <span className="sr-only">Star Mario Charts on GitHub</span>
          </a>
        </motion.div>
      </div>
    </motion.header>
  );
}
