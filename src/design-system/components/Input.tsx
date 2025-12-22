/**
 * Genesis Design System - Input Component
 * ========================================
 * 
 * Premium text input with label, helper text, and validation states.
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="seu@email.com"
 *   error="Email inválido"
 * />
 * ```
 * 
 * @module design-system/components/Input
 * @version 1.0.0
 */

import React, { forwardRef, useId } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text */
  label?: string;
  /** Helper text shown below input */
  helperText?: string;
  /** Error message (shows error state) */
  error?: string;
  /** Size of the input */
  size?: InputSize;
  /** Icon to show on the left */
  leftIcon?: React.ReactNode;
  /** Icon to show on the right */
  rightIcon?: React.ReactNode;
  /** Makes input full width */
  fullWidth?: boolean;
}

/**
 * Size-specific styles
 */
const sizeStyles: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-4 text-base',
};

/**
 * Icon padding adjustments
 */
const iconPadding = {
  left: {
    sm: 'pl-8',
    md: 'pl-10',
    lg: 'pl-12',
  },
  right: {
    sm: 'pr-8',
    md: 'pr-10',
    lg: 'pr-12',
  },
};

/**
 * Icon position styles
 */
const iconPositionStyles = {
  left: {
    sm: 'left-2.5',
    md: 'left-3',
    lg: 'left-4',
  },
  right: {
    sm: 'right-2.5',
    md: 'right-3',
    lg: 'right-4',
  },
};

/**
 * Premium Input Component
 * 
 * Features:
 * - Label with proper association
 * - Helper text
 * - Error state with message
 * - 3 sizes (sm, md, lg)
 * - Left/right icon support
 * - WCAG AA compliant focus indicators
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = '',
      disabled,
      id: propId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = propId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const hasError = Boolean(error);

    const inputStyles = [
      // Base styles
      'rounded-lg border bg-[var(--color-genesis-surface)]',
      'text-[var(--color-genesis-text)] placeholder:text-[var(--color-genesis-subtle)]',
      'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-[var(--color-genesis-soft)] disabled:cursor-not-allowed disabled:opacity-60',
      // Size
      sizeStyles[size],
      // Width
      fullWidth ? 'w-full' : '',
      // Icon padding
      leftIcon ? iconPadding.left[size] : '',
      rightIcon ? iconPadding.right[size] : '',
      // State styles
      hasError
        ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
        : 'border-[var(--color-genesis-border)] focus:ring-[var(--color-genesis-primary)] focus:border-[var(--color-genesis-primary)]',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-[var(--color-genesis-text)] mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <span 
              className={`absolute ${iconPositionStyles.left[size]} top-1/2 -translate-y-1/2 text-[var(--color-genesis-muted)] pointer-events-none`}
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={inputStyles}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <span 
              className={`absolute ${iconPositionStyles.right[size]} top-1/2 -translate-y-1/2 text-[var(--color-genesis-muted)] pointer-events-none`}
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </div>

        {/* Error message */}
        {hasError && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-[var(--color-danger)]"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Helper text (only shown if no error) */}
        {helperText && !hasError && (
          <p
            id={helperId}
            className="mt-1.5 text-sm text-[var(--color-genesis-muted)]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

