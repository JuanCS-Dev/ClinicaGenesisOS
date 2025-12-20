/**
 * useFinance Hook
 *
 * Provides real-time access to financial transactions.
 * Includes CRUD operations, summaries, and chart data.
 *
 * Fase 4: Financeiro & Relatórios
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useClinicContext } from '../contexts/ClinicContext';
import { transactionService } from '../services/firestore';
import type {
  Transaction,
  CreateTransactionInput,
  TransactionFilters,
  FinancialSummary,
  MonthlyFinancialData,
  DateRange,
} from '@/types';

/**
 * Return type for useFinance hook.
 */
export interface UseFinanceReturn {
  /** Array of transactions */
  transactions: Transaction[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Financial summary for the current period */
  summary: FinancialSummary | null;
  /** Monthly data for charts */
  monthlyData: MonthlyFinancialData[];
  /** Current filters */
  filters: TransactionFilters;
  /** Set filters */
  setFilters: (filters: TransactionFilters) => void;
  /** Create a new transaction */
  addTransaction: (data: CreateTransactionInput) => Promise<string>;
  /** Update an existing transaction */
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  /** Delete a transaction */
  deleteTransaction: (id: string) => Promise<void>;
  /** Mark transaction as paid */
  markAsPaid: (id: string) => Promise<void>;
  /** Refresh data */
  refresh: () => Promise<void>;
}

/**
 * Get date range for current month.
 */
function getCurrentMonthRange(): DateRange {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

/**
 * Hook for managing financial transactions with real-time updates.
 */
export function useFinance(): UseFinanceReturn {
  const { clinicId, userProfile } = useClinicContext();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyFinancialData[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({
    dateRange: getCurrentMonthRange(),
  });
  const [error, setError] = useState<Error | null>(null);
  const [hasReceived, setHasReceived] = useState(false);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!clinicId) {
      return;
    }

    let isActive = true;

    const unsubscribe = transactionService.subscribe(
      clinicId,
      (data) => {
        if (isActive) {
          setTransactions(data);
          setHasReceived(true);
          setError(null);
        }
      },
      (err) => {
        if (isActive) {
          setError(err);
        }
      }
    );

    return () => {
      isActive = false;
      setHasReceived(false);
      unsubscribe();
    };
  }, [clinicId]);

  // Load summary and monthly data
  useEffect(() => {
    if (!clinicId || !filters.dateRange) {
      return;
    }

    let isActive = true;

    const loadData = async () => {
      try {
        const [summaryData, monthlyChartData] = await Promise.all([
          transactionService.getSummary(
            clinicId,
            filters.dateRange!.startDate,
            filters.dateRange!.endDate
          ),
          transactionService.getMonthlyData(clinicId, 6),
        ]);

        if (isActive) {
          setSummary(summaryData);
          setMonthlyData(monthlyChartData);
        }
      } catch (err) {
        if (isActive) {
          setError(err as Error);
        }
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, [clinicId, filters.dateRange, transactions]);

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    if (filters.dateRange) {
      result = result.filter((t) => {
        const date = new Date(t.date);
        const start = new Date(filters.dateRange!.startDate);
        const end = new Date(filters.dateRange!.endDate);
        return date >= start && date <= end;
      });
    }

    if (filters.type) {
      result = result.filter((t) => t.type === filters.type);
    }

    if (filters.categoryId) {
      result = result.filter((t) => t.categoryId === filters.categoryId);
    }

    if (filters.status) {
      result = result.filter((t) => t.status === filters.status);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(term) ||
          t.patientName?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [transactions, filters]);

  // Derive loading state
  const effectiveLoading = clinicId ? !hasReceived : false;

  /**
   * Create a new transaction.
   */
  const addTransaction = useCallback(
    async (data: CreateTransactionInput): Promise<string> => {
      if (!clinicId || !userProfile) {
        throw new Error('No clinic or user selected');
      }
      return transactionService.create(clinicId, data, userProfile.id);
    },
    [clinicId, userProfile]
  );

  /**
   * Update an existing transaction.
   */
  const updateTransaction = useCallback(
    async (id: string, data: Partial<Transaction>): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      await transactionService.update(clinicId, id, data);
    },
    [clinicId]
  );

  /**
   * Delete a transaction.
   */
  const deleteTransaction = useCallback(
    async (id: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      await transactionService.delete(clinicId, id);
    },
    [clinicId]
  );

  /**
   * Mark transaction as paid.
   */
  const markAsPaid = useCallback(
    async (id: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      await transactionService.markAsPaid(clinicId, id);
    },
    [clinicId]
  );

  /**
   * Refresh data.
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (!clinicId) {
      return;
    }
    const data = await transactionService.getAll(clinicId, filters);
    setTransactions(data);
  }, [clinicId, filters]);

  return {
    transactions: filteredTransactions,
    loading: effectiveLoading,
    error,
    summary,
    monthlyData,
    filters,
    setFilters,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    markAsPaid,
    refresh,
  };
}

export default useFinance;
