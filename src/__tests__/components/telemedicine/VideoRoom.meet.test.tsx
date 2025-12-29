/**
 * VideoRoom Google Meet Interface Tests
 * ======================================
 *
 * Tests for VideoRoom component when using Google Meet (via meetLink).
 * Tests the external Meet link flow: copy link, join via window.open, end session.
 *
 * @module __tests__/components/telemedicine/VideoRoom.meet.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VideoRoom } from '../../../components/telemedicine/VideoRoom'
import { toast } from 'sonner'

// =============================================================================
// MOCKS
// =============================================================================

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock JitsiMeeting (not used in Meet tests, but required for module load)
vi.mock('@jitsi/react-sdk', () => ({
  JitsiMeeting: vi.fn(() => <div data-testid="jitsi-meeting">Jitsi Mock</div>),
}))

// =============================================================================
// FIXTURES
// =============================================================================

const mockMeetSession = {
  id: 'session-456',
  appointmentId: 'apt-456',
  patientId: 'patient-456',
  patientName: 'Joana Silva',
  professionalId: 'prof-456',
  professionalName: 'Dr. Carlos Mendes',
  roomName: 'room-xyz789',
  meetLink: 'https://meet.google.com/abc-defg-hij',
  calendarEventId: 'calendar-event-456',
  status: 'in_progress' as const,
  participants: [],
  recordingEnabled: false,
  startedAt: new Date().toISOString(),
  scheduledAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockSessionNoMeet = {
  id: 'session-123',
  appointmentId: 'apt-123',
  patientId: 'patient-123',
  patientName: 'Maria Santos',
  professionalId: 'prof-123',
  professionalName: 'Dr. João Silva',
  roomName: 'room-abc123',
  status: 'in_progress' as const,
  participants: [],
  recordingEnabled: false,
  startedAt: new Date().toISOString(),
  scheduledAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// =============================================================================
// TESTS
// =============================================================================

describe('VideoRoom - Google Meet Interface', () => {
  const mockOnCallEnd = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'open').mockImplementation(() => null)
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('interface selection', () => {
    it('should render Google Meet interface when session has meetLink', () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      expect(screen.getByText('Google Meet')).toBeInTheDocument()
      expect(screen.queryByTestId('jitsi-meeting')).not.toBeInTheDocument()
    })

    it('should render Jitsi interface when session has no meetLink', () => {
      render(
        <VideoRoom
          session={mockSessionNoMeet}
          displayName="Dr. Joao Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      expect(screen.getByTestId('jitsi-meeting')).toBeInTheDocument()
    })
  })

  describe('rendering', () => {
    it('should render Teleconsulta header', () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      expect(screen.getByText('Teleconsulta')).toBeInTheDocument()
    })

    it('should display session participants', () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      expect(screen.getByText('Profissional')).toBeInTheDocument()
      expect(screen.getByText('Dr. Carlos Mendes')).toBeInTheDocument()
      expect(screen.getByText('Paciente')).toBeInTheDocument()
      expect(screen.getByText('Joana Silva')).toBeInTheDocument()
    })

    it('should show join button before joining', () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      expect(screen.getByText('Entrar na Teleconsulta')).toBeInTheDocument()
    })

    it('should show copy link button', () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      expect(screen.getByText('Copiar link do Meet')).toBeInTheDocument()
    })

    it('should show scheduled time', () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      expect(screen.getByText(/Agendado para/)).toBeInTheDocument()
    })

    it('should show Meet instructions', () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      expect(screen.getByText(/Meet abrira em nova aba/)).toBeInTheDocument()
    })
  })

  describe('join functionality', () => {
    it('should open Meet link when join button is clicked', () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      fireEvent.click(screen.getByText('Entrar na Teleconsulta'))

      expect(window.open).toHaveBeenCalledWith(
        'https://meet.google.com/abc-defg-hij',
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('should show success toast when joining', () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      fireEvent.click(screen.getByText('Entrar na Teleconsulta'))

      expect(toast.success).toHaveBeenCalledWith('Abrindo Google Meet...')
    })

    it('should change to in-call UI after joining', () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      fireEvent.click(screen.getByText('Entrar na Teleconsulta'))

      expect(screen.getByText('Teleconsulta em andamento')).toBeInTheDocument()
      expect(screen.getByText('Abrir Meet novamente')).toBeInTheDocument()
    })
  })

  describe('copy functionality', () => {
    it('should copy link to clipboard when copy button is clicked', async () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      fireEvent.click(screen.getByText('Copiar link do Meet'))

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'https://meet.google.com/abc-defg-hij'
        )
      })
    })

    it('should show success toast when link is copied', async () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      fireEvent.click(screen.getByText('Copiar link do Meet'))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Link copiado!')
      })
    })

    it('should show copied state after copying', async () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      fireEvent.click(screen.getByText('Copiar link do Meet'))

      await waitFor(() => {
        expect(screen.getByText('Link copiado!')).toBeInTheDocument()
      })
    })

    it('should show error toast on clipboard failure', async () => {
      vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Failed'))

      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      fireEvent.click(screen.getByText('Copiar link do Meet'))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao copiar link')
      })
    })
  })

  describe('end session', () => {
    it('should show end session button for professional after joining', () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      fireEvent.click(screen.getByText('Entrar na Teleconsulta'))

      expect(screen.getByText('Encerrar Consulta')).toBeInTheDocument()
    })

    it('should NOT show end session button for patient', () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Joana Silva"
          isProfessional={false}
          onCallEnd={mockOnCallEnd}
        />
      )

      fireEvent.click(screen.getByText('Entrar na Teleconsulta'))

      expect(screen.queryByText('Encerrar Consulta')).not.toBeInTheDocument()
    })

    it('should call onCallEnd when end button is clicked', () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      fireEvent.click(screen.getByText('Entrar na Teleconsulta'))
      fireEvent.click(screen.getByText('Encerrar Consulta'))

      expect(mockOnCallEnd).toHaveBeenCalledWith(mockMeetSession)
    })
  })

  describe('rejoin', () => {
    it('should allow rejoining after already joined', () => {
      render(
        <VideoRoom
          session={mockMeetSession}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      fireEvent.click(screen.getByText('Entrar na Teleconsulta'))
      vi.clearAllMocks()

      fireEvent.click(screen.getByText('Abrir Meet novamente'))

      expect(window.open).toHaveBeenCalledWith(
        'https://meet.google.com/abc-defg-hij',
        '_blank',
        'noopener,noreferrer'
      )
    })
  })

  describe('fallback to Jitsi', () => {
    it('should fall back to Jitsi when meetLink is empty', () => {
      const sessionWithoutMeet = { ...mockMeetSession, meetLink: '' }
      render(
        <VideoRoom
          session={sessionWithoutMeet}
          displayName="Dr. Carlos Mendes"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      )

      expect(screen.getByTestId('jitsi-meeting')).toBeInTheDocument()
    })
  })
})
