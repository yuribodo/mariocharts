import { useId } from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface DashboardSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function DashboardSection({
  title,
  description,
  children,
  className,
}: DashboardSectionProps) {
  const id = useId();

  return (
    <section aria-labelledby={id} className={cn("space-y-4", className)}>
      <header>
        <h2 id={id} className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </header>
      {children}
    </section>
  );
}

interface MetricCellProps {
  label: string;
  value: string;
  previousValue: string;
  change: number;
  context: string;
  icon: LucideIcon;
  changeIsPositive?: boolean;
  className?: string;
}

export function MetricCell({
  label,
  value,
  previousValue,
  change,
  context,
  icon: Icon,
  changeIsPositive = change >= 0,
  className,
}: MetricCellProps) {
  const DirectionIcon = change >= 0 ? TrendingUp : TrendingDown;
  const direction = change >= 0 ? "increase" : "decrease";

  return (
    <article className={cn("min-w-0 bg-card p-5", className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
        <h3 className="text-xs font-medium">{label}</h3>
      </div>
      <p className="mt-4 text-2xl font-semibold tabular-nums">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span className={cn(
          "inline-flex items-center gap-1 font-medium tabular-nums",
          changeIsPositive ? "text-[var(--chart-green)]" : "text-[var(--chart-coral)]",
        )}>
          <DirectionIcon className="size-3.5" aria-hidden="true" />
          {Math.abs(change)}% {direction}
        </span>
        <span className="text-muted-foreground">vs {previousValue}</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">{context}</p>
    </article>
  );
}

interface DashboardPanelProps {
  question: string;
  insight?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function DashboardPanel({
  question,
  insight,
  children,
  className,
  contentClassName,
}: DashboardPanelProps) {
  return (
    <article className={cn("min-w-0 bg-card", className)}>
      <header className="min-h-20 border-b px-5 py-4">
        <h3 className="text-sm font-semibold">{question}</h3>
        {insight && <p className="mt-1 text-xs leading-5 text-muted-foreground">{insight}</p>}
      </header>
      <div className={cn("p-5", contentClassName)}>{children}</div>
    </article>
  );
}
