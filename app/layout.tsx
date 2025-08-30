import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "../components/site/theme-provider";
import { SiteHeader } from "../components/site/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mario Charts - Beautiful React Chart Components",
  description: "Modern React component library focused on charts and dashboards with beautiful visuals out-of-the-box. Zero lock-in, copy-paste components built with TypeScript, Tailwind CSS, and Recharts.",
  keywords: ["react", "charts", "components", "dashboard", "typescript", "tailwind", "recharts"],
  authors: [{ name: "Mario Charts Team" }],
  creator: "Mario Charts",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mario-charts.dev",
    title: "Mario Charts - Beautiful React Chart Components",
    description: "Modern React component library focused on charts and dashboards with beautiful visuals out-of-the-box.",
    siteName: "Mario Charts",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mario Charts - Beautiful React Chart Components",
    description: "Modern React component library focused on charts and dashboards with beautiful visuals out-of-the-box.",
    creator: "@mariocharts",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
