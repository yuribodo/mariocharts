"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "@phosphor-icons/react";
import { createHighlighter } from "shiki";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = "bash", className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState(code);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  useEffect(() => {
    const highlight = async () => {
      try {
        const highlighter = await createHighlighter({
          themes: ["github-light", "github-dark"],
          langs: ["javascript", "typescript", "jsx", "tsx", "bash", "json", "css", "html"]
        });

        const html = highlighter.codeToHtml(code, {
          lang: language,
          theme: "github-light",
          transformers: [
            {
              pre(node) {
                // Remove default styling - we'll use the theme's background and colors
                node.properties.style = "";
                node.properties.class = "shiki-light";
              }
            }
          ]
        });
        
        setHighlightedCode(html);
      } catch (error) {
        console.warn(`Shiki highlighting failed for language: ${language}`, error);
        setHighlightedCode(`<pre><code>${code}</code></pre>`);
      }
    };

    highlight();
  }, [code, language]);

  const isHighlighted = highlightedCode !== code;

  return (
    <div className="group relative border rounded-lg overflow-hidden bg-card shadow-sm my-6">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b">
        <span className="text-sm font-mono font-medium text-muted-foreground">
          {language === "tsx" ? "tsx" : 
           language === "jsx" ? "jsx" : 
           language === "javascript" ? "js" :
           language === "typescript" ? "ts" :
           language === "bash" ? "bash" :
           language}
        </span>
        <button
          onClick={copyToClipboard}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-md hover:bg-muted/80 text-muted-foreground hover:text-foreground"
          title="Copy code"
        >
          {copied ? (
            <Check size={14} className="text-green-500" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
      <div className="relative">
        {isHighlighted ? (
          <div 
            className={`[&>pre]:p-6 [&>pre]:text-sm [&>pre]:overflow-x-auto [&>pre]:rounded-none [&>pre]:border-none [&_code]:font-mono ${className || ''}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        ) : (
          <pre className="bg-white p-6 text-sm overflow-x-auto border-none">
            <code className="text-gray-800 font-mono">{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}