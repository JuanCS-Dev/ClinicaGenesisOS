/**
 * InvoiceGenerator - Actions Tests
 *
 * Tests for form validation, button actions, invoice generation, and edge cases.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockClinicContext, defaultPatient, defaultItems, createMockHandlers } from './setup'

// Mock must be before component import
vi.mock('../../../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => mockClinicContext),
}))

import { InvoiceGenerator } from '../../../../components/payments/InvoiceGenerator'

describe('InvoiceGenerator - Actions', () => {
  const { mockOnGenerate, mockOnSend, mockOnClose } = createMockHandlers()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('form validation', () => {
    it('should disable buttons when form is invalid (no name)', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />)

      const printButton = screen.getByText('Imprimir')
      const downloadButton = screen.getByText('Download PDF')

      expect(printButton).toBeDisabled()
      expect(downloadButton).toBeDisabled()
    })

    it('should enable buttons when form is valid', async () => {
      const user = userEvent.setup()
      render(<InvoiceGenerator onClose={mockOnClose} />)

      const nameInput = screen.getByPlaceholderText('Nome do cliente')
      await user.type(nameInput, 'João Silva')

      const descInput = screen.getByPlaceholderText('Descrição')
      await user.type(descInput, 'Consulta')

      const priceInputs = screen.getAllByRole('spinbutton')
      const priceInput = priceInputs[1]
      await user.clear(priceInput)
      await user.type(priceInput, '100')

      const printButton = screen.getByText('Imprimir')
      expect(printButton).not.toBeDisabled()
    })
  })

  describe('close action', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<InvoiceGenerator onClose={mockOnClose} />)

      const closeButton = screen.getByText('✕')
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('download PDF action', () => {
    it('should call onGenerate when Download PDF is clicked', async () => {
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

      expect(mockOnGenerate).toHaveBeenCalled()
      expect(mockOnGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: expect.objectContaining({
            name: 'Maria Santos',
          }),
          items: expect.arrayContaining([
            expect.objectContaining({
              description: 'Consulta',
            }),
          ]),
        })
      )
    })

    it('should show generated state after generating', async () => {
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

      await waitFor(() => {
        expect(screen.getByText('Fatura gerada!')).toBeInTheDocument()
      })
    })
  })

  describe('print action', () => {
    it('should call window.print when Imprimir is clicked', async () => {
      const user = userEvent.setup()
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})

      render(
        <InvoiceGenerator
          patient={defaultPatient}
          initialItems={defaultItems}
          onClose={mockOnClose}
        />
      )

      const printButton = screen.getByText('Imprimir')
      await user.click(printButton)

      expect(printSpy).toHaveBeenCalled()
      printSpy.mockRestore()
    })
  })

  describe('email action', () => {
    it('should show send button when onSend and email are provided', () => {
      render(
        <InvoiceGenerator
          patient={defaultPatient}
          initialItems={defaultItems}
          onSend={mockOnSend}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Enviar por Email')).toBeInTheDocument()
    })

    it('should not show send button when no email', () => {
      render(
        <InvoiceGenerator
          patient={{ name: 'João', cpf: '123' }}
          initialItems={defaultItems}
          onSend={mockOnSend}
          onClose={mockOnClose}
        />
      )

      expect(screen.queryByText('Enviar por Email')).not.toBeInTheDocument()
    })

    it('should call onSend when Enviar por Email is clicked', async () => {
      const user = userEvent.setup()
      render(
        <InvoiceGenerator
          patient={defaultPatient}
          initialItems={defaultItems}
          onSend={mockOnSend}
          onClose={mockOnClose}
        />
      )

      const sendButton = screen.getByText('Enviar por Email')
      await user.click(sendButton)

      await waitFor(() => {
        expect(mockOnSend).toHaveBeenCalled()
      })
    })

    it('should show loading state when sending', async () => {
      const slowSend = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)))
      const user = userEvent.setup()

      render(
        <InvoiceGenerator
          patient={defaultPatient}
          initialItems={defaultItems}
          onSend={slowSend}
          onClose={mockOnClose}
        />
      )

      const sendButton = screen.getByText('Enviar por Email')
      await user.click(sendButton)

      expect(sendButton).toBeDisabled()
    })
  })
})
