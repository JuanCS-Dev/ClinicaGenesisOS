/**
 * Telemedicine Service Session Tests
 *
 * Tests for session lifecycle: updateStatus, addParticipant, removeParticipant,
 * endSession, addNotes, reportTechnicalIssue.
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
import { getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { mockClinicId, mockSessionId, mockSession } from './setup';

describe('telemedicineService - Session Lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateStatus', () => {
    it('updates session status', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await telemedicineService.updateStatus(mockClinicId, mockSessionId, 'in_progress');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'in_progress',
        })
      );
    });

    it('sets startedAt when status changes to in_progress', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await telemedicineService.updateStatus(mockClinicId, mockSessionId, 'in_progress');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'in_progress',
          startedAt: expect.any(String),
        })
      );
    });

    it('sets endedAt when status changes to completed', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await telemedicineService.updateStatus(mockClinicId, mockSessionId, 'completed');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'completed',
          endedAt: expect.any(String),
        })
      );
    });
  });

  describe('addParticipant', () => {
    it('adds new participant to session', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockSessionId,
        data: () => ({
          ...mockSession,
          participants: [],
        }),
      } as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      await telemedicineService.addParticipant(mockClinicId, mockSessionId, {
        id: 'patient-001',
        displayName: 'Maria Silva',
        role: 'patient',
      });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({
              id: 'patient-001',
              displayName: 'Maria Silva',
              role: 'patient',
              joinedAt: expect.any(String),
            }),
          ]),
        })
      );
    });

    it('throws error when session not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as never);

      await expect(
        telemedicineService.addParticipant(mockClinicId, 'non-existent', {
          id: 'patient-001',
          displayName: 'Maria',
          role: 'patient',
        })
      ).rejects.toThrow('Session not found');
    });

    it('updates existing participant when rejoining', async () => {
      const previousJoinedAt = '2025-12-21T10:00:00Z';
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockSessionId,
        data: () => ({
          ...mockSession,
          participants: [
            {
              id: 'patient-001',
              displayName: 'Maria Silva',
              role: 'patient',
              joinedAt: previousJoinedAt,
              leftAt: '2025-12-21T10:05:00Z',
            },
          ],
        }),
      } as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      await telemedicineService.addParticipant(mockClinicId, mockSessionId, {
        id: 'patient-001',
        displayName: 'Maria Silva',
        role: 'patient',
      });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({
              id: 'patient-001',
              leftAt: undefined,
            }),
          ]),
        })
      );
    });
  });

  describe('removeParticipant', () => {
    it('marks participant as left', async () => {
      const joinedAt = new Date().toISOString();
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockSessionId,
        data: () => ({
          ...mockSession,
          participants: [
            { id: 'doctor-001', displayName: 'Dr. João', role: 'professional', joinedAt },
            { id: 'patient-001', displayName: 'Maria', role: 'patient', joinedAt },
          ],
        }),
      } as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      await telemedicineService.removeParticipant(mockClinicId, mockSessionId, 'patient-001');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({ id: 'patient-001', leftAt: expect.any(String) }),
          ]),
        })
      );
    });

    it('throws error when session not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as never);

      await expect(
        telemedicineService.removeParticipant(mockClinicId, 'non-existent', 'patient-001')
      ).rejects.toThrow('Session not found');
    });
  });

  describe('endSession', () => {
    it('calculates duration and updates status', async () => {
      const startedAt = new Date(Date.now() - 30 * 60 * 1000).toISOString();

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockSessionId,
        data: () => ({
          ...mockSession,
          status: 'in_progress',
          startedAt,
          participants: [
            { id: 'doctor-001', displayName: 'Dr. João', role: 'professional' },
            { id: 'patient-001', displayName: 'Maria', role: 'patient' },
          ],
        }),
      } as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      await telemedicineService.endSession(mockClinicId, mockSessionId, 'doctor-001');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'completed',
          endedAt: expect.any(String),
          durationSeconds: expect.any(Number),
        })
      );
    });

    it('marks all participants as left', async () => {
      const startedAt = new Date(Date.now() - 10 * 60 * 1000).toISOString();

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockSessionId,
        data: () => ({
          ...mockSession,
          startedAt,
          participants: [
            { id: 'doctor-001', displayName: 'Dr. João', role: 'professional', joinedAt: startedAt },
            { id: 'patient-001', displayName: 'Maria', role: 'patient', joinedAt: startedAt },
          ],
        }),
      } as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      await telemedicineService.endSession(mockClinicId, mockSessionId, 'doctor-001');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({ leftAt: expect.any(String) }),
            expect.objectContaining({ leftAt: expect.any(String) }),
          ]),
        })
      );
    });

    it('throws error when session not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as never);

      await expect(
        telemedicineService.endSession(mockClinicId, 'non-existent', 'doctor-001')
      ).rejects.toThrow('Session not found');
    });
  });

  describe('addNotes', () => {
    it('updates session with notes', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await telemedicineService.addNotes(mockClinicId, mockSessionId, 'Paciente relatou melhora');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          notes: 'Paciente relatou melhora',
        })
      );
    });
  });

  describe('reportTechnicalIssue', () => {
    it('adds technical issue to session', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockSessionId,
        data: () => ({
          ...mockSession,
          technicalIssues: ['Issue anterior'],
        }),
      } as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      await telemedicineService.reportTechnicalIssue(
        mockClinicId,
        mockSessionId,
        'Áudio falhou',
        'doctor-001'
      );

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          technicalIssues: ['Issue anterior', 'Áudio falhou'],
        })
      );
    });

    it('creates new technical issues array if none exists', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockSessionId,
        data: () => ({
          ...mockSession,
          technicalIssues: undefined,
        }),
      } as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      await telemedicineService.reportTechnicalIssue(
        mockClinicId,
        mockSessionId,
        'Vídeo travou',
        'patient-001'
      );

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          technicalIssues: ['Vídeo travou'],
        })
      );
    });

    it('throws error when session not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as never);

      await expect(
        telemedicineService.reportTechnicalIssue(mockClinicId, 'non-existent', 'Issue', 'user-001')
      ).rejects.toThrow('Session not found');
    });
  });
});
