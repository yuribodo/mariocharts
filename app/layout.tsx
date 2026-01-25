import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "../components/site/theme-provider";
import { SiteHeader } from "../components/site/site-header";
import {
  OrganizationSchema,
  SoftwareSourceCodeSchema,
  WebSiteSchema,
} from "../components/seo/json-ld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mariocharts.com"),
  title: {
    default: "Mario Charts - Beautiful React Chart Components",
    template: "%s | Mario Charts",
  },
  description:
    "Modern React component library focused on charts and dashboards with beautiful visuals out-of-the-box. Zero lock-in, copy-paste components built with TypeScript, Tailwind CSS, and Recharts.",
  keywords: [
    "react charts",
    "react chart library",
    "react data visualization",
    "typescript charts",
    "tailwind charts",
    "recharts components",
    "dashboard components",
    "bar chart react",
    "line chart react",
    "pie chart react",
    "copy paste charts",
    "shadcn charts",
  ],
  authors: [{ name: "Mario Charts Team" }],
  creator: "Mario Charts",
  publisher: "Mario Charts",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mariocharts.com",
    title: "Mario Charts - Beautiful React Chart Components",
    description:
      "Modern React component library focused on charts and dashboards with beautiful visuals out-of-the-box. Zero lock-in, copy-paste components.",
    siteName: "Mario Charts",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mario Charts - Beautiful React Chart Components",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mario Charts - Beautiful React Chart Components",
    description:
      "Modern React component library focused on charts and dashboards with beautiful visuals out-of-the-box.",
    creator: "@mariocharts",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/mario-charts-logo-peak.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/mario-charts-logo-peak.svg" type="image/svg+xml" />
        <OrganizationSchema />
        <SoftwareSourceCodeSchema />
        <WebSiteSchema />
      </head>
      <body 
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
