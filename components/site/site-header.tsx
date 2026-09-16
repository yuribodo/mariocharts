"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
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
const reducedItemVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  shown: { opacity: 1, y: 0, transition: { duration: 0 } },
};

function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  const matches = (section: string) =>
    pathname === section || pathname.startsWith(`${section}/`);
  if (href === "/docs") return matches("/docs") && !matches("/docs/components");
  return matches(href);
}

/** Keep indicator coordinates local to the nav, independent of document scroll. */
function PrimaryNavigation({ pathname }: { pathname: string | null }) {
  const navRef = useRef<HTMLElement>(null);
  const keyboardNavigation = useRef(false);
  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
    animate: boolean;
  } | null>(null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const measure = (animate = false) => {
      const active = nav.querySelector<HTMLAnchorElement>(
        '[aria-current="page"]',
      );
      if (!active || nav.offsetWidth === 0) {
        setIndicator(null);
        return;
      }
      const style = getComputedStyle(active);
      const leftPadding = parseFloat(style.paddingLeft);
      const rightPadding = parseFloat(style.paddingRight);
      const left = active.offsetLeft + leftPadding;
      const width = active.offsetWidth - leftPadding - rightPadding;
      setIndicator((previous) => {
        if (previous?.left === left && previous.width === width)
          return previous;
        return {
          left,
          width,
          animate: animate && previous !== null && !keyboardNavigation.current,
        };
      });
    };

    measure(true);
    const observer = new ResizeObserver(() => measure());
    observer.observe(nav);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <nav
      ref={navRef}
      aria-label="Primary navigation"
      className="relative flex items-center gap-0.5"
      onPointerDown={() => {
        keyboardNavigation.current = false;
      }}
      onKeyDown={() => {
        keyboardNavigation.current = true;
      }}
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
          </Link>
        );
      })}
      <span
        data-nav-indicator
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -bottom-px left-0 h-[1.5px] w-px origin-left bg-foreground",
          indicator?.animate
            ? "transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            : "transition-none",
        )}
        style={{
          opacity: indicator ? 1 : 0,
          transform: indicator
            ? `translateX(${indicator.left}px) scaleX(${indicator.width})`
            : "none",
        }}
      />
    </nav>
  );
}

/**
 * Wait for the world entrance to release the document (or conclude it will
 * never claim it) before the header plays its enter motion. The header lives
 * in the root layout — above the landing provider — so it watches the html
 * attribute instead of reading entrance context.
 */
function useHeaderEntrance(pathname: string | null, reduceMotion: boolean) {
  const [shown, setShown] = useState(false);

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
  const preferredReducedMotion = useReducedMotion();
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  useLayoutEffect(() => {
    setShouldReduceMotion(Boolean(preferredReducedMotion));
  }, [preferredReducedMotion]);
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
          variants={shouldReduceMotion ? reducedItemVariants : itemVariants}
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

          <PrimaryNavigation pathname={pathname} />
        </motion.div>

        <motion.div
          variants={shouldReduceMotion ? reducedItemVariants : itemVariants}
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
          variants={shouldReduceMotion ? reducedItemVariants : itemVariants}
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
