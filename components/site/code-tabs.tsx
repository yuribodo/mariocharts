"use client";

import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";

interface CodeExample {
  title: string;
  language: string;
  code: string;
}

interface CodeTabsProps {
  examples: CodeExample[];
  className?: string;
}

export function CodeTabs({ examples, className = "" }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (examples.length === 0) return null;
  
  if (examples.length === 1) {
    const example = examples[0];
    if (!example) return null;
    
    return (
      <div className={`border border-border rounded-lg overflow-hidden ${className}`}>
        <div className="flex items-center justify-between bg-muted/30 px-4 py-3 border-b">
          <span className="text-sm font-medium text-muted-foreground">
            {example.title}
          </span>
          <button
            onClick={() => copyToClipboard(example.code, 0)}
            className="p-1.5 rounded hover:bg-muted/60 transition-colors"
          >
            {copiedIndex === 0 ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <Copy size={16} className="text-muted-foreground" />
            )}
          </button>
        </div>
        
        <div className="relative">
          <pre className="p-4 overflow-x-auto text-sm">
            <code className={`language-${example.language}`}>
              {example.code}
            </code>
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Tab Headers */}
      <div className="flex bg-muted/30 border-b">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`
              relative px-4 py-3 text-sm font-medium transition-all duration-150 border-b-2
              ${activeTab === index 
                ? 'text-primary border-primary bg-background/60' 
                : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50'
              }
            `}
          >
            {example.title}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="relative">
        <div className="relative">
          <button
            onClick={() => {
              const currentExample = examples[activeTab];
              if (currentExample) {
                copyToClipboard(currentExample.code, activeTab);
              }
            }}
            className="absolute top-3 right-3 p-1.5 rounded hover:bg-muted/60 transition-colors z-10"
          >
            {copiedIndex === activeTab ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <Copy size={16} className="text-muted-foreground" />
            )}
          </button>
          
          <pre className="p-4 pr-12 overflow-x-auto text-sm">
            <code className={`language-${examples[activeTab]?.language || 'typescript'}`}>
              {examples[activeTab]?.code || ''}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}