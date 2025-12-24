/**
 * Prescription Service - Subscriptions & Logging Tests
 *
 * Tests for subscribe, subscribeByPatient, addLog, getLogs, getStatistics.
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
import { getDocs, addDoc, onSnapshot } from 'firebase/firestore';
import { mockClinicId, mockPrescriptionId, mockPatientId, mockPrescription } from './setup';

describe('prescriptionService - Subscriptions & Logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      vi.mocked(onSnapshot).mockImplementation(((_ref: unknown, _onNext: unknown, onError: unknown) => {
        if (onError && typeof onError === 'function') {
          (onError as (err: Error) => void)(new Error('Test error'));
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
      vi.mocked(onSnapshot).mockImplementation(((_ref: unknown, _onNext: unknown, onError: unknown) => {
        if (onError && typeof onError === 'function') {
          (onError as (err: Error) => void)(new Error('Test error'));
        }
        return vi.fn();
      }) as unknown as typeof onSnapshot);

      prescriptionService.subscribeByPatient(mockClinicId, mockPatientId, callback);

      expect(callback).toHaveBeenCalledWith([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error subscribing to patient prescriptions:', expect.any(Error));
      consoleSpy.mockRestore();
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
