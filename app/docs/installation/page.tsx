import type { Metadata } from "next";
import { InstallationContent } from "./installation-content";
import { BreadcrumbSchema } from "../../../components/seo/json-ld";

export const metadata: Metadata = {
  title: "Installation",
  description:
    "Install and configure Mario Charts in your React project. Quick start with CLI or manual installation guide with step-by-step instructions.",
  keywords: [
    "mario charts installation",
    "react chart setup",
    "chart library install",
    "npm install charts",
    "typescript chart setup",
    "tailwind charts config",
  ],
  alternates: {
    canonical: "/docs/installation",
  },
  openGraph: {
    title: "Installation Guide | Mario Charts",
    description:
      "Install and configure Mario Charts in your React project with our CLI or manual setup guide.",
    url: "https://mariocharts.com/docs/installation",
    type: "article",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://mariocharts.com" },
  { name: "Docs", url: "https://mariocharts.com/docs" },
  { name: "Installation", url: "https://mariocharts.com/docs/installation" },
];

export default function InstallationPage() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <InstallationContent />
    </>
  );
}
