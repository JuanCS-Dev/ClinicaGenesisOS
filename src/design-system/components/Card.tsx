/**
 * Genesis Design System - Card Component
 * =======================================
 * 
 * Versatile container with consistent styling and optional interactivity.
 * 
 * @example
 * ```tsx
 * <Card interactive onClick={handleClick}>
 *   <Card.Header>
 *     <h3>Título</h3>
 *   </Card.Header>
 *   <Card.Body>
 *     <p>Conteúdo do card</p>
 *   </Card.Body>
 * </Card>
 * ```
 * 
 * @module design-system/components/Card
 * @version 1.0.0
 */

import React, { forwardRef } from 'react';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds hover effects for clickable cards */
  interactive?: boolean;
  /** Padding inside the card */
  padding?: CardPadding;
  /** Border style */
  bordered?: boolean;
  /** Shadow elevation */
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Padding styles
 */
const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

/**
 * Shadow styles
 */
const shadowStyles = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

/**
 * Premium Card Component
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      interactive = false,
      padding = 'md',
      bordered = true,
      shadow = 'sm',
      className = '',
      ...props
    },
    ref
  ) => {
    const styles = [
      // Base styles
      'bg-[var(--color-genesis-surface)] rounded-xl',
      // Border
      bordered ? 'border border-[var(--color-genesis-border)]' : '',
      // Shadow
      shadowStyles[shadow],
      // Padding
      paddingStyles[padding],
      // Interactive styles
      interactive
        ? 'cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-genesis-primary)] focus-visible:ring-offset-2'
        : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={styles}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header Component
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Divider below header */
  divider?: boolean;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, divider = false, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          'px-0 pb-4',
          divider ? 'border-b border-[var(--color-genesis-border)] mb-4' : '',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * Card Body Component
 */
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional children */
  children?: React.ReactNode;
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

/**
 * Card Footer Component
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Divider above footer */
  divider?: boolean;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, divider = false, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          'pt-4 flex items-center justify-end gap-3',
          divider ? 'border-t border-[var(--color-genesis-border)] mt-4' : '',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Card;

