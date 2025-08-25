export const tokens = {
  colors: {
    primary: {
      50: 'hsl(210 100% 98%)',
      100: 'hsl(210 100% 95%)',
      200: 'hsl(210 100% 90%)',
      300: 'hsl(210 100% 82%)',
      400: 'hsl(210 100% 70%)',
      500: 'hsl(210 100% 50%)',
      600: 'hsl(210 100% 45%)',
      700: 'hsl(210 100% 35%)',
      800: 'hsl(210 100% 25%)',
      900: 'hsl(210 100% 15%)',
      950: 'hsl(210 100% 8%)',
    },
    chart: {
      1: 'hsl(210 100% 50%)',
      2: 'hsl(340 100% 50%)',
      3: 'hsl(120 100% 40%)',
      4: 'hsl(45 100% 50%)',
      5: 'hsl(270 100% 50%)',
      6: 'hsl(195 100% 50%)',
      7: 'hsl(30 100% 50%)',
      8: 'hsl(285 100% 50%)',
      9: 'hsl(75 100% 40%)',
      10: 'hsl(15 100% 50%)',
    },
    semantic: {
      success: 'hsl(120 100% 40%)',
      warning: 'hsl(45 100% 50%)',
      error: 'hsl(0 84% 60%)',
      info: 'hsl(210 100% 50%)',
    },
  },
  spacing: {
    chart: {
      padding: '1rem',
      paddingSm: '0.5rem',
      paddingLg: '1.5rem',
      margin: '0.5rem',
      marginSm: '0.25rem',
      marginLg: '1rem',
    },
    kpi: {
      padding: '1.5rem',
      gap: '1rem',
    },
    table: {
      padding: '0.75rem',
      headerPadding: '1rem',
    },
  },
  typography: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  borderRadius: {
    sm: '0.25rem',
    base: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '800ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
} as const;

export type Tokens = typeof tokens;