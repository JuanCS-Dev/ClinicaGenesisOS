/**
 * Genesis Design System - Skip Link Component
 * ============================================
 * 
 * Accessible skip link for keyboard navigation.
 * Allows users to skip repetitive navigation and jump to main content.
 * 
 * WCAG 2.1 AA Requirement: 2.4.1 Bypass Blocks
 * 
 * @example
 * ```tsx
 * // In App.tsx or layout
 * <SkipLink href="#main-content" />
 * 
 * // In main content area
 * <main id="main-content">...</main>
 * ```
 * 
 * @module design-system/components/SkipLink
 * @version 1.0.0
 */

import React from 'react';

export interface SkipLinkProps {
  /** Target element ID (without #) */
  href?: string;
  /** Custom label */
  label?: string;
  /** Additional class name */
  className?: string;
}

/**
 * Skip Link Component
 * 
 * Features:
 * - Hidden until focused (keyboard users only)
 * - Smooth appearance animation
 * - High contrast for visibility
 * - WCAG AA compliant
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  href = '#main-content',
  label = 'Pular para o conteúdo principal',
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      (target as HTMLElement).focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={[
        // Hidden by default, visible on focus
        'sr-only focus:not-sr-only',
        // Positioning
        'fixed top-4 left-4 z-[100]',
        // Styling
        'px-4 py-3 rounded-lg',
        'bg-[var(--color-genesis-primary)] text-white',
        'font-medium text-sm',
        'shadow-lg',
        // Focus styles
        'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--color-genesis-primary)]',
        // Animation
        'transition-all duration-200',
        className,
      ].join(' ')}
    >
      {label}
    </a>
  );
};

SkipLink.displayName = 'SkipLink';

export default SkipLink;

