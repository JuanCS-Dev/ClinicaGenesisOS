/**
 * Finance Hooks Test Setup
 *
 * Shared mock data for finance hook tests.
 */

import type { Transaction, FinancialSummary, MonthlyFinancialData } from '@/types';

export const mockTransaction: Transaction = {
  id: 'txn-123',
  clinicId: 'clinic-123',
  type: 'income',
  amount: 15000,
  description: 'Consulta médica',
  date: new Date().toISOString(),
  categoryId: 'cat-consulta',
  paymentMethod: 'pix',
  status: 'paid',
  patientId: 'patient-123',
  patientName: 'João Silva',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'user-123',
};

export const mockSummary: FinancialSummary = {
  totalIncome: 100000,
  totalExpenses: 30000,
  netBalance: 70000,
  transactionCount: 15,
  pendingCount: 3,
  pendingAmount: 5000,
};

export const mockMonthlyData: MonthlyFinancialData[] = [
  { month: 'Jan', income: 50000, expenses: 15000 },
  { month: 'Fev', income: 55000, expenses: 18000 },
  { month: 'Mar', income: 60000, expenses: 20000 },
];

/** Helper: Wait for hook to finish loading */
export const waitForLoaded = async (result: { current: { loading: boolean } }) => {
  const { waitFor } = await import('@testing-library/react');
  await waitFor(() => {
    if (result.current.loading) {
      throw new Error('Still loading');
    }
  });
};
