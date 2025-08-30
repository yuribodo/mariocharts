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
    icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIFJvdW5kZWQgc3F1YXJlIGJhY2tncm91bmQgLS0+CiAgPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNiIgZmlsbD0iIzAwMDAwMCIvPgogIAogIDwhLS0gQmFyIGNoYXJ0IGJhcnMgLS0+CiAgPHJlY3QgeD0iOCIgeT0iMjAiIHdpZHRoPSIzIiBoZWlnaHQ9IjgiIHJ4PSIxLjUiIGZpbGw9IndoaXRlIi8+CiAgPHJlY3QgeD0iMTIuNSIgeT0iMTYiIHdpZHRoPSIzIiBoZWlnaHQ9IjEyIiByeD0iMS41IiBmaWxsPSJ3aGl0ZSIvPgogIDxyZWN0IHg9IjE3IiB5PSIxMiIgd2lkdGg9IjMiIGhlaWdodD0iMTYiIHJ4PSIxLjUiIGZpbGw9IndoaXRlIi8+CiAgPHJlY3QgeD0iMjEuNSIgeT0iOCIgd2lkdGg9IjMiIGhlaWdodD0iMjAiIHJ4PSIxLjUiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==",
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
        <link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIFJvdW5kZWQgc3F1YXJlIGJhY2tncm91bmQgLS0+CiAgPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNiIgZmlsbD0iIzAwMDAwMCIvPgogIAogIDwhLS0gQmFyIGNoYXJ0IGJhcnMgLS0+CiAgPHJlY3QgeD0iOCIgeT0iMjAiIHdpZHRoPSIzIiBoZWlnaHQ9IjgiIHJ4PSIxLjUiIGZpbGw9IndoaXRlIi8+CiAgPHJlY3QgeD0iMTIuNSIgeT0iMTYiIHdpZHRoPSIzIiBoZWlnaHQ9IjEyIiByeD0iMS41IiBmaWxsPSJ3aGl0ZSIvPgogIDxyZWN0IHg9IjE3IiB5PSIxMiIgd2lkdGg9IjMiIGhlaWdodD0iMTYiIHJ4PSIxLjUiIGZpbGw9IndoaXRlIi8+CiAgPHJlY3QgeD0iMjEuNSIgeT0iOCIgd2lkdGg9IjMiIGhlaWdodD0iMjAiIHJ4PSIxLjUiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==" type="image/svg+xml" />
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
