/**
 * SVG Path Generators for Chart Morphing
 *
 * These functions generate SVG path strings from data arrays,
 * designed to work with Flubber.js for smooth morphing transitions.
 */

export interface Point {
  x: number;
  y: number;
  value: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  padding: number;
}

/**
 * Chart colors using CSS variables from the design system.
 * These reference the --chart-1 through --chart-5 variables defined in globals.css
 *
 * Usage in SVG: fill="var(--chart-1)" or use getChartColor(1)
 */
export const CHART_CSS_VARS = {
  chart1: "var(--chart-1)", // Blue
  chart2: "var(--chart-2)", // Pink/Red
  chart3: "var(--chart-3)", // Green
  chart4: "var(--chart-4)", // Yellow
  chart5: "var(--chart-5)", // Purple
  foreground: "var(--foreground)",
  background: "var(--background)",
  muted: "var(--muted)",
  border: "var(--border)",
} as const;

/**
 * Morphing Chart Colors - Monochromatic Design
 *
 * Uses color-mix() for automatic light/dark mode adaptation.
 * This creates an elegant, minimalist look that focuses on the animation
 * rather than colorful distractions.
 */
export const CHART_COLORS = {
  // Area gradient - foreground with opacity for fill
  areaGradient: {
    start: "color-mix(in srgb, var(--foreground) 12%, transparent)",
    end: "transparent",
  },
  // Stroke color - slightly transparent foreground
  stroke: "color-mix(in srgb, var(--foreground) 85%, transparent)",
  // Fill color for solid shapes
  fill: "color-mix(in srgb, var(--foreground) 8%, transparent)",
} as const;

/**
 * Get computed chart color from CSS variable
 * Only works in browser context
 */
export function getChartColor(index: 1 | 2 | 3 | 4 | 5): string {
  if (typeof window === "undefined") {
    // Fallback colors for SSR
    const fallbacks = {
      1: "hsl(210, 100%, 50%)",
      2: "hsl(340, 100%, 50%)",
      3: "hsl(120, 100%, 40%)",
      4: "hsl(45, 100%, 50%)",
      5: "hsl(270, 100%, 50%)",
    };
    return fallbacks[index];
  }
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--chart-${index}`)
    .trim();
}

/**
 * Chart color array using CSS variables
 */
export const CHART_COLORS_ARRAY = [
  CHART_CSS_VARS.chart1,
  CHART_CSS_VARS.chart2,
  CHART_CSS_VARS.chart3,
  CHART_CSS_VARS.chart4,
  CHART_CSS_VARS.chart5,
] as const;

// Default chart data for morphing animation
export const DEFAULT_DATA = [35, 65, 45, 80, 55, 70] as const;

/**
 * Normalize data to chart coordinates
 */
export function normalizeData(
  data: readonly number[],
  dimensions: ChartDimensions
): Point[] {
  const { width, height, padding } = dimensions;
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const usableWidth = width - 2 * padding;
  const usableHeight = height - 2 * padding;

  return data.map((value, i) => ({
    x: padding + (i * usableWidth) / (data.length - 1),
    y: height - padding - ((value - minValue) / range) * usableHeight,
    value,
  }));
}

/**
 * Generate a single centered dot path
 */
export function generateDotPath(cx: number, cy: number): string {
  // Small circle as a path
  const r = 4;
  return `M ${cx} ${cy - r}
          A ${r} ${r} 0 1 1 ${cx} ${cy + r}
          A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
}

/**
 * Generate circle positions for scatter points
 */
export function generateScatterPositions(points: Point[]): Point[] {
  return points;
}

/**
 * Generate a line chart path
 */
export function generateLinePath(points: Point[]): string {
  if (points.length === 0) return "";

  const pathData = points.map((p, i) => {
    const command = i === 0 ? "M" : "L";
    return `${command} ${p.x} ${p.y}`;
  });

  return pathData.join(" ");
}

/**
 * Generate a smooth curved line path (cubic bezier)
 */
