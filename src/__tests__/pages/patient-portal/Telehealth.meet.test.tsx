/**
 * Patient Portal Telehealth - Google Meet Tests
 * Tests for Google Meet session functionality in telehealth waiting room.
 * @module __tests__/pages/patient-portal/Telehealth.meet.test
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { resetPatientPortalMocks } from './setup'
import {
  mockUsePatientTelehealth,
  renderTelehealth,
  mockDefaultAppointment,
  mockMeetSession,
  meetSessionHookReturn,
  setupClipboardMock,
  setupWindowOpenMock,
} from './Telehealth.setup'
import { toast } from 'sonner'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

describe('PatientTelehealth - Google Meet Session', () => {
  beforeEach(() => {
    resetPatientPortalMocks()
    setupWindowOpenMock()
    setupClipboardMock()
    mockUsePatientTelehealth.mockReturnValue(meetSessionHookReturn)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Meet interface', () => {
    it('should show Google Meet button when isMeetSession is true', () => {
      renderTelehealth()
      expect(screen.getByText('Entrar no Google Meet')).toBeInTheDocument()
    })

    it('should show Meet subtitle when isMeetSession is true', () => {
      renderTelehealth()
      expect(screen.getByText('Consulta online via Google Meet')).toBeInTheDocument()
    })

    it('should show copy link button for Meet sessions', () => {
      renderTelehealth()
      expect(screen.getByText('Copiar link do Meet')).toBeInTheDocument()
    })

    it('should show Meet badge text', () => {
      renderTelehealth()
      expect(screen.getByText('A consulta abrira no Google Meet')).toBeInTheDocument()
    })

    it('should show Meet instruction in instructions section', () => {
      renderTelehealth()
      expect(
        screen.getByText('O Meet abrira em nova aba - permita camera e microfone')
      ).toBeInTheDocument()
    })

    it('should not show device check section when Meet is ready', () => {
      renderTelehealth()
      expect(screen.queryByText('Verificar Dispositivos')).not.toBeInTheDocument()
    })
  })

  describe('openMeet functionality', () => {
    it('should call openMeet when clicking Google Meet button', () => {
      const mockOpenMeet = vi.fn()
      mockUsePatientTelehealth.mockReturnValue({
        ...meetSessionHookReturn,
        openMeet: mockOpenMeet,
      })

      renderTelehealth()
      fireEvent.click(screen.getByText('Entrar no Google Meet'))

      expect(mockOpenMeet).toHaveBeenCalled()
    })
  })

  describe('copy link functionality', () => {
    it('should copy Meet link to clipboard when clicking copy button', async () => {
      renderTelehealth()
      fireEvent.click(screen.getByText('Copiar link do Meet'))

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'https://meet.google.com/abc-defg-hij'
        )
      })
    })

    it('should show success toast when copying link', async () => {
      renderTelehealth()
      fireEvent.click(screen.getByText('Copiar link do Meet'))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Link copiado!')
      })
    })

    it('should show copied state after copying', async () => {
      renderTelehealth()
      fireEvent.click(screen.getByText('Copiar link do Meet'))

      await waitFor(() => {
        expect(screen.getByText('Link copiado!')).toBeInTheDocument()
      })
    })

    it('should handle copy error gracefully', async () => {
      vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Failed'))

      renderTelehealth()
      fireEvent.click(screen.getByText('Copiar link do Meet'))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao copiar link')
      })
    })
  })

  describe('waiting state for Meet', () => {
    it('should show device check when waiting for Meet session', () => {
      mockUsePatientTelehealth.mockReturnValue({
        nextTeleconsulta: {
          appointment: mockDefaultAppointment,
          session: mockMeetSession,
        },
        loading: false,
        error: null,
        canJoin: false,
        minutesUntilJoin: 30,
        meetLink: 'https://meet.google.com/abc-defg-hij',
        isMeetSession: true,
        joinWaitingRoom: vi.fn(),
        openMeet: vi.fn(),
        refresh: vi.fn(),
      })

      renderTelehealth()
      expect(screen.getByText('Verificar Dispositivos')).toBeInTheDocument()
    })
  })
})

describe('PatientTelehealth - Legacy Jitsi Session', () => {
  beforeEach(() => {
    resetPatientPortalMocks()
    setupWindowOpenMock()
    setupClipboardMock()
    mockUsePatientTelehealth.mockReturnValue({
      nextTeleconsulta: {
        appointment: mockDefaultAppointment,
        session: { id: 'session-123', roomName: 'genesis-apt-123' },
      },
      loading: false,
      error: null,
      canJoin: true,
      minutesUntilJoin: 0,
      meetLink: null,
      isMeetSession: false,
      joinWaitingRoom: vi.fn(),
      openMeet: vi.fn(),
      refresh: vi.fn(),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should show legacy enter button when not Meet session', () => {
    renderTelehealth()
    expect(screen.getByText('Entrar na Sala')).toBeInTheDocument()
  })

  it('should not show Google Meet button for legacy session', () => {
    renderTelehealth()
    expect(screen.queryByText('Entrar no Google Meet')).not.toBeInTheDocument()
  })

  it('should not show copy link button for legacy session', () => {
    renderTelehealth()
    expect(screen.queryByText('Copiar link do Meet')).not.toBeInTheDocument()
  })

  it('should show traditional subtitle for legacy session', () => {
    renderTelehealth()
    expect(screen.getByText('Sala de espera virtual para consulta online')).toBeInTheDocument()
  })
})
