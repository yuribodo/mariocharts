"use client";

import {
  HeroSection,
  ChartIndexSection,
  CodeDemoSection,
  CTASection,
  LandingFooter,
} from "@/components/landing";

/**
 * Mario Charts Landing Page Content
 *
 * A 5-section immersive experience:
 * 1. Hero - Morphing chart animation
 * 2. Chart Index - Preview-first index of the shipped components
 * 3. Code Demo - Interactive code with live preview
 * 4. CTA - Final call-to-action
 * 5. Footer - Interactive chart and terminal-style links
 */
export function LandingContent() {
  return (
    <main className="landing-page relative min-h-screen w-full bg-background">
      <div className="relative z-10">
        <HeroSection />
        <ChartIndexSection />
        <CodeDemoSection />
        <CTASection />
        <LandingFooter />
      </div>
    </main>
  );
}
