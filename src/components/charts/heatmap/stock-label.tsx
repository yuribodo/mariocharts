"use client";
import { useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../../../../lib/hooks";
import { fitStockLabel, stockTextColor } from "./geometry";

/** Fit real font metrics and choose ink against the browser-resolved cell paint. */
export function StockLabel({
  width,
  height,
  title,
  value,
  fill,
}: {
  width: number;
  height: number;
  title: string;
  value: string;
  fill: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState({
    titleSize: 12,
    valueSize: 10,
    color: "#ffffff",
  });
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    const ancestors: Element[] = [];
    for (let node = element.parentElement; node; node = node.parentElement)
      ancestors.unshift(node);
    const update = () => {
      const style = getComputedStyle(element);
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, 1, 1);
      // Composite transparent custom colors over the actual surrounding surface.
      for (const ancestor of ancestors) {
        context.fillStyle = getComputedStyle(ancestor).backgroundColor;
        context.fillRect(0, 0, 1, 1);
      }
      context.fillStyle = style.color;
      context.fillRect(0, 0, 1, 1);
      const pixel = context.getImageData(0, 0, 1, 1).data;
      const color = stockTextColor(pixel[0]!, pixel[1]!, pixel[2]!);
      const fitted = fitStockLabel(
        width,
        height,
        title,
        value,
        (text, size, bold) => {
          context.font = `${bold ? 600 : 400} ${size}px ${style.fontFamily}`;
          return context.measureText(text).width;
        },
      );
      setLabel((previous) =>
        previous.color === color &&
        previous.titleSize === fitted.titleSize &&
        previous.valueSize === fitted.valueSize
          ? previous
          : { ...fitted, color },
      );
    };
    update();
    const onSurfaceTransition = (event: TransitionEvent) => {
      if (
        event.propertyName === "background-color" &&
        ancestors.includes(event.target as Element)
      )
        update();
    };
    document.documentElement.addEventListener(
      "transitionend",
      onSurfaceTransition,
    );
    const observer = new MutationObserver(update);
    ancestors.forEach((node) =>
      observer.observe(node, {
        attributes: true,
        attributeFilter: ["class", "style"],
      }),
    );
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", update);
    document.fonts?.addEventListener("loadingdone", update);
    return () => {
      observer.disconnect();
      document.documentElement.removeEventListener(
        "transitionend",
        onSurfaceTransition,
      );
      media.removeEventListener("change", update);
      document.fonts?.removeEventListener("loadingdone", update);
    };
  }, [width, height, title, value, fill]);
  return (
    <div
      ref={ref}
      data-stock-label=""
      className="flex h-full min-w-0 items-center justify-center px-1.5 text-muted"
      style={{ color: fill ?? undefined, transition: "none" }}
    >
      <div
        className="min-w-0 max-w-full text-center"
        style={{ color: label.color, transition: "none" }}
      >
        <p
          data-stock-title=""
          className="truncate font-semibold"
          style={{
            fontSize: label.titleSize,
            lineHeight: 1.15,
            transition: "none",
          }}
        >
          {title}
        </p>
        {label.valueSize > 0 && (
          <p
            data-stock-value=""
            className="mt-0.5 whitespace-nowrap tabular-nums"
            style={{
              fontSize: label.valueSize,
              lineHeight: 1.2,
              transition: "none",
            }}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
