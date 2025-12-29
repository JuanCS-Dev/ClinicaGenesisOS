/**
 * Agenda Page Tests
 * @module __tests__/pages/Agenda.test
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  mockSetFilters,
  mockUpdateAppointment,
  mockAddAppointment,
  mockDeleteAppointment,
  mockDefaultAppointments,
  defaultAppointmentsHook,
  loadingAppointmentsHook,
  emptyAppointmentsHook,
} from './Agenda.setup'

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({ clinicId: 'clinic-123' })),
}))

vi.mock('../../hooks/useAppointments', () => ({
  useAppointments: vi.fn(() => defaultAppointmentsHook),
}))

import { useAppointments } from '../../hooks/useAppointments'
const mockUseAppointments = useAppointments as ReturnType<typeof vi.fn>

let mockOnDayClick: ((date: Date) => void) | null = null
let mockOnReschedule: ((id: string, date: Date) => Promise<void>) | null = null
let mockOnStartTelemedicine: ((apt: unknown) => void) | null = null

vi.mock('../../components/agenda', () => ({
  DraggableDayView: ({
    onReschedule,
    onStartTelemedicine,
  }: {
    onReschedule: (id: string, date: Date) => Promise<void>
    onStartTelemedicine: (apt: unknown) => void
  }) => {
    mockOnReschedule = onReschedule
    mockOnStartTelemedicine = onStartTelemedicine
    return <div data-testid="day-view">Day View</div>
  },
  WeekView: ({ onDayClick }: { onDayClick: (date: Date) => void }) => {
    mockOnDayClick = onDayClick
    return (
      <div data-testid="week-view">
        <button data-testid="day-click-trigger" onClick={() => onDayClick(new Date())}>
          Click Day
        </button>
      </div>
    )
  },
  MonthView: ({ onDayClick }: { onDayClick: (date: Date) => void }) => {
    mockOnDayClick = onDayClick
    return (
      <div data-testid="month-view">
        <button data-testid="month-day-click" onClick={() => onDayClick(new Date())}>
          Click Day
        </button>
      </div>
    )
  },
  FilterPanel: ({
    onToggleStatus,
    onToggleSpecialty,
    onClear,
    onClose,
  }: {
    onToggleStatus: (s: string) => void
    onToggleSpecialty: (s: string) => void
    onClear: () => void
    onClose: () => void
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
}))

vi.mock('../../components/telemedicine', () => ({
  TelemedicineModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="telemedicine-modal">
        <button data-testid="close-telemedicine" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}))

vi.mock('../../lib/recurrence', () => ({ expandRecurringAppointments: (a: unknown[]) => a }))

import { Agenda } from '../../pages/Agenda'
const renderAgenda = () =>
  render(
    <MemoryRouter>
      <Agenda />
    </MemoryRouter>
  )

describe('Agenda', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOnDayClick = null
    mockOnReschedule = null
    mockOnStartTelemedicine = null
    mockUseAppointments.mockReturnValue(defaultAppointmentsHook)
  })

  afterEach(() => vi.restoreAllMocks())

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderAgenda()
      expect(container).toBeDefined()
    })

    it('should have view controls', () => {
      renderAgenda()
      expect(screen.getByText('Dia')).toBeInTheDocument()
      expect(screen.getByText('Semana')).toBeInTheDocument()
      expect(screen.getByText('Mês')).toBeInTheDocument()
    })
  })

  describe('view mode controls', () => {
    it('should show day view by default', () => {
      renderAgenda()
      expect(screen.getByTestId('day-view')).toBeInTheDocument()
    })

    // Note: Tests use findByTestId (async) because views are lazy-loaded
    it('should switch to week view', async () => {
      renderAgenda()
      fireEvent.click(screen.getByText('Semana'))
      expect(await screen.findByTestId('week-view')).toBeInTheDocument()
    })

    it('should switch to month view', async () => {
      renderAgenda()
      fireEvent.click(screen.getByText('Mês'))
      expect(await screen.findByTestId('month-view')).toBeInTheDocument()
    })

    it('should switch back to day view', async () => {
      renderAgenda()
      fireEvent.click(screen.getByText('Semana'))
      await screen.findByTestId('week-view')
      fireEvent.click(screen.getByText('Dia'))
      expect(screen.getByTestId('day-view')).toBeInTheDocument()
    })
  })

  describe('date navigation', () => {
    it('should display HOJE badge when on current date', () => {
      renderAgenda()
      expect(screen.getByText('HOJE')).toBeInTheDocument()
    })

    it('should navigate and show today button', () => {
      renderAgenda()
      const prevButton = document.querySelector('[class*="lucide-chevron-left"]')?.closest('button')
      if (prevButton) {
        fireEvent.click(prevButton)
        expect(screen.getByText('Hoje')).toBeInTheDocument()
      }
    })

    it('should navigate to today when clicking Hoje', () => {
      renderAgenda()
      const prevButton = document.querySelector('[class*="lucide-chevron-left"]')?.closest('button')
      if (prevButton) {
        fireEvent.click(prevButton)
        fireEvent.click(screen.getByText('Hoje'))
        expect(screen.getByText('HOJE')).toBeInTheDocument()
      }
    })
  })

  describe('filters', () => {
    it('should have filters button', () => {
      renderAgenda()
      expect(screen.getByText('Filtros')).toBeInTheDocument()
    })

    it('should open filter panel on click', () => {
      renderAgenda()
      fireEvent.click(screen.getByText('Filtros'))
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument()
    })

    it('should toggle status filter', () => {
      renderAgenda()
      fireEvent.click(screen.getByText('Filtros'))
      fireEvent.click(screen.getByTestId('toggle-status'))
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should clear all filters', () => {
      renderAgenda()
      fireEvent.click(screen.getByText('Filtros'))
      fireEvent.click(screen.getByTestId('toggle-status'))
      fireEvent.click(screen.getByTestId('clear-filters'))
      expect(screen.queryByText('1')).not.toBeInTheDocument()
    })

    it('should close filter panel', () => {
      renderAgenda()
      fireEvent.click(screen.getByText('Filtros'))
      fireEvent.click(screen.getByTestId('close-filters'))
      expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument()
    })
  })

  describe('appointment modal', () => {
    it('should have new appointment button', () => {
      renderAgenda()
      expect(screen.getByText('Nova Consulta')).toBeInTheDocument()
    })

    // Note: Uses findByTestId (async) because AppointmentModal is lazy-loaded
    it('should open appointment modal on click', async () => {
      renderAgenda()
      fireEvent.click(screen.getByText('Nova Consulta'))
      expect(await screen.findByTestId('appointment-modal')).toBeInTheDocument()
    })

    it('should close appointment modal', async () => {
      renderAgenda()
      fireEvent.click(screen.getByText('Nova Consulta'))
      await screen.findByTestId('appointment-modal')
      fireEvent.click(screen.getByText('Close Modal'))
      expect(screen.queryByTestId('appointment-modal')).not.toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('should show loader when loading', () => {
      mockUseAppointments.mockReturnValue(loadingAppointmentsHook)
      renderAgenda()
      expect(document.querySelector('.animate-spin')).toBeTruthy()
    })

    it('should not show calendar views when loading', () => {
      mockUseAppointments.mockReturnValue(loadingAppointmentsHook)
      renderAgenda()
      expect(screen.queryByTestId('day-view')).not.toBeInTheDocument()
    })
  })

  describe('day click in week/month view', () => {
    // Note: Uses findByTestId (async) because views are lazy-loaded
    it('should switch to day view when clicking a day in week view', async () => {
      renderAgenda()
      fireEvent.click(screen.getByText('Semana'))
      await screen.findByTestId('week-view')
      fireEvent.click(screen.getByTestId('day-click-trigger'))
      expect(screen.getByTestId('day-view')).toBeInTheDocument()
    })

    it('should switch to day view when clicking a day in month view', async () => {
      renderAgenda()
      fireEvent.click(screen.getByText('Mês'))
      await screen.findByTestId('month-view')
      fireEvent.click(screen.getByTestId('month-day-click'))
      expect(screen.getByTestId('day-view')).toBeInTheDocument()
    })
  })

  describe('reschedule handler', () => {
    it('should call updateAppointment when rescheduling', async () => {
      renderAgenda()
      if (mockOnReschedule) {
        await act(async () => {
          await mockOnReschedule!('apt-1', new Date())
        })
        expect(mockUpdateAppointment).toHaveBeenCalledWith('apt-1', expect.any(Object))
      }
    })
  })

  describe('telemedicine modal', () => {
    // Note: Uses findByTestId (async) because TelemedicineModal is lazy-loaded
    it('should open telemedicine modal when starting telemedicine', async () => {
      renderAgenda()
      if (mockOnStartTelemedicine) {
        act(() => {
          mockOnStartTelemedicine!(mockDefaultAppointments[0])
        })
        expect(await screen.findByTestId('telemedicine-modal')).toBeInTheDocument()
      }
    })

    it('should close telemedicine modal', async () => {
      renderAgenda()
      if (mockOnStartTelemedicine) {
        act(() => {
          mockOnStartTelemedicine!(mockDefaultAppointments[0])
        })
        await screen.findByTestId('telemedicine-modal')
        fireEvent.click(screen.getByTestId('close-telemedicine'))
        expect(screen.queryByTestId('telemedicine-modal')).not.toBeInTheDocument()
      }
    })
  })

  describe('empty appointments', () => {
    beforeEach(() => mockUseAppointments.mockReturnValue(emptyAppointmentsHook))

    it('should render day view with no appointments', () => {
      renderAgenda()
      expect(screen.getByTestId('day-view')).toBeInTheDocument()
    })
  })

  describe('date display', () => {
    it('should show correct date format', () => {
      renderAgenda()
      const today = format(new Date(), "dd 'de' MMMM", { locale: ptBR })
      expect(screen.getByText(new RegExp(today.split(' ')[0]))).toBeInTheDocument()
    })
  })
})
