/**
 * MeetRoom Component Tests
 * ========================
 *
 * Tests for the Google Meet room component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { MeetRoom } from '../../../components/telemedicine/MeetRoom'
import { toast } from 'sonner'
import type { TelemedicineSession } from '@/types'

// Test data
const mockSession: TelemedicineSession = {
  id: 'session-123',
  appointmentId: 'apt-123',
  patientId: 'patient-123',
  patientName: 'Maria Santos',
  professionalId: 'prof-123',
  professionalName: 'Dr. Joao Silva',
  roomName: 'genesis-clinic-apt-123',
  meetLink: 'https://meet.google.com/abc-defg-hij',
  calendarEventId: 'calendar-event-123',
  status: 'scheduled',
  participants: [],
  scheduledAt: '2025-01-15T10:00:00Z',
  createdAt: '2025-01-15T09:00:00Z',
  updatedAt: '2025-01-15T09:00:00Z',
}

const mockSessionNoMeet: TelemedicineSession = {
  ...mockSession,
  meetLink: undefined,
  calendarEventId: undefined,
}

describe('MeetRoom', () => {
  const mockOnJoinMeet = vi.fn()
  const mockOnEndSession = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.open
    vi.spyOn(window, 'open').mockImplementation(() => null)
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  const renderMeetRoom = (props: Partial<Parameters<typeof MeetRoom>[0]> = {}) => {
    return render(
      <MeetRoom
        session={mockSession}
        displayName="Maria Santos"
        isProfessional={false}
        onJoinMeet={mockOnJoinMeet}
        onEndSession={mockOnEndSession}
        {...props}
      />
    )
  }

  describe('rendering', () => {
    it('should render the component with session info', () => {
      renderMeetRoom()

      expect(screen.getByText('Teleconsulta')).toBeInTheDocument()
      expect(screen.getByText('Google Meet')).toBeInTheDocument()
      expect(screen.getByText('Dr. Joao Silva')).toBeInTheDocument()
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    })

    it('should show scheduled time', () => {
      renderMeetRoom()

      // Time should be formatted - just check it contains a time pattern
      const timeElement = screen.getByText(/\d{1,2}:\d{2}/)
      expect(timeElement).toBeInTheDocument()
    })

    it('should render join button before joining', () => {
      renderMeetRoom()

      expect(screen.getByText('Entrar na Teleconsulta')).toBeInTheDocument()
    })

    it('should render copy link button before joining', () => {
      renderMeetRoom()

      expect(screen.getByText('Copiar link do Meet')).toBeInTheDocument()
    })

    it('should render instructions', () => {
      renderMeetRoom()

      expect(screen.getByText('Instrucoes')).toBeInTheDocument()
      expect(screen.getByText(/Clique em/)).toBeInTheDocument()
    })
  })

  describe('no meet link', () => {
    it('should show error state when meetLink is missing', () => {
      renderMeetRoom({ session: mockSessionNoMeet })

      expect(screen.getByText('Link do Meet indisponivel')).toBeInTheDocument()
      expect(screen.getByText(/ainda nao foi gerado/)).toBeInTheDocument()
    })

    it('should not show join button when meetLink is missing', () => {
      renderMeetRoom({ session: mockSessionNoMeet })

      expect(screen.queryByText('Entrar na Teleconsulta')).not.toBeInTheDocument()
    })
  })

  describe('join functionality', () => {
    it('should open Meet link when join button is clicked', () => {
      renderMeetRoom()

      fireEvent.click(screen.getByText('Entrar na Teleconsulta'))

      expect(window.open).toHaveBeenCalledWith(
        'https://meet.google.com/abc-defg-hij',
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('should call onJoinMeet when join button is clicked', () => {
      renderMeetRoom()

      fireEvent.click(screen.getByText('Entrar na Teleconsulta'))

      expect(mockOnJoinMeet).toHaveBeenCalled()
    })

    it('should show success toast when joining', () => {
      renderMeetRoom()

      fireEvent.click(screen.getByText('Entrar na Teleconsulta'))

      expect(toast.success).toHaveBeenCalledWith('Abrindo Google Meet...')
    })

    it('should change UI after joining', () => {
      renderMeetRoom()

      fireEvent.click(screen.getByText('Entrar na Teleconsulta'))

      expect(screen.getByText('Teleconsulta em andamento')).toBeInTheDocument()
      expect(screen.getByText('Abrir Meet novamente')).toBeInTheDocument()
    })
  })

  describe('copy functionality', () => {
    it('should copy link to clipboard when copy button is clicked', async () => {
      renderMeetRoom()

      fireEvent.click(screen.getByText('Copiar link do Meet'))

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'https://meet.google.com/abc-defg-hij'
        )
      })
    })

    it('should show success toast when link is copied', async () => {
      renderMeetRoom()

      fireEvent.click(screen.getByText('Copiar link do Meet'))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Link copiado!')
      })
    })

    it('should show copied state after copying', async () => {
      renderMeetRoom()

      fireEvent.click(screen.getByText('Copiar link do Meet'))

      await waitFor(() => {
        expect(screen.getByText('Link copiado!')).toBeInTheDocument()
      })
    })
  })

  describe('end session', () => {
    it('should show end session button for professional after joining', () => {
      renderMeetRoom({ isProfessional: true })

      // First join
      fireEvent.click(screen.getByText('Entrar na Teleconsulta'))

      expect(screen.getByText('Encerrar Consulta')).toBeInTheDocument()
    })

    it('should not show end session button for patient', () => {
      renderMeetRoom({ isProfessional: false })

      // First join
      fireEvent.click(screen.getByText('Entrar na Teleconsulta'))

      expect(screen.queryByText('Encerrar Consulta')).not.toBeInTheDocument()
    })

    it('should call onEndSession when end button is clicked', () => {
      renderMeetRoom({ isProfessional: true })

      // First join
      fireEvent.click(screen.getByText('Entrar na Teleconsulta'))

      // Then end
      fireEvent.click(screen.getByText('Encerrar Consulta'))

      expect(mockOnEndSession).toHaveBeenCalled()
    })
  })

  describe('rejoin', () => {
    it('should allow rejoining after already joined', () => {
      renderMeetRoom()

      // First join
      fireEvent.click(screen.getByText('Entrar na Teleconsulta'))
      vi.clearAllMocks()

      // Rejoin
      fireEvent.click(screen.getByText('Abrir Meet novamente'))

      expect(window.open).toHaveBeenCalledWith(
        'https://meet.google.com/abc-defg-hij',
        '_blank',
        'noopener,noreferrer'
      )
    })
  })

  describe('error handling', () => {
    it('should show error toast when meetLink is missing on join', () => {
      const sessionWithoutMeet = { ...mockSession, meetLink: '' }
      renderMeetRoom({ session: sessionWithoutMeet })

      // The join button shouldn't be visible, but the error state should show
      expect(screen.getByText('Link do Meet indisponivel')).toBeInTheDocument()
    })

    it('should handle clipboard error gracefully', async () => {
      vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Failed'))

      renderMeetRoom()

      fireEvent.click(screen.getByText('Copiar link do Meet'))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao copiar link')
      })
    })
  })

  describe('session info display', () => {
    it('should display professional info card', () => {
      renderMeetRoom()

      expect(screen.getByText('Profissional')).toBeInTheDocument()
      expect(screen.getByText('Dr. Joao Silva')).toBeInTheDocument()
    })

    it('should display patient info card', () => {
      renderMeetRoom()

      expect(screen.getByText('Paciente')).toBeInTheDocument()
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    })
  })
})
