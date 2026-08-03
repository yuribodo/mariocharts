"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { WorkbenchCode } from "./workbench-code";
import { WorkbenchPreview } from "./workbench-preview";
import type { Orientation, Variant } from "./workbench-data";

interface CodeDemoSectionProps {
  className?: string;
}

/**
 * Landing code workbench.
 *
 * Owns the workbench state so the generated source and the rendered chart can
 * never disagree: both read the same values.
 */
export function CodeDemoSection({ className }: CodeDemoSectionProps) {
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [variant, setVariant] = useState<Variant>("filled");
  const [animation, setAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);

  return (
    <section
      aria-labelledby="workbench-title"
      className={cn("border-b py-16 lg:py-24", className)}
    >
      <div className="mx-auto max-w-7xl px-6">
        <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Live example
        </p>
        <h2
          id="workbench-title"
          className="mt-3 max-w-2xl text-2xl font-semibold tracking-normal text-foreground sm:text-3xl"
        >
          Adjust the props. The code updates with the chart.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          This is the component you install — same props, same output.
        </p>

        <div className="mt-8 grid overflow-hidden rounded-md border bg-card lg:grid-cols-2">
          <div className="order-2 border-t lg:order-1 lg:border-r lg:border-t-0">
            <WorkbenchCode
              orientation={orientation}
              variant={variant}
              animation={animation}
              onOrientationChange={setOrientation}
              onVariantChange={setVariant}
              onAnimationChange={setAnimation}
              onReplay={() => setChartKey((key) => key + 1)}
            />
          </div>
          <div className="order-1 min-w-0 lg:order-2">
            <WorkbenchPreview
              orientation={orientation}
              variant={variant}
              animation={animation}
              chartKey={chartKey}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
