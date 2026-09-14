"use client";
import { useState, type RefObject } from "react";
import { useIsomorphicLayoutEffect } from "../../../../lib/hooks";
/** Resolve CSS tokens and transparent paints against the actual chart surface. */
export function useTreeInk(
  root: RefObject<HTMLDivElement | null>,
  colors: readonly string[],
) {
  const [inks, setInks] = useState<Record<string, string>>({});
  useIsomorphicLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    const ancestors: Element[] = [];
    for (let at: Element | null = element; at; at = at.parentElement)
      ancestors.unshift(at);
    const probe = document.createElement("span");
    probe.style.display = "none";
    element.appendChild(probe);
    const update = () => {
      const next: Record<string, string> = {};
      for (const color of colors) {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = "white";
        context.fillRect(0, 0, 1, 1);
        for (const ancestor of ancestors) {
          context.fillStyle = getComputedStyle(ancestor).backgroundColor;
          context.fillRect(0, 0, 1, 1);
        }
        probe.style.color = "var(--muted)";
        context.fillStyle = getComputedStyle(probe).color;
        context.fillRect(0, 0, 1, 1);
        probe.style.color = "";
        probe.style.color = color;
        context.fillStyle = getComputedStyle(probe).color;
        context.fillRect(0, 0, 1, 1);
        const pixel = context.getImageData(0, 0, 1, 1).data;
        const channel = (v: number) => {
          const c = v / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        };
        const luminance =
          0.2126 * channel(pixel[0]!) +
          0.7152 * channel(pixel[1]!) +
          0.0722 * channel(pixel[2]!);
        next[color] =
          (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05)
            ? "#000000"
            : "#ffffff";
      }
      setInks((old) =>
        colors.every((color) => old[color] === next[color]) ? old : next,
      );
    };
    update();
    const observer = new MutationObserver(update);
    ancestors.forEach((ancestor) =>
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: ["class", "style"],
      }),
    );
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", update);
    const transition = (event: TransitionEvent) => {
      if (
        event.propertyName === "background-color" &&
        ancestors.includes(event.target as Element)
      )
        update();
    };
    document.documentElement.addEventListener("transitionend", transition);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
      document.documentElement.removeEventListener("transitionend", transition);
      probe.remove();
    };
  }, [root, colors]);
  return inks;
}
