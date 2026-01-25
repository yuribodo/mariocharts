import type { Metadata } from "next";
import { LandingContent } from "./landing-content";

export const metadata: Metadata = {
  title: "Mario Charts - Beautiful React Chart Components",
  description:
    "Modern React component library focused on charts and dashboards with beautiful visuals out-of-the-box. Zero lock-in, copy-paste components built with TypeScript, Tailwind CSS, and Recharts.",
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
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Mario Charts - Beautiful React Chart Components",
    description:
      "Modern React component library focused on charts and dashboards with beautiful visuals out-of-the-box.",
    url: "https://mario-charts.dev",
    type: "website",
  },
};

export default function LandingPage() {
  return <LandingContent />;
}
