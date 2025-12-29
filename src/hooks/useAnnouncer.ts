/**
 * useAnnouncer Hook
 *
 * Provides a way to announce messages to screen readers.
 * Uses ARIA live regions for accessibility announcements.
 *
 * @module hooks/useAnnouncer
 */

import { useCallback, useEffect, useRef } from 'react'

type Politeness = 'polite' | 'assertive'

interface AnnouncerOptions {
  /** How urgently the message should be announced. Default: 'polite' */
  politeness?: Politeness
  /** Delay before clearing the message (ms). Default: 1000 */
  clearDelay?: number
}

/** Global announcer container ID */
const ANNOUNCER_ID = 'genesis-a11y-announcer'

/**
 * Creates or gets the announcer element for screen readers.
 */
function getOrCreateAnnouncer(): HTMLDivElement {
  let announcer = document.getElementById(ANNOUNCER_ID) as HTMLDivElement | null

  if (!announcer) {
    announcer = document.createElement('div')
    announcer.id = ANNOUNCER_ID
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.setAttribute('role', 'status')
    // Visually hidden but accessible to screen readers
    Object.assign(announcer.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    })
    document.body.appendChild(announcer)
  }

  return announcer
}

/**
 * Hook for announcing messages to screen readers.
 *
 * @example
 * const announce = useAnnouncer()
 * announce('Item saved successfully')
 * announce('Error: Form validation failed', { politeness: 'assertive' })
 */
export function useAnnouncer() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const announce = useCallback((message: string, options: AnnouncerOptions = {}) => {
    const { politeness = 'polite', clearDelay = 1000 } = options
    const announcer = getOrCreateAnnouncer()

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Update politeness level
    announcer.setAttribute('aria-live', politeness)

    // Clear and set message (ensures announcement even if same message)
    announcer.textContent = ''
    requestAnimationFrame(() => {
      announcer.textContent = message
    })

    // Clear message after delay
    timeoutRef.current = setTimeout(() => {
      announcer.textContent = ''
    }, clearDelay)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return announce
}

export default useAnnouncer
