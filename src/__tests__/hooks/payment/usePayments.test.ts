/**
 * usePayments Hook Tests
 *
 * Tests for listing and filtering payments.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock dependencies
vi.mock('@/contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinic: { id: 'clinic-123' },
  })),
}));

vi.mock('@/services/stripe.service', () => ({
  stripeService: {
    subscribe: vi.fn(),
    subscribeToPayment: vi.fn(),
    getSummary: vi.fn(),
    getPayments: vi.fn(),
    createPixPayment: vi.fn(),
    cancelPayment: vi.fn(),
    refundPayment: vi.fn(),
    getPendingPaymentsForPatient: vi.fn(),
  },
}));

import { usePayments } from '@/hooks/usePayment';
import { stripeService } from '@/services/stripe.service';
import { useClinicContext } from '@/contexts/ClinicContext';
import { mockPayment, mockSummary, waitForLoaded } from './setup';

describe('usePayments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClinicContext).mockReturnValue({
      clinic: { id: 'clinic-123' },
    } as ReturnType<typeof useClinicContext>);

    vi.mocked(stripeService.subscribe).mockImplementation(
      (_clinicId, onData) => {
        setTimeout(() => onData([mockPayment]), 0);
        return vi.fn();
      }
    );

    vi.mocked(stripeService.getSummary).mockResolvedValue(mockSummary);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with loading true', () => {
      const { result } = renderHook(() => usePayments());
      expect(result.current.loading).toBe(true);
      expect(result.current.payments).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it('should load payments on mount', async () => {
      const { result } = renderHook(() => usePayments());
      await waitForLoaded(result);
      expect(result.current.payments).toHaveLength(1);
      expect(result.current.payments[0].id).toBe('payment-123');
    });

    it('should load summary', async () => {
      const { result } = renderHook(() => usePayments());
      await waitForLoaded(result);
      await waitFor(() => expect(result.current.summary).not.toBe(null));
      expect(result.current.summary?.totalReceived).toBe(50000);
    });
  });

  describe('when clinic is not set', () => {
    it('should set loading false and empty payments', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinic: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => usePayments());
      await waitForLoaded(result);
      expect(result.current.payments).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle subscription errors', async () => {
      vi.mocked(stripeService.subscribe).mockImplementation(
        (_clinicId, _onData, onError) => {
          setTimeout(() => onError(new Error('Connection failed')), 0);
          return vi.fn();
        }
      );

      const { result } = renderHook(() => usePayments());
      await waitForLoaded(result);
      expect(result.current.error).toBe('Connection failed');
    });
  });

  describe('refresh', () => {
    it('should refresh payments', async () => {
      vi.mocked(stripeService.getPayments).mockResolvedValue([mockPayment]);

      const { result } = renderHook(() => usePayments());
      await waitForLoaded(result);

      await act(async () => {
        await result.current.refresh();
      });

      expect(stripeService.getPayments).toHaveBeenCalledWith('clinic-123', {
        status: undefined,
      });
    });
  });

  describe('filterByStatus', () => {
    it('should filter payments by status', async () => {
      const { result } = renderHook(() => usePayments());
      await waitForLoaded(result);

      act(() => {
        result.current.filterByStatus('succeeded');
      });

      expect(stripeService.subscribe).toHaveBeenCalled();
    });
  });
});
