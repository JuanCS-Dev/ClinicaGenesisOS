/**
 * VisuallyHidden Component Tests
 *
 * Tests for the visually hidden accessibility component.
 *
 * @module __tests__/components/a11y/VisuallyHidden
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VisuallyHidden } from '../../../components/a11y/VisuallyHidden'

describe('VisuallyHidden', () => {
  describe('rendering', () => {
    it('should render children content', () => {
      render(<VisuallyHidden>Hidden Text</VisuallyHidden>)
      expect(screen.getByText('Hidden Text')).toBeInTheDocument()
    })

    it('should render as span by default', () => {
      render(<VisuallyHidden>Test</VisuallyHidden>)
      const element = screen.getByText('Test')
      expect(element.tagName).toBe('SPAN')
    })

    it('should render as div when specified', () => {
      render(<VisuallyHidden as="div">Test</VisuallyHidden>)
      const element = screen.getByText('Test')
      expect(element.tagName).toBe('DIV')
    })

    it('should render as h1 when specified', () => {
      render(<VisuallyHidden as="h1">Test</VisuallyHidden>)
      const element = screen.getByText('Test')
      expect(element.tagName).toBe('H1')
    })

    it('should render as label when specified', () => {
      render(<VisuallyHidden as="label">Test</VisuallyHidden>)
      const element = screen.getByText('Test')
      expect(element.tagName).toBe('LABEL')
    })
  })

  describe('accessibility', () => {
    it('should be accessible to screen readers', () => {
      render(<VisuallyHidden>Screen reader text</VisuallyHidden>)
      // The text should be in the document (accessible to screen readers)
      expect(screen.getByText('Screen reader text')).toBeInTheDocument()
    })

    it('should use clip-rect technique for hiding', () => {
      render(<VisuallyHidden>Hidden</VisuallyHidden>)
      const element = screen.getByText('Hidden')
      expect(element).toHaveStyle({ clip: 'rect(0, 0, 0, 0)' })
    })

    it('should have absolute positioning', () => {
      render(<VisuallyHidden>Hidden</VisuallyHidden>)
      const element = screen.getByText('Hidden')
      expect(element).toHaveStyle({ position: 'absolute' })
    })

    it('should have 1px dimensions', () => {
      render(<VisuallyHidden>Hidden</VisuallyHidden>)
      const element = screen.getByText('Hidden')
      expect(element).toHaveStyle({ width: '1px', height: '1px' })
    })

    it('should have hidden overflow', () => {
      render(<VisuallyHidden>Hidden</VisuallyHidden>)
      const element = screen.getByText('Hidden')
      expect(element).toHaveStyle({ overflow: 'hidden' })
    })

    it('should have negative margin', () => {
      render(<VisuallyHidden>Hidden</VisuallyHidden>)
      const element = screen.getByText('Hidden')
      expect(element).toHaveStyle({ margin: '-1px' })
    })
  })

  describe('use cases', () => {
    it('should work with icon buttons', () => {
      render(
        <button>
          <span aria-hidden="true">X</span>
          <VisuallyHidden>Close dialog</VisuallyHidden>
        </button>
      )
      expect(screen.getByText('Close dialog')).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveTextContent('Close dialog')
    })

    it('should work with form labels', () => {
      render(
        <label>
          <VisuallyHidden>Search</VisuallyHidden>
          <input type="search" />
        </label>
      )
      expect(screen.getByText('Search')).toBeInTheDocument()
    })
  })
})
