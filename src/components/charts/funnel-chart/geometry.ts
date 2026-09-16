export type FunnelVariant =
  | "tapered"
  | "straight"
  | "smooth"
  | "horizontal"
  | "columns";
interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface FunnelGeometry {
  path: string;
  connector: string;
  anchor: { x: number; y: number };
  origin: { x: number; y: number };
  axis: "x" | "y";
  hit: Box;
  label: Box;
  metrics: Box;
  rate: Box | null;
}
function rectangle(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  if (width <= 0 || height <= 0) return "";
  const r = Math.min(radius, width / 2, height / 2);
  return `M ${x + r} ${y} H ${x + width - r} Q ${x + width} ${y} ${x + width} ${y + r} V ${y + height - r} Q ${x + width} ${y + height} ${x + width - r} ${y + height} H ${x + r} Q ${x} ${y + height} ${x} ${y + height - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
}
export function funnelSlice(
  cx: number,
  top: number,
  bottom: number,
  y: number,
  height: number,
  smooth: boolean,
) {
  if (top <= 0 || height <= 0) return "";
  const left = cx - top / 2,
    right = cx + top / 2,
    endLeft = cx - bottom / 2,
    endRight = cx + bottom / 2;
  return smooth
    ? `M ${left} ${y} H ${right} C ${right} ${y + height / 2} ${endRight} ${y + height / 2} ${endRight} ${y + height} H ${endLeft} C ${endLeft} ${y + height / 2} ${left} ${y + height / 2} ${left} ${y} Z`
    : `M ${left} ${y} H ${right} L ${endRight} ${y + height} H ${endLeft} Z`;
}
export function layoutFunnel(
  ratios: readonly number[],
  width: number,
  height: number,
  variant: FunnelVariant,
  gap: number,
  radius: number,
  rates: boolean,
  details: boolean,
) {
  const n = ratios.length,
    columns = variant === "columns",
    horizontal = variant === "horizontal",
    compact = width < 480;
  const actualGap = columns
    ? Math.max(12, gap)
    : rates
      ? Math.max(26, gap)
      : gap;
  const contentWidth = columns ? Math.max(width, n * 84 + 24) : width;
  const rowMin = horizontal && compact ? 54 : details ? 48 : 34;
  const contentHeight = columns
    ? Math.max(height, 180)
    : Math.max(height, 24 + n * rowMin + Math.max(0, n - 1) * actualGap);
  const rowHeight = n
    ? (contentHeight - 24 - Math.max(0, n - 1) * actualGap) / n
    : 0;
  const stages = ratios.map((ratio, index): FunnelGeometry => {
    const next = ratios[index + 1] ?? ratio;
    if (columns) {
      const stride = (contentWidth - 24) / n,
        barWidth = Math.max(0, stride - Math.min(actualGap, stride * 0.4)),
        x = 12 + index * stride + (stride - barWidth) / 2;
      const bottom = contentHeight - (rates ? 90 : 72),
        plotHeight = Math.max(0, bottom - 12),
        y = bottom - plotHeight * ratio;
      return {
        path: rectangle(x, y, barWidth, plotHeight * ratio, radius),
        connector:
          index < n - 1 && ratio > 0 && next > 0
            ? `M ${x + barWidth} ${y} L ${x + stride} ${bottom - plotHeight * next} V ${bottom} H ${x + barWidth} Z`
            : "",
        anchor: { x: x + barWidth / 2, y: y + (bottom - y) / 2 },
        origin: { x: x + barWidth / 2, y: bottom },
        axis: "y",
        hit: {
          x: 12 + index * stride,
          y: 4,
          width: stride,
          height: contentHeight - 8,
        },
        label: {
          x: 12 + index * stride,
          y: bottom + 10,
          width: stride,
          height: 20,
        },
        metrics: {
          x: 12 + index * stride,
          y: bottom + 31,
          width: stride,
          height: 32,
        },
        rate:
          rates && index
            ? {
                x: 12 + index * stride,
                y: bottom + 65,
                width: stride,
                height: 18,
              }
            : null,
      };
    }
    const y = 12 + index * (rowHeight + actualGap);
    if (horizontal) {
      const labelWidth = compact ? 0 : Math.min(152, width * 0.25),
        metricsWidth = compact ? 0 : Math.min(120, width * 0.22),
        x = 12 + labelWidth;
      const barWidth = Math.max(0, width - 24 - labelWidth - metricsWidth),
        barY = compact ? y + 25 : y + 6,
        barHeight = compact ? rowHeight - 29 : rowHeight - 12;
      return {
        path: rectangle(x, barY, barWidth * ratio, barHeight, radius),
        connector: "",
        anchor: { x: x + (barWidth * ratio) / 2, y: barY + barHeight / 2 },
        origin: { x, y: barY },
        axis: "x",
        hit: { x: 4, y, width: Math.max(0, width - 8), height: rowHeight },
        label: compact
          ? { x: 12, y, width: (width - 24) * 0.5, height: 20 }
          : {
              x: 12,
              y: y + rowHeight / 2 - 10,
              width: labelWidth - 10,
              height: 20,
            },
        metrics: compact
          ? { x: width / 2, y, width: width / 2 - 12, height: 20 }
          : {
              x: width - metricsWidth - 4,
              y: y + rowHeight / 2 - 19,
              width: metricsWidth - 12,
              height: 38,
            },
        rate:
          rates && index
            ? { x, y: y - actualGap / 2 - 9, width: barWidth, height: 18 }
            : null,
      };
    }
    const plotWidth = Math.max(0, (width - 36) * 0.58),
      cx = 12 + plotWidth / 2;
    const topWidth = ratio * plotWidth,
      bottomWidth = (variant === "straight" ? ratio : next) * plotWidth;
    const labelX = 24 + plotWidth;
    return {
      path:
        variant === "straight"
          ? rectangle(cx - topWidth / 2, y, topWidth, rowHeight, radius)
          : funnelSlice(
              cx,
              topWidth,
              bottomWidth,
              y,
              rowHeight,
              variant === "smooth",
            ),
      connector:
        index < n - 1 && ratio > 0 && next > 0 && actualGap > 0
          ? funnelSlice(
              cx,
              bottomWidth,
              next * plotWidth,
              y + rowHeight,
              actualGap,
              variant === "smooth",
            )
          : "",
      anchor: { x: cx, y: y + rowHeight / 2 },
      origin: { x: cx, y },
      axis: "x",
      hit: { x: 4, y, width: Math.max(0, width - 8), height: rowHeight },
      label: {
        x: labelX,
        y: y + rowHeight / 2 - (details ? 20 : 10),
        width: Math.max(0, width - labelX - 12),
        height: 20,
      },
      metrics: {
        x: labelX,
        y: y + rowHeight / 2 + 2,
        width: Math.max(0, width - labelX - 12),
        height: 34,
      },
      rate:
        rates && index
          ? { x: 12, y: y - actualGap / 2 - 9, width: plotWidth, height: 18 }
          : null,
    };
  });
  return { stages, width: contentWidth, height: contentHeight, compact };
}
