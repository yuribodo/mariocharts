"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Copy,
  Check,
  SlidersHorizontal,
  Sparkles,
  Spline,
  Circle,
  Tag,
  Play,
  Minus
} from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { confettiConfig } from "@/lib/animations";
import { useBadges } from "@/hooks";
import { DEMO_CONFIG, type DemoConfig, type DemoConfigKey } from "./types";
import { DemoCard } from "./demo-card";

interface InteractiveCodeProps {
  className?: string;
  config: DemoConfig;
  onConfigChange: (key: DemoConfigKey, value: boolean) => void;
}

// Icons for each prop
const PROP_ICONS: Record<DemoConfigKey, React.ReactNode> = {
  gradient: <Sparkles className="h-3.5 w-3.5" />,
  smooth: <Spline className="h-3.5 w-3.5" />,
  showDots: <Circle className="h-3.5 w-3.5" />,
  showLabels: <Tag className="h-3.5 w-3.5" />,
  animated: <Play className="h-3.5 w-3.5" />,
  variant: <Minus className="h-3.5 w-3.5" />,
};

// Fixed code structure - all possible lines
const CODE_LINES = [
  { id: "import", lineNum: 1 },
  { id: "empty", lineNum: 2 },
  { id: "open", lineNum: 3 },
  { id: "data", lineNum: 4 },
  { id: "prop1", lineNum: 5 },
  { id: "prop2", lineNum: 6 },
  { id: "prop3", lineNum: 7 },
  { id: "prop4", lineNum: 8 },
  { id: "close", lineNum: 9 },
] as const;

