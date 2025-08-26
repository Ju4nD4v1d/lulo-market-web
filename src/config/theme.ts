export const theme = {
  colors: {
    // Brand accent (use sparingly for highlights only)
    brand: '#E7FF01',

    // Primary Lulo green scale for UI components
    primary400: '#C8E400',
    primary500: '#A3C700',
    primary700: '#7A8B00',

    // Common neutrals and semantic colors
    neutralBg: '#ffffff',
    neutralText: '#262626',
    danger: '#df1b41',
  },
} as const;

export type AppTheme = typeof theme;
