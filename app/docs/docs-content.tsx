"use client";

import { ChartBar, Book, Copy, Sparkle, Palette, Eye } from "@phosphor-icons/react";
import Link from "next/link";
import { AnimatedFAQ } from "../../components/ui/animated-faq";

const faqItems = [
  {
    question: "Can I use this in my project?",
    answer: "Yes. Mario Charts is completely free to use for personal and commercial projects. No attribution required, no licensing fees, no restrictions."
  },
  {
    question: "Do you plan to add more chart types?",
    answer: "Absolutely. We already ship bar charts, line charts, pie charts, radar charts, scatter plots, and stacked bar charts. We're actively developing area charts, heatmaps, and funnel charts."
  },
  {
    question: "Can I request a specific chart component?",
    answer: "Yes! Create an issue on our GitHub repository at https://github.com/yuribodo/mariocharts/issues with your component request. Include use cases and examples if possible. We prioritize components based on community demand."
  },
  {
    question: "How is this different from other chart libraries?",
    answer: "Unlike traditional libraries, you copy Mario Charts components directly into your codebase. This means zero lock-in, complete customization freedom, and no runtime dependencies to manage."
  }
];

export function DocsContent() {
  return (
    <div className="max-w-none">
      {/* Hero Section */}
      <div className="flex flex-col space-y-6 pb-16">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
          Introduction
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
          This is <span className="font-semibold text-foreground">not just a chart library</span>. This is how you build beautiful, customizable dashboards for your React applications.
        </p>
      </div>

      {/* Core Value Proposition */}
      <div className="pb-16">
        <div className="rounded-lg border bg-muted/20 p-8">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Copy and paste chart components into your apps. <span className="font-semibold text-foreground">Accessible</span>. <span className="font-semibold text-foreground">Customizable</span>. <span className="font-semibold text-foreground">Zero lock-in</span>.
          </p>
        </div>
      </div>

      {/* Core Principles */}
      <div>
        <div className="space-y-12 pb-16">
          <div>
            <h2 className="scroll-m-20 text-3xl font-bold tracking-tight mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Mario Charts is built on four core principles that make building beautiful dashboards a breeze.
            </p>
          </div>

        <div className="space-y-12">
          {/* Copy & Paste */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Copy size={24} className="text-primary" />
              <h3 className="text-xl font-semibold">Copy & Paste</h3>
            </div>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                Mario Charts components are designed to be copied directly into your codebase.
                You own the code and can modify it however you need.
              </p>
              <p>
                No NPM package installations. No version conflicts. No vendor lock-in.
                Just beautiful, working code that you can customize to your heart's content.
              </p>
            </div>
          </div>

          {/* Beautiful Defaults */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Sparkle size={24} className="text-primary" />
              <h3 className="text-xl font-semibold">Beautiful Defaults</h3>
            </div>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                Every component looks professional right out of the box. No configuration needed.
                Clean typography, thoughtful spacing, and carefully crafted color palettes.
              </p>
              <p>
                Built with accessibility in mind from day one. Proper ARIA labels, keyboard navigation,
                and screen reader support come standard.
              </p>
            </div>
          </div>

          {/* Infinite Customization */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Palette size={24} className="text-primary" />
              <h3 className="text-xl font-semibold">Infinite Customization</h3>
            </div>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                Since you own the code, you can customize every aspect. Change colors, add animations,
                modify layouts, or even completely rewrite components to fit your needs.
              </p>
              <p>
                Built with Tailwind CSS for utility-first styling and easy theming.
                Consistent design tokens make it simple to maintain visual coherence.
              </p>
            </div>
          </div>

          {/* Developer Experience */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Eye size={24} className="text-primary" />
              <h3 className="text-xl font-semibold">Developer Experience</h3>
            </div>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                Excellent TypeScript support with full type safety. Comprehensive documentation
                with live examples and code snippets for every component.
              </p>
              <p>
                AI-ready code structure makes it easy to understand, modify, and extend components
                using modern development tools and workflows.
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Getting Started */}
      <div>
        <div className="space-y-8 pb-16">
        <div>
          <h2 className="scroll-m-20 text-3xl font-bold tracking-tight mb-4">
            Get started
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Choose your path to building beautiful dashboards with Mario Charts.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/docs/installation"
            className="group relative rounded-lg border p-8 hover:border-primary/50 hover:shadow-md transition-[border-color,box-shadow] duration-200"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Book size={20} />
                </div>
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  Installation
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Install dependencies and configure your project with our CLI tool. Get up and running in under 5 minutes.
              </p>
              <div className="text-sm text-primary font-medium">
                Start here →
              </div>
            </div>
          </Link>

          <Link
            href="/docs/components/bar-chart"
            className="group relative rounded-lg border p-8 hover:border-primary/50 hover:shadow-md transition-[border-color,box-shadow] duration-200"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ChartBar size={20} />
                </div>
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  Components
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Explore our collection of chart components. Each comes with examples, props documentation, and copy-paste code.
              </p>
              <div className="text-sm text-primary font-medium">
                Browse components →
              </div>
            </div>
          </Link>
        </div>
      </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="space-y-8 pb-16">
        <div>
          <h2 className="scroll-m-20 text-3xl font-bold tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Everything you need to know about Mario Charts.
          </p>
        </div>

        <AnimatedFAQ items={faqItems} />
        </div>
      </div>
    </div>
  );
}
