"use client";

import Link from "next/link";
import { ArrowRight, Copy, Check } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { MacbookScroll } from "../src/components/ui/macbook-scroll";
import { MiniBarChart } from "../components/ui/mini-bar-chart";
import { MiniLineChart } from "../components/ui/mini-line-chart";
import { BarChart } from "../src/components/charts/bar-chart";
import { Logo } from "../components/site/logo";
import { ProblemSection } from "../components/site/problem-section";
import { FeaturesSection } from "../components/site/features-section";

export default function Home() {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText('npx mario-charts@latest init');
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen scroll-smooth" style={{ scrollSnapType: 'y mandatory' }}>
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 text-center min-h-[90vh] overflow-hidden snap-start">
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 -z-10">
          <div 
            className="absolute inset-0 opacity-[0.25] dark:opacity-[0.15]"
            style={{
              backgroundImage: `
                linear-gradient(hsl(0 0% 0% / 0.8) 1px, transparent 1px),
                linear-gradient(90deg, hsl(0 0% 0% / 0.8) 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px',
              maskImage: 'radial-gradient(ellipse 1000px 500px at center, black 0%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse 1000px 500px at center, black 0%, transparent 70%)'
            }}
          />
          {/* Dark theme grid overlay */}
          <div 
            className="absolute inset-0 opacity-0 dark:opacity-[0.2]"
            style={{
              backgroundImage: `
                linear-gradient(hsl(0 0% 100% / 0.6) 1px, transparent 1px),
                linear-gradient(90deg, hsl(0 0% 100% / 0.6) 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px',
              maskImage: 'radial-gradient(ellipse 1000px 500px at center, black 0%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse 1000px 500px at center, black 0%, transparent 70%)'
            }}
          />
        </div>

        <div className="container mx-auto max-w-6xl relative">

          {/* Mini Chart - Top Left (8pt grid positioning) */}
          <motion.div
            className="absolute top-8 left-8 md:top-12 md:left-16 lg:top-16 lg:left-20 mini-chart-simple transition-all duration-300 hidden sm:block pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
          >
            <MiniBarChart delay={1.2} />
          </motion.div>

          {/* Mini Chart - Bottom Right (8pt grid positioning) */}
          <motion.div
            className="absolute bottom-8 right-8 md:bottom-12 md:right-16 lg:bottom-16 lg:right-20 mini-chart-simple transition-all duration-300 hidden sm:block pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.4, ease: "easeOut" }}
          >
            <MiniLineChart delay={1.4} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <motion.h1
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="text-foreground">
                Build{" "}
              </span>
              <span className="relative bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Beautiful
                <motion.div
                  className="absolute -bottom-1 left-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/70 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
                />
              </span>
              <br />
              <span className="text-primary font-black">
                Dashboards
              </span>
            </motion.h1>
            
            <motion.p
              className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="font-semibold text-foreground">Copy-paste React components</span> for creating stunning, accessible charts. 
              No dependencies. No lock-in. Just beautiful code you own.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 pt-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link
                href="/docs"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 py-2"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              
              <Link
                href="/docs/components/bar-chart"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-8 py-2"
              >
                <Logo size={16} className="mr-2" />
                Components
              </Link>
            </motion.div>

            <motion.div
              className="group relative flex items-center justify-between rounded-lg bg-muted/60 border-2 border-border/60 p-3 font-mono text-xs sm:text-sm max-w-lg mx-auto mt-8 backdrop-blur-sm hover:bg-muted/80 hover:border-border/90 hover:shadow-md transition-all duration-300 cursor-pointer touch-manipulation active:bg-muted/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              onClick={handleCopyCommand}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Terminal prompt */}
              <div className="flex items-center gap-3 flex-1">
                <span className="text-muted-foreground/80">$</span>
                <code className="text-foreground font-medium tracking-tight">npx mario-charts@latest init</code>
              </div>

              {/* Copy button with icon transition */}
              <motion.div 
                className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-background/80 transition-colors duration-200 ml-3"
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {copySuccess ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.2 }}
                      className="text-green-500"
                    >
                      <Check className="h-4 w-4" weight="bold" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.2 }}
                      className="text-muted-foreground group-hover:text-foreground transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Modern tooltip */}
              <motion.div
                className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-md shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                initial={false}
              >
                <span className="whitespace-nowrap">
                  {copySuccess ? '✓ Copied to clipboard' : 'Click to copy'}
                </span>
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
              </motion.div>

              {/* Success ripple effect */}
              <AnimatePresence>
                {copySuccess && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-green-500/50 bg-green-500/10"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: [0.8, 1.02, 1], 
                      opacity: [0, 1, 0] 
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sticky Scroll Sections */}
      <ProblemSection />
      <FeaturesSection />
    </div>
  );
}