/**
 * InvoiceGenerator - Customer Info Tests
 *
 * Tests for customer information fields and prefilling.
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

describe('InvoiceGenerator - Customer Info', () => {
  const { mockOnClose } = createMockHandlers()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('prefilling from patient', () => {
    it('should pre-fill customer name from patient prop', () => {
      render(<InvoiceGenerator patient={defaultPatient} onClose={mockOnClose} />)

      const nameInput = screen.getByDisplayValue('Maria Santos')
      expect(nameInput).toBeInTheDocument()
    })

    it('should pre-fill CPF from patient prop', () => {
      render(<InvoiceGenerator patient={defaultPatient} onClose={mockOnClose} />)

      const cpfInput = screen.getByDisplayValue('123.456.789-00')
      expect(cpfInput).toBeInTheDocument()
    })

    it('should pre-fill email from patient prop', () => {
      render(<InvoiceGenerator patient={defaultPatient} onClose={mockOnClose} />)

      const emailInput = screen.getByDisplayValue('maria@email.com')
      expect(emailInput).toBeInTheDocument()
    })
  })

  describe('manual input', () => {
    it('should allow editing customer name', async () => {
      const user = userEvent.setup()
      render(<InvoiceGenerator onClose={mockOnClose} />)

      const nameInput = screen.getByPlaceholderText('Nome do cliente')
      await user.type(nameInput, 'João Silva')

      expect(nameInput).toHaveValue('João Silva')
    })

    it('should allow editing CPF', async () => {
      const user = userEvent.setup()
      render(<InvoiceGenerator onClose={mockOnClose} />)

      const cpfInput = screen.getByPlaceholderText('000.000.000-00')
      await user.type(cpfInput, '123.456.789-00')

      expect(cpfInput).toHaveValue('123.456.789-00')
    })

    it('should allow editing email', async () => {
      const user = userEvent.setup()
      render(<InvoiceGenerator onClose={mockOnClose} />)

      const emailInput = screen.getByPlaceholderText('email@exemplo.com')
      await user.type(emailInput, 'test@test.com')

      expect(emailInput).toHaveValue('test@test.com')
    })
  })

  describe('empty state', () => {
    it('should handle empty patient gracefully', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />)

      expect(screen.getByPlaceholderText('Nome do cliente')).toHaveValue('')
    })
  })
})
