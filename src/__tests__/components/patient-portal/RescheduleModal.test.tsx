/**
 * RescheduleModal Tests
 * =====================
 *
 * Tests for the appointment reschedule modal component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { RescheduleModal } from '../../../components/patient-portal/RescheduleModal'
import type { Appointment } from '@/types'
import { Status } from '@/types'

// Test data
const mockAppointment: Appointment = {
  id: 'apt-123',
  patientId: 'patient-123',
  patientName: 'Maria Santos',
  professional: 'Dr. João Silva',
  specialty: 'Cardiologia',
  date: '2025-01-20T14:00:00Z',
  durationMin: 30,
  procedure: 'Consulta de Retorno',
  status: Status.CONFIRMED,
  notes: '',
}

describe('RescheduleModal', () => {
  const mockOnClose = vi.fn()
  const mockOnReschedule = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderModal = (props: Partial<Parameters<typeof RescheduleModal>[0]> = {}) => {
    return render(
      <RescheduleModal
        isOpen={true}
        appointment={mockAppointment}
        onClose={mockOnClose}
        onReschedule={mockOnReschedule}
        {...props}
      />
    )
  }

  describe('rendering', () => {
    it('should render nothing when isOpen is false', () => {
      const { container } = render(
        <RescheduleModal
          isOpen={false}
          appointment={mockAppointment}
          onClose={mockOnClose}
          onReschedule={mockOnReschedule}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should render nothing when appointment is null', () => {
      const { container } = render(
        <RescheduleModal
          isOpen={true}
          appointment={null}
          onClose={mockOnClose}
          onReschedule={mockOnReschedule}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should render modal when open with appointment', () => {
      renderModal()

      expect(screen.getByText('Remarcar Consulta')).toBeInTheDocument()
    })

    it('should show current appointment info', () => {
      renderModal()

      expect(screen.getByText('Consulta Atual')).toBeInTheDocument()
      expect(screen.getByText('Dr. João Silva')).toBeInTheDocument()
    })

    it('should render date input', () => {
      renderModal()

      expect(screen.getByText('Nova Data')).toBeInTheDocument()
    })

    it('should render cancel and confirm buttons', () => {
      renderModal()

      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument()
    })
  })

  describe('date selection', () => {
    it('should show time slots when date is selected', () => {
      renderModal()

      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
      fireEvent.change(dateInput, { target: { value: '2025-02-20' } })

      // Wait for time slots to appear
      expect(screen.getByText('Horário Disponível')).toBeInTheDocument()
      expect(screen.getByText('08:00')).toBeInTheDocument()
    })

    it('should reset time when date changes', () => {
      renderModal()

      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
      fireEvent.change(dateInput, { target: { value: '2025-02-20' } })

      // Select a time
      const slot = screen.getByText('10:00')
      fireEvent.click(slot)

      // Change date
      fireEvent.change(dateInput, { target: { value: '2025-02-21' } })

      // Summary should not show anymore (time reset)
      expect(screen.queryByText('Nova Data e Horário')).not.toBeInTheDocument()
    })
  })

  describe('time slot selection', () => {
    it('should update selected time when slot is clicked', () => {
      renderModal()

      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
      fireEvent.change(dateInput, { target: { value: '2025-02-20' } })

      const slot = screen.getByText('10:00')
      fireEvent.click(slot)

      // Selected slot should be highlighted
      expect(slot.closest('button')).toHaveClass('bg-genesis-primary')
    })

    it('should show summary when date and time are selected', () => {
      renderModal()

      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
      fireEvent.change(dateInput, { target: { value: '2025-02-20' } })

      fireEvent.click(screen.getByText('10:00'))

      expect(screen.getByText('Nova Data e Horário')).toBeInTheDocument()
      expect(screen.getByText(/às 10:00/)).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('should disable confirm button when no date selected', () => {
      renderModal()

      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      expect(confirmButton).toBeDisabled()
    })

    it('should enable confirm button when date and time are selected', () => {
      renderModal()

      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
      fireEvent.change(dateInput, { target: { value: '2025-02-20' } })

      fireEvent.click(screen.getByText('10:00'))

      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      expect(confirmButton).not.toBeDisabled()
    })

    it('should call onReschedule with correct parameters on submit', () => {
      mockOnReschedule.mockResolvedValue(undefined)
      renderModal()

      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
      fireEvent.change(dateInput, { target: { value: '2025-02-20' } })

      fireEvent.click(screen.getByText('10:00'))
      fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))

      expect(mockOnReschedule).toHaveBeenCalledWith(
        'apt-123',
        '2025-02-20T10:00:00'
      )
    })
  })

  describe('close behavior', () => {
    it('should call onClose when cancel button is clicked', () => {
      renderModal()

      fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('info card', () => {
    it('should show email confirmation notice', () => {
      renderModal()

      expect(screen.getByText(/confirmação por email/i)).toBeInTheDocument()
    })
  })
})
