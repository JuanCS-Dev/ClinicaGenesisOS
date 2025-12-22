/**
 * Genesis Design System - Visually Hidden Component
 * ==================================================
 * 
 * Hides content visually while keeping it accessible to screen readers.
 * Essential for providing context to assistive technologies.
 * 
 * @example
 * ```tsx
 * <button>
 *   <Icon />
 *   <VisuallyHidden>Delete item</VisuallyHidden>
 * </button>
 * ```
 * 
 * @module design-system/components/VisuallyHidden
 * @version 1.0.0
 */

import React from 'react';

export interface VisuallyHiddenProps {
  /** Content to hide visually */
  children: React.ReactNode;
  /** Render as specific element */
  as?: 'span' | 'div' | 'p' | 'label';
  /** Make visible when focused (for skip links) */
  focusable?: boolean;
}

/**
 * Visually Hidden Component
 * 
 * Uses the clip-rect technique which is the most reliable
 * method for hiding content from sighted users while
 * remaining accessible to screen readers.
 */
export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  as: Component = 'span',
  focusable = false,
}) => {
  const baseStyles = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;

  const focusableStyles = focusable
    ? `
      &:focus, &:active {
        position: static;
        width: auto;
        height: auto;
        padding: inherit;
        margin: inherit;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }
    `
    : '';

  return (
    <Component
      className="sr-only"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </Component>
  );
};

VisuallyHidden.displayName = 'VisuallyHidden';

export default VisuallyHidden;

