export type MorphPhase = "idle" | "morphing" | "settled";

export const HEADLINE = "Own the pixels.";
export const SUPPORT_LINE = "Charts you keep — not another dependency.";

export type DemoPoint = { readonly month: string; readonly value: number };

export const DEMO_SERIES = [
  { month: "Jan", value: 4200 },
  { month: "Feb", value: 5100 },
  { month: "Mar", value: 4800 },
  { month: "Apr", value: 6200 },
  { month: "May", value: 5900 },
  { month: "Jun", value: 7100 },
  { month: "Jul", value: 6800 },
  { month: "Aug", value: 7600 },
] as const satisfies readonly DemoPoint[];

export const MORPH_VIEWBOX = {
  width: 640,
  height: 280,
  padding: 32,
} as const;

export const MORPH_DURATION_MS = 1600;
export const SESSION_KEY = "mario-manifesto-morph-settled";

export type Glyph = {
  readonly id: string;
  readonly char: string;
  readonly index: number;
};

export type PointTarget = {
  readonly x: number;
  readonly y: number;
  readonly value: number;
  readonly label: string;
};

export type GlyphTargetMap = {
  readonly glyphIndex: number;
  readonly targetIndex: number;
  readonly x: number;
  readonly y: number;
};
