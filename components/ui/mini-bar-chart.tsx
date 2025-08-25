"use client";

import { cn } from "../../lib/utils";

interface MiniBarChartProps {
  bars?: number[];
  className?: string;
  delay?: number;
}

export function MiniBarChart({ 
  bars = [6, 12, 8, 14], 
  className, 
  delay = 0 
}: MiniBarChartProps) {
  const maxHeight = Math.max(...bars);
  
  return (
    <div 
      className={cn("inline-flex items-end gap-[2px]", className)}
      style={{ '--delay': `${delay}s` } as React.CSSProperties}
    >
      {bars.map((height, index) => (
        <div
          key={index}
          className="mini-bar w-1 bg-current opacity-50 rounded-[0.5px]"
          style={{
            height: `${height}px`,
            animationDelay: `${delay + index * 0.1}s`
          }}
        />
      ))}
    </div>
  );
}