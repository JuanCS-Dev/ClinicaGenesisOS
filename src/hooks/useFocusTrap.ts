/**
 * useFocusTrap Hook
 *
 * Traps focus within a container element for accessibility.
 * Essential for modals, dialogs, and dropdown menus.
 *
 * @module hooks/useFocusTrap
 */

import { useEffect, useRef, useCallback, type RefObject } from 'react'

/** Focusable element selectors */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ')

interface UseFocusTrapOptions {
  /** Whether the trap is active. Default: true */
  enabled?: boolean
  /** Restore focus to previous element on unmount. Default: true */
  restoreFocus?: boolean
  /** Auto-focus first element when enabled. Default: true */
  autoFocus?: boolean
}

/**
 * Hook that traps focus within a container element.
 *
 * @example
 * function Modal({ isOpen, onClose, children }) {
 *   const containerRef = useFocusTrap<HTMLDivElement>({ enabled: isOpen })
 *   return (
 *     <div ref={containerRef} role="dialog" aria-modal="true">
 *       {children}
 *     </div>
 *   )
 * }
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: UseFocusTrapOptions = {}
): RefObject<T | null> {
  const { enabled = true, restoreFocus = true, autoFocus = true } = options
  const containerRef = useRef<T>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  /**
   * Gets all focusable elements within the container.
   */
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter(el => {
      // Filter out elements that are not visible
      const style = window.getComputedStyle(el)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })
  }, [])

  /**
   * Handles keydown events for focus trapping.
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Shift + Tab: Move backwards
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab: Move forwards
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    },
    [enabled, getFocusableElements]
  )

  useEffect(() => {
    if (!enabled) return

    // Store currently focused element
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement
    }

    // Auto-focus first focusable element
    if (autoFocus) {
      const focusableElements = getFocusableElements()
      if (focusableElements.length > 0) {
        // Small delay to ensure DOM is ready
        requestAnimationFrame(() => {
          focusableElements[0].focus()
        })
      }
    }

    // Add keydown listener
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      // Restore focus on unmount
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [enabled, autoFocus, restoreFocus, getFocusableElements, handleKeyDown])

  return containerRef
}

export default useFocusTrap
