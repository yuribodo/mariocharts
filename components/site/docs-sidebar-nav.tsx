"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlass, X, CaretRight } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";

interface SidebarNavItem {
  title: string;
  href: string;
  children?: SidebarNavItem[];
  disabled?: boolean;
  external?: boolean;
}

const sidebarNavItems: SidebarNavItem[] = [
  {
    title: "Getting Started",
    href: "#",
    children: [
      {
        title: "Introduction",
        href: "/docs"
      },
      {
        title: "Installation", 
        href: "/docs/installation"
      }
    ]
  },
  {
    title: "Components",
    href: "#",
    children: [
      {
        title: "Bar Chart",
        href: "/docs/components/bar-chart"
      },
      {
        title: "Line Chart",
        href: "/docs/components/line-chart"
      },
      {
        title: "Pie Chart",
        href: "/docs/components/pie-chart"
      },
      {
        title: "Radar Chart",
        href: "/docs/components/radar-chart"
      },
      {
        title: "Scatter Plot",
        href: "/docs/components/scatter-plot"
      },
      {
        title: "Stacked Bar Chart",
        href: "/docs/components/stacked-bar-chart"
      },
      {
        title: "Gauge Chart",
        href: "/docs/components/gauge-chart"
      }
    ]
  }
];

const searchVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.2 }
  }
};

export function DocsSidebarNav() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    // Auto-expand section that contains current page
    const expanded: string[] = ["Components"]; // Always include Components
    sidebarNavItems.forEach(section => {
      if (section.children?.some(child => child.href === pathname)) {
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
    
    sidebarNavItems.forEach(section => {
      if (section.title.toLowerCase().includes(query)) {
        filtered.push(section);
        return;
      }
      
      if (section.children) {
        const matchingChildren = section.children.filter(child =>
          child.title.toLowerCase().includes(query) ||
          child.href.toLowerCase().includes(query)
        );
        
        if (matchingChildren.length > 0) {
          filtered.push({
            ...section,
            children: matchingChildren
          });
        }
      }
    });
    
    return filtered;
  }, [searchQuery]);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle)
        ? prev.filter(title => title !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="w-full">
      {/* Search */}
      <div className="pb-4">
        <motion.div 
          className="relative"
          variants={searchVariants}
          initial="hidden"
          animate="visible"
        >
          <MagnifyingGlass 
            size={16} 
            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-8 py-1 text-sm shadow-sm transition-colors",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearSearch}
                className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="pb-4">
        <div className="space-y-2">
          {filteredItems.map((section) => {
            const isExpanded = expandedSections.includes(section.title);
            const hasChildren = section.children && section.children.length > 0;
            
            return (
              <div key={section.title}>
                  {/* Section Header */}
                  {hasChildren ? (
                    <button
                      onClick={() => toggleSection(section.title)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      )}
                    >
                      <span>{section.title}</span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                      >
                        <CaretRight size={16} className="text-muted-foreground" />
                      </motion.div>
                    </button>
                  ) : (
                    <Link
                      href={section.href}
                      className={cn(
                        "flex w-full items-center rounded-md px-2 py-1.5 text-sm font-medium",
                        pathname === section.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      )}
                    >
                      {section.title}
                    </Link>
                  )}
                  
                  {/* Section Children */}
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
                            <div key={child.href}>
                              <Link
                                href={child.href}
                                className={cn(
                                  "flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors",
                                  pathname === child.href
                                    ? "bg-accent text-accent-foreground font-medium"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                  child.disabled && "cursor-not-allowed opacity-60",
                                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                )}
                                aria-disabled={child.disabled}
                              >
                                {child.title}
                                {child.disabled && (
                                  <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground no-underline group-hover:no-underline">
                                    Soon
                                  </span>
                                )}
                              </Link>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* No Results */}
      <AnimatePresence>
        {searchQuery && filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-2 py-4 text-center text-sm text-muted-foreground"
          >
            <p>No results found for "{searchQuery}"</p>
            <motion.button 
              onClick={clearSearch}
              className="mt-2 text-xs text-primary hover:underline"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear search
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}