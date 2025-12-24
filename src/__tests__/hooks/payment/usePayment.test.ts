/**
 * usePayment Hook Tests
 *
 * Tests for single payment management.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { Payment } from '@/types';

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

import { usePayment } from '@/hooks/usePayment';
import { stripeService } from '@/services/stripe.service';
import { useClinicContext } from '@/contexts/ClinicContext';
import { mockPayment } from './setup';

describe('usePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(useClinicContext).mockReturnValue({
      clinic: { id: 'clinic-123' },
    } as ReturnType<typeof useClinicContext>);

    vi.mocked(stripeService.subscribeToPayment).mockImplementation(
      (_clinicId, _paymentId, onData) => {
        setTimeout(() => onData(mockPayment), 0);
        return vi.fn();
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with loading true', () => {
      const { result } = renderHook(() => usePayment('payment-123'));
      expect(result.current.loading).toBe(true);
      expect(result.current.payment).toBe(null);
    });

    it('should load payment on mount', async () => {
      const { result } = renderHook(() => usePayment('payment-123'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      await waitFor(() => expect(result.current.payment).not.toBe(null));
      expect(result.current.payment?.id).toBe('payment-123');
    });
  });

  describe('when paymentId is null', () => {
    it('should set loading false and null payment', async () => {
      const { result } = renderHook(() => usePayment(null));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.payment).toBe(null);
    });
  });

  describe('time remaining', () => {
    it('should calculate time remaining for awaiting payment', async () => {
      const { result } = renderHook(() => usePayment('payment-123'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      await waitFor(() => expect(result.current.timeRemaining).not.toBe(null));
      expect(result.current.timeRemaining?.minutes).toBeGreaterThanOrEqual(0);
      expect(result.current.isExpired).toBe(false);
    });

    it('should mark as expired when time runs out', async () => {
      const expiredPayment: Payment = {
        ...mockPayment,
        pixData: {
          ...mockPayment.pixData!,
          expiresAt: new Date(Date.now() - 1000).toISOString(),
        },
      };

      vi.mocked(stripeService.subscribeToPayment).mockImplementation(
        (_clinicId, _paymentId, onData) => {
          setTimeout(() => onData(expiredPayment), 0);
          return vi.fn();
        }
      );

      const { result } = renderHook(() => usePayment('payment-123'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      await waitFor(() => expect(result.current.isExpired).toBe(true));
    });
  });

  describe('cancel', () => {
    it('should cancel payment', async () => {
      vi.mocked(stripeService.cancelPayment).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePayment('payment-123'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      await act(async () => {
        await result.current.cancel();
      });

      expect(stripeService.cancelPayment).toHaveBeenCalledWith('clinic-123', 'payment-123');
    });

    it('should handle cancel error', async () => {
      vi.mocked(stripeService.cancelPayment).mockRejectedValue(new Error('Cannot cancel'));

      const { result } = renderHook(() => usePayment('payment-123'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      await act(async () => {
        try {
          await result.current.cancel();
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Cannot cancel');
      });
    });
  });

  describe('refund', () => {
    it('should refund payment', async () => {
      vi.mocked(stripeService.refundPayment).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePayment('payment-123'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      await act(async () => {
        await result.current.refund(5000);
      });

      expect(stripeService.refundPayment).toHaveBeenCalledWith('clinic-123', 'payment-123', 5000);
    });

    it('should handle refund error', async () => {
      vi.mocked(stripeService.refundPayment).mockRejectedValue(new Error('Refund failed'));

      const { result } = renderHook(() => usePayment('payment-123'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      await act(async () => {
        try {
          await result.current.refund();
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Refund failed');
      });
    });
  });
});
