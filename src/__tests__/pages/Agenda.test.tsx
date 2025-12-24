/**
 * Agenda Page Tests
 *
 * Smoke tests + basic functionality verification.
 * The agenda uses complex child components (DraggableDayView, WeekView, etc),
 * so we mock them for isolation.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
  })),
}));

vi.mock('../../hooks/useAppointments', () => ({
  useAppointments: vi.fn(() => ({
    appointments: [
      {
        id: 'apt-1',
        patientId: 'p1',
        patientName: 'Maria Santos',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '09:30',
        durationMin: 30,
        status: 'Confirmado',
        specialty: 'medicina',
      },
    ],
    loading: false,
    error: null,
    setFilters: vi.fn(),
    updateAppointment: vi.fn(),
  })),
}));

// Mock agenda components
vi.mock('../../components/agenda', () => ({
  DraggableDayView: () => <div data-testid="day-view">Day View</div>,
  WeekView: () => <div data-testid="week-view">Week View</div>,
  MonthView: () => <div data-testid="month-view">Month View</div>,
  FilterPanel: () => <div data-testid="filter-panel">Filters</div>,
}));

vi.mock('../../components/telemedicine', () => ({
  TelemedicineModal: () => null,
}));

vi.mock('../../lib/recurrence', () => ({
  expandRecurringAppointments: (appointments: unknown[]) => appointments,
}));

import { Agenda } from '../../pages/Agenda';

const renderAgenda = () => {
  return render(
    <MemoryRouter>
      <Agenda />
    </MemoryRouter>
  );
};

describe('Agenda', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderAgenda();
      expect(container).toBeDefined();
    });
  });

  describe('view controls', () => {
    it('should display view mode buttons', () => {
      renderAgenda();
      expect(screen.getByText('Dia')).toBeInTheDocument();
      expect(screen.getByText('Semana')).toBeInTheDocument();
      expect(screen.getByText('Mês')).toBeInTheDocument();
    });

    it('should show day view by default', () => {
      renderAgenda();
      expect(screen.getByTestId('day-view')).toBeInTheDocument();
    });

    it('should switch to week view when clicked', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Semana'));
      expect(screen.getByTestId('week-view')).toBeInTheDocument();
    });

    it('should switch to month view when clicked', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Mês'));
      expect(screen.getByTestId('month-view')).toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('should have new appointment button', () => {
      renderAgenda();
      expect(screen.getByText('Nova Consulta')).toBeInTheDocument();
    });

    it('should have filters button', () => {
      renderAgenda();
      expect(screen.getByText('Filtros')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show loader when loading', async () => {
      const { useAppointments } = await import('../../hooks/useAppointments');
      vi.mocked(useAppointments).mockReturnValue({
        appointments: [],
        loading: true,
        error: null,
        setFilters: vi.fn(),
        updateAppointment: vi.fn(),
        addAppointment: vi.fn(),
        deleteAppointment: vi.fn(),
      } as ReturnType<typeof useAppointments>);

      renderAgenda();
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });
  });
});
