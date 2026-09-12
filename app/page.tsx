import type { Metadata } from "next";
import { markdownAlternate } from "@/lib/markdown-alternate";
import { LandingContent } from "./landing-content";

export const metadata: Metadata = {
  title: { absolute: "React Chart Library for Tailwind CSS | Mario Charts" },
  description:
    "Build dashboards with React chart components you own. Copy TypeScript and Tailwind CSS charts into your app with shadcn, or use the Mario Charts agent skill.",
  keywords: [
    "react charts",
    "react chart library",
    "chart components",
    "data visualization",
    "typescript charts",
    "tailwind charts",
    "dashboard components",
    "copy paste charts",
  ],
  alternates: markdownAlternate("/"),
  openGraph: {
    title: "React Chart Library for Tailwind CSS | Mario Charts",
    description:
      "React chart components you own. Install with shadcn or build with the Mario Charts agent skill. TypeScript, Tailwind CSS, and editable source.",
    url: "https://mariocharts.com",
    type: "website",
  },
};

export default function LandingPage() {
  return <LandingContent />;
}
