/**
 * InvoiceGenerator - Items Management Tests
 *
 * Tests for adding, removing, and editing invoice items.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockClinicContext, defaultItems, createMockHandlers } from './setup'

// Mock must be before component import
vi.mock('../../../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => mockClinicContext),
}))

import { InvoiceGenerator } from '../../../../components/payments/InvoiceGenerator'

describe('InvoiceGenerator - Items Management', () => {
  const { mockOnClose } = createMockHandlers()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('displaying items', () => {
    it('should display initial items when provided', () => {
      render(<InvoiceGenerator initialItems={defaultItems} onClose={mockOnClose} />)

      expect(screen.getByDisplayValue('Consulta')).toBeInTheDocument()
    })

    it('should handle empty initialItems', () => {
      render(<InvoiceGenerator initialItems={[]} onClose={mockOnClose} />)

      expect(screen.getByPlaceholderText('Descrição')).toBeInTheDocument()
    })
  })

  describe('adding items', () => {
    it('should add new item when clicking add button', async () => {
      const user = userEvent.setup()
      render(<InvoiceGenerator onClose={mockOnClose} />)

      const addButton = screen.getByText('Adicionar item')
      await user.click(addButton)

      const descInputs = screen.getAllByPlaceholderText('Descrição')
      expect(descInputs.length).toBe(2)
    })
  })

  describe('removing items', () => {
    it('should remove item when clicking remove button', async () => {
      const user = userEvent.setup()
      render(
        <InvoiceGenerator
          initialItems={[
            { description: 'Item 1', quantity: 1, unitPrice: 1000, total: 1000 },
            { description: 'Item 2', quantity: 1, unitPrice: 2000, total: 2000 },
          ]}
          onClose={mockOnClose}
        />
      )

      expect(screen.getAllByPlaceholderText('Descrição').length).toBe(2)

      const removeButtons = screen.getAllByRole('button')
      const trashButton = removeButtons.find(btn => btn.querySelector('svg.lucide-trash-2'))

      if (trashButton) {
        await user.click(trashButton)
      }

      await waitFor(() => {
        expect(screen.getAllByPlaceholderText('Descrição').length).toBe(1)
      })
    })

    it('should not show remove button when only one item', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />)

      const removeButtons = screen
        .queryAllByRole('button')
        .filter(btn => btn.querySelector('svg.lucide-trash-2'))

      expect(removeButtons.length).toBe(0)
    })
  })

  describe('editing items', () => {
    it('should update item description', async () => {
      const user = userEvent.setup()
      render(<InvoiceGenerator onClose={mockOnClose} />)

      const descInput = screen.getByPlaceholderText('Descrição')
      await user.type(descInput, 'Nova Consulta')

      expect(descInput).toHaveValue('Nova Consulta')
    })

    it('should update item quantity', async () => {
      const user = userEvent.setup()
      render(<InvoiceGenerator onClose={mockOnClose} />)

      const qtyInputs = screen.getAllByRole('spinbutton')
      const qtyInput = qtyInputs[0]

      await user.type(qtyInput, '5')

      expect(qtyInput).toHaveValue(15)
    })

    it('should update item unit price', async () => {
      const user = userEvent.setup()
      render(<InvoiceGenerator onClose={mockOnClose} />)

      const priceInputs = screen.getAllByRole('spinbutton')
      const priceInput = priceInputs[1]

      await user.clear(priceInput)
      await user.type(priceInput, '150')

      expect(priceInput).toHaveValue(150)
    })

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
