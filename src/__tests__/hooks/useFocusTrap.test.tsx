/**
 * useFocusTrap Hook Tests
 *
 * Tests for the focus trap accessibility hook.
 *
 * @module __tests__/hooks/useFocusTrap
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFocusTrap } from '../../hooks/useFocusTrap'

describe('useFocusTrap', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should return a ref object', () => {
      const { result } = renderHook(() => useFocusTrap())
      expect(result.current).toHaveProperty('current')
    })

    it('should initialize ref with null', () => {
      const { result } = renderHook(() => useFocusTrap())
      expect(result.current.current).toBeNull()
    })
  })

  describe('focus management', () => {
    it('should auto-focus first focusable element when enabled', async () => {
      function TestComponent() {
        const ref = useFocusTrap<HTMLDivElement>({ enabled: true })
        return (
          <div ref={ref}>
            <button data-testid="first">First</button>
            <button data-testid="second">Second</button>
          </div>
        )
      }

      render(<TestComponent />)

      // Wait for requestAnimationFrame
      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByTestId('first')).toHaveFocus()
    })

    it('should not auto-focus when autoFocus is false', async () => {
      function TestComponent() {
        const ref = useFocusTrap<HTMLDivElement>({ enabled: true, autoFocus: false })
        return (
          <div ref={ref}>
            <button data-testid="first">First</button>
            <button data-testid="second">Second</button>
          </div>
        )
      }

      render(<TestComponent />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByTestId('first')).not.toHaveFocus()
    })

    it('should not focus when disabled', async () => {
      function TestComponent() {
        const ref = useFocusTrap<HTMLDivElement>({ enabled: false })
        return (
          <div ref={ref}>
            <button data-testid="first">First</button>
          </div>
        )
      }

      render(<TestComponent />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByTestId('first')).not.toHaveFocus()
    })
  })

  describe('focus restoration', () => {
    it('should restore focus on unmount when restoreFocus is true', async () => {
      const outsideButton = document.createElement('button')
      outsideButton.textContent = 'Outside'
      document.body.appendChild(outsideButton)
      outsideButton.focus()

      function TestComponent({ show }: { show: boolean }) {
        const ref = useFocusTrap<HTMLDivElement>({ enabled: show, restoreFocus: true })
        if (!show) return null
        return (
          <div ref={ref}>
            <button>Inside</button>
          </div>
        )
      }

      const { rerender } = render(<TestComponent show={true} />)

      await act(async () => {
        vi.runAllTimers()
      })

      rerender(<TestComponent show={false} />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(outsideButton).toHaveFocus()
      document.body.removeChild(outsideButton)
    })

    it('should not restore focus when restoreFocus is false', async () => {
      const outsideButton = document.createElement('button')
      outsideButton.textContent = 'Outside'
      document.body.appendChild(outsideButton)
      outsideButton.focus()

      function TestComponent({ show }: { show: boolean }) {
        const ref = useFocusTrap<HTMLDivElement>({ enabled: show, restoreFocus: false })
        if (!show) return null
        return (
          <div ref={ref}>
            <button>Inside</button>
          </div>
        )
      }

      const { rerender } = render(<TestComponent show={true} />)

      await act(async () => {
        vi.runAllTimers()
      })

      rerender(<TestComponent show={false} />)

      expect(outsideButton).not.toHaveFocus()
      document.body.removeChild(outsideButton)
    })
  })

  describe('tab trapping', () => {
    it('should trap Tab at last element', async () => {
      vi.useRealTimers()
      const user = userEvent.setup()

      function TestComponent() {
        const ref = useFocusTrap<HTMLDivElement>({ enabled: true, autoFocus: false })
        return (
          <div ref={ref}>
            <button data-testid="first">First</button>
            <button data-testid="second">Second</button>
            <button data-testid="third">Third</button>
          </div>
        )
      }

      render(<TestComponent />)

      // Focus the last element
      const third = screen.getByTestId('third')
      third.focus()
      expect(third).toHaveFocus()

      // Tab should wrap to first
      await user.tab()
      expect(screen.getByTestId('first')).toHaveFocus()
    })

    it('should trap Shift+Tab at first element', async () => {
      vi.useRealTimers()
      const user = userEvent.setup()

      function TestComponent() {
        const ref = useFocusTrap<HTMLDivElement>({ enabled: true, autoFocus: false })
        return (
          <div ref={ref}>
            <button data-testid="first">First</button>
            <button data-testid="second">Second</button>
            <button data-testid="third">Third</button>
          </div>
        )
      }

      render(<TestComponent />)

      // Focus the first element
      const first = screen.getByTestId('first')
      first.focus()
      expect(first).toHaveFocus()

      // Shift+Tab should wrap to last
      await user.tab({ shift: true })
      expect(screen.getByTestId('third')).toHaveFocus()
    })

    it('should not trap when disabled', async () => {
      vi.useRealTimers()
      const user = userEvent.setup()

      function TestComponent() {
        const ref = useFocusTrap<HTMLDivElement>({ enabled: false })
        return (
          <div ref={ref}>
            <button data-testid="first">First</button>
            <button data-testid="second">Second</button>
          </div>
        )
      }

      render(<TestComponent />)

      const first = screen.getByTestId('first')
      first.focus()

      // Tab should work normally (not trapped)
      await user.tab()
      // Focus moves to second as normal
      expect(screen.getByTestId('second')).toHaveFocus()
    })
  })

  describe('focusable elements', () => {
    it('should handle various focusable elements', async () => {
      function TestComponent() {
        const ref = useFocusTrap<HTMLDivElement>({ enabled: true })
        return (
          <div ref={ref}>
            <a href="#" data-testid="link">
              Link
            </a>
            <button data-testid="button">Button</button>
            <input data-testid="input" />
            <textarea data-testid="textarea" />
            <select data-testid="select">
              <option>Option</option>
            </select>
          </div>
        )
      }

      render(<TestComponent />)

      await act(async () => {
        vi.runAllTimers()
      })

      // First focusable should be focused
      expect(screen.getByTestId('link')).toHaveFocus()
    })

    it('should skip disabled elements', async () => {
      function TestComponent() {
        const ref = useFocusTrap<HTMLDivElement>({ enabled: true })
        return (
          <div ref={ref}>
            <button disabled data-testid="disabled">
              Disabled
            </button>
            <button data-testid="enabled">Enabled</button>
          </div>
        )
      }

      render(<TestComponent />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByTestId('enabled')).toHaveFocus()
    })

    it('should skip elements with negative tabindex', async () => {
      function TestComponent() {
        const ref = useFocusTrap<HTMLDivElement>({ enabled: true })
        return (
          <div ref={ref}>
            <div tabIndex={-1} data-testid="negative">
              Negative (not focusable)
            </div>
            <button data-testid="normal">Normal</button>
          </div>
        )
      }

      render(<TestComponent />)

      await act(async () => {
        vi.runAllTimers()
      })

      // First focusable element should be focused (normal button)
      expect(screen.getByTestId('normal')).toHaveFocus()
    })

    it('should handle empty container', async () => {
      function TestComponent() {
        const ref = useFocusTrap<HTMLDivElement>({ enabled: true })
        return (
          <div ref={ref}>
            <span>No focusable elements</span>
          </div>
        )
      }

      // Should not throw
      render(<TestComponent />)

      await act(async () => {
        vi.runAllTimers()
      })
    })
  })

  describe('visibility filtering', () => {
    it('should skip hidden elements', async () => {
      function TestComponent() {
        const ref = useFocusTrap<HTMLDivElement>({ enabled: true })
        return (
          <div ref={ref}>
            <button style={{ display: 'none' }} data-testid="hidden">
              Hidden
            </button>
            <button data-testid="visible">Visible</button>
          </div>
        )
      }

      render(<TestComponent />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByTestId('visible')).toHaveFocus()
    })
  })
})
