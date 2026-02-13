"use client";

import { CodeBlock } from "../../../components/ui/code-block";
import Link from "next/link";
import {
  CheckCircle,
  ArrowRight
} from "@phosphor-icons/react";

export function InstallationContent() {
  return (
    <div className="max-w-none">
      {/* Introduction */}
      <div>
        <div className="flex flex-col space-y-4 pb-12">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
            Installation
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
            Install and configure Mario Charts in your React project.
          </p>
        </div>
      </div>

      {/* Quick Start */}
      <div>
        <div className="space-y-8 pb-16">
        <div>
          <h2 className="scroll-m-20 border-b pb-4 text-3xl font-semibold tracking-tight first:mt-0">
            Quick Start
          </h2>
          <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
            The easiest way to get started is using the Mario Charts CLI. It automatically handles dependencies, configuration, and file setup.
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Initialize your project</h3>
            <CodeBlock
              code="npx mario-charts@latest init"
              language="bash"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Add components</h3>
            <CodeBlock
              code="npx mario-charts@latest add bar-chart"
              language="bash"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Start using in your code</h3>
            <CodeBlock
              code={`import { BarChart } from "@/components/charts/bar-chart";

const data = [
  { month: "Jan", revenue: 4500 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 4800 }
];

export function Dashboard() {
  return (
    <BarChart
      data={data}
      x="month"
      y="revenue"
    />
  );
}`}
              language="tsx"
            />
          </div>

          <div className="border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 bg-emerald-50 dark:bg-emerald-950">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">You're all set!</h4>
            </div>
            <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed">
              That's it! The CLI automatically installed dependencies, configured your project, and added the component files. You can now use Mario Charts components in your React application.
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* Manual Installation */}
      <div>
        <div className="space-y-8 pb-16">
        <div>
          <h2 className="scroll-m-20 border-b pb-4 text-3xl font-semibold tracking-tight">
            Manual Installation
          </h2>
          <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
            If you prefer to configure everything manually, follow these steps.
          </p>
        </div>

        <div className="space-y-12">
          {/* Step 1: Dependencies */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-semibold">1</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Install dependencies</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Install the required peer dependencies for Mario Charts components.
                </p>
              </div>
            </div>

            <CodeBlock
              code={`npm install recharts framer-motion \\
  @radix-ui/react-tooltip \\
  class-variance-authority clsx tailwind-merge`}
              language="bash"
            />
          </div>

          {/* Step 2: Tailwind Config */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-semibold">2</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Configure Tailwind CSS</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Add chart colors to your <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">tailwind.config.ts</code> file.
                </p>
              </div>
            </div>

            <CodeBlock
              language="typescript"
              code={`import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        chart: {
          "1": "hsl(239 84% 67%)",
          "2": "hsl(262 83% 58%)",
          "3": "hsl(180 98% 31%)",
          "4": "hsl(47 96% 53%)",
          "5": "hsl(339 82% 67%)",
        },
      },
    },
  },
  plugins: [],
};

export default config;`}
            />
          </div>

          {/* Step 3: CSS Variables */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-semibold">3</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Add global CSS</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Add chart color variables to your global CSS file.
                </p>
              </div>
            </div>

            <CodeBlock
              language="css"
              code={`@import "tailwindcss";

:root {
  --chart-1: 239 84% 67%;
  --chart-2: 262 83% 58%;
  --chart-3: 180 98% 31%;
  --chart-4: 47 96% 53%;
  --chart-5: 339 82% 67%;
}`}
            />
          </div>

          {/* Step 4: Utils */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-semibold">4</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Create utils file</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Create <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">lib/utils.ts</code> for the utility function.
                </p>
              </div>
            </div>

            <CodeBlock
              language="typescript"
              code={`import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`}
            />
          </div>
        </div>
      </div>
      </div>

      {/* Next Steps */}
      <div>
        <div className="space-y-8">
        <div>
          <h2 className="scroll-m-20 border-b pb-4 text-3xl font-semibold tracking-tight">
            Next Steps
          </h2>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">You're ready to go!</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                That's it! You can now start using Mario Charts components in your project.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/docs/components/bar-chart"
                className="inline-flex items-center justify-center rounded-lg text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6"
              >
                Start with Bar Chart <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/docs/components"
                className="inline-flex items-center justify-center rounded-lg text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-6"
              >
                Browse Components
              </Link>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Need help? Explore the component library in the sidebar or check back soon for more documentation.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
