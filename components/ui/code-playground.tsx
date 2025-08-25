"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Copy, ArrowCounterClockwise, Eye, Code, CheckCircle, XCircle } from "@phosphor-icons/react";
import { CodeBlock } from "./code-block";
import { BarChart } from "../../src/components/charts/bar-chart";
import { motion } from "framer-motion";

interface PlaygroundProps {
  defaultCode?: string;
  component?: "bar-chart" | "kpi-card" | "line-chart";
  title?: string;
  description?: string;
}

const DEFAULT_BAR_CHART_CODE = `import { BarChart } from "@/components/charts/bar-chart";

const data = [
  { name: 'Jan', revenue: 4000, expenses: 2400 },
  { name: 'Feb', revenue: 3000, expenses: 1398 },
  { name: 'Mar', revenue: 2000, expenses: 2800 },
  { name: 'Apr', revenue: 2780, expenses: 3908 },
  { name: 'May', revenue: 1890, expenses: 4800 },
  { name: 'Jun', revenue: 2390, expenses: 3800 },
];

export function ChartExample() {
  return (
    <BarChart
      data={data}
      x="name"
      y="revenue"
      colors={['hsl(210 100% 50%)', 'hsl(340 100% 50%)']}
      className="h-80"
    />
  );
}`;

const sampleData = [
  { name: 'Jan', revenue: 4000, expenses: 2400 },
  { name: 'Feb', revenue: 3000, expenses: 1398 },
  { name: 'Mar', revenue: 2000, expenses: 2800 },
  { name: 'Apr', revenue: 2780, expenses: 3908 },
  { name: 'May', revenue: 1890, expenses: 4800 },
  { name: 'Jun', revenue: 2390, expenses: 3800 },
];

export function CodePlayground({ 
  defaultCode = DEFAULT_BAR_CHART_CODE, 
  component = "bar-chart",
  title = "Interactive Playground",
  description = "Edit the code and see the changes in real-time."
}: PlaygroundProps) {
  const [code, setCode] = useState(defaultCode);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [isValid, setIsValid] = useState(true);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const resetCode = () => {
    setCode(defaultCode);
    setIsValid(true);
  };

  const renderPreview = () => {
    try {
      // Simple validation - in a real implementation, you'd use a sandboxed environment
      if (component === "bar-chart") {
        return (
          <div className="w-full h-80 flex items-center justify-center bg-background rounded-lg">
            <BarChart
              data={sampleData}
              x="name"
              y="revenue"
              colors={['hsl(210 100% 50%)', 'hsl(340 100% 50%)']}
              className="h-full w-full"
            />
          </div>
        );
      }
      
      return (
        <div className="w-full h-80 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-border">
          <div className="text-center text-muted-foreground">
            <Play size={48} className="mx-auto mb-2 opacity-50" />
            <p>Component preview</p>
            <p className="text-sm">Live updates coming soon</p>
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="w-full h-80 flex items-center justify-center bg-destructive/5 rounded-lg border border-destructive/20">
          <div className="text-center text-destructive">
            <XCircle size={48} className="mx-auto mb-2" />
            <p className="font-medium">Invalid Code</p>
            <p className="text-sm">Please check your syntax</p>
          </div>
        </div>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border rounded-xl overflow-hidden bg-card"
    >
      {/* Header */}
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            {isValid ? (
              <CheckCircle size={20} className="text-green-500" />
            ) : (
              <XCircle size={20} className="text-destructive" />
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-muted/10">
        <div className="flex">
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "preview"
                ? "border-primary text-primary bg-background"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <div className="flex items-center gap-2">
              <Eye size={16} />
              Preview
            </div>
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "code"
                ? "border-primary text-primary bg-background"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <div className="flex items-center gap-2">
              <Code size={16} />
              Code
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {activeTab === "preview" && (
          <div className="p-6">
            {renderPreview()}
          </div>
        )}

        {activeTab === "code" && (
          <div className="relative">
            {/* Toolbar */}
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <button
                onClick={resetCode}
                className="p-2 rounded-md bg-background/80 backdrop-blur-sm hover:bg-background transition-colors border border-border/50"
                title="Reset to default"
              >
                <ArrowCounterClockwise size={14} />
              </button>
              <button
                onClick={copyCode}
                className="p-2 rounded-md bg-background/80 backdrop-blur-sm hover:bg-background transition-colors border border-border/50"
                title="Copy code"
              >
                {copied ? (
                  <CheckCircle size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>

            <div className="p-0">
              <CodeBlock 
                code={code} 
                language="tsx"
                className="rounded-none border-0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/10 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Component: {component}</span>
            <span>Language: TypeScript</span>
          </div>
          <div className="text-xs">
            Click tabs to switch between preview and code
          </div>
        </div>
      </div>
    </motion.div>
  );
}