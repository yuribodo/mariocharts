"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { AnimatedFAQ } from "../../components/ui/animated-faq";
import { CommandSnippet } from "../../components/ui/command-snippet";

const principles = [
  {
    title: "Own the source",
    description:
      "Components are copied into your application. Read them, change them, and ship them without a runtime lock-in.",
  },
  {
    title: "Start with strong defaults",
    description:
      "Responsive layout, accessible interactions, thoughtful labels, and production-ready states are part of the starting point.",
  },
  {
    title: "Customize without a ceiling",
    description:
      "Use the simple API first, then work directly with the TypeScript and Tailwind source when your product needs more.",
  },
] as const;

const faqItems = [
  {
    question: "Can I use this in a commercial project?",
    answer:
      "Yes. Mario Charts is free for personal and commercial projects. No attribution or licensing fee is required.",
  },
  {
    question: "Which chart types are available?",
    answer:
      "The registry includes bar, line, area, pie, radar, scatter, stacked bar, gauge, heatmap, funnel, and treemap charts.",
  },
  {
    question: "Can I request a component?",
    answer:
      "Open an issue in the Mario Charts GitHub repository with the analytical use case, expected data shape, and relevant examples.",
  },
  {
    question: "How is this different from a chart package?",
    answer:
      "You install the source of each component into your project. That gives you full control over behavior, styling, and upgrades.",
  },
];

export function DocsContent() {
  return (
    <article className="pb-20">
      <header className="border-b pb-10">
        <p className="mb-3 text-sm font-medium text-muted-foreground">Overview</p>
        <h1 className="scroll-m-20 text-4xl font-semibold tracking-normal text-foreground">
          Mario Charts
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          Copy production-ready chart components into your React application.
          You own every line.
        </p>
      </header>

      <section aria-labelledby="quickstart-title" className="border-b py-10">
        <div className="mb-6">
          <h2 id="quickstart-title" className="text-2xl font-semibold">
            Start in one minute
          </h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Initialize the registry, then add only the charts your product needs.
          </p>
        </div>
        <CommandSnippet
          command="npx mario-charts@latest init"
          label="Initialize Mario Charts"
        />
      </section>

      <section aria-labelledby="principles-title" className="py-10">
        <h2 id="principles-title" className="text-2xl font-semibold">
          Built for ownership
        </h2>
        <div className="mt-6 border-y">
          {principles.map((principle, index) => (
            <div
              key={principle.title}
              className="grid gap-3 py-6 sm:grid-cols-[180px_1fr] sm:gap-8 [&:not(:last-child)]:border-b"
            >
              <h3
                data-index={`0${index + 1}`}
                className="text-sm font-semibold text-foreground before:mr-3 before:font-mono before:text-xs before:font-normal before:text-muted-foreground before:content-[attr(data-index)]"
              >
                {principle.title}
              </h3>
              <p className="leading-7 text-muted-foreground">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <nav aria-label="Documentation next steps" className="grid border-y sm:grid-cols-2">
        <Link
          href="/docs/components"
          aria-label="Browse charts"
          className="group flex min-h-24 items-center justify-between gap-4 px-5 py-6 transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:border-r"
        >
          <span>
            <span className="block text-xs text-muted-foreground">Explore</span>
            <span className="mt-1 block font-medium">Browse charts</span>
          </span>
          <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-1" />
        </Link>
        <Link
          href="/docs/installation"
          aria-label="Read installation guide"
          className="group flex min-h-24 items-center justify-between gap-4 border-t px-5 py-6 transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:border-t-0"
        >
          <span>
            <span className="block text-xs text-muted-foreground">Continue</span>
            <span className="mt-1 block font-medium">
              Read installation guide
            </span>
          </span>
          <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-1" />
        </Link>
      </nav>

      <section aria-labelledby="faq-title" className="pt-14">
        <h2 id="faq-title" className="text-2xl font-semibold">
          Frequently asked questions
        </h2>
        <div className="mt-6">
          <AnimatedFAQ items={faqItems} />
        </div>
      </section>
    </article>
  );
}
