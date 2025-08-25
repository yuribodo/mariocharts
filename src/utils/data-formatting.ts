export function formatNumber(
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions
): string {
  if (value == null || isNaN(value)) return "—";
  
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
    ...options,
  }).format(value);
}

export function formatCurrency(
  value: number | null | undefined,
  currency = "USD",
  options?: Intl.NumberFormatOptions
): string {
  if (value == null || isNaN(value)) return "—";
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    ...options,
  }).format(value);
}

export function formatPercentage(
  value: number | null | undefined,
  options?: { maximumFractionDigits?: number }
): string {
  if (value == null || isNaN(value)) return "—";
  
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: options?.maximumFractionDigits ?? 1,
  }).format(value / 100);
}

export function formatDate(
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "—";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return "—";
  
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(dateObj);
}

export function formatChange(
  current: number,
  previous: number
): { value: number; type: "increase" | "decrease" | "neutral" } {
  if (previous === 0) {
    return {
      value: current > 0 ? 100 : 0,
      type: current > 0 ? "increase" : "neutral",
    };
  }
  
  const change = ((current - previous) / previous) * 100;
  
  return {
    value: Math.abs(change),
    type: change > 0 ? "increase" : change < 0 ? "decrease" : "neutral",
  };
}

export function abbreviateNumber(value: number): string {
  const suffixes = ["", "K", "M", "B", "T"];
  let suffixIndex = 0;
  let abbreviatedValue = value;
  
  while (abbreviatedValue >= 1000 && suffixIndex < suffixes.length - 1) {
    abbreviatedValue /= 1000;
    suffixIndex++;
  }
  
  const formatted = abbreviatedValue % 1 === 0 
    ? abbreviatedValue.toString() 
    : abbreviatedValue.toFixed(1);
    
  return formatted + suffixes[suffixIndex];
}

export function sanitizeData<T extends Record<string, unknown>>(
  data: readonly T[]
): readonly T[] {
  return data.filter((item) => {
    return Object.values(item).every((value) => {
      if (typeof value === "number") {
        return !isNaN(value) && isFinite(value);
      }
      return value != null;
    });
  });
}