"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

interface TOCItem {
  id: string;
  title: string;
  level: 2 | 3 | 4; // h2, h3, h4
}

interface TableOfContentsProps {
  className?: string;
}

export function TableOfContents({ className = "" }: TableOfContentsProps) {
  const pathname = usePathname();
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // Generate TOC from page headings
  const generateTOC = useCallback(() => {
    const headings = document.querySelectorAll('h2, h3, h4');
    const items: TOCItem[] = [];
    const usedIds = new Set<string>();

    headings.forEach((heading, index) => {
      let id = heading.id;
      
      if (!id && heading.textContent) {
        // Generate ID from text content
        id = heading.textContent.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]/g, '');
      }
      
      // Ensure unique ID
      if (!id) {
        id = `heading-${index}`;
      }
      
      let uniqueId = id;
      let counter = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${id}-${counter}`;
        counter++;
      }
      
      usedIds.add(uniqueId);
      
      // Set ID on heading if it doesn't have one
      if (!heading.id) {
        heading.id = uniqueId;
      }

      if (heading.textContent) {
        items.push({
          id: uniqueId,
          title: heading.textContent,
          level: parseInt(heading.tagName[1] || '2') as 2 | 3 | 4
        });
      }
    });

    setToc(items);
  }, []);

  // Intersection Observer for active section tracking
  // Re-run when pathname changes to regenerate TOC for new page
  useEffect(() => {
    // Small delay to ensure DOM is updated after navigation
    const timeoutId = setTimeout(() => {
      generateTOC();
    }, 100);

    const headings = document.querySelectorAll('h2, h3, h4');

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting);

        if (visibleEntries.length > 0) {
          // Find the topmost visible heading
          const topEntry = visibleEntries.reduce((top, entry) =>
            entry.boundingClientRect.top < top.boundingClientRect.top ? entry : top
          );

          setActiveId(topEntry.target.id);
        }
      },
      {
        rootMargin: '0% 0% -80% 0%',
        threshold: 0.5
      }
    );

    headings.forEach(heading => observer.observe(heading));

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [generateTOC, pathname]);

  // Smooth scroll to heading
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (toc.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="font-medium">On This Page</p>
      <ul className="m-0 list-none">
        {toc.map((item) => {
          const isActive = activeId === item.id;
          
          return (
            <li key={item.id} className={cn("mt-0 pt-2")}>
              <Link
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHeading(item.id);
                }}
                className={cn(
                  "inline-block no-underline transition-colors hover:text-foreground",
                  isActive ? "font-medium text-foreground" : "text-muted-foreground",
                  item.level === 3 && "pl-4",
                  item.level === 4 && "pl-8"
                )}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}