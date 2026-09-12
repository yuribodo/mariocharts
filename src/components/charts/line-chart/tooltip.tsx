"use client";

import { useRef, useState, type ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "../../../../lib/hooks";

/** Measure custom content as well as the default tooltip before placing it. */
export function LineTooltip({
  id,
  x,
  y,
  width,
  height,
  children,
}: {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const box = element.getBoundingClientRect();
      setSize((previous) =>
        previous.width === box.width && previous.height === box.height
          ? previous
          : { width: box.width, height: box.height },
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const preferredLeft =
    x + 16 + size.width <= width - 8 ? x + 16 : x - size.width - 16;
  const left = Math.max(8, Math.min(preferredLeft, width - size.width - 8));
  const top = Math.max(
    8,
    Math.min(y - size.height / 2, height - size.height - 8),
  );
  return (
    <div
      ref={ref}
      id={id}
      role="tooltip"
      className="pointer-events-none absolute z-50 w-max overflow-hidden break-words rounded-lg border border-border bg-popover px-3 py-2.5 text-popover-foreground shadow-xl"
      style={{
        left,
        top,
        maxWidth: Math.max(0, width - 16),
        maxHeight: Math.max(0, height - 16),
        visibility: size.width ? "visible" : "hidden",
      }}
    >
      {children}
    </div>
  );
}
