/**
 * useTelemedicine Hook Tests
 *
 * Tests for the telemedicine session hook.
 *
 * @module __tests__/hooks/useTelemedicine
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTelemedicine } from '../../hooks/useTelemedicine'
import { telemedicineService } from '../../services/firestore'
import { useClinicContext } from '../../contexts/ClinicContext'
import { toast } from 'sonner'
import type { TelemedicineSession } from '@/types'

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(),
}))

vi.mock('../../services/firestore', () => ({
  telemedicineService: {
    subscribe: vi.fn(),
    create: vi.fn(),
    getById: vi.fn(),
    addParticipant: vi.fn(),
    updateStatus: vi.fn(),
    addLog: vi.fn(),
    endSession: vi.fn(),
    getByAppointment: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useTelemedicine', () => {
  const mockClinicId = 'clinic-123'
  const mockUserProfile = {
    id: 'user-123',
    displayName: 'Dr. Silva',
    role: 'professional',
  }
  let mockUnsubscribe: ReturnType<typeof vi.fn>

  const mockSession: TelemedicineSession = {
    id: 'session-1',
    clinicId: mockClinicId,
    appointmentId: 'appt-1',
    patientId: 'patient-1',
    patientName: 'John Doe',
    professionalId: 'prof-1',
    professionalName: 'Dr. Silva',
    roomName: 'room-123',
    status: 'scheduled',
    scheduledAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUnsubscribe = vi.fn()

    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: mockClinicId,
      userProfile: mockUserProfile,
    } as ReturnType<typeof useClinicContext>)

    vi.mocked(telemedicineService.subscribe).mockImplementation((_, __, onData) => {
      setTimeout(() => onData(mockSession), 0)
      return mockUnsubscribe
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with null session', () => {
      vi.mocked(telemedicineService.subscribe).mockReturnValue(mockUnsubscribe)

      const { result } = renderHook(() => useTelemedicine())

      expect(result.current.session).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.isInWaitingRoom).toBe(false)
      expect(result.current.isInCall).toBe(false)
    })

    it('should subscribe when sessionId is provided', () => {
      renderHook(() => useTelemedicine('session-1'))

      expect(telemedicineService.subscribe).toHaveBeenCalledWith(
        mockClinicId,
        'session-1',
        expect.any(Function)
      )
    })

    it('should not subscribe without sessionId', () => {
      renderHook(() => useTelemedicine())

      expect(telemedicineService.subscribe).not.toHaveBeenCalled()
    })

    it('should not subscribe without clinicId', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      renderHook(() => useTelemedicine('session-1'))

      expect(telemedicineService.subscribe).not.toHaveBeenCalled()
    })
  })

  describe('session subscription', () => {
    it('should receive session from subscription', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useTelemedicine('session-1'))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.session).toEqual(mockSession)
      expect(result.current.loading).toBe(false)
    })

    it('should update state based on session status - waiting', async () => {
      const waitingSession = { ...mockSession, status: 'waiting' as const }
      vi.mocked(telemedicineService.subscribe).mockImplementation((_, __, onData) => {
        setTimeout(() => onData(waitingSession), 0)
        return mockUnsubscribe
      })

      vi.useFakeTimers()

      const { result } = renderHook(() => useTelemedicine('session-1'))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.isInWaitingRoom).toBe(true)
      expect(result.current.isInCall).toBe(false)
    })

    it('should update state based on session status - in_progress', async () => {
      const inProgressSession = { ...mockSession, status: 'in_progress' as const }
      vi.mocked(telemedicineService.subscribe).mockImplementation((_, __, onData) => {
        setTimeout(() => onData(inProgressSession), 0)
        return mockUnsubscribe
      })

      vi.useFakeTimers()

      const { result } = renderHook(() => useTelemedicine('session-1'))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.isInWaitingRoom).toBe(false)
      expect(result.current.isInCall).toBe(true)
    })

    it('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => useTelemedicine('session-1'))

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('startSession', () => {
    it('should create a new session', async () => {
      vi.mocked(telemedicineService.create).mockResolvedValue('new-session-id')

      const { result } = renderHook(() => useTelemedicine())

      const input = {
        appointmentId: 'appt-1',
        patientId: 'patient-1',
        patientName: 'John Doe',
        professionalId: 'prof-1',
        professionalName: 'Dr. Silva',
        scheduledAt: new Date().toISOString(),
      }

      await act(async () => {
        const id = await result.current.startSession(input)
        expect(id).toBe('new-session-id')
      })

      expect(telemedicineService.create).toHaveBeenCalledWith(mockClinicId, input)
    })

    it('should throw error without clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useTelemedicine())

      await expect(
        result.current.startSession({
          appointmentId: 'appt-1',
          patientId: 'patient-1',
          patientName: 'John',
          professionalId: 'prof-1',
          professionalName: 'Dr.',
          scheduledAt: new Date().toISOString(),
        })
      ).rejects.toThrow('No clinic selected')
    })
  })

  describe('joinWaitingRoom', () => {
    it('should add participant and update status', async () => {
      vi.mocked(telemedicineService.getById).mockResolvedValue(mockSession)
      vi.mocked(telemedicineService.addParticipant).mockResolvedValue()
      vi.mocked(telemedicineService.updateStatus).mockResolvedValue()

      const { result } = renderHook(() => useTelemedicine())

      await act(async () => {
        await result.current.joinWaitingRoom('session-1')
      })

      expect(telemedicineService.addParticipant).toHaveBeenCalledWith(
        mockClinicId,
        'session-1',
        expect.objectContaining({
          id: mockUserProfile.id,
          displayName: mockUserProfile.displayName,
          role: 'professional',
        })
      )

      expect(telemedicineService.updateStatus).toHaveBeenCalledWith(
        mockClinicId,
        'session-1',
        'waiting'
      )
    })

    it('should throw error without clinic or user', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useTelemedicine())

      await expect(result.current.joinWaitingRoom('session-1')).rejects.toThrow(
        'No clinic or user context'
      )
    })
  })

  describe('startCall', () => {
    it('should update status to in_progress', async () => {
      vi.mocked(telemedicineService.updateStatus).mockResolvedValue()
      vi.mocked(telemedicineService.addLog).mockResolvedValue()

      vi.useFakeTimers()

      const { result } = renderHook(() => useTelemedicine('session-1'))

      await act(async () => {
        vi.runAllTimers()
      })

      await act(async () => {
        await result.current.startCall()
      })

      expect(telemedicineService.updateStatus).toHaveBeenCalledWith(
        mockClinicId,
        'session-1',
        'in_progress',
        expect.objectContaining({ startedAt: expect.any(String) })
      )

      expect(result.current.isInCall).toBe(true)
      expect(result.current.isInWaitingRoom).toBe(false)
    })

    it('should throw error without session', async () => {
      const { result } = renderHook(() => useTelemedicine())

      await expect(result.current.startCall()).rejects.toThrow('No session to start')
    })
  })

  describe('endCall', () => {
    it('should end the session', async () => {
      vi.mocked(telemedicineService.endSession).mockResolvedValue()

      vi.useFakeTimers()

      const { result } = renderHook(() => useTelemedicine('session-1'))

      await act(async () => {
        vi.runAllTimers()
      })

      await act(async () => {
        await result.current.endCall()
      })

      expect(telemedicineService.endSession).toHaveBeenCalledWith(
        mockClinicId,
        'session-1',
        mockUserProfile.id
      )

      expect(result.current.isInCall).toBe(false)
    })

    it('should throw error without session', async () => {
      const { result } = renderHook(() => useTelemedicine())

      await expect(result.current.endCall()).rejects.toThrow('No session to end')
    })
  })

  describe('cancelSession', () => {
    it('should cancel the session', async () => {
      vi.mocked(telemedicineService.updateStatus).mockResolvedValue()

      const { result } = renderHook(() => useTelemedicine())

      await act(async () => {
        await result.current.cancelSession('session-1', 'Patient requested')
      })

      expect(telemedicineService.updateStatus).toHaveBeenCalledWith(
        mockClinicId,
        'session-1',
        'canceled',
        { notes: 'Patient requested' }
      )
    })

    it('should throw error without clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useTelemedicine())

      await expect(result.current.cancelSession('session-1')).rejects.toThrow('No clinic selected')
    })
  })

  describe('getSessionByAppointment', () => {
    it('should return session for appointment', async () => {
      vi.mocked(telemedicineService.getByAppointment).mockResolvedValue(mockSession)

      const { result } = renderHook(() => useTelemedicine())

      await act(async () => {
        const session = await result.current.getSessionByAppointment('appt-1')
        expect(session).toEqual(mockSession)
      })
    })

    it('should throw error without clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useTelemedicine())

      await expect(result.current.getSessionByAppointment('appt-1')).rejects.toThrow(
        'No clinic selected'
      )
    })
  })

  describe('Meet integration', () => {
    it('should detect Meet session', async () => {
      const meetSession = { ...mockSession, meetLink: 'https://meet.google.com/abc-defg-hij' }
      vi.mocked(telemedicineService.subscribe).mockImplementation((_, __, onData) => {
        setTimeout(() => onData(meetSession), 0)
        return mockUnsubscribe
      })

      vi.useFakeTimers()

      const { result } = renderHook(() => useTelemedicine('session-1'))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.isMeetSession).toBe(true)
      expect(result.current.meetLink).toBe('https://meet.google.com/abc-defg-hij')
    })

    it('should open Meet link', async () => {
      const meetSession = { ...mockSession, meetLink: 'https://meet.google.com/abc-defg-hij' }
      vi.mocked(telemedicineService.subscribe).mockImplementation((_, __, onData) => {
        setTimeout(() => onData(meetSession), 0)
        return mockUnsubscribe
      })

      const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null)

      vi.useFakeTimers()

      const { result } = renderHook(() => useTelemedicine('session-1'))

      await act(async () => {
        vi.runAllTimers()
      })

      act(() => {
        result.current.openMeet()
      })

      expect(windowOpen).toHaveBeenCalledWith(
        'https://meet.google.com/abc-defg-hij',
        '_blank',
        'noopener,noreferrer'
      )
      expect(toast.success).toHaveBeenCalledWith('Abrindo Google Meet...')

      windowOpen.mockRestore()
    })

    it('should show error if no Meet link', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useTelemedicine('session-1'))

      await act(async () => {
        vi.runAllTimers()
      })

      act(() => {
        result.current.openMeet()
      })

      expect(toast.error).toHaveBeenCalledWith('Link do Meet nao disponivel')
    })
  })
})

// useActiveTelemedicineSessions tests moved to useActiveTelemedicineSessions.test.tsx
// for modularity and maintainability (max 500 lines per file)
