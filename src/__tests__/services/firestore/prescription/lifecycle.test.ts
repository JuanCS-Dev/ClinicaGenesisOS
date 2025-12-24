/**
 * Prescription Service - Lifecycle Tests
 *
 * Tests for sign, sendToPatient, cancel.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

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
import { getDoc, updateDoc, addDoc } from 'firebase/firestore';
import { mockClinicId, mockPrescriptionId, mockPrescription } from './setup';

describe('prescriptionService - Lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock addDoc for logging
    vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);
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
});
