/**
 * InvoiceGenerator - Invoice Generation Tests
 *
 * Tests for invoice structure, discount in invoice, and notes in invoice.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockClinicContext, defaultPatient, defaultItems, createMockHandlers } from './setup'

// Mock must be before component import
vi.mock('../../../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => mockClinicContext),
}))

import { InvoiceGenerator } from '../../../../components/payments/InvoiceGenerator'

describe('InvoiceGenerator - Invoice Generation', () => {
  const { mockOnGenerate, mockOnClose } = createMockHandlers()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('invoice structure', () => {
    it('should generate invoice with correct structure', async () => {
      const user = userEvent.setup()
      render(
        <InvoiceGenerator
          patient={defaultPatient}
          initialItems={defaultItems}
          onGenerate={mockOnGenerate}
          onClose={mockOnClose}
        />
      )

      const downloadButton = screen.getByText('Download PDF')
      await user.click(downloadButton)

      expect(mockOnGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          number: expect.stringMatching(/^INV-\d{6}-[A-Z0-9]{4}$/),
          clinic: expect.objectContaining({
            name: 'Clinica Genesis',
          }),
          customer: expect.objectContaining({
            name: 'Maria Santos',
            cpf: '123.456.789-00',
            email: 'maria@email.com',
          }),
          subtotal: 25000,
          total: 25000,
          issuedAt: expect.any(String),
          paymentMethod: 'pix',
          status: 'draft',
        })
      )
    })
  })

  describe('discount in invoice', () => {
    it('should include discount in invoice when applied', async () => {
      const user = userEvent.setup()
      render(
        <InvoiceGenerator
          patient={defaultPatient}
          initialItems={[{ description: 'Consulta', quantity: 1, unitPrice: 10000, total: 10000 }]}
          onGenerate={mockOnGenerate}
          onClose={mockOnClose}
        />
      )

      const discountInputs = screen.getAllByRole('spinbutton')
      const discountInput = discountInputs[2]
      await user.clear(discountInput)
      await user.type(discountInput, '20')

      const downloadButton = screen.getByText('Download PDF')
      await user.click(downloadButton)

      expect(mockOnGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          subtotal: 10000,
          discount: 2000,
          total: 8000,
        })
      )
    })
  })

  describe('notes in invoice', () => {
    it('should include notes in invoice when provided', async () => {
      const user = userEvent.setup()
      render(
        <InvoiceGenerator
          patient={defaultPatient}
          initialItems={defaultItems}
          onGenerate={mockOnGenerate}
          onClose={mockOnClose}
        />
      )

      const notesTextarea = screen.getByPlaceholderText('Observações adicionais...')
      await user.type(notesTextarea, 'Pagamento imediato')

      const downloadButton = screen.getByText('Download PDF')
      await user.click(downloadButton)

      expect(mockOnGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: 'Pagamento imediato',
        })
      )
    })
  })
})
