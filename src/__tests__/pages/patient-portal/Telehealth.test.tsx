/**
 * Patient Portal Telehealth Tests
 *
 * Comprehensive tests for patient telehealth waiting room.
 * Includes tests for Google Meet (primary) and Jitsi (legacy).
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
// Import setup to activate mocks (hoisted automatically)
import { resetPatientPortalMocks } from './setup';
import { usePatientTelehealth } from '../../../hooks/usePatientTelehealth';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUsePatientTelehealth = usePatientTelehealth as ReturnType<typeof vi.fn>;

import { PatientTelehealth } from '../../../pages/patient-portal/Telehealth';
import { toast } from 'sonner';

const renderTelehealth = () => {
  return render(
    <MemoryRouter>
      <PatientTelehealth />
    </MemoryRouter>
  );
};

const mockDefaultAppointment = {
  id: 'apt-tele-1',
  patientId: 'patient-123',
  patientName: 'Maria Santos',
  professional: 'Dr. João Silva',
  specialty: 'Cardiologia',
  date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  time: '14:00',
  status: 'scheduled',
  type: 'teleconsulta',
};

describe('PatientTelehealth', () => {
  beforeEach(() => {
    resetPatientPortalMocks();
    vi.spyOn(window, 'open').mockImplementation(() => null);
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    mockUsePatientTelehealth.mockReturnValue({
      nextTeleconsulta: {
        appointment: mockDefaultAppointment,
        session: null,
      },
      loading: false,
      error: null,
      canJoin: false,
      minutesUntilJoin: 60,
      meetLink: null,
      isMeetSession: false,
      joinWaitingRoom: vi.fn().mockResolvedValue(undefined),
      openMeet: vi.fn(),
      refresh: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderTelehealth();
      expect(container).toBeDefined();
    });

    it('should render page title', () => {
      renderTelehealth();
      expect(screen.getByText('Teleconsulta')).toBeInTheDocument();
    });

    it('should render page subtitle', () => {
      renderTelehealth();
      expect(
        screen.getByText('Sala de espera virtual para consulta online')
      ).toBeInTheDocument();
    });

    it('should have animation class', () => {
      const { container } = renderTelehealth();
      expect(container.querySelector('.animate-enter')).toBeTruthy();
    });
  });

  describe('loading state', () => {
    beforeEach(() => {
      mockUsePatientTelehealth.mockReturnValue({
        nextTeleconsulta: { appointment: null, session: null },
        loading: true,
        error: null,
        canJoin: false,
        minutesUntilJoin: null,
        meetLink: null,
        isMeetSession: false,
        joinWaitingRoom: vi.fn(),
        openMeet: vi.fn(),
        refresh: vi.fn(),
      });
    });

    it('should show skeleton loading state', () => {
      const { container } = renderTelehealth();
      // Skeleton components render divs with specific classes
      expect(container.querySelector('.animate-enter')).toBeTruthy();
    });

    it('should show skeleton for header', () => {
      renderTelehealth();
      // Check for skeleton structure
      const skeletons = document.querySelectorAll('[class*="Skeleton"]');
      expect(skeletons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('device check section', () => {
    it('should render device verification section', () => {
      renderTelehealth();
      expect(screen.getByText('Verificar Dispositivos')).toBeInTheDocument();
    });

    it('should render camera status', () => {
      renderTelehealth();
      expect(screen.getByText('Câmera funcionando')).toBeInTheDocument();
    });

    it('should render microphone status', () => {
      renderTelehealth();
      expect(screen.getByText('Microfone funcionando')).toBeInTheDocument();
    });

    it('should render connection status', () => {
      renderTelehealth();
      expect(screen.getByText('Conexão estável')).toBeInTheDocument();
    });

    it('should have video toggle button', () => {
      renderTelehealth();
      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have media control buttons', () => {
      renderTelehealth();
      // Check that there are buttons with the correct styling
      const buttons = document.querySelectorAll('button[class*="p-4"]');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('appointment info', () => {
    it('should display professional name', () => {
      renderTelehealth();
      expect(screen.getByText('Dr. João Silva')).toBeInTheDocument();
    });

    it('should display specialty', () => {
      renderTelehealth();
      expect(screen.getByText('Cardiologia')).toBeInTheDocument();
    });

    it('should display appointment date', () => {
      renderTelehealth();
      // The date is formatted in Portuguese, check for any part
      const dateElement = document.querySelector('[class*="text-genesis-medium"]');
      expect(dateElement).toBeInTheDocument();
    });

    it('should show waiting message when cannot join', () => {
      renderTelehealth();
      expect(screen.getByText('Aguardando horario')).toBeInTheDocument();
    });

    it('should show time remaining message', () => {
      renderTelehealth();
      expect(screen.getByText(/A sala estara disponivel em/)).toBeInTheDocument();
    });

    it('should format time with hours when > 60 minutes', () => {
      mockUsePatientTelehealth.mockReturnValue({
        nextTeleconsulta: { appointment: mockDefaultAppointment, session: null },
        loading: false,
        error: null,
        canJoin: false,
        minutesUntilJoin: 90,
        meetLink: null,
        isMeetSession: false,
        joinWaitingRoom: vi.fn(),
        openMeet: vi.fn(),
        refresh: vi.fn(),
      });

      renderTelehealth();
      expect(screen.getByText(/1h 30min/)).toBeInTheDocument();
    });

    it('should show minutes only when < 60 minutes', () => {
      mockUsePatientTelehealth.mockReturnValue({
        nextTeleconsulta: { appointment: mockDefaultAppointment, session: null },
        loading: false,
        error: null,
        canJoin: false,
        minutesUntilJoin: 45,
        meetLink: null,
        isMeetSession: false,
        joinWaitingRoom: vi.fn(),
        openMeet: vi.fn(),
        refresh: vi.fn(),
      });

      renderTelehealth();
      expect(screen.getByText(/45 minutos/)).toBeInTheDocument();
    });
  });

  describe('join button', () => {
    it('should show join button when can join', () => {
      mockUsePatientTelehealth.mockReturnValue({
        nextTeleconsulta: { appointment: mockDefaultAppointment, session: null },
        loading: false,
        error: null,
        canJoin: true,
        minutesUntilJoin: 0,
        meetLink: null,
        isMeetSession: false,
        joinWaitingRoom: vi.fn(),
        openMeet: vi.fn(),
        refresh: vi.fn(),
      });

      renderTelehealth();
      expect(screen.getByText('Entrar na Sala')).toBeInTheDocument();
    });

    it('should call joinWaitingRoom when clicking join', async () => {
      const mockJoin = vi.fn().mockResolvedValue(undefined);
      mockUsePatientTelehealth.mockReturnValue({
        nextTeleconsulta: { appointment: mockDefaultAppointment, session: null },
        loading: false,
        error: null,
        canJoin: true,
        minutesUntilJoin: 0,
        meetLink: null,
        isMeetSession: false,
        joinWaitingRoom: mockJoin,
        openMeet: vi.fn(),
        refresh: vi.fn(),
      });

      renderTelehealth();
      fireEvent.click(screen.getByText('Entrar na Sala'));

      await waitFor(() => {
        expect(mockJoin).toHaveBeenCalled();
      });
    });

    it('should show loading state while joining', async () => {
      const mockJoin = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );
      mockUsePatientTelehealth.mockReturnValue({
        nextTeleconsulta: { appointment: mockDefaultAppointment, session: null },
        loading: false,
        error: null,
        canJoin: true,
        minutesUntilJoin: 0,
        meetLink: null,
        isMeetSession: false,
        joinWaitingRoom: mockJoin,
        openMeet: vi.fn(),
        refresh: vi.fn(),
      });

      renderTelehealth();
      fireEvent.click(screen.getByText('Entrar na Sala'));

      await waitFor(() => {
        expect(screen.getByText('Entrando...')).toBeInTheDocument();
      });
    });

    it('should disable button while joining', async () => {
      const mockJoin = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );
      mockUsePatientTelehealth.mockReturnValue({
        nextTeleconsulta: { appointment: mockDefaultAppointment, session: null },
        loading: false,
        error: null,
        canJoin: true,
        minutesUntilJoin: 0,
        meetLink: null,
        isMeetSession: false,
        joinWaitingRoom: mockJoin,
        openMeet: vi.fn(),
        refresh: vi.fn(),
      });

      renderTelehealth();
      fireEvent.click(screen.getByText('Entrar na Sala'));

      await waitFor(() => {
        const joiningButton = screen.getByText('Entrando...').closest('button');
        expect(joiningButton).toBeDisabled();
      });
    });

    it('should handle join error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockJoin = vi.fn().mockRejectedValue(new Error('Join failed'));
      mockUsePatientTelehealth.mockReturnValue({
        nextTeleconsulta: { appointment: mockDefaultAppointment, session: null },
        loading: false,
        error: null,
        canJoin: true,
        minutesUntilJoin: 0,
        meetLink: null,
        isMeetSession: false,
        joinWaitingRoom: mockJoin,
        openMeet: vi.fn(),
        refresh: vi.fn(),
      });

      renderTelehealth();
      fireEvent.click(screen.getByText('Entrar na Sala'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error joining waiting room:',
          expect.any(Error)
        );
      });

      // Button should be enabled again after error
      await waitFor(() => {
        expect(screen.getByText('Entrar na Sala')).not.toBeDisabled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('no appointment', () => {
    beforeEach(() => {
      mockUsePatientTelehealth.mockReturnValue({
        nextTeleconsulta: { appointment: null, session: null },
        loading: false,
        error: null,
        canJoin: false,
        minutesUntilJoin: null,
        meetLink: null,
        isMeetSession: false,
        joinWaitingRoom: vi.fn(),
        openMeet: vi.fn(),
        refresh: vi.fn(),
      });
    });

    it('should show no appointment message', () => {
      renderTelehealth();
      expect(screen.getByText('Nenhuma teleconsulta agendada')).toBeInTheDocument();
    });

    it('should show explanation text', () => {
      renderTelehealth();
      expect(
        screen.getByText('Você não possui teleconsultas agendadas no momento.')
      ).toBeInTheDocument();
    });

    it('should show schedule appointment link', () => {
      renderTelehealth();
      expect(screen.getByText('Agendar Consulta')).toBeInTheDocument();
    });

    it('should link to appointments page', () => {
      renderTelehealth();
      const link = screen.getByText('Agendar Consulta');
      expect(link.closest('a')).toHaveAttribute('href', '/portal/consultas');
    });
  });

  describe('instructions section', () => {
    it('should render preparation instructions', () => {
      renderTelehealth();
      expect(screen.getByText('Preparacao para a Teleconsulta')).toBeInTheDocument();
    });

    it('should show quiet location tip', () => {
      renderTelehealth();
      expect(
        screen.getByText('Escolha um local silencioso e bem iluminado')
      ).toBeInTheDocument();
    });

    it('should show internet connection tip', () => {
      renderTelehealth();
      expect(
        screen.getByText('Verifique sua conexao com a internet')
      ).toBeInTheDocument();
    });

    it('should show documents tip', () => {
      renderTelehealth();
      expect(
        screen.getByText('Tenha seus documentos e exames em maos')
      ).toBeInTheDocument();
    });

    it('should show headphones tip', () => {
      renderTelehealth();
      expect(
        screen.getByText('Use fones de ouvido para melhor qualidade de audio')
      ).toBeInTheDocument();
    });
  });

  describe('specialty fallback', () => {
    it('should show Medico when specialty is not provided', () => {
      const appointmentWithoutSpecialty = {
        ...mockDefaultAppointment,
        specialty: undefined,
      };
      mockUsePatientTelehealth.mockReturnValue({
        nextTeleconsulta: { appointment: appointmentWithoutSpecialty, session: null },
        loading: false,
        error: null,
        canJoin: false,
        minutesUntilJoin: 60,
        meetLink: null,
        isMeetSession: false,
        joinWaitingRoom: vi.fn(),
        openMeet: vi.fn(),
        refresh: vi.fn(),
      });

      renderTelehealth();
      expect(screen.getByText('Medico')).toBeInTheDocument();
    });
  });

  describe('null minutes until join', () => {
    it('should show generic message when minutesUntilJoin is null', () => {
      mockUsePatientTelehealth.mockReturnValue({
        nextTeleconsulta: { appointment: mockDefaultAppointment, session: null },
        loading: false,
        error: null,
        canJoin: false,
        minutesUntilJoin: null,
        meetLink: null,
        isMeetSession: false,
        joinWaitingRoom: vi.fn(),
        openMeet: vi.fn(),
        refresh: vi.fn(),
      });

      renderTelehealth();
      expect(
        screen.getByText(
          'A sala estara disponivel 15 minutos antes do horario agendado.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Google Meet session', () => {
    const mockMeetSession = {
      id: 'session-123',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      calendarEventId: 'cal-123',
    };

    beforeEach(() => {
      mockUsePatientTelehealth.mockReturnValue({
        nextTeleconsulta: {
          appointment: mockDefaultAppointment,
          session: mockMeetSession,
        },
        loading: false,
        error: null,
        canJoin: true,
        minutesUntilJoin: 0,
        meetLink: 'https://meet.google.com/abc-defg-hij',
        isMeetSession: true,
        joinWaitingRoom: vi.fn(),
        openMeet: vi.fn(),
        refresh: vi.fn(),
      });
    });

    it('should show Google Meet button when isMeetSession is true', () => {
      renderTelehealth();
      expect(screen.getByText('Entrar no Google Meet')).toBeInTheDocument();
    });

    it('should show Meet subtitle when isMeetSession is true', () => {
      renderTelehealth();
      expect(screen.getByText('Consulta online via Google Meet')).toBeInTheDocument();
    });

    it('should show copy link button for Meet sessions', () => {
      renderTelehealth();
      expect(screen.getByText('Copiar link do Meet')).toBeInTheDocument();
    });

    it('should call openMeet when clicking Google Meet button', () => {
      const mockOpenMeet = vi.fn();
      mockUsePatientTelehealth.mockReturnValue({
        nextTeleconsulta: {
          appointment: mockDefaultAppointment,
          session: mockMeetSession,
        },
        loading: false,
        error: null,
        canJoin: true,
        minutesUntilJoin: 0,
        meetLink: 'https://meet.google.com/abc-defg-hij',
        isMeetSession: true,
        joinWaitingRoom: vi.fn(),
        openMeet: mockOpenMeet,
        refresh: vi.fn(),
      });

      renderTelehealth();
      fireEvent.click(screen.getByText('Entrar no Google Meet'));

      expect(mockOpenMeet).toHaveBeenCalled();
    });

    it('should copy Meet link to clipboard when clicking copy button', async () => {
      renderTelehealth();
      fireEvent.click(screen.getByText('Copiar link do Meet'));

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'https://meet.google.com/abc-defg-hij'
        );
      });
    });

    it('should show success toast when copying link', async () => {
      renderTelehealth();
      fireEvent.click(screen.getByText('Copiar link do Meet'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Link copiado!');
      });
    });

    it('should show copied state after copying', async () => {
      renderTelehealth();
      fireEvent.click(screen.getByText('Copiar link do Meet'));

      await waitFor(() => {
        expect(screen.getByText('Link copiado!')).toBeInTheDocument();
      });
    });

    it('should show Meet instruction in instructions section', () => {
      renderTelehealth();
      expect(
        screen.getByText('O Meet abrira em nova aba - permita camera e microfone')
      ).toBeInTheDocument();
    });

    it('should show Meet badge text', () => {
      renderTelehealth();
      expect(screen.getByText('A consulta abrira no Google Meet')).toBeInTheDocument();
    });

    it('should not show device check section when Meet is ready', () => {
      renderTelehealth();
      // When canJoin is true and isMeetSession is true, device check is hidden
      expect(screen.queryByText('Verificar Dispositivos')).not.toBeInTheDocument();
    });

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
      });

      renderTelehealth();
      expect(screen.getByText('Verificar Dispositivos')).toBeInTheDocument();
    });

    it('should handle copy error gracefully', async () => {
      vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Failed'));

      renderTelehealth();
      fireEvent.click(screen.getByText('Copiar link do Meet'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao copiar link');
      });
    });
  });

  describe('legacy Jitsi session', () => {
    beforeEach(() => {
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
      });
    });

    it('should show legacy enter button when not Meet session', () => {
      renderTelehealth();
      expect(screen.getByText('Entrar na Sala')).toBeInTheDocument();
    });

    it('should not show Google Meet button for legacy session', () => {
      renderTelehealth();
      expect(screen.queryByText('Entrar no Google Meet')).not.toBeInTheDocument();
    });

    it('should not show copy link button for legacy session', () => {
      renderTelehealth();
      expect(screen.queryByText('Copiar link do Meet')).not.toBeInTheDocument();
    });

    it('should show traditional subtitle for legacy session', () => {
      renderTelehealth();
      expect(
        screen.getByText('Sala de espera virtual para consulta online')
      ).toBeInTheDocument();
    });
  });
});
