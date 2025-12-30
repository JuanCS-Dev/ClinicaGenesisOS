/**
 * InvoiceGenerator - Edge Cases Tests
 *
 * Tests for boundary conditions, empty states, and validation edge cases.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockClinicContext, defaultPatient, createMockHandlers } from './setup'

// Mock must be before component import
vi.mock('../../../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => mockClinicContext),
}))

import { InvoiceGenerator } from '../../../../components/payments/InvoiceGenerator'

describe('InvoiceGenerator - Edge Cases', () => {
  const { mockOnGenerate, mockOnClose } = createMockHandlers()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('empty states', () => {
    it('should handle empty patient gracefully', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />)

      expect(screen.getByPlaceholderText('Nome do cliente')).toHaveValue('')
    })

    it('should handle empty initialItems', () => {
      render(<InvoiceGenerator initialItems={[]} onClose={mockOnClose} />)

      expect(screen.getByPlaceholderText('Descrição')).toBeInTheDocument()
    })
  })

  describe('item filtering', () => {
    it('should filter out empty items on generate', async () => {
      const user = userEvent.setup()
      render(
        <InvoiceGenerator
          patient={defaultPatient}
          onGenerate={mockOnGenerate}
          onClose={mockOnClose}
        />
      )

      const descInput = screen.getByPlaceholderText('Descrição')
      await user.type(descInput, 'Consulta')

      const priceInputs = screen.getAllByRole('spinbutton')
      const priceInput = priceInputs[1]
      await user.clear(priceInput)
      await user.type(priceInput, '100')

      const downloadButton = screen.getByText('Download PDF')
      await user.click(downloadButton)

      expect(mockOnGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              description: 'Consulta',
            }),
          ]),
        })
      )
    })
  })

  describe('input constraints', () => {
    it('should enforce minimum quantity of 1', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />)

      const qtyInputs = screen.getAllByRole('spinbutton')
      const qtyInput = qtyInputs[0]

      expect(qtyInput).toHaveAttribute('min', '1')
    })

    it('should enforce minimum price of 0', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />)

      const priceInputs = screen.getAllByRole('spinbutton')
      const priceInput = priceInputs[1]

      expect(priceInput).toHaveAttribute('min', '0')
    })
  })
})
