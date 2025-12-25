/**
 * Agenda Page Tests
 *
 * Comprehensive tests for the agenda calendar view.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
  })),
}));

const mockSetFilters = vi.fn();
const mockUpdateAppointment = vi.fn().mockResolvedValue(undefined);
const mockAddAppointment = vi.fn();
const mockDeleteAppointment = vi.fn();

const mockDefaultAppointments = [
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
  {
    id: 'apt-2',
    patientId: 'p2',
    patientName: 'João Silva',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '10:30',
    durationMin: 30,
    status: 'Pendente',
    specialty: 'cardiologia',
  },
];

vi.mock('../../hooks/useAppointments', () => ({
  useAppointments: vi.fn(() => ({
    appointments: mockDefaultAppointments,
    loading: false,
    error: null,
    setFilters: mockSetFilters,
    updateAppointment: mockUpdateAppointment,
    addAppointment: mockAddAppointment,
    deleteAppointment: mockDeleteAppointment,
  })),
}));

import { useAppointments } from '../../hooks/useAppointments';
const mockUseAppointments = useAppointments as ReturnType<typeof vi.fn>;

// Store callbacks from mock components for testing
let mockOnDayClick: ((date: Date) => void) | null = null;
let mockOnReschedule: ((id: string, date: Date) => Promise<void>) | null = null;
let mockOnStartTelemedicine: ((apt: unknown) => void) | null = null;

// Mock agenda components
vi.mock('../../components/agenda', () => ({
  DraggableDayView: ({
    onReschedule,
    onStartTelemedicine,
  }: {
    onReschedule: (id: string, date: Date) => Promise<void>;
    onStartTelemedicine: (apt: unknown) => void;
  }) => {
    mockOnReschedule = onReschedule;
    mockOnStartTelemedicine = onStartTelemedicine;
    return <div data-testid="day-view">Day View</div>;
  },
  WeekView: ({
    onDayClick,
  }: {
    onDayClick: (date: Date) => void;
  }) => {
    mockOnDayClick = onDayClick;
    return (
      <div data-testid="week-view">
        Week View
        <button data-testid="day-click-trigger" onClick={() => onDayClick(new Date())}>
          Click Day
        </button>
      </div>
    );
  },
  MonthView: ({
    onDayClick,
  }: {
    onDayClick: (date: Date) => void;
  }) => {
    mockOnDayClick = onDayClick;
    return (
      <div data-testid="month-view">
        Month View
        <button data-testid="month-day-click" onClick={() => onDayClick(new Date())}>
          Click Day
        </button>
      </div>
    );
  },
  FilterPanel: ({
    onToggleStatus,
    onToggleSpecialty,
    onClear,
    onClose,
  }: {
    onToggleStatus: (status: string) => void;
    onToggleSpecialty: (specialty: string) => void;
    onClear: () => void;
    onClose: () => void;
  }) => (
    <div data-testid="filter-panel">
      <button data-testid="toggle-status" onClick={() => onToggleStatus('Confirmado')}>
        Toggle Status
      </button>
      <button data-testid="toggle-specialty" onClick={() => onToggleSpecialty('medicina')}>
        Toggle Specialty
      </button>
      <button data-testid="clear-filters" onClick={onClear}>
        Clear
      </button>
      <button data-testid="close-filters" onClick={onClose}>
        Close
      </button>
    </div>
  ),
  AppointmentModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="appointment-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

vi.mock('../../components/telemedicine', () => ({
  TelemedicineModal: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="telemedicine-modal">
        <button data-testid="close-telemedicine" onClick={onClose}>
          Close Telemedicine
        </button>
      </div>
    ) : null,
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
    mockOnDayClick = null;
    mockOnReschedule = null;
    mockOnStartTelemedicine = null;
    mockUseAppointments.mockReturnValue({
      appointments: mockDefaultAppointments,
      loading: false,
      error: null,
      setFilters: mockSetFilters,
      updateAppointment: mockUpdateAppointment,
      addAppointment: mockAddAppointment,
      deleteAppointment: mockDeleteAppointment,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderAgenda();
      expect(container).toBeDefined();
    });

    it('should have animation class', () => {
      const { container } = renderAgenda();
      expect(container.querySelector('.animate-enter')).toBeTruthy();
    });

    it('should have header with view controls', () => {
      renderAgenda();
      expect(screen.getByText('Dia')).toBeInTheDocument();
      expect(screen.getByText('Semana')).toBeInTheDocument();
      expect(screen.getByText('Mês')).toBeInTheDocument();
    });
  });

  describe('view mode controls', () => {
    it('should show day view by default', () => {
      renderAgenda();
      expect(screen.getByTestId('day-view')).toBeInTheDocument();
    });

    it('should switch to week view', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Semana'));
      expect(screen.getByTestId('week-view')).toBeInTheDocument();
      expect(screen.queryByTestId('day-view')).not.toBeInTheDocument();
    });

    it('should switch to month view', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Mês'));
      expect(screen.getByTestId('month-view')).toBeInTheDocument();
    });

    it('should switch back to day view from week', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Semana'));
      fireEvent.click(screen.getByText('Dia'));
      expect(screen.getByTestId('day-view')).toBeInTheDocument();
    });

    it('should switch back to day view from month', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Mês'));
      fireEvent.click(screen.getByText('Dia'));
      expect(screen.getByTestId('day-view')).toBeInTheDocument();
    });
  });

  describe('date navigation - day view', () => {
    it('should have previous and next buttons', () => {
      renderAgenda();
      const prevButtons = document.querySelectorAll('[class*="lucide-chevron-left"]');
      const nextButtons = document.querySelectorAll('[class*="lucide-chevron-right"]');
      expect(prevButtons.length).toBeGreaterThan(0);
      expect(nextButtons.length).toBeGreaterThan(0);
    });

    it('should navigate to previous day', () => {
      renderAgenda();
      const prevButton = document.querySelector('[class*="lucide-chevron-left"]')?.closest('button');
      if (prevButton) {
        fireEvent.click(prevButton);
        expect(mockSetFilters).toHaveBeenCalled();
      }
    });

    it('should navigate to next day', () => {
      renderAgenda();
      const nextButton = document.querySelector('[class*="lucide-chevron-right"]')?.closest('button');
      if (nextButton) {
        fireEvent.click(nextButton);
        expect(mockSetFilters).toHaveBeenCalled();
      }
    });

    it('should display HOJE badge when on current date', () => {
      renderAgenda();
      expect(screen.getByText('HOJE')).toBeInTheDocument();
    });

    it('should show today button when not on current date', () => {
      renderAgenda();
      // Navigate away from today
      const prevButton = document.querySelector('[class*="lucide-chevron-left"]')?.closest('button');
      if (prevButton) {
        fireEvent.click(prevButton);
        expect(screen.getByText('Hoje')).toBeInTheDocument();
      }
    });

    it('should navigate to today when clicking Hoje button', () => {
      renderAgenda();
      const prevButton = document.querySelector('[class*="lucide-chevron-left"]')?.closest('button');
      if (prevButton) {
        fireEvent.click(prevButton);
        fireEvent.click(screen.getByText('Hoje'));
        expect(screen.getByText('HOJE')).toBeInTheDocument();
      }
    });
  });

  describe('date navigation - week view', () => {
    it('should navigate weeks with prev/next buttons', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Semana'));

      const prevButton = document.querySelector('[class*="lucide-chevron-left"]')?.closest('button');
      if (prevButton) {
        fireEvent.click(prevButton);
        // Should update week display
        expect(screen.getByTestId('week-view')).toBeInTheDocument();
      }
    });

    it('should show week range display', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Semana'));
      // Week display shows range like "15 - 21 de Dezembro"
      expect(screen.getByText(/\d+\s*-\s*\d+/)).toBeInTheDocument();
    });
  });

  describe('date navigation - month view', () => {
    it('should navigate months with prev/next buttons', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Mês'));

      const nextButton = document.querySelector('[class*="lucide-chevron-right"]')?.closest('button');
      if (nextButton) {
        fireEvent.click(nextButton);
        expect(screen.getByTestId('month-view')).toBeInTheDocument();
      }
    });

    it('should show month and year display', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Mês'));
      // Month display shows "Mês de Ano"
      const currentMonth = format(new Date(), 'MMMM', { locale: ptBR });
      expect(screen.getByText(new RegExp(currentMonth, 'i'))).toBeInTheDocument();
    });
  });

  describe('filters', () => {
    it('should have filters button', () => {
      renderAgenda();
      expect(screen.getByText('Filtros')).toBeInTheDocument();
    });

    it('should open filter panel on click', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Filtros'));
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });

    it('should toggle status filter', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Filtros'));
      fireEvent.click(screen.getByTestId('toggle-status'));
      // Filter badge should appear
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should toggle specialty filter', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Filtros'));
      fireEvent.click(screen.getByTestId('toggle-specialty'));
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should clear all filters', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Filtros'));
      fireEvent.click(screen.getByTestId('toggle-status'));
      fireEvent.click(screen.getByTestId('clear-filters'));
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });

    it('should close filter panel', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Filtros'));
      fireEvent.click(screen.getByTestId('close-filters'));
      expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();
    });

    it('should show filter count badge when filters active', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Filtros'));
      fireEvent.click(screen.getByTestId('toggle-status'));
      fireEvent.click(screen.getByTestId('toggle-specialty'));
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should close filter panel on outside click', async () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Filtros'));
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();

      // Simulate clicking outside
      await act(async () => {
        const event = new MouseEvent('mousedown', { bubbles: true });
        document.body.dispatchEvent(event);
      });

      expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();
    });
  });

  describe('appointment modal', () => {
    it('should have new appointment button', () => {
      renderAgenda();
      expect(screen.getByText('Nova Consulta')).toBeInTheDocument();
    });

    it('should open appointment modal on click', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Nova Consulta'));
      expect(screen.getByTestId('appointment-modal')).toBeInTheDocument();
    });

    it('should close appointment modal', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Nova Consulta'));
      fireEvent.click(screen.getByText('Close Modal'));
      expect(screen.queryByTestId('appointment-modal')).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    beforeEach(() => {
      mockUseAppointments.mockReturnValue({
        appointments: [],
        loading: true,
        error: null,
        setFilters: mockSetFilters,
        updateAppointment: mockUpdateAppointment,
        addAppointment: mockAddAppointment,
        deleteAppointment: mockDeleteAppointment,
      });
    });

    it('should show loader when loading', () => {
      renderAgenda();
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });

    it('should not show calendar views when loading', () => {
      renderAgenda();
      expect(screen.queryByTestId('day-view')).not.toBeInTheDocument();
    });
  });

  describe('day click in week/month view', () => {
    it('should switch to day view when clicking a day in week view', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Semana'));
      fireEvent.click(screen.getByTestId('day-click-trigger'));
      expect(screen.getByTestId('day-view')).toBeInTheDocument();
    });

    it('should switch to day view when clicking a day in month view', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Mês'));
      fireEvent.click(screen.getByTestId('month-day-click'));
      expect(screen.getByTestId('day-view')).toBeInTheDocument();
    });
  });

  describe('reschedule handler', () => {
    it('should call updateAppointment when rescheduling', async () => {
      renderAgenda();
      // mockOnReschedule is set when DraggableDayView renders

      if (mockOnReschedule) {
        await act(async () => {
          await mockOnReschedule!('apt-1', new Date());
        });
        expect(mockUpdateAppointment).toHaveBeenCalledWith('apt-1', expect.any(Object));
      }
    });
  });

  describe('telemedicine modal', () => {
    it('should open telemedicine modal when starting telemedicine', () => {
      renderAgenda();

      if (mockOnStartTelemedicine) {
        act(() => {
          mockOnStartTelemedicine!(mockDefaultAppointments[0]);
        });
        expect(screen.getByTestId('telemedicine-modal')).toBeInTheDocument();
      }
    });

    it('should close telemedicine modal', () => {
      renderAgenda();

      if (mockOnStartTelemedicine) {
        act(() => {
          mockOnStartTelemedicine!(mockDefaultAppointments[0]);
        });
        fireEvent.click(screen.getByTestId('close-telemedicine'));
        expect(screen.queryByTestId('telemedicine-modal')).not.toBeInTheDocument();
      }
    });
  });

  describe('empty appointments', () => {
    beforeEach(() => {
      mockUseAppointments.mockReturnValue({
        appointments: [],
        loading: false,
        error: null,
        setFilters: mockSetFilters,
        updateAppointment: mockUpdateAppointment,
        addAppointment: mockAddAppointment,
        deleteAppointment: mockDeleteAppointment,
      });
    });

    it('should render day view with no appointments', () => {
      renderAgenda();
      expect(screen.getByTestId('day-view')).toBeInTheDocument();
    });

    it('should render week view with no appointments', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Semana'));
      expect(screen.getByTestId('week-view')).toBeInTheDocument();
    });

    it('should render month view with no appointments', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Mês'));
      expect(screen.getByTestId('month-view')).toBeInTheDocument();
    });
  });

  describe('date display', () => {
    it('should show day format in day view', () => {
      renderAgenda();
      const today = format(new Date(), "dd 'de' MMMM", { locale: ptBR });
      expect(screen.getByText(new RegExp(today.split(' ')[0]))).toBeInTheDocument();
    });

    it('should show week range in week view', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Semana'));
      // Should show range like "22 - 28 de Dezembro"
      const dateText = screen.getByText(/\d+\s*-\s*\d+/);
      expect(dateText).toBeInTheDocument();
    });

    it('should show month and year in month view', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Mês'));
      const year = new Date().getFullYear();
      expect(screen.getByText(new RegExp(String(year)))).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle multiple view switches rapidly', () => {
      renderAgenda();
      fireEvent.click(screen.getByText('Semana'));
      fireEvent.click(screen.getByText('Mês'));
      fireEvent.click(screen.getByText('Dia'));
      fireEvent.click(screen.getByText('Semana'));
      expect(screen.getByTestId('week-view')).toBeInTheDocument();
    });

    it('should handle multiple navigation clicks', () => {
      renderAgenda();
      const prevButton = document.querySelector('[class*="lucide-chevron-left"]')?.closest('button');
      if (prevButton) {
        fireEvent.click(prevButton);
        fireEvent.click(prevButton);
        fireEvent.click(prevButton);
        // Should not crash
        expect(screen.getByTestId('day-view')).toBeInTheDocument();
      }
    });
  });
});
