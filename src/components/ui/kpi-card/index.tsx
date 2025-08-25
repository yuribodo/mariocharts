"use client";

import { memo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatNumber, formatPercentage } from "@/utils/data-formatting";

export interface KPICardProps {
  readonly title: string;
  readonly value: string | number;
  readonly change?: {
    readonly value: number;
    readonly type: "increase" | "decrease";
    readonly period?: string;
  };
  readonly sparkline?: {
    readonly data: readonly number[];
    readonly type: "line" | "bar" | "area";
  };
  readonly icon?: React.ReactNode;
  readonly color?: string;
  readonly loading?: boolean;
  readonly className?: string;
}

const KPICardComponent = ({
  title,
  value,
  change,
  sparkline,
  icon,
  color,
  loading,
  className,
}: KPICardProps) => {
  if (loading) {
    return (
      <div className={cn("kpi-card", className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  const formattedValue = typeof value === "number" ? formatNumber(value) : value;

  return (
    <div className={cn("kpi-card group", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {icon && (
              <div 
                className="p-2 rounded-md"
                style={{ backgroundColor: color ? `${color}20` : "hsl(var(--muted))" }}
              >
                <div style={{ color: color || "hsl(var(--foreground))" }}>
                  {icon}
                </div>
              </div>
            )}
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
          
          <div className="space-y-1">
            <p 
              className="text-2xl font-bold tracking-tight"
              style={{ color: color || "hsl(var(--foreground))" }}
            >
              {formattedValue}
            </p>
            
            {change && (
              <div className="flex items-center gap-1 text-xs">
                {change.type === "increase" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={cn(
                    "font-medium",
                    change.type === "increase" ? "text-green-500" : "text-red-500"
                  )}
                >
                  {formatPercentage(change.value)}
                </span>
                {change.period && (
                  <span className="text-muted-foreground">vs {change.period}</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {sparkline && (
          <div className="ml-4">
            <SparklineChart 
              data={sparkline.data}
              type={sparkline.type}
              {...(color && { color })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface SparklineChartProps {
  readonly data: readonly number[];
  readonly type: "line" | "bar" | "area";
  readonly color?: string;
}

const SparklineChart = memo(({ data, type, color }: SparklineChartProps) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const normalizedData = data.map((value, index) => ({
    value,
    x: (index / (data.length - 1)) * 100,
    y: range === 0 ? 50 : ((max - value) / range) * 100,
  }));

  const strokeColor = color || "hsl(var(--primary))";

  if (type === "line" || type === "area") {
    const pathData = normalizedData.reduce((path, point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${path} ${command} ${point.x} ${point.y}`;
    }, "");

    return (
      <div className="w-16 h-8">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {type === "area" && (
            <path
              d={`${pathData} L ${normalizedData[normalizedData.length - 1]?.x} 100 L 0 100 Z`}
              fill={strokeColor}
              fillOpacity={0.2}
              stroke="none"
            />
          )}
          <path
            d={pathData}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  if (type === "bar") {
    const barWidth = 100 / data.length * 0.8;
    
    return (
      <div className="w-16 h-8">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {normalizedData.map((point, index) => (
            <rect
              key={index}
              x={point.x - barWidth / 2}
              y={point.y}
              width={barWidth}
              height={100 - point.y}
              fill={strokeColor}
              fillOpacity={0.8}
              rx={1}
            />
          ))}
        </svg>
      </div>
    );
  }

  return null;
});

SparklineChart.displayName = "SparklineChart";

export const KPICard = memo(KPICardComponent);
KPICard.displayName = "KPICard";