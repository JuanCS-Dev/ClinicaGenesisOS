/**
 * VisuallyHidden Component
 *
 * Hides content visually while keeping it accessible to screen readers.
 * Essential for providing context to assistive technologies.
 *
 * @module components/a11y/VisuallyHidden
 */

import React from 'react'

interface VisuallyHiddenProps {
  /** Content to be hidden visually but accessible to screen readers */
  children: React.ReactNode
  /** HTML element to render. Default: 'span' */
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label'
}

/** Styles that hide content visually but keep it accessible */
const visuallyHiddenStyles: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
}

/**
 * Component that hides content visually but keeps it accessible to screen readers.
 *
 * @example
 * <button>
 *   <IconSearch />
 *   <VisuallyHidden>Search</VisuallyHidden>
 * </button>
 */
export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ children, as = 'span' }) => {
  const Element = as

  return <Element style={visuallyHiddenStyles}>{children}</Element>
}

export default VisuallyHidden
