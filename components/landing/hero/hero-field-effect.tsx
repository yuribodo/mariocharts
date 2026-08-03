"use client";

import { useEffect, useRef, useState } from "react";

import {
  BACKDROP_COLUMNS,
  BACKDROP_ROWS,
  CHART_ROWS,
  backdropFrame,
  chartFrame,
} from "./hero-backdrop";

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Radius of the light's core, in grid cells. */
const RADIUS = 9;

/** Peak brightness, as canvas alpha. Never 1: it is a light, not a repaint. */
const PEAK = 0.9;

/** Per-frame energy decay. Higher holds the trail longer. */
const DECAY = 0.86;

/** How fast the light's position eases toward the cursor. */
const CHASE = 0.16;

/** Cells below this much energy are dropped from the live set. */
const FLOOR = 0.02;

/** Fallbacks if `--hero-*-alpha` is missing (light-theme readable defaults). */
const FIELD_ALPHA_FALLBACK = 0.34;
const CHART_ALPHA_FALLBACK = 0.58;

function readCssAlpha(
  element: Element,
  property: string,
  fallback: number,
): number {
  const raw = getComputedStyle(element).getPropertyValue(property).trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

/**
 * Old interval was 140ms per tick. Continuous time is measured in those units
 * so drift speed stays in the same ballpark while the glide is per-frame.
 */
const TICK_MS = 140;

interface HeroFieldEffectProps {
  /**
   * Called once the canvas has painted its first live frame, so the static
   * TextField underneath can hide without a double-ink flash.
   */
  onReady?: () => void;
  /**
   * When false the live canvas stays unmounted — used while the world-intro
   * warp owns the field so the two never double-paint.
   */
  active?: boolean;
}

/**
 * Fits a monospace font so one full row of `columns` glyphs spans `width` CSS
 * pixels. Row-at-once `fillText` is what keeps a 220×90 field at 60fps — the
 * previous per-cell draw was twenty thousand calls a frame.
 */
function fitRowFont(
  context: CanvasRenderingContext2D,
  columns: number,
  width: number,
  cellHeight: number,
): number {
  const sample = "0".repeat(Math.max(1, columns));
  let lo = 1;
  let hi = Math.max(cellHeight * 2, 2);
  for (let i = 0; i < 18; i += 1) {
    const mid = (lo + hi) / 2;
    context.font = `${mid}px ui-monospace, monospace`;
    if (context.measureText(sample).width > width) hi = mid;
    else lo = mid;
  }
  return lo;
}

/**
 * The living field: a canvas that redraws `backdropFrame` every animation
 * frame with continuous time, and — on fine pointers — a spotlight that
 * re-inks the field's own glyphs near an eased cursor with a decaying trail.
 *
 * Under reduced motion the canvas does not mount: the SSR TextField is the
 * field, unchanged. The canvas is decoration — aria-hidden, unfocusable,
 * pointer-transparent.
 */
export function HeroFieldEffect({
  onReady,
  active = true,
}: HeroFieldEffectProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onReadyRef = useRef(onReady);
  const [enabled, setEnabled] = useState(false);
  const [spotlight, setSpotlight] = useState(false);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const hoverQuery = window.matchMedia(HOVER_QUERY);
    const motionQuery = window.matchMedia(MOTION_QUERY);

    const update = () => {
      const motionOk = active && !motionQuery.matches;
      setEnabled(motionOk);
      setSpotlight(motionOk && hoverQuery.matches);
    };

    update();
    hoverQuery.addEventListener("change", update);
    motionQuery.addEventListener("change", update);

    return () => {
      hoverQuery.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, [active]);

  const spotlightRef = useRef(spotlight);
  useEffect(() => {
    spotlightRef.current = spotlight;
  }, [spotlight]);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let fontSize = 12;
    let started = performance.now();
    let readyFired = false;
    let target: { x: number; y: number } | null = null;
    let light: { x: number; y: number } | null = null;
    const energy = new Map<number, number>();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (width > 0 && height > 0) {
        fontSize = fitRowFont(
          context,
          BACKDROP_COLUMNS,
          width,
          height / BACKDROP_ROWS,
        );
      }
    };

    const step = (now: number) => {
      frame = requestAnimationFrame(step);

      if (width === 0 || height === 0) return;

      const t = (now - started) / TICK_MS;
      const text = backdropFrame(t);
      const rows = text.split("\n");
      const cellWidth = width / BACKDROP_COLUMNS;
      const cellHeight = height / BACKDROP_ROWS;
      const spotlightOn = spotlightRef.current;

      const fieldAlpha = readCssAlpha(
        canvas,
        "--hero-field-alpha",
        FIELD_ALPHA_FALLBACK,
      );

      context.clearRect(0, 0, width, height);
      context.font = `${fontSize}px ui-monospace, monospace`;
      context.fillStyle = getComputedStyle(canvas).color;
      context.textBaseline = "top";
      context.globalAlpha = fieldAlpha;

      for (let y = 0; y < BACKDROP_ROWS; y += 1) {
        const row = rows[y] ?? "";
        if (!row) continue;
        context.fillText(row, 0, y * cellHeight);
      }
      context.globalAlpha = 1;

      if (spotlightOn) {
        if (target) {
          light = light
            ? {
                x: light.x + (target.x - light.x) * CHASE,
                y: light.y + (target.y - light.y) * CHASE,
              }
            : target;
        }

        if (light) {
          const centreColumn = Math.floor(light.x / cellWidth);
          const centreRow = Math.floor(light.y / cellHeight);
          for (let y = centreRow - RADIUS; y <= centreRow + RADIUS; y += 1) {
            if (y < 0 || y >= BACKDROP_ROWS) continue;
            for (let x = centreColumn - RADIUS; x <= centreColumn + RADIUS; x += 1) {
              if (x < 0 || x >= BACKDROP_COLUMNS) continue;
              const distance = Math.hypot(x - centreColumn, y - centreRow);
              if (distance > RADIUS) continue;
              const falloff = 1 - distance / RADIUS;
              const key = y * BACKDROP_COLUMNS + x;
              const poured = PEAK * falloff * falloff;
              if (poured > (energy.get(key) ?? 0)) energy.set(key, poured);
            }
          }
        }

        for (const [key, value] of energy) {
          const cooled = value * DECAY;
          if (cooled < FLOOR) {
            energy.delete(key);
            continue;
          }
          energy.set(key, cooled);

          const y = Math.floor(key / BACKDROP_COLUMNS);
          const x = key - y * BACKDROP_COLUMNS;
          const glyph = (rows[y] ?? "").charAt(x);
          if (!glyph || glyph === " ") continue;
          context.globalAlpha = Math.min(PEAK, cooled);
          context.fillText(glyph, x * cellWidth, y * cellHeight);
        }
        context.globalAlpha = 1;
      } else if (energy.size > 0) {
        energy.clear();
      }

      if (!readyFired) {
        readyFired = true;
        onReadyRef.current?.();
      }
    };

    const onMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      target = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    // mouseout bubbles; relatedTarget null means the cursor left the viewport.
    const onOut = (event: MouseEvent) => {
      if (event.relatedTarget !== null) return;
      target = null;
      light = null;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    // mousemove (not pointermove): jsdom has no PointerEvent, and the fine
    // pointer gate above already excludes touch / coarse inputs.
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onOut);
    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onOut);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      data-spotlight={spotlight ? "on" : "off"}
      className="pointer-events-none absolute inset-0 size-full text-foreground"
    />
  );
}

