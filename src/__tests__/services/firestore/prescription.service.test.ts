/**
 * Prescription Service Tests
 *
 * Tests for the digital prescription Firestore service.
 * Uses mocked Firebase to test CRUD operations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Prescription, CreatePrescriptionInput, PrescriptionMedication } from '@/types';

// Mock Firebase - all mocks must be self-contained (hoisted to top)
vi.mock('firebase/firestore', () => {
  class MockTimestamp {
    toDate() {
      return new Date('2025-12-21T10:00:00Z');
    }
  }

  return {
    collection: vi.fn(() => 'mocked-collection'),
    doc: vi.fn(() => 'mocked-doc'),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    query: vi.fn(() => 'mocked-query'),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    onSnapshot: vi.fn(),
    serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
    Timestamp: MockTimestamp,
  };
});

vi.mock('@/services/firebase', () => ({
  db: {},
}));

// Import after mocks
import { prescriptionService } from '@/services/firestore/prescription.service';
import { getDocs, getDoc, addDoc, updateDoc, onSnapshot } from 'firebase/firestore';

describe('prescriptionService', () => {
  const mockClinicId = 'clinic-123';
  const mockPrescriptionId = 'prescription-456';
  const mockPatientId = 'patient-789';

  const mockMedication: PrescriptionMedication = {
    id: 'med-001',
    name: 'Dipirona 500mg',
    dosage: '1 comprimido',
    unit: 'comprimido',
    route: 'oral',
    frequency: '8 em 8 horas',
    duration: '5 dias',
    quantity: 15,
    isControlled: false,
    continuousUse: false,
  };

  const mockPrescription: Prescription = {
    id: mockPrescriptionId,
    clinicId: mockClinicId,
    patientId: mockPatientId,
    patientName: 'Maria Silva',
    patientCpf: '123.456.789-00',
    professionalId: 'doctor-001',
    professionalName: 'Dr. João Santos',
    professionalCrm: '12345',
    professionalCrmState: 'SP',
    type: 'common',
    status: 'draft',
    medications: [mockMedication],
    validityDays: 60,
    prescribedAt: '2025-12-21T10:00:00Z',
    expiresAt: '2025-02-19T10:00:00Z',
    validationCode: 'ABC12345',
    createdAt: '2025-12-21T10:00:00Z',
    updatedAt: '2025-12-21T10:00:00Z',
  };

  const mockProfessional = {
    id: 'doctor-001',
    name: 'Dr. João Santos',
    crm: '12345',
    crmState: 'SP',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns all prescriptions for a clinic', async () => {
      const mockDocs = [
        { id: 'prescription-1', data: () => ({ ...mockPrescription, id: undefined }) },
        { id: 'prescription-2', data: () => ({ ...mockPrescription, id: undefined }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as never);

      const prescriptions = await prescriptionService.getAll(mockClinicId);

      expect(prescriptions).toHaveLength(2);
      expect(prescriptions[0].id).toBe('prescription-1');
      expect(prescriptions[1].id).toBe('prescription-2');
    });

    it('filters prescriptions by patient ID', async () => {
      const mockDocs = [
        { id: 'prescription-1', data: () => ({ ...mockPrescription, id: undefined }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as never);

      const prescriptions = await prescriptionService.getAll(mockClinicId, {
        patientId: mockPatientId,
      });

      expect(prescriptions).toHaveLength(1);
      expect(prescriptions[0].patientId).toBe(mockPatientId);
    });

    it('filters prescriptions by status', async () => {
      const mockDocs = [
        { id: 'prescription-1', data: () => ({ ...mockPrescription, status: 'signed', id: undefined }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as never);

      const prescriptions = await prescriptionService.getAll(mockClinicId, {
        status: 'signed',
      });

      expect(prescriptions).toHaveLength(1);
    });

    it('filters prescriptions by professional ID', async () => {
      const mockDocs = [
        { id: 'prescription-1', data: () => ({ ...mockPrescription, id: undefined }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as never);

      const prescriptions = await prescriptionService.getAll(mockClinicId, {
        professionalId: 'doctor-001',
      });

      expect(prescriptions).toHaveLength(1);
    });

    it('limits number of prescriptions returned', async () => {
      const mockDocs = [
        { id: 'prescription-1', data: () => ({ ...mockPrescription, id: undefined }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as never);

      const prescriptions = await prescriptionService.getAll(mockClinicId, {
        limitCount: 10,
      });

      expect(prescriptions).toHaveLength(1);
    });
  });

  describe('getByPatient', () => {
    it('returns prescriptions for a specific patient', async () => {
      const mockDocs = [
        { id: 'prescription-1', data: () => ({ ...mockPrescription, id: undefined }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as never);

      const prescriptions = await prescriptionService.getByPatient(mockClinicId, mockPatientId);

      expect(prescriptions).toHaveLength(1);
      expect(prescriptions[0].patientId).toBe(mockPatientId);
    });
  });

  describe('getById', () => {
    it('returns prescription when found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockPrescriptionId,
        data: () => ({ ...mockPrescription, id: undefined }),
      } as never);

      const prescription = await prescriptionService.getById(mockClinicId, mockPrescriptionId);

      expect(prescription).not.toBeNull();
      expect(prescription?.id).toBe(mockPrescriptionId);
      expect(prescription?.patientName).toBe('Maria Silva');
    });

    it('returns null when prescription not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as never);

      const prescription = await prescriptionService.getById(mockClinicId, 'non-existent');

      expect(prescription).toBeNull();
    });
  });

  describe('getByValidationCode', () => {
    it('returns prescription when code matches', async () => {
      const mockDocs = [
        { id: mockPrescriptionId, data: () => ({ ...mockPrescription, id: undefined }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
        empty: false,
      } as never);

      const prescription = await prescriptionService.getByValidationCode(mockClinicId, 'ABC12345');

      expect(prescription).not.toBeNull();
      expect(prescription?.validationCode).toBe('ABC12345');
    });

    it('returns null when code not found', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
        empty: true,
      } as never);

      const prescription = await prescriptionService.getByValidationCode(mockClinicId, 'INVALID');

      expect(prescription).toBeNull();
    });
  });

  describe('create', () => {
    it('creates a new prescription with auto-generated fields', async () => {
      const input: CreatePrescriptionInput = {
        patientId: mockPatientId,
        patientName: 'Maria Silva',
        patientCpf: '123.456.789-00',
        type: 'common',
        medications: [mockMedication],
        validityDays: 60,
      };

      vi.mocked(addDoc).mockResolvedValue({ id: 'new-prescription-id' } as never);

      const prescriptionId = await prescriptionService.create(mockClinicId, input, mockProfessional);

      expect(prescriptionId).toBe('new-prescription-id');
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          patientId: mockPatientId,
          patientName: 'Maria Silva',
          professionalId: 'doctor-001',
          professionalName: 'Dr. João Santos',
          professionalCrm: '12345',
          professionalCrmState: 'SP',
          status: 'draft',
          medications: [mockMedication],
        })
      );
    });

    it('generates a unique validation code', async () => {
      const input: CreatePrescriptionInput = {
        patientId: mockPatientId,
        patientName: 'Maria Silva',
        type: 'common',
        medications: [mockMedication],
        validityDays: 60,
      };

      vi.mocked(addDoc).mockResolvedValue({ id: 'new-prescription-id' } as never);

      await prescriptionService.create(mockClinicId, input, mockProfessional);

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          validationCode: expect.stringMatching(/^[A-Z0-9]{8}$/),
        })
      );
    });

    it('logs creation event', async () => {
      const input: CreatePrescriptionInput = {
        patientId: mockPatientId,
        patientName: 'Maria Silva',
        type: 'common',
        medications: [mockMedication],
        validityDays: 60,
      };

      vi.mocked(addDoc).mockResolvedValue({ id: 'new-prescription-id' } as never);

      await prescriptionService.create(mockClinicId, input, mockProfessional);

      // addDoc should be called twice: once for prescription, once for log
      expect(addDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('update', () => {
    it('updates a draft prescription', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockPrescriptionId,
        data: () => ({ ...mockPrescription, status: 'draft', id: undefined }),
      } as never);

      await prescriptionService.update(
        mockClinicId,
        mockPrescriptionId,
        { observations: 'New observation' },
        'user-001',
        'User Name'
      );

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          observations: 'New observation',
        })
      );
    });

    it('throws error when prescription is not a draft', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockPrescriptionId,
        data: () => ({ ...mockPrescription, status: 'signed', id: undefined }),
      } as never);

      await expect(
        prescriptionService.update(
          mockClinicId,
          mockPrescriptionId,
          { observations: 'New observation' },
          'user-001',
          'User Name'
        )
      ).rejects.toThrow('Only draft prescriptions can be updated');
    });

    it('throws error when prescription not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as never);

      await expect(
        prescriptionService.update(
          mockClinicId,
          'non-existent',
          { observations: 'New observation' },
          'user-001',
          'User Name'
        )
      ).rejects.toThrow('Prescription not found');
    });
  });

  describe('updateStatus', () => {
    it('updates status and adds timestamp for sent', async () => {
      await prescriptionService.updateStatus(
        mockClinicId,
        mockPrescriptionId,
        'sent',
        'user-001',
        'User Name'
      );

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'sent',
          sentAt: expect.any(String),
        })
      );
    });

    it('updates status and adds timestamp for viewed', async () => {
      await prescriptionService.updateStatus(
        mockClinicId,
        mockPrescriptionId,
        'viewed',
        'user-001',
        'User Name'
      );

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'viewed',
          viewedAt: expect.any(String),
        })
      );
    });

    it('updates status and adds timestamp for filled', async () => {
      await prescriptionService.updateStatus(
        mockClinicId,
        mockPrescriptionId,
        'filled',
        'user-001',
        'User Name'
      );

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'filled',
          filledAt: expect.any(String),
        })
      );
    });

    it('logs status change event', async () => {
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      await prescriptionService.updateStatus(
        mockClinicId,
        mockPrescriptionId,
        'signed',
        'user-001',
        'User Name'
      );

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          prescriptionId: mockPrescriptionId,
          eventType: 'signed',
          userId: 'user-001',
          userName: 'User Name',
        })
      );
    });
  });

  describe('sign', () => {
    it('signs a draft prescription', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockPrescriptionId,
        data: () => ({ ...mockPrescription, status: 'draft', id: undefined }),
      } as never);

      const signature = {
        signedBy: 'Dr. João Santos',
        signedAt: '2025-12-21T11:00:00Z',
        certificateSerial: 'CERT-123',
        signatureHash: 'HASH-456',
      };

      await prescriptionService.sign(
        mockClinicId,
        mockPrescriptionId,
        signature,
        'doctor-001',
        'Dr. João Santos'
      );

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'signed',
          signature,
        })
      );
    });

    it('throws error when prescription cannot be signed', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockPrescriptionId,
        data: () => ({ ...mockPrescription, status: 'sent', id: undefined }),
      } as never);

      await expect(
        prescriptionService.sign(
          mockClinicId,
          mockPrescriptionId,
          {
            signedBy: 'Dr. João',
            signedAt: '2025-12-21T11:00:00Z',
            certificateSerial: 'CERT-123',
            signatureHash: 'HASH-456',
          },
          'doctor-001',
          'Dr. João'
        )
      ).rejects.toThrow('Prescription cannot be signed in current status');
    });
  });

  describe('sendToPatient', () => {
    it('sends a signed prescription', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockPrescriptionId,
        data: () => ({ ...mockPrescription, status: 'signed', id: undefined }),
      } as never);

      await prescriptionService.sendToPatient(
        mockClinicId,
        mockPrescriptionId,
        'whatsapp',
        'user-001',
        'User Name'
      );

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'sent',
        })
      );
    });

    it('throws error when prescription is not signed', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockPrescriptionId,
        data: () => ({ ...mockPrescription, status: 'draft', id: undefined }),
      } as never);

      await expect(
        prescriptionService.sendToPatient(
          mockClinicId,
          mockPrescriptionId,
          'email',
          'user-001',
          'User Name'
        )
      ).rejects.toThrow('Only signed prescriptions can be sent');
    });
  });

  describe('cancel', () => {
    it('cancels a draft prescription', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockPrescriptionId,
        data: () => ({ ...mockPrescription, status: 'draft', id: undefined }),
      } as never);

      await prescriptionService.cancel(
        mockClinicId,
        mockPrescriptionId,
        'Patient requested cancellation',
        'user-001',
        'User Name'
      );

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'canceled',
        })
      );
    });

    it('throws error when prescription is already filled', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockPrescriptionId,
        data: () => ({ ...mockPrescription, status: 'filled', id: undefined }),
      } as never);

      await expect(
        prescriptionService.cancel(
          mockClinicId,
          mockPrescriptionId,
          'Reason',
          'user-001',
          'User Name'
        )
      ).rejects.toThrow('Filled prescriptions cannot be canceled');
    });
  });

  describe('markAsViewed', () => {
    it('marks a sent prescription as viewed', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockPrescriptionId,
        data: () => ({ ...mockPrescription, status: 'sent', id: undefined }),
      } as never);

      await prescriptionService.markAsViewed(mockClinicId, mockPrescriptionId);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'viewed',
        })
      );
    });

    it('does not update if prescription is not sent', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockPrescriptionId,
        data: () => ({ ...mockPrescription, status: 'draft', id: undefined }),
      } as never);

      await prescriptionService.markAsViewed(mockClinicId, mockPrescriptionId);

      expect(updateDoc).not.toHaveBeenCalled();
    });
  });

  describe('markAsFilled', () => {
    it('marks a sent prescription as filled', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockPrescriptionId,
        data: () => ({ ...mockPrescription, status: 'sent', id: undefined }),
      } as never);

      await prescriptionService.markAsFilled(mockClinicId, mockPrescriptionId, 'Farmácia Popular');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'filled',
          filledByPharmacy: 'Farmácia Popular',
        })
      );
    });

    it('throws error when prescription status is invalid', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockPrescriptionId,
        data: () => ({ ...mockPrescription, status: 'draft', id: undefined }),
      } as never);

      await expect(
        prescriptionService.markAsFilled(mockClinicId, mockPrescriptionId, 'Farmácia')
      ).rejects.toThrow('Prescription cannot be marked as filled in current status');
    });
  });

  describe('addLog', () => {
    it('adds an audit log entry', async () => {
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      const logId = await prescriptionService.addLog(mockClinicId, mockPrescriptionId, {
        prescriptionId: mockPrescriptionId,
        eventType: 'created',
        userId: 'user-001',
        userName: 'User Name',
      });

      expect(logId).toBe('log-id');
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          prescriptionId: mockPrescriptionId,
          eventType: 'created',
          userId: 'user-001',
          userName: 'User Name',
        })
      );
    });
  });

  describe('getLogs', () => {
    it('returns all logs for a prescription', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          data: () => ({
            prescriptionId: mockPrescriptionId,
            eventType: 'created',
            userId: 'user-001',
            userName: 'User Name',
            timestamp: new Date(),
          }),
        },
        {
          id: 'log-2',
          data: () => ({
            prescriptionId: mockPrescriptionId,
            eventType: 'signed',
            userId: 'user-001',
            userName: 'User Name',
            timestamp: new Date(),
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockLogs,
      } as never);

      const logs = await prescriptionService.getLogs(mockClinicId, mockPrescriptionId);

      expect(logs).toHaveLength(2);
      expect(logs[0].eventType).toBe('created');
      expect(logs[1].eventType).toBe('signed');
    });
  });

  describe('subscribe', () => {
    it('sets up real-time subscription', () => {
      const callback = vi.fn();
      vi.mocked(onSnapshot).mockImplementation((_, onNext) => {
        (onNext as (snapshot: { exists: () => boolean; id: string; data: () => unknown }) => void)({
          exists: () => true,
          id: mockPrescriptionId,
          data: () => ({ ...mockPrescription, id: undefined }),
        });
        return vi.fn();
      });

      const unsubscribe = prescriptionService.subscribe(
        mockClinicId,
        mockPrescriptionId,
        callback
      );

      expect(onSnapshot).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ id: mockPrescriptionId }));
      expect(typeof unsubscribe).toBe('function');
    });

    it('calls callback with null when document does not exist', () => {
      const callback = vi.fn();
      vi.mocked(onSnapshot).mockImplementation((_, onNext) => {
        (onNext as (snapshot: { exists: () => boolean }) => void)({
          exists: () => false,
        });
        return vi.fn();
      });

      prescriptionService.subscribe(mockClinicId, mockPrescriptionId, callback);

      expect(callback).toHaveBeenCalledWith(null);
    });

    it('calls callback with null on error', () => {
      const callback = vi.fn();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(onSnapshot).mockImplementation(((_ref: any, _onNext: any, onError: any) => {
        if (onError && typeof onError === 'function') {
          onError(new Error('Test error'));
        }
        return vi.fn();
      }) as unknown as typeof onSnapshot);

      prescriptionService.subscribe(mockClinicId, mockPrescriptionId, callback);

      expect(callback).toHaveBeenCalledWith(null);
      expect(consoleSpy).toHaveBeenCalledWith('Error subscribing to prescription:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('subscribeByPatient', () => {
    it('sets up real-time subscription for patient prescriptions', () => {
      const callback = vi.fn();
      vi.mocked(onSnapshot).mockImplementation((_, onNext) => {
        (onNext as (snapshot: { docs: Array<{ id: string; data: () => unknown }> }) => void)({
          docs: [
            { id: 'prescription-1', data: () => ({ ...mockPrescription, id: undefined }) },
          ],
        });
        return vi.fn();
      });

      const unsubscribe = prescriptionService.subscribeByPatient(
        mockClinicId,
        mockPatientId,
        callback
      );

      expect(onSnapshot).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: 'prescription-1' }),
      ]));
      expect(typeof unsubscribe).toBe('function');
    });

    it('calls callback with empty array on error', () => {
      const callback = vi.fn();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(onSnapshot).mockImplementation(((_ref: any, _onNext: any, onError: any) => {
        if (onError && typeof onError === 'function') {
          onError(new Error('Test error'));
        }
        return vi.fn();
      }) as unknown as typeof onSnapshot);

      prescriptionService.subscribeByPatient(mockClinicId, mockPatientId, callback);

      expect(callback).toHaveBeenCalledWith([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error subscribing to patient prescriptions:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('checkExpiredPrescriptions', () => {
    it('marks expired prescriptions as expired', async () => {
      const mockDocs = [
        { id: 'expired-1', data: () => ({ ...mockPrescription, status: 'signed', id: undefined }) },
        { id: 'expired-2', data: () => ({ ...mockPrescription, status: 'sent', id: undefined }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as never);

      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      const count = await prescriptionService.checkExpiredPrescriptions(mockClinicId);

      expect(count).toBe(2);
      expect(updateDoc).toHaveBeenCalledTimes(2);
      expect(addDoc).toHaveBeenCalledTimes(2);
    });

    it('returns zero when no expired prescriptions', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as never);

      const count = await prescriptionService.checkExpiredPrescriptions(mockClinicId);

      expect(count).toBe(0);
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });

  describe('getStatistics', () => {
    it('returns prescription statistics for a period', async () => {
      const mockDocs = [
        { id: 'p1', data: () => ({ ...mockPrescription, status: 'signed', type: 'common', id: undefined }) },
        { id: 'p2', data: () => ({ ...mockPrescription, status: 'filled', type: 'common', id: undefined }) },
        { id: 'p3', data: () => ({ ...mockPrescription, status: 'signed', type: 'blue', id: undefined }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as never);

      const stats = await prescriptionService.getStatistics(
        mockClinicId,
        '2025-01-01',
        '2025-12-31'
      );

      expect(stats.total).toBe(3);
      expect(stats.byStatus.signed).toBe(2);
      expect(stats.byStatus.filled).toBe(1);
      expect(stats.byType.common).toBe(2);
      expect(stats.byType.blue).toBe(1);
      expect(stats.controlled).toBe(1); // blue is controlled
    });
  });
});
