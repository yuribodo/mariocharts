"use client";

import { useEffect, useRef, useState } from "react";

interface HeroPortraitEffectProps {
  text: string;
  columns: number;
}

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Glyphs the cursor swaps in, densest at the centre of its radius. */
const DENSE = "@%#*";

/** Radius of the cursor's influence, in grid cells. */
const RADIUS = 6;

export function HeroPortraitEffect({ text, columns }: HeroPortraitEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  // Read the queries after mount, never during render: the server has no
  // matchMedia, and deciding here keeps the server tree and the reduced-motion
  // tree identical — the portrait alone.
  useEffect(() => {
    const fine = window.matchMedia(HOVER_QUERY).matches;
    const reduced = window.matchMedia(MOTION_QUERY).matches;
    setEnabled(fine && !reduced);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const rows = text.split("\n");
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;

    const draw = () => {
      const cellWidth = canvas.width / columns;
      const cellHeight = canvas.height / rows.length;
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (!pointer) return;

      const cursorColumn = Math.floor(pointer.x / cellWidth);
      const cursorRow = Math.floor(pointer.y / cellHeight);

      context.font = `${cellHeight}px ui-monospace, monospace`;
      context.fillStyle = getComputedStyle(canvas).color;
      context.textBaseline = "top";

      for (let y = cursorRow - RADIUS; y <= cursorRow + RADIUS; y += 1) {
        const line = rows[y];
        if (!line) continue;
        for (let x = cursorColumn - RADIUS; x <= cursorColumn + RADIUS; x += 1) {
          if (line[x] === undefined || line[x] === " ") continue;
          const distance = Math.hypot(x - cursorColumn, y - cursorRow);
          if (distance > RADIUS) continue;
          const step = Math.floor((1 - distance / RADIUS) * DENSE.length);
          const glyph = DENSE[Math.min(DENSE.length - 1, step)];
          if (!glyph) continue;
          context.fillText(glyph, x * cellWidth, y * cellHeight);
        }
      }
    };

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };

    const onLeave = () => {
      pointer = null;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      draw();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, text, columns]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      className="pointer-events-none absolute inset-0 size-full text-foreground"
    />
  );
}
