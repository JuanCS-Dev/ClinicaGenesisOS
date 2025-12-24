/**
 * usePatientPendingPayments Hook Tests
 *
 * Tests for loading patient pending payments.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

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

import { usePatientPendingPayments } from '@/hooks/usePayment';
import { stripeService } from '@/services/stripe.service';
import { useClinicContext } from '@/contexts/ClinicContext';
import { mockPayment } from './setup';

describe('usePatientPendingPayments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClinicContext).mockReturnValue({
      clinic: { id: 'clinic-123' },
    } as ReturnType<typeof useClinicContext>);

    vi.mocked(stripeService.getPendingPaymentsForPatient).mockResolvedValue([mockPayment]);
  });

  describe('initial state', () => {
    it('should start with loading true', () => {
      const { result } = renderHook(() => usePatientPendingPayments('patient-123'));
      expect(result.current.loading).toBe(true);
      expect(result.current.payments).toEqual([]);
    });
  });

  describe('loading payments', () => {
    it('should load pending payments for patient', async () => {
      const { result } = renderHook(() => usePatientPendingPayments('patient-123'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(stripeService.getPendingPaymentsForPatient).toHaveBeenCalledWith(
        'clinic-123',
        'patient-123'
      );
      expect(result.current.payments).toHaveLength(1);
    });

    it('should return empty when patientId is null', async () => {
      const { result } = renderHook(() => usePatientPendingPayments(null));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(stripeService.getPendingPaymentsForPatient).not.toHaveBeenCalled();
      expect(result.current.payments).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(stripeService.getPendingPaymentsForPatient).mockRejectedValue(
        new Error('Failed to load')
      );

      const { result } = renderHook(() => usePatientPendingPayments('patient-123'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.payments).toEqual([]);
      consoleSpy.mockRestore();
    });
  });
});
