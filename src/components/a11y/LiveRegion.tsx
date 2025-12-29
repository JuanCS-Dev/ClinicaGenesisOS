/**
 * LiveRegion Component
 *
 * Announces dynamic content changes to screen readers.
 * Uses ARIA live regions for accessibility.
 *
 * @module components/a11y/LiveRegion
 */

import React, { useEffect, useState } from 'react'

interface LiveRegionProps {
  /** Message to announce to screen readers */
  message: string
  /** Politeness level. 'polite' waits, 'assertive' interrupts */
  politeness?: 'polite' | 'assertive'
  /** Role for the region. 'status' for polite, 'alert' for assertive */
  role?: 'status' | 'alert' | 'log'
  /** Whether the entire region should be read (default: true) */
  atomic?: boolean
  /** Clear message after this delay (ms). Set to 0 to keep message */
  clearAfter?: number
}

/**
 * Component for announcing messages to screen readers.
 *
 * @example
 * <LiveRegion message={successMessage} politeness="polite" />
 * <LiveRegion message={errorMessage} politeness="assertive" role="alert" />
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  politeness = 'polite',
  role = 'status',
  atomic = true,
  clearAfter = 5000,
}) => {
  const [currentMessage, setCurrentMessage] = useState(message)

  useEffect(() => {
    setCurrentMessage(message)

    if (clearAfter > 0 && message) {
      const timeout = setTimeout(() => {
        setCurrentMessage('')
      }, clearAfter)
      return () => clearTimeout(timeout)
    }
  }, [message, clearAfter])

  return (
    <div
      role={role}
      aria-live={politeness}
      aria-atomic={atomic}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      }}
    >
      {currentMessage}
    </div>
  )
}

export default LiveRegion
