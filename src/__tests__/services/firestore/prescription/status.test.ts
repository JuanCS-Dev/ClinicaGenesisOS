/**
 * Prescription Service - Status Tests
 *
 * Tests for updateStatus, markAsViewed, markAsFilled, checkExpiredPrescriptions.
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
import { getDocs, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { mockClinicId, mockPrescriptionId, mockPrescription } from './setup';

describe('prescriptionService - Status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock addDoc for logging
    vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);
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
});
