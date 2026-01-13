"use client";

import { cn } from "@/lib/utils";

interface DemoCardProps {
  children: React.ReactNode;
  className?: string | undefined;
  header: {
    icon?: React.ReactNode;
    title: string;
    badge?: string;
    action?: React.ReactNode;
  };
  footer?: React.ReactNode;
}

/**
 * Shared card wrapper for code demo section
 * Ensures consistent height and styling between cards
 */
export function DemoCard({ children, className, header, footer }: DemoCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          {header.icon}
          <span className="text-xs font-medium text-muted-foreground">
            {header.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {header.badge && (
            <span className="text-[10px] text-muted-foreground/60">
              {header.badge}
            </span>
          )}
          {header.action}
        </div>
      </div>

      {/* Content - grows to fill space */}
      <div className="relative flex-1">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="flex items-center justify-between border-t border-border/50 px-4 py-2.5">
          {footer}
        </div>
      )}
    </div>
  );
}