export function generateSmoothLinePath(points: Point[]): string {
  if (points.length < 2) return generateLinePath(points);

  const firstPoint = points[0];
  if (!firstPoint) return "";

  let path = `M ${firstPoint.x} ${firstPoint.y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const prevPrev = points[i - 2];

    if (!prev || !curr) continue;

    // Calculate control points
    const tension = 0.3;
    const prevPrevX = prevPrev?.x ?? prev.x;
    const prevPrevY = prevPrev?.y ?? prev.y;
    const nextX = next?.x ?? curr.x;
    const nextY = next?.y ?? curr.y;

    const cp1x = prev.x + (curr.x - prevPrevX) * tension;
    const cp1y = prev.y + (curr.y - prevPrevY) * tension;
    const cp2x = curr.x - (nextX - prev.x) * tension;
    const cp2y = curr.y - (nextY - prev.y) * tension;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }

  return path;
}

/**
 * Generate an area chart path (closed polygon)
 */
export function generateAreaPath(
  points: Point[],
  baseline: number
): string {
  if (points.length === 0) return "";

  const linePath = generateLinePath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];

  if (!lastPoint || !firstPoint) return linePath;

  // Close the path by going to baseline and back
  return `${linePath} L ${lastPoint.x} ${baseline} L ${firstPoint.x} ${baseline} Z`;
}

/**
 * Generate bar chart rectangles as paths
 */
export function generateBarPaths(
  data: readonly number[],
  dimensions: ChartDimensions
): string[] {
  const { width, height, padding } = dimensions;
  const maxValue = Math.max(...data);

  const usableWidth = width - 2 * padding;
  const barWidth = (usableWidth / data.length) * 0.6;
  const gap = (usableWidth / data.length) * 0.4;

  return data.map((value, i) => {
    const barHeight = ((value / maxValue) * (height - 2 * padding));
    const x = padding + i * (barWidth + gap) + gap / 2;
    const y = height - padding - barHeight;
    const radius = Math.min(4, barWidth / 4);

    // Rounded rectangle path
    return `M ${x + radius} ${y}
            L ${x + barWidth - radius} ${y}
            Q ${x + barWidth} ${y} ${x + barWidth} ${y + radius}
            L ${x + barWidth} ${height - padding}
            L ${x} ${height - padding}
            L ${x} ${y + radius}
            Q ${x} ${y} ${x + radius} ${y}
            Z`;
  });
}

/**
 * Generate combined bar paths as single path
 */
export function generateCombinedBarPath(
  data: readonly number[],
  dimensions: ChartDimensions
): string {
  return generateBarPaths(data, dimensions).join(" ");
}

/**
 * Generate pie chart slice paths
 */
export function generatePieSlices(
  data: readonly number[],
  cx: number,
  cy: number,
  radius: number
): string[] {
  const total = data.reduce((sum, val) => sum + val, 0);
  let currentAngle = -Math.PI / 2; // Start from top

  return data.map((value) => {
    const sliceAngle = (value / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    currentAngle = endAngle;

    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  });
}

/**
 * Generate donut chart slice paths
 */
export function generateDonutSlices(
  data: readonly number[],
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number
): string[] {
  const total = data.reduce((sum, val) => sum + val, 0);
  let currentAngle = -Math.PI / 2;

  return data.map((value) => {
    const sliceAngle = (value / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const outerX1 = cx + outerRadius * Math.cos(startAngle);
    const outerY1 = cy + outerRadius * Math.sin(startAngle);
    const outerX2 = cx + outerRadius * Math.cos(endAngle);
    const outerY2 = cy + outerRadius * Math.sin(endAngle);

    const innerX1 = cx + innerRadius * Math.cos(startAngle);
    const innerY1 = cy + innerRadius * Math.sin(startAngle);
    const innerX2 = cx + innerRadius * Math.cos(endAngle);
    const innerY2 = cy + innerRadius * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    currentAngle = endAngle;

    return `M ${outerX1} ${outerY1}
            A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerX2} ${outerY2}
            L ${innerX2} ${innerY2}
            A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerX1} ${innerY1}
            Z`;
  });
}

/**
 * Generate combined pie path as single path
 */
export function generateCombinedPiePath(
  data: readonly number[],
  cx: number,
  cy: number,
  radius: number
): string {
  return generatePieSlices(data, cx, cy, radius).join(" ");
}

/**
 * Generate a simple circle path for morphing base
 */
export function generateCirclePath(
  cx: number,
  cy: number,
  radius: number
): string {
  return `M ${cx} ${cy - radius}
          A ${radius} ${radius} 0 1 1 ${cx} ${cy + radius}
          A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius} Z`;
}

/**
 * Create morphable path representation
 * Ensures consistent point counts for smooth Flubber interpolation
 */
export function createMorphablePath(
  path: string,
  targetPointCount: number = 100
): string {
  // This is a simplified version - Flubber handles this internally
  // but we can pre-process if needed
  return path;
}

/**
 * Generate a radar/spider chart polygon path
 * Creates a closed polygon based on data values and axes
 */
export function generateRadarPolygonPath(
  data: readonly number[],
  cx: number,
  cy: number,
  radius: number
): string {
  const total = data.length;
  if (total === 0) return "";

  const maxValue = Math.max(...data);
  if (maxValue === 0) return "";

  const points = data.map((value, i) => {
    const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
    const r = (value / maxValue) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });

  return (
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"
  );
}

/**
 * Generate radar chart grid paths (concentric polygons)
 */
export function generateRadarGridPath(
  cx: number,
  cy: number,
  radius: number,
  axes: number,
  level: number,
  totalLevels: number
): string {
  const levelRadius = (radius * level) / totalLevels;

  const points = Array.from({ length: axes }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
    return {
      x: cx + levelRadius * Math.cos(angle),
      y: cy + levelRadius * Math.sin(angle),
    };
  });

  return (
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"
  );
}

/**
 * Generate radar chart axis lines (spokes from center)
 */
export function generateRadarAxisPath(
  cx: number,
  cy: number,
  radius: number,
  axisIndex: number,
  totalAxes: number
): string {
  const angle = (Math.PI * 2 * axisIndex) / totalAxes - Math.PI / 2;
  const endX = cx + radius * Math.cos(angle);
  const endY = cy + radius * Math.sin(angle);

  return `M ${cx} ${cy} L ${endX} ${endY}`;
}
