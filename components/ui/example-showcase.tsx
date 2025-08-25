"use client";

import { useState } from "react";
import { Eye, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";

interface ExampleShowcaseProps {
  title: string;
  description?: string;
  preview: React.ReactNode;
  code: string;
  className?: string;
}

export function ExampleShowcase({ 
  title, 
  description, 
  preview, 
  code, 
  className 
}: ExampleShowcaseProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-card shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/25">
        <div>
          <h3 className="font-semibold text-base">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowCode(false)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              !showCode 
                ? "bg-background text-foreground border" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="w-4 h-4 mr-1.5" />
            Preview
          </button>
          
          <button
            onClick={() => setShowCode(true)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              showCode 
                ? "bg-background text-foreground border" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Code className="w-4 h-4 mr-1.5" />
            Code
          </button>
        </div>
      </div>

      {/* Content */}
      {showCode ? (
        <CodeBlock code={code} language="tsx" className="border-0 rounded-none" />
      ) : (
        <div className="p-6">
          {preview}
        </div>
      )}
    </div>
  );
}