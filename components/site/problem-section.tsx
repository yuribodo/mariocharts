"use client";

import { motion, useReducedMotion } from "framer-motion";
import { StickySection } from "./sticky-section";
import { AnimatedChartBackground } from "./animated-chart-bg";
import { ArrowDown } from "@phosphor-icons/react";

export function ProblemSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <StickySection
      id="problem"
      zIndex={10}
      background="bg-background"
    >
      <AnimatedChartBackground />

      <motion.div
        className="container mx-auto max-w-4xl px-4 text-center relative z-10"
        variants={shouldReduceMotion ? {} : containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground mb-6"
          variants={shouldReduceMotion ? {} : itemVariants}
        >
          Building charts shouldn't be{" "}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              this painful
            </span>
            <motion.div
              className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/70 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            />
          </span>
          .
        </motion.h2>

        <motion.p
          className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-4 max-w-3xl mx-auto"
          variants={shouldReduceMotion ? {} : itemVariants}
        >
          Most chart libraries are bloated, over-abstracted, or hard to customize.
        </motion.p>

        <motion.p
          className="text-xl md:text-2xl text-foreground font-medium leading-relaxed max-w-3xl mx-auto"
          variants={shouldReduceMotion ? {} : itemVariants}
        >
          MarioCharts gives you{" "}
          <span className="font-semibold">full control</span> — install once,
          edit locally, and own your code.
        </motion.p>

        <motion.div
          className="flex flex-col items-center gap-2 mt-12"
          variants={shouldReduceMotion ? {} : itemVariants}
        >
          <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
            See how it works
          </span>
          <motion.div
            animate={shouldReduceMotion ? {} : {
              y: [0, 8, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <ArrowDown className="w-6 h-6 text-muted-foreground" weight="bold" />
          </motion.div>
        </motion.div>
      </motion.div>
    </StickySection>
  );
}
