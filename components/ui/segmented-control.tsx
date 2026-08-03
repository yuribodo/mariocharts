"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly icon: LucideIcon;
}

/**
 * Two-option segmented control.
 *
 * The sliding indicator is sized for exactly two options
 * (`w-[calc(50%-0.375rem)]` inside a `grid-cols-2` track). Passing a different
 * number of options will misplace it.
 */
export function SegmentedControl<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string;
  description: string;
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
}) {
  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value));

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + options.length) % options.length;
    const nextOption = options[nextIndex];
    if (!nextOption) return;

    onChange(nextOption.value);
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button");
    buttons?.[nextIndex]?.focus();
  };

  return (
    <div>
      <span className="text-xs font-medium text-foreground">{label}</span>
      <div role="group" aria-label={label} className="relative mt-2 grid grid-cols-2 gap-1 rounded-md border bg-muted/45 p-1">
        <span
          aria-hidden="true"
          data-segmented-indicator={label}
          data-position={activeIndex === 0 ? "left" : "right"}
          className={cn(
            "pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.375rem)] rounded bg-background shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-transform duration-[180ms] ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
            activeIndex === 1 && "translate-x-[calc(100%+0.25rem)]",
          )}
        />
        {options.map((option, index) => {
          const Icon = option.icon;
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "relative z-10 inline-flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded text-xs font-medium transition-[color,opacity] duration-[180ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] motion-reduce:transition-none",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
      <span className="mt-1.5 block text-xs font-normal leading-5 text-muted-foreground">{description}</span>
    </div>
  );
}
