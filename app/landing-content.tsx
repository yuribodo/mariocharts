"use client";

import {
  HeroSection,
  ChartIndexSection,
  CodeDemoSection,
  CTASection,
  LandingFooter,
} from "@/components/landing";
import { WorldEntranceProvider } from "@/components/landing/world-entrance";

/**
 * Mario Charts Landing Page Content
 *
 * Opens with a site-level world entrance (welcome → portal), then the
 * immersive page: hero field, chart index, code demo, CTA, footer.
 */
export function LandingContent() {
  return (
    <WorldEntranceProvider>
      <div className="landing-page relative min-h-screen w-full bg-background">
        <div className="relative z-10">
          <HeroSection />
          <ChartIndexSection />
          <CodeDemoSection />
          <CTASection />
          <LandingFooter />
        </div>
      </div>
    </WorldEntranceProvider>
  );
}
