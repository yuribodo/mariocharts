"use client";

import { useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Copy, Check, ArrowRight } from "lucide-react";
import { MorphingChart } from "./morphing-chart";
import { cn } from "@/lib/utils";
import {
  heroTitle,
  heroSubtitle,
  staggerContainer,
  staggerItem,
  buttonHover,
  buttonTap,
} from "@/lib/animations";

interface HeroSectionProps {
  className?: string;
}

const CLI_COMMAND = "npx mario-charts add area";

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
  const [copied, setCopied] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CLI_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  const variants = shouldReduceMotion ? {} : staggerContainer;
  const itemVariants = shouldReduceMotion ? {} : staggerItem;

  return (
    <section
      className={cn(
        "relative min-h-screen w-full overflow-hidden",
        className
      )}
    >
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-20 lg:flex-row lg:items-center lg:justify-between lg:py-0">
        <motion.div
          className="flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left"
          variants={variants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={shouldReduceMotion ? {} : heroTitle}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Beautiful Charts.
            <br />
            <span className="text-primary">
              Zero Lock-in.
            </span>
          </motion.h1>

          <motion.p
            variants={shouldReduceMotion ? {} : heroSubtitle}
            className="mt-6 max-w-md text-lg text-muted-foreground"
          >
            The React chart library that looks amazing out-of-the-box.
            Copy-paste components. Full control. No vendor lock-in.
          </motion.p>

          <motion.div
            ref={commandRef}
            variants={itemVariants}
            className="mt-8 w-full max-w-md"
          >
            <div
              className={cn(
                "group relative flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3 backdrop-blur-sm transition-all",
                "hover:border-border/80 hover:bg-muted",
                copied && "border-green-500/50 bg-green-500/10"
              )}
            >
              <span className="text-muted-foreground">$</span>
              <code className="flex-1 font-mono text-sm text-foreground/80">
                {CLI_COMMAND}
              </code>
              <button
                onClick={handleCopy}
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                  "hover:bg-muted",
                  copied ? "text-green-500" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={copied ? "Copied!" : "Copy command"}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: copied ? [1, 1.2, 1] : 1,
                    rotate: copied ? [0, -10, 10, 0] : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </motion.div>

                {copied && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 rounded-lg bg-green-400"
                  />
                )}
              </button>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <motion.div whileHover={buttonHover} whileTap={buttonTap}>
              <Link
                href="/docs/installation"
                className={cn(
                  "group inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90"
                )}
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            <motion.div whileHover={buttonHover} whileTap={buttonTap}>
              <Link
                href="/docs/components"
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all",
                  "border border-border text-foreground",
                  "hover:border-border/80 hover:bg-muted"
                )}
              >
                Browse Components
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-12 flex w-full max-w-lg items-center justify-center lg:mt-0 lg:max-w-xl"
          initial={{ opacity: 0, scale: 0.9, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            duration: 1,
            delay: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <MorphingChart
            className="h-[300px] w-full sm:h-[350px] lg:h-[400px]"
            showLabel
          />
        </motion.div>
      </div>

    </section>
  );
}
