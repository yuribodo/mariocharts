"use client";

import Link from "next/link";
import {
  ChartBar,
  ChartBarHorizontal,
  ChartLine,
  ChartPie,
  ChartPolar,
  ChartScatter,
} from "@phosphor-icons/react";

const availableComponents = [
  {
    name: "Bar Chart",
    href: "/docs/components/bar-chart",
    description: "Vertical and horizontal bar charts for categorical data",
    icon: ChartBar,
  },
  {
    name: "Line Chart",
    href: "/docs/components/line-chart",
    description: "Interactive line charts for time series and trend analysis",
    icon: ChartLine,
  },
  {
    name: "Pie Chart",
    href: "/docs/components/pie-chart",
    description: "Pie and donut charts for parts-to-whole insights",
    icon: ChartPie,
  },
  {
    name: "Radar Chart",
    href: "/docs/components/radar-chart",
    description: "Radar charts for multi-metric comparisons",
    icon: ChartPolar,
  },
  {
    name: "Scatter Plot",
    href: "/docs/components/scatter-plot",
    description: "Scatter and bubble plots for correlation analysis",
    icon: ChartScatter,
  },
  {
    name: "Stacked Bar Chart",
    href: "/docs/components/stacked-bar-chart",
    description: "Multi-category stacked bars for composition analysis",
    icon: ChartBarHorizontal,
  },
];

export default function ComponentsPage() {
  return (
    <div className="max-w-none">
      <div className="flex flex-col space-y-4 pb-8 pt-6">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
          Components
        </h1>
        <p className="text-xl text-muted-foreground">
          Beautiful, accessible React components for charts and dashboards.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 id="available-components" className="text-2xl font-bold mb-6">Available Components</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {availableComponents.map((component) => {
              const Icon = component.icon;
              
              return (
                <Link
                  key={component.name}
                  href={component.href}
                  className="group block rounded-lg border p-6 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon size={20} weight="duotone" className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{component.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {component.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
