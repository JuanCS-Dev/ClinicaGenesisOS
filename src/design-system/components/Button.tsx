/**
 * Genesis Design System - Button Component
 * =========================================
 * 
 * Premium button with 5 variants, loading state, and full accessibility.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" loading={isSubmitting}>
 *   Salvar
 * </Button>
 * ```
 * 
 * @module design-system/components/Button
 * @version 1.0.0
 */

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Shows loading spinner and disables button */
  loading?: boolean;
  /** Icon to show before text */
  leftIcon?: React.ReactNode;
  /** Icon to show after text */
  rightIcon?: React.ReactNode;
  /** Makes button full width */
  fullWidth?: boolean;
}

/**
 * Base styles shared across all variants
 */
const baseStyles = `
  inline-flex items-center justify-center gap-2
  font-medium rounded-lg
  transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  active:scale-[0.98]
`.replace(/\s+/g, ' ').trim();

/**
 * Variant-specific styles
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--color-genesis-primary)] text-white
    hover:bg-[var(--color-genesis-primary-dark)]
    focus-visible:ring-[var(--color-genesis-primary)]
    shadow-sm hover:shadow-[var(--shadow-primary)]
  `,
  secondary: `
    bg-[var(--color-genesis-soft)] text-[var(--color-genesis-text)]
    hover:bg-[var(--color-genesis-hover)]
    focus-visible:ring-[var(--color-genesis-primary)]
    border border-[var(--color-genesis-border)]
  `,
  outline: `
    bg-transparent text-[var(--color-genesis-primary)]
    border border-[var(--color-genesis-primary)]
    hover:bg-[var(--color-genesis-primary-soft)]
    focus-visible:ring-[var(--color-genesis-primary)]
  `,
  ghost: `
    bg-transparent text-[var(--color-genesis-text)]
    hover:bg-[var(--color-genesis-hover)]
    focus-visible:ring-[var(--color-genesis-primary)]
  `,
  danger: `
    bg-[var(--color-danger)] text-white
    hover:bg-[var(--color-danger-dark)]
    focus-visible:ring-[var(--color-danger)]
    shadow-sm hover:shadow-[var(--shadow-danger)]
  `,
};

/**
 * Size-specific styles
 */
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

/**
 * Icon size based on button size
 */
const iconSizes: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

/**
 * Premium Button Component
 * 
 * Features:
 * - 5 variants (primary, secondary, outline, ghost, danger)
 * - 3 sizes (sm, md, lg)
 * - Loading state with spinner
 * - Left/right icon support
 * - Full width option
 * - WCAG AA compliant focus indicators
 * - Snappy animations
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const iconSize = iconSizes[size];

    const combinedStyles = [
      baseStyles,
      variantStyles[variant].replace(/\s+/g, ' ').trim(),
      sizeStyles[size],
      fullWidth ? 'w-full' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={combinedStyles}
        aria-busy={loading}
        {...props}
      >
        {/* Loading spinner or left icon */}
        {loading ? (
          <Loader2 
            size={iconSize} 
            className="animate-spin" 
            aria-hidden="true" 
          />
        ) : leftIcon ? (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}

        {/* Button text */}
        {children && (
          <span className={loading ? 'opacity-70' : ''}>
            {children}
          </span>
        )}

        {/* Right icon */}
        {rightIcon && !loading && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}

        {/* Screen reader loading announcement */}
        {loading && (
          <span className="sr-only">Carregando...</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

