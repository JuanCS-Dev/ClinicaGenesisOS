/**
 * usePrescriptionStats Hook Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

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

import { usePrescriptionStats } from '@/hooks/usePrescription';
import { prescriptionService } from '@/services/firestore';
import { useClinicContext } from '@/contexts/ClinicContext';
import { mockStats, waitForLoaded } from './setup';

describe('usePrescriptionStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: 'clinic-123',
    } as unknown as ReturnType<typeof useClinicContext>);

    vi.mocked(prescriptionService.getStatistics).mockResolvedValue(mockStats);
  });

  describe('initial state', () => {
    it('should start with loading true', () => {
      const { result } = renderHook(() =>
        usePrescriptionStats('2025-01-01', '2025-12-31')
      );
      expect(result.current.loading).toBe(true);
      expect(result.current.stats).toBe(null);
    });
  });

  describe('loading stats', () => {
    it('should load statistics', async () => {
      const { result } = renderHook(() =>
        usePrescriptionStats('2025-01-01', '2025-12-31')
      );

      await waitForLoaded(result);

      expect(result.current.stats?.total).toBe(50);
      expect(result.current.stats?.controlled).toBe(10);
      expect(prescriptionService.getStatistics).toHaveBeenCalledWith(
        'clinic-123',
        '2025-01-01',
        '2025-12-31'
      );
    });
  });

  describe('refresh', () => {
    it('should refresh statistics', async () => {
      const { result } = renderHook(() =>
        usePrescriptionStats('2025-01-01', '2025-12-31')
      );

      await waitForLoaded(result);

      await act(async () => {
        await result.current.refresh();
      });

      expect(prescriptionService.getStatistics).toHaveBeenCalledTimes(2);
    });
  });

  describe('when clinic is not set', () => {
    it('should return null stats', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() =>
        usePrescriptionStats('2025-01-01', '2025-12-31')
      );

      await waitForLoaded(result);

      expect(result.current.stats).toBe(null);
    });
  });
});
