/**
 * useCreatePixPayment Hook Tests
 *
 * Tests for PIX payment creation.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { PaymentIntentResponse } from '@/types';

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

import { useCreatePixPayment } from '@/hooks/usePayment';
import { stripeService } from '@/services/stripe.service';
import { useClinicContext } from '@/contexts/ClinicContext';
import { mockPaymentIntent } from './setup';

describe('useCreatePixPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClinicContext).mockReturnValue({
      clinic: { id: 'clinic-123' },
    } as ReturnType<typeof useClinicContext>);

    vi.mocked(stripeService.createPixPayment).mockResolvedValue(mockPaymentIntent);
  });

  describe('initial state', () => {
    it('should start with creating false', () => {
      const { result } = renderHook(() => useCreatePixPayment());
      expect(result.current.creating).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.paymentIntent).toBe(null);
      expect(result.current.paymentId).toBe(null);
    });
  });

  describe('createPayment', () => {
    it('should create PIX payment successfully', async () => {
      const { result } = renderHook(() => useCreatePixPayment());

      let paymentResult: PaymentIntentResponse | undefined;
      await act(async () => {
        paymentResult = await result.current.createPayment({
          amount: 15000,
          description: 'Consulta médica',
        });
      });

      expect(stripeService.createPixPayment).toHaveBeenCalledWith('clinic-123', {
        amount: 15000,
        description: 'Consulta médica',
      });
      expect(paymentResult?.pix?.qrCode).toBe('pix-qr-code');
      expect(result.current.paymentIntent).toEqual(mockPaymentIntent);
      expect(result.current.paymentId).toBe('pi_123');
    });

    it('should handle creation error', async () => {
      vi.mocked(stripeService.createPixPayment).mockRejectedValue(
        new Error('Payment creation failed')
      );

      const { result } = renderHook(() => useCreatePixPayment());

      await act(async () => {
        try {
          await result.current.createPayment({
            amount: 15000,
            description: 'Consulta',
          });
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Payment creation failed');
      });
      expect(result.current.creating).toBe(false);
    });

    it('should throw error when clinic not found', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinic: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useCreatePixPayment());

      await expect(
        act(async () => {
          await result.current.createPayment({
            amount: 15000,
            description: 'Consulta',
          });
        })
      ).rejects.toThrow('Clinic not found');
    });
  });

  describe('reset', () => {
    it('should reset state', async () => {
      const { result } = renderHook(() => useCreatePixPayment());

      await act(async () => {
        await result.current.createPayment({
          amount: 15000,
          description: 'Consulta',
        });
      });

      expect(result.current.paymentIntent).not.toBe(null);

      act(() => {
        result.current.reset();
      });

      expect(result.current.creating).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.paymentIntent).toBe(null);
      expect(result.current.paymentId).toBe(null);
    });
  });
});
