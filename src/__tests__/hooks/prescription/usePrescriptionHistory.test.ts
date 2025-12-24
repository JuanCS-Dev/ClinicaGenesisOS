/**
 * usePrescriptionHistory Hook Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

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

import { usePrescriptionHistory } from '@/hooks/usePrescription';
import { prescriptionService } from '@/services/firestore';
import { useClinicContext } from '@/contexts/ClinicContext';
import { mockPrescription, waitForLoaded } from './setup';

describe('usePrescriptionHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: 'clinic-123',
      userProfile: { id: 'user-123' },
    } as unknown as ReturnType<typeof useClinicContext>);

    vi.mocked(prescriptionService.subscribeByPatient).mockImplementation(
      (_clinicId, _patientId, callback) => {
        setTimeout(() => callback([mockPrescription]), 0);
        return vi.fn();
      }
    );
  });

  describe('initial state', () => {
    it('should start with loading true', () => {
      const { result } = renderHook(() => usePrescriptionHistory('patient-123'));
      expect(result.current.loading).toBe(true);
      expect(result.current.prescriptions).toEqual([]);
    });
  });

  describe('loading prescriptions', () => {
    it('should load patient prescriptions', async () => {
      const { result } = renderHook(() => usePrescriptionHistory('patient-123'));

      await waitForLoaded(result);

      expect(result.current.prescriptions).toHaveLength(1);
      expect(prescriptionService.subscribeByPatient).toHaveBeenCalledWith(
        'clinic-123',
        'patient-123',
        expect.any(Function)
      );
    });
  });

  describe('refresh', () => {
    it('should refresh prescriptions', async () => {
      vi.mocked(prescriptionService.getByPatient).mockResolvedValue([mockPrescription]);

      const { result } = renderHook(() => usePrescriptionHistory('patient-123'));

      await waitForLoaded(result);

      await act(async () => {
        await result.current.refresh();
      });

      expect(prescriptionService.getByPatient).toHaveBeenCalledWith(
        'clinic-123',
        'patient-123'
      );
    });
  });
});
