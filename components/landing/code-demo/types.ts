/**
 * Code Demo Section Types
 *
 * Shared configuration and types for the interactive code demo.
 */

export const DEMO_CONFIG = {
  gradient: {
    label: "Gradient",
    description: "Gradient fill under the line",
    default: true,
  },
  smooth: {
    label: "Smooth",
    description: "Smooth curve interpolation",
    default: false,
  },
  showDots: {
    label: "Dots",
    description: "Show data point markers",
    default: true,
  },
  showLabels: {
    label: "Labels",
    description: "Display values above points",
    default: false,
  },
  animated: {
    label: "Animated",
    description: "Animate chart entrance",
    default: true,
  },
  variant: {
    label: "Minimal",
    description: "Line-only minimal style",
    default: false,
  },
} as const;

export type DemoConfigKey = keyof typeof DEMO_CONFIG;

export type DemoConfig = {
  [K in DemoConfigKey]: boolean;
};

export function getDefaultConfig(): DemoConfig {
  return Object.fromEntries(
    Object.entries(DEMO_CONFIG).map(([key, value]) => [key, value.default])
  ) as DemoConfig;
}