export function InteractiveCode({
  className,
  config,
  onConfigChange,
}: InteractiveCodeProps) {
  const [copied, setCopied] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { unlock } = useBadges();
  const shouldReduceMotion = useReducedMotion();

  // Get active props in order
  const activeProps = useMemo(() => {
    const props: { key: DemoConfigKey; display: React.ReactNode }[] = [];

    if (config.gradient) {
      props.push({
        key: "gradient",
        display: <span className="text-[hsl(var(--syntax-prop))]">gradient</span>,
      });
    }
    if (config.smooth) {
      props.push({
        key: "smooth",
        display: (
          <>
            <span className="text-[hsl(var(--syntax-prop))]">curve</span>
            <span className="text-foreground/60">=</span>
            <span className="text-[hsl(var(--syntax-string))]">"smooth"</span>
          </>
        ),
      });
    }
    if (config.showDots) {
      props.push({
        key: "showDots",
        display: <span className="text-[hsl(var(--syntax-prop))]">showDots</span>,
      });
    }
    if (config.showLabels) {
      props.push({
        key: "showLabels",
        display: <span className="text-[hsl(var(--syntax-prop))]">showLabels</span>,
      });
    }
    if (config.animated) {
      props.push({
        key: "animated",
        display: <span className="text-[hsl(var(--syntax-prop))]">animated</span>,
      });
    }
    if (config.variant) {
      props.push({
        key: "variant",
        display: (
          <>
            <span className="text-[hsl(var(--syntax-prop))]">variant</span>
            <span className="text-foreground/60">=</span>
            <span className="text-[hsl(var(--syntax-string))]">"minimal"</span>
          </>
        ),
      });
    }

    return props;
  }, [config]);

  // Generate copyable code string
  const generateCodeString = useMemo(() => {
    const props: string[] = [];
    if (config.gradient) props.push("gradient");
    if (config.smooth) props.push('curve="smooth"');
    if (config.showDots) props.push("showDots");
    if (config.showLabels) props.push("showLabels");
    if (config.animated) props.push("animated");
    if (config.variant) props.push('variant="minimal"');

    const propsStr = props.length > 0 ? `\n  ${props.join("\n  ")}` : "";

    return `import { AreaChart } from "mario-charts"

<AreaChart
  data={monthlyRevenue}${propsStr}
/>`;
  }, [config]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateCodeString);
      setCopied(true);
      unlock("first-copy");
      confetti(confettiConfig.copy);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  const activeCount = Object.values(config).filter(Boolean).length;

  const propsButton = (
    <button
      onClick={() => setDrawerOpen(!drawerOpen)}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all",
        drawerOpen
          ? "bg-primary text-primary-foreground"
          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <SlidersHorizontal className="h-3 w-3" />
      <span>Props</span>
      {activeCount > 0 && (
        <span className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
          drawerOpen
            ? "bg-primary-foreground/20 text-primary-foreground"
            : "bg-primary/10 text-primary"
        )}>
          {activeCount}
        </span>
      )}
    </button>
  );

  return (
    <DemoCard
      className={className}
      header={{
        icon: (
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
          </div>
        ),
        title: "App.tsx",
        action: propsButton,
      }}
      footer={
        <>
          <a
            href="/docs/components/area-chart"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            View docs →
          </a>

          <motion.button
            onClick={handleCopy}
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
            className={cn(
              "relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              copied
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <motion.span
              initial={false}
              animate={{ scale: copied ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.2 }}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </motion.span>
            {copied ? "Copied!" : "Copy"}
            {copied && (
              <motion.span
                initial={{ scale: 0, opacity: 0.4 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 rounded-lg bg-green-500"
              />
            )}
          </motion.button>
        </>
      }
    >
      {/* Code content with line numbers */}
      <div className="flex h-full">
        {/* Line numbers gutter */}
        <div className="flex-shrink-0 select-none border-r border-border/30 bg-muted/20 py-4 pl-3 pr-3">
          <div className="flex flex-col font-mono text-xs leading-6 text-muted-foreground/40">
            {CODE_LINES.map((line) => (
              <span key={line.id} className="text-right tabular-nums">
                {line.lineNum}
              </span>
            ))}
          </div>
        </div>

        {/* Code content - fixed 9 lines */}
        <div className="flex-1 py-4 pl-4 pr-4">
          <pre className="font-mono text-sm leading-6">
            <code className="flex flex-col">
              {/* Line 1: import */}
              <span className="h-6">
                <span className="text-[hsl(var(--syntax-keyword))]">import</span>
                <span className="text-foreground/60">{" { "}</span>
                <span className="text-[hsl(var(--syntax-component))]">AreaChart</span>
                <span className="text-foreground/60">{" } "}</span>
                <span className="text-[hsl(var(--syntax-keyword))]">from</span>
                <span className="text-[hsl(var(--syntax-string))]">{' "mario-charts"'}</span>
              </span>

              {/* Line 2: empty */}
              <span className="h-6" />

              {/* Line 3: component open */}
              <span className="h-6">
                <span className="text-foreground/60">{"<"}</span>
                <span className="text-[hsl(var(--syntax-component))]">AreaChart</span>
              </span>

              {/* Line 4: data prop */}
              <span className="h-6">
                <span className="text-foreground/30">{"  "}</span>
                <span className="text-[hsl(var(--syntax-prop))]">data</span>
                <span className="text-foreground/60">{"={"}</span>
                <span className="text-[hsl(var(--syntax-variable))]">monthlyRevenue</span>
                <span className="text-foreground/60">{"}"}</span>
              </span>

              {/* Lines 5-8: dynamic props (4 slots) */}
              {[0, 1, 2, 3].map((slotIndex) => {
                const prop = activeProps[slotIndex];
                return (
                  <span key={slotIndex} className="relative h-6">
                    <AnimatePresence mode="wait">
                      {prop && (
                        <motion.span
                          key={prop.key}
                          initial={shouldReduceMotion ? {} : { opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={shouldReduceMotion ? {} : { opacity: 0, x: -4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute inset-0"
                        >
                          <span className="text-foreground/30">{"  "}</span>
                          {prop.display}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                );
              })}

              {/* Line 9: close tag */}
              <span className="h-6">
                <span className="text-foreground/60">{"/>"}</span>
              </span>
            </code>
          </pre>
        </div>
      </div>

      {/* Settings drawer - OVERLAY */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-3 top-3 bottom-3 w-44 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
            >
              <div className="p-3">
                <div className="mb-3">
                  <span className="text-xs font-semibold text-foreground">Customize Props</span>
                </div>
                <div className="flex flex-col gap-1">
                  {(Object.keys(DEMO_CONFIG) as DemoConfigKey[]).map((key) => {
                    const isActive = config[key];
                    const info = DEMO_CONFIG[key];
                    const icon = PROP_ICONS[key];

                    return (
                      <button
                        key={key}
                        onClick={() => onConfigChange(key, !isActive)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <span className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                          isActive ? "bg-primary/15" : "bg-muted/50"
                        )}>
                          {icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium">{info.label}</div>
                        </div>
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full transition-colors flex-shrink-0",
                            isActive ? "bg-primary" : "bg-border"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DemoCard>
  );
}
