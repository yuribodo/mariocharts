"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Github, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, buttonHover, buttonTap } from "@/lib/animations";
import { BadgeToast } from "./badge-display";
import { useBadges } from "@/hooks";

interface CTASectionProps {
  className?: string;
}

const CLI_COMMAND = "npx mario-charts@latest init";

/**
 * CTA Section
 *
 * "Ready to build something beautiful?"
 *
 * The grand finale with:
 * - Compelling headline
 * - CLI command
 * - CTA buttons
 */
export function CTASection({ className }: CTASectionProps) {
  const [copied, setCopied] = useState(false);
  const [typedCommand, setTypedCommand] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const { lastUnlocked, clearLastUnlocked } = useBadges();

  // Typing animation for CLI command
  useEffect(() => {
    if (shouldReduceMotion) {
      setTypedCommand(CLI_COMMAND);
      setIsTyping(false);
      return;
    }

    let index = 0;
    const timer = setInterval(() => {
      if (index <= CLI_COMMAND.length) {
        setTypedCommand(CLI_COMMAND.slice(0, index));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [shouldReduceMotion]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CLI_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden py-24 lg:py-32",
        className
      )}
    >
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={shouldReduceMotion ? {} : staggerContainer}
        >
          <motion.h2
            variants={shouldReduceMotion ? {} : fadeInUp}
            className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl"
          >
            Ready to build something{" "}
            <span className="text-primary">
              beautiful
            </span>
            ?
          </motion.h2>

          {/* CLI command */}
          <motion.div
            variants={shouldReduceMotion ? {} : fadeInUp}
            className="mx-auto mt-10 max-w-lg"
          >
            <div
              onClick={handleCopy}
              className={cn(
                "group relative flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/50 px-5 py-4 backdrop-blur-sm transition-all",
                "hover:border-border/80 hover:bg-muted",
                copied && "border-green-500/50 bg-green-500/10"
              )}
            >
              <span className="text-muted-foreground">$</span>
              <code className="flex-1 font-mono text-foreground/80">
                {typedCommand}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-2 bg-foreground"
                  >
                    █
                  </motion.span>
                )}
              </code>
              <button
                onClick={handleCopy}
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                  "hover:bg-muted",
                  copied ? "text-green-500" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={copied ? "Copied!" : "Copy command"}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            variants={shouldReduceMotion ? {} : fadeInUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.div whileHover={buttonHover} whileTap={buttonTap}>
              <Link
                href="/docs"
                className={cn(
                  "group inline-flex items-center gap-2 rounded-xl px-8 py-4 font-medium transition-all",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90"
                )}
              >
                Read the Docs
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            <motion.div whileHover={buttonHover} whileTap={buttonTap}>
              <a
                href="https://github.com/yuribodo/mariocharts"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-8 py-4 font-medium transition-all",
                  "border border-border text-foreground",
                  "hover:border-border/80 hover:bg-muted"
                )}
              >
                <Github className="h-5 w-5" />
                Star on GitHub
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Badge toast */}
      <BadgeToast badge={lastUnlocked} onDismiss={clearLastUnlocked} />
    </section>
  );
}
