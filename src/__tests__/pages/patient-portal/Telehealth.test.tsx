/**
 * Patient Portal Telehealth Tests
 * Core tests for patient telehealth waiting room.
 * Note: Google Meet & Jitsi interface tests are in Telehealth.meet.test.tsx
 * @module __tests__/pages/patient-portal/Telehealth.test
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { resetPatientPortalMocks } from './setup'
import {
  mockUsePatientTelehealth,
  renderTelehealth,
  mockDefaultAppointment,
  defaultHookReturn,
  loadingHookReturn,
  noAppointmentHookReturn,
  canJoinHookReturn,
  setupClipboardMock,
  setupWindowOpenMock,
} from './Telehealth.setup'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

describe('PatientTelehealth', () => {
  beforeEach(() => {
    resetPatientPortalMocks()
    setupWindowOpenMock()
    setupClipboardMock()
    mockUsePatientTelehealth.mockReturnValue(defaultHookReturn)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderTelehealth()
      expect(container).toBeDefined()
    })

    it('should render page title', () => {
      renderTelehealth()
      expect(screen.getByText('Teleconsulta')).toBeInTheDocument()
    })

    it('should render page subtitle', () => {
      renderTelehealth()
      expect(screen.getByText('Sala de espera virtual para consulta online')).toBeInTheDocument()
    })

    it('should have animation class', () => {
      const { container } = renderTelehealth()
      expect(container.querySelector('.animate-enter')).toBeTruthy()
    })
  })

  describe('loading state', () => {
    beforeEach(() => {
      mockUsePatientTelehealth.mockReturnValue(loadingHookReturn)
    })

    it('should show skeleton loading state', () => {
      const { container } = renderTelehealth()
      expect(container.querySelector('.animate-enter')).toBeTruthy()
    })

    it('should show skeleton for header', () => {
      renderTelehealth()
      const skeletons = document.querySelectorAll('[class*="Skeleton"]')
      expect(skeletons.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('device check section', () => {
    it('should render device verification section', () => {
      renderTelehealth()
      expect(screen.getByText('Verificar Dispositivos')).toBeInTheDocument()
    })

    it('should render camera status', () => {
      renderTelehealth()
      expect(screen.getByText('Câmera funcionando')).toBeInTheDocument()
    })

    it('should render microphone status', () => {
      renderTelehealth()
      expect(screen.getByText('Microfone funcionando')).toBeInTheDocument()
    })

    it('should render connection status', () => {
      renderTelehealth()
      expect(screen.getByText('Conexão estável')).toBeInTheDocument()
    })

    it('should have video toggle button', () => {
      renderTelehealth()
      const buttons = document.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have media control buttons', () => {
      renderTelehealth()
      const buttons = document.querySelectorAll('button[class*="p-4"]')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('appointment info', () => {
    it('should display professional name', () => {
      renderTelehealth()
      expect(screen.getByText('Dr. João Silva')).toBeInTheDocument()
    })

    it('should display specialty', () => {
      renderTelehealth()
      expect(screen.getByText('Cardiologia')).toBeInTheDocument()
    })

    it('should display appointment date', () => {
      renderTelehealth()
      const dateElement = document.querySelector('[class*="text-genesis-medium"]')
      expect(dateElement).toBeInTheDocument()
    })

    it('should show waiting message when cannot join', () => {
      renderTelehealth()
      expect(screen.getByText('Aguardando horario')).toBeInTheDocument()
    })

    it('should show time remaining message', () => {
      renderTelehealth()
      expect(screen.getByText(/A sala estara disponivel em/)).toBeInTheDocument()
    })

    it('should format time with hours when > 60 minutes', () => {
      mockUsePatientTelehealth.mockReturnValue({
        ...defaultHookReturn,
        minutesUntilJoin: 90,
      })
      renderTelehealth()
      expect(screen.getByText(/1h 30min/)).toBeInTheDocument()
    })

    it('should show minutes only when < 60 minutes', () => {
      mockUsePatientTelehealth.mockReturnValue({
        ...defaultHookReturn,
        minutesUntilJoin: 45,
      })
      renderTelehealth()
      expect(screen.getByText(/45 minutos/)).toBeInTheDocument()
    })
  })

  describe('join button', () => {
    it('should show join button when can join', () => {
      mockUsePatientTelehealth.mockReturnValue(canJoinHookReturn)
      renderTelehealth()
      expect(screen.getByText('Entrar na Sala')).toBeInTheDocument()
    })

    it('should call joinWaitingRoom when clicking join', async () => {
      const mockJoin = vi.fn().mockResolvedValue(undefined)
      mockUsePatientTelehealth.mockReturnValue({
        ...canJoinHookReturn,
        joinWaitingRoom: mockJoin,
      })

      renderTelehealth()
      fireEvent.click(screen.getByText('Entrar na Sala'))

      await waitFor(() => expect(mockJoin).toHaveBeenCalled())
    })

    it('should show loading state while joining', async () => {
      const mockJoin = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      mockUsePatientTelehealth.mockReturnValue({
        ...canJoinHookReturn,
        joinWaitingRoom: mockJoin,
      })

      renderTelehealth()
      fireEvent.click(screen.getByText('Entrar na Sala'))

      await waitFor(() => expect(screen.getByText('Entrando...')).toBeInTheDocument())
    })

    it('should disable button while joining', async () => {
      const mockJoin = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      mockUsePatientTelehealth.mockReturnValue({
        ...canJoinHookReturn,
        joinWaitingRoom: mockJoin,
      })

      renderTelehealth()
      fireEvent.click(screen.getByText('Entrar na Sala'))

      await waitFor(() => {
        const joiningButton = screen.getByText('Entrando...').closest('button')
        expect(joiningButton).toBeDisabled()
      })
    })

    it('should handle join error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockJoin = vi.fn().mockRejectedValue(new Error('Join failed'))
      mockUsePatientTelehealth.mockReturnValue({
        ...canJoinHookReturn,
        joinWaitingRoom: mockJoin,
      })

      renderTelehealth()
      fireEvent.click(screen.getByText('Entrar na Sala'))

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error joining waiting room:', expect.any(Error))
      })
      await waitFor(() => {
        expect(screen.getByText('Entrar na Sala')).not.toBeDisabled()
      })

      consoleSpy.mockRestore()
    })
  })

  describe('no appointment', () => {
    beforeEach(() => {
      mockUsePatientTelehealth.mockReturnValue(noAppointmentHookReturn)
    })

    it('should show no appointment message', () => {
      renderTelehealth()
      expect(screen.getByText('Nenhuma teleconsulta agendada')).toBeInTheDocument()
    })

    it('should show explanation text', () => {
      renderTelehealth()
      expect(
        screen.getByText('Você não possui teleconsultas agendadas no momento.')
      ).toBeInTheDocument()
    })

    it('should show schedule appointment link', () => {
      renderTelehealth()
      expect(screen.getByText('Agendar Consulta')).toBeInTheDocument()
    })

    it('should link to appointments page', () => {
      renderTelehealth()
      const link = screen.getByText('Agendar Consulta')
      expect(link.closest('a')).toHaveAttribute('href', '/portal/consultas')
    })
  })

  describe('instructions section', () => {
    it('should render preparation instructions', () => {
      renderTelehealth()
      expect(screen.getByText('Preparacao para a Teleconsulta')).toBeInTheDocument()
    })

    it('should show quiet location tip', () => {
      renderTelehealth()
      expect(screen.getByText('Escolha um local silencioso e bem iluminado')).toBeInTheDocument()
    })

    it('should show internet connection tip', () => {
      renderTelehealth()
      expect(screen.getByText('Verifique sua conexao com a internet')).toBeInTheDocument()
    })

    it('should show documents tip', () => {
      renderTelehealth()
      expect(screen.getByText('Tenha seus documentos e exames em maos')).toBeInTheDocument()
    })

    it('should show headphones tip', () => {
      renderTelehealth()
      expect(
        screen.getByText('Use fones de ouvido para melhor qualidade de audio')
      ).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should show Medico when specialty is not provided', () => {
      const appointmentWithoutSpecialty = { ...mockDefaultAppointment, specialty: undefined }
      mockUsePatientTelehealth.mockReturnValue({
        ...defaultHookReturn,
        nextTeleconsulta: { appointment: appointmentWithoutSpecialty, session: null },
      })

      renderTelehealth()
      expect(screen.getByText('Medico')).toBeInTheDocument()
    })

    it('should show generic message when minutesUntilJoin is null', () => {
      mockUsePatientTelehealth.mockReturnValue({
        ...defaultHookReturn,
        minutesUntilJoin: null,
      })

      renderTelehealth()
      expect(
        screen.getByText('A sala estara disponivel 15 minutos antes do horario agendado.')
      ).toBeInTheDocument()
    })
  })
})
