import type { Metadata } from "next";
import Link from "next/link";
import { markdownAlternate } from "@/lib/markdown-alternate";

export const metadata: Metadata = {
  title: "React Dashboard Examples",
  description:
    "Explore React dashboard examples for sales, revenue, and website analytics. Build your own with Mario Charts, TypeScript, Tailwind CSS, and the AI agent skill.",
  alternates: markdownAlternate("/examples"),
};

const dashboards = [
  {
    title: "Sales & Revenue",
    description:
      "Sales metrics, monthly revenue, targets, and sales team performance.",
    href: "/examples/dashboards/sales",
    chartCount: 5,
  },
  {
    title: "Website Analytics",
    description:
      "Website traffic, acquisition sources, engagement patterns, and conversion stages.",
    href: "/examples/dashboards/analytics",
    chartCount: 5,
  },
];

export default function ExamplesPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-16">
      <div className="mb-10 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Examples
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          React Dashboard Examples
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Pre-built dashboards showcasing Mario Charts components in real-world
          scenarios.
        </p>
      </div>

      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6">
        {dashboards.map((dashboard) => (
          <Link
            key={dashboard.href}
            href={dashboard.href}
            className="group rounded-xl border bg-card p-6 shadow-sm transition-colors hover:border-foreground/20 hover:bg-accent/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold group-hover:text-foreground">
                  {dashboard.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {dashboard.description}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {dashboard.chartCount} charts
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-sm leading-6 text-muted-foreground">
        Build a dashboard for your own data with the{" "}
        <Link
          href="/docs/ai-agents#build-dashboard"
          className="rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Mario Charts agent skill and dashboard guide
        </Link>
        .
      </p>
    </div>
  );
}
