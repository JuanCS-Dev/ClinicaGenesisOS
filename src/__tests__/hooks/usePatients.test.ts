/**
 * Tests for usePatients Hook
 *
 * Tests real-time patient subscriptions and CRUD operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePatients } from '@/hooks/usePatients';
import { patientService } from '@/services/firestore';
import type { Patient, CreatePatientInput } from '@/types';

// Mock the ClinicContext
const mockClinicId = 'test-clinic-123';
vi.mock('@/contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({ clinicId: mockClinicId })),
}));

// Mock the patient service
vi.mock('@/services/firestore', () => ({
  patientService: {
    subscribe: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Import the mocked useClinicContext to control it
import { useClinicContext } from '@/contexts/ClinicContext';

/**
 * Create a mock patient for testing.
 */
function createMockPatient(overrides: Partial<Patient> = {}): Patient {
  return {
    id: 'patient-1',
    name: 'Test Patient',
    birthDate: '1990-05-15',
    age: 35,
    phone: '(11) 99999-1234',
    email: 'test@example.com',
    gender: 'Masculino',
    address: 'Test Address',
    insurance: 'Test Insurance',
    tags: ['tag1'],
    createdAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('usePatients', () => {
  let mockUnsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();

    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: mockClinicId,
    } as ReturnType<typeof useClinicContext>);

    vi.mocked(patientService.subscribe).mockReturnValue(mockUnsubscribe as () => void);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('returns empty patients initially', () => {
      const { result } = renderHook(() => usePatients());

      expect(result.current.patients).toEqual([]);
    });

    it('starts with loading true when clinicId exists', () => {
      const { result } = renderHook(() => usePatients());

      expect(result.current.loading).toBe(true);
    });

    it('starts with loading false when no clinicId', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => usePatients());

      expect(result.current.loading).toBe(false);
      expect(result.current.patients).toEqual([]);
    });

    it('starts with no error', () => {
      const { result } = renderHook(() => usePatients());

      expect(result.current.error).toBeNull();
    });
  });

  describe('subscriptions', () => {
    it('subscribes to patients when clinicId exists', () => {
      renderHook(() => usePatients());

      expect(patientService.subscribe).toHaveBeenCalledWith(
        mockClinicId,
        expect.any(Function)
      );
    });

    it('does not subscribe when no clinicId', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      renderHook(() => usePatients());

      expect(patientService.subscribe).not.toHaveBeenCalled();
    });

    it('unsubscribes on unmount', () => {
      const { unmount } = renderHook(() => usePatients());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('receives patients from subscription', async () => {
      const mockPatients = [
        createMockPatient({ id: 'patient-1', name: 'Patient 1' }),
        createMockPatient({ id: 'patient-2', name: 'Patient 2' }),
      ];

      vi.mocked(patientService.subscribe).mockImplementation((_, callback) => {
        setTimeout(() => callback(mockPatients), 0);
        return mockUnsubscribe as () => void;
      });

      const { result } = renderHook(() => usePatients());

      await waitFor(() => {
        expect(result.current.patients).toEqual(mockPatients);
      });

      expect(result.current.loading).toBe(false);
    });

    it('resubscribes when clinicId changes', async () => {
      const { rerender } = renderHook(() => usePatients());

      expect(patientService.subscribe).toHaveBeenCalledTimes(1);

      // Change clinicId
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: 'new-clinic-456',
      } as ReturnType<typeof useClinicContext>);

      rerender();

      await waitFor(() => {
        expect(patientService.subscribe).toHaveBeenCalledTimes(2);
      });

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('CRUD operations', () => {
    it('addPatient creates patient', async () => {
      vi.mocked(patientService.create).mockResolvedValue('new-patient-id');

      const { result } = renderHook(() => usePatients());

      const newPatient: CreatePatientInput = {
        name: 'New Patient',
        birthDate: '1995-03-20',
        phone: '(11) 98888-1234',
        email: 'newpatient@example.com',
        gender: 'Feminino',
        tags: [],
      };

      let patientId: string;
      await act(async () => {
        patientId = await result.current.addPatient(newPatient);
      });

      expect(patientService.create).toHaveBeenCalledWith(mockClinicId, newPatient);
      expect(patientId!).toBe('new-patient-id');
    });

    it('addPatient throws when no clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => usePatients());

      await expect(
        result.current.addPatient({} as CreatePatientInput)
      ).rejects.toThrow('No clinic selected');
    });

    it('updatePatient updates patient', async () => {
      vi.mocked(patientService.update).mockResolvedValue();

      const { result } = renderHook(() => usePatients());

      await act(async () => {
        await result.current.updatePatient('patient-1', { name: 'Updated Name' });
      });

      expect(patientService.update).toHaveBeenCalledWith(mockClinicId, 'patient-1', {
        name: 'Updated Name',
      });
    });

    it('updatePatient throws when no clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => usePatients());

      await expect(
        result.current.updatePatient('patient-1', {})
      ).rejects.toThrow('No clinic selected');
    });

    it('deletePatient deletes patient', async () => {
      vi.mocked(patientService.delete).mockResolvedValue();

      const { result } = renderHook(() => usePatients());

      await act(async () => {
        await result.current.deletePatient('patient-1');
      });

      expect(patientService.delete).toHaveBeenCalledWith(mockClinicId, 'patient-1');
    });

    it('deletePatient throws when no clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => usePatients());

      await expect(
        result.current.deletePatient('patient-1')
      ).rejects.toThrow('No clinic selected');
    });
  });

  describe('refresh', () => {
    it('refresh fetches all patients', async () => {
      const mockPatients = [createMockPatient()];
      vi.mocked(patientService.getAll).mockResolvedValue(mockPatients);

      const { result } = renderHook(() => usePatients());

      await act(async () => {
        await result.current.refresh();
      });

      expect(patientService.getAll).toHaveBeenCalledWith(mockClinicId);
    });

    it('refresh does nothing when no clinic', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => usePatients());

      await act(async () => {
        await result.current.refresh();
      });

      expect(patientService.getAll).not.toHaveBeenCalled();
    });
  });
});
