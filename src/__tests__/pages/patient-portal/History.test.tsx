/**
 * Patient Portal History Tests
 *
 * Comprehensive tests for patient medical history page.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
// Import setup to activate mocks (hoisted automatically)
import { resetPatientPortalMocks } from './setup';

import { PatientHistory } from '../../../pages/patient-portal/History';

// Get the mock function to override per-test
import { usePatientPortalAppointments } from '../../../hooks/usePatientPortal';

const mockUsePatientPortalAppointments = usePatientPortalAppointments as ReturnType<typeof vi.fn>;

const renderHistory = () => {
  return render(
    <MemoryRouter>
      <PatientHistory />
    </MemoryRouter>
  );
};

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe('PatientHistory', () => {
  beforeEach(() => {
    resetPatientPortalMocks();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loading state', () => {
    it('should render skeleton while loading', () => {
      mockUsePatientPortalAppointments.mockReturnValue({
        appointments: [],
        upcomingAppointments: [],
        pastAppointments: [],
        nextAppointment: null,
        loading: true,
        error: null,
      });

      renderHistory();
      // Check for skeleton animation class on container
      const animatedContainer = document.querySelector('.animate-enter');
      expect(animatedContainer).toBeInTheDocument();
    });

    it('should not render main content while loading', () => {
      mockUsePatientPortalAppointments.mockReturnValue({
        appointments: [],
        upcomingAppointments: [],
        pastAppointments: [],
        nextAppointment: null,
        loading: true,
        error: null,
      });

      renderHistory();
      expect(screen.queryByText('Meu Histórico')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    beforeEach(() => {
      mockUsePatientPortalAppointments.mockReturnValue({
        appointments: [],
        upcomingAppointments: [],
        pastAppointments: [],
        nextAppointment: null,
        loading: false,
        error: null,
      });
    });

    it('should render without crashing', () => {
      const { container } = renderHistory();
      expect(container).toBeDefined();
    });

    it('should render page title', () => {
      renderHistory();
      expect(screen.getByText('Meu Histórico')).toBeInTheDocument();
    });

    it('should render empty state message', () => {
      renderHistory();
      expect(screen.getByText('Nenhum histórico disponível')).toBeInTheDocument();
    });

    it('should render empty state description', () => {
      renderHistory();
      expect(
        screen.getByText(/Seu histórico de atendimentos aparecerá aqui/)
      ).toBeInTheDocument();
    });

    it('should render disabled export button', () => {
      renderHistory();
      const exportButton = screen.getByRole('button', { name: /Exportar Histórico/i });
      expect(exportButton).toBeDisabled();
    });

    it('should show generic subtitle when empty', () => {
      renderHistory();
      expect(
        screen.getByText('Histórico completo de atendimentos e prontuário')
      ).toBeInTheDocument();
    });
  });

  describe('with appointments', () => {
    const mockPastAppointments = [
      {
        id: 'apt-1',
        patientId: 'patient-123',
        patientName: 'Maria Santos',
        professional: 'Dr. João Silva',
        specialty: 'Cardiologia',
        procedure: 'Consulta de rotina',
        date: '2025-01-10T14:00:00.000Z',
        time: '14:00',
        status: 'completed',
        notes: 'Paciente estável',
      },
      {
        id: 'apt-2',
        patientId: 'patient-123',
        patientName: 'Maria Santos',
        professional: 'Dra. Ana Costa',
        specialty: 'Dermatologia',
        procedure: 'Exame de pele',
        date: '2025-01-05T10:00:00.000Z',
        time: '10:00',
        status: 'completed',
        notes: '',
      },
    ];

    beforeEach(() => {
      mockUsePatientPortalAppointments.mockReturnValue({
        appointments: mockPastAppointments,
        upcomingAppointments: [],
        pastAppointments: mockPastAppointments,
        nextAppointment: null,
        loading: false,
        error: null,
      });
    });

    it('should render history records', () => {
      renderHistory();
      expect(screen.getByText('Dr. João Silva')).toBeInTheDocument();
      expect(screen.getByText('Dra. Ana Costa')).toBeInTheDocument();
    });

    it('should render specialties', () => {
      renderHistory();
      expect(screen.getByText('Cardiologia')).toBeInTheDocument();
      expect(screen.getByText('Dermatologia')).toBeInTheDocument();
    });

    it('should render procedures', () => {
      renderHistory();
      expect(screen.getByText('Consulta de rotina')).toBeInTheDocument();
      expect(screen.getByText('Exame de pele')).toBeInTheDocument();
    });

    it('should render notes when present', () => {
      renderHistory();
      expect(screen.getByText('Paciente estável')).toBeInTheDocument();
    });

    it('should show correct count in subtitle', () => {
      renderHistory();
      expect(screen.getByText('2 atendimentos registrados')).toBeInTheDocument();
    });

    it('should enable export button', () => {
      renderHistory();
      const exportButton = screen.getByRole('button', { name: /Exportar Histórico/i });
      expect(exportButton).not.toBeDisabled();
    });

    it('should render record type as Consulta', () => {
      renderHistory();
      const consultaTags = screen.getAllByText('Consulta');
      expect(consultaTags.length).toBeGreaterThan(0);
    });
  });

  describe('record types', () => {
    it('should render "Exame" type for exam procedures', () => {
      mockUsePatientPortalAppointments.mockReturnValue({
        appointments: [],
        upcomingAppointments: [],
        pastAppointments: [
          {
            id: 'apt-exam',
            patientId: 'patient-123',
            patientName: 'Maria Santos',
            professional: 'Dr. Lab',
            specialty: 'Laboratório',
            procedure: 'Exame de sangue completo',
            date: '2025-01-10T14:00:00.000Z',
            time: '14:00',
            status: 'completed',
            notes: '',
          },
        ],
        nextAppointment: null,
        loading: false,
        error: null,
      });

      renderHistory();
      expect(screen.getByText('Exame')).toBeInTheDocument();
    });
  });

  describe('single appointment', () => {
    beforeEach(() => {
      mockUsePatientPortalAppointments.mockReturnValue({
        appointments: [],
        upcomingAppointments: [],
        pastAppointments: [
          {
            id: 'apt-single',
            patientId: 'patient-123',
            patientName: 'Maria Santos',
            professional: 'Dr. Solo',
            specialty: 'Clínica Geral',
            procedure: null,
            date: '2025-01-15T10:00:00.000Z',
            time: '10:00',
            status: 'completed',
            notes: null,
          },
        ],
        nextAppointment: null,
        loading: false,
        error: null,
      });
    });

    it('should show singular count', () => {
      renderHistory();
      expect(screen.getByText('1 atendimento registrado')).toBeInTheDocument();
    });

    it('should handle null procedure gracefully', () => {
      renderHistory();
      expect(screen.getByText('Dr. Solo')).toBeInTheDocument();
    });

    it('should handle null notes gracefully', () => {
      renderHistory();
      // Should not crash, just not show notes
      expect(screen.queryByText('null')).not.toBeInTheDocument();
    });
  });

  describe('export functionality', () => {
    const mockPastAppointments = [
      {
        id: 'apt-1',
        patientId: 'patient-123',
        patientName: 'Maria Santos',
        professional: 'Dr. João Silva',
        specialty: 'Cardiologia',
        procedure: 'Consulta',
        date: '2025-01-10T14:00:00.000Z',
        time: '14:00',
        status: 'completed',
        notes: 'Notas da consulta',
      },
    ];

    beforeEach(() => {
      mockUsePatientPortalAppointments.mockReturnValue({
        appointments: mockPastAppointments,
        upcomingAppointments: [],
        pastAppointments: mockPastAppointments,
        nextAppointment: null,
        loading: false,
        error: null,
      });
    });

    it('should create blob and download on export click', () => {
      // First render the component
      renderHistory();

      // Then mock createElement only for 'a' tag
      const mockClick = vi.fn();
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: mockClick,
          } as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tagName);
      });

      const exportButton = screen.getByRole('button', { name: /Exportar Histórico/i });
      fireEvent.click(exportButton);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();

      // Restore
      vi.restoreAllMocks();
    });

    it('should not export when no appointments', () => {
      mockUsePatientPortalAppointments.mockReturnValue({
        appointments: [],
        upcomingAppointments: [],
        pastAppointments: [],
        nextAppointment: null,
        loading: false,
        error: null,
      });

      renderHistory();
      const exportButton = screen.getByRole('button', { name: /Exportar Histórico/i });

      // Button should be disabled
      expect(exportButton).toBeDisabled();
    });
  });

  describe('date formatting', () => {
    beforeEach(() => {
      mockUsePatientPortalAppointments.mockReturnValue({
        appointments: [],
        upcomingAppointments: [],
        pastAppointments: [
          {
            id: 'apt-date',
            patientId: 'patient-123',
            patientName: 'Maria Santos',
            professional: 'Dr. Date Test',
            specialty: 'Test',
            procedure: 'Consulta',
            date: '2025-06-15T14:00:00.000Z',
            time: '14:00',
            status: 'completed',
            notes: '',
          },
        ],
        nextAppointment: null,
        loading: false,
        error: null,
      });
    });

    it('should format dates in Portuguese', () => {
      renderHistory();
      // Should render something like "15 de junho de 2025"
      expect(screen.getByText(/junho/i)).toBeInTheDocument();
    });
  });

  describe('timeline UI', () => {
    beforeEach(() => {
      mockUsePatientPortalAppointments.mockReturnValue({
        appointments: [],
        upcomingAppointments: [],
        pastAppointments: [
          {
            id: 'apt-1',
            patientId: 'patient-123',
            patientName: 'Maria Santos',
            professional: 'Dr. First',
            specialty: 'First',
            procedure: 'Consulta',
            date: '2025-01-10T14:00:00.000Z',
            time: '14:00',
            status: 'completed',
            notes: '',
          },
          {
            id: 'apt-2',
            patientId: 'patient-123',
            patientName: 'Maria Santos',
            professional: 'Dr. Last',
            specialty: 'Last',
            procedure: 'Consulta',
            date: '2025-01-05T10:00:00.000Z',
            time: '10:00',
            status: 'completed',
            notes: '',
          },
        ],
        nextAppointment: null,
        loading: false,
        error: null,
      });
    });

    it('should render timeline container', () => {
      renderHistory();
      const container = document.querySelector('[class*="space-y"]');
      expect(container).toBeInTheDocument();
    });

    it('should render chevron icons', () => {
      renderHistory();
      const chevrons = document.querySelectorAll('.lucide-chevron-right');
      expect(chevrons.length).toBe(2);
    });
  });
});
