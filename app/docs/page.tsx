import type { Metadata } from "next";
import { DocsContent } from "./docs-content";
import { FAQSchema } from "../../components/seo/json-ld";

export const metadata: Metadata = {
  title: "Introduction",
  description:
    "Learn how to build beautiful, customizable dashboards for your React applications with Mario Charts. Copy-paste chart components with zero lock-in.",
  keywords: [
    "react charts documentation",
    "chart components guide",
    "dashboard components",
    "typescript charts",
    "copy paste charts",
    "react data visualization",
  ],
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    title: "Introduction to Mario Charts",
    description:
      "Learn how to build beautiful, customizable dashboards for your React applications with Mario Charts.",
    url: "https://mariocharts.com/docs",
    type: "article",
  },
};

const faqItems = [
  {
    question: "Can I use Mario Charts in my project?",
    answer:
      "Yes. Mario Charts is completely free to use for personal and commercial projects. No attribution required, no licensing fees, no restrictions.",
  },
  {
    question: "Do you plan to add more chart types?",
    answer:
      "Absolutely. We're actively developing line charts, pie charts, area charts, and advanced visualizations like heatmaps and funnel charts.",
  },
  {
    question: "Can I request a specific chart component?",
    answer:
      "Yes! Create an issue on our GitHub repository with your component request. Include use cases and examples if possible. We prioritize components based on community demand.",
  },
  {
    question: "How is Mario Charts different from other chart libraries?",
    answer:
      "Unlike traditional libraries, you copy Mario Charts components directly into your codebase. This means zero lock-in, complete customization freedom, and no runtime dependencies to manage.",
  },
];

export default function DocsPage() {
  return (
    <>
      <FAQSchema items={faqItems} />
      <DocsContent />
    </>
  );
}
