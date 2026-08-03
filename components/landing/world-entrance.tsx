"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  type ReactNode,
} from "react";

import {
  HeroWorldIntro,
  useHeroEntrance,
  type HeroEntranceState,
} from "./hero/hero-world-intro";

const EntranceContext = createContext<HeroEntranceState | null>(null);

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

/**
 * Site-level Mario-World entrance. Owns the welcome + portal as a fixed
 * fullscreen shell above the header and page. The hero (and anything else)
 * reads the same timeline via {@link useWorldEntrance}.
 *
 * `data-world-entering` stays on only through welcome/warp so the header can
 * reveal during settle, in sync with the hero — not after a hard cut.
 */
export function WorldEntranceProvider({ children }: { children: ReactNode }) {
  const entrance = useHeroEntrance();
  const covering =
    entrance.status === "welcome" || entrance.status === "warping";

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!covering) {
      root.removeAttribute("data-world-entering");
      return undefined;
    }

    root.setAttribute("data-world-entering", "");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      root.removeAttribute("data-world-entering");
      document.body.style.overflow = prev;
    };
  }, [covering]);

  // Keep overflow locked through settle so the shell fade doesn't scroll-jump.
  useLayoutEffect(() => {
    if (entrance.status !== "settling") return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [entrance.status]);

  const shellUp =
    entrance.welcomeActive ||
    entrance.warpActive ||
    entrance.status === "settling";

  return (
    <EntranceContext.Provider value={entrance}>
      {shellUp ? (
        <div
          className={[
            "world-entrance",
            !entrance.shellOpaque ? "world-entrance--clear" : "",
            entrance.status === "settling" ? "world-entrance--out" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        >
          <HeroWorldIntro
            warpActive={entrance.warpActive}
            welcomeActive={entrance.welcomeActive}
            welcomeFading={entrance.welcomeFading}
          />
        </div>
      ) : null}
      {children}
    </EntranceContext.Provider>
  );
}

/** Timeline shared by the site entrance and the hero settle beats. */
export function useWorldEntrance(): HeroEntranceState {
  return useContext(EntranceContext) ?? SETTLED;
}
