"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  BACKDROP_COLUMNS,
  BACKDROP_ROWS,
  warpBackdropFrame,
} from "./hero-backdrop";

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Once per browser tab session. Replaying the full welcome→portal every time
 * someone clicks Home is the classic intro anti-pattern — sessionStorage is
 * the usual fix (survives in-app navigations, resets on a new tab/session).
 */
const SEEN_KEY = "mario-world-entrance-seen";

const WELCOME_TEXT = "welcome to my world";
/** Delay before the first glyph appears. */
const WELCOME_START_MS = 280;
/** Per-character type speed. */
const TYPE_MS = 58;
/** Hold the finished line before it dissolves into the portal. */
const WELCOME_HOLD_MS = 480;
/** Welcome overlay fade-out into the warp. */
const WELCOME_FADE_MS = 520;

const WELCOME_TYPE_DONE_MS =
  WELCOME_START_MS + WELCOME_TEXT.length * TYPE_MS;
const WELCOME_FADE_AT_MS = WELCOME_TYPE_DONE_MS + WELCOME_HOLD_MS;
/** Portal starts under the welcome so the dissolve reveals motion already underway. */
const WARP_AT_MS = WELCOME_FADE_AT_MS - 120;

/** Full portal arc — dive, rush, land. Short warps read as incomplete. */
const WARP_MS = 1550;

/**
 * Live field mounts mid-flight under a clearing shell so the portal can morph
 * into the world instead of fading to empty and cutting over.
 */
const FIELD_AT_MS = WARP_AT_MS + Math.floor(WARP_MS * 0.58);
const COPY_AT_MS = WARP_AT_MS + Math.floor(WARP_MS * 0.78);
const PORTRAIT_AT_MS = WARP_AT_MS + Math.floor(WARP_MS * 0.86);
/** Soft shell fade only after the warp has visually become the field. */
const SETTLE_AT_MS = WARP_AT_MS + WARP_MS;
const DONE_AT_MS = SETTLE_AT_MS + 480;

/** Peak ink during the dive — denser than the settled field. */
const WARP_ALPHA_PEAK = 0.42;
/** Settled ink — matches live field `FIELD_ALPHA` (0.16). */
const WARP_ALPHA_LAND = 0.16;

export type HeroEntranceStatus =
  | "welcome"
  | "warping"
  | "settling"
  | "done"
  | "skipped";

export interface HeroEntranceState {
  status: HeroEntranceStatus;
  /** Welcome typewriter overlay is on screen. */
  welcomeActive: boolean;
  /** Welcome line is fading into the portal. */
  welcomeFading: boolean;
  /** Warp canvas may paint. */
  warpActive: boolean;
  /** Entrance shell keeps an opaque backdrop (hides the page). */
  shellOpaque: boolean;
  /** Live field canvases may mount / animate. */
  fieldActive: boolean;
  /** CSS reveal on the field cluster (fade the ASCII world in). */
  fieldReveal: boolean;
  /** Gate for `hero-resolve` on the copy cluster. */
  copyReveal: boolean;
  /** Gate for `hero-resolve-rows` on the portrait. */
  portraitReveal: boolean;
}

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

const SETTLED: HeroEntranceState = {
  status: "skipped",
  welcomeActive: false,
  welcomeFading: false,
  warpActive: false,
  shellOpaque: false,
  fieldActive: true,
  fieldReveal: true,
  copyReveal: true,
  portraitReveal: true,
};

function hasSeenEntrance(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    // Private mode / blocked storage — fail open and play once this mount.
    return false;
  }
}

function markEntranceSeen(): void {
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Ignore quota / privacy blocks; worst case the intro can replay.
  }
}

/**
 * Drives the Mario-World entrance beats:
 * typewriter welcome → portal warp → field/copy/Mario settle as one world.
 *
 * Plays at most once per tab session (sessionStorage). SSR / no-JS and
 * reduced-motion visitors stay settled so the headline remains visible.
 */
