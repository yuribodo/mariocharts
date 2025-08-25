"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react";

interface BreadcrumbItem {
  title: string;
  href: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' }
  ];
  
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    let title = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    if (segment === 'docs') title = 'Documentation';
    if (segment === 'components') title = 'Components';
    
    breadcrumbs.push({
      title,
      href: currentPath,
      active: index === segments.length - 1
    });
  });
  
  return breadcrumbs;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const pathname = usePathname();
  const breadcrumbItems = items || generateBreadcrumbs(pathname);
  
  return (
    <nav 
      className={`flex items-center space-x-1 text-sm text-muted-foreground mb-6 ${className}`}
      aria-label="Breadcrumb"
    >
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <CaretRight 
              size={14} 
              className="mx-2 text-muted-foreground/60"
            />
          )}
          
          <div className="relative">
            {item.active ? (
              <span 
                className="text-foreground font-medium"
                aria-current="page"
              >
                {item.title}
              </span>
            ) : (
              <Link 
                href={item.href}
                className="hover:text-foreground transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-sm px-1"
              >
                {item.title}
              </Link>
            )}
          </div>
        </div>
      ))}
    </nav>
  );
}