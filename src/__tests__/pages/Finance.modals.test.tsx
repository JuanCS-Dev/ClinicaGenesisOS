/**
 * Finance Modal Tests
 * Tests for transaction form and PIX modals.
 * @module __tests__/pages/Finance.modals.test
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { mockAddTransaction, defaultFinanceHook, renderFinance } from './Finance.setup'
import { useFinance } from '../../hooks/useFinance'

const mockUseFinance = useFinance as ReturnType<typeof vi.fn>

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    clinic: { id: 'clinic-123', name: 'Clínica Genesis' },
  })),
}))

vi.mock('../../hooks/useFinance', () => ({
  useFinance: vi.fn(() => defaultFinanceHook),
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}))

vi.mock('../../components/finance', async () => {
  const actual = await vi.importActual('../../components/finance')
  return {
    ...actual,
    TransactionForm: ({
      onClose,
      onSubmit,
      onGeneratePix,
    }: {
      onClose: () => void
      onSubmit: (data: unknown) => Promise<string>
      onGeneratePix?: (id: string, amount: number, desc: string) => void
    }) => (
      <div data-testid="transaction-form">
        <button onClick={onClose}>Fechar</button>
        <button
          onClick={async () => {
            const id = await onSubmit({
              description: 'Test',
              amount: 10000,
              type: 'income',
              categoryId: 'consultation',
            })
            if (onGeneratePix) onGeneratePix(id, 10000, 'Test')
          }}
        >
          Salvar com PIX
        </button>
        <button
          onClick={() =>
            onSubmit({
              description: 'Test',
              amount: 10000,
              type: 'income',
              categoryId: 'consultation',
            })
          }
        >
          Salvar
        </button>
      </div>
    ),
  }
})

vi.mock('../../components/payments', () => ({
  DirectPixModal: ({
    onClose,
    onConfirmPayment,
    amountInCents,
    description,
  }: {
    onClose: () => void
    onConfirmPayment: () => void
    amountInCents: number
    description: string
  }) => (
    <div data-testid="pix-modal">
      <span data-testid="pix-amount">{amountInCents}</span>
      <span data-testid="pix-description">{description}</span>
      <button onClick={onClose}>Fechar PIX</button>
      <button onClick={onConfirmPayment}>Confirmar PIX</button>
    </div>
  ),
}))

vi.mock('../../services/export.service', () => ({
  exportTransactionsToExcel: vi.fn().mockResolvedValue(undefined),
  exportTransactionsToPDF: vi.fn().mockResolvedValue(undefined),
}))

describe('Finance - Transaction Form Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseFinance.mockReturnValue(defaultFinanceHook)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should open form on add button click', () => {
    renderFinance()
    fireEvent.click(screen.getByRole('button', { name: /Nova Transação/i }))

    expect(screen.getByTestId('transaction-form')).toBeInTheDocument()
  })

  it('should close form on close button click', () => {
    renderFinance()
    fireEvent.click(screen.getByRole('button', { name: /Nova Transação/i }))
    fireEvent.click(screen.getByText('Fechar'))

    expect(screen.queryByTestId('transaction-form')).not.toBeInTheDocument()
  })

  it('should submit form and call addTransaction', async () => {
    renderFinance()
    fireEvent.click(screen.getByRole('button', { name: /Nova Transação/i }))
    fireEvent.click(screen.getByText('Salvar'))

    await waitFor(() => {
      expect(mockAddTransaction).toHaveBeenCalled()
    })
  })
})

describe('Finance - PIX Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseFinance.mockReturnValue(defaultFinanceHook)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should open PIX modal on PIX button click', () => {
    renderFinance()
    fireEvent.click(screen.getByRole('button', { name: /PIX/i }))

    expect(screen.getByTestId('pix-modal')).toBeInTheDocument()
  })

  it('should open PIX modal with empty data for new PIX', () => {
    renderFinance()
    fireEvent.click(screen.getByRole('button', { name: /PIX/i }))

    expect(screen.getByTestId('pix-amount')).toHaveTextContent('0')
  })

  it('should close PIX modal on close button', () => {
    renderFinance()
    fireEvent.click(screen.getByRole('button', { name: /PIX/i }))
    fireEvent.click(screen.getByText('Fechar PIX'))

    expect(screen.queryByTestId('pix-modal')).not.toBeInTheDocument()
  })

  it('should close PIX modal on confirm', () => {
    renderFinance()
    fireEvent.click(screen.getByRole('button', { name: /PIX/i }))
    fireEvent.click(screen.getByText('Confirmar PIX'))

    expect(screen.queryByTestId('pix-modal')).not.toBeInTheDocument()
  })

  it('should open PIX modal with data from form', async () => {
    renderFinance()
    fireEvent.click(screen.getByRole('button', { name: /Nova Transação/i }))
    fireEvent.click(screen.getByText('Salvar com PIX'))

    await waitFor(() => {
      expect(screen.getByTestId('pix-modal')).toBeInTheDocument()
      expect(screen.getByTestId('pix-amount')).toHaveTextContent('10000')
      expect(screen.getByTestId('pix-description')).toHaveTextContent('Test')
    })
  })
})
