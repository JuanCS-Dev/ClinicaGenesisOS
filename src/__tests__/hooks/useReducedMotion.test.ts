/**
 * useReducedMotion Hook Tests
 *
 * Tests for the reduced motion preference detection hook.
 *
 * @module __tests__/hooks/useReducedMotion
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

describe('useReducedMotion', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>
  let listeners: Array<(e: MediaQueryListEvent) => void> = []

  beforeEach(() => {
    listeners = []
    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn((event: string, callback: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          listeners.push(callback)
        }
      }),
      removeEventListener: vi.fn((event: string, callback: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          listeners = listeners.filter(l => l !== callback)
        }
      }),
      addListener: vi.fn((callback: (e: MediaQueryListEvent) => void) => {
        listeners.push(callback)
      }),
      removeListener: vi.fn((callback: (e: MediaQueryListEvent) => void) => {
        listeners = listeners.filter(l => l !== callback)
      }),
      dispatchEvent: vi.fn(),
    }))
    window.matchMedia = matchMediaMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return false when user does not prefer reduced motion', () => {
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })

  it('should return true when user prefers reduced motion', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('should update when preference changes', () => {
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)

    // Simulate preference change
    act(() => {
      listeners.forEach(listener => {
        listener({ matches: true } as MediaQueryListEvent)
      })
    })

    expect(result.current).toBe(true)
  })

  it('should clean up listener on unmount', () => {
    const mockRemoveEventListener = vi.fn()
    matchMediaMock.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn((_, callback) => listeners.push(callback)),
      removeEventListener: mockRemoveEventListener,
    }))

    const { unmount } = renderHook(() => useReducedMotion())
    unmount()

    expect(mockRemoveEventListener).toHaveBeenCalled()
  })

  it('should call matchMedia with correct query', () => {
    renderHook(() => useReducedMotion())
    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })
})
