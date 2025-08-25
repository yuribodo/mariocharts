export interface ThemeConfig {
  readonly name: string;
  readonly colors: {
    readonly primary: readonly string[];
    readonly secondary: readonly string[];
    readonly chart: readonly string[];
    readonly background: string;
    readonly foreground: string;
    readonly muted: string;
    readonly accent: string;
  };
  readonly borderRadius: string;
  readonly fontSize: {
    readonly sm: string;
    readonly base: string;
    readonly lg: string;
    readonly xl: string;
  };
  readonly spacing: {
    readonly sm: string;
    readonly base: string;
    readonly lg: string;
    readonly xl: string;
  };
}

export interface AnimationConfig {
  readonly enabled: boolean;
  readonly duration: {
    readonly fast: string;
    readonly normal: string;
    readonly slow: string;
  };
  readonly easing: {
    readonly ease: string;
    readonly bounce: string;
  };
}

export type ThemeMode = "light" | "dark" | "auto";

export interface ThemeContextValue {
  readonly theme: ThemeMode;
  readonly setTheme: (theme: ThemeMode) => void;
  readonly config: ThemeConfig;
  readonly animations: AnimationConfig;
}