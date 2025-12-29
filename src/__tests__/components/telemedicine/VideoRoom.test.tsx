/**
 * VideoRoom Jitsi Interface Tests
 * ================================
 * Tests for VideoRoom component when using Jitsi Meet (legacy/fallback).
 * Note: Google Meet interface tests are in VideoRoom.meet.test.tsx
 * @module __tests__/components/telemedicine/VideoRoom.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { VideoRoom } from '../../../components/telemedicine/VideoRoom'
import { toast } from 'sonner'
import { mockJitsiSession } from './VideoRoom.setup'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

// Store API mock for triggering events
let mockApiInstance: {
  addListener: ReturnType<typeof vi.fn>
  dispose: ReturnType<typeof vi.fn>
  executeCommand: ReturnType<typeof vi.fn>
  listeners: Record<string, (...args: unknown[]) => void>
}

vi.mock('@jitsi/react-sdk', () => ({
  JitsiMeeting: vi.fn(({ onApiReady, onReadyToClose }) => {
    mockApiInstance = {
      addListener: vi.fn((event, callback) => {
        mockApiInstance.listeners[event] = callback
      }),
      dispose: vi.fn(),
      executeCommand: vi.fn(),
      listeners: {},
    }
    if (onApiReady) setTimeout(() => onApiReady(mockApiInstance), 0)
    return (
      <div data-testid="jitsi-meeting">
        <span>Jitsi Meeting Mock</span>
        <button data-testid="trigger-close" onClick={() => onReadyToClose?.()}>
          Ready to Close
        </button>
      </div>
    )
  }),
}))

// Use imported fixture with fresh dates
const mockSession = {
  ...mockJitsiSession,
  startedAt: new Date().toISOString(),
  scheduledAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('VideoRoom - Jitsi Interface', () => {
  const mockOnCallEnd = vi.fn()
  const mockOnParticipantJoin = vi.fn()
  const mockOnParticipantLeave = vi.fn()

  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.restoreAllMocks())

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      expect(container).toBeDefined()
    })

    it('should render video container', () => {
      const { container } = render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      expect(container.querySelector('.min-h-\\[500px\\]')).toBeTruthy()
    })

    it('should render Jitsi Meeting component', () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      expect(screen.getByTestId('jitsi-meeting')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('should show loading overlay initially', () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      expect(screen.getByText('Conectando à teleconsulta...')).toBeInTheDocument()
    })

    it('should show loading spinner', () => {
      const { container } = render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      expect(container.querySelector('.animate-spin')).toBeTruthy()
    })

    it('should show secure environment message', () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      expect(screen.getByText('Preparando ambiente seguro de vídeo')).toBeInTheDocument()
    })

    it('should hide loading overlay after API is ready', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      await waitFor(() => {
        expect(screen.queryByText('Conectando à teleconsulta...')).not.toBeInTheDocument()
      })
    })
  })

  describe('professional view', () => {
    it('should show patient name for professional', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      await waitFor(() => expect(screen.getByText('Paciente:')).toBeInTheDocument())
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    })

    it('should show end call button for professional after loading', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      await waitFor(() => expect(screen.getByText('Encerrar')).toBeInTheDocument())
    })

    it('should call executeCommand when clicking end call', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      await waitFor(() => expect(screen.getByText('Encerrar')).toBeInTheDocument())
      fireEvent.click(screen.getByText('Encerrar'))
      expect(mockApiInstance.executeCommand).toHaveBeenCalledWith('hangup')
    })
  })

  describe('patient view', () => {
    it('should show doctor name for patient', () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Maria Santos"
          isProfessional={false}
          onCallEnd={mockOnCallEnd}
        />
      )
      expect(screen.getByText('Dr(a).')).toBeInTheDocument()
      expect(screen.getByText('Dr. João Silva')).toBeInTheDocument()
    })

    it('should NOT show end call button for patient', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Maria Santos"
          isProfessional={false}
          onCallEnd={mockOnCallEnd}
        />
      )
      await waitFor(() => {
        expect(screen.queryByText('Conectando à teleconsulta...')).not.toBeInTheDocument()
      })
      expect(screen.queryByText('Encerrar')).not.toBeInTheDocument()
    })
  })

  describe('consultation timer', () => {
    it('should show timer when session has startedAt', () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      expect(screen.getByText('00:00')).toBeInTheDocument()
    })

    it('should NOT show timer when session has no startedAt', () => {
      const sessionNoStart = { ...mockSession, startedAt: undefined }
      render(
        <VideoRoom
          session={sessionNoStart}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      expect(screen.queryByText('00:00')).not.toBeInTheDocument()
    })
  })

  describe('recording badge', () => {
    it('should show recording badge when enabled', async () => {
      const sessionRecording = { ...mockSession, recordingEnabled: true }
      render(
        <VideoRoom
          session={sessionRecording}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      await waitFor(() =>
        expect(screen.queryByText('Conectando à teleconsulta...')).not.toBeInTheDocument()
      )
      expect(screen.getByText('REC')).toBeInTheDocument()
    })

    it('should NOT show recording badge when disabled', () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      expect(screen.queryByText('REC')).not.toBeInTheDocument()
    })
  })

  describe('participant events', () => {
    it('should call onParticipantJoin when participant joins', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
          onParticipantJoin={mockOnParticipantJoin}
        />
      )
      await waitFor(() => expect(mockApiInstance.addListener).toHaveBeenCalled())
      act(() => {
        mockApiInstance.listeners['participantJoined']?.({ id: 'p1', displayName: 'Test User' })
      })
      expect(mockOnParticipantJoin).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'p1', displayName: 'Test User' })
      )
    })

    it('should call onParticipantLeave when participant leaves', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
          onParticipantLeave={mockOnParticipantLeave}
        />
      )
      await waitFor(() => expect(mockApiInstance.addListener).toHaveBeenCalled())
      act(() => mockApiInstance.listeners['participantLeft']?.({ id: 'p1' }))
      expect(mockOnParticipantLeave).toHaveBeenCalledWith(expect.objectContaining({ id: 'p1' }))
    })

    it('should call onCallEnd when conference is left', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      await waitFor(() => expect(mockApiInstance.addListener).toHaveBeenCalled())
      act(() => mockApiInstance.listeners['videoConferenceLeft']?.({}))
      expect(mockOnCallEnd).toHaveBeenCalledWith(mockSession)
    })
  })

  describe('error handling', () => {
    it('should show error when Jitsi error occurs', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      await waitFor(() => expect(mockApiInstance.addListener).toHaveBeenCalled())
      await act(async () => {
        mockApiInstance.listeners['errorOccurred']?.({ error: 'Connection failed' })
      })
      expect(screen.getByText('Erro de Conexão')).toBeInTheDocument()
    })

    it('should show retry button on error', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      await waitFor(() => expect(mockApiInstance.addListener).toHaveBeenCalled())
      act(() => {
        mockApiInstance.listeners['errorOccurred']?.({ error: { message: 'Connection failed' } })
      })
      await waitFor(() => expect(screen.getByText(/Tentar novamente/i)).toBeInTheDocument())
    })
  })

  describe('ready to close', () => {
    it('should call onCallEnd when ready to close', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      await waitFor(() => expect(screen.getByTestId('trigger-close')).toBeInTheDocument())
      fireEvent.click(screen.getByTestId('trigger-close'))
      expect(mockOnCallEnd).toHaveBeenCalledWith(mockSession)
    })
  })

  describe('cleanup', () => {
    it('should dispose API on unmount', async () => {
      const { unmount } = render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      await waitFor(() => expect(mockApiInstance).toBeDefined())
      unmount()
      expect(mockApiInstance.dispose).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle participant join without callback', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      await waitFor(() => expect(mockApiInstance.addListener).toHaveBeenCalled())
      // Should not throw
      act(() => mockApiInstance.listeners['participantJoined']?.({ id: 'p1', displayName: 'Test' }))
    })

    it('should handle participant leave without callback', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )
      await waitFor(() => expect(mockApiInstance.addListener).toHaveBeenCalled())
      // Should not throw
      act(() => mockApiInstance.listeners['participantLeft']?.({ id: 'p1' }))
    })
  })
})
