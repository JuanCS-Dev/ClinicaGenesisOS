/**
 * Finance Page Tests
 *
 * Comprehensive tests for the financial management dashboard.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    clinic: { id: 'clinic-123', name: 'Clínica Genesis' },
  })),
}));

const mockAddTransaction = vi.fn().mockResolvedValue('txn-new');
const mockUpdateTransaction = vi.fn();
const mockDeleteTransaction = vi.fn();

const mockDefaultTransactions = [
  {
    id: 'txn-1',
    type: 'income',
    amount: 35000,
    description: 'Consulta - Maria Santos',
    patientName: 'Maria Santos',
    date: new Date().toISOString(),
    status: 'paid',
    paymentMethod: 'pix',
    categoryId: 'consultation',
  },
  {
    id: 'txn-2',
    type: 'expense',
    amount: 15000,
    description: 'Material de escritório',
    date: new Date().toISOString(),
    status: 'paid',
    paymentMethod: 'cartao',
    categoryId: 'office',
  },
  {
    id: 'txn-3',
    type: 'income',
    amount: 50000,
    description: 'Exame - João Silva',
    patientName: 'João Silva',
    date: new Date().toISOString(),
    status: 'paid',
    paymentMethod: 'pix',
    categoryId: 'exam',
  },
];

const mockDefaultSummary = {
  totalIncome: 350000,
  totalExpenses: 150000,
  netBalance: 200000,
  pendingCount: 2,
  pendingAmount: 50000,
  incomeTrend: 15,
  expensesTrend: -5,
};

const mockDefaultMonthlyData = [
  { month: 'Jan', income: 300000, expenses: 120000 },
  { month: 'Fev', income: 350000, expenses: 150000 },
  { month: 'Mar', income: 400000, expenses: 160000 },
];

vi.mock('../../hooks/useFinance', () => ({
  useFinance: vi.fn(() => ({
    transactions: mockDefaultTransactions,
    loading: false,
    summary: mockDefaultSummary,
    monthlyData: mockDefaultMonthlyData,
    addTransaction: mockAddTransaction,
    updateTransaction: mockUpdateTransaction,
    deleteTransaction: mockDeleteTransaction,
  })),
}));

import { useFinance } from '../../hooks/useFinance';
const mockUseFinance = useFinance as ReturnType<typeof vi.fn>;

vi.mock('../../services/export.service', () => ({
  exportTransactionsToExcel: vi.fn().mockResolvedValue(undefined),
  exportTransactionsToPDF: vi.fn().mockResolvedValue(undefined),
}));

import { exportTransactionsToExcel, exportTransactionsToPDF } from '../../services/export.service';

// Mock recharts
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
}));

// Mock TransactionForm
vi.mock('../../components/finance', async () => {
  const actual = await vi.importActual('../../components/finance');
  return {
    ...actual,
    TransactionForm: ({ onClose, onSubmit, onGeneratePix }: { onClose: () => void; onSubmit: (data: unknown) => Promise<string>; onGeneratePix?: (id: string, amount: number, desc: string) => void }) => (
      <div data-testid="transaction-form">
        <button onClick={onClose}>Fechar</button>
        <button onClick={async () => {
          const id = await onSubmit({ description: 'Test', amount: 10000, type: 'income', categoryId: 'consultation' });
          if (onGeneratePix) onGeneratePix(id, 10000, 'Test');
        }}>Salvar com PIX</button>
        <button onClick={() => onSubmit({ description: 'Test', amount: 10000, type: 'income', categoryId: 'consultation' })}>Salvar</button>
      </div>
    ),
  };
});

// Mock DirectPixModal
vi.mock('../../components/payments', () => ({
  DirectPixModal: ({ onClose, onConfirmPayment, amountInCents, description }: { onClose: () => void; onConfirmPayment: () => void; amountInCents: number; description: string }) => (
    <div data-testid="pix-modal">
      <span data-testid="pix-amount">{amountInCents}</span>
      <span data-testid="pix-description">{description}</span>
      <button onClick={onClose}>Fechar PIX</button>
      <button onClick={onConfirmPayment}>Confirmar PIX</button>
    </div>
  ),
}));

import { Finance } from '../../pages/Finance';

const renderFinance = () => {
  return render(
    <MemoryRouter>
      <Finance />
    </MemoryRouter>
  );
};

describe('Finance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default mock
    mockUseFinance.mockReturnValue({
      transactions: mockDefaultTransactions,
      loading: false,
      summary: mockDefaultSummary,
      monthlyData: mockDefaultMonthlyData,
      addTransaction: mockAddTransaction,
      updateTransaction: mockUpdateTransaction,
      deleteTransaction: mockDeleteTransaction,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render page title', () => {
      renderFinance();
      expect(screen.getByText('Gestão Financeira')).toBeInTheDocument();
    });

    it('should render page subtitle', () => {
      renderFinance();
      expect(screen.getByText('Fluxo de caixa e demonstrações do mês atual.')).toBeInTheDocument();
    });

    it('should render finance summary cards', () => {
      renderFinance();
      expect(screen.getByText('Receita Total')).toBeInTheDocument();
      expect(screen.getByText('Despesas Operacionais')).toBeInTheDocument();
      expect(screen.getByText('Saldo Líquido')).toBeInTheDocument();
    });

    it('should display formatted currency values', () => {
      renderFinance();
      expect(screen.getByText('R$ 3.500,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 2.000,00')).toBeInTheDocument();
    });

    it('should display trend values', () => {
      renderFinance();
      expect(screen.getByText('+15%')).toBeInTheDocument();
      expect(screen.getByText('-5%')).toBeInTheDocument();
    });

    it('should render chart container', () => {
      renderFinance();
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should render chart title', () => {
      renderFinance();
      expect(screen.getByText('Fluxo de Caixa (Semestral)')).toBeInTheDocument();
    });

    it('should render transactions section', () => {
      renderFinance();
      expect(screen.getByText('Transações')).toBeInTheDocument();
    });

    it('should show transaction count', () => {
      renderFinance();
      expect(screen.getByText('3 total')).toBeInTheDocument();
    });

    it('should render add transaction button', () => {
      renderFinance();
      expect(screen.getByRole('button', { name: /Nova Transação/i })).toBeInTheDocument();
    });

    it('should render PIX button', () => {
      renderFinance();
      expect(screen.getByRole('button', { name: /PIX/i })).toBeInTheDocument();
    });

    it('should render export button', () => {
      renderFinance();
      expect(screen.getByRole('button', { name: /Exportar/i })).toBeInTheDocument();
    });

    it('should render filter button', () => {
      renderFinance();
      expect(screen.getByRole('button', { name: /Filtros/i })).toBeInTheDocument();
    });
  });

  describe('transaction list', () => {
    it('should display transaction descriptions', () => {
      renderFinance();
      expect(screen.getByText(/Maria Santos/)).toBeInTheDocument();
      expect(screen.getByText(/João Silva/)).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should have search input', () => {
      renderFinance();
      expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    });

    it('should filter transactions by search term', () => {
      renderFinance();
      const searchInput = screen.getByPlaceholderText('Buscar...');

      fireEvent.change(searchInput, { target: { value: 'Maria' } });

      expect(screen.getByText(/Maria Santos/)).toBeInTheDocument();
    });

    it('should show empty state when search has no results', () => {
      renderFinance();
      const searchInput = screen.getByPlaceholderText('Buscar...');

      fireEvent.change(searchInput, { target: { value: 'xyz123notfound' } });

      expect(screen.getByText('Nenhuma transação encontrada')).toBeInTheDocument();
    });

    it('should search by patient name', () => {
      renderFinance();
      const searchInput = screen.getByPlaceholderText('Buscar...');

      fireEvent.change(searchInput, { target: { value: 'João' } });

      expect(screen.getByText(/João Silva/)).toBeInTheDocument();
    });
  });

  describe('filter functionality', () => {
    it('should open filter menu on click', () => {
      renderFinance();
      const filterButton = screen.getByRole('button', { name: /Filtros/i });

      fireEvent.click(filterButton);

      expect(screen.getByText('Todas')).toBeInTheDocument();
      expect(screen.getByText('Receitas')).toBeInTheDocument();
      expect(screen.getByText('Despesas')).toBeInTheDocument();
    });

    it('should filter by income type', () => {
      renderFinance();
      fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
      fireEvent.click(screen.getByText('Receitas'));

      // Should show income transactions
      expect(screen.getByText(/Maria Santos/)).toBeInTheDocument();
    });

    it('should filter by expense type', () => {
      renderFinance();
      fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
      fireEvent.click(screen.getByText('Despesas'));

      // Should show expense transactions
      expect(screen.getByText(/Material de escritório/)).toBeInTheDocument();
    });

    it('should show active filter indicator', () => {
      renderFinance();
      fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
      fireEvent.click(screen.getByText('Receitas'));

      // Filter button should have active styling
      const filterButton = screen.getByRole('button', { name: /Filtros/i });
      expect(filterButton.className).toContain('bg-genesis-primary');
    });

    it('should reset filter to all', () => {
      renderFinance();
      // Set filter to income
      fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
      fireEvent.click(screen.getByText('Receitas'));

      // Reset to all
      fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
      fireEvent.click(screen.getByText('Todas'));

      // All transactions should be visible
      expect(screen.getByText(/Maria Santos/)).toBeInTheDocument();
    });
  });

  describe('export functionality', () => {
    it('should open export menu on click', () => {
      renderFinance();
      fireEvent.click(screen.getByRole('button', { name: /Exportar/i }));

      expect(screen.getByText('Exportar PDF')).toBeInTheDocument();
      expect(screen.getByText('Exportar Excel')).toBeInTheDocument();
    });

    it('should call PDF export on click', async () => {
      renderFinance();
      fireEvent.click(screen.getByRole('button', { name: /Exportar/i }));
      fireEvent.click(screen.getByText('Exportar PDF'));

      await waitFor(() => {
        expect(exportTransactionsToPDF).toHaveBeenCalled();
      });
    });

    it('should call Excel export on click', async () => {
      renderFinance();
      fireEvent.click(screen.getByRole('button', { name: /Exportar/i }));
      fireEvent.click(screen.getByText('Exportar Excel'));

      await waitFor(() => {
        expect(exportTransactionsToExcel).toHaveBeenCalled();
      });
    });

    it('should close export menu after selecting option', async () => {
      renderFinance();
      fireEvent.click(screen.getByRole('button', { name: /Exportar/i }));
      fireEvent.click(screen.getByText('Exportar PDF'));

      await waitFor(() => {
        expect(screen.queryByText('Exportar PDF')).not.toBeInTheDocument();
      });
    });
  });

  describe('transaction form modal', () => {
    it('should open form on add button click', () => {
      renderFinance();
      fireEvent.click(screen.getByRole('button', { name: /Nova Transação/i }));

      expect(screen.getByTestId('transaction-form')).toBeInTheDocument();
    });

    it('should close form on close button click', () => {
      renderFinance();
      fireEvent.click(screen.getByRole('button', { name: /Nova Transação/i }));
      fireEvent.click(screen.getByText('Fechar'));

      expect(screen.queryByTestId('transaction-form')).not.toBeInTheDocument();
    });

    it('should submit form and call addTransaction', async () => {
      renderFinance();
      fireEvent.click(screen.getByRole('button', { name: /Nova Transação/i }));
      fireEvent.click(screen.getByText('Salvar'));

      await waitFor(() => {
        expect(mockAddTransaction).toHaveBeenCalled();
      });
    });
  });

  describe('PIX modal', () => {
    it('should open PIX modal on PIX button click', () => {
      renderFinance();
      fireEvent.click(screen.getByRole('button', { name: /PIX/i }));

      expect(screen.getByTestId('pix-modal')).toBeInTheDocument();
    });

    it('should open PIX modal with empty data for new PIX', () => {
      renderFinance();
      fireEvent.click(screen.getByRole('button', { name: /PIX/i }));

      expect(screen.getByTestId('pix-amount')).toHaveTextContent('0');
    });

    it('should close PIX modal on close button', () => {
      renderFinance();
      fireEvent.click(screen.getByRole('button', { name: /PIX/i }));
      fireEvent.click(screen.getByText('Fechar PIX'));

      expect(screen.queryByTestId('pix-modal')).not.toBeInTheDocument();
    });

    it('should close PIX modal on confirm', () => {
      renderFinance();
      fireEvent.click(screen.getByRole('button', { name: /PIX/i }));
      fireEvent.click(screen.getByText('Confirmar PIX'));

      expect(screen.queryByTestId('pix-modal')).not.toBeInTheDocument();
    });

    it('should open PIX modal with data from form', async () => {
      renderFinance();
      fireEvent.click(screen.getByRole('button', { name: /Nova Transação/i }));
      fireEvent.click(screen.getByText('Salvar com PIX'));

      await waitFor(() => {
        expect(screen.getByTestId('pix-modal')).toBeInTheDocument();
        expect(screen.getByTestId('pix-amount')).toHaveTextContent('10000');
        expect(screen.getByTestId('pix-description')).toHaveTextContent('Test');
      });
    });
  });

  describe('loading state', () => {
    beforeEach(() => {
      mockUseFinance.mockReturnValue({
        transactions: [],
        loading: true,
        summary: null,
        monthlyData: [],
        addTransaction: mockAddTransaction,
        updateTransaction: mockUpdateTransaction,
        deleteTransaction: mockDeleteTransaction,
      });
    });

    it('should show loading spinner in transactions list', () => {
      renderFinance();
      const loader = document.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });

    it('should show loading in chart area', () => {
      renderFinance();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    beforeEach(() => {
      mockUseFinance.mockReturnValue({
        transactions: [],
        loading: false,
        summary: mockDefaultSummary,
        monthlyData: [],
        addTransaction: mockAddTransaction,
        updateTransaction: mockUpdateTransaction,
        deleteTransaction: mockDeleteTransaction,
      });
    });

    it('should show empty state message', () => {
      renderFinance();
      expect(screen.getByText('Nenhuma transação encontrada')).toBeInTheDocument();
    });

    it('should show add button in empty state', () => {
      renderFinance();
      expect(screen.getByText('Adicionar primeira transação')).toBeInTheDocument();
    });

    it('should open form when clicking add in empty state', () => {
      renderFinance();
      fireEvent.click(screen.getByText('Adicionar primeira transação'));

      expect(screen.getByTestId('transaction-form')).toBeInTheDocument();
    });

    it('should show no chart data message', () => {
      renderFinance();
      expect(screen.getByText('Nenhum dado disponível')).toBeInTheDocument();
    });
  });

  describe('margin calculation', () => {
    it('should calculate healthy margin', () => {
      mockUseFinance.mockReturnValue({
        transactions: mockDefaultTransactions,
        loading: false,
        summary: {
          ...mockDefaultSummary,
          totalIncome: 100000,
          netBalance: 60000, // 60% margin
        },
        monthlyData: mockDefaultMonthlyData,
        addTransaction: mockAddTransaction,
        updateTransaction: mockUpdateTransaction,
        deleteTransaction: mockDeleteTransaction,
      });

      renderFinance();
      expect(screen.getByText('Margem de 60%')).toBeInTheDocument();
      expect(screen.getByText('Saudável')).toBeInTheDocument();
    });

    it('should show attention for moderate margin', () => {
      mockUseFinance.mockReturnValue({
        transactions: mockDefaultTransactions,
        loading: false,
        summary: {
          ...mockDefaultSummary,
          totalIncome: 100000,
          netBalance: 30000, // 30% margin
        },
        monthlyData: mockDefaultMonthlyData,
        addTransaction: mockAddTransaction,
        updateTransaction: mockUpdateTransaction,
        deleteTransaction: mockDeleteTransaction,
      });

      renderFinance();
      expect(screen.getByText('Margem de 30%')).toBeInTheDocument();
      expect(screen.getByText('Atenção')).toBeInTheDocument();
    });

    it('should handle zero income gracefully', () => {
      mockUseFinance.mockReturnValue({
        transactions: mockDefaultTransactions,
        loading: false,
        summary: {
          ...mockDefaultSummary,
          totalIncome: 0,
          netBalance: 0,
        },
        monthlyData: mockDefaultMonthlyData,
        addTransaction: mockAddTransaction,
        updateTransaction: mockUpdateTransaction,
        deleteTransaction: mockDeleteTransaction,
      });

      renderFinance();
      // Should not crash and not show margin text
      expect(screen.queryByText(/Margem de/)).not.toBeInTheDocument();
    });
  });

  describe('trend display', () => {
    it('should show positive income trend', () => {
      renderFinance();
      expect(screen.getByText('+15%')).toBeInTheDocument();
    });

    it('should show negative expense trend', () => {
      renderFinance();
      expect(screen.getByText('-5%')).toBeInTheDocument();
    });

    it('should not show trend when undefined', () => {
      mockUseFinance.mockReturnValue({
        transactions: mockDefaultTransactions,
        loading: false,
        summary: {
          ...mockDefaultSummary,
          incomeTrend: undefined,
          expensesTrend: undefined,
        },
        monthlyData: mockDefaultMonthlyData,
        addTransaction: mockAddTransaction,
        updateTransaction: mockUpdateTransaction,
        deleteTransaction: mockDeleteTransaction,
      });

      renderFinance();
      expect(screen.queryByText('+15%')).not.toBeInTheDocument();
    });
  });
});
