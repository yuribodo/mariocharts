"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { InteractiveCode } from "./interactive-code";
import { LivePreview } from "./live-preview";
import { getDefaultConfig, type DemoConfig, type DemoConfigKey } from "./types";

interface CodeDemoSectionProps {
  className?: string;
}

/**
 * Code Demo Section
 *
 * "Copy. Paste. Ship."
 *
 * Features:
 * - Interactive code editor with line numbers
 * - Live chart preview with smooth transitions
 * - Toggle pills for quick prop changes
 * - Copy with confetti celebration
 */
export function CodeDemoSection({ className }: CodeDemoSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [config, setConfig] = useState<DemoConfig>(getDefaultConfig);

  const handleConfigChange = (key: DemoConfigKey, value: boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const variants = shouldReduceMotion ? {} : staggerContainer;
  const itemVariants = shouldReduceMotion ? {} : staggerItem;

  return (
    <section
      className={cn(
        "relative overflow-hidden py-24 lg:py-32",
        className
      )}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 text-center"
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            variants={shouldReduceMotion ? {} : fadeInUp}
            className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl"
          >
            Copy. Paste.{" "}
            <span className="text-primary">
              Ship.
            </span>
          </motion.h2>
          <motion.p
            variants={shouldReduceMotion ? {} : fadeInUp}
            className="mt-4 text-lg text-muted-foreground"
          >
            Get beautiful charts in seconds. No configuration needed.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-12"
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div variants={itemVariants} className="h-full">
            <InteractiveCode
              config={config}
              onConfigChange={handleConfigChange}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            <LivePreview config={config} />
          </motion.div>
        </motion.div>

        <motion.p
          className="mt-12 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          Toggle options to customize in real-time. Copy the code when ready.
        </motion.p>
      </div>
    </section>
  );
}
