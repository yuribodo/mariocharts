"use client";

import { useState } from "react";
import { Terminal, Download, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";

interface InstallationStep {
  title: string;
  description?: string;
  code?: string;
  language?: string;
}

interface InstallationGuideProps {
  title?: string;
  description?: string;
  steps: InstallationStep[];
  cliCommand?: string;
  copyPasteCode?: string;
  className?: string;
}

export function InstallationGuide({ 
  title = "Installation", 
  description = "Get started with this component in just a few steps.",
  steps, 
  cliCommand,
  copyPasteCode,
  className 
}: InstallationGuideProps) {
  const [installMethod, setInstallMethod] = useState<'cli' | 'manual'>('cli');

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      {/* Installation method tabs */}
      {cliCommand && copyPasteCode && (
        <div className="flex items-center space-x-1 border-b">
          <button
            onClick={() => setInstallMethod('cli')}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              installMethod === 'cli'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Terminal className="w-4 h-4 mr-2 inline" />
            CLI
          </button>
          <button
            onClick={() => setInstallMethod('manual')}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              installMethod === 'manual'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Copy className="w-4 h-4 mr-2 inline" />
            Manual
          </button>
        </div>
      )}

      {/* CLI Installation */}
      {installMethod === 'cli' && cliCommand && (
        <div className="space-y-4">
          <div className="p-4 bg-muted/25 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Quick Install</span>
            </div>
            <CodeBlock code={cliCommand} language="bash" className="border-0" />
          </div>
        </div>
      )}

      {/* Manual Installation */}
      {installMethod === 'manual' && steps && (
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  {index + 1}
                </div>
                <h3 className="font-semibold">{step.title}</h3>
              </div>
              
              {step.description && (
                <p className="text-muted-foreground text-sm ml-9">{step.description}</p>
              )}
              
              {step.code && (
                <div className="ml-9">
                  <CodeBlock code={step.code} language={step.language || "bash"} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Copy-paste component */}
      {installMethod === 'manual' && copyPasteCode && (
        <div className="mt-6 p-4 border rounded-lg bg-card" style={{ backdropFilter: 'none', filter: 'none' }}>
          <div className="flex items-center gap-2 mb-3">
            <Download className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-sm">
              Component Source
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Copy and paste this component into your project:
          </p>
          <CodeBlock code={copyPasteCode} language="tsx" />
        </div>
      )}

      {/* Zero lock-in notice */}
      <div className="p-4 border rounded-lg bg-card" style={{ backdropFilter: 'none', filter: 'none' }}>
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 mt-0.5 text-green-600">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="font-medium">
              Zero Lock-in Philosophy
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              The component is fully yours to own, modify, and customize. No external dependencies on our library.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}