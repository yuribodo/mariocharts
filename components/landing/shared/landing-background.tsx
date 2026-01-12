"use client";

import { cn } from "@/lib/utils";

interface LandingBackgroundProps {
  className?: string;
}

export function LandingBackground({ className }: LandingBackgroundProps) {
  const dotPattern =
    "radial-gradient(rgb(var(--pattern-fg) / 0.14) 1px, transparent 0)";
  const diagonalPattern =
    "repeating-linear-gradient(315deg, rgb(var(--pattern-fg) / 0.1) 0, rgb(var(--pattern-fg) / 0.1) 1px, transparent 0, transparent 50%)";
  const gridPattern =
    "linear-gradient(to right, rgb(var(--pattern-fg) / 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--pattern-fg) / 0.12) 1px, transparent 1px)";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-background" />

      <div
        className="absolute inset-0 opacity-[0.7] dark:opacity-[0.5]"
        style={{
          backgroundImage: dotPattern,
          backgroundSize: "10px 10px",
          backgroundPosition: "center",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.3] dark:opacity-[0.22]"
        style={{
          backgroundImage: diagonalPattern,
          backgroundSize: "10px 10px",
          backgroundPosition: "center",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.25]"
        style={{
          backgroundImage: gridPattern,
          backgroundSize: "80px 80px",
          backgroundPosition: "center",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 45% at 50% 0%, rgb(var(--pattern-fg) / 0.12), transparent 60%)",
        }}
      />
    </div>
  );
}
