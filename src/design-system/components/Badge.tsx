/**
 * Genesis Design System - Badge Component
 * ========================================
 * 
 * Status indicator with semantic variants.
 * 
 * @example
 * ```tsx
 * <Badge variant="success">Confirmado</Badge>
 * <Badge variant="warning" dot>Pendente</Badge>
 * ```
 * 
 * @module design-system/components/Badge
 * @version 1.0.0
 */

import React from 'react';

export type BadgeVariant = 
  | 'default' 
  | 'primary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info'
  | 'clinical';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /** Visual style variant */
  variant?: BadgeVariant;
  /** Size of the badge */
  size?: BadgeSize;
  /** Show status dot */
  dot?: boolean;
  /** Pulsing animation for status dot */
  pulse?: boolean;
  /** Badge content */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * Variant styles (WCAG AA compliant colors)
 */
const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  default: {
    bg: 'bg-[var(--color-genesis-hover)]',
    text: 'text-[var(--color-genesis-text)]',
    dot: 'bg-[var(--color-genesis-muted)]',
  },
  primary: {
    bg: 'bg-[var(--color-genesis-primary-soft)]',
    text: 'text-[var(--color-genesis-primary-dark)]',
    dot: 'bg-[var(--color-genesis-primary)]',
  },
  success: {
    bg: 'bg-[var(--color-success-soft)]',
    text: 'text-[var(--color-success-dark)]',
    dot: 'bg-[var(--color-success)]',
  },
  warning: {
    bg: 'bg-[var(--color-warning-soft)]',
    text: 'text-[var(--color-warning-dark)]',
    dot: 'bg-[var(--color-warning)]',
  },
  danger: {
    bg: 'bg-[var(--color-danger-soft)]',
    text: 'text-[var(--color-danger-dark)]',
    dot: 'bg-[var(--color-danger)]',
  },
  info: {
    bg: 'bg-[var(--color-info-soft)]',
    text: 'text-[var(--color-info-dark)]',
    dot: 'bg-[var(--color-info)]',
  },
  clinical: {
    bg: 'bg-[var(--color-clinical-soft)]',
    text: 'text-[var(--color-clinical-start)]',
    dot: 'bg-[var(--color-clinical-start)]',
  },
};

/**
 * Size styles
 */
const sizeStyles: Record<BadgeSize, { badge: string; dot: string }> = {
  sm: { badge: 'px-2 py-0.5 text-xs', dot: 'w-1.5 h-1.5' },
  md: { badge: 'px-2.5 py-1 text-xs', dot: 'w-2 h-2' },
  lg: { badge: 'px-3 py-1.5 text-sm', dot: 'w-2.5 h-2.5' },
};

/**
 * Premium Badge Component
 * 
 * Features:
 * - 7 semantic variants
 * - 3 sizes
 * - Optional status dot
 * - Pulse animation
 * - WCAG AA compliant colors
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  children,
  className = '',
}) => {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variantStyle.bg,
        variantStyle.text,
        sizeStyle.badge,
        className,
      ].filter(Boolean).join(' ')}
    >
      {/* Status dot */}
      {dot && (
        <span className="relative flex-shrink-0">
          <span
            className={[
              'rounded-full',
              variantStyle.dot,
              sizeStyle.dot,
              pulse ? 'animate-pulse' : '',
            ].join(' ')}
          />
          {/* Pulse ring */}
          {pulse && (
            <span
              className={[
                'absolute inset-0 rounded-full',
                variantStyle.dot,
                'animate-ping opacity-75',
              ].join(' ')}
              aria-hidden="true"
            />
          )}
        </span>
      )}
      
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export default Badge;

