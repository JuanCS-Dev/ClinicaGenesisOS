/**
 * InvoiceGenerator - Rendering Tests
 *
 * Tests for basic component rendering and structure.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { mockClinicContext, createMockHandlers } from './setup'

// Mock must be before component import
vi.mock('../../../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => mockClinicContext),
}))

import { InvoiceGenerator } from '../../../../components/payments/InvoiceGenerator'

describe('InvoiceGenerator - Rendering', () => {
  const { mockOnClose } = createMockHandlers()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('basic structure', () => {
    it('should render without crashing', () => {
      const { container } = render(<InvoiceGenerator onClose={mockOnClose} />)
      expect(container).toBeDefined()
    })

    it('should display title and subtitle', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />)

      expect(screen.getByText('Gerar Fatura')).toBeInTheDocument()
      expect(screen.getByText('Crie uma fatura para o paciente')).toBeInTheDocument()
    })

    it('should render section headers', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />)

      expect(screen.getByText('Dados do Cliente')).toBeInTheDocument()
      expect(screen.getByText('Itens')).toBeInTheDocument()
    })
  })

  describe('close button', () => {
    it('should render close button when onClose is provided', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />)

      expect(screen.getByText('✕')).toBeInTheDocument()
    })

    it('should not render close button when onClose is not provided', () => {
      render(<InvoiceGenerator />)

      expect(screen.queryByText('✕')).not.toBeInTheDocument()
    })
  })

  describe('form sections', () => {
    it('should render discount section', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />)

      expect(screen.getByText('Desconto')).toBeInTheDocument()
    })

    it('should render notes section', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />)

      expect(screen.getByText('Observações')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Observações adicionais...')).toBeInTheDocument()
    })

    it('should render totals section', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />)

      expect(screen.getByText('Subtotal')).toBeInTheDocument()
      expect(screen.getByText('Total')).toBeInTheDocument()
    })
  })
})
