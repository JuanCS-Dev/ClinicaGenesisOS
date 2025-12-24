/**
 * usePatient Hook Tests - Single patient access with real-time updates.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePatient } from '../../hooks/usePatient';
import { patientService } from '../../services/firestore';
import type { Patient } from '../../types';

// Mock dependencies
vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
  })),
}));

vi.mock('../../services/firestore', () => ({
  patientService: {
    subscribeToOne: vi.fn(),
    update: vi.fn(),
    addTag: vi.fn(),
    removeTag: vi.fn(),
    delete: vi.fn(),
  },
}));

import { useClinicContext } from '../../contexts/ClinicContext';

const mockPatient: Patient = {
  id: 'patient-123',
  clinicId: 'clinic-123',
  name: 'Maria Santos',
  email: 'maria@email.com',
  phone: '11999999999',
  cpf: '12345678901',
  birthDate: '1990-01-15',
  gender: 'feminino',
  tags: ['vip', 'alergia'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/** Helper: Wait for hook to finish loading */
const waitForLoaded = async (result: { current: { loading: boolean } }) => {
  await waitFor(() => expect(result.current.loading).toBe(false));
};

describe('usePatient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: 'clinic-123',
    } as unknown as ReturnType<typeof useClinicContext>);

    vi.mocked(patientService.subscribeToOne).mockImplementation(
      (_clinicId, _patientId, callback) => {
        setTimeout(() => callback(mockPatient), 0);
        return vi.fn();
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with loading true when patientId provided', () => {
      const { result } = renderHook(() => usePatient('patient-123'));
      expect(result.current.loading).toBe(true);
      expect(result.current.patient).toBe(null);
    });

    it('should not load when patientId is undefined', () => {
      const { result } = renderHook(() => usePatient(undefined));
      expect(result.current.loading).toBe(false);
      expect(result.current.patient).toBe(null);
    });
  });

  describe('loading patient', () => {
    it('should load patient data', async () => {
      const { result } = renderHook(() => usePatient('patient-123'));

      await waitForLoaded(result);

      expect(result.current.patient?.id).toBe('patient-123');
      expect(result.current.patient?.name).toBe('Maria Santos');
    });

    it('should subscribe to updates', async () => {
      renderHook(() => usePatient('patient-123'));

      await waitFor(() => {
        expect(patientService.subscribeToOne).toHaveBeenCalledWith(
          'clinic-123',
          'patient-123',
          expect.any(Function)
        );
      });
    });
  });

  describe('when clinic is not set', () => {
    it('should return null patient', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => usePatient('patient-123'));

      expect(result.current.loading).toBe(false);
      expect(result.current.patient).toBe(null);
    });
  });

  describe('updatePatient', () => {
    it('should update patient data', async () => {
      vi.mocked(patientService.update).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePatient('patient-123'));

      await waitForLoaded(result);

      await act(async () => {
        await result.current.updatePatient({ name: 'Maria Silva' });
      });

      expect(patientService.update).toHaveBeenCalledWith(
        'clinic-123',
        'patient-123',
        { name: 'Maria Silva' }
      );
    });

    it('should throw error when no patient selected', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => usePatient('patient-123'));

      await expect(
        act(async () => {
          await result.current.updatePatient({ name: 'Test' });
        })
      ).rejects.toThrow('No patient selected');
    });
  });

  describe('addTag', () => {
    it('should add tag to patient', async () => {
      vi.mocked(patientService.addTag).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePatient('patient-123'));

      await waitForLoaded(result);

      await act(async () => {
        await result.current.addTag('urgente');
      });

      expect(patientService.addTag).toHaveBeenCalledWith(
        'clinic-123',
        'patient-123',
        'urgente'
      );
    });

    it('should throw error when no patient selected', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => usePatient(undefined));

      await expect(
        act(async () => {
          await result.current.addTag('test');
        })
      ).rejects.toThrow('No patient selected');
    });
  });

  describe('removeTag', () => {
    it('should remove tag from patient', async () => {
      vi.mocked(patientService.removeTag).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePatient('patient-123'));

      await waitForLoaded(result);

      await act(async () => {
        await result.current.removeTag('vip');
      });

      expect(patientService.removeTag).toHaveBeenCalledWith(
        'clinic-123',
        'patient-123',
        'vip'
      );
    });
  });

  describe('deletePatient', () => {
    it('should delete patient', async () => {
      vi.mocked(patientService.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePatient('patient-123'));

      await waitForLoaded(result);

      await act(async () => {
        await result.current.deletePatient();
      });

      expect(patientService.delete).toHaveBeenCalledWith(
        'clinic-123',
        'patient-123'
      );
    });

    it('should throw error when no patient selected', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => usePatient(undefined));

      await expect(
        act(async () => {
          await result.current.deletePatient();
        })
      ).rejects.toThrow('No patient selected');
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe on unmount', async () => {
      const unsubscribeMock = vi.fn();
      vi.mocked(patientService.subscribeToOne).mockImplementation(
        (_clinicId, _patientId, callback) => {
          setTimeout(() => callback(mockPatient), 0);
          return unsubscribeMock;
        }
      );

      const { unmount } = renderHook(() => usePatient('patient-123'));

      await waitFor(() => {
        expect(patientService.subscribeToOne).toHaveBeenCalled();
      });

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('should reset state when patientId changes', async () => {
      const { result, rerender } = renderHook(
        ({ patientId }) => usePatient(patientId),
        { initialProps: { patientId: 'patient-123' } }
      );

      await waitForLoaded(result);
      expect(result.current.patient?.id).toBe('patient-123');

      // Rerender with different patientId
      const newPatient = { ...mockPatient, id: 'patient-456', name: 'João Silva' };
      vi.mocked(patientService.subscribeToOne).mockImplementation(
        (_clinicId, _patientId, callback) => {
          setTimeout(() => callback(newPatient), 0);
          return vi.fn();
        }
      );

      rerender({ patientId: 'patient-456' });

      await waitFor(() => {
        expect(result.current.patient?.id).toBe('patient-456');
      });
    });
  });
});
