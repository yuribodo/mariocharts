"use client";

import { motion, useReducedMotion, useScroll, useTransform, useSpring } from "framer-motion";
import { StickySection } from "./sticky-section";
import { Code, ChartBar } from "@phosphor-icons/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ComponentProps, useRef, useState } from "react";

type TailwindMarkProps = ComponentProps<"svg"> & { weight?: string };

const TailwindMark = ({ className, weight, ...props }: TailwindMarkProps) => {
  void weight;
  return (
    <svg
      viewBox="0 0 48 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M30 6c-6 0-9.6 2.8-11.1 8.6 2.1-3.4 4.2-4.4 6.3-3.5 1.3.5 2.2 1.9 3.4 3.9 1.9 3.1 4.1 6.8 9.7 6.8 6 0 9.6-2.8 11.1-8.6-2.1 3.4-4.2 4.4-6.3 3.5-1.3-.5-2.2-1.9-3.4-3.9C37.8 9.7 35.6 6 30 6Z"
        fill="currentColor"
      />
      <path
        d="M14 20c-6 0-9.6 2.8-11.1 8.6 2.1-3.4 4.2-4.4 6.3-3.5 1.3.5 2.2 1.9 3.4 3.9 1.9 3.1 4.1 6.8 9.7 6.8 6 0 9.6-2.8 11.1-8.6-2.1 3.4-4.2 4.4-6.3 3.5-1.3-.5-2.2-1.9-3.4-3.9C21.8 23.7 19.6 20 14 20Z"
        fill="currentColor"
      />
    </svg>
  );
};

const features = [
  {
    icon: Code,
    title: "Local Code",
    description: "Components live in your project. Total flexibility."
  },
  {
    icon: ChartBar,
    title: "Chart-Focused",
    description: "Line, Bar, and Stacked Bar out of the box."
  },
  {
    icon: TailwindMark,
    title: "Tailwind-Ready",
    description: "Styled like your app, not someone else's."
  }
];

