/**
 * useAnnouncer Hook Tests
 *
 * Tests for the screen reader announcer hook.
 *
 * @module __tests__/hooks/useAnnouncer
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnnouncer } from '../../hooks/useAnnouncer'

describe('useAnnouncer', () => {
  const ANNOUNCER_ID = 'genesis-a11y-announcer'

  beforeEach(() => {
    // Clean up any existing announcer
    const existing = document.getElementById(ANNOUNCER_ID)
    if (existing) {
      existing.remove()
    }
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    const existing = document.getElementById(ANNOUNCER_ID)
    if (existing) {
      existing.remove()
    }
  })

  describe('announcer element creation', () => {
    it('should create announcer element on first announce', () => {
      const { result } = renderHook(() => useAnnouncer())

      expect(document.getElementById(ANNOUNCER_ID)).toBeNull()

      act(() => {
        result.current('Test message')
      })

      const announcer = document.getElementById(ANNOUNCER_ID)
      expect(announcer).not.toBeNull()
    })

    it('should set correct ARIA attributes on announcer', () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current('Test message')
      })

      const announcer = document.getElementById(ANNOUNCER_ID)
      expect(announcer?.getAttribute('aria-live')).toBe('polite')
      expect(announcer?.getAttribute('aria-atomic')).toBe('true')
      expect(announcer?.getAttribute('role')).toBe('status')
    })

    it('should apply visually hidden styles', () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current('Test message')
      })

      const announcer = document.getElementById(ANNOUNCER_ID)
      expect(announcer?.style.position).toBe('absolute')
      expect(announcer?.style.width).toBe('1px')
      expect(announcer?.style.height).toBe('1px')
      expect(announcer?.style.overflow).toBe('hidden')
    })

    it('should reuse existing announcer element', () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current('First message')
      })

      const firstAnnouncer = document.getElementById(ANNOUNCER_ID)

      act(() => {
        result.current('Second message')
      })

      const secondAnnouncer = document.getElementById(ANNOUNCER_ID)
      expect(firstAnnouncer).toBe(secondAnnouncer)
    })
  })

  describe('message announcement', () => {
    it('should set message content after requestAnimationFrame', async () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current('Hello World')
      })

      // Run requestAnimationFrame
      await act(async () => {
        vi.runAllTimers()
      })

      const announcer = document.getElementById(ANNOUNCER_ID)
      expect(announcer?.textContent).toBe('')
    })

    it('should clear message after default delay', async () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current('Test message')
      })

      // Advance past clear delay (1000ms default)
      await act(async () => {
        vi.advanceTimersByTime(1100)
      })

      const announcer = document.getElementById(ANNOUNCER_ID)
      expect(announcer?.textContent).toBe('')
    })

    it('should use custom clear delay', async () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current('Test message', { clearDelay: 500 })
      })

      // Advance past custom clear delay
      await act(async () => {
        vi.advanceTimersByTime(600)
      })

      const announcer = document.getElementById(ANNOUNCER_ID)
      expect(announcer?.textContent).toBe('')
    })
  })

  describe('politeness levels', () => {
    it('should use polite by default', () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current('Polite message')
      })

      const announcer = document.getElementById(ANNOUNCER_ID)
      expect(announcer?.getAttribute('aria-live')).toBe('polite')
    })

    it('should use assertive when specified', () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current('Urgent message', { politeness: 'assertive' })
      })

      const announcer = document.getElementById(ANNOUNCER_ID)
      expect(announcer?.getAttribute('aria-live')).toBe('assertive')
    })

    it('should switch between politeness levels', () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current('First', { politeness: 'polite' })
      })

      const announcer = document.getElementById(ANNOUNCER_ID)
      expect(announcer?.getAttribute('aria-live')).toBe('polite')

      act(() => {
        result.current('Second', { politeness: 'assertive' })
      })

      expect(announcer?.getAttribute('aria-live')).toBe('assertive')
    })
  })

  describe('cleanup', () => {
    it('should clear timeout on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
      const { result, unmount } = renderHook(() => useAnnouncer())

      act(() => {
        result.current('Test message')
      })

      unmount()

      expect(clearTimeoutSpy).toHaveBeenCalled()
      clearTimeoutSpy.mockRestore()
    })

    it('should clear previous timeout when announcing new message', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current('First message')
      })

      act(() => {
        result.current('Second message')
      })

      expect(clearTimeoutSpy).toHaveBeenCalled()
      clearTimeoutSpy.mockRestore()
    })
  })

  describe('multiple hooks', () => {
    it('should share the same announcer element', () => {
      const { result: hook1 } = renderHook(() => useAnnouncer())
      const { result: hook2 } = renderHook(() => useAnnouncer())

      act(() => {
        hook1.current('From hook 1')
      })

      const announcer1 = document.getElementById(ANNOUNCER_ID)

      act(() => {
        hook2.current('From hook 2')
      })

      const announcer2 = document.getElementById(ANNOUNCER_ID)
      expect(announcer1).toBe(announcer2)
    })
  })
})
