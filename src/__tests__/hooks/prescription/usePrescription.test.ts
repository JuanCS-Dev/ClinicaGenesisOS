/**
 * usePrescription Hook Tests - Main hook for digital prescription management.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
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

import { usePrescription } from '@/hooks/usePrescription';
import { prescriptionService } from '@/services/firestore';
import { useClinicContext } from '@/contexts/ClinicContext';
import { mockPrescription } from './setup';

describe('usePrescription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: 'clinic-123',
      userProfile: {
        id: 'user-123',
        displayName: 'Dr. João Silva',
        role: 'professional',
        crm: '123456',
        crmState: 'SP',
      },
    } as unknown as ReturnType<typeof useClinicContext>);

    vi.mocked(prescriptionService.subscribe).mockImplementation(
      (_clinicId, _prescriptionId, callback) => {
        setTimeout(() => callback(mockPrescription), 0);
        return vi.fn();
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state without prescriptionId', () => {
    it('should start with no prescription and not loading', async () => {
      const { result } = renderHook(() => usePrescription());

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.prescription).toBe(null);
      expect(result.current.error).toBe(null);
    });
  });

  describe('with prescriptionId', () => {
    it('should load prescription on mount', async () => {
      const { result } = renderHook(() => usePrescription('rx-123'));

      await waitFor(() => expect(result.current.prescription).not.toBe(null));
      expect(result.current.prescription?.id).toBe('rx-123');
    });

    it('should subscribe to updates', async () => {
      renderHook(() => usePrescription('rx-123'));

      await waitFor(() => {
        expect(prescriptionService.subscribe).toHaveBeenCalledWith(
          'clinic-123',
          'rx-123',
          expect.any(Function)
        );
      });
    });
  });

  describe('when clinic is not set', () => {
    it('should return null prescription', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => usePrescription('rx-123'));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.prescription).toBe(null);
    });
  });

  describe('createPrescription', () => {
    it('should create a new prescription', async () => {
      vi.mocked(prescriptionService.create).mockResolvedValue('new-rx-id');

      const { result } = renderHook(() => usePrescription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      let newId: string | undefined;
      await act(async () => {
        newId = await result.current.createPrescription({
          patientId: 'patient-123',
          patientName: 'Maria Santos',
          medications: mockPrescription.medications,
          diagnosis: 'Gripe comum',
          type: 'simple',
        });
      });

      expect(prescriptionService.create).toHaveBeenCalledWith(
        'clinic-123',
        expect.objectContaining({
          patientId: 'patient-123',
        }),
        expect.objectContaining({
          id: 'user-123',
          name: 'Dr. João Silva',
        })
      );
      expect(newId).toBe('new-rx-id');
    });

    it('should throw error when no clinic context', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => usePrescription());

      await expect(
        act(async () => {
          await result.current.createPrescription({
            patientId: 'patient-123',
            patientName: 'Maria Santos',
            medications: [],
            diagnosis: 'Test',
            type: 'simple',
          });
        })
      ).rejects.toThrow('No clinic or user context');
    });
  });

  describe('updatePrescription', () => {
    it('should update an existing prescription', async () => {
      vi.mocked(prescriptionService.update).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePrescription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.updatePrescription('rx-123', {
          diagnosis: 'Updated diagnosis',
        });
      });

      expect(prescriptionService.update).toHaveBeenCalledWith(
        'clinic-123',
        'rx-123',
        { diagnosis: 'Updated diagnosis' },
        'user-123',
        'Dr. João Silva'
      );
    });
  });

  describe('signPrescription', () => {
    it('should sign a prescription', async () => {
      vi.mocked(prescriptionService.sign).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePrescription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.signPrescription('rx-123');
      });

      expect(prescriptionService.sign).toHaveBeenCalledWith(
        'clinic-123',
        'rx-123',
        expect.objectContaining({
          signedBy: 'Dr. João Silva',
        }),
        'user-123',
        'Dr. João Silva'
      );
    });
  });

  describe('sendToPatient', () => {
    it('should send prescription via email', async () => {
      vi.mocked(prescriptionService.sendToPatient).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePrescription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.sendToPatient('rx-123', 'email');
      });

      expect(prescriptionService.sendToPatient).toHaveBeenCalledWith(
        'clinic-123',
        'rx-123',
        'email',
        'user-123',
        'Dr. João Silva'
      );
    });

    it('should send prescription via WhatsApp', async () => {
      vi.mocked(prescriptionService.sendToPatient).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePrescription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.sendToPatient('rx-123', 'whatsapp');
      });

      expect(prescriptionService.sendToPatient).toHaveBeenCalledWith(
        'clinic-123',
        'rx-123',
        'whatsapp',
        'user-123',
        'Dr. João Silva'
      );
    });
  });

  describe('cancelPrescription', () => {
    it('should cancel a prescription with reason', async () => {
      vi.mocked(prescriptionService.cancel).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePrescription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.cancelPrescription('rx-123', 'Patient requested cancellation');
      });

      expect(prescriptionService.cancel).toHaveBeenCalledWith(
        'clinic-123',
        'rx-123',
        'Patient requested cancellation',
        'user-123',
        'Dr. João Silva'
      );
    });
  });

  describe('getPrescription', () => {
    it('should get a prescription by ID', async () => {
      vi.mocked(prescriptionService.getById).mockResolvedValue(mockPrescription);

      const { result } = renderHook(() => usePrescription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      let prescription: Prescription | null = null;
      await act(async () => {
        prescription = await result.current.getPrescription('rx-123');
      });

      expect(prescriptionService.getById).toHaveBeenCalledWith('clinic-123', 'rx-123');
      expect(prescription?.id).toBe('rx-123');
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe on unmount', async () => {
      const unsubscribeMock = vi.fn();
      vi.mocked(prescriptionService.subscribe).mockImplementation(
        (_clinicId, _prescriptionId, callback) => {
          setTimeout(() => callback(mockPrescription), 0);
          return unsubscribeMock;
        }
      );

      const { unmount } = renderHook(() => usePrescription('rx-123'));

      await waitFor(() => {
        expect(prescriptionService.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
});
