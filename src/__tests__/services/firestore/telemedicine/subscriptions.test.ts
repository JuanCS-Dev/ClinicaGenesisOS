/**
 * Telemedicine Service Subscriptions Tests
 *
 * Tests for subscribe, subscribeActive, getLogs, addLog.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase - all mocks must be self-contained (hoisted to top)
vi.mock('firebase/firestore', () => {
  class MockTimestamp {
    toDate() {
      return new Date();
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
    onSnapshot: vi.fn(),
    serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
    Timestamp: MockTimestamp,
  };
});

vi.mock('@/services/firebase', () => ({
  db: {},
}));

// Import after mocks
import { telemedicineService } from '@/services/firestore/telemedicine.service';
import { getDocs, addDoc, onSnapshot } from 'firebase/firestore';
import { mockClinicId, mockSessionId } from './setup';

describe('telemedicineService - Subscriptions & Logs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('subscribe', () => {
    it('sets up real-time listener for a session', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe);

      const unsubscribe = telemedicineService.subscribe(
        mockClinicId,
        mockSessionId,
        mockCallback
      );

      expect(onSnapshot).toHaveBeenCalled();
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('subscribeActive', () => {
    it('sets up real-time listener for active sessions', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe);

      const unsubscribe = telemedicineService.subscribeActive(mockClinicId, mockCallback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('getLogs', () => {
    it('returns all logs for a session', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          data: () => ({
            sessionId: mockSessionId,
            eventType: 'session_created',
            userId: 'doctor-001',
            timestamp: '2025-12-21T10:00:00Z',
          }),
        },
        {
          id: 'log-2',
          data: () => ({
            sessionId: mockSessionId,
            eventType: 'participant_joined',
            userId: 'patient-001',
            timestamp: '2025-12-21T10:01:00Z',
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockLogs,
      } as never);

      const logs = await telemedicineService.getLogs(mockClinicId, mockSessionId);

      expect(logs).toHaveLength(2);
      expect(logs[0].eventType).toBe('session_created');
      expect(logs[1].eventType).toBe('participant_joined');
    });
  });

  describe('addLog', () => {
    it('creates a log entry', async () => {
      vi.mocked(addDoc).mockResolvedValue({ id: 'new-log-id' } as never);

      const logId = await telemedicineService.addLog(mockClinicId, mockSessionId, {
        sessionId: mockSessionId,
        eventType: 'call_started',
        userId: 'doctor-001',
      });

      expect(logId).toBe('new-log-id');
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          sessionId: mockSessionId,
          eventType: 'call_started',
          userId: 'doctor-001',
        })
      );
    });
  });
});
