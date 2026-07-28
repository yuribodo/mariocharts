"use client";

import { useEffect, useRef, useState } from "react";
import { ChartBar, ChartColumn, RotateCcw, Square, SquareDashed } from "lucide-react";
import { useReducedMotion } from "framer-motion";

import { CodeBlock } from "@/components/ui/code-block";
import { SegmentedControl, type SegmentedOption } from "@/components/ui/segmented-control";
import { useBadges } from "@/hooks";
import {
  buildWorkbenchCode,
  PROP_LINES,
  type Orientation,
  type Variant,
} from "./workbench-data";

const orientationOptions: readonly SegmentedOption<Orientation>[] = [
  { value: "vertical", label: "Vertical", icon: ChartColumn },
  { value: "horizontal", label: "Horizontal", icon: ChartBar },
];

const appearanceOptions: readonly SegmentedOption<Variant>[] = [
  { value: "filled", label: "Filled", icon: Square },
  { value: "outline", label: "Outline", icon: SquareDashed },
];

/** How long a changed source line stays tinted before fading back. */
const TINT_DURATION_MS = 700;

interface WorkbenchCodeProps {
  orientation: Orientation;
  variant: Variant;
  animation: boolean;
  onOrientationChange: (value: Orientation) => void;
  onVariantChange: (value: Variant) => void;
  onAnimationChange: (value: boolean) => void;
  onReplay: () => void;
}

export function WorkbenchCode({
  orientation,
  variant,
  animation,
  onOrientationChange,
  onVariantChange,
  onAnimationChange,
  onReplay,
}: WorkbenchCodeProps) {
  const { unlock } = useBadges();
  const shouldReduceMotion = useReducedMotion();
  const [tintedLines, setTintedLines] = useState<readonly number[]>([]);
  const previous = useRef({ orientation, variant, animation });
  const tintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tint the line belonging to whichever prop just changed. Derived from the
  // props rather than from the control handlers so the tint is correct even
  // when state changes from somewhere else.
  useEffect(() => {
    const before = previous.current;
    previous.current = { orientation, variant, animation };

    if (shouldReduceMotion) return;

    const changed =
      before.orientation !== orientation
        ? PROP_LINES.orientation
        : before.variant !== variant
          ? PROP_LINES.variant
          : before.animation !== animation
            ? PROP_LINES.animation
            : null;

    if (changed === null) return;

    if (tintTimer.current) clearTimeout(tintTimer.current);
    setTintedLines([changed]);
    tintTimer.current = setTimeout(() => setTintedLines([]), TINT_DURATION_MS);
  }, [orientation, variant, animation, shouldReduceMotion]);

  useEffect(() => {
    return () => {
      if (tintTimer.current) clearTimeout(tintTimer.current);
    };
  }, []);

  const code = buildWorkbenchCode({ orientation, variant, animation });

  return (
    <div className="flex min-w-0 flex-col">
      {/*
        Below `lg` the section stacks chart, controls, then code, so the
        controls come first here and the grid places the chart above both.
        From `lg` up the column reads code then controls.
      */}
      <div className="order-2 min-w-0 flex-1 lg:order-1">
        <CodeBlock
          code={code}
          language="tsx"
          highlightedLines={tintedLines}
          onCopy={() => unlock("first-copy")}
          className="my-0 rounded-none border-0"
        />
      </div>

      <div
        className="order-1 border-b p-5 lg:order-2 lg:border-b-0 lg:border-t"
        aria-label="Chart settings"
        role="group"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <SegmentedControl
            label="Orientation"
            description="Direction of comparison."
            value={orientation}
            options={orientationOptions}
            onChange={onOrientationChange}
          />
          <SegmentedControl
            label="Appearance"
            description="Visual weight of the bars."
            value={variant}
            options={appearanceOptions}
            onChange={onVariantChange}
          />
        </div>

        <div className="mt-5 flex items-center justify-between border-t pt-4">
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={animation}
              onChange={(event) => onAnimationChange(event.target.checked)}
              className="size-4 accent-foreground"
            />
            Animate
          </label>
          <button
            type="button"
            onClick={onReplay}
            disabled={!animation}
            className="inline-flex size-11 items-center justify-center rounded border bg-background text-muted-foreground transition-colors duration-150 hover:text-foreground active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            aria-label="Replay animation"
            title="Replay animation"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