export function FeaturesSection() {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Scroll progress tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.6", "end 0.9"]
  });

  // Smooth spring animation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 25,
    mass: 0.8
  });

  // Card positions - start together (0) and separate
  const x1 = useTransform(smoothProgress, [0, 0.6, 1], [0, -260, -260]);
  const x2 = useTransform(smoothProgress, [0, 0.6, 1], [0, 0, 0]);
  const x3 = useTransform(smoothProgress, [0, 0.6, 1], [0, 260, 260]);

  // Rotation for depth
  const rotate1 = useTransform(smoothProgress, [0, 0.6, 1], [0, -2, -2]);
  const rotate2 = useTransform(smoothProgress, [0, 0.6, 1], [0, 0, 0]);
  const rotate3 = useTransform(smoothProgress, [0, 0.6, 1], [0, 2, 2]);

  // Shared animations
  const opacity = useTransform(smoothProgress, [0, 0.3, 0.6, 1], [0.4, 0.7, 1, 1]);
  const scale = useTransform(smoothProgress, [0, 0.4, 0.7, 1], [0.88, 0.94, 1, 1]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <StickySection
      id="features"
      zIndex={20}
      background="bg-secondary"
    >
      <motion.div
        ref={containerRef}
        className="container mx-auto max-w-7xl px-4 py-12 relative z-10"
        variants={shouldReduceMotion ? {} : containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground mb-6"
            variants={shouldReduceMotion ? {} : itemVariants}
          >
            Simple. Local.{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Powerful
              </span>
              <motion.div
                className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/70 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
              />
            </span>
            .
          </motion.h2>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
            variants={shouldReduceMotion ? {} : itemVariants}
          >
            Build modern charts with{" "}
            <span className="text-foreground font-medium">full code ownership</span> —
            no black boxes, no hidden dependencies.
          </motion.p>
        </div>

        {/* Phantom Expansion Cards */}
        <div
          className="relative min-h-[480px] mb-16 flex items-center justify-center"
          style={{ perspective: "1500px" }}
        >
          <div className="relative w-full flex items-center justify-center">
            {features.map((feature, index) => {
              // Select transforms
              let xTransform = x2;
              let rotateTransform = rotate2;

              if (index === 0) {
                xTransform = x1;
                rotateTransform = rotate1;
              }
              if (index === 2) {
                xTransform = x3;
                rotateTransform = rotate3;
              }

              return (
                <motion.div
                  key={feature.title}
                  className="absolute"
                  style={{
                    x: shouldReduceMotion ? (index - 1) * 340 : xTransform,
                    opacity: shouldReduceMotion ? 1 : opacity,
                    scale: shouldReduceMotion ? 1 : scale,
                    rotateZ: shouldReduceMotion ? 0 : rotateTransform,
                    zIndex: hoveredCard === index ? 40 : 20 - index,
                  }}
                  onHoverStart={() => setHoveredCard(index)}
                  onHoverEnd={() => setHoveredCard(null)}
                >
                  {/* Card - Rectangular with enhanced depth */}
                  <motion.div
                    className="group relative flex h-[420px] w-72 flex-col overflow-hidden rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl"
                    style={{
                      transformStyle: "preserve-3d",
                      boxShadow: hoveredCard === index
                        ? "0 25px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(var(--primary), 0.1)"
                        : "0 15px 40px -8px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(var(--border), 0.08)"
                    }}
                    whileHover={shouldReduceMotion ? {} : {
                      rotateY: 3,
                      rotateX: -3,
                      scale: 1.04,
                      y: -6,
                      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                    }}
                  >
                    {/* Media block */}
                    <div className="flex-[0_0_65%] px-7 pt-7">
                      <motion.div
                        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-muted/40 transition-colors duration-300 group-hover:border-border/30 group-hover:bg-muted/30"
                        animate={hoveredCard === index && !shouldReduceMotion ? {
                          scale: [1, 1.02, 1],
                          rotateX: [0, -2, 0]
                        } : {}}
                        transition={hoveredCard === index && !shouldReduceMotion ? { duration: 1.2, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" } : { duration: 0.4 }}
                      >
                        <div
                          className="absolute inset-0 opacity-[0.12]"
                          style={{
                            backgroundImage: "radial-gradient(circle at 50% 35%, rgba(148, 163, 184, 0.18), transparent 65%)"
                          }}
                        />
                        <div
                          className="absolute inset-0 opacity-[0.08]"
                          style={{
                            backgroundImage: "linear-gradient(135deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)",
                            backgroundSize: "28px 28px"
                          }}
                        />
                        {feature.icon && (
                          <feature.icon className="relative h-24 w-24 text-muted-foreground/70" weight="fill" />
                        )}
                      </motion.div>
                    </div>

                    {/* Card Content */}
                    <div className="relative flex flex-1 flex-col gap-4 px-7 pb-7">
                      <h3 className="text-xl font-semibold text-foreground tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>

                      {/* Code Snippet */}
                      {feature.codeSnippet && (
                        <motion.div
                          className="mt-auto rounded-xl border border-border/40 bg-muted/40 px-4 py-3 font-mono text-xs backdrop-blur-sm"
                          style={{
                            borderColor: hoveredCard === index
                              ? 'rgba(var(--primary), 0.2)'
                              : 'rgba(var(--border), 0.4)'
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <code className="text-foreground">
                            <span className="text-muted-foreground">&lt;</span>
                            <span className="text-primary font-semibold">BarChart</span>
                            <span className="text-muted-foreground"> </span>
                            <span className="text-foreground/80">data</span>
                            <span className="text-muted-foreground">=&#123;</span>
                            <span className="text-foreground/80">data</span>
                            <span className="text-muted-foreground">&#125; /&gt;</span>
                          </code>
                        </motion.div>
                      )}

                      {/* Bottom accent */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                        style={{ opacity: hoveredCard === index ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center"
          variants={shouldReduceMotion ? {} : itemVariants}
        >
          <Link href="/docs">
            <motion.div
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-200 group relative overflow-hidden"
              whileHover={shouldReduceMotion ? {} : { scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="relative z-10">Explore the Docs</span>
              <ArrowRight
                className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-200"
                strokeWidth={2.5}
              />
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </StickySection>
  );
}
