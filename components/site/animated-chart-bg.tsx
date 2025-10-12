"use client";

import { motion } from "framer-motion";

export function AnimatedChartBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Subtle data grid pattern - matches hero grid */}
      <div
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.1]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(0 0% 0% / 0.8) 1px, transparent 1px),
            linear-gradient(90deg, hsl(0 0% 0% / 0.8) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 800px 600px at center, black 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 800px 600px at center, black 0%, transparent 75%)'
        }}
      />

      {/* Dark theme grid overlay */}
      <div
        className="absolute inset-0 opacity-0 dark:opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(0 0% 100% / 0.6) 1px, transparent 1px),
            linear-gradient(90deg, hsl(0 0% 100% / 0.6) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 800px 600px at center, black 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 800px 600px at center, black 0%, transparent 75%)'
        }}
      />

      {/* Animated line chart effect - adapts to theme */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06] dark:opacity-[0.08]"
        preserveAspectRatio="none"
        viewBox="0 0 1200 600"
      >
        <motion.path
          d="M0,300 Q300,150 600,250 T1200,200"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-foreground"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.06 }}
          transition={{
            pathLength: { duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 },
            opacity: { duration: 0.5 }
          }}
        />
        <motion.path
          d="M0,350 Q300,200 600,300 T1200,250"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-muted-foreground"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.04 }}
          transition={{
            pathLength: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2 },
            opacity: { duration: 0.5, delay: 0.3 }
          }}
        />
      </svg>
    </div>
  );
}
