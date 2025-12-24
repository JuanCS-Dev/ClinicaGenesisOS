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
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Shadow styles
 */
const shadowStyles = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md hover:shadow-lg',
  lg: 'shadow-lg hover:shadow-xl',
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
      shadow = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const styles = [
      // Base styles
      'group relative bg-genesis-surface rounded-2xl overflow-hidden',
      // Border with hover effect
      bordered
        ? 'border border-genesis-border-subtle hover:border-genesis-primary/30'
        : '',
      // Shadow
      shadowStyles[shadow],
      // Padding
      paddingStyles[padding],
      // Transition
      'transition-all duration-300 ease-out',
      // Interactive styles
      interactive
        ? 'cursor-pointer hover:-translate-y-1.5 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-genesis-primary focus-visible:ring-offset-2'
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
        {/* Subtle gradient overlay on hover for interactive cards */}
        {interactive && (
          <div className="absolute inset-0 bg-gradient-to-br from-genesis-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}
        <div className="relative">
          {children}
        </div>
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
  ({ children, divider = true, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          'flex items-center justify-between pb-4',
          divider ? 'border-b border-genesis-border-subtle mb-4' : '',
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
  ({ children, divider = true, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          'pt-4 flex items-center justify-between gap-3',
          divider ? 'border-t border-genesis-border-subtle mt-4' : '',
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

