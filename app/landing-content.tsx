"use client";

import {
  HeroSection,
  ShowcaseSection,
  CodeDemoSection,
  CTASection,
  LandingFooter,
  EasterEggsProvider,
} from "@/components/landing";
import { LandingBackground } from "@/components/landing/shared/landing-background";

/**
 * Mario Charts Landing Page Content
 *
 * A 5-section immersive experience:
 * 1. Hero - Morphing chart animation
 * 2. Showcase - Apple-style sticky scroll
 * 3. Code Demo - Interactive code with live preview
 * 4. CTA - Final call-to-action with easter eggs
 * 5. Footer - Interactive chart and terminal-style links
 */
export function LandingContent() {
  return (
    <EasterEggsProvider>
      <main className="landing-page relative min-h-screen w-full bg-background">
        <LandingBackground className="z-0" />

        <div className="relative z-10">
          <HeroSection />
          <ShowcaseSection />
          <CodeDemoSection />
          <CTASection />
          <LandingFooter />
        </div>
      </main>
    </EasterEggsProvider>
  );
}
