/**
 * TelemedicineModal Component Tests
 *
 * Uses real interface: TelemedicineModalProps from component
 * Props: isOpen, onClose, sessionId?, appointmentData?
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Create mock functions outside the mock to access them in tests
const mockStartSession = vi.fn().mockResolvedValue('session-123')
const mockJoinWaitingRoom = vi.fn().mockResolvedValue(true)
const mockStartCall = vi.fn().mockResolvedValue(true)
const mockEndCall = vi.fn().mockResolvedValue(true)
const mockOpenMeet = vi.fn()

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Setup mock hook result
const mockHookResult = {
  session: {
    id: 'session-123',
    appointmentId: 'apt-123',
    patientId: 'patient-123',
    patientName: 'Maria Santos',
    professionalId: 'prof-123',
    professionalName: 'Dr. João Silva',
    roomName: 'room-abc123',
    status: 'waiting',
    participants: [],
    scheduledAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  loading: false,
  error: null,
  isMeetSession: false,
  openMeet: mockOpenMeet,
  startSession: mockStartSession,
  joinWaitingRoom: mockJoinWaitingRoom,
  startCall: mockStartCall,
  endCall: mockEndCall,
}

// Mock useTelemedicine hook
vi.mock('../../../hooks/useTelemedicine', () => ({
  useTelemedicine: vi.fn(() => mockHookResult),
}))

// Mock user profile
const mockUserProfile = {
  id: 'user-123',
  displayName: 'Dr. João Silva',
  role: 'professional' as const,
}

// Mock ClinicContext
vi.mock('../../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    userProfile: mockUserProfile,
  })),
}))

import { TelemedicineModal } from '../../../components/telemedicine/TelemedicineModal'
import { useTelemedicine } from '../../../hooks/useTelemedicine'
import { useClinicContext } from '../../../contexts/ClinicContext'

describe('TelemedicineModal', () => {
  const mockOnClose = vi.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    sessionId: 'session-123',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock to default state
    vi.mocked(useTelemedicine).mockReturnValue(mockHookResult)
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: 'clinic-123',
      userProfile: mockUserProfile,
    } as ReturnType<typeof useClinicContext>)
  })

  describe('smoke tests', () => {
    it('should render without crashing when open', () => {
      const { container } = render(<TelemedicineModal {...defaultProps} />)
      expect(container).toBeDefined()
    })

    it('should not render when closed', () => {
      const { container } = render(<TelemedicineModal {...defaultProps} isOpen={false} />)
      expect(container.querySelector('[class*="fixed inset-0"]')).toBeFalsy()
    })
  })

  describe('modal header', () => {
    it('should show teleconsulta header when open', () => {
      render(<TelemedicineModal {...defaultProps} />)
      const elements = screen.getAllByText(/Teleconsulta/i)
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should show patient name from session', () => {
      render(<TelemedicineModal {...defaultProps} />)
      const nameElements = screen.getAllByText(/Maria Santos/i)
      expect(nameElements.length).toBeGreaterThan(0)
    })

    it('should render close button', () => {
      render(<TelemedicineModal {...defaultProps} />)
      const closeButton = screen.getByTitle('Fechar')
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('should show loading spinner when loading', () => {
      vi.mocked(useTelemedicine).mockReturnValue({
        ...mockHookResult,
        session: null,
        loading: true,
      })

      render(<TelemedicineModal {...defaultProps} />)

      expect(screen.getByText('Preparando teleconsulta...')).toBeInTheDocument()
    })

    it('should show loading spinner with animation', () => {
      vi.mocked(useTelemedicine).mockReturnValue({
        ...mockHookResult,
        session: null,
        loading: true,
      })

      const { container } = render(<TelemedicineModal {...defaultProps} />)

      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('should show error message when error occurs', () => {
      vi.mocked(useTelemedicine).mockReturnValue({
        ...mockHookResult,
        session: null,
        error: new Error('Connection failed'),
      })

      render(<TelemedicineModal {...defaultProps} />)

      expect(screen.getByText('Erro na Teleconsulta')).toBeInTheDocument()
    })

    it('should show error details', () => {
      vi.mocked(useTelemedicine).mockReturnValue({
        ...mockHookResult,
        session: null,
        error: new Error('Falha na conexão'),
      })

      render(<TelemedicineModal {...defaultProps} />)

      expect(screen.getByText('Falha na conexão')).toBeInTheDocument()
    })

    it('should show close button in error state', () => {
      vi.mocked(useTelemedicine).mockReturnValue({
        ...mockHookResult,
        session: null,
        error: new Error('Error'),
      })

      render(<TelemedicineModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /Fechar/i })).toBeInTheDocument()
    })

    it('should call onClose when error close button is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(useTelemedicine).mockReturnValue({
        ...mockHookResult,
        session: null,
        error: new Error('Error'),
      })

      render(<TelemedicineModal {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: /Fechar/i })
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('new session creation', () => {
    it('should render with appointmentData for new session', () => {
      const { container } = render(
        <TelemedicineModal
          isOpen={true}
          onClose={mockOnClose}
          appointmentData={{
            appointmentId: 'apt-456',
            patientId: 'patient-456',
            patientName: 'João Oliveira',
            scheduledAt: new Date().toISOString(),
          }}
        />
      )
      expect(container).toBeDefined()
    })

    it('should handle appointment data with all fields', () => {
      const { container } = render(
        <TelemedicineModal
          isOpen={true}
          onClose={mockOnClose}
          appointmentData={{
            appointmentId: 'apt-789',
            patientId: 'patient-789',
            patientName: 'Ana Costa',
            scheduledAt: '2024-03-15T10:00:00.000Z',
          }}
        />
      )
      expect(container).toBeDefined()
    })
  })

  describe('close behavior', () => {
    it('should call onClose when close button clicked in waiting state', async () => {
      const user = userEvent.setup()
      render(<TelemedicineModal {...defaultProps} />)

      const closeButton = screen.getByTitle('Fechar')
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('session ID handling', () => {
    it('should use provided session ID', () => {
      render(<TelemedicineModal {...defaultProps} sessionId="custom-session" />)
      expect(screen.getAllByText(/Teleconsulta/i).length).toBeGreaterThan(0)
    })

    it('should handle undefined session ID', () => {
      const { container } = render(<TelemedicineModal isOpen={true} onClose={mockOnClose} />)
      expect(container).toBeDefined()
    })
  })

  describe('user roles', () => {
    it('should render for professional role', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: 'clinic-123',
        userProfile: { id: 'user-123', displayName: 'Dr. Silva', role: 'professional' },
      } as ReturnType<typeof useClinicContext>)

      const { container } = render(<TelemedicineModal {...defaultProps} />)
      expect(container).toBeDefined()
    })

    it('should render for owner role', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: 'clinic-123',
        userProfile: { id: 'user-123', displayName: 'Owner', role: 'owner' },
      } as ReturnType<typeof useClinicContext>)

      const { container } = render(<TelemedicineModal {...defaultProps} />)
      expect(container).toBeDefined()
    })

    it('should render for admin role', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: 'clinic-123',
        userProfile: { id: 'user-123', displayName: 'Admin', role: 'admin' },
      } as ReturnType<typeof useClinicContext>)

      const { container } = render(<TelemedicineModal {...defaultProps} />)
      expect(container).toBeDefined()
    })

    it('should render for patient role', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: 'clinic-123',
        userProfile: { id: 'user-123', displayName: 'Patient', role: 'staff' },
      } as ReturnType<typeof useClinicContext>)

      const { container } = render(<TelemedicineModal {...defaultProps} />)
      expect(container).toBeDefined()
    })
  })

  describe('accessibility', () => {
    it('should have close button with title', () => {
      render(<TelemedicineModal {...defaultProps} />)

      const closeButton = screen.getByTitle('Fechar')
      expect(closeButton).toBeInTheDocument()
    })

    it('should render full screen overlay', () => {
      const { container } = render(<TelemedicineModal {...defaultProps} />)

      expect(container.querySelector('.fixed.inset-0')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle null userProfile', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: 'clinic-123',
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { container } = render(<TelemedicineModal {...defaultProps} />)
      expect(container).toBeDefined()
    })

    it('should handle session with completed status', () => {
      vi.mocked(useTelemedicine).mockReturnValue({
        ...mockHookResult,
        session: {
          ...mockHookResult.session!,
          status: 'completed',
          durationSeconds: 1800,
        },
      })

      render(<TelemedicineModal {...defaultProps} />)

      // Should show ended state
      expect(screen.getByText('Consulta Finalizada')).toBeInTheDocument()
    })

    it('should handle session with in_progress status', () => {
      vi.mocked(useTelemedicine).mockReturnValue({
        ...mockHookResult,
        session: {
          ...mockHookResult.session!,
          status: 'in_progress',
        },
      })

      const { container } = render(<TelemedicineModal {...defaultProps} />)
      expect(container).toBeDefined()
    })
  })

  describe('ended state', () => {
    beforeEach(() => {
      vi.mocked(useTelemedicine).mockReturnValue({
        ...mockHookResult,
        session: {
          ...mockHookResult.session!,
          status: 'completed',
          durationSeconds: 3600, // 1 hour
        },
      })
    })

    it('should show consultation finished message', () => {
      render(<TelemedicineModal {...defaultProps} />)

      expect(screen.getByText('Consulta Finalizada')).toBeInTheDocument()
    })

    it('should show duration', () => {
      render(<TelemedicineModal {...defaultProps} />)

      expect(screen.getByText(/Duração:/)).toBeInTheDocument()
    })

    it('should show notes textarea for professionals', () => {
      render(<TelemedicineModal {...defaultProps} />)

      expect(screen.getByPlaceholderText(/Adicione observações/)).toBeInTheDocument()
    })

    it('should show save button for professionals', () => {
      render(<TelemedicineModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /Salvar e Fechar/i })).toBeInTheDocument()
    })

    it('should show close button for non-professionals', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: 'clinic-123',
        userProfile: { id: 'user-123', displayName: 'Patient', role: 'staff' },
      } as ReturnType<typeof useClinicContext>)

      render(<TelemedicineModal {...defaultProps} />)

      // For non-professionals, button text is just "Fechar"
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should call onClose when save button is clicked', async () => {
      const user = userEvent.setup()
      render(<TelemedicineModal {...defaultProps} />)

      const saveButton = screen.getByRole('button', { name: /Salvar e Fechar/i })
      await user.click(saveButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should allow typing in notes textarea', async () => {
      const user = userEvent.setup()
      render(<TelemedicineModal {...defaultProps} />)

      const textarea = screen.getByPlaceholderText(/Adicione observações/)
      await user.type(textarea, 'Paciente apresentou melhora')

      expect(textarea).toHaveValue('Paciente apresentou melhora')
    })
  })

  describe('duration formatting', () => {
    it('should format minutes correctly', () => {
      vi.mocked(useTelemedicine).mockReturnValue({
        ...mockHookResult,
        session: {
          ...mockHookResult.session!,
          status: 'completed',
          durationSeconds: 1500, // 25 minutes
        },
      })

      render(<TelemedicineModal {...defaultProps} />)

      expect(screen.getByText(/25 min/)).toBeInTheDocument()
    })

    it('should format hours and minutes correctly', () => {
      vi.mocked(useTelemedicine).mockReturnValue({
        ...mockHookResult,
        session: {
          ...mockHookResult.session!,
          status: 'completed',
          durationSeconds: 5400, // 1h 30min
        },
      })

      render(<TelemedicineModal {...defaultProps} />)

      expect(screen.getByText(/1h 30min/)).toBeInTheDocument()
    })
  })
})
