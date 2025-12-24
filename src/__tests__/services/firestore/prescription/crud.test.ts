/**
 * Prescription Service - CRUD Tests
 *
 * Tests for getAll, getByPatient, getById, getByValidationCode, create, update.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CreatePrescriptionInput } from '@/types';

// Mock Firebase
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
import { getDocs, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import {
  mockClinicId,
  mockPrescriptionId,
  mockPatientId,
  mockPrescription,
  mockMedication,
  mockProfessional,
} from './setup';

describe('prescriptionService - CRUD', () => {
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
});
