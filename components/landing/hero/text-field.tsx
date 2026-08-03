import { Fragment, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

interface TextFieldProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  /** Naming the field makes it an image; leaving it unnamed makes it decoration. */
  label?: string;
  /** Per-row entrance delay. Zero — the default — opts the field out entirely. */
  rowDelayMs?: number;
}

/**
 * Renders ASCII art as one element per row.
 *
 * The split exists so the entrance can resolve the field in a wave rather than
 * fading it in as a block. It animates whole rows, not characters: per-cell
 * resolution would need one element per cell, which for the portrait is over
 * eight thousand elements — far more cost than the effect is worth. A row wave
 * already reads as the field writing itself.
 *
 * Server-renderable on purpose. No hooks, no browser APIs: the fields must be
 * in the HTML before any JavaScript runs, which is the whole reason the art is
 * generated at build time rather than drawn at runtime.
 */
export function TextField({
  text,
  className,
  style,
  label,
  rowDelayMs = 0,
}: TextFieldProps) {
  // Split, never trim. A blank row is a real row of the grid, and dropping one
  // would shift every row below it up by a line.
  const rows = text.split("\n");

  return (
    <pre
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": "true" })}
      style={style}
      className={cn(
        "select-none whitespace-pre font-mono leading-[1.05]",
        className,
      )}
    >
      {rows.map((row, index) => (
        // The art is a fixed grid: a row's identity is its position, and no
        // two renders reorder them.
        <Fragment key={index}>
          {/*
            A real newline between rows, not `display: block`. Block spans stack
            correctly but drop the line breaks from textContent, so selecting
            and copying the art would yield one run-on line. The <pre> renders
            this newline as the break; `inline-block` keeps the row a
            transformable box so the entrance can move it.
          */}
          {index > 0 && "\n"}
          <span
            data-row
            className="inline-block"
            style={{ animationDelay: `${index * rowDelayMs}ms` }}
          >
            {row}
          </span>
        </Fragment>
      ))}
    </pre>
  );
}
