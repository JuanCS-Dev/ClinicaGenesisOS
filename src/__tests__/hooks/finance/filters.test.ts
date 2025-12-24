/**
 * useFinance Hook Filters Tests
 *
 * Tests for initial state, filters, error handling.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { Transaction } from '@/types';

// Mock dependencies
vi.mock('@/contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    userProfile: { id: 'user-123', name: 'Dr. João' },
  })),
}));

vi.mock('@/services/firestore', () => ({
  transactionService: {
    subscribe: vi.fn(),
    getSummary: vi.fn(),
    getMonthlyData: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    markAsPaid: vi.fn(),
    getAll: vi.fn(),
  },
}));

import { useFinance } from '@/hooks/useFinance';
import { transactionService } from '@/services/firestore';
import { useClinicContext } from '@/contexts/ClinicContext';
import { mockTransaction, mockSummary, mockMonthlyData, waitForLoaded } from './setup';

describe('useFinance - Filters & Initial State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: 'clinic-123',
      userProfile: { id: 'user-123', name: 'Dr. João' },
    } as unknown as ReturnType<typeof useClinicContext>);

    vi.mocked(transactionService.subscribe).mockImplementation(
      (_clinicId, onData) => {
        setTimeout(() => onData([mockTransaction]), 0);
        return vi.fn();
      }
    );

    vi.mocked(transactionService.getSummary).mockResolvedValue(mockSummary);
    vi.mocked(transactionService.getMonthlyData).mockResolvedValue(mockMonthlyData);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with loading true', () => {
      const { result } = renderHook(() => useFinance());
      expect(result.current.loading).toBe(true);
      expect(result.current.transactions).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it('should load transactions on mount', async () => {
      const { result } = renderHook(() => useFinance());
      await waitForLoaded(result);
      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0].id).toBe('txn-123');
    });

    it('should load summary and monthly data', async () => {
      const { result } = renderHook(() => useFinance());
      await waitForLoaded(result);

      await waitFor(() => expect(result.current.summary).not.toBe(null));
      expect(result.current.summary?.totalIncome).toBe(100000);
      expect(result.current.monthlyData).toHaveLength(3);
    });

    it('should have default date range for current month', async () => {
      const { result } = renderHook(() => useFinance());
      await waitForLoaded(result);

      expect(result.current.filters.dateRange).toBeDefined();
      expect(result.current.filters.dateRange?.startDate).toBeDefined();
      expect(result.current.filters.dateRange?.endDate).toBeDefined();
    });
  });

  describe('when clinic is not set', () => {
    it('should not subscribe to transactions', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      renderHook(() => useFinance());

      expect(transactionService.subscribe).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle subscription errors', async () => {
      vi.mocked(transactionService.subscribe).mockImplementation(
        (_clinicId, _onData, onError) => {
          setTimeout(() => onError(new Error('Connection failed')), 0);
          return vi.fn();
        }
      );

      const { result } = renderHook(() => useFinance());

      await waitFor(() => expect(result.current.error).not.toBe(null));
      expect(result.current.error?.message).toBe('Connection failed');
    });

    it('should handle summary/monthly data errors', async () => {
      vi.mocked(transactionService.getSummary).mockRejectedValue(
        new Error('Summary failed')
      );

      const { result } = renderHook(() => useFinance());

      await waitForLoaded(result);
      await waitFor(() => expect(result.current.error).not.toBe(null));
    });
  });

  describe('filters', () => {
    it('should filter transactions by type', async () => {
      const transactions: Transaction[] = [
        { ...mockTransaction, id: 'txn-1', type: 'income' },
        { ...mockTransaction, id: 'txn-2', type: 'expense' },
      ];

      vi.mocked(transactionService.subscribe).mockImplementation(
        (_clinicId, onData) => {
          setTimeout(() => onData(transactions), 0);
          return vi.fn();
        }
      );

      const { result } = renderHook(() => useFinance());
      await waitForLoaded(result);

      act(() => {
        result.current.setFilters({ ...result.current.filters, type: 'income' });
      });

      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0].type).toBe('income');
    });

    it('should filter transactions by category', async () => {
      const transactions: Transaction[] = [
        { ...mockTransaction, id: 'txn-1', categoryId: 'cat-1' },
        { ...mockTransaction, id: 'txn-2', categoryId: 'cat-2' },
      ];

      vi.mocked(transactionService.subscribe).mockImplementation(
        (_clinicId, onData) => {
          setTimeout(() => onData(transactions), 0);
          return vi.fn();
        }
      );

      const { result } = renderHook(() => useFinance());
      await waitForLoaded(result);

      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          categoryId: 'cat-1',
        });
      });

      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0].categoryId).toBe('cat-1');
    });

    it('should filter transactions by status', async () => {
      const transactions: Transaction[] = [
        { ...mockTransaction, id: 'txn-1', status: 'paid' },
        { ...mockTransaction, id: 'txn-2', status: 'pending' },
      ];

      vi.mocked(transactionService.subscribe).mockImplementation(
        (_clinicId, onData) => {
          setTimeout(() => onData(transactions), 0);
          return vi.fn();
        }
      );

      const { result } = renderHook(() => useFinance());
      await waitForLoaded(result);

      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          status: 'pending',
        });
      });

      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0].status).toBe('pending');
    });

    it('should filter transactions by search term', async () => {
      const transactions: Transaction[] = [
        { ...mockTransaction, id: 'txn-1', description: 'Consulta médica' },
        { ...mockTransaction, id: 'txn-2', description: 'Exame de sangue' },
      ];

      vi.mocked(transactionService.subscribe).mockImplementation(
        (_clinicId, onData) => {
          setTimeout(() => onData(transactions), 0);
          return vi.fn();
        }
      );

      const { result } = renderHook(() => useFinance());
      await waitForLoaded(result);

      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          searchTerm: 'exame',
        });
      });

      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0].description).toBe('Exame de sangue');
    });

    it('should filter by patient name in search term', async () => {
      const transactions: Transaction[] = [
        { ...mockTransaction, id: 'txn-1', patientName: 'João Silva' },
        { ...mockTransaction, id: 'txn-2', patientName: 'Maria Santos' },
      ];

      vi.mocked(transactionService.subscribe).mockImplementation(
        (_clinicId, onData) => {
          setTimeout(() => onData(transactions), 0);
          return vi.fn();
        }
      );

      const { result } = renderHook(() => useFinance());
      await waitForLoaded(result);

      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          searchTerm: 'maria',
        });
      });

      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0].patientName).toBe('Maria Santos');
    });

    it('should filter by date range', async () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);

      const transactions: Transaction[] = [
        { ...mockTransaction, id: 'txn-1', date: now.toISOString() },
        { ...mockTransaction, id: 'txn-2', date: lastMonth.toISOString() },
        { ...mockTransaction, id: 'txn-3', date: nextMonth.toISOString() },
      ];

      vi.mocked(transactionService.subscribe).mockImplementation(
        (_clinicId, onData) => {
          setTimeout(() => onData(transactions), 0);
          return vi.fn();
        }
      );

      const { result } = renderHook(() => useFinance());
      await waitForLoaded(result);

      // Current month filter should only show current month transaction
      expect(result.current.transactions.length).toBeLessThanOrEqual(1);
    });
  });
});
