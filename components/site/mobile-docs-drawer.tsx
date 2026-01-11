"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlass, X, CaretRight, List } from "@phosphor-icons/react";

import { cn } from "../../lib/utils";
import { Logo } from "./logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

interface SidebarNavItem {
  title: string;
  href: string;
  children?: SidebarNavItem[];
  disabled?: boolean;
}

const sidebarNavItems: SidebarNavItem[] = [
  {
    title: "Getting Started",
    href: "#",
    children: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
    ],
  },
  {
    title: "Components",
    href: "#",
    children: [
      { title: "Bar Chart", href: "/docs/components/bar-chart" },
      { title: "Line Chart", href: "/docs/components/line-chart" },
      { title: "Pie Chart", href: "/docs/components/pie-chart" },
      { title: "Radar Chart", href: "/docs/components/radar-chart" },
      { title: "Scatter Plot", href: "/docs/components/scatter-plot" },
      { title: "Stacked Bar Chart", href: "/docs/components/stacked-bar-chart" },
    ],
  },
];

export function MobileDocsDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    const expanded: string[] = ["Components"];
    sidebarNavItems.forEach((section) => {
      if (section.children?.some((child) => child.href === pathname)) {
        if (!expanded.includes(section.title)) {
          expanded.push(section.title);
        }
      }
    });
    return expanded;
  });

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return sidebarNavItems;

    const query = searchQuery.toLowerCase();
    const filtered: SidebarNavItem[] = [];

    sidebarNavItems.forEach((section) => {
      if (section.title.toLowerCase().includes(query)) {
        filtered.push(section);
        return;
      }

      if (section.children) {
        const matchingChildren = section.children.filter(
          (child) =>
            child.title.toLowerCase().includes(query) ||
            child.href.toLowerCase().includes(query)
        );

        if (matchingChildren.length > 0) {
          filtered.push({ ...section, children: matchingChildren });
        }
      }
    });

    return filtered;
  }, [searchQuery]);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionTitle)
        ? prev.filter((title) => title !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-md p-2.5 min-h-11 min-w-11 text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground md:hidden touch-manipulation active:bg-muted/80"
          aria-label="Open navigation menu"
        >
          <List size={24} aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 overflow-hidden">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Logo size={20} />
            <span>Mario Charts</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-65px)] overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <MagnifyingGlass
                size={16}
                className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "flex h-11 w-full rounded-md border border-input bg-transparent pl-8 pr-8 py-2 text-base shadow-sm transition-colors",
                  "placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                )}
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-3 h-5 w-5 text-muted-foreground hover:text-foreground min-h-11 min-w-11 flex items-center justify-center -mr-2"
                  >
                    <X size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {filteredItems.map((section) => {
                const isExpanded = expandedSections.includes(section.title);
                const hasChildren =
                  section.children && section.children.length > 0;

                return (
                  <div key={section.title}>
                    {hasChildren ? (
                      <button
                        onClick={() => toggleSection(section.title)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-3 py-2.5 min-h-11 text-sm font-medium transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          "active:bg-accent/80 touch-manipulation"
                        )}
                      >
                        <span>{section.title}</span>
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                        >
                          <CaretRight
                            size={16}
                            className="text-muted-foreground"
                          />
                        </motion.div>
                      </button>
                    ) : (
                      <Link
                        href={section.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex w-full items-center rounded-md px-3 py-2.5 min-h-11 text-sm font-medium",
                          pathname === section.href
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          "active:bg-accent/80 touch-manipulation"
                        )}
                      >
                        {section.title}
                      </Link>
                    )}

                    <AnimatePresence initial={false}>
                      {hasChildren && isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="ml-4 space-y-1 border-l border-border pl-4 pt-2">
                            {section.children?.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={handleLinkClick}
                                className={cn(
                                  "flex w-full items-center rounded-md px-3 py-2.5 min-h-11 text-sm transition-colors",
                                  pathname === child.href
                                    ? "bg-accent text-accent-foreground font-medium"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                  child.disabled &&
                                    "cursor-not-allowed opacity-60",
                                  "active:bg-accent/80 touch-manipulation"
                                )}
                                aria-disabled={child.disabled}
                              >
                                {child.title}
                                {child.disabled && (
                                  <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs">
                                    Soon
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* No Results */}
            <AnimatePresence>
              {searchQuery && filteredItems.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="px-2 py-8 text-center text-sm text-muted-foreground"
                >
                  <p>No results found</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-xs text-primary hover:underline touch-manipulation"
                  >
                    Clear search
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
