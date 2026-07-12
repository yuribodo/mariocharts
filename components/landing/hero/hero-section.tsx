"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MorphingChart } from "./morphing-chart";
import { CommandSnippet } from "@/components/ui/command-snippet";
import { cn } from "@/lib/utils";
import {
  heroTitle,
  heroSubtitle,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";

interface HeroSectionProps {
  className?: string;
}

const CLI_COMMAND = "npx mario-charts@latest add bar-chart";

/**
 * Hero Section Component
 *
 * The first impression - designed to capture attention in 2 seconds.
 *
 * Layout:
 * - Left: Headline, subtitle, CTAs, CLI command
 * - Right: Morphing chart animation
 */
export function HeroSection({ className }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const variants = shouldReduceMotion ? {} : staggerContainer;
  const itemVariants = shouldReduceMotion ? {} : staggerItem;

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden border-b border-border",
        className,
      )}
    >
      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-7rem)] max-w-7xl items-center gap-8 px-6 py-8 sm:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-16">
        <motion.div
          className="flex max-w-xl flex-col items-start text-left"
          variants={variants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={shouldReduceMotion ? {} : heroTitle}
            className="text-4xl font-semibold leading-[1.02] tracking-normal text-foreground sm:text-5xl lg:text-6xl"
          >
            Beautiful data.
            <br />
            Readable code.
          </motion.h1>

          <motion.p
            variants={shouldReduceMotion ? {} : heroSubtitle}
            className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg"
          >
            Production-ready React charts copied into your codebase. Start with
            strong defaults, then shape every detail for your product.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 w-full max-w-lg"
          >
            <CommandSnippet command={CLI_COMMAND} />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/docs/installation"
              className="group inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Get Started
              <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/docs/components"
              className="inline-flex min-h-11 items-center rounded-md border px-5 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Browse Charts
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative flex min-h-[260px] w-full items-center justify-center overflow-hidden rounded-md border bg-card p-3 sm:min-h-[360px] sm:p-6 lg:min-h-[420px] lg:p-8"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <MorphingChart
            className="h-[230px] w-full sm:h-[320px] lg:h-[400px]"
            showLabel
          />
        </motion.div>
      </div>
    </section>
  );
}