/**
 * Live chart strip: same continuous clock as the field, surface line held
 * still by `chartFrame`, wash breathing underneath. Absent under reduced motion.
 */
export function HeroChartEffect({
  onReady,
  active = true,
}: HeroFieldEffectProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onReadyRef = useRef(onReady);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const motionQuery = window.matchMedia(MOTION_QUERY);
    const update = () => setEnabled(active && !motionQuery.matches);
    update();
    motionQuery.addEventListener("change", update);
    return () => motionQuery.removeEventListener("change", update);
  }, [active]);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let fontSize = 12;
    let started = performance.now();
    let readyFired = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (width > 0 && height > 0) {
        fontSize = fitRowFont(
          context,
          BACKDROP_COLUMNS,
          width,
          height / CHART_ROWS,
        );
      }
    };

    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      if (width === 0 || height === 0) return;

      const t = (now - started) / TICK_MS;
      const rows = chartFrame(t).split("\n");
      const cellHeight = height / CHART_ROWS;

      const chartAlpha = readCssAlpha(
        canvas,
        "--hero-chart-alpha",
        CHART_ALPHA_FALLBACK,
      );

      context.clearRect(0, 0, width, height);
      context.font = `${fontSize}px ui-monospace, monospace`;
      context.fillStyle = getComputedStyle(canvas).color;
      context.textBaseline = "top";
      context.globalAlpha = chartAlpha;

      for (let y = 0; y < CHART_ROWS; y += 1) {
        const row = rows[y] ?? "";
        if (!row) continue;
        context.fillText(row, 0, y * cellHeight);
      }
      context.globalAlpha = 1;

      if (!readyFired) {
        readyFired = true;
        onReadyRef.current?.();
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [enabled]);

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