export function useHeroEntrance(): HeroEntranceState {
  const [state, setState] = useState<HeroEntranceState>(SETTLED);

  useLayoutEffect(() => {
    const motionQuery = window.matchMedia(MOTION_QUERY);
    if (motionQuery.matches) return;
    if (hasSeenEntrance()) return;

    // Mark at start so leaving mid-intro (or soft-nav Home) does not replay.
    markEntranceSeen();

    setState({
      status: "welcome",
      welcomeActive: true,
      welcomeFading: false,
      warpActive: false,
      shellOpaque: true,
      fieldActive: false,
      fieldReveal: false,
      copyReveal: false,
      portraitReveal: false,
    });

    const timers = [
      window.setTimeout(() => {
        setState((current) =>
          current.status === "welcome"
            ? { ...current, welcomeFading: true }
            : current,
        );
      }, WELCOME_FADE_AT_MS),

      window.setTimeout(() => {
        setState((current) => ({
          ...current,
          status: "warping",
          warpActive: true,
          shellOpaque: true,
        }));
      }, WARP_AT_MS),

      window.setTimeout(() => {
        setState((current) => ({
          ...current,
          welcomeActive: false,
          welcomeFading: false,
        }));
      }, WELCOME_FADE_AT_MS + WELCOME_FADE_MS),

      window.setTimeout(() => {
        setState((current) => ({
          ...current,
          fieldActive: true,
          fieldReveal: true,
          shellOpaque: false,
        }));
      }, FIELD_AT_MS),

      window.setTimeout(() => {
        setState((current) =>
          current.status === "warping" || current.status === "settling"
            ? { ...current, copyReveal: true }
            : current,
        );
      }, COPY_AT_MS),

      window.setTimeout(() => {
        setState((current) =>
          current.status === "warping" || current.status === "settling"
            ? { ...current, portraitReveal: true }
            : current,
        );
      }, PORTRAIT_AT_MS),

      window.setTimeout(() => {
        setState((current) => ({
          ...current,
          status: "settling",
          shellOpaque: false,
        }));
      }, SETTLE_AT_MS),

      window.setTimeout(() => {
        setState({
          status: "done",
          welcomeActive: false,
          welcomeFading: false,
          warpActive: false,
          shellOpaque: false,
          fieldActive: true,
          fieldReveal: true,
          copyReveal: true,
          portraitReveal: true,
        });
      }, DONE_AT_MS),
    ];

    const onMotionChange = () => {
      if (!motionQuery.matches) return;
      for (const id of timers) window.clearTimeout(id);
      setState(SETTLED);
    };
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      for (const id of timers) window.clearTimeout(id);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return state;
}

interface WelcomeTypewriterProps {
  active: boolean;
  fading: boolean;
}

/**
 * Terminal-voice prelude. Types the line, holds, then dissolves so the portal
 * can take the screen. Font comes from `--font-welcome` (VT323).
 */
function WelcomeTypewriter({ active, fading }: WelcomeTypewriterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }

    setCount(0);
    const timers: number[] = [];
    for (let i = 1; i <= WELCOME_TEXT.length; i += 1) {
      timers.push(
        window.setTimeout(
          () => setCount(i),
          WELCOME_START_MS + i * TYPE_MS,
        ),
      );
    }
    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [active]);

  if (!active) return null;

  const typed = WELCOME_TEXT.slice(0, count);
  const typingDone = count >= WELCOME_TEXT.length;

  return (
    <div
      className={`hero-welcome ${fading ? "hero-welcome--out" : ""}`}
      aria-hidden="true"
    >
      <p className="hero-welcome__line">
        <span>{typed}</span>
        <span
          className={`hero-welcome__caret ${typingDone ? "hero-welcome__caret--idle" : ""}`}
        />
      </p>
    </div>
  );
}

interface HeroWorldIntroProps {
  /** Warp tunnel canvas. */
  warpActive: boolean;
  /** Welcome typewriter overlay. */
  welcomeActive: boolean;
  /** Welcome is dissolving into the portal. */
  welcomeFading: boolean;
}

/**
 * Welcome line + portal tunnel. Rendered inside the site-level
 * `.world-entrance` shell (fixed, above header/page) — not inside the hero.
 */
export function HeroWorldIntro({
  warpActive,
  welcomeActive,
  welcomeFading,
}: HeroWorldIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!warpActive) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let fontSize = 12;
    const started = performance.now();

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

      const elapsed = now - started;
      const progress = Math.min(1, elapsed / WARP_MS);
      // Dive hard, land soft — matches the glyph generator's ease.
      const ease = 1 - (1 - progress) ** 2.6;
      const scale = 1.38 - 0.38 * ease;
      canvas.style.transform = `scale(${scale})`;
      // Stay fully opaque through the morph; the shell fades the layer later.
      canvas.style.opacity = "1";

      const t = elapsed / 140;
      const text = warpBackdropFrame(progress, t);
      const rows = text.split("\n");
      const cellHeight = height / BACKDROP_ROWS;
      const ink = WARP_ALPHA_PEAK + (WARP_ALPHA_LAND - WARP_ALPHA_PEAK) * ease;

      context.clearRect(0, 0, width, height);
      context.font = `${fontSize}px ui-monospace, monospace`;
      context.fillStyle = getComputedStyle(canvas).color;
      context.textBaseline = "top";
      context.globalAlpha = ink;

      for (let y = 0; y < BACKDROP_ROWS; y += 1) {
        const row = rows[y] ?? "";
        if (!row) continue;
        context.fillText(row, 0, y * cellHeight);
      }

      // Soft radial shade keeps the mouth readable as depth, then lifts.
      const vignette = 0.55 * (1 - ease);
      if (vignette > 0.02) {
        const gx = WARP_VANISH_PX(width);
        const gy = height * 0.49;
        const gradient = context.createRadialGradient(
          gx,
          gy,
          Math.min(width, height) * 0.04,
          gx,
          gy,
          Math.hypot(width, height) * 0.62,
        );
        gradient.addColorStop(0, `rgba(0,0,0,${0.55 * vignette})`);
        gradient.addColorStop(0.35, `rgba(0,0,0,${0.12 * vignette})`);
        gradient.addColorStop(1, `rgba(0,0,0,${0.4 * vignette})`);
        context.globalAlpha = 1;
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      }

      context.globalAlpha = 1;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [warpActive]);

  if (!warpActive && !welcomeActive) return null;

  return (
    <>
      <WelcomeTypewriter active={welcomeActive} fading={welcomeFading} />
      {warpActive ? (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            tabIndex={-1}
            className="absolute inset-0 size-full origin-center text-foreground will-change-transform"
            style={{ transform: "scale(1.38)", opacity: 1 }}
          />
        </div>
      ) : null}
    </>
  );
}

/** Vanish point in CSS pixels — matches WARP_VANISH (~copy clearing centre). */
function WARP_VANISH_PX(width: number): number {
  return width * 0.24;
}
