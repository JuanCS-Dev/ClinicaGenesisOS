/**
 * Finance Module Types
 * ====================
 *
 * Types for the financial management system.
 * Fase 4: Financeiro & Relatórios
 */

/**
 * Transaction type (income or expense).
 */
export type TransactionType = 'income' | 'expense';

/**
 * Payment method.
 */
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer' | 'boleto';

/**
 * Transaction status.
 */
export type TransactionStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

/**
 * Transaction category.
 */
export interface TransactionCategory {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon?: string;
}

/**
 * Default transaction categories.
 */
export const DEFAULT_CATEGORIES: TransactionCategory[] = [
  // Income categories
  { id: 'consultation', name: 'Consultas', type: 'income', color: '#22C55E' },
  { id: 'procedure', name: 'Procedimentos', type: 'income', color: '#3B82F6' },
  { id: 'exam', name: 'Exames', type: 'income', color: '#8B5CF6' },
  { id: 'product', name: 'Produtos', type: 'income', color: '#F59E0B' },
  { id: 'other_income', name: 'Outras Receitas', type: 'income', color: '#6B7280' },
  // Expense categories
  { id: 'rent', name: 'Aluguel', type: 'expense', color: '#EF4444' },
  { id: 'salary', name: 'Salários', type: 'expense', color: '#F97316' },
  { id: 'supplies', name: 'Materiais', type: 'expense', color: '#EC4899' },
  { id: 'utilities', name: 'Utilidades', type: 'expense', color: '#14B8A6' },
  { id: 'marketing', name: 'Marketing', type: 'expense', color: '#A855F7' },
  { id: 'taxes', name: 'Impostos', type: 'expense', color: '#78716C' },
  { id: 'other_expense', name: 'Outras Despesas', type: 'expense', color: '#6B7280' },
];

/**
 * Financial transaction.
 */
export interface Transaction {
  id: string;
  /** Transaction description */
  description: string;
  /** Amount in cents (to avoid floating point issues) */
  amount: number;
  /** Transaction type */
  type: TransactionType;
  /** Category ID */
  categoryId: string;
  /** Payment method */
  paymentMethod: PaymentMethod;
  /** Transaction status */
  status: TransactionStatus;
  /** Transaction date (ISO string) */
  date: string;
  /** Due date for pending transactions */
  dueDate?: string;
  /** Payment date (when actually paid) */
  paidAt?: string;
  /** Related patient ID (for income from consultations) */
  patientId?: string;
  /** Related patient name (denormalized) */
  patientName?: string;
  /** Related appointment ID */
  appointmentId?: string;
  /** Notes */
  notes?: string;
  /** Created timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt?: string;
  /** Created by user ID */
  createdBy: string;
}

/**
 * Input for creating a transaction.
 */
export interface CreateTransactionInput {
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  paymentMethod: PaymentMethod;
  status?: TransactionStatus;
  date: string;
  dueDate?: string;
  patientId?: string;
  patientName?: string;
  appointmentId?: string;
  notes?: string;
}

/**
 * Financial summary for a period.
 */
export interface FinancialSummary {
  /** Total income in cents */
  totalIncome: number;
  /** Total expenses in cents */
  totalExpenses: number;
  /** Net balance (income - expenses) in cents */
  netBalance: number;
  /** Number of transactions */
  transactionCount: number;
  /** Income by category */
  incomeByCategory: Record<string, number>;
  /** Expenses by category */
  expensesByCategory: Record<string, number>;
  /** Income trend vs previous period (percentage) */
  incomeTrend?: number;
  /** Expenses trend vs previous period (percentage) */
  expensesTrend?: number;
}

/**
 * Monthly financial data for charts.
 */
export interface MonthlyFinancialData {
  month: string;
  year: number;
  income: number;
  expenses: number;
}

/**
 * Date range filter.
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Transaction filters.
 */
export interface TransactionFilters {
  dateRange?: DateRange;
  type?: TransactionType;
  categoryId?: string;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  searchTerm?: string;
}

/**
 * Payment method labels in Portuguese.
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  cash: 'Dinheiro',
  bank_transfer: 'Transferência',
  boleto: 'Boleto',
};

/**
 * Transaction status labels in Portuguese.
 */
export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  cancelled: 'Cancelado',
  refunded: 'Estornado',
};

/**
 * Helper to format amount from cents to currency string.
 */
export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amountInCents / 100);
}

/**
 * Helper to parse currency string to cents.
 */
export function parseCurrencyToCents(value: string): number {
  // Remove currency symbol and spaces
  const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
  return Math.round(parseFloat(cleaned) * 100);
}
