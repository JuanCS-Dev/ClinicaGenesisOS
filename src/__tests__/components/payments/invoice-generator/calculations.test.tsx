/**
 * InvoiceGenerator - Calculations Tests
 *
 * Tests for discount, notes, and totals calculations.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockClinicContext, createMockHandlers } from './setup'

// Mock must be before component import
vi.mock('../../../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => mockClinicContext),
}))

import { InvoiceGenerator } from '../../../../components/payments/InvoiceGenerator'

describe('InvoiceGenerator - Calculations', () => {
  const { mockOnClose } = createMockHandlers()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('discount', () => {
    it('should render discount input', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />)

      expect(screen.getByText('Desconto')).toBeInTheDocument()
    })

    it('should allow entering discount value', async () => {
      const user = userEvent.setup()
      render(<InvoiceGenerator onClose={mockOnClose} />)

      const discountInputs = screen.getAllByRole('spinbutton')
      const discountInput = discountInputs[2]

      await user.clear(discountInput)
      await user.type(discountInput, '50')

      expect(discountInput).toHaveValue(50)
    })

    it('should display discount in totals when applied', async () => {
      const user = userEvent.setup()
      render(
        <InvoiceGenerator
          initialItems={[{ description: 'Consulta', quantity: 1, unitPrice: 10000, total: 10000 }]}
          onClose={mockOnClose}
        />
      )

      const discountInputs = screen.getAllByRole('spinbutton')
      const discountInput = discountInputs[2]
      await user.clear(discountInput)
      await user.type(discountInput, '10')

      await waitFor(() => {
        expect(screen.getByText('-R$ 10,00')).toBeInTheDocument()
      })
    })
  })

  describe('notes', () => {
    it('should render notes textarea', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />)

      expect(screen.getByText('Observações')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Observações adicionais...')).toBeInTheDocument()
    })

    it('should allow entering notes', async () => {
      const user = userEvent.setup()
      render(<InvoiceGenerator onClose={mockOnClose} />)

      const notesTextarea = screen.getByPlaceholderText('Observações adicionais...')
      await user.type(notesTextarea, 'Pagamento via PIX')

      expect(notesTextarea).toHaveValue('Pagamento via PIX')
    })
  })

  describe('totals calculation', () => {
    it('should display subtotal', () => {
      render(
        <InvoiceGenerator
          initialItems={[{ description: 'Consulta', quantity: 1, unitPrice: 25000, total: 25000 }]}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Subtotal')).toBeInTheDocument()
      const amounts = screen.getAllByText('R$ 250,00')
      expect(amounts.length).toBeGreaterThan(0)
    })

    it('should display total', () => {
      render(
        <InvoiceGenerator
          initialItems={[{ description: 'Consulta', quantity: 1, unitPrice: 25000, total: 25000 }]}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Total')).toBeInTheDocument()
    })

    it('should calculate correct total with multiple items', () => {
      render(
        <InvoiceGenerator
          initialItems={[
            { description: 'Item 1', quantity: 2, unitPrice: 5000, total: 10000 },
            { description: 'Item 2', quantity: 1, unitPrice: 15000, total: 15000 },
          ]}
          onClose={mockOnClose}
        />
      )

      const totals = screen.getAllByText('R$ 250,00')
      expect(totals.length).toBeGreaterThan(0)
    })
  })
})
