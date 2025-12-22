/**
 * Genesis Design System - Theme Context
 * ======================================
 * 
 * Manages dark mode state with system preference detection and persistence.
 * 
 * @example
 * ```tsx
 * // In App.tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * 
 * // In any component
 * const { theme, setTheme, toggleTheme } = useTheme();
 * ```
 * 
 * @module design-system/ThemeContext
 * @version 1.0.0
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback 
} from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  /** Current theme setting */
  theme: Theme;
  /** Resolved theme (actual applied theme) */
  resolvedTheme: ResolvedTheme;
  /** Update theme */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark */
  toggleTheme: () => void;
  /** Check if dark mode is active */
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'genesis-theme';

/**
 * Get system preference
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
}

/**
 * Get stored theme from localStorage
 */
function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return 'system';
}

/**
 * Apply theme to document
 */
function applyTheme(resolvedTheme: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content',
      resolvedTheme === 'dark' ? '#0F172A' : '#F8FAFC'
    );
  }
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default theme (overrides stored preference) */
  defaultTheme?: Theme;
}

/**
 * Theme Provider Component
 * 
 * Features:
 * - System preference detection
 * - Persistent preference storage
 * - No flash of unstyled content
 * - Responsive to system changes
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children,
  defaultTheme,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (defaultTheme) return defaultTheme;
    return getStoredTheme();
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const stored = defaultTheme || getStoredTheme();
    return stored === 'system' ? getSystemTheme() : stored;
  });

  /**
   * Update theme and persist
   */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // localStorage not available
    }
    
    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  /**
   * Toggle between light and dark
   */
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  /**
   * Apply theme on mount and watch system changes
   */
  useEffect(() => {
    // Apply initial theme
    applyTheme(resolvedTheme);
    
    // Watch for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newResolved = e.matches ? 'dark' : 'light';
        setResolvedTheme(newResolved);
        applyTheme(newResolved);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, resolvedTheme]);

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.displayName = 'ThemeProvider';

/**
 * Hook to access theme context
 * 
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

export default ThemeProvider;

