/**
 * usePrescriptionValidation Hook Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { Prescription } from '@/types';

// Mocks must be at top level before imports
vi.mock('@/contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(),
}));

vi.mock('@/services/firestore', () => ({
  prescriptionService: {
    subscribe: vi.fn(),
    subscribeByPatient: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    sign: vi.fn(),
    sendToPatient: vi.fn(),
    cancel: vi.fn(),
    getById: vi.fn(),
    getByPatient: vi.fn(),
    getByValidationCode: vi.fn(),
    markAsFilled: vi.fn(),
    getStatistics: vi.fn(),
  },
}));

import { usePrescriptionValidation } from '@/hooks/usePrescription';
import { prescriptionService } from '@/services/firestore';
import { useClinicContext } from '@/contexts/ClinicContext';
import { mockPrescription } from './setup';

describe('usePrescriptionValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: 'clinic-123',
    } as unknown as ReturnType<typeof useClinicContext>);
  });

  describe('initial state', () => {
    it('should start with null prescription', () => {
      const { result } = renderHook(() => usePrescriptionValidation());
      expect(result.current.prescription).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('validateCode', () => {
    it('should validate a prescription code', async () => {
      vi.mocked(prescriptionService.getByValidationCode).mockResolvedValue(mockPrescription);

      const { result } = renderHook(() => usePrescriptionValidation());

      let found: Prescription | null = null;
      await act(async () => {
        found = await result.current.validateCode('ABC123XY');
      });

      expect(prescriptionService.getByValidationCode).toHaveBeenCalledWith(
        'clinic-123',
        'ABC123XY'
      );
      expect(found?.id).toBe('rx-123');
      expect(result.current.prescription?.id).toBe('rx-123');
    });

    it('should handle invalid code', async () => {
      vi.mocked(prescriptionService.getByValidationCode).mockRejectedValue(
        new Error('Prescription not found')
      );

      const { result } = renderHook(() => usePrescriptionValidation());

      await act(async () => {
        try {
          await result.current.validateCode('INVALID');
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error?.message).toBe('Prescription not found');
      });
      expect(result.current.prescription).toBe(null);
    });
  });

  describe('markAsFilled', () => {
    it('should mark prescription as filled', async () => {
      vi.mocked(prescriptionService.getByValidationCode).mockResolvedValue(mockPrescription);
      vi.mocked(prescriptionService.markAsFilled).mockResolvedValue(undefined);
      vi.mocked(prescriptionService.getById).mockResolvedValue({
        ...mockPrescription,
        status: 'filled',
      });

      const { result } = renderHook(() => usePrescriptionValidation());

      // First validate
      await act(async () => {
        await result.current.validateCode('ABC123XY');
      });

      // Then mark as filled
      await act(async () => {
        await result.current.markAsFilled('Farmácia Popular');
      });

      expect(prescriptionService.markAsFilled).toHaveBeenCalledWith(
        'clinic-123',
        'rx-123',
        'Farmácia Popular'
      );
    });

    it('should throw error when no prescription to mark', async () => {
      const { result } = renderHook(() => usePrescriptionValidation());

      await expect(
        act(async () => {
          await result.current.markAsFilled('Farmácia Popular');
        })
      ).rejects.toThrow('No prescription to mark as filled');
    });
  });
});
