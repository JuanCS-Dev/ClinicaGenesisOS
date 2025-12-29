/**
 * Finance Page Tests
 * Core tests for the financial management dashboard.
 * Note: Modal tests are in Finance.modals.test.tsx
 * @module __tests__/pages/Finance.test
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  mockAddTransaction,
  mockUpdateTransaction,
  mockDeleteTransaction,
  mockDefaultTransactions,
  mockDefaultSummary,
  mockDefaultMonthlyData,
  defaultFinanceHook,
  loadingFinanceHook,
  emptyFinanceHook,
} from './Finance.setup'

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    clinic: { id: 'clinic-123', name: 'Clínica Genesis' },
  })),
}))

vi.mock('../../hooks/useFinance', () => ({
  useFinance: vi.fn(() => defaultFinanceHook),
}))

import { useFinance } from '../../hooks/useFinance'
const mockUseFinance = useFinance as ReturnType<typeof vi.fn>

vi.mock('../../services/export.service', () => ({
  exportTransactionsToExcel: vi.fn().mockResolvedValue(undefined),
  exportTransactionsToPDF: vi.fn().mockResolvedValue(undefined),
}))

import { exportTransactionsToExcel, exportTransactionsToPDF } from '../../services/export.service'

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
    TransactionForm: ({ onClose }: { onClose: () => void }) => (
      <div data-testid="transaction-form">
        <button onClick={onClose}>Fechar</button>
      </div>
    ),
  }
})

vi.mock('../../components/payments', () => ({
  DirectPixModal: () => <div data-testid="pix-modal" />,
}))

import { Finance } from '../../pages/Finance'

const renderFinance = () => {
  return render(
    <MemoryRouter>
      <Finance />
    </MemoryRouter>
  )
}

describe('Finance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseFinance.mockReturnValue(defaultFinanceHook)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('should render page title', () => {
      renderFinance()
      expect(screen.getByText('Gestão Financeira')).toBeInTheDocument()
    })

    it('should render page subtitle', () => {
      renderFinance()
      expect(screen.getByText('Fluxo de caixa e demonstrações do mês atual.')).toBeInTheDocument()
    })

    it('should render finance summary cards', () => {
      renderFinance()
      expect(screen.getByText('Receita Total')).toBeInTheDocument()
      expect(screen.getByText('Despesas Operacionais')).toBeInTheDocument()
      expect(screen.getByText('Saldo Líquido')).toBeInTheDocument()
    })

    it('should display formatted currency values', () => {
      renderFinance()
      expect(screen.getByText('R$ 3.500,00')).toBeInTheDocument()
      expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument()
      expect(screen.getByText('R$ 2.000,00')).toBeInTheDocument()
    })

    it('should display trend values', () => {
      renderFinance()
      expect(screen.getByText('+15%')).toBeInTheDocument()
      expect(screen.getByText('-5%')).toBeInTheDocument()
    })

    it('should render chart container', () => {
      renderFinance()
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })

    it('should render chart title', () => {
      renderFinance()
      expect(screen.getByText('Fluxo de Caixa (Semestral)')).toBeInTheDocument()
    })

    it('should render transactions section', () => {
      renderFinance()
      expect(screen.getByText('Transações')).toBeInTheDocument()
    })

    it('should show transaction count', () => {
      renderFinance()
      expect(screen.getByText('3 total')).toBeInTheDocument()
    })

    it('should render action buttons', () => {
      renderFinance()
      expect(screen.getByRole('button', { name: /Nova Transação/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /PIX/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Exportar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Filtros/i })).toBeInTheDocument()
    })
  })

  describe('transaction list', () => {
    it('should display transaction descriptions', () => {
      renderFinance()
      expect(screen.getByText(/Maria Santos/)).toBeInTheDocument()
      expect(screen.getByText(/João Silva/)).toBeInTheDocument()
    })
  })

  describe('search functionality', () => {
    it('should have search input', () => {
      renderFinance()
      expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
    })

    it('should filter transactions by search term', () => {
      renderFinance()
      fireEvent.change(screen.getByPlaceholderText('Buscar...'), { target: { value: 'Maria' } })
      expect(screen.getByText(/Maria Santos/)).toBeInTheDocument()
    })

    it('should show empty state when search has no results', () => {
      renderFinance()
      fireEvent.change(screen.getByPlaceholderText('Buscar...'), {
        target: { value: 'xyz123notfound' },
      })
      expect(screen.getByText('Nenhuma transação encontrada')).toBeInTheDocument()
    })

    it('should search by patient name', () => {
      renderFinance()
      fireEvent.change(screen.getByPlaceholderText('Buscar...'), { target: { value: 'João' } })
      expect(screen.getByText(/João Silva/)).toBeInTheDocument()
    })
  })

  describe('filter functionality', () => {
    it('should open filter menu on click', () => {
      renderFinance()
      fireEvent.click(screen.getByRole('button', { name: /Filtros/i }))
      expect(screen.getByText('Todas')).toBeInTheDocument()
      expect(screen.getByText('Receitas')).toBeInTheDocument()
      expect(screen.getByText('Despesas')).toBeInTheDocument()
    })

    it('should filter by income type', () => {
      renderFinance()
      fireEvent.click(screen.getByRole('button', { name: /Filtros/i }))
      fireEvent.click(screen.getByText('Receitas'))
      expect(screen.getByText(/Maria Santos/)).toBeInTheDocument()
    })

    it('should filter by expense type', () => {
      renderFinance()
      fireEvent.click(screen.getByRole('button', { name: /Filtros/i }))
      fireEvent.click(screen.getByText('Despesas'))
      expect(screen.getByText(/Material de escritório/)).toBeInTheDocument()
    })

    it('should show active filter indicator', () => {
      renderFinance()
      fireEvent.click(screen.getByRole('button', { name: /Filtros/i }))
      fireEvent.click(screen.getByText('Receitas'))
      const filterButton = screen.getByRole('button', { name: /Filtros/i })
      expect(filterButton.className).toContain('bg-genesis-primary')
    })

    it('should reset filter to all', () => {
      renderFinance()
      fireEvent.click(screen.getByRole('button', { name: /Filtros/i }))
      fireEvent.click(screen.getByText('Receitas'))
      fireEvent.click(screen.getByRole('button', { name: /Filtros/i }))
      fireEvent.click(screen.getByText('Todas'))
      expect(screen.getByText(/Maria Santos/)).toBeInTheDocument()
    })
  })

  describe('export functionality', () => {
    it('should open export menu on click', () => {
      renderFinance()
      fireEvent.click(screen.getByRole('button', { name: /Exportar/i }))
      expect(screen.getByText('Exportar PDF')).toBeInTheDocument()
      expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
    })

    it('should call PDF export on click', async () => {
      renderFinance()
      fireEvent.click(screen.getByRole('button', { name: /Exportar/i }))
      fireEvent.click(screen.getByText('Exportar PDF'))
      await waitFor(() => expect(exportTransactionsToPDF).toHaveBeenCalled())
    })

    it('should call Excel export on click', async () => {
      renderFinance()
      fireEvent.click(screen.getByRole('button', { name: /Exportar/i }))
      fireEvent.click(screen.getByText('Exportar Excel'))
      await waitFor(() => expect(exportTransactionsToExcel).toHaveBeenCalled())
    })

    it('should close export menu after selecting option', async () => {
      renderFinance()
      fireEvent.click(screen.getByRole('button', { name: /Exportar/i }))
      fireEvent.click(screen.getByText('Exportar PDF'))
      await waitFor(() => expect(screen.queryByText('Exportar PDF')).not.toBeInTheDocument())
    })
  })

  describe('loading state', () => {
    beforeEach(() => {
      mockUseFinance.mockReturnValue(loadingFinanceHook)
    })

    it('should show loading spinner in transactions list', () => {
      renderFinance()
      expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    beforeEach(() => {
      mockUseFinance.mockReturnValue(emptyFinanceHook)
    })

    it('should show empty state message', () => {
      renderFinance()
      expect(screen.getByText('Nenhuma transação encontrada')).toBeInTheDocument()
    })

    it('should show add button in empty state', () => {
      renderFinance()
      expect(screen.getByText('Adicionar primeira transação')).toBeInTheDocument()
    })

    it('should open form when clicking add in empty state', () => {
      renderFinance()
      fireEvent.click(screen.getByText('Adicionar primeira transação'))
      expect(screen.getByTestId('transaction-form')).toBeInTheDocument()
    })

    it('should show no chart data message', () => {
      renderFinance()
      expect(screen.getByText('Nenhum dado disponível')).toBeInTheDocument()
    })
  })

  describe('margin calculation', () => {
    it('should calculate healthy margin', () => {
      mockUseFinance.mockReturnValue({
        ...defaultFinanceHook,
        summary: { ...mockDefaultSummary, totalIncome: 100000, netBalance: 60000 },
      })
      renderFinance()
      expect(screen.getByText('Margem de 60%')).toBeInTheDocument()
      expect(screen.getByText('Saudável')).toBeInTheDocument()
    })

    it('should show attention for moderate margin', () => {
      mockUseFinance.mockReturnValue({
        ...defaultFinanceHook,
        summary: { ...mockDefaultSummary, totalIncome: 100000, netBalance: 30000 },
      })
      renderFinance()
      expect(screen.getByText('Margem de 30%')).toBeInTheDocument()
      expect(screen.getByText('Atenção')).toBeInTheDocument()
    })

    it('should handle zero income gracefully', () => {
      mockUseFinance.mockReturnValue({
        ...defaultFinanceHook,
        summary: { ...mockDefaultSummary, totalIncome: 0, netBalance: 0 },
      })
      renderFinance()
      expect(screen.queryByText(/Margem de/)).not.toBeInTheDocument()
    })
  })

  describe('trend display', () => {
    it('should show positive income trend', () => {
      renderFinance()
      expect(screen.getByText('+15%')).toBeInTheDocument()
    })

    it('should show negative expense trend', () => {
      renderFinance()
      expect(screen.getByText('-5%')).toBeInTheDocument()
    })

    it('should not show trend when undefined', () => {
      mockUseFinance.mockReturnValue({
        ...defaultFinanceHook,
        summary: { ...mockDefaultSummary, incomeTrend: undefined, expensesTrend: undefined },
      })
      renderFinance()
      expect(screen.queryByText('+15%')).not.toBeInTheDocument()
    })
  })
})
