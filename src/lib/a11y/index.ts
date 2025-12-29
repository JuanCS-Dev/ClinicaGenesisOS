/**
 * Accessibility Utilities
 *
 * Helpers and constants for WCAG 2.1 AA compliance.
 *
 * @module lib/a11y
 */

/** Minimum contrast ratios for WCAG 2.1 AA */
export const CONTRAST_RATIOS = {
  /** Normal text (less than 18pt or less than 14pt bold) */
  normalText: 4.5,
  /** Large text (18pt+ or 14pt+ bold) */
  largeText: 3.0,
  /** UI components and graphical objects */
  uiComponents: 3.0,
} as const

/** Keyboard key codes for accessibility */
export const A11Y_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const

/**
 * Checks if an element is focusable.
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']
  const tabIndex = element.getAttribute('tabindex')

  if (element.hasAttribute('disabled')) return false
  if (tabIndex === '-1') return false
  if (focusableTags.includes(element.tagName)) return true
  if (tabIndex !== null && parseInt(tabIndex, 10) >= 0) return true
  if (element.getAttribute('contenteditable') === 'true') return true

  return false
}

/**
 * Gets all focusable elements within a container.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ')

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(el => {
    const style = window.getComputedStyle(el)
    return style.display !== 'none' && style.visibility !== 'hidden'
  })
}

/**
 * Traps focus within a container.
 */
export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return

  const focusable = getFocusableElements(container)
  if (focusable.length === 0) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

/**
 * Creates an accessible keyboard handler for click actions.
 * Allows activation via Enter and Space keys.
 */
export function handleKeyboardClick(handler: () => void): (event: React.KeyboardEvent) => void {
  return (event: React.KeyboardEvent) => {
    if (event.key === A11Y_KEYS.ENTER || event.key === A11Y_KEYS.SPACE) {
      event.preventDefault()
      handler()
    }
  }
}

/**
 * Generates a unique ID for accessibility attributes.
 */
export function generateA11yId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Visually hidden styles for screen reader only content.
 * Use this class for content that should be read by screen readers
 * but not visible on screen.
 */
export const srOnlyStyles = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  border: '0',
}

/**
 * CSS class for visually hidden content (sr-only).
 */
export const SR_ONLY_CLASS = 'sr-only'

/**
 * Announces a message to screen readers using aria-live.
 * @param message The message to announce
 * @param politeness 'polite' for non-urgent, 'assertive' for urgent
 */
export function announceToScreenReader(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
): void {
  const announcer = document.getElementById('genesis-a11y-announcer')
  if (announcer) {
    announcer.setAttribute('aria-live', politeness)
    announcer.textContent = ''
    requestAnimationFrame(() => {
      announcer.textContent = message
    })
  }
}
