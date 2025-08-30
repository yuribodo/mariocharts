"use client";

import { useState } from "react";
import { Eye, Code } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

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
        
        {/* Modern Toggle Switch */}
        <div className="flex items-center">
          <motion.div 
            className="relative bg-muted rounded-lg p-1 flex items-center"
            initial={false}
            animate={{ backgroundColor: showCode ? 'hsl(var(--muted))' : 'hsl(var(--muted))' }}
            role="tablist"
            aria-label="Switch between preview and code view"
          >
            {/* Background slider */}
            <motion.div
              className="absolute bg-background rounded-md shadow-sm border"
              initial={false}
              animate={{
                x: showCode ? '100%' : '0%',
                width: showCode ? 'calc(50% - 4px)' : 'calc(50% - 4px)'
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              style={{
                height: 'calc(100% - 8px)',
                top: 4,
                left: 4,
              }}
            />
            
            {/* Preview Button */}
            <motion.button
              onClick={() => setShowCode(false)}
              onKeyDown={(e) => handleKeyDown(e, () => setShowCode(false))}
              className={cn(
                "relative z-10 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center min-w-[100px] justify-center",
                !showCode 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              role="tab"
              aria-selected={!showCode}
              aria-label="Show preview"
              tabIndex={0}
            >
              <motion.div
                initial={false}
                animate={{ 
                  scale: !showCode ? 1 : 0.9,
                  opacity: !showCode ? 1 : 0.7
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </motion.div>
            </motion.button>
            
            {/* Code Button */}
            <motion.button
              onClick={() => setShowCode(true)}
              onKeyDown={(e) => handleKeyDown(e, () => setShowCode(true))}
              className={cn(
                "relative z-10 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center min-w-[100px] justify-center",
                showCode 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              role="tab"
              aria-selected={showCode}
              aria-label="Show code"
              tabIndex={0}
            >
              <motion.div
                initial={false}
                animate={{ 
                  scale: showCode ? 1 : 0.9,
                  opacity: showCode ? 1 : 0.7
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <Code className="w-4 h-4 mr-2" />
                Code
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Content with smooth transitions */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          {showCode ? (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: 0.25,
                ease: [0.4, 0, 0.2, 1]
              }}
              role="tabpanel"
              aria-label="Code view"
              id="code-panel"
            >
              <CodeBlock code={code} language="tsx" className="border-0 rounded-none" />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: 0.25,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="p-6"
              role="tabpanel"
              aria-label="Preview"
              id="preview-panel"
            >
              {preview}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}