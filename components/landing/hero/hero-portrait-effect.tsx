"use client";

import { useEffect, useRef, useState } from "react";

interface HeroPortraitEffectProps {
  textDark: string;
  textLight: string;
  columns: number;
}

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Glyphs the cursor swaps in, densest first: index 0 sits at the centre of its radius. */
const DENSE = "@%#*";

/** Radius of the cursor's influence, in grid cells. */
const RADIUS = 6;

export function HeroPortraitEffect({ textDark, textLight, columns }: HeroPortraitEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);
  // hero-portrait.tsx renders both variants and lets CSS pick one via the
  // `dark` class on <html> (see the note there on why it's a class, not
  // prefers-color-scheme). This has to track the same class, or it lights up
  // cells against the variant nobody can see. matchMedia can't do that here —
  // next-themes is class-only in this project (enableSystem={false}), so a
  // visitor's OS scheme and their actual theme can disagree. A
  // MutationObserver on the class attribute is the one thing that tracks the
  // real switch, including a live toggle click, with no reload.
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    const update = () => {
      setIsDarkTheme(root.classList.contains("dark"));
    };

    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  // Read the queries after mount, never during render: the server has no
  // matchMedia, and deciding here keeps the server tree and the reduced-motion
  // tree identical — the portrait alone. Both queries stay subscribed for the
  // life of the effect so a live switch (e.g. turning on reduced motion) is
  // picked up without a reload.
  useEffect(() => {
    const hoverQuery = window.matchMedia(HOVER_QUERY);
    const motionQuery = window.matchMedia(MOTION_QUERY);

    const update = () => {
      setEnabled(hoverQuery.matches && !motionQuery.matches);
    };

    update();
    hoverQuery.addEventListener("change", update);
    motionQuery.addEventListener("change", update);

    return () => {
      hoverQuery.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, []);

  const text = isDarkTheme ? textDark : textLight;

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const rows = text.split("\n");
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;
    // CSS-pixel size of the canvas box, tracked separately from the backing
    // store: the store is scaled by devicePixelRatio so glyphs stay crisp on
    // HiDPI screens, but every grid/pointer calculation below stays in CSS
    // pixels to match getBoundingClientRect and the DOM text underneath.
    let width = 0;
    let height = 0;

    const draw = () => {
      // A hidden ancestor (e.g. `hidden xl:block`) collapses the canvas to
      // 0x0. Bail here instead of dividing by zero — an unbounded cursorRow
      // of Infinity would otherwise spin this rAF callback forever.
      if (width === 0 || height === 0) return;

      const cellWidth = width / columns;
      const cellHeight = height / rows.length;
      context.clearRect(0, 0, width, height);
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
          // distance 0 (centre) -> index 0, the densest glyph; distance
          // RADIUS (rim) -> the last, lightest glyph.
          const step = Math.floor((distance / RADIUS) * (DENSE.length - 1));
          const glyph = DENSE[step];
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

    // pointerleave does not bubble and window is not an element in its
    // propagation path, so a listener bound there never fires. pointerout
    // does bubble, and the browser reports a null relatedTarget on the event
    // that fires as the pointer exits the viewport entirely.
    const onOut = (event: PointerEvent) => {
      if (event.relatedTarget !== null) return;
      pointer = null;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerout", onOut);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onOut);
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
