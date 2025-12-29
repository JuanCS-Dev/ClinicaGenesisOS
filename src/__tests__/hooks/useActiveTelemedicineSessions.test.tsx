/**
 * useActiveTelemedicineSessions Hook Tests
 *
 * Tests for the active telemedicine sessions hook.
 *
 * @module __tests__/hooks/useActiveTelemedicineSessions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useActiveTelemedicineSessions } from '../../hooks/useTelemedicine'
import { telemedicineService } from '../../services/firestore'
import { useClinicContext } from '../../contexts/ClinicContext'
import type { TelemedicineSession } from '@/types'

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(),
}))

vi.mock('../../services/firestore', () => ({
  telemedicineService: {
    subscribeActive: vi.fn(),
  },
}))

describe('useActiveTelemedicineSessions', () => {
  const mockClinicId = 'clinic-123'
  let mockUnsubscribe: ReturnType<typeof vi.fn>

  const mockActiveSessions: TelemedicineSession[] = [
    {
      id: 'session-1',
      clinicId: mockClinicId,
      appointmentId: 'appt-1',
      patientId: 'patient-1',
      patientName: 'John Doe',
      professionalId: 'prof-1',
      professionalName: 'Dr. Silva',
      roomName: 'room-1',
      status: 'waiting',
      scheduledAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUnsubscribe = vi.fn()

    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: mockClinicId,
    } as ReturnType<typeof useClinicContext>)

    vi.mocked(telemedicineService.subscribeActive).mockImplementation((_, onData) => {
      setTimeout(() => onData(mockActiveSessions), 0)
      return mockUnsubscribe
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should subscribe to active sessions', () => {
    renderHook(() => useActiveTelemedicineSessions())

    expect(telemedicineService.subscribeActive).toHaveBeenCalledWith(
      mockClinicId,
      expect.any(Function)
    )
  })

  it('should receive active sessions', async () => {
    vi.useFakeTimers()

    const { result } = renderHook(() => useActiveTelemedicineSessions())

    await act(async () => {
      vi.runAllTimers()
    })

    expect(result.current.activeSessions).toEqual(mockActiveSessions)
    expect(result.current.loading).toBe(false)

    vi.useRealTimers()
  })

  it('should not subscribe without clinicId', () => {
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: null,
    } as unknown as ReturnType<typeof useClinicContext>)

    const { result } = renderHook(() => useActiveTelemedicineSessions())

    expect(telemedicineService.subscribeActive).not.toHaveBeenCalled()
    expect(result.current.activeSessions).toEqual([])
  })

  it('should unsubscribe on unmount', async () => {
    vi.useFakeTimers()

    const { unmount } = renderHook(() => useActiveTelemedicineSessions())

    await act(async () => {
      vi.runAllTimers()
    })

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()

    vi.useRealTimers()
  })
})
