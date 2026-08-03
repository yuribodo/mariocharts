"use client";

import { Braces, Code2, FileCode2 } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";
import {
  AGENT_READY_BULLETS,
  AGENT_READY_EYEBROW,
  AGENT_READY_HEADLINE,
  AGENT_READY_SUPPORT,
} from "./agent-ready-content";
import { AgentReadyPrompt } from "./agent-ready-prompt";

interface AgentReadySectionProps {
  className?: string;
}

const BULLET_ICONS = [FileCode2, Code2, Braces] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

const introVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const introItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
};

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

const promptVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE, delay: 0.08 },
  },
};

/**
 * Agent-ready landing section.
 *
 * Sticky belief on the left, staggered checklist + prompt on the right —
 * quiet proof that Mario Charts is easy for AI coding agents.
 */
export function AgentReadySection({ className }: AgentReadySectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="agent-ready-title"
      className={cn("border-b", className)}
    >
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-16 xl:gap-24">
          {/*
            self-start is required: grid items stretch by default, which makes
            the sticky column as tall as the right column and kills sticky.
          */}
          <motion.div
            className="lg:sticky lg:top-24 lg:self-start"
            variants={shouldReduceMotion ? undefined : introVariants}
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            <motion.p
              variants={shouldReduceMotion ? undefined : introItemVariants}
              className="font-mono text-xs uppercase tracking-wide text-muted-foreground"
            >
              {AGENT_READY_EYEBROW}
            </motion.p>
            <motion.h2
              id="agent-ready-title"
              variants={shouldReduceMotion ? undefined : introItemVariants}
              className="mt-3 max-w-md text-balance text-2xl font-semibold tracking-normal text-foreground sm:text-3xl lg:text-4xl"
            >
              {AGENT_READY_HEADLINE}
            </motion.h2>
            <motion.p
              variants={shouldReduceMotion ? undefined : introItemVariants}
              className="mt-4 max-w-md text-pretty text-base leading-7 text-muted-foreground"
            >
              {AGENT_READY_SUPPORT}
            </motion.p>
          </motion.div>

          <div className="mt-12 lg:mt-0 lg:pb-40 lg:pt-2">
            <motion.ul
              className="space-y-0 divide-y border-y"
              variants={shouldReduceMotion ? undefined : listVariants}
              initial={shouldReduceMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {AGENT_READY_BULLETS.map((bullet, index) => {
                const Icon = BULLET_ICONS[index] ?? FileCode2;

                return (
                  <motion.li
                    key={bullet.title}
                    variants={shouldReduceMotion ? undefined : listItemVariants}
                    className="flex gap-4 py-8 first:pt-8 last:pb-8"
                  >
                    <span
                      className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground"
                      aria-hidden="true"
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {bullet.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {bullet.body}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>

            <motion.div
              className="mt-12"
              variants={shouldReduceMotion ? undefined : promptVariants}
              initial={shouldReduceMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <AgentReadyPrompt />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
