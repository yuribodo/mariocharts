import type { ReactNode } from "react";
/** IDs identify occurrences, so the same event can appear at different steps. */
export interface SankeyNode {
  readonly id: string;
  readonly label: string;
  readonly color?: string;
}
/** An aggregated directed transition. Use consistent units across all links. */
export interface SankeyLink {
  readonly source: string;
  readonly target: string;
  readonly value: number;
}
export type SankeyInspection<
  N extends SankeyNode = SankeyNode,
  L extends SankeyLink = SankeyLink,
> =
  | {
      readonly kind: "node";
      readonly data: N;
      readonly index: number;
      readonly value: number;
      readonly incoming: number;
      readonly outgoing: number;
      readonly color: string;
    }
  | {
      readonly kind: "link";
      readonly data: L;
      readonly index: number;
      readonly source: N;
      readonly target: N;
      readonly value: number;
      readonly sourcePercentage: number | null;
      readonly targetPercentage: number | null;
      readonly color: string;
    };
export interface SankeyChartProps<
  N extends SankeyNode = SankeyNode,
  L extends SankeyLink = SankeyLink,
> {
  /** Unique IDs, display labels and optional CSS colors. Input order orders peers. */
  readonly nodes: readonly N[];
  /** Finite nonnegative volumes. Cycles and references to absent IDs are errors. */
  readonly links: readonly L[];
  readonly colors?: readonly string[];
  /** Align terminal nodes to the last column, or keep their earliest depth. */
  readonly align?: "justify" | "start";
  readonly linkColor?: "gradient" | "source" | "target";
  /** Horizontal curve tension from 0 (straight) to 1. */
  readonly curvature?: number;
  readonly nodeWidth?: number;
  readonly nodeGap?: number;
  readonly showValues?: boolean;
  readonly className?: string;
  /** A stable frame; crowded graphs scroll inside it. */
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly valueFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
  readonly onNodeClick?: (node: N, index: number) => void;
  readonly onLinkClick?: (link: L, index: number) => void;
  readonly tooltipRenderer?: (inspection: SankeyInspection<N, L>) => ReactNode;
}
