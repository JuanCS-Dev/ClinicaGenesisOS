/**
 * Genesis Design System
 * =====================
 * 
 * Central export point for all design system utilities, tokens, and components.
 * 
 * Usage:
 * ```ts
 * import { COLORS, SPACING, Button, Modal } from '@/design-system';
 * ```
 * 
 * @module design-system
 * @version 1.0.0
 */

// Tokens
export * from './tokens';

// Components
export * from './components';

// Theme
export { 
  ThemeProvider, 
  useTheme, 
  type Theme, 
  type ResolvedTheme,
  type ThemeProviderProps,
} from './ThemeContext';

