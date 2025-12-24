/**
 * useFinance Hook Operations Tests
 *
 * Tests for addTransaction, updateTransaction, deleteTransaction, markAsPaid, refresh, cleanup.
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

describe('useFinance - Operations', () => {
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

  describe('addTransaction', () => {
    it('should create a new transaction', async () => {
      vi.mocked(transactionService.create).mockResolvedValue('new-txn-id');

      const { result } = renderHook(() => useFinance());
      await waitForLoaded(result);

      let newId: string | undefined;
      await act(async () => {
        newId = await result.current.addTransaction({
          type: 'income',
          amount: 20000,
          description: 'Nova consulta',
          date: new Date().toISOString(),
          categoryId: 'cat-1',
          paymentMethod: 'pix',
          status: 'pending',
        });
      });

      expect(transactionService.create).toHaveBeenCalledWith(
        'clinic-123',
        expect.objectContaining({
          type: 'income',
          amount: 20000,
        }),
        'user-123'
      );
      expect(newId).toBe('new-txn-id');
    });

    it('should throw error when no clinic selected', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useFinance());

      await expect(
        act(async () => {
          await result.current.addTransaction({
            type: 'income',
            amount: 20000,
            description: 'Nova consulta',
            date: new Date().toISOString(),
            categoryId: 'cat-1',
            paymentMethod: 'pix',
            status: 'pending',
          });
        })
      ).rejects.toThrow('No clinic or user selected');
    });
  });

  describe('updateTransaction', () => {
    it('should update an existing transaction', async () => {
      vi.mocked(transactionService.update).mockResolvedValue(undefined);

      const { result } = renderHook(() => useFinance());
      await waitForLoaded(result);

      await act(async () => {
        await result.current.updateTransaction('txn-123', {
          amount: 25000,
          description: 'Updated description',
        });
      });

      expect(transactionService.update).toHaveBeenCalledWith(
        'clinic-123',
        'txn-123',
        { amount: 25000, description: 'Updated description' }
      );
    });

    it('should throw error when no clinic selected', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useFinance());

      await expect(
        act(async () => {
          await result.current.updateTransaction('txn-123', { amount: 25000 });
        })
      ).rejects.toThrow('No clinic selected');
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction', async () => {
      vi.mocked(transactionService.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useFinance());
      await waitForLoaded(result);

      await act(async () => {
        await result.current.deleteTransaction('txn-123');
      });

      expect(transactionService.delete).toHaveBeenCalledWith('clinic-123', 'txn-123');
    });

    it('should throw error when no clinic selected', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useFinance());

      await expect(
        act(async () => {
          await result.current.deleteTransaction('txn-123');
        })
      ).rejects.toThrow('No clinic selected');
    });
  });

  describe('markAsPaid', () => {
    it('should mark transaction as paid', async () => {
      vi.mocked(transactionService.markAsPaid).mockResolvedValue(undefined);

      const { result } = renderHook(() => useFinance());
      await waitForLoaded(result);

      await act(async () => {
        await result.current.markAsPaid('txn-123');
      });

      expect(transactionService.markAsPaid).toHaveBeenCalledWith('clinic-123', 'txn-123');
    });

    it('should throw error when no clinic selected', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useFinance());

      await expect(
        act(async () => {
          await result.current.markAsPaid('txn-123');
        })
      ).rejects.toThrow('No clinic selected');
    });
  });

  describe('refresh', () => {
    it('should refresh transactions', async () => {
      vi.mocked(transactionService.getAll).mockResolvedValue([mockTransaction]);

      const { result } = renderHook(() => useFinance());
      await waitForLoaded(result);

      await act(async () => {
        await result.current.refresh();
      });

      expect(transactionService.getAll).toHaveBeenCalledWith('clinic-123', expect.any(Object));
    });

    it('should not refresh when no clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useFinance());

      await act(async () => {
        await result.current.refresh();
      });

      expect(transactionService.getAll).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe on unmount', async () => {
      const unsubscribeMock = vi.fn();
      vi.mocked(transactionService.subscribe).mockImplementation(
        (_clinicId, onData) => {
          setTimeout(() => onData([mockTransaction]), 0);
          return unsubscribeMock;
        }
      );

      const { unmount } = renderHook(() => useFinance());

      await waitFor(() => {
        // Wait for initial load
      });

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
});
