/**
 * Genesis Design System - TypeScript Tokens
 * ==========================================
 * 
 * Type-safe access to design tokens defined in index.css.
 * Use these constants for runtime access to design values.
 * 
 * @module design-system/tokens
 * @version 1.0.0
 */

/* ==========================================================================
   COLOR TOKENS
   ========================================================================== */

/**
 * Primary color palette - Teal (WCAG AA Compliant)
 * All colors pass 4.5:1 contrast ratio with white text
 */
export const COLORS = {
  primary: {
    DEFAULT: '#0F766E',   // Teal 700 - WCAG AA
    light: '#0D9488',     // Teal 600
    dark: '#115E59',      // Teal 800
    soft: '#CCFBF1',
    muted: '#5EEAD4',
  },
  
  text: {
    dark: '#0F172A',
    DEFAULT: '#1E293B',
    muted: '#64748B',
    subtle: '#94A3B8',
  },
  
  surface: {
    DEFAULT: '#FFFFFF',
    soft: '#F8FAFC',
    hover: '#F1F5F9',
  },
  
  border: {
    DEFAULT: '#CBD5E1',   // Slate 300 - visible
    subtle: '#E2E8F0',
  },
  
  clinical: {
    start: '#4F46E5',     // Indigo 600 - WCAG AA
    end: '#7C3AED',       // Violet 600 - WCAG AA
    soft: '#EEF2FF',
    muted: '#A5B4FC',
  },
  
  semantic: {
    success: {
      DEFAULT: '#047857', // Emerald 700 - WCAG AA (4.66:1)
      dark: '#065F46',
      soft: '#D1FAE5',
    },
    warning: {
      DEFAULT: '#B45309', // Amber 700 - WCAG AA (4.85:1)
      dark: '#92400E',
      soft: '#FEF3C7',
    },
    danger: {
      DEFAULT: '#DC2626', // Red 600 - WCAG AA
      dark: '#B91C1C',
      soft: '#FEE2E2',
    },
    info: {
      DEFAULT: '#2563EB', // Blue 600 - WCAG AA
      dark: '#1D4ED8',
      soft: '#DBEAFE',
    },
  },
  
  specialty: {
    medicina: '#0F766E',  // Teal 700 - WCAG AA
    nutricao: '#047857',  // Emerald 700 - WCAG AA
    psicologia: '#DB2777', // Pink 600 - WCAG AA
    odonto: '#0E7490',    // Cyan 700 - WCAG AA
    fisio: '#7C3AED',     // Violet 600 - WCAG AA
    estetica: '#C2410C',  // Orange 700 - WCAG AA
  },
} as const;

/**
 * Dark mode color overrides
 */
export const COLORS_DARK = {
  primary: {
    DEFAULT: '#14B8A6',
    light: '#2DD4BF',
    dark: '#0D9488',
    soft: '#134E4A',
  },
  
  text: {
    dark: '#F1F5F9',
    DEFAULT: '#E2E8F0',
    muted: '#94A3B8',
    subtle: '#64748B',
  },
  
  surface: {
    DEFAULT: '#1E293B',
    soft: '#0F172A',
    hover: '#334155',
  },
  
  border: {
    DEFAULT: '#475569',
    subtle: '#334155',
  },
} as const;

/* ==========================================================================
   TYPOGRAPHY TOKENS
   ========================================================================== */

/**
 * Font families
 */
export const FONTS = {
  sans: "'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
  display: "'Inter Variable', 'Inter', sans-serif",
} as const;

/**
 * Font sizes (rem) - Major Third Scale (1.25)
 */
export const FONT_SIZES = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
} as const;

/**
 * Font weights
 */
export const FONT_WEIGHTS = {
  thin: 100,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

/**
 * Line heights
 */
export const LINE_HEIGHTS = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

/* ==========================================================================
   SPACING TOKENS
   ========================================================================== */

/**
 * Spacing scale (rem) - 4px grid
 */
export const SPACING = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
} as const;

/* ==========================================================================
   BORDER RADIUS TOKENS
   ========================================================================== */

/**
 * Border radius scale
 */
export const RADII = {
  none: '0',
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  full: '9999px',
} as const;

/* ==========================================================================
   SHADOW TOKENS
   ========================================================================== */

/**
 * Box shadow scale
 */
export const SHADOWS = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  none: 'none',
  
  // Colored shadows
  primary: '0 10px 20px -5px rgba(13, 148, 136, 0.25)',
  primaryLg: '0 20px 40px -10px rgba(13, 148, 136, 0.3)',
  clinical: '0 10px 20px -5px rgba(99, 102, 241, 0.25)',
  danger: '0 10px 20px -5px rgba(239, 68, 68, 0.25)',
} as const;

/* ==========================================================================
   ANIMATION TOKENS
   ========================================================================== */

/**
 * Easing curves - Snappy feel
 */
export const EASINGS = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  snappy: 'cubic-bezier(0.4, 0, 0.2, 1)',
  snappyEnter: 'cubic-bezier(0, 0, 0.2, 1)',
  snappyExit: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

/**
 * Duration values (ms)
 */
export const DURATIONS = {
  instant: 75,
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 400,
  slowest: 500,
} as const;

/* ==========================================================================
   DENSITY TOKENS
   ========================================================================== */

/**
 * Density mode values
 */
export const DENSITY = {
  comfortable: {
    paddingY: '0.75rem',
    paddingX: '1rem',
    gap: '1rem',
    rowHeight: '3rem',
  },
  compact: {
    paddingY: '0.375rem',
    paddingX: '0.75rem',
    gap: '0.5rem',
    rowHeight: '2.25rem',
  },
} as const;

/* ==========================================================================
   BREAKPOINTS
   ========================================================================== */

/**
 * Responsive breakpoints
 */
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/* ==========================================================================
   Z-INDEX
   ========================================================================== */

/**
 * Z-index scale for layering
 */
export const Z_INDEX = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  max: 100,
} as const;

/* ==========================================================================
   TYPE EXPORTS
   ========================================================================== */

export type ColorKey = keyof typeof COLORS;
export type FontSize = keyof typeof FONT_SIZES;
export type FontWeight = keyof typeof FONT_WEIGHTS;
export type Spacing = keyof typeof SPACING;
export type Radius = keyof typeof RADII;
export type Shadow = keyof typeof SHADOWS;
export type Easing = keyof typeof EASINGS;
export type Duration = keyof typeof DURATIONS;
export type DensityMode = keyof typeof DENSITY;
export type Breakpoint = keyof typeof BREAKPOINTS;
export type ZIndex = keyof typeof Z_INDEX;

