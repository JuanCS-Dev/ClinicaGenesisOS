/**
 * Genesis Design System - Theme Toggle Component
 * ===============================================
 * 
 * Accessible toggle switch for dark/light mode.
 * 
 * @example
 * ```tsx
 * <ThemeToggle />
 * <ThemeToggle showLabel />
 * ```
 * 
 * @module design-system/components/ThemeToggle
 * @version 1.0.0
 */

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '../ThemeContext';

export interface ThemeToggleProps {
  /** Show current theme label */
  showLabel?: boolean;
  /** Size of the toggle */
  size?: 'sm' | 'md' | 'lg';
  /** Show all three options (light, dark, system) */
  showSystemOption?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Size configurations
 */
const sizeConfigs = {
  sm: { icon: 14, button: 'p-1.5' },
  md: { icon: 18, button: 'p-2' },
  lg: { icon: 22, button: 'p-2.5' },
};

/**
 * Theme labels
 */
const themeLabels: Record<Theme, string> = {
  light: 'Claro',
  dark: 'Escuro',
  system: 'Sistema',
};

/**
 * Theme Toggle Button
 * 
 * Simple button that cycles through themes or toggles light/dark.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = false,
  size = 'md',
  showSystemOption = false,
  className = '',
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const config = sizeConfigs[size];

  /**
   * Get next theme in cycle
   */
  const cycleTheme = () => {
    if (!showSystemOption) {
      toggleTheme();
      return;
    }

    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  /**
   * Get icon for current state
   */
  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor size={config.icon} />;
    }
    return resolvedTheme === 'dark' 
      ? <Moon size={config.icon} /> 
      : <Sun size={config.icon} />;
  };

  return (
    <button
      onClick={cycleTheme}
      className={[
        'inline-flex items-center gap-2 rounded-lg',
        config.button,
        'text-[var(--color-genesis-muted)] hover:text-[var(--color-genesis-text)]',
        'hover:bg-[var(--color-genesis-hover)]',
        'transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-genesis-primary)] focus-visible:ring-offset-2',
        className,
      ].join(' ')}
      aria-label={`Tema atual: ${themeLabels[theme]}. Clique para alternar.`}
      title={`Tema: ${themeLabels[theme]}`}
    >
      <span className="transition-transform duration-200 hover:scale-110">
        {getIcon()}
      </span>
      
      {showLabel && (
        <span className="text-sm font-medium">
          {themeLabels[theme]}
        </span>
      )}
    </button>
  );
};

/**
 * Theme Segmented Control
 * 
 * Shows all three options as a segmented control.
 */
export interface ThemeSegmentedProps {
  /** Size of the control */
  size?: 'sm' | 'md';
  /** Additional class name */
  className?: string;
}

export const ThemeSegmented: React.FC<ThemeSegmentedProps> = ({
  size = 'md',
  className = '',
}) => {
  const { theme, setTheme } = useTheme();
  
  const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun size={size === 'sm' ? 14 : 16} />, label: 'Claro' },
    { value: 'dark', icon: <Moon size={size === 'sm' ? 14 : 16} />, label: 'Escuro' },
    { value: 'system', icon: <Monitor size={size === 'sm' ? 14 : 16} />, label: 'Sistema' },
  ];

  return (
    <div
      className={[
        'inline-flex rounded-lg bg-[var(--color-genesis-hover)] p-1',
        className,
      ].join(' ')}
      role="radiogroup"
      aria-label="Selecionar tema"
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          role="radio"
          aria-checked={theme === option.value}
          className={[
            'flex items-center gap-1.5 rounded-md transition-all duration-200',
            size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
            theme === option.value
              ? 'bg-[var(--color-genesis-surface)] text-[var(--color-genesis-text)] shadow-sm'
              : 'text-[var(--color-genesis-muted)] hover:text-[var(--color-genesis-text)]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-genesis-primary)] focus-visible:ring-inset',
          ].join(' ')}
        >
          {option.icon}
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

ThemeToggle.displayName = 'ThemeToggle';
ThemeSegmented.displayName = 'ThemeSegmented';

export default ThemeToggle;

