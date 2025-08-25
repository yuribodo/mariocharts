"use client";

import { cn } from "../../lib/utils";

interface MiniLineChartProps {
  points?: number[];
  className?: string;
  delay?: number;
}

export function MiniLineChart({ 
  points = [2, 6, 4, 9, 12], 
  className, 
  delay = 0 
}: MiniLineChartProps) {
  const width = 24;
  const height = 12;
  const maxPoint = Math.max(...points);
  
  // Generate SVG path from points
  const pathData = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - (point / maxPoint) * height;
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("inline-block", className)}
      style={{ '--delay': `${delay}s` } as React.CSSProperties}
    >
      <path
        d={pathData}
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mini-line opacity-50"
        style={{
          animationDelay: `${delay}s`
        }}
      />
    </svg>
  );
}